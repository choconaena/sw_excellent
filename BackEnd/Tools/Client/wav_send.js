const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadWavFile() {
    const form = new FormData();

    const reportid = 1;
    const filePath = '/new_data/sw_excellent/BackEnd/result.wav'; // 업로드할 .wav 파일 경로

    // form-data 구성
    form.append('reportid', reportid);
    form.append('audiofile', fs.createReadStream(filePath));

    try {
        const response = await axios.post('http://211.188.55.88:23000/db/uploadCallRecord', form, {
            headers: form.getHeaders(),
            maxContentLength: Infinity,
            maxBodyLength: Infinity
        });

        console.log('서버 응답:', response.data);
    } catch (err) {
        console.error('업로드 실패:', err.response?.data || err.message);
    }
}

uploadWavFile();
