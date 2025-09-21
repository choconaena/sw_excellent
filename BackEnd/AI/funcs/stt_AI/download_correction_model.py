# download_correction_model.py
from huggingface_hub import snapshot_download

if __name__ == "__main__":
    repo_id = "Soyoung97/gec_kr"
    local_dir = "/new_data/sw_excellent/BackEnd/AI/funcs/stt_AI/model/gec_kr"
    print(f"Downloading {repo_id} to {local_dir} …")
    snapshot_download(
        repo_id=repo_id,
        repo_type="model",
        local_dir=local_dir,
        # local_files_only=False 로 허브에서 받아옴
    )
    print("Done.")