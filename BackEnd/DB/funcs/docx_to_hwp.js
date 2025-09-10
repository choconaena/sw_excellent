// convert_to_hwp.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const axios = require('axios');
const FormData = require('form-data');

// DOCX → HWP 변환 함수
async function convertDocxToHwp(docxPath) {
  if (!fs.existsSync(docxPath)) {
    throw new Error(`파일이 존재하지 않습니다: ${docxPath}`);
  }

//   const apiKey = process.env.CLOUDCONVERT_API_KEY;
  const apiKey = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiJ9.eyJhdWQiOiIxIiwianRpIjoiOTlhYzM0NTY4ZTQ1N2QyZDE0NTE1N2M3NTJmYjdmNTgwYzBjNjAxODY2NDVhOThjNDE2ZmIwMmY2ZTEyNWJhZWQzMzFkYTFmNmMwYTk0NzQiLCJpYXQiOjE3NDQ5ODQwNjUuOTIwOTYxLCJuYmYiOjE3NDQ5ODQwNjUuOTIwOTYyLCJleHAiOjQ5MDA2NTc2NjUuOTE3NDUyLCJzdWIiOiI3MTY3NTcyOSIsInNjb3BlcyI6WyJ1c2VyLnJlYWQiLCJ1c2VyLndyaXRlIiwidGFzay5yZWFkIiwidGFzay53cml0ZSIsIndlYmhvb2sud3JpdGUiLCJ3ZWJob29rLnJlYWQiLCJwcmVzZXQucmVhZCIsInByZXNldC53cml0ZSJdfQ.RL69O3kphuJ1pbZvx-qM-g9XLcK_DyOOg05tNKAaNeGOEFYjatA7In1ELbI4GmwQfBMYq1BB1BKfmqdb7DlpWKItaRRAfolZv_HIwh4GO6DufhF_1AHy1v0wAEQyKcUdd4M62HaKQGsKM90_hF41oQYRNNlrLnw5Zc-plXByiYS3mO28h5luGN6282uEyIMVZc-OpCJ2wsKedmoirEs-cjBYxkVOuT94sz9dG3DLhZpFaSB3CtC9M0VBNZYwFN3RfRBI9C1wJ-242IIOWJ0qj0770ZDMomp9iKEOIQdR4Rq-WbIOpIERK5dUjZPGUKuU243Bh-6Y9xqRA0X9QwHOfyQX9hj-ViImPrZzFQhGLVpOZv40HxeitnO5zFjVkTdieSEntCLUJnK3Z6x3MSQWMSSqB7RFtOMpUEklYBa5jHLb2XAWomYe9My-sP22AeVb7GM3MtvzVoCmw1chvkZPDCB_SX4gORBbaOD6nnZdUDiCrpIKQyAGs3HxoGBOqzIrJXgbYICQlA4MmndhwumMSEPzDK-IXtHO0HUOy69KzBBP_sFo5fB0ZxPhGjs8JwjJlDDOL0zC_FIPwESAhR3xO2YTpbiOhqLDiYWBhDLQLvWJlDrYHVTGm_v5iRn7eY97Kicr6uEyJoS_vcOGwoBd2VCyXt6q6xQ1rSrlefZnAw4";
  if (!apiKey) {
    throw new Error('CLOUDCONVERT_API_KEY 환경변수를 설정해주세요.');
  }

  const form = new FormData();
  form.append('file', fs.createReadStream(docxPath));

  const url = 'https://api.cloudconvert.com/convert?inputformat=docx&outputformat=hwp&engine=libreoffice';

  const response = await axios.post(url, form, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...form.getHeaders(),
    },
    responseType: 'stream',
  });

  const hwpPath = docxPath.replace(/\.docx$/i, '.hwp');
  const writer = fs.createWriteStream(hwpPath);

  return new Promise((resolve, reject) => {
    response.data.pipe(writer);
    writer.on('finish', () => {
      console.log(`✔ HWP 파일 생성됨: ${hwpPath}`);
      resolve(hwpPath);
    });
    writer.on('error', reject);
  });
}

// 실행 로직
(async () => {
  const docxFile = process.argv[2]; // CLI 인자 받기
  if (!docxFile) {
    console.error('사용법: node convert_to_hwp.js ./your_file.docx');
    process.exit(1);
  }

  try {
    const fullPath = path.resolve(docxFile);
    await convertDocxToHwp(fullPath);
  } catch (err) {
    console.error('변환 오류:', err.message || err);
    process.exit(1);
  }
})();
