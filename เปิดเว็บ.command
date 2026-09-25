#!/bin/bash
# ดับเบิลคลิกไฟล์นี้เพื่อเปิดเว็บ (macOS: อาจต้องคลิกขวา > Open ครั้งแรก)
cd "$(dirname "$0")"

if command -v python3 &> /dev/null; then
  PYCMD=python3
elif command -v python &> /dev/null; then
  PYCMD=python
else
  echo "ไม่พบ Python ในเครื่อง กรุณาติดตั้งจาก https://www.python.org/downloads/ ก่อน"
  read -p "กด Enter เพื่อปิดหน้าต่างนี้..."
  exit 1
fi

( sleep 1
  if command -v open &> /dev/null; then
    open http://localhost:8080/          # macOS
  elif command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8080/      # Linux
  fi
) &

$PYCMD -m http.server 8080
