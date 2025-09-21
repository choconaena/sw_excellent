const axios = require('axios');

const detailData = {
  reportid: 3,
  detail: "특이사항: 대상자는 오전 10시경 자택에서 대면 상담을 진행하였으며, 전반적인 건강 상태는 양호하나 최근 수면의 질 저하와 관련된 불편을 호소함. 생활 리듬 개선을 위한 주기적인 상담과 식습관 교정이 필요해 보이며, 다음 방문 시 관련 사항에 대해 더욱 면밀한 평가가 요구됨. 방문 중 가족 구성원과의 짧은 대화를 통해 정서적 지지 환경은 양호한 편이나, 장기적인 정서 케어 계획 수립이 권장됨."
};

axios.post('http://localhost:23000/db/uploadVisitDetail', detailData)
  .then(res => {
    console.log('✅ 서버 응답:', res.data);
  })
  .catch(err => {
    console.error('❌ 전송 실패:', err.message);
  });
