from flask import Flask, request, jsonify
from model import SummaryModel

app = Flask(__name__)

# 모델 초기화
summary_model = SummaryModel(weight_path="/home/BackEnd/AI/funcs/summary_AI/weights/summary weight.ckpt")

@app.route("/summarize", methods=["POST"])
def summarize():
    data = request.json
    text = data.get("text", "")
    max_len = data.get("max_len", 128)
    if not text:
        return jsonify({"error": "No text provided"}), 400

    summary = summary_model.summarize(text, max_len=max_len)
    return jsonify({"summary": summary})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)
