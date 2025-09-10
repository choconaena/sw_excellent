# Node.js 20 설치 (nvm 또는 공식 스크립트)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# 기존 모듈 삭제 후 재설치
rm -rf node_modules package-lock.json
npm install

# python
sudo apt update
sudo apt install -y python3
sudo apt install -y python3-pip

# for basic AIs
pip install torch
pip install transformers
pip install sentence_transformers

# for stt model
pip install resemblyzer
pip install webrtcvad

# no hang to prevent OOM
sudo add-apt-repository ppa:oibaf/test
sudo apt update
sudo apt install nohang
sudo systemctl enable --now nohang-desktop.service
