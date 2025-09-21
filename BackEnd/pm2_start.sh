#!/bin/bash
pm2 delete all

# 로그 디렉터리 생성 (없으면 생성)
mkdir -p /new_data/sw_excellent/logs

# MainServer.js PM2 실행
pm2 start /new_data/sw_excellent/BackEnd/MainServer.js \
  --name MainServer_test \
  --output /new_data/sw_excellent/logs/mainserver-out.log \
  --error /new_data/sw_excellent/logs/mainserver-error.log

# Python STT AI 서버 실행
pm2 start /new_data/sw_excellent/BackEnd/AI/funcs/stt_AI/server.py \
  --name STT_AI_test \
  -- -u /new_data/sw_excellent/BackEnd/AI/funcs/stt_AI/server.py \
  --output /new_data/sw_excellent/logs/stt_ai-out.log \
  --error /new_data/sw_excellent/logs/stt_ai-error.log
  
'''
# Ollama Serve 실행
pm2 start "ollama serve" \
  --name ollama-server_test \
  --output /new_data/sw_excellent/logs/ollama-out.log \
  --error /new_data/sw_excellent/logs/ollama-error.log
'''

pm2 start /new_data/sw_excellent/BackEnd/AI/funcs/stt_AI/server_https.py \
  --name server_https_test \
  --output /new_data/sw_excellent/logs/server_https-out.log \
  --error /new_data/sw_excellent/logs/server_https-error.log

pm2 start /new_data/sw_excellent/BackEnd/WS/ws_server.js \
  --name ws_server_test \
  --output /new_data/sw_excellent/logs/ws_server-out.log \
  --error /new_data/sw_excellent/logs/ws_server-error.log

pm2 start /new_data/sw_excellent/BackEnd/WS/ws_server_https.js \
  --name ws_server_https_test \
  --output /new_data/sw_excellent/logs/ws_server_https-out.log \
  --error /new_data/sw_excellent/logs/ws_server_https-error.log

# PM2 상태 저장 (재부팅 후 자동 시작 위해)
pm2 save
