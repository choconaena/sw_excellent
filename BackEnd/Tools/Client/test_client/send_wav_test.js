// client.js
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadWavFile(filePath) {
  try {
    // FormData 객체 생성
    const form = new FormData();

    // .wav 파일을 FormData에 추가
    form.append('audio', fs.createReadStream(filePath));

    // 파일 전송 요청
    const response = await axios.post('http://127.0.0.1:3000/upload', form, {
      headers: {
        ...form.getHeaders(),
      },
    });

    if (response.status === 200) {
      console.log('File uploaded successfully:', response.data);
    }
  } catch (error) {
    console.error('Error uploading file:', error.message);
  }
}

// .wav 파일 경로
const wavFilePath = path.join(__dirname, 'example.wav');

// 파일 업로드 함수 호출
uploadWavFile(wavFilePath);
