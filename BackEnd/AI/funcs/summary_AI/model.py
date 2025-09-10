import torch
from torch import nn
from transformers import AutoTokenizer
from transformers.models.bart.modeling_bart import BartLearnedPositionalEmbedding
from transformers.models.bart.modeling_bart import BartForConditionalGeneration
from typing import Optional, Tuple, List
from transformers.models.longformer.modeling_longformer import LongformerSelfAttention
from transformers.models.bart.configuration_bart import BartConfig

# Longformer Self Attention for BART
class LongformerSelfAttentionForBart(nn.Module):
    def __init__(self, config, layer_id):
        super().__init__()
        self.embed_dim = config.d_model
        self.longformer_self_attn = LongformerSelfAttention(config, layer_id=layer_id)
        self.output = nn.Linear(self.embed_dim, self.embed_dim)

    def forward(
        self,
        hidden_states: torch.Tensor,
        key_value_states: Optional[torch.Tensor] = None,
        past_key_value: Optional[Tuple[torch.Tensor]] = None,
        attention_mask: Optional[torch.Tensor] = None,
        layer_head_mask: Optional[torch.Tensor] = None,
        output_attentions: bool = False,
    ) -> Tuple[torch.Tensor, Optional[torch.Tensor], Optional[Tuple[torch.Tensor]]]:
        is_cross_attention = key_value_states is not None
        bsz, tgt_len, embed_dim = hidden_states.size()
        attention_mask = attention_mask.squeeze(dim=1)
        attention_mask = attention_mask[:, 0]
        is_index_masked = attention_mask < 0
        is_index_global_attn = attention_mask > 0
        is_global_attn = is_index_global_attn.flatten().any().item()
        outputs = self.longformer_self_attn(
            hidden_states,
            attention_mask=attention_mask,
            layer_head_mask=None,
            is_index_masked=is_index_masked,
            is_index_global_attn=is_index_global_attn,
            is_global_attn=is_global_attn,
            output_attentions=output_attentions,
        )
        attn_output = self.output(outputs[0])
        return (attn_output,) + outputs[1:] if len(outputs) == 2 else (attn_output, None, None)


class LongformerEncoderDecoderForConditionalGeneration(BartForConditionalGeneration):
    def __init__(self, config):
        super().__init__(config)
        self.model.encoder.embed_positions = BartLearnedPositionalEmbedding(
            config.max_encoder_position_embeddings,
            config.d_model,
        )
        self.model.decoder.embed_positions = BartLearnedPositionalEmbedding(
            config.max_decoder_position_embeddings,
            config.d_model,
        )
        for i, layer in enumerate(self.model.encoder.layers):
            layer.self_attn = LongformerSelfAttentionForBart(config, layer_id=i)


# Tokenizer 및 모델 로드
class SummaryModel:
    def __init__(self, weight_path: str):
        self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
        self.tokenizer = AutoTokenizer.from_pretrained("cocoirun/longforemr-kobart-summary-v1")
        self.model = LongformerEncoderDecoderForConditionalGeneration.from_pretrained(
            "cocoirun/longforemr-kobart-summary-v1"
        )
        self.model.load_state_dict(torch.load(weight_path, map_location=self.device))
        self.model.to(self.device)

    def summarize(self, text: str, max_len: int = 128) -> str:
        max_seq_len = 4096
        context_tokens = ["<s>"] + self.tokenizer.tokenize(text) + ["</s>"]
        input_ids = self.tokenizer.convert_tokens_to_ids(context_tokens)

        if len(input_ids) < max_seq_len:
            input_ids += [self.tokenizer.pad_token_id] * (max_seq_len - len(input_ids))
        else:
            input_ids = input_ids[: max_seq_len - 1] + [self.tokenizer.eos_token_id]

        res_ids = self.model.generate(
            torch.tensor([input_ids]).to(self.device),
            max_length=max_len,
            num_beams=5,
            no_repeat_ngram_size=3,
            eos_token_id=self.tokenizer.eos_token_id,
            bad_words_ids=[[self.tokenizer.unk_token_id]],
        )
        return self.tokenizer.batch_decode(res_ids.tolist(), skip_special_tokens=True)[0]
