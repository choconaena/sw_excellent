const axios = require('axios');

const visitReport = {
  reportid: 4,
  reportstatus: 1,
  visittime: "2025-04-03 14:00",
  targetInfo: {
    targetid: 1,
    targetname: "이유진",
    address1: "대전 서구asdfsdfasfasf 대덕대로 150",
    address2: "경성 큰마을아파트 102동 103호",
    targetcallnum: "010-3889-3501",
    gender: 1,
    age: 77
  },
  userInfo: {
    email: "jenny7732@naver.com",
    password: "12345678",
    username: "yujin",
    callnum: "010-4368-0203",
    birthday: "2002-02-03",
    etc: "대전 지부 OOO 담당",
    role: 0,
    gender: 0
  },
  visitType: "긴급방문"
};

axios.post('http://localhost:3000/db/uploadReportDefaultInfo', visitReport)
  .then(res => {
    console.log('✅ 서버 응답:', res.data);
  })
  .catch(err => {
    console.error('❌ 전송 실패:', err.message);
  });
