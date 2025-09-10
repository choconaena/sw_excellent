const express = require('express');
const router = express.Router();
const multer = require('multer');
const dbModule = require('../DB/db_api');
const {postAndDownloadHWP}  = require('../DB/report_funcs/send_hwp_req');
const {postAndDownloadHWPLicense}  = require('../DB/report_funcs/send_construction_hwp_req');
const WSMoudle = require('../WS/funcs/wsHub');
const fs = require('fs');
const path = require('path');
const axios = require('axios');  // npm install axios

const WS_SERVER = process.env.WS_SERVER || "http://localhost:8086";

router.use(express.json());

// DB 모듈 라우팅
router.get('/', (req, res) => {
    dbModule.runDbFunction();
    res.send('DB module executed');
});


// 파일 다운로드
router.get("/yangcheon_report_result_download/:reportid", async (req, res) => {
  const reportid = Number(req.params.reportid);

  if (!Number.isInteger(reportid)) {
    return res.status(400).json({ status: false, msg: "invalid reportid" });
  }

  try {
    const filePath = await dbModule.getFilePathByReportId(reportid);
    if (!filePath) {
      return res.status(404).json({ status: false, msg: "파일 경로 없음" });
    }

    const absPath = path.resolve(filePath);
    if (!fs.existsSync(absPath)) {
      return res.status(404).json({ status: false, msg: "파일이 존재하지 않음" });
    }

    // 다운로드 헤더와 함께 전송
    return res.download(absPath, path.basename(absPath));
  } catch (e) {
    console.error("[download] error:", e);
    return res.status(500).json({ status: false, msg: "다운로드 실패" });
  }
});

router.post("/yangchun_license_info_edit", dbModule.authenticateToken, async (req, res) => {
  try {
    const data = req.body;
    const  stt_file_name  = "건설기계조종사는 stt가 필요없습니다"
    console.log('/yangchun_license_info_edit start report_id request')
    console.log("yangchun_license_info_edit : ", data)

    const report_id = await dbModule.prepareSttFile(stt_file_name, req.user.email); // JWT 토큰에서 유저 정보 추출 가정

    // data 객체에 report_id 추가
    data.reportid = report_id;

    const result = await dbModule.insertLicenseInfo(data);
    
    // 계약 유지: 응답 필드명은 reportid
    return res.status(200).json({
      status: true,
      reportid : report_id,
      msg: "발급 신청 정보 전송에 성공했습니다."
    });
  } catch (e) {
    console.error("[yangchun_license_info_edit] error:", e);
    return res.status(500).json({
      status: false,
      reportid: null,
      msg: "전송에 실패했습니다."
    });
  }
});

// return TXT
router.get('/getConverstationSTTtxt/:reportid', async (req, res) => {
    const reportid = parseInt(req.params.reportid);

    const result = await dbModule.getSTTTranscriptFile(reportid);

    if (!result.status) {
        return res.status(404).json({
            status: false,
            msg: result.msg,
        });
    }

    return res.sendFile(path.resolve(result.path));
});

router.get('/yangchun_all_report/:reportid', async (req, res) => {
  const reportid = Number(req.params.reportid);
  try {
    const result = await dbModule.yangchun_get_all_report_info(reportid);
    if (!result.status) {
      return res.status(404).json({ status: false, msg: result.msg || 'not found' });
    }
    return res.json(result); // { status:true, data:{...} }
  } catch (e) {
    return res.status(500).json({ status: false, msg: 'internal error' });
  }
});

router.get('/getReport/:reportid', async (req, res) => {
    const reportid = parseInt(req.params.reportid);

    const result = await dbModule.getReport(reportid);

    if (!result.status) {
        return res.status(404).json({
            status: false,
            msg: result.msg,
        });
    }

    return res.sendFile(path.resolve(result.path));
});


// 업로드 디렉토리 설정
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = '/new_data/upload_sign';
  
      // 디렉토리 존재하지 않으면 생성
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
  
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
        const reportid = req.body.reportid || 'unknown'; // 없을 경우 대비
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const ext = path.extname(file.originalname);
        cb(null, `reportID-${reportid}-${file.fieldname}-${uniqueSuffix}${ext}`);
      }
  });

// 파일 타입 필터 (예: 음성 + PNG 이미지 파일 허용)
const fileFilter = (req, file, cb) => {
  console.log(file);
  console.log("type : ", file.mimetype);

  const allowedTypes = [
    // 오디오
    'audio/mpeg',
    'audio/wav',
    'audio/x-wav',
    'audio/wave',
    'audio/x-pn-wav',
    'audio/mp3',
    'audio/x-m4a',
    'audio/webm',
    // 이미지
    'image/png'
  ];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only audio or PNG image files are allowed'), false);
  }
};

  
const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: { fileSize: 100 * 1024 * 1024 } // 최대 100MB
});

// [POST] /uploadCallRecord
router.post('/uploadCallRecord', upload.single('audiofile'), (req, res) => {
    const { reportid } = req.body;

    if (!reportid || !req.file) {
        return res.status(400).json({
            success: false,
            message: 'reportid 또는 audiofile이 누락되었습니다.',
        });
    }

    console.log("📥 reportid:", reportid);
    console.log("✅ uploaded:", req.file.path);

    return res.status(200).json({
        success: true,
        message: 'Call record uploaded successfully',
        reportid: reportid,
        filename: req.file.filename,
        size: req.file.size,
        mimetype: req.file.mimetype,
        path: req.file.path
    });
});
  
// '/uploadImages' 경로로 여러 파일 업로드 받기
router.post('/uploadImages', async (req, res) => {
    let visittimeCache = null;
  
    const upload = dbModule.makeUploadMiddleware((req2, visittime) => {
      visittimeCache = visittime;
    });
  
    upload(req, res, async (err) => {
      if (err) {
        return res.json({
          status: false,
          message: 'Upload middleware error: ' + err.message
        });
      }
  
      req.visittime = visittimeCache;
  
      // 서비스 함수로 로직 위임, 응답은 여기서 직접 처리
      const result = await dbModule.uploadReportImages(req);
      console.log(result)
      return res.json(result);
    });
  });

/**
 * POST /db/uploadSign
 * multipart/form-data
 * Fields:
 *   reportid (number)
 *   imgfile (image)
 */
router.post('/uploadSign', dbModule.authenticateToken, upload.single('imgfile'), async (req, res) => {
  const { reportid } = req.body;
  const email = req.user.email;

  if (!reportid) {
    return res.status(400).json({
      success: false,
      message: 'reportid 필드가 필요합니다.'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '이미지 파일(imgfile)이 필요합니다.'
    });
  }

  try {
    const uploadedFilename = `정보공개청구-${reportid}`;
    const uploadedPath = req.file.path;         // 파일의 전체 경로
    
    // DB 저장 예시
    await dbModule.insertSignImg(reportid, email, uploadedFilename, uploadedPath);

    console.log(`📌 reportid ${reportid} 에 이미지 업로드됨: ${req.file.filename}`);

    return res.status(201).json({
      success: true,
      message: '이미지가 정상적으로 업로드되었습니다.',
      data: {
        reportid,
        filename: req.file.filename,
        path: req.file.path
      }
    });
  } catch (err) {
    console.error('이미지 업로드 처리 오류:', err);
    return res.status(500).json({
      success: false,
      message: '서버 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /db/uploadConstructionSign
 * multipart/form-data
 * Fields:
 *   reportid (number)
 *   num (number)
 *   imgfile (image)
 */
router.post('/uploadConstructionSign', dbModule.authenticateToken, upload.single('imgfile'), async (req, res) => {
  const { reportid } = req.body;
  const { num } = req.body;
  const email = req.user.email;

  if (!reportid || !num) {
    return res.status(400).json({
      success: false,
      message: 'reportid와 num 필드가 필요합니다.'
    });
  }

  if (!req.file) {
    return res.status(400).json({
      success: false,
      message: '이미지 파일(imgfile)이 필요합니다.'
    });
  }

  try {
    const uploadedFilename = `건설기계조종사자격증신청-${reportid}-${num}`;
    const uploadedPath = req.file.path;         // 파일의 전체 경로

    await dbModule.insertConstructionSignImg(reportid, email, uploadedFilename, uploadedPath, num);

    console.log(`📌 reportid ${reportid} 에 이미지 업로드됨: ${req.file.filename}`);

    return res.status(201).json({
      success: true,
      message: '이미지가 정상적으로 업로드되었습니다.',
      data: {
        reportid,
        filename: req.file.filename,
        path: req.file.path
      }
    });
  } catch (err) {
    console.error('이미지 업로드 처리 오류:', err);
    return res.status(500).json({
      success: false,
      message: '서버 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /db/get_sign
 * {
 *   reportid: 1
 * }
 */
router.post('/get_sign', dbModule.authenticateToken, async (req, res) => {
  const { reportid } = req.body;
  const email = req.user.email;

  if (!reportid) {
    return res.status(400).json({
      status: false,
      msg: 'reportid 필드가 필요합니다.'
    });
  }

  try {
    // 예시: DB에서 파일 경로 조회
    const record = await dbModule.getSignImgPath(reportid, email);
    // const record = {
    //   filePath: `/path/to/sign_${reportid}.png`, // 실제 DB 조회 결과
    // };

    // 파일 존재 여부 확인
    if (!record || !record.filePath) {
      return res.status(404).json({
        status: false,
        msg: '요청에 실패했습니다.'
      });
    }

    return res.status(200).json({
      status: true,
      file: record.filePath
    });
  } catch (err) {
    console.error('서명 이미지 요청 오류:', err);
    return res.status(500).json({
      status: false,
      msg: '서버 처리 중 오류가 발생했습니다.'
    });
  }
});


/**
 * POST /db/get_construction_sign
 * {
 *   reportid: 1
 * }
 */
router.post('/get_construction_sign', dbModule.authenticateToken, async (req, res) => {
  const { reportid, num } = req.body;
  const email = req.user.email;

  if (!reportid) {
    return res.status(400).json({
      status: false,
      msg: 'reportid 필드가 필요합니다.'
    });
  }

  try {
    // 예시: DB에서 파일 경로 조회
    const record = await dbModule.getConstructionSignImgPath(reportid, num, email);
    // const record = {
    //   filePath: `/path/to/sign_${reportid}.png`, // 실제 DB 조회 결과
    // };

    // 파일 존재 여부 확인
    if (!record || !record.filePath) {
      return res.status(404).json({
        status: false,
        msg: '요청에 실패했습니다.'
      });
    }

    return res.status(200).json({
      status: true,
      file: record.filePath
    });
  } catch (err) {
    console.error('서명 이미지 요청 오류:', err);
    return res.status(500).json({
      status: false,
      msg: '서버 처리 중 오류가 발생했습니다.'
    });
  }
});


/**
 * POST /db/yangchun_exempt
 * req.body:
 * {
 *   reportid: 1,          // number, required
 *   isexempt: 1,          // 1: 감면 대상, 0: 비대상, required
 *   content: "사유..."    // string, optional(=비대상일 때는 빈 문자열 허용)
 * }
 *
 * res.body on success:
 * { status: true, msg: "수수료 감면 방식 전송에 성공했습니다." }
 *
 * res.body on failure:
 * { status: false, msg: "전송에 실패했습니다." }
 */
router.post('/yangchun_exempt', dbModule.authenticateToken, async (req, res) => {
  const { reportid, isexempt, content } = req.body;

  // 1) 유효성 검사
  if (!Number.isInteger(reportid)) {
    return res.status(400).json({ status: false, msg: "reportid must be an integer" });
  }
  if (isexempt !== 0 && isexempt !== 1) {
    return res.status(400).json({ status: false, msg: "isexempt must be 0 or 1" });
  }

  try {
    await dbModule.insertFeeExemption(reportid, isexempt, content || "");

    return res.status(201).json({
      status: true,
      msg: "수수료 감면 방식 전송에 성공했습니다."
    });
  } catch (err) {
    console.error("insertFeeExemption 오류:", err);
    return res.status(500).json({
      status: false,
      msg: "전송에 실패했습니다."
    });
  }
});


//upload report
// 정책 체크 상태 업로드
router.post('/uploadCheckPolicy', async (req, res) => {
    try {
        const result = await dbModule.uploadVisitPolicyStatus(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: '정책 체크 상태 업로드 중 오류 발생',
        });
    }
});

// 방문 카테고리 요약정보 업로드
router.post('/uploadEditAbstract', async (req, res) => {
    try {
        const result = await dbModule.uploadVisitCategoryItems(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: '카테고리 정보 업로드 중 오류 발생',
        });
    }
});


// 보고서 기본정보 업로드
router.post('/uploadReportDefaultInfo', async (req, res) => {
    try {
        const result = await dbModule.uploadReportDefaultInfo(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: '보고서 step1 전송 중 오류가 발생했습니다.'
        });
    }
});

// 방문 보고서 상세내용 업로드
router.post('/uploadVisitDetail', async (req, res) => {
    try {
        const result = await dbModule.uploadVisitDetail(req.body);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            status: false,
            msg: '상담결과 특이사항 전송 중 오류가 발생했습니다.'
        });
    }
});

// VisitSchedule
// 대상자 상세 정보 조회 (lastvisit 포함)
router.get('/getTargetInfo/:id', async (req, res) => {
    try {
        const targetInfo = await dbModule.getTargetInfo(req.params.id);
        if (!targetInfo) {
            return res.status(404).json({ message: '해당하는 report id가 없습니다' });
        }
        res.json(targetInfo);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving target info');
    }
});

// 방문 스케줄 전체 조회
router.get('/getTodayList', dbModule.authenticateToken, async (req, res) => {
  try {
    const email = req.user.email;
    console.log("getTodayList", email);
    const schedules = await dbModule.getTodayList(email);
    res.json(schedules);
  } catch (error) {
    console.error(error);
    res.status(500).send('Error retrieving schedule list');
  }
});

// 방문 담당자 등록
router.post('/setUserToReport', dbModule.authenticateToken, async (req, res) => {
  try {
    const { reportid, email } = req.body;

    if (!reportid || !email) {
      return res.status(400).json({ message: 'reportid and email are required' });
    }

    await dbModule.setEmailToReport(reportid, email);
    res.status(200).json({ message: 'Email updated successfully' });
  } catch (error) {
    console.error('Error updating email in VisitReport:', error);
    res.status(500).send('Internal server error');
  }
});

// 방문 대상자 등록
router.post('/addTarget', async (req, res) => {
  try {
    const {
      targetname,
      address1,
      address2,
      callnum,
      gender,
      age
    } = req.body;

    if (!targetname || !address1 || !callnum || gender === undefined || age === undefined) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }

    const result = await dbModule.addTarget({
      targetname,
      address1,
      address2,
      callnum,
      gender,
      age
    });

    console.log("addTarget result : ", result)

    res.status(201).json({ message: 'Target added successfully', insertedId: result.insertedId });
  } catch (error) {
    console.error('Error adding target:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 방문 대상자 전체 조회
router.get('/getAllTargets', async (req, res) => {
  try {
    const targets = await dbModule.getAllTargets();
    res.status(200).json(targets);
  } catch (error) {
    console.error('Error retrieving all targets:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// 방문 스케줄 전체조회
router.get('/getAllVisitReports', dbModule.authenticateToken, async (req, res) => {
  try {
    const reports = await dbModule.getAllVisitReports();
    res.json(reports);
  } catch (error) {
    console.error('Error retrieving all visit reports:', error);
    res.status(500).send('Internal server error');
  }
});

// 방문 보고서 제작
router.post('/addVisitReport', async (req, res) => {
  try {
    const { visittime, email, targetname, targetid } = req.body;

    if (!visittime || !email || !targetid) {
      return res.status(400).json({ message: 'visittime, email, and targetid are required.' });
    }

    const result = await dbModule.addVisitReport({ visittime, email, targetname, targetid });

    res.status(201).json({
      message: 'VisitReport created successfully',
      reportid: result.reportid,
      user: result.userInfo
    });

  } catch (error) {
    console.error('Error adding VisitReport:', error);
    res.status(400).json({ message: error.message });
  }
});



// 방문 스케줄 전체 조회 (visitted)
router.get('/getDefaultReportList',  dbModule.authenticateToken, async (req, res) => {
    try {
        console.log(req.user.email)
        const email = req.user.email;
        const schedules = await dbModule.getDefaultReportList(email);
        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving schedule list');
    }
});

// 방문 스케줄 전체 조회 (Done)
router.get('/getResultReportList', dbModule.authenticateToken, async (req, res) => {
    try {
        console.log(req.user.email)
        const schedules = await dbModule.getResultReportList(req.user.email);
        res.json(schedules);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving schedule list');
    }
});

// 상담 완료시에 reportstatus 2로 바꿔주는 라우터
router.get('/visitReportDone', async (req, res) => {
  try {
    const reportId = req.query.reportId;

    if (!reportId) {
      return res.status(400).json({ message: 'reportId is required.' });
    }

    const result = await dbModule.visitReportDone(reportId);

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: `No VisitReport found with reportid ${reportId}` });
    }

    res.status(200).json({ message: `VisitReport ${reportId} marked as done.` });
  } catch (error) {
    console.error('Error updating VisitReport status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Target
router.get('/targets/:id', dbModule.authenticateToken, async (req, res) => {
    const targetId = req.params.id;

    try {
        // 대상자 기본 정보 가져오기
        const [targetRows] = await pool.query(
            'SELECT * FROM Target WHERE id = ?',
            [targetId]
        );

        if (targetRows.length === 0) {
            return res.status(404).json({ message: 'Target not found' });
        }

        const target = targetRows[0];

        // 방문 기록 가져오기
        const [visitRows] = await pool.query(
            'SELECT visit_date, abstract FROM LastVisit WHERE target_id = ? ORDER BY visit_date DESC',
            [targetId]
        );

        // 응답 조립 (하드코딩 포맷 적용)
        const response = {
            targetid: target.targetid,
            targetname: target.targetname,
            visittime: `${(target.visittime.getHours() % 12) || 12}:${String(target.visittime.getMinutes()).padStart(2, '0')} ${target.visittime.getHours() >= 12 ? 'PM' : 'AM'}`,
            targetcallnum: target.targetcallnum,
            address1: target.address1,
            address2: target.address2,
            lastvisit: visitRows.map(visit => {
                const d = new Date(visit.visit_date);
                return {
                    date: `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`,
                    abstract: visit.abstract
                };
            })
        };

        res.json(response);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving target information');
    }
});

//Target Visit Abstract

// 상담 항목 요약/자세히 JSON 조회
router.get('/getVisitDetails/:id', dbModule.authenticateToken, async (req, res) => {
    const reportid = req.params.id;

    try {
        const visitData = await dbModule.getVisitDetails(reportid);

        if (!visitData) {
            return res.status(404).json({ message: 'No visit data found' });
        }

        res.json(visitData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving visit details');
    }
});


// USER ROUTES

// 특정 유저 조회
router.get('/users', dbModule.authenticateToken, async (req, res) => {
    try {
        const user = await dbModule.getUser(req.user.email);
        res.json(user);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving user');
    }
});


// 로그인
const jwt = require('jsonwebtoken');
JWT_EXPIRES_IN ='1h'
const JWT_SECRET = "abcd";

// 기존 loginUser 호출 후
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const user = await dbModule.loginUser(email, password);

  if (!user) {
    return res.status(401).json({ status: false, message: 'Invalid email or password' });
  }

  console.log("user from login")
  console.log(user)

  // 페이로드에 필요한 최소 정보만 담기 (예: userId, role)
  const payload = { userId: user.user_id, email: user.email };
  const token = jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });

  console.log(JWT_SECRET, payload, token)

  res.status(200).json({
    status: true,
    message: 'Login successful !!!',
    token,            // 클라이언트에서 이 토큰을 저장해두고
    user,             // 비밀번호는 이미 삭제된 상태
  });
});

// 이메일 중복 확인
router.post('/email_check', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ status: false, msg: 'Email is required' });
  }

  try {
    const isDuplicate = await dbModule.isEmailDuplicate(email);
    res.status(200).json({
      status: true,
      msg: isDuplicate ? '이메일이 중복됩니다.' : '사용가능한 이메일 입니다.'
    });
  } catch (error) {
    console.error('Error checking email duplication:', error);
    res.status(500).send('Internal server error');
  }
});


// 유저 생성 (회원가입)
router.post('/register', async (req, res) => {
    const { name, phoneNumber, email, birthdate, gender, permission, password } = req.body;

    try {

        // DB에 유저 생성
        const result = await dbModule.createUser(
            name,
            phoneNumber,
            email,
            birthdate,
            gender,
            permission,
            password
        );

        res.status(201).json({ status : true, message: 'User registered successfully', user: result });
    } catch (error) {
        console.error('Error during user registration:', error);
        res.status(500).json({ status : false, message: "회원가입에 실패했습니다.", user: null });
    }
});

// 유저 정보 업데이트
router.put('/users/:userId', async (req, res) => {
    const { name, phoneNumber, email, birthdate, gender, permission } = req.body;
    try {
        const result = await dbModule.updateUser(req.params.userId, name, phoneNumber, email, birthdate, gender, permission);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating user');
    }
});

// 유저 삭제
router.delete('/users/:userId', async (req, res) => {
    try {
        const result = await dbModule.deleteUser(req.params.userId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting user');
    }
});

// CLIENT ROUTES

// 특정 클라이언트 조회
router.get('/clients/:clientId', async (req, res) => {
    try {
        const client = await dbModule.getClient(req.params.clientId);
        res.json(client);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving client');
    }
});

// 클라이언트 생성
router.post('/clients', async (req, res) => {
    const { name, address, phoneNumber, status } = req.body;
    try {
        const result = await dbModule.createClient(name, address, phoneNumber, status);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating client');
    }
});

// 클라이언트 정보 업데이트
router.put('/clients/:clientId', async (req, res) => {
    const { name, address, phoneNumber, status } = req.body;
    try {
        const result = await dbModule.updateClient(req.params.clientId, name, address, phoneNumber, status);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating client');
    }
});

// 클라이언트 삭제
router.delete('/clients/:clientId', async (req, res) => {
    try {
        const result = await dbModule.deleteClient(req.params.clientId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting client');
    }
});

// POLICY INFO ROUTES

// 특정 정책 정보 조회
router.get('/policies/:policyId', async (req, res) => {
    try {
        const policy = await dbModule.getPolicyInfo(req.params.policyId);
        res.json(policy);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving policy information');
    }
});

// 정책 정보 생성
router.post('/policies', async (req, res) => {
    const { age, region, assets, annualIncome, vulnerableGroup, description } = req.body;
    try {
        const result = await dbModule.createPolicyInfo(age, region, assets, annualIncome, vulnerableGroup, description);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating policy information');
    }
});

// 정책 정보 업데이트
router.put('/policies/:policyId', async (req, res) => {
    const { age, region, assets, annualIncome, vulnerableGroup, description } = req.body;
    try {
        const result = await dbModule.updatePolicyInfo(req.params.policyId, age, region, assets, annualIncome, vulnerableGroup, description);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating policy information');
    }
});

// 정책 정보 삭제
router.delete('/policies/:policyId', async (req, res) => {
    try {
        const result = await dbModule.deletePolicyInfo(req.params.policyId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting policy information');
    }
});

// CHECKLIST ROUTES
//json list type transformation
function transformChecklist(checklist) {
    return checklist.map(item => {
        // answer1 ~ answer4을 answers 배열로 변환
        const answers = [item.answer1, item.answer2, item.answer3, item.answer4];

        // 새로운 구조로 리턴
        return {
            checklist_id: item.checklist_id,
            comment_id: item.comment_id,
            consultant_id: item.consultant_id,
            client_id: item.client_id,
            data: item.data,
            question: item.question,
            answers: answers,
            selected_answer: item.selected_answer
        };
    });
}

// 특정 체크리스트 조회
/*
router.get('/checklists/:checklistId', async (req, res) => {
    try {
        const checklist = await dbModule.getChecklist(req.params.checklistId);
        // res.json(checklist);
        res.json(transformChecklist(checklist));
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving checklist');
    }
});
 */

// 특정 사용자의 체크리스트 조회
router.get('/checklists/:userId', async (req, res) => {
    try {
        // getUserChecklist 함수 호출하여 특정 userId에 해당하는 체크리스트 가져오기
        //const checklist = await dbModule.getUserChecklist(req.params.userId);
        const checklist = await dbModule.getChecklist(req.params.userId);

        // 결과가 없을 경우 404 반환
        if (!checklist) {
            return res.status(404).send('Checklist not found for this user');
        }

        // 체크리스트를 JSON 형태로 반환
        res.json(checklist);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving user checklist');
    }
});


// 체크리스트 생성
router.post('/checklists', async (req, res) => {
    const { commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer } = req.body;
    try {
        const result = await dbModule.createChecklist(commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating checklist');
    }
});

// 체크리스트 업데이트
router.put('/checklists/:checklistId', async (req, res) => {
    const { commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer } = req.body;
    try {
        const result = await dbModule.updateChecklist(req.params.checklistId, commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating checklist');
    }
});

// 특정 checklist의 selected_answer를 업데이트하는 라우터
router.put('/checklists/:checklistId/answer', async (req, res) => {
    const { commentId, consultantId, clientId, selectedAnswer } = req.body;
    const checklistId = req.params.checklistId;

    try {
        const result = await dbModule.updateSelectedAnswer(commentId, consultantId, clientId, checklistId, selectedAnswer);
        
        // 업데이트된 행이 없을 경우
        if (result.affectedRows === 0) {
            res.status(404).send('Checklist entry not found or no update needed');
        } else {
            res.json({ message: 'Selected answer updated successfully', result });
        }
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating selected answer');
    }
});

// 체크리스트 삭제
router.delete('/checklists/:checklistId', async (req, res) => {
    try {
        const result = await dbModule.deleteChecklist(req.params.checklistId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting checklist');
    }
});

// CONSULTATION COMMENT ROUTES

// 특정 상담 코멘트 조회
router.get('/comments/:commentId', async (req, res) => {
    try {
        const comment = await dbModule.getConsultationComment(req.params.commentId);
        res.json(comment);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving consultation comment');
    }
});

// 상담 코멘트 생성
router.post('/comments', async (req, res) => {
    const { consultantId, clientId, comment, dateWritten } = req.body;
    try {
        const result = await dbModule.createConsultationComment(consultantId, clientId, comment, dateWritten);
        res.status(201).json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error creating consultation comment');
    }
});

// 상담 코멘트 업데이트
router.put('/comments/:commentId', async (req, res) => {
    const { consultantId, clientId, comment, dateWritten } = req.body;
    try {
        const result = await dbModule.updateConsultationComment(req.params.commentId, consultantId, clientId, comment, dateWritten);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating consultation comment');
    }
});

// 상담 코멘트 삭제
router.delete('/comments/:commentId', async (req, res) => {
    try {
        const result = await dbModule.deleteConsultationComment(req.params.commentId);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error deleting consultation comment');
    }
});

// ========= Questions List =========
// 특정 question_id에 해당하는 질문 리스트를 가져오는 라우터
router.get('/questions/:questionId/:categoryId', async (req, res) => {
    const questionId = req.params.questionId;
    // what is selection?
    const categoryId = req.params.categoryId;
    
    console.log(categoryId);

    try {
        const result = await dbModule.updateChecklistIdForUser(questionId, categoryId);

        if (!result.success) {
            return res.status(404).send(result.message);
        }

    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating checklist ID');
    }

    try {
        // Have to Change.. Update Question Id using mathmethics cal.. It doesn't make sense.
        console.log("questionId, categoryId : ", questionId, categoryId)
        console.log("cal question Id : ",4 * (parseInt(questionId, 10) - 1) + parseInt(categoryId, 10))
        const result = await dbModule.updateUserQuestionSet(questionId, 4 * (parseInt(questionId, 10) - 1) + parseInt(categoryId, 10));
        
        if (!result.success) {
            return res.status(404).send(result.message);
        }
        
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating checklist ID');
    }

    try {
        const questionData = await dbModule.getUserQuestions(questionId);
        //const questionData = await dbModule.getQuestionsById(questionId);
        
        if (!questionData) {
            return res.status(404).json({ message: 'Question not found' });
        }
        
        res.json(questionData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving questions' });
    }

});

// 특정 사용자의 checklist_id 업데이트
router.put('/temp-checklist/user/:userId', async (req, res) => {
    const userId = req.params.userId;
    const newChecklistId = req.body.newChecklistId;

    try {
        const result = await dbModule.updateChecklistIdForUser(userId, newChecklistId);

        if (!result.success) {
            return res.status(404).send(result.message);
        }

        res.send(result.message);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error updating checklist ID');
    }
});

// ========= Questions List =========
// 특정 question_id에 해당하는 질문 리스트를 가져오는 라우터
router.get('/welfare-policies/:policyId', async (req, res) => {
    const policyId = req.params.policyId;
    
    try {
        // Actually policyId => reportId
        const policyData = await dbModule.getWelfarePolicyById(policyId);
        
        if (!policyData) {
            return res.status(404).json({ message: 'poclicy not found' });
        }
        
        res.json(policyData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving poclicy' });
    }
});

// ✅ 모든 복지 정책을 가져오는 라우터
router.get('/welfare-policies', async (req, res) => {
    try {
        const allPolicies = await dbModule.getAllWelfarePolicies();
        
        if (allPolicies.length === 0) {
            return res.status(404).json({ message: 'No policies found' });
        }
        
        res.json(allPolicies);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving policies' });
    }
});

// 특정 id에 해당하는 복지정책을 AI 결과에 따라 업데이트 하는 라우터
router.put('/welfare-policies/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { policy } = req.body; // JSON 배열 형식의 policy 데이터

    if (!policy || !Array.isArray(policy)) {
        return res.status(400).json({ message: "Invalid policy data. Must be an array." });
    }

    try {
        const result = await dbModule.updatePolicyForUser(userId, policy);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating policy data." });
    }
});


// 📌 2️⃣ 특정 userId의 처리완료된 복지 데이터를 가져오는 API
router.get('/welfare-datas/:userId', async (req, res) => {
    const userId = req.params.userId;

    try {
        const welfareData = await dbModule.getWelfareDataById(userId);

        if (!welfareData) {
            return res.status(404).json({ message: "Welfare data not found for the given user ID." });
        }

        res.json(welfareData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error retrieving welfare data." });
    }
});

// 특정 id에 해당하는 복지정책을 AI 결과에 따라 업데이트 하는 라우터
router.put('/welfare-datas/:userId', async (req, res) => {
    const userId = req.params.userId;
    const { policy } = req.body; // JSON 배열 형식의 policy 데이터

    if (!policy || !Array.isArray(policy)) {
        return res.status(400).json({ message: "Invalid policy data. Must be an array." });
    }

    try {
        const result = await dbModule.updatePolicyForUser(userId, policy);
        res.json(result);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: "Error updating policy data." });
    }
});


// ========= Questions List =========
// 특정 question_id에 해당하는 질문 리스트를 가져오는 라우터
router.get('/conversation-summary/:summaryId', async (req, res) => {
    const SummaryId = req.params.summaryId;
    
    try {
        const AbstractData = await dbModule.getConversationLogById(SummaryId);
        
        if (!AbstractData) {
            return res.status(404).json({ message: 'AbstractData not found' });
        }
        
        res.json(AbstractData);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error retrieving AbstractData' });
    }
});

//////////////////////////////////////////////////////////////////
// 양천구청 처리
// STT 파일 업로드 요청 (제목만 받아서 저장 시작 신호)
router.post('/yangchun_stt_upload', dbModule.authenticateToken, async (req, res) => {
  const { stt_file_name } = req.body;

  if (!stt_file_name || stt_file_name.trim() === '') {
    return res.status(400).json({ status: false, msg: 'stt_file_name은 필수입니다.' });
  }

  try {
    // DB에 저장 시작 이력 기록 또는 준비 작업 (옵션)
    console.log('/yangchun_stt_upload')
    const reportid = await dbModule.prepareSttFile(stt_file_name, req.user.email); // JWT 토큰에서 유저 정보 추출 가정

    res.status(200).json({
      status: true,
      reportid : reportid,
      msg: 'stt_file 저장이 시작됩니다.'
    });
  } catch (error) {
    console.error('Error initiating STT file save:', error);
    res.status(500).json({ status: false, msg: '서버 에러로 STT 저장을 시작할 수 없습니다.' });
  }
});

// 정보공개청구 기능 - websocket room 연결과 함께 진행 -> client는 reportid를 받아서 수동으로 ws room에 연결
router.post('/yangchun_stt_upload_ws_client', dbModule.authenticateToken, async (req, res) => {
  const { stt_file_name } = req.body;

  if (!stt_file_name || stt_file_name.trim() === '') {
    return res.status(400).json({ status: false, msg: 'stt_file_name은 필수입니다.' });
  }

  try {
    // DB에 저장 시작 이력 기록 또는 준비 작업 (옵션)
    console.log('/yangchun_stt_upload_ws_client')
    const reportid = await dbModule.prepareSttFile(stt_file_name, req.user.email); // JWT 토큰에서 유저 정보 추출 가정
    console.log("yangchun_stt_upload_ws_client", reportid)
    /////////////// ws 연결 - 앱웹 통신 /////////////// 

    // 방 이름 = reportid, 닉네임 = 유저 이메일
    WSMoudle.ensureWs(String(reportid), WS_SERVER, req.user.email);
    /////////////// ws 연결 - 앱웹 통신 /////////////// 
    // 여기서 실제 외부 WS(room=reportid)에 접속

    res.status(200).json({
      status: true,
      reportid : reportid,
      msg: 'stt_file 저장이 시작됩니다.'
    });
  } catch (error) {
    console.error('Error initiating STT file save:', error);
    res.status(500).json({ status: false, msg: '서버 에러로 STT 저장을 시작할 수 없습니다.' });
  }
});

router.post('/yangchun_stt_upload_policy', async (req, res) => {
  const stt_file_name = req.body.stt_file_name;
  const email = req.body.user_email;

  if (!stt_file_name || stt_file_name.trim() === '') {
    return res.status(400).json({ status: false, msg: 'stt_file_name은 필수입니다.' });
  }

  try {
    console.log('yangchun_stt_upload_policy!!! infromation open request')
    const reportid = await dbModule.prepareSttFile(stt_file_name, email);
    console.log("report id : ", reportid);

    res.status(200).json({
      status: true,
      reportid: reportid,
      msg: 'stt_file 저장이 시작됩니다.',
    });
  } catch (error) {
    console.error('Error initiating STT file save:', error);
    res.status(500).json({ status: false, msg: '서버 에러로 STT 저장을 시작할 수 없습니다.' });
  }
});

/**
 * POST /db/yangchun_idcard_info_upload_edit
 * {
 *   name,
 *   birthDate,
 *   address,
 *   passport,
 *   phone,
 *   email,
 *   fax,
 *   businessNumber
 * }
 */
router.post('/yangchun_idcard_info_upload_edit', dbModule.authenticateToken, async (req, res) => {
  // req.body 전체가 applicantData 객체입니다
  const {
    reportid,
    name,
    birthDate,
    address,
    passport,
    phone,
    email,
    gender,
    fax,
    businessNumber
  } = req.body;

  // 필수값 검증 예시
  if (!name || !birthDate || !address) {
    return res.status(400).json({
      success: false,
      message: 'name, birthDate, address 필드는 반드시 필요합니다.'
    });
  }

  try {
    // TODO: DB 저장 로직 예시
    // const newRecord = await YourModel.create({ name, birthDate, address, passport, phone, email, fax, businessNumber });
    console.log('yangchun_idcard_info_upload_edit :')
    console.log(reportid)
    console.log(name, birthDate, address, passport, phone, email, fax, businessNumber, gender)

    //////////////////// wsHub 이용하여 Msg 전달 ////////////////////
    // --- wsHub 이용하여 Msg 전달 ---
    // const nickname = req.user?.email || "null_email";
    // // 해당 reportid 룸으로 접속(없으면 연결)
    // // WSMoudle.ensureWs(String(reportid), WS_SERVER, nickname);

    // // 소켓 획득 후 메시지 emit
    // const socket = WSMoudle.getSocket(String(reportid));
    // if (socket && socket.connected) {
    //   socket.emit("room:message", {
    //     room: String(reportid),
    //     msg: {
    //       type: "idcard_info_uploaded_edit",
    //       by: nickname,
    //       at: Date.now(),
    //       payload: { name, birthDate, address, passport, phone, email, fax, businessNumber }
    //     }
    //   });
    // } else {
    //   // 연결 준비 중일 수 있음 — 필요하면 큐잉/재시도 로직 추가 가능
    //   console.warn(`[WS] socket not ready for reportid=${reportid}`);
    // }
    //////////////////// wsHub 이용하여 Msg 전달 ////////////////////
    const result = await dbModule.insertIdCardInfo({
          reportid,
          name,
          birthDate,
          address,
          passport,
          phone,
          email,
          fax,
          businessNumber,
          gender
        });
    return res.status(201).json({
      success: true,
      message: '신청 정보가 정상적으로 저장되었습니다.',
      data: result
    });
  } catch (err) {
    console.error('ID 카드 정보 저장 오류:', err);
    return res.status(500).json({
      success: false,
      message: '서버 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * GET /db/yangchun_get_gov_ResultList
 * Header:
 *   Authorization: Bearer <token>
 * Response:
 * [
 *   {
 *     reportid: 1,
 *     date: "25.07.01",
 *     time: "09:05",
 *     type: "정보공개청구",
 *     content: "목1동 CCTV 요청",
 *     file: "../../..../.pdf"
 *   },
 *   ...
 * ]
 */
router.get('/yangchun_get_gov_ResultList', async (req, res) => {
  try {
    // DB 조회 예시
    // 추후 이메일 받아 수정
    // const resultList = await dbModule.getReportsByEmail();

    const resultList = await dbModule.getReportInfoHistory();
    console.log(resultList)
    // const resultList = [
    //   {
    //     reportid: 1,
    //     date: "25.07.01",
    //     time: "09:05",
    //     type: "정보공개청구",
    //     content: "목1동 CCTV 요청",
    //     file: "test.txt"
    //   },
    //   {
    //     reportid: 1,
    //     date: "25.07.01",
    //     time: "09:05",
    //     type: "정보공개청구",
    //     content: "목1동 CCTV 요청",
    //     file: "test.txt"
    //   }
    //   // ...실제 DB 데이터로 대체
    // ];

    return res.status(200).json(resultList);
  } catch (err) {
    console.error('정부 요청 결과 리스트 조회 오류:', err);
    return res.status(500).json({
      status: false,
      msg: '리스트 조회 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /db/yangchun_idcard_info_upload
 * {
 *   phone,
 *   email,
 *   fax,
 *   businessNumber
 * }
 */
router.post('/yangchun_idcard_info_upload', dbModule.authenticateToken, async (req, res) => {
  // req.body 전체가 applicantData 객체입니다
  const {
    phone,
    email,
    fax,
    businessNumber
  } = req.body;

  try {
    // TODO: DB 저장 로직 예시
    // const newRecord = await YourModel.create({ name, birthDate, address, passport, phone, email, fax, businessNumber });
    console.log('yangchun_idcard_info_upload 신청 정보가 정상적으로 저장되었습니다.')
    console.log(phone, email, fax, businessNumber)

    //////////////////// wsHub 이용하여 Msg 전달 ////////////////////
    // --- wsHub 이용하여 Msg 전달 ---
    // const nickname = req.user?.email || "null_email";
    // // 해당 reportid 룸으로 접속(없으면 연결)
    // WSMoudle.ensureWs(String(reportid), WS_SERVER, nickname);

    // // 소켓 획득 후 메시지 emit
    // const socket = WSMoudle.getSocket(String(reportid));
    // if (socket && socket.connected) {
    //   socket.emit("room:message", {
    //     room: String(reportid),
    //     msg: {
    //       type: "idcard_info_uploaded",
    //       by: nickname,
    //       at: Date.now(),
    //       payload: {  phone, email, fax, businessNumber }
    //     }
    //   });
    // } else {
    //   // 연결 준비 중일 수 있음 — 필요하면 큐잉/재시도 로직 추가 가능
    //   console.warn(`[WS] socket not ready for reportid=${reportid}`);
    // }
    //////////////////// wsHub 이용하여 Msg 전달 ////////////////////

    return res.status(201).json({
      success: true,
      message: '신청 정보가 정상적으로 저장되었습니다.',
      data: { phone, email, fax, businessNumber }
    });
  } catch (err) {
    console.error('ID 카드 정보 저장 오류:', err);
    return res.status(500).json({
      success: false,
      message: '서버 처리 중 오류가 발생했습니다.'
    });
  }
});

/**
 * POST /db/yangchun_policy_check_upload
 * {
 *   reportid: 1,
 *   items: [
 *     {
 *       view: 0,
 *       copy: 1,
 *       electronic: 0,
 *       "copy-print": 1,
 *       other: 0
 *     },
 *     {
 *       direct: 0,
 *       mail: 1,
 *       fax: 0,
 *       notification: 0,
 *       email: 1
 *     }
 *   ]
 * }
 */
router.post('/yangchun_receive_method_checklist', dbModule.authenticateToken, async (req, res) => {
  const { items } = req.body;

  try {
    // 예시: DB 저장 로직
    // items 배열을 순회하며 각각 저장
    // await Promise.all(items.map(item => YourModel.create({ reportid, ...item })));

    // console.log(`📌 reportid ${reportid} 의 정책 체크 데이터가 저장되었습니다.`);
    console.log(items);

    return res.status(201).json({
      success: true,
      message: '정책 체크 데이터가 정상적으로 저장되었습니다.',
      data: { items }
    });
  } catch (err) {
    console.error('정책 체크 데이터 저장 오류:', err);
    return res.status(500).json({
      success: false,
      message: '서버 처리 중 오류가 발생했습니다.'
    });
  }
});


/**
 * POST /db/yangchun_policy_check_upload
 * {
 *   reportid: 1,
 *   items: [
 *     {
 *       view: 0,
 *       copy: 1,
 *       electronic: 0,
 *       "copy-print": 1,
 *       other: 0
 *     },
 *     {
 *       direct: 0,
 *       mail: 1,
 *       fax: 0,
 *       notification: 0,
 *       email: 1
 *     }
 *   ]
 * }
 */
// 라우터
router.post('/yangchun_receive_method_checklist_edit', dbModule.authenticateToken, async (req, res) => {
  const { reportid, items } = req.body;
  console.log('yangchun_receive_method_checklist_edit', reportid, items);

  if (!Number.isInteger(reportid)) {
    return res.status(400).json({ success: false, message: 'reportid must be an integer' });
  }
  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ success: false, message: 'items must be a non-empty array' });
  }

  // 허용 컬럼
  const ALLOWED = ['view','copy','electronic','copy_print','other','direct','mail','fax','notification','email', 'etcContent', 'emailContent'];

  // 타입 분리
  const STRING_FIELDS = ['etcContent', 'emailContent'];
  const BOOL_FIELDS   = ALLOWED.filter(k => !STRING_FIELDS.includes(k));

  // 0/1 정규화
  const to01 = (v) => {
    if (v === null || v === undefined) return null;
    if (typeof v === 'boolean') return v ? 1 : 0;
    if (typeof v === 'number')  return v ? 1 : 0;
    if (typeof v === 'string') {
      const s = v.trim().toLowerCase();
      if (s === '' ) return null;         // 빈 문자열은 null 취급(원하면 0으로 바꿔도 됨)
      if (s === '1' || s === 'true') return 1;
      if (s === '0' || s === 'false') return 0;
      // 그 외 문자열은 불리언 필드에는 부적합 → null
      return null;
    }
    return null;
  };

  // copy-print → copy_print 매핑 포함
  const normalize = (obj = {}) => {
    const mapped = {};
    for (const [rawK, v] of Object.entries(obj)) {
      const k = (rawK === 'copy-print') ? 'copy_print' : rawK;
      if (!ALLOWED.includes(k)) continue;

      if (STRING_FIELDS.includes(k)) {
        // 문자열 필드: 문자열로 보존
        if (v === null || v === undefined) mapped[k] = null;
        else mapped[k] = String(v); // 공백/빈문자열 그대로 허용
      } else {
        // 불리언(0/1) 필드
        mapped[k] = to01(v);
      }
    }
    // 누락 키 null 채움
    for (const k of ALLOWED) if (!(k in mapped)) mapped[k] = null;
    return mapped;
  };

  // items 여러 개 → 한 행으로 OR/덮어쓰기 머지
  const merged = Object.fromEntries(ALLOWED.map(k => [k, null]));

  for (const it of items.map(normalize)) {
    for (const k of ALLOWED) {
      const v = it[k];
      if (v === null || v === undefined) continue;

      if (STRING_FIELDS.includes(k)) {
        // 문자열: 마지막 값으로 덮어쓰기 (빈 문자열도 허용)
        merged[k] = v;
      } else {
        // 불리언: OR 의미로 max
        merged[k] = (merged[k] === null) ? v : Math.max(merged[k], v);
      }
    }
  }

  console.log('merged : ', merged);

  try {
    const result = await dbModule.insertYangchunReceiveMethodChecklist(reportid, merged);
    return res.status(201).json({
      success: true,
      message: '체크리스트 저장 완료',
      data: { reportid, merged }
    });
  } catch (err) {
    console.error('DB 저장 오류:', err);
    return res.status(500).json({ success: false, message: '서버 처리 중 오류' });
  }
});



/**
 * POST /db/yangchun_stt_abstract_edit
 * {
 *   reportid: 1,
 *   items: [
 *     {
 *       subject: "건강",
 *       abstract: "소화관련 불편",
 *       detail: "자세한 ~~내용"
 *     }
 *   ]
 * }
 */
router.post('/yangchun_stt_abstract_edit', dbModule.authenticateToken, async (req, res) => {
  const { reportid, items } = req.body;

  // 필수값 검증
  if (!reportid || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({
      status: false,
      msg: 'reportid와 최소 1개의 items 항목이 필요합니다.'
    });
  }

  try {
    // DB 저장 예시
    // await dbModule.editAIAbstractVisitCategory(reportid, items);

    console.log(`📌 reportid ${reportid} 요약/수정 데이터 저장`);
    console.log(items);

    return res.status(200).json({
      status: true,
      msg: '요약결과 수정 전송에 성공했습니다.'
    });
  } catch (err) {
    console.error('요약결과 수정 처리 오류:', err);
    return res.status(500).json({
      status: false,
      msg: '전송에 실패했습니다.'
    });
  }
});

// STT 처리 결과 목록 조회
router.get('/yangchun_getResultList', dbModule.authenticateToken, async (req, res) => {
  const email = req.user.email;

  try {
    const resultList = await dbModule.getYangchunResultList(email);
    console.log(resultList)
    res.status(200).json(resultList);
  } catch (error) {
    console.error('Error fetching Yangchun result list:', error);
    res.status(500).json({ status: false, msg: 'Internal server error' });
  }
});

// STT 원본 텍스트
router.get('/getYangChunConverstationSTTtxt/:reportid', async (req, res) => {
    const reportid = parseInt(req.params.reportid);
    console.log("reportid in getYangChunConverstationSTTtxt Using ", reportid)
    const result = await dbModule.getYangchunSTTTranscriptFile(reportid);

    console.log("getYangChunConverstationSTTtxt", result)
    if (!result.status) {
        return res.status(404).json({
            status: false,
            msg: result.msg,
        });
    }

    return res.sendFile(path.resolve(result.path));
});

// STT 요약 텍스트 상담 항목 요약/자세히 JSON 조회
router.get('/yangchun_stt_abstract/:id', dbModule.authenticateToken, async (req, res) => {
    const reportid = req.params.id;
    const email = req.user.email;
    console.log("reportid email:", reportid, email)

    if (!email) {
        return res.status(400).json({ message: 'Email parameter is required' });
    }

    try {
        const visitData = await dbModule.getYangchunsttAbstract(reportid, email);
        if (!visitData) {
            return res.status(404).json({ message: 'No visit data found' });
        }

        res.json(visitData);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error retrieving visit details');
    }
});

// STT 경로 업데이트 API
router.patch('/update_stt_path', async (req, res) => {
    const { reportid, email, newPath } = req.body;

    if (!reportid || !email || !newPath) {
        return res.status(400).json({ status: false, msg: 'reportid, email, newPath는 모두 필수입니다.' });
    }

    try {
        const result = await dbModule.updateSttTranscriptPath(reportid, email, newPath);
        console.log(result)
        return res.json(result);
    } catch (error) {
        console.error('Error updating stt_transcript_path:', error);
        return res.status(500).json({ status: false, msg: '서버 오류로 업데이트에 실패했습니다.' });
    }
});


router.get('/get_transcript_path', async (req, res) => {
  const reportid = req.params.reportid;
  const email = req.query.email;

  if (!email) {
    return res.status(400).json({ error: 'Email query parameter is required' });
  }

  try {
    const path = await dbModule.getTranscriptPath(reportid, email);

    if (!path) {
      return res.status(404).json({ message: 'Transcript path not found for the given reportid and email' });
    }

    return res.json({ reportid: parseInt(reportid), email, transcript_path: path });
  } catch (error) {
    console.error('❌ Error retrieving transcript path:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// 요약본 DB에 업데이트
router.post('/update_visit_category', async (req, res) => {
  const { reportid, email, txt_file } = req.body;

  if (!reportid || !email || !txt_file) {
    return res.status(400).json({ error: 'reportid, email, txt_file are required' });
  }

  try {
    const result = await dbModule.updateVisitCategory(reportid, email, txt_file);
    res.status(200).json({ message: 'VisitCategory updated', result });
  } catch (err) {
    res.status(500).json({ error: 'Database update failed' });
  }
});

//////////////////////////// hwp funcs /////////////////////

// GET /generate-hwp/:reportid
router.get("/generate-hwp/:reportid", async (req, res) => {
  const { reportid } = req.params;

  try {
    // TODO: DB 조회 or 매핑 로직 (여기서는 예시로 하드코딩)
    // const imagePath = `/new_data/upload_sign/reportID-${reportid}-imgfile-1755012875902-964112609.png`;

    // const applicantData = {
    //   name: "이준학",
    //   birthDate: "2000.11.03",
    //   address: "대전시 서구 계룡로 279번길 11 205호",
    //   passport: "MQ123456",
    //   phone: "010-6557-0010",
    //   email: "junhak1103@Naver.com",
    //   fax: "02-3421-1720",
    //   businessNumber: "12345-12525",
    //   gender: "남",
    // };

    // const summaryData = {
    //   content: `[데이터 청구] ReportID ${reportid} 정보공개청구`,
    //   isPublic: true,
    // };

    // const methodData = {
    //   disclosureMethods: [0, 1, 1, 0, 0],
    //   receiveMethods: [1, 0, 0, 0, 1],
    //   otherDisclosureMethod: "이메일로 보내주세요",
    //   otherReceiveMethod: "기발한 방법으로 보내주세요",
    // };

    // const feeData = {
    //   exemptionType: "exempt",
    //   exemptionReason: "연구목적 또는 행정감시",
    // };
////////////////////////////////////////////////////////////////
    const { applicantData, summaryData, methodData, feeData, imagePath } =
      await dbModule.buildPayloadFromDB(reportid);


    const file_name = `/new_data/upload/hwp/open_information/report_open_information${reportid}.hwp`;
    console.log("postAndDownloadHWP call before", applicantData, summaryData, methodData, feeData, imagePath)
    await postAndDownloadHWP(imagePath, applicantData, summaryData, methodData, feeData, file_name);

    // history를 위한 file_path 업데이트
    await dbModule.updateReportFilePath(reportid, file_name)

    // 성공 응답
    res.json({
      success: true,
      message: `✅ HWP 파일 생성 완료: ${file_name}`,
      file: file_name,
    });
  } catch (err) {
    console.error("❌ 요청 실패 in gnerate-hwp:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});


// GET /generate-hwp-license/:reportid
router.get("/generate-hwp-license/:reportid", async (req, res) => {
  const { reportid } = req.params;

  try {
    // TODO: DB 조회 or 매핑 로직 (여기서는 예시로 하드코딩)
    // const imagePath1 = `/home/BackEnd/URIProcess/new_data/upload_sign/reportID-1294-imgfile-1755354291692-181712213.png`;
    // const imagePath2 = `/home/BackEnd/URIProcess/new_data/upload_sign/reportID-1294-imgfile-1755354291692-181712213.png`;

    // const licenseData = {
    //   qualificationType : "~~등급", 
    //   registrationNumber : "124124",
    //   licenseNumber : "01-123-123", 
    //   issueDate : "2024-3-3",
    //   name : "홍길동", 
    //   residentNumber : "001234-12412414",
    //   address : "대전시 서구 ~~", 
    //   phone : "010-1234-5678", 
    //   licenseType : "테스트타입", 
    //   isreissue : false,
    //   reissueReason : null
    // }
////////////////////////////////////////////////////////////////
    const { licenseData, imagePaths } =
      await dbModule.buildConstructionPayloadFromDB(reportid);

    const file_name = `/new_data/upload/hwp/construction-license/report_construction-license-${reportid}.hwp`;
    console.log("postAndDownloadHWPLicense call before", licenseData, imagePaths)
    await postAndDownloadHWPLicense(imagePaths, licenseData, file_name);

    // history를 위한 file_path 업데이트
    await dbModule.updateReportFilePath(reportid, file_name)

    // 성공 응답
    res.json({
      success: true,
      message: `✅ HWP 파일 생성 완료: ${file_name}`,
      file: file_name,
    });
  } catch (err) {
    console.error("❌ 요청 실패 in generate-hwp-license:", err.message);
    res.status(500).json({
      success: false,
      error: err.message,
    });
  }
});

// POST /db/yangchun_insert_gov_ResultList
router.post("/yangchun_insert_gov_ResultList", dbModule.authenticateToken, async (req, res) => {
  const { reportid, request_type, content } = req.body;
  const email = req.user.email;

  try {
    console.log("📩 입력값:", reportid, request_type, content);
    await dbModule.updateReportInfo(reportid, request_type, content);
    console.log("📩 처리타입!!:",request_type);

    let url = "";
    if (request_type === "건설기계조종사면허증(재)발급") {
      url = `https://safe-hi.xyz/db/generate-hwp-license/${reportid}`;
    } else if (request_type === "정보공개청구") {
      url = `https://safe-hi.xyz/db/generate-hwp/${reportid}`;
    } 

    console.log("📤 호출 URL:", url);
    // const url = `https://safe-hi.xyz/db/generate-hwp/${reportid}`;
    await axios.get(url);

    res.status(200).json({
      status: true,
      msg: "최종 레포트 전송에 성공했습니다."
    });
  } catch (err) {
    console.error("❌ DB 저장 실패:", err.message);
    res.status(500).json({
      status: false,
      msg: "DB 저장 중 오류 발생"
    });
  }
});

module.exports = router;
