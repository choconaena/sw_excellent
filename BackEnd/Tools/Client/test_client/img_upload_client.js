const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function uploadImagesWithReportId() {
  const form = new FormData();

  // 📌 전송할 reportid
  const reportid = 4;
  form.append('reportid', reportid);

  // 📌 전송할 이미지 파일들
  const images = ['./img1.jpg', './img2.png'];

  for (const imgPath of images) {
    const stream = fs.createReadStream(imgPath);
    form.append('images', stream, path.basename(imgPath));
  }

  try {
    const response = await axios.post(
      'http://localhost:3000/db/uploadImages',
      form,
      { headers: form.getHeaders() }
    );

    if (response.data.data) {
      console.log('Uploaded files:', response.data.data.files.map(f => f.filename));
      console.log('Saved to folder for visittime:', response.data.data.visittime);
    }

  } catch (err) {
    console.error('[❌ Upload Failed]');
    if (err.response) {
      console.error('Server Response:', err.response.data);
    } else {
      console.error('Error:', err.message);
    }
  }
}

uploadImagesWithReportId();
