#!/bin/bash
pm2 delete all

# 로그 디렉터리 생성 (없으면 생성)
mkdir -p /new_data/logs

# MainServer.js PM2 실행
pm2 start MainServer.js \
  --name MainServer \
  --output /new_data/logs/mainserver-out.log \
  --error /new_data/logs/mainserver-error.log

# Python STT AI 서버 실행
pm2 start python3 \
  --name STT_AI \
  -- -u /home/BackEnd/AI/funcs/stt_AI/server.py \
  --output /new_data/logs/stt_ai-out.log \
  --error /new_data/logs/stt_ai-error.log

# Ollama Serve 실행
pm2 start "ollama serve" \
  --name ollama-server \
  --output /new_data/logs/ollama-out.log \
  --error /new_data/logs/ollama-error.log

# PM2 상태 저장 (재부팅 후 자동 시작 위해)
pm2 save
