const BASE_URL = 'https://211.188.55.88';

async function handleRegister() {
  const name = document.getElementById('registerName').value;
  const phoneNumber = document.getElementById('registerPhone').value;
  const email = document.getElementById('registerEmail').value;
  const birthdate = document.getElementById('registerBirthdate').value;
  const gender = document.getElementById('registerGender').value; // 이미 "1" or "2" 값
  const permission = parseInt(document.getElementById('registerPermission').value);
  const password = document.getElementById('registerPassword').value;
  const resultDiv = document.getElementById('result');

  try {
    const response = await fetch(`${BASE_URL}/db/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name,
        phoneNumber,
        email,
        birthdate,
        gender,         // 1 (남자) or 2 (여자)
        permission,
        password
      })
    });

    const result = await response.json();
    resultDiv.textContent = JSON.stringify(result, null, 2);
  } catch (err) {
    resultDiv.textContent = '에러 발생: ' + err.message;
  }
}
