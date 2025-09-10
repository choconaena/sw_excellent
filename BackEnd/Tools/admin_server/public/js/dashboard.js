const BASE_URL = 'https://211.188.55.88';

function convertGender(gender) {
  return gender === 1 ? '남자' : gender === 2 ? '여자' : '기타';
}

async function fetchTodayList() {
  const resultDiv = document.getElementById('scheduleResult');
  resultDiv.innerHTML = '조회 중...';

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.innerHTML = '<div class="no-data">인증 토큰이 없습니다. 다시 로그인해주세요.</div>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/getTodayList`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv.innerHTML = `<div class="no-data">에러: ${errorData.message || '요청 실패'}</div>`;
      return;
    }

    const schedules = await response.json();

    if (schedules.length === 0) {
      resultDiv.innerHTML = '<div class="no-data">오늘 스케줄이 없습니다.</div>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>방문시간</th>
          <th>이름</th>
          <th>성별</th>
          <th>나이</th>
          <th>주소</th>
          <th>연락처</th>
        </tr>
      </thead>
      <tbody>
        ${schedules.map(item => `
          <tr>
            <td>${item.visittime}</td>
            <td>${item.targetInfo.targetname}</td>
            <td>${convertGender(item.targetInfo.gender)}</td>
            <td>${item.targetInfo.age}</td>
            <td>${item.targetInfo.address1} ${item.targetInfo.address2}</td>
            <td>${item.targetInfo.targetcallnum}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    resultDiv.innerHTML = '';
    resultDiv.appendChild(table);

  } catch (err) {
    resultDiv.innerHTML = '<div class="no-data">요청 중 오류 발생: ' + err.message + '</div>';
  }
}

async function assignUserToReport() {
  const reportid = parseInt(document.getElementById('assignReportId').value);
  const email = document.getElementById('assignEmail').value;
  const resultDiv = document.getElementById('assignResult');

  if (!reportid || !email) {
    resultDiv.textContent = '모든 필드를 입력해주세요.';
    return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.textContent = '인증 토큰이 없습니다. 다시 로그인해주세요.';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/setUserToReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ reportid, email })
    });

    const result = await response.json();

    if (!response.ok) {
      resultDiv.textContent = `에러: ${result.message || '요청 실패'}`;
      return;
    }

    resultDiv.textContent = `✅ 성공: ${result.message || '사용자 할당이 완료되었습니다.'}`;
  } catch (err) {
    resultDiv.textContent = '요청 중 오류 발생: ' + err.message;
  }
}

function convertStatus(status) {
  if (status === 0){
    return '방문전';
  }
  else if (status === 1){
    return '보고서작성대기'
  }
  else if (status === 2){
    return '완료'
  }
}

async function fetchAllVisitReports() {
  const resultDiv = document.getElementById('allReportsResult');
  resultDiv.innerHTML = '조회 중...';

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.innerHTML = '<div class="no-data">인증 토큰이 없습니다. 다시 로그인해주세요.</div>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/getAllVisitReports`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv.innerHTML = `<div class="no-data">에러: ${errorData.message || '요청 실패'}</div>`;
      return;
    }

    const reports = await response.json();

    if (reports.length === 0) {
      resultDiv.innerHTML = '<div class="no-data">등록된 리포트가 없습니다.</div>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Report ID</th>
          <th>방문시간</th>
          <th>상태</th>
          <th>담당자 이메일</th>
          <!-- <th>STT 경로</th> -->
          <th>대상자 이름</th>
          <th>성별</th>
          <th>나이</th>
          <th>주소</th>
          <th>연락처</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map(item => `
          <tr>
            <td>${item.reportid}</td>
            <td>${item.visittime}</td>
            <td>${convertStatus(item.reportstatus)}</td>
            <td>${item.email || '-'}</td>
            <!-- <td>${item.stt_transcript_path ? item.stt_transcript_path : '-'}</td> -->
            <td>${item.targetInfo.targetname}</td>
            <td>${convertGender(item.targetInfo.gender)}</td>
            <td>${item.targetInfo.age}</td>
            <td>${item.targetInfo.address1} ${item.targetInfo.address2}</td>
            <td>${item.targetInfo.targetcallnum}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    resultDiv.innerHTML = '';
    resultDiv.appendChild(table);

  } catch (err) {
    resultDiv.innerHTML = '<div class="no-data">요청 중 오류 발생: ' + err.message + '</div>';
  }
}

async function fetchVisitedReports() {
  const resultDiv = document.getElementById('visitedReportsResult');
  resultDiv.innerHTML = '조회 중...';

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.innerHTML = '<div class="no-data">인증 토큰이 없습니다. 다시 로그인해주세요.</div>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/getDefaultReportList`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv.innerHTML = `<div class="no-data">에러: ${errorData.message || '요청 실패'}</div>`;
      return;
    }

    const reports = await response.json();

    if (reports.length === 0) {
      resultDiv.innerHTML = '<div class="no-data">작성할 리포트가 없습니다.</div>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Report ID</th>
          <th>방문시간</th>
          <th>대상자 이름</th>
          <th>성별</th>
          <th>나이</th>
          <th>주소</th>
          <th>연락처</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map(item => `
          <tr>
            <td>${item.reportid}</td>
            <td>${item.visittime}</td>
            <td>${item.targetInfo.targetname}</td>
            <td>${convertGender(item.targetInfo.gender)}</td>
            <td>${item.targetInfo.age}</td>
            <td>${item.targetInfo.address1} ${item.targetInfo.address2}</td>
            <td>${item.targetInfo.targetcallnum}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    resultDiv.innerHTML = '';
    resultDiv.appendChild(table);

  } catch (err) {
    resultDiv.innerHTML = '<div class="no-data">요청 중 오류 발생: ' + err.message + '</div>';
  }
}

async function addTarget() {
  const targetname = document.getElementById('targetName').value;
  const address1 = document.getElementById('targetAddress1').value;
  const address2 = document.getElementById('targetAddress2').value || '';
  const callnum = document.getElementById('targetCallnum').value;
  const gender = parseInt(document.getElementById('targetGender').value);
  const age = parseInt(document.getElementById('targetAge').value);
  const resultDiv = document.getElementById('addTargetResult');

  // 필수값 체크
  if (!targetname || !address1 || !callnum || isNaN(gender) || isNaN(age)) {
    resultDiv.textContent = '❗ 모든 필수 항목을 입력해주세요.';
    return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.textContent = '❗ 인증 토큰이 없습니다. 다시 로그인해주세요.';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/addTarget`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        targetname,
        address1,
        address2,
        callnum,
        gender,
        age
      })
    });

    const result = await response.json();


    if (!response.ok) {
      resultDiv.textContent = `❌ 실패: ${result.message || '등록 실패'}`;
      return;
    }

    resultDiv.textContent = `✅ 성공: 대상자 등록 완료 (ID: ${result.insertedId})`;
  } catch (err) {
    resultDiv.textContent = '❌ 오류 발생: ' + err.message;
  }
}

async function fetchAllTargets() {
  const resultDiv = document.getElementById('allTargetsResult');
  resultDiv.innerHTML = '조회 중...';

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.innerHTML = '<div class="no-data">❗ 인증 토큰이 없습니다. 다시 로그인해주세요.</div>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/getAllTargets`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv.innerHTML = `<div class="no-data">에러: ${errorData.message || '요청 실패'}</div>`;
      return;
    }

    const targets = await response.json();

    if (targets.length === 0) {
      resultDiv.innerHTML = '<div class="no-data">등록된 대상자가 없습니다.</div>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>대상자 ID</th>
          <th>이름</th>
          <th>성별</th>
          <th>나이</th>
          <th>주소</th>
          <th>연락처</th>
        </tr>
      </thead>
      <tbody>
        ${targets.map(t => `
          <tr>
            <td>${t.targetid}</td>
            <td>${t.targetname}</td>
            <td>${convertGender(t.gender)}</td>
            <td>${t.age}</td>
            <td>${t.address1} ${t.address2 || ''}</td>
            <td>${t.callnum}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    resultDiv.innerHTML = '';
    resultDiv.appendChild(table);

  } catch (err) {
    resultDiv.innerHTML = `<div class="no-data">오류 발생: ${err.message}</div>`;
  }
}

async function submitVisitReport() {
  const visittime = document.getElementById('reportVisitTime').value;
  const email = document.getElementById('reportEmail').value;
  const targetname = document.getElementById('reportTargetName').value;
  const targetid = parseInt(document.getElementById('reportTargetId').value);
  const resultDiv = document.getElementById('visitReportResponse');

  if (!visittime || !email || !targetname || !targetid) {
    resultDiv.textContent = '❗ 모든 입력 값을 정확히 입력해주세요.';
    return;
  }

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.textContent = '❗ 인증 토큰이 없습니다. 다시 로그인해주세요.';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/addVisitReport`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        visittime,
        email,
        targetname,
        targetid
      })
    });

    const result = await response.json();

    if (!response.ok) {
      resultDiv.textContent = `❌ 실패: ${result.message || '보고서 등록 실패'}`;
      return;
    }

    resultDiv.innerHTML = `
      ✅ <strong>방문 보고서 등록 완료!</strong><br>
      리포트 ID: ${result.reportid}<br>
      담당자 이름: ${result.user?.name || '이름 없음'}<br>
      담당자 이메일: ${result.user?.email}
    `;
  } catch (err) {
    resultDiv.textContent = '❌ 요청 중 오류 발생: ' + err.message;
  }
}

async function fetchResultReports() {
  const resultDiv = document.getElementById('resultReportsList');
  resultDiv.innerHTML = '조회 중...';

  const token = localStorage.getItem('authToken');
  if (!token) {
    resultDiv.innerHTML = '<div class="no-data">❗ 인증 토큰이 없습니다. 다시 로그인해주세요.</div>';
    return;
  }

  try {
    const response = await fetch(`${BASE_URL}/db/getResultReportList`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      const errorData = await response.json();
      resultDiv.innerHTML = `<div class="no-data">에러: ${errorData.message || '요청 실패'}</div>`;
      return;
    }

    const reports = await response.json();
    console.log(reports)

    if (reports.length === 0) {
      resultDiv.innerHTML = '<div class="no-data">작성 완료된 리포트가 없습니다.</div>';
      return;
    }

    const table = document.createElement('table');
    table.innerHTML = `
      <thead>
        <tr>
          <th>Report ID</th>
          <th>방문시간</th>
          <th>대상자 이름</th>
          <th>성별</th>
          <th>나이</th>
          <th>연락처</th>
          <th>주소</th>
        </tr>
      </thead>
      <tbody>
        ${reports.map(r => `
          <tr>
            <td>${r.reportid}</td>
            <td>${r.visittime}</td>
            <td>${r.targetInfo?.targetname || '-'}</td>
            <td>${convertGender(r.targetInfo?.gender)}</td>
            <td>${r.targetInfo?.age || '-'}</td>
            <td>${r.targetInfo?.targetcallnum || '-'}</td>
            <td>${r.targetInfo?.address1 || ''} ${r.targetInfo?.address2 || ''}</td>
          </tr>
        `).join('')}
      </tbody>
    `;

    resultDiv.innerHTML = '';
    resultDiv.appendChild(table);

  } catch (err) {
    resultDiv.innerHTML = '<div class="no-data">❌ 요청 오류: ' + err.message + '</div>';
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const email = localStorage.getItem('userEmail');
  const token = localStorage.getItem('authToken');

  if (!token || !email) {
    alert('로그인이 만료되었거나 유효하지 않습니다.');
    logout();
    return;
  }

  const emailSpan = document.getElementById('userEmailDisplay');
  const timerSpan = document.getElementById('tokenTimer');

  // 이메일 표시
  if (emailSpan) emailSpan.textContent = `${email} 님`;

  // 토큰 만료 확인 및 타이머 시작
  const payload = parseJwt(token);
  if (!payload || !payload.exp) {
    logout();
    return;
  }

  startTokenCountdown(payload.exp, timerSpan);
});

// 토큰 파싱
function parseJwt(token) {
  try {
    return JSON.parse(atob(token.split('.')[1]));
  } catch {
    return null;
  }
}

// 카운트다운 시작
function startTokenCountdown(exp, displayEl) {
  const interval = setInterval(() => {
    const now = Math.floor(Date.now() / 1000);
    const diff = exp - now;

    if (diff <= 0) {
      displayEl.textContent = '만료됨';
      alert('세션이 만료되었습니다. 다시 로그인해주세요.');
      clearInterval(interval);
      logout();
      return;
    }

    const minutes = Math.floor(diff / 60);
    const seconds = diff % 60;
    displayEl.textContent = `남은 시간: ${minutes}분 ${seconds < 10 ? '0' : ''}${seconds}초`;
  }, 1000);
}

function logout() {
  localStorage.removeItem('authToken');
  localStorage.removeItem('userEmail');
  location.href = 'index.html';
}
