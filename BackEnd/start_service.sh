#!/bin/bash

# Ollama 중복 실행 방지
if pgrep -f "ollama serve" > /dev/null; then
    echo "[!] Ollama is already running."
else
    echo "[+] Starting Ollama..."
    export OLLAMA_MODELS=/mnt/a/ollama_data/models
    nohup ollama serve > /mnt/a/ollama_log.txt 2>&1 &
fi

# Elasticsearch 중복 실행 방지
if pgrep -f elasticsearch > /dev/null; then
    echo "[!] Elasticsearch is already running."
else
    echo "[+] Starting Elasticsearch..."
    cd /mnt/a/elastic/elasticsearch-8.17.1
    ./bin/elasticsearch -d
fi

# Node.js Mainserver 중복 실행 방지
if pm2 list | grep -q "Mainserver"; then
    echo "[!] Mainserver.js is already managed by pm2."
else
    echo "[+] Starting Mainserver.js with pm2..."
    pm2 start MainServer.js --name Mainserver
fi
