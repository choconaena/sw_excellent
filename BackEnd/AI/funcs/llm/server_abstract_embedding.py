from flask import Flask, request, jsonify
from sentence_transformers import SentenceTransformer

app = Flask(__name__)

# (1) 모델 로딩 (한 번만 수행)
model = SentenceTransformer("upskyy/bge-m3-korean")

@app.route('/embed', methods=['POST'])
def embed_text():
    data = request.get_json()
    summary_text = data.get("summary", "")
    if not summary_text:
        return jsonify({"error": "No summary text provided"}), 400

    # (2) 임베딩 처리
    embedding_vector = model.encode(summary_text).tolist()

    return jsonify({
        "embedding": embedding_vector,
        "summary": summary_text
    })

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
