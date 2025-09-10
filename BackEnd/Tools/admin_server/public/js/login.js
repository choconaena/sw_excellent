const BASE_URL = 'https://211.188.55.88';

async function handleLogin() {
  const email = document.getElementById('loginEmail').value;
  const password = document.getElementById('loginPassword').value;
  const resultDiv = document.getElementById('result');

  try {
    const response = await fetch(`${BASE_URL}/db/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });

    const result = await response.json();
    resultDiv.textContent = JSON.stringify(result, null, 2);

    // 로그인 성공 시 localStorage에 저장
    if (result.status && result.token) {
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userEmail', result.user.email);  // 추가 저장
      location.href = 'dashboard.html';
    }else {
      resultDiv.textContent = '로그인 실패: ' + result.message;
    }
  } catch (err) {
    resultDiv.textContent = '에러 발생: ' + err.message;
  }
}
