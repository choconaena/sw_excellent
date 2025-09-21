const pool = require('./funcs/db_connection.js');
const bcrypt = require('bcrypt'); // 비밀번호 해싱용
// file upload 용
const fs = require('fs');
const path = require('path');
// img 저장용
const multer = require('multer');

// db_api.js
function runDbFunction() {
    console.log('this is DB module');
}

//upload imgs

const FormData = require('form-data');
// 동적 저장 경로 설정
function getMulterStorage(destPathCallback) {
    return multer.diskStorage({
    destination: async (req, file, cb) => {
        try {
        const reportid = req.body.reportid;

        // DB에서 visittime 조회
        const [rows] = await pool.query(
            'SELECT visittime FROM VisitReport WHERE reportid = ?',
            [reportid]
        );

        if (rows.length === 0) return cb(new Error('Invalid reportid'));

        const visittime = rows[0].visittime; // "2025-04-03 10:00:00"
        const trimmedVisittime = visittime.substring(0, 16); // "2025-04-03 10:00"
        const formattedVisittime = trimmedVisittime.replace(/[: ]/g, '-'); // "2025-04-03-10-00"
        
        console.log("reportid", reportid)
        console.log("visittime", visittime)
        console.log("trimmedVisittime", trimmedVisittime)
        console.log("formattedVisittime", formattedVisittime)

        const folderName = `${formattedVisittime}_reportid_${reportid}`;
        const basePath = path.resolve(__dirname, 'uploaded_data', 'visits');
        const uploadPath = path.join(basePath, folderName);

        if (!fs.existsSync(uploadPath)) fs.mkdirSync(uploadPath, { recursive: true });
        
        console.log("img uploadPath in getMulterStorage! : ", uploadPath)

        destPathCallback(req, visittime); // visittime 저장
        cb(null, uploadPath);
        } catch (err) {
        cb(err);
        }
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + ext);
    }
    });
}

function makeUploadMiddleware(destPathCallback) {
    const storage = getMulterStorage(destPathCallback);
    return multer({ storage }).array('images', 10);
}

function uploadReportImages(req) {
    const reportid = req.body.reportid;
    const visittime = req.visittime;

    if (!reportid || !visittime || !req.files || req.files.length === 0) {
    return {
        status: false,
        message: 'Missing reportid, visittime, or image files'
    };
    }

    const uploadedFiles = req.files.map(file => ({
    originalname: file.originalname,
    filename: file.filename,
    path: file.path,
    mimetype: file.mimetype,
    size: file.size
    }));

    return {
    status: true,
    message: 'Images uploaded successfully',
    data: {
        reportid,
        visittime,
        files: uploadedFiles
    }
    };
}

// STT txt return
const fsPromises = require('fs/promises');

async function getSTTTranscriptFile(reportid) {
    if (!reportid) {
        return { status: false, msg: 'reportid 누락' };
    }

    try {
        const [rows] = await pool.query(
            'SELECT stt_transcript_path FROM VisitReport WHERE reportid = ?',
            [reportid]
        );

        if (rows.length === 0 || !rows[0].stt_transcript_path) {
            return { status: false, msg: '전사 파일 경로를 찾을 수 없음' };
        }

        const filePath = rows[0].stt_transcript_path;

        // 존재 확인
        await fsPromises.access(filePath);

        return {
            status: true,
            path: filePath,
        };
    } catch (err) {
        console.error('전사 파일 조회 오류:', err);
        return {
            status: false,
            msg: '파일 조회 중 오류 발생',
        };
    }
}


async function getReport(reportid) {
    if (!reportid) {
        return { status: false, msg: 'reportid 누락' };
    }

    try {
        const filePath = "/new_data/sw_excellent/BackEnd/DB/funcs/report_1_2025-04-03-10-00.docx";

        // 존재 확인
        await fsPromises.access(filePath);

        return {
            status: true,
            path: filePath,
        };
    } catch (err) {
        console.error('전사 파일 조회 오류:', err);
        return {
            status: false,
            msg: '파일 조회 중 오류 발생',
        };
    }
}


//upload report
async function uploadVisitCategoryItems(data) {
    const { reportid, items } = data;

    if (!reportid || !Array.isArray(items) || items.length === 0) {
        return {
            status: false,
            msg: 'reportid 또는 items 배열이 누락되었거나 비어 있음',
        };
    }

    const upsertQuery = `
        INSERT INTO VisitCategory (report_id, category_title, summary_text, detail_text)
        VALUES (?, ?, ?, ?)
        ON DUPLICATE KEY UPDATE
            summary_text = VALUES(summary_text),
            detail_text = VALUES(detail_text)
    `;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        for (const item of items) {
            const { subject, abstract, detail } = item;
            await connection.query(upsertQuery, [reportid, subject, abstract, detail]);
        }

        await connection.commit();
        connection.release();

        return {
            status: true,
            msg: `${items.length}개의 카테고리 항목이 삽입/업데이트되었습니다.`,
        };
    } catch (err) {
        console.error('카테고리 업로드 오류:', err);
        return {
            status: false,
            msg: 'DB 저장 중 오류 발생',
        };
    }
}


//starttime-endtime etc.. 유저로부터의 데이터 그대로 txt로 저장토록 설계
async function uploadReportDefaultInfo(data) {
    console.log(data);

    const { reportid, visittime } = data;
    if (!reportid || !visittime) {
        return {
            status: false,
            msg: 'reportid 또는 visittime이 누락되었습니다',
        };
    }

    try {
        const time = visittime.replace(/[:\s]/g, '-');
        const dirPath = path.join(__dirname, 'uploaded_data', 'visits', `${time}_reportid_${reportid}`);
        const filename = `${time}_report_${reportid}.txt`;
        const filePath = path.join(dirPath, filename);

        console.log("해당 경로에 저장합니다:", filePath);
        fs.mkdirSync(dirPath, { recursive: true });

        fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');

        return {
            status: true,
            msg: '보고서 기본 정보 저장 완료'+filePath,
        };
    } catch (err) {
        console.error('파일 저장 중 오류:', err);
        return {
            status: false,
            msg: '보고서 저장 중 오류가 발생했습니다',
        };
    }
}

async function uploadVisitDetail(data) {
    const { reportid, detail } = data;
    console.log(data);

    if (!reportid || !detail) {
        return {
            status: false,
            msg: 'Missing reportid or detail',
        };
    }

    const visitsRoot = path.join(__dirname, 'uploaded_data', 'visits');

    let visitFolders;
    try {
        visitFolders = fs.readdirSync(visitsRoot);
    } catch (err) {
        return {
            status: false,
            msg: '방문 폴더를 읽을 수 없습니다',
        };
    }

    const targetDir = visitFolders.find(dirName => dirName.includes(`reportid_${reportid}`));
    if (!targetDir) {
        return {
            status: false,
            msg: '해당 reportid 디렉토리를 찾을 수 없습니다',
        };
    }

    const dirPath = path.join(visitsRoot, targetDir);
    const filename = targetDir.replace(`reportid_`, 'report_') + `.txt`;
    const filePath = path.join(dirPath, filename);

    if (!fs.existsSync(filePath)) {
        return {
            status: false,
            msg: '파일이 존재하지 않습니다',
        };
    }

    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        const jsonData = JSON.parse(fileContent);

        jsonData.detail = detail;

        fs.writeFileSync(filePath, JSON.stringify(jsonData, null, 2), 'utf8');

        return {
            status: true,
            msg: 'detail 추가 완료'+filePath,
        };
    } catch (err) {
        return {
            status: false,
            msg: '파일 처리 중 오류 발생',
        };
    }
}
// Targets
// dbModule.js 내 예시 함수

// report info (no Visit)
async function getTodayList(email) {
  const [rows] = await pool.query(`
    SELECT 
      r.reportid,
      r.reportstatus,
      DATE_FORMAT(r.visittime, '%Y-%m-%d %H:%i') as visittime,
      s.id AS targetid,
      s.targetname,
      s.address1,
      s.address2,
      s.callnum AS targetcallnum,
      s.gender,
      s.age
    FROM VisitReport r
    JOIN Targets s ON r.targetid = s.id
    WHERE r.reportstatus = 0
      AND r.email = ?
  `, [email]);

  const formatted = rows.map(row => ({
    reportid: row.reportid,
    reportstatus: row.reportstatus,
    visittime: row.visittime,
    targetInfo: {
      targetid: row.targetid,
      targetname: row.targetname,
      address1: row.address1,
      address2: row.address2,
      targetcallnum: row.targetcallnum,
      gender: row.gender,
      age: row.age,
    }
  }));

  return formatted;
}

// report info (no Visit)
async function yangchun_get_all_report_info(reportid) {
  try {
    const [reportInfo]   = await pool.query('SELECT * FROM report_info WHERE reportid=?', [reportid]);
    const [applicantInfo]= await pool.query('SELECT * FROM applicant_info WHERE reportid=?', [reportid]);
    const [reportItems]  = await pool.query('SELECT * FROM report_items WHERE reportid=?', [reportid]);
    const [feeExemption] = await pool.query('SELECT * FROM fee_exemption WHERE reportid=?', [reportid]);
    const [reportImages] = await pool.query('SELECT * FROM report_images WHERE reportid=?', [reportid]);

    const data = {
      report_info:    reportInfo[0] || null,
      applicant_info: applicantInfo[0] || null,
      report_items:   reportItems || [],
      fee_exemption:  feeExemption[0] || null,
      report_images:  reportImages || []
    };

    // 존재 여부를 판단해야 한다면 최소 하나라도 있으면 성공 처리
    const exists = !!(data.report_info || data.applicant_info || data.report_items.length || data.fee_exemption || data.report_images.length);
    if (!exists) return { status: false, msg: 'no rows for reportid' };

    return { status: true, data };
  } catch (err) {
    console.error(err);
    return { status: false, msg: 'db error' };
  }
}

// 담당자 설정함수
async function setEmailToReport(reportid, email) {
  const [result] = await pool.query(`
    UPDATE VisitReport
    SET email = ?
    WHERE reportid = ?
  `, [email, reportid]);

  return result;
}

// 복지 대상자 추가함수
async function addTarget({
  targetname,
  address1,
  address2,
  callnum,
  gender,
  age
}) {
  // 1. 먼저 targetid 없이 insert
  const [result] = await pool.query(`
    INSERT INTO Targets (targetname, address1, address2, callnum, gender, age)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [targetname, address1, address2, callnum, gender, age]);

  const insertedId = result.insertId;

  // // 2. 그 insertId를 targetid로 다시 update
  // await pool.query(`
  //   UPDATE Targets
  //   SET targetid = ?
  //   WHERE id = ?
  // `, [insertedId, insertedId]);

  return { insertedId };
}



// 0, 1, 2 All VisitReport
async function getAllVisitReports() {
  const [rows] = await pool.query(`
    SELECT 
      r.reportid,
      r.reportstatus,
      DATE_FORMAT(r.visittime, '%Y-%m-%d %H:%i') as visittime,
      r.email,
      s.id AS targetid,
      s.targetname,
      s.address1,
      s.address2,
      s.callnum AS targetcallnum,
      s.gender,
      s.age,
      r.stt_transcript_path
    FROM VisitReport r
    JOIN Targets s ON r.targetid = s.id
    ORDER BY r.visittime
  `);

  const formatted = rows.map(row => ({
    reportid: row.reportid,
    reportstatus: row.reportstatus,
    visittime: row.visittime,
    email: row.email,
    stt_transcript_path: row.stt_transcript_path,
    targetInfo: {
      targetid: row.targetid,
      targetname: row.targetname,
      address1: row.address1,
      address2: row.address2,
      targetcallnum: row.targetcallnum,
      gender: row.gender,
      age: row.age
    }
  }));

  return formatted;
}

  
// report info (Visitted Only, No Report Done)
async function getDefaultReportList(email) {
    const [rows] = await pool.query(`
      SELECT 
        r.reportid,
        r.reportstatus,
        DATE_FORMAT(r.visittime, '%Y-%m-%d %H:%i') as visittime,
        s.id AS targetid,
        s.targetname,
        s.address1,
        s.address2,
        s.callnum AS targetcallnum,
        s.gender,
        s.age
      FROM VisitReport r
      JOIN Targets s ON r.targetid = s.id
      WHERE r.reportstatus = 1
      AND r.email = ?
  `, [email]);
  
    const formatted = rows.map(row => ({
      reportid: row.reportid,
      reportstatus: row.reportstatus,
      visittime: row.visittime,
      targetInfo: {
        targetid: row.targetid,
        targetname: row.targetname,
        address1: row.address1,
        address2: row.address2,
        targetcallnum: row.targetcallnum,
        gender: row.gender,
        age: row.age,
      }
    }));
  
    return formatted;
  }  

// report info (All Done!)
async function getResultReportList(email) {
    const [rows] = await pool.query(`
      SELECT 
        r.reportid,
        r.reportstatus,
        DATE_FORMAT(r.visittime, '%Y-%m-%d %H:%i') as visittime,
        s.id AS targetid,
        s.targetname,
        s.address1,
        s.address2,
        s.callnum AS targetcallnum,
        s.gender,
        s.age
      FROM VisitReport r
      JOIN Targets s ON r.targetid = s.id
      WHERE r.reportstatus = 2
      AND r.email = ?
  `, [email]);
  
    const formatted = rows.map(row => ({
      reportid: row.reportid,
      reportstatus: row.reportstatus,
      visittime: row.visittime,
      targetInfo: {
        targetid: row.targetid,
        targetname: row.targetname,
        address1: row.address1,
        address2: row.address2,
        targetcallnum: row.targetcallnum,
        gender: row.gender,
        age: row.age,
      }
    }));
  
    return formatted;
  }  

// 방문 대상자 전체조회
async function getAllTargets() {
  const [rows] = await pool.query(`
    SELECT 
      id,
      targetid,
      targetname,
      address1,
      address2,
      callnum,
      gender,
      age
    FROM Targets
    ORDER BY id ASC
  `);

  return rows; // 배열 형태로 바로 반환
}


// Target Visit Abstraction
// We use Only report id (target id + visit date)
async function getVisitDetails(reportid) {
    const report_id = reportid;
    console.log('reportid:', reportid); // 이걸로 디버깅해봐

    // 1. 항목별 VisitCategory 가져오기
    const [categoryRows] = await pool.query(
        `SELECT category_title, summary_text, detail_text 
         FROM VisitCategory 
         WHERE report_id = ?`,
        [report_id]
    );

    // 2. JSON 형식 구성
    const response = {
        reportid: parseInt(reportid),
        items: categoryRows.map(row => ({
            "subject": row.category_title,
            "abstract": row.summary_text,
            "detail": row.detail_text
        }))
    };

    return response;
}


async function getTargetInfo(reportid) {
    // 1. reportid로 targetid 찾기
    const [reportRows] = await pool.query(
      'SELECT targetid FROM VisitReport WHERE reportid = ?',
      [reportid]
    );
  
    if (reportRows.length === 0) return null;
  
    const targetid = reportRows[0].targetid;
  
    // 2. targetid로 대상자 정보 조회
    const [targetRows] = await pool.query(
      'SELECT * FROM Targets WHERE id = ?',
      [targetid]
    );
  
    if (targetRows.length === 0) return null;
  
    const target = targetRows[0];
  
    // 3. 방문 기록 조회
    const [visitRows] = await pool.query(
      'SELECT visit_date, abstract FROM LastVisit WHERE target_id = ? ORDER BY visit_date DESC',
      [targetid]
    );
  
    // 4. 응답 형식 조립
    const response = {
      targetid: target.id,
      targetname: target.targetname,
      targetcallnum: target.callnum,
      address1: target.address1,
      address2: target.address2,
      gender: target.gender,
      age: target.age,
      lastvisit: visitRows.map(visit => ({
        date: formatDateToKorean(visit.visit_date),
        abstract: visit.abstract
      }))
    };
  
    return response;
  }
  

function formatTime(mysqlTime) {
    const [hour, minute] = mysqlTime.split(':');
    const h = parseInt(hour, 10);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minute} ${ampm}`;
}

function formatDateToKorean(dateStr) {
    const date = new Date(dateStr);
    return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}


module.exports = {
    getTargetInfo
};


// USER
// 특정 유저 조회
async function getUser(email) {
    const [rows, fields] = await pool.query('SELECT * FROM Users WHERE email = ?', [email]);
    console.log(`get User with ID ${email}:`, rows);
    return rows;
}

// 유저 생성
async function createUser(name, phoneNumber, email, birthdate, gender, permission, password) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);

    const etcValue = "대전 서부 담당자";

    const [result] = await pool.query(
        'INSERT INTO Users (name, phone_number, email, birthdate, gender, role, password, etc) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
        [name, phoneNumber, email, birthdate, gender, permission, hashedPassword, etcValue]
    );

    console.log('create User:', result);
    return result;
}


/**
 * 로그인 함수
*/

/**
 * 이메일과 비밀번호로 로그인
 * @param {string} email - 사용자 이메일
 * @param {string} password - 입력한 평문 비밀번호
 * @returns {object|null} 성공 시 유저 정보, 실패 시 null
 */
async function loginUser(email, password) {
    try {
        console.log("loginUser in db_api")
        console.log(email, password)
        const [rows] = await pool.query(
            'SELECT * FROM Users WHERE email = ?',
            [email]
        );
        
        if (rows.length === 0) {
            console.log('No user found with email:', email);
            return null;
        }

        const user = rows[0];
        user.gender = Number(user.gender);   // gender를 숫자로
        
        const match = await bcrypt.compare(password, user.password);

        console.log("user match : ")
        console.log(user, match)

        if (match) {
            delete user.password; // 비밀번호는 응답에서 제거
            return user;
        } else {
            return null;
        }
    } catch (err) {
        console.error('Error in loginUser:', err);
        throw err;
    }
}

/**
 * 이메일 중복 확인 함수
 * @param {string} email - 확인할 이메일 주소
 * @returns {boolean} 중복이면 true, 아니면 false
 */
async function isEmailDuplicate(email) {
  try {
    const [rows] = await pool.query(
      'SELECT user_id FROM Users WHERE email = ?',
      [email]
    );
    return rows.length > 0;
  } catch (err) {
    console.error('Error in isEmailDuplicate:', err);
    throw err;
  }
}


// 유저 정보 업데이트
async function updateUser(email, name, phoneNumber, email, birthdate, gender, permission) {
    const [result] = await pool.query('UPDATE Users SET name = ?, phone_number = ?, email = ?, birthdate = ?, gender = ?, permission = ? WHERE user_id = ?', [name, phoneNumber, email, birthdate, gender, permission, email]);
    console.log(`update User with ID ${email}:`, result);
    return result;
}

// 유저 삭제
async function deleteUser(email) {
    const [result] = await pool.query('DELETE FROM Users WHERE user_id = ?', [email]);
    console.log(`delete User with ID ${email}:`, result);
    return result;
}

// Client

// 특정 클라이언트 조회
async function getClient(clientId) {
    const [rows, fields] = await pool.query('SELECT * FROM Client WHERE client_id = ?', [clientId]);
    console.log(`get Client with ID ${clientId}:`, rows);
    return rows;
}

// 클라이언트 생성
async function createClient(name, address, phoneNumber, status) {
    const [result] = await pool.query('INSERT INTO Client (name, address, phone_number, status) VALUES (?, ?, ?, ?)', [name, address, phoneNumber, status]);
    console.log('create Client:', result);
    return result;
}

// 클라이언트 정보 업데이트
async function updateClient(clientId, name, address, phoneNumber, status) {
    const [result] = await pool.query('UPDATE Client SET name = ?, address = ?, phone_number = ?, status = ? WHERE client_id = ?', [name, address, phoneNumber, status, clientId]);
    console.log(`update Client with ID ${clientId}:`, result);
    return result;
}

// 클라이언트 삭제
async function deleteClient(clientId) {
    const [result] = await pool.query('DELETE FROM Client WHERE client_id = ?', [clientId]);
    console.log(`delete Client with ID ${clientId}:`, result);
    return result;
}

// PolicyInfo

// 특정 정책 정보 조회
async function getPolicyInfo(policyId) {
    const [rows, fields] = await pool.query('SELECT * FROM PolicyInfo WHERE policy_id = ?', [policyId]);
    console.log(`get PolicyInfo with ID ${policyId}:`, rows);
    return rows;
}

// 정책 정보 생성
async function createPolicyInfo(age, region, assets, annualIncome, vulnerableGroup, description) {
    const [result] = await pool.query('INSERT INTO PolicyInfo (age, region, assets, annual_income, vulnerable_group, description) VALUES (?, ?, ?, ?, ?, ?)', [age, region, assets, annualIncome, vulnerableGroup, description]);
    console.log('create PolicyInfo:', result);
    return result;
}

// 정책 정보 업데이트
async function updatePolicyInfo(policyId, age, region, assets, annualIncome, vulnerableGroup, description) {
    const [result] = await pool.query('UPDATE PolicyInfo SET age = ?, region = ?, assets = ?, annual_income = ?, vulnerable_group = ?, description = ? WHERE policy_id = ?', [age, region, assets, annualIncome, vulnerableGroup, description, policyId]);
    console.log(`update PolicyInfo with ID ${policyId}:`, result);
    return result;
}

// 정책 정보 삭제
async function deletePolicyInfo(policyId) {
    const [result] = await pool.query('DELETE FROM PolicyInfo WHERE policy_id = ?', [policyId]);
    console.log(`delete PolicyInfo with ID ${policyId}:`, result);
    return result;
}

// Checklist

// 특정 체크리스트 조회
async function getChecklist(checklistId) {
    const [rows, fields] = await pool.query('SELECT * FROM Checklist WHERE checklist_id = ?', [checklistId]);
    console.log(`get Checklist with ID ${checklistId}:`, rows);
    // 체크리스트 항목 반환, answers 배열 포함
    return rows.map(row => ({
        checklist_id: row.checklist_id,
        comment_id: row.comment_id,
        consultant_id: row.consultant_id,
        client_id: row.client_id,
        data: row.data,
        question: row.question,
        answers: [
            row.answer1,
            row.answer2,
            row.answer3,
            row.answer4
        ],
        selected_answer: row.selected_answer
    }));
}

// 체크리스트 생성
async function createChecklist(commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer) {
    const [result] = await pool.query('INSERT INTO Checklist (comment_id, consultant_id, client_id, data, question, answer1, answer2, answer3, answer4, selected_answer) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer]);
    console.log('create Checklist:', result);
    return result;
}

// 체크리스트 업데이트
async function updateChecklist(checklistId, commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer) {
    const [result] = await pool.query('UPDATE Checklist SET comment_id = ?, consultant_id = ?, client_id = ?, data = ?, question = ?, answer1 = ?, answer2 = ?, answer3 = ?, answer4 = ?, selected_answer = ? WHERE checklist_id = ?', [commentId, consultantId, clientId, date, question, answer1, answer2, answer3, answer4, selectedAnswer, checklistId]);
    console.log(`update Checklist with ID ${checklistId}:`, result);
    return result;
}

// check list result update
async function updateSelectedAnswer(commentId, consultantId, clientId, checklistId, selectedAnswer) {
    const query = `
        UPDATE Checklist 
        SET selected_answer = ? 
        WHERE checklist_id = ? 
          AND comment_id = ? 
          AND consultant_id = ? 
          AND client_id = ?
    `;
    const params = [selectedAnswer, checklistId, commentId, consultantId, clientId];
    
    try {
        const [result] = await pool.query(query, params);
        return result;
    } catch (error) {
        throw error;
    }
}

// 체크리스트 삭제
async function deleteChecklist(checklistId) {
    const [result] = await pool.query('DELETE FROM Checklist WHERE checklist_id = ?', [checklistId]);
    console.log(`delete Checklist with ID ${checklistId}:`, result);
    return result;
}

// ConsultationComment

// 특정 상담 코멘트 조회
async function getConsultationComment(commentId) {
    const [rows, fields] = await pool.query('SELECT * FROM ConsultationComments WHERE comment_id = ?', [commentId]);
    console.log(`get ConsultationComment with ID ${commentId}:`, rows);
    return rows;
}

// 상담 코멘트 생성
async function createConsultationComment(consultantId, clientId, comment, dateWritten) {
    const [result] = await pool.query('INSERT INTO ConsultationComments (consultant_id, client_id, comment, date_written) VALUES (?, ?, ?, ?)', [consultantId, clientId, comment, dateWritten]);
    console.log('create ConsultationComment:', result);
    return result;
}

// 상담 코멘트 업데이트
async function updateConsultationComment(commentId, consultantId, clientId, comment, dateWritten) {
    const [result] = await pool.query('UPDATE ConsultationComments SET consultant_id = ?, client_id = ?, comment = ?, date_written = ? WHERE comment_id = ?', [consultantId, clientId, comment, dateWritten, commentId]);
    console.log(`update ConsultationComment with ID ${commentId}:`, result);
    return result;
}

// 상담 코멘트 삭제
async function deleteConsultationComment(commentId) {
    const [result] = await pool.query('DELETE FROM ConsultationComments WHERE comment_id = ?', [commentId]);
    console.log(`delete ConsultationComment with ID ${commentId}:`, result);
    return result;
}

// Question List get
// 특정 question_id에 해당하는 질문 리스트 읽어오기
async function getQuestionsById(questionId) {
    const query = 'SELECT question_id, questions, question_count FROM Questions WHERE question_id = ?';
    
    try {
        const [rows] = await pool.query(query, [questionId]);
        
        // 질문 리스트가 없을 경우 빈 배열 반환
        if (rows.length === 0) return null;
        
        // questions 필드를 배열 형태로 변환하여 반환
        const row = rows[0];
        return {
            question_id: row.question_id,
            questions: row.questions.split(','), // 쉼표로 구분하여 배열로 변환
            question_count: row.question_count
        };
    } catch (error) {
        throw error;
    }
}

// // WelfarePolicy get
// // 특정 policy_id에 해당하는 복지 정책 정보 읽어오기
// async function getWelfarePolicyById(policyId) {
//     const query = 'SELECT id, age, region, non_duplicative_policies, policy_name, short_description, detailed_conditions, link FROM WelfarePolicies WHERE id = ?';
    
//     try {
//         const [rows] = await pool.query(query, [policyId]);
        
//         // 복지 정책 정보가 없을 경우 null 반환
//         if (rows.length === 0) return null;
        
//         // 결과 반환
//         const row = rows[0];
//         return {
//             id: row.id,
//             age: row.age,
//             region: row.region,
//             non_duplicative_policies: row.non_duplicative_policies.split(', '), // 쉼표로 구분하여 배열로 변환
//             policy_name: row.policy_name,
//             short_description: row.short_description,
//             detailed_conditions: row.detailed_conditions.split(', '), // 쉼표로 구분하여 배열로 변환
//             link: row.link
//         };
//     } catch (error) {
//         throw error;
//     }
// }

// WelfarePolicy get
async function uploadVisitPolicyStatus(data) {
    const { reportid, policy } = data;

    if (!reportid || !Array.isArray(policy) || policy.length === 0) {
        return {
            status: false,
            msg: 'reportid 또는 policy 배열이 누락되었거나 비어 있음',
        };
    }

    const updateQuery = `
        UPDATE WelfarePolicies
        SET check_status = ?
        WHERE reportid = ? AND policy_id = ?
    `;

    try {
        const connection = await pool.getConnection();
        await connection.beginTransaction();

        for (const p of policy) {
            await connection.query(updateQuery, [
                p.checkStatus,
                reportid,
                p.id
            ]);
        }

        await connection.commit();
        connection.release();

        return {
            status: true,
            msg: `${policy.length}개의 정책 체크 상태가 업데이트되었습니다.`,
        };
    } catch (err) {
        console.error('WelfarePolicies 업데이트 오류:', err);
        return {
            status: false,
            msg: 'DB 업데이트 중 오류 발생',
        };
    }
}

// 상담 완료시에 report status 2(상담완료)로 변경
async function visitReportDone(reportId) {
  const [result] = await pool.query(`
    UPDATE VisitReport
    SET reportstatus = 2
    WHERE reportid = ?
  `, [reportId]);

  return result;
}


// 특정 user_id에 해당하는 복지 정책 정보 읽어오기
async function getWelfarePolicyById(reportId) {
    const query = `
        SELECT policy_id, reportid, age, region, non_duplicative_policies, policy_name, short_description, detailed_conditions, link, check_status 
        FROM WelfarePolicies 
        WHERE reportid = ?
    `;
    
    
    try {
        const [rows] = await pool.query(query, [reportId]);
        
        // 복지 정책 정보가 없을 경우 null 반환
        if (rows.length === 0) return null;

            
        // === ✅ reportstatus = 1로 업데이트 ===
        await pool.query(
        `UPDATE VisitReport SET reportstatus = 1 WHERE reportid = ?`,
        [reportId]
        );

        // 첫 행을 기준으로 사용자 기본 정보 추출
        const { reportid, age, region, non_duplicative_policies } = rows[0];

        // policy 배열 생성
        const policies = rows.map(row => ({
            id: row.policy_id,
            policy_name: row.policy_name,
            short_description: row.short_description,
            detailed_conditions: row.detailed_conditions ? row.detailed_conditions.split(', ') : [], // 쉼표로 구분하여 배열로 변환
            link: row.link,
            checkStatus : row.check_status
        }));

        // 최종 반환 객체 생성
        return {
            reportid,
            age,
            region,
            non_duplicative_policies: non_duplicative_policies.split(', '), // 쉼표로 구분하여 배열로 변환
            policy: policies
        };
    } catch (error) {
        throw error;
    }
}


async function getWelfareDataById(email) {
    const query = `SELECT id, age, region, non_duplicative_policies, policy FROM WelfareData WHERE id = ?`;

    try {
        const [rows] = await pool.query(query, [email]);

        if (rows.length === 0) return null;

        const row = rows[0];
        return {
            id: row.id,
            age: row.age,
            region: row.region,
            non_duplicative_policies: row.non_duplicative_policies.split(', '), // 쉼표로 구분하여 배열로 변환
            policy: row.policy
        };
    } catch (error) {
        throw error;
    }
}

// 모든 복지 정책 가져오기
async function getAllWelfarePolicies() {
    const query = `
        SELECT id, age, region, non_duplicative_policies, policy_name, short_description, detailed_conditions, link 
        FROM WelfarePolicies
    `;

    try {
        const [rows] = await pool.query(query);

        // 복지 정책이 없을 경우 빈 배열 반환
        if (rows.length === 0) return [];

        // 사용자 ID를 기준으로 그룹화
        const policiesByUser = {};

        rows.forEach(row => {
            const { id, age, region, non_duplicative_policies } = row;

            if (!policiesByUser[id]) {
                policiesByUser[id] = {
                    id,
                    age,
                    region,
                    non_duplicative_policies: non_duplicative_policies.split(', '), // 쉼표로 구분하여 배열로 변환
                    policy: []
                };
            }

            policiesByUser[id].policy.push({
                policy_name: row.policy_name,
                short_description: row.short_description,
                detailed_conditions: row.detailed_conditions ? row.detailed_conditions.split(', ') : [],
                link: row.link
            });
        });

        // 객체를 배열로 변환하여 반환
        return Object.values(policiesByUser);
    } catch (error) {
        throw error;
    }
}

// Policy Array - 텍스트 임베딩을 통해 계산된 정책을 업데이트 (AI결과 업데이트_)
async function updatePolicyForUser(email, policyArray) {
    const query = `
        UPDATE WelfareData
        SET policy = ?
        WHERE id = ?
    `;

    try {
        await pool.query(query, [JSON.stringify(policyArray), email]);
        return { success: true, message: "Policy updated successfully." };
    } catch (error) {
        throw error;
    }
}

// AI에 의해 계산완료된 데이터 요청 - 사용자에게 보여주기 직전으로 가공 전부된 형태
async function getAllWelfareData() {
    const query = `SELECT id, age, region, non_duplicative_policies, policy FROM WelfareData`;

    try {
        const [rows] = await pool.query(query);

        if (rows.length === 0) return [];

        return rows.map(row => ({
            id: row.id,
            age: row.age,
            region: row.region,
            non_duplicative_policies: JSON.parse(row.non_duplicative_policies), // JSON 문자열 → 배열 변환
            policy: JSON.parse(row.policy) // JSON 문자열 → 배열 변환
        }));
    } catch (error) {
        throw error;
    }
}


// ConversationLog get
// 특정 log_id에 해당하는 대화 요약 읽어오기
async function getConversationLogById(logId) {
    const query = 'SELECT log_id, client_id, consultant_id, log_time, conversation_summary FROM ConversationLogs WHERE log_id = ?';
    
    try {
        const [rows] = await pool.query(query, [logId]);
        
        // 대화 요약이 없을 경우 null 반환
        if (rows.length === 0) return null;
        
        // 결과 반환
        const row = rows[0];
        console.log(row)
        return {
            log_id: row.log_id,
            client_id: row.client_id,
            consultant_id: row.consultant_id,
            log_time: row.log_time,
            conversation_summary: row.conversation_summary // 이미 JSON객체. 그대로 반환
        };
    } catch (error) {
        throw error;
    }
}

// 특정 사용자에 대해 임시 체크리스트 항목을 불러오는 함수
async function getUserChecklist(email) {
    const query = `
        SELECT c.*
        FROM Checklist c
        JOIN TempChecklist tc ON c.checklist_id = tc.checklist_id
        WHERE tc.user_id = ?
    `;
    
    try {
        const [rows] = await pool.query(query, [email]);
        
        // 결과가 없을 경우 null 반환
        if (rows.length === 0) return null;

        // 체크리스트 항목 반환, answers 배열 포함
        return rows.map(row => ({
            checklist_id: row.checklist_id,
            comment_id: row.comment_id,
            consultant_id: row.consultant_id,
            client_id: row.client_id,
            data: row.data,
            question: row.question,
            answers: [
                row.answer1,
                row.answer2,
                row.answer3,
                row.answer4
            ],
            selected_answer: row.selected_answer
        }));
    } catch (error) {
        throw error;
    }
}

// 방문 보고서 제작
async function addVisitReport({ visittime, email, targetname, targetid }) {
  // 1. 사용자 확인
  const [users] = await pool.query(`
    SELECT user_id, name, phone_number, email, birthdate, gender, etc, role
    FROM Users WHERE email = ?
  `, [email]);

  if (users.length === 0) {
    throw new Error(`User with email "${email}" not found`);
  }
  const user = users[0];

  // 2. 대상자 확인
  const [targets] = await pool.query(`
    SELECT * FROM Targets WHERE id = ?
  `, [targetid]);

  if (targets.length === 0) {
    throw new Error(`Target with id "${targetid}" not found`);
  }

  // 3. VisitReport 삽입
  const [result] = await pool.query(`
    INSERT INTO VisitReport (reportstatus, visittime, targetid, email)
    VALUES (?, ?, ?, ?)
  `, [0, visittime, targetid, email]);

  // 4. 반환: insertId와 user 정보
  return {
    reportid: result.insertId,
    userInfo: user
  };
}




// 특정 user_id의 checklist_id를 업데이트하는 함수
async function updateChecklistIdForUser(email, newChecklistId) {
    const query = `
        UPDATE TempChecklist 
        SET checklist_id = ? 
        WHERE user_id = ?
    `;

    try {
        const [result] = await pool.query(query, [newChecklistId, email]);

        // 결과 확인
        if (result.affectedRows === 0) {
            return { success: false, message: 'No entry found for the given user_id' };
        }

        return { success: true, message: 'Checklist ID updated successfully' };
    } catch (error) {
        throw error;
    }
}

// 특정 사용자에 대해 질문 세트를 조회하는 함수
async function getUserQuestions(email) {
    const query = `
        SELECT q.question_id, q.questions, q.question_count 
        FROM Questions q
        JOIN TempQuestions tq ON q.question_id = tq.question_id
        WHERE tq.user_id = ?
    `;
    
    try {
        const [rows] = await pool.query(query, [email]);
        
        // 결과가 없을 경우 null 반환
        if (rows.length === 0) return null;

        // 질문 세트 반환, question_id 포함
        return {
            question_id: rows[0].question_id,
            questions: rows[0].questions.split(','), // 쉼표로 구분하여 배열로 변환
            question_count: rows[0].question_count
        };
    } catch (error) {
        throw error;
    }
}


// 특정 user_id의 question_id를 업데이트하는 함수
async function updateUserQuestionSet(email, newQuestionId) {
    const query = `
        UPDATE TempQuestions 
        SET question_id = ? 
        WHERE user_id = ?
    `;

    try {
        const [result] = await pool.query(query, [newQuestionId, email]);

        // 결과 확인
        if (result.affectedRows === 0) {
            return { success: false, message: 'No entry found for the given user_id' };
        }

        return { success: true, message: 'Question set updated successfully' };
    } catch (error) {
        throw error;
    }
}

// middleware/auth.js
const jwt = require('jsonwebtoken');
const JWT_SECRET = "abcd";

function authenticateToken(req, res, next) {
  // console.log(req)
  const authHeader = req.headers['authorization'];          // Authorization: Bearer <token>
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ status: false, message: 'No token provided' });
  }

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(403).json({ status: false, message: 'Invalid or expired token' });
    }
    req.user = decoded;  // 라우터에서 req.user.email 형태로 접근 가능
    console.log("decoded in authenticateToken : ", req.user)
    next();
  });
}

/////////////////////////////////////////////////////////
// 양천구청 처리

const dayjs = require('dayjs'); // 날짜 형식 처리를 위해 추천

/**
 * STT 저장 요청 초기화 처리 - 파일이름 받아서 파일 생성후 YangChun_VisitReport Table에 레코드 삽입
 * @param {string} fileName - STT 파일명
 * @param {string} userEmail - 요청 유저 이메일
 */
async function prepareSttFile(fileName, userEmail) {
  try {
    const now = dayjs();
    const formattedTime = now.format('YYYY-MM-DD HH:mm:ss'); // visittime 저장용

    const [result] = await pool.query(`
      INSERT INTO YangChun_VisitReport (email, stt_file_name, stt_transcript_path, visittime)
      VALUES (?, ?, NULL, ?)
    `, [userEmail, fileName, formattedTime]);

    const reportid = result.insertId;
    console.log('✅ STT Upload Logged:', { reportid, userEmail, fileName });

    return reportid;

  } catch (err) {
    console.error('❌ Error in prepareSttFile:', err);
    throw err;
  }
}

/**
 * 사용자의 YangChun_VisitReport 이력 조회
 * @param {string} email - 사용자 이메일
 * @returns {Array} 결과 목록
 */
async function getYangchunResultList(email) {
  try {
    const [rows] = await pool.query(`
      SELECT 
        report_id,
        stt_file_name,
        DATE_FORMAT(visittime, '%Y-%m-%d %H:%i') as startTime
      FROM YangChun_VisitReport
      WHERE email = ?
      ORDER BY visittime DESC
    `, [email]);

    return rows.map(row => ({
      reportid: row.report_id,
      stt_file_name: row.stt_file_name,
      startTime: row.startTime
    }));
  } catch (err) {
    console.error('Error in getYangchunResultList:', err);
    throw err;
  }
}


async function getYangchunSTTTranscriptFile(reportid) {
    console.log("getYangchunSTTTranscriptFile", reportid)
    // if (!reportid) {
    //     console.log(reportid)
    //     return { status: false, msg: 'reportid 누락' };
    // }

    try {
        const [rows] = await pool.query(
            'SELECT stt_transcript_path FROM YangChun_VisitReport WHERE report_id = ?',
            [reportid]
        );
        console.log(rows)

        if (rows.length === 0 || !rows[0].stt_transcript_path) {
            return { status: false, msg: '전사 파일 경로를 찾을 수 없음' };
        }

        const filePath = rows[0].stt_transcript_path;

        // 존재 확인
        await fsPromises.access(filePath);

        return {
            status: true,
            path: filePath,
        };
    } catch (err) {
        console.error('전사 파일 조회 오류:', err);
        return {
            status: false,
            msg: '파일 조회 중 오류 발생',
        };
    }
}


// Target Visit Abstraction
// We use Only report id (target id + visit date)
async function getYangchunsttAbstract(reportid, email) {
    console.log('reportid:', reportid);
    console.log('email:', email);

    // 1. 항목별 VisitCategory 가져오기 (reportid + email 조건)
    const [categoryRows] = await pool.query(
        `SELECT category_title, summary_text, detail_text 
         FROM VisitCategory 
         WHERE report_id = ? AND email = ?`,
        [reportid, email]
    );

    // 2. 결과 없을 경우 지정된 JSON 반환
    if (!categoryRows || categoryRows.length === 0) {
      // stt_transcript_path 조회
      const [sttRows] = await pool.query(
        `SELECT stt_transcript_path 
        FROM YangChun_VisitReport 
        WHERE report_id = ? AND email = ?`,
        [reportid, email]
      );
      console.log('요약 요청 시작', reportid, email, sttRows);

      if (sttRows.length > 0) {
        const txtFile = sttRows[0].stt_transcript_path;

        console.log('요약 요청 시작', reportid, email, txtFile);
        // === 요약 트리거 ===
        const aiSummaryApi = "https://safe-hi.xyz/db/update_visit_category";
        try {
          const resp = await fetch(aiSummaryApi, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reportid,
              email,
              txt_file: txtFile,
            }),
          });

          let respJson = null;
          try { respJson = await resp.json(); } catch (_) {}
          console.log(`[getYangchunsttAbstract] AI 요약 응답:`, resp.status, respJson);
        } catch (e) {
          console.log(`[getYangchunsttAbstract] AI 요약 요청 실패:`, e);
        }
      }
      
      return {
          status: false,
          msg: "요약이 진행중입니다.",
          reportid: null,
          items: null
      };
    }

    // 3. 정상 결과 구성
    return {
        status: true,
        msg: "요약 조회 성공",
        reportid: parseInt(reportid),
        items: categoryRows.map(row => ({
            subject: row.category_title,
            abstract: row.summary_text,
            detail: row.detail_text
        }))
    };
}

// YangChun_VisitReport의 stt_transcript_path 필드 업데이트
async function updateSttTranscriptPath(reportid, email, newPath) {
    console.log("updateSttTranscriptPath : ")
    console.log(reportid, email, newPath)
    const [result] = await pool.query(
        `UPDATE YangChun_VisitReport 
         SET stt_transcript_path = ? 
         WHERE report_id = ? AND email = ?`,
        [newPath, reportid, email]
    );

    // 변경된 row가 없을 경우 실패 처리
    if (result.affectedRows === 0) {
        return {
            status: false,
            msg: "지정된 사용자의 회의록이 존재하지 않습니다."
        };
    }

    return {
        status: true,
        msg: `STT 경로가 성공적으로 업데이트되었습니다. ${reportid}`
    };
}

// Sign_Img에 데이터 삽입
async function insertSignImg(reportid, email, imgFileName, imgPath) {
    console.log("insertSignImg : ");
    console.log(reportid, email, imgFileName, imgPath);

    const [result] = await pool.query(
        `INSERT INTO Sign_Img (report_id, email, img_file_name, img_path, visittime)
         VALUES (?, ?, ?, ?, NOW())`,
        [reportid, email, imgFileName, imgPath]
    );

    // 삽입 결과 확인
    if (result.affectedRows === 0) {
        return {
            status: false,
            msg: "데이터 삽입에 실패했습니다."
        };
    }

    return {
        status: true,
        msg: `이미지 데이터가 성공적으로 저장되었습니다. report_id: ${reportid}`,
        insertId: result.insertId
    };
}

// DB 함수
async function insertYangchunReceiveMethodChecklist(reportid, merged) {
  const columns = [
    'reportid','view','copy','electronic','copy_print','other', 'etcContent',
    'direct','mail','fax','notification','email', 'emailContent'
  ];

  const sql = `
    INSERT INTO yangchun_method_checklist
    (${columns.join(', ')})
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      view=VALUES(view),
      copy=VALUES(copy),
      electronic=VALUES(electronic),
      copy_print=VALUES(copy_print),
      other=VALUES(other),
      etcContent=VALUES(etcContent),
      direct=VALUES(direct),
      mail=VALUES(mail),
      fax=VALUES(fax),
      notification=VALUES(notification),
      email=VALUES(email),
      emailContent=VALUES(emailContent)
  `;

  const values = [
    reportid,
    merged.view, merged.copy, merged.electronic, merged.copy_print, merged.other,
    merged.etcContent, merged.direct, merged.mail, merged.fax, merged.notification, merged.email, merged.emailContent
  ];

  const [result] = await pool.query(sql, values);
  return result;
}

// Sign_Img에 데이터 삽입
async function insertConstructionSignImg(reportid, email, imgFileName, imgPath, number) {
    console.log("insertConstructionSignImg : ");
    console.log(reportid, email, imgFileName, imgPath, number);

    const [result] = await pool.query(
        `INSERT INTO Sign_Img (report_id, email, img_file_name, img_path, number, visittime)
         VALUES (?, ?, ?, ?, ?, NOW())`,
        [reportid, email, imgFileName, imgPath, number]
    );

    // 삽입 결과 확인
    if (result.affectedRows === 0) {
        return {
            status: false,
            msg: "데이터 삽입에 실패했습니다."
        };
    }

    return {
        status: true,
        msg: `이미지 데이터가 성공적으로 저장되었습니다. report_id: ${reportid}`,
        insertId: result.insertId
    };
}

// get stt text file path TranscriptPath
async function getTranscriptPath(reportid, email) {
  try {
    const [rows] = await pool.query(
      `SELECT stt_transcript_path 
       FROM YangChun_VisitReport 
       WHERE reportid = ? AND email = ?`,
      [reportid, email]
    );

    if (rows.length === 0) {
      return null;
    }

    return rows[0].stt_transcript_path;
  } catch (err) {
    console.error('❌ Error in getTranscriptPath:', err);
    throw err;
  }
}
const axios = require('axios');  // npm install axios
/**
 * Given the raw stream of JSON lines from Ollama,
 * returns only the concatenated `response` text.
 */
function extractAIOutput(aiRaw) {
  return aiRaw
    .split(/\r?\n/)
    .reduce((acc, line) => {
      try {
        const { response } = JSON.parse(line);
        return acc + (response || '');
      } catch {
        return acc;
      }
    }, '')
    .trim();
}

/**
 * ```json … ``` 같은 마크다운 펜스를 제거하고, 순수 JSON 문자열을 반환
 */
function extractJsonFromMarkdown(raw) {
  // ``` 또는 ```json 펜스 사이의 내용을 캡처
  const fenceRegex = /```(?:json)?\s*([\s\S]*?)\s*```/i;
  const match = raw.match(fenceRegex);
  return match
    ? match[1].trim()          // 펜스 안쪽
    : raw.trim();             // 펜스가 없으면 전체 문자열
}

/**
 * Ollama HTTP API를 비스트리밍 모드로 호출해,
 * 모델이 최종 응답한 문자열만 반환합니다.
 * @param {string} prompt — 모델에 보낼 프롬프트
 * @returns {Promise<string>}
 */
async function callOllama(prompt) {
  const resp = await axios.post('http://localhost:31434/api/generate', {
    model: 'gemma3:4b',
    prompt,
    max_tokens: 800,      // 필요에 따라 조정
    temperature: 0.7,     // 옵션 예시
    stream: false         // ★ 스트리밍 비활성화 :contentReference[oaicite:0]{index=0}
  });

  // 비스트리밍 모드에서는 단일 객체가 오고, response 필드가 최종 텍스트
  const text = resp.data.response;
  return text.trim();
}

async function updateVisitCategory(reportid, email, txt_file_path) {
  try {
    // 1) 텍스트 파일 읽기 (fs 모듈 사용)
    const fs = require('fs').promises;
    const content = await fs.readFile(txt_file_path, 'utf-8');
    console.log('STT 파일 내용:', content);

    // 2) Ollama에 보낼 프롬프트 구성
    const prompt = `
      다음 텍스트를 읽고, 아래 JSON 스키마에 **정확하게** 맞춰 출력해 주세요.
      - 부가 설명 금지.
      - detail 뒤에 “(경고 : 데이터 부족으로 요약이 정확하지 않을 수 있습니다.)” 포함.

      JSON 스키마:
      {
        subject: '<주제>',
        abstract: '<추상적 요약>',
        detail: '<상세 설명 (경고 : 데이터 부족으로 요약이 정확하지 않을 수 있습니다.)>'
      }

      ===== 텍스트 시작 =====
      ${content}
      ===== 텍스트 끝 =====
    `;

    // 2) Ollama에 보낼 프롬프트 구성
    // const prompt = `
    //   # 정보공개청구 상담내용 분석 및 서류 작성 지원 프롬프트

    //   ## 시스템 지시사항
    //   다음 텍스트는 정보공개청구 상담 STT 녹취 전사 내용입니다.
    //   이 대화를 분석하여 정보공개청구 서류 작성에 필요한 정보를 육하원칙에 따라 체계적으로 정리하여 JSON 형태로 출력하세요.

    //   ## 처리 원칙
    //   1. **정보 추출 제한**: 주어진 텍스트에서만 정보를 추출하며, 없는 정보는 추측하거나 추가하지 않음
    //   2. **정확성 우선**: 불확실한 정보는 "정보 없음" 또는 "확인 필요"로 표기
    //   3. **중복 방지**: 육하원칙 각 항목 간 내용 중복을 철저히 배제
    //   4. **간결성**: 모든 항목은 핵심만 간결하게 작성
    //   5. **표준화**: 문장 종결은 논문체("-다", "-함") 사용

    //   ## 정보공개청구 유형별 필수 항목

    //   ### 1. CCTV 열람 청구 (what: "CCTV 영상")
    //   **육하원칙 매핑**:
    //   - **언제(when)**: 사건·사고 발생 구체적 시간
    //   - **어디서(where)**: 사건 발생장소, CCTV 설치장소/관리번호
    //   - **누가(who)**: 영상 속 인물 인적사항(성명, 주민번호 앞자리, 성별), 청구인과의 관계
    //   - **왜(why)**: 사건·사고 유형, 청구 사유
    //   - **어떻게(how)**: 상세 식별정보(인상착의, 차량정보), 관계증명 제출자료

    //   ### 2. 119 구급활동일지 (what: "119 구급활동일지")
    //   **육하원칙 매핑**:
    //   - **언제(when)**: 사건·사고 발생시간
    //   - **어디서(where)**: 사건 발생장소
    //   - **누가(who)**: 환자 인적사항(성명, 주민번호 앞자리, 성별), 청구인과의 관계
    //   - **왜(why)**: 청구 사유
    //   - **어떻게(how)**: 관계증명 자료(신분증, 가족관계증명서, 위임장 등)

    //   ### 3. 고소장 (what: "수사기록")
    //   **육하원칙 매핑**:
    //   - **언제(when)**: 사건 발생시간, 수사 진행시기
    //   - **어디서(where)**: 사건 발생장소, 관할 수사기관
    //   - **누가(who)**: 청구인 인적사항, 담당수사관, 고소인/피고소인 성명
    //   - **왜(why)**: 혐의명, 청구 사유
    //   - **어떻게(how)**: 사건번호, 담당수사관 연락처, 관계증명 제출자료

    //   ### 4. 의약품처방내역서 (what: "의약품처방내역서")
    //   **개인(보건소) 경우**:
    //   - **언제(when)**: 처방내역 조회기간
    //   - **어디서(where)**: 해당 보건소
    //   - **누가(who)**: 청구인 인적사항(성명, 주민번호 앞자리, 성별)
    //   - **왜(why)**: 청구 사유
    //   - **어떻게(how)**: 관계증명 자료

    //   **법인 경우**:
    //   - **언제(when)**: 처방내역 조회기간
    //   - **어디서(where)**: 관할 지역
    //   - **누가(who)**: 청구주체(법인 또는 단체명)
    //   - **왜(why)**: 청구 사유
    //   - **어떻게(how)**: 법인 관련 증빙자료

    //   ### 5. 기타 정보공개청구 (what: "정보공개청구")
    //   **육하원칙 매핑**:
    //   - **언제(when)**: 관련 시점, 조회기간
    //   - **어디서(where)**: 관련 장소, 관할기관
    //   - **누가(who)**: 청구인/관련인 인적사항
    //   - **왜(why)**: 청구 사유, 목적
    //   - **어떻게(how)**: 필요 증빙자료, 절차

    //   ## JSON 출력 스키마
    //   \`\`\`json
    //   {
    //     "subject": "<청구 핵심 주제 (20자 이내)>",
    //     "abstract": "<청구내용 1-2문장 요약>",
    //     "detail": "<청구유형 + 육하원칙 정리 + 경고문구>"
    //   }
    //   \`\`\`

    //   ## detail 필드 작성 형식
    //   detail 필드는 다음 순서로 구성:

    //   1. **청구유형**: [CCTV/119일지/고소장/의약품처방내역서/기타]
    //   2. **육하원칙 정리**:
    //     - 언제: [시간정보]
    //     - 어디서: [장소정보]  
    //     - 누가: [인물정보]
    //     - 왜: [청구사유]
    //     - 어떻게: [방법/절차/증빙]
    //   3. **경고**: (경고: 데이터 부족으로 요약이 정확하지 않을 수 있습니다.)

    //   ## 작성 지침
    //   1. **청구유형 식별**: STT 내용을 분석하여 5가지 유형 중 해당사항 판단
    //   2. **육하원칙 배치**: 각 유형별 매핑 기준에 따라 정보를 적절한 원칙에 배치
    //   3. **중복 제거**: 같은 정보가 여러 원칙에 중복되지 않도록 가장 적합한 곳에만 배치
    //   4. **누락 처리**: 원문에 없는 정보는 "정보 없음" 또는 "확인 필요"로 표기
    //   5. **detail 통합작성**: 모든 정보를 detail 필드에 체계적으로 통합하여 작성

    //   ## 주의사항
    //   - JSON 외 다른 텍스트는 출력하지 않음
    //   - 추측이나 임의 해석 금지
    //   - 개인정보는 일부 마스킹하여 표기
    //   - 법적 용어는 정확히 사용
    //   - detail 필드에 모든 필요 정보가 포함되도록 작성

    //   ===== 분석 대상 텍스트 =====
    //   ${content}
    //   ===== 텍스트 끝 =====
    // `;

    // 3) Ollama 호출 및 결과 수신
    const aiResult = await callOllama(prompt);
    console.log('▸ AI Raw Result:', aiResult);

    // const aiClean = extractAIOutput(aiResult);
    // console.log('▸ Clean JSON String:', aiClean);

    // 4) 파싱 함수로 전달할 최종 문자열 설정
    // txt_result =  "[{ \"subject\": \"건강\", \"abstract\": \"청각 및 의사소통 관련\", \"detail\": \"문제없이 잘 들리며 의사소통에 지장이 없음\" }]"
    
    // 마크다운 펜스 제거 → 순수 JSON으로 파싱
    const jsonText = extractJsonFromMarkdown(aiResult);
    let parsedItems = [];

    let aiObj;
    try {
      aiObj = JSON.parse(jsonText);

    // 5) 배열로 감싸서 JSON 문자열 생성
    const txt_result = JSON.stringify([ aiObj ]);
    console.log('▸ txt_result :', txt_result);

    parsedItems = parseTxtFile(txt_result);

    } catch (e) {      
        console.warn(`⚠️ JSON parse 실패. 원본 텍스트를 직접 저장합니다. 에러: ${e.message}`);

        parsedItems = [{
        category_title: 'AI 요약',
        summary_text: 'AI 요약결과',
        detail_text: jsonText
        }];
    }

    // 이후 기존 로직 진행...
    for (const item of parsedItems) {
      const { category_title, summary_text, detail_text } = item;
      const [rows] = await pool.query(
        `SELECT id FROM VisitCategory WHERE report_id = ? AND category_title = ?`,
        [reportid, category_title]
      );

      if (rows.length > 0) {
        await pool.query(
          `UPDATE VisitCategory 
             SET email = ?, summary_text = ?, detail_text = ? 
           WHERE report_id = ? AND category_title = ?`,
          [email, summary_text, detail_text, reportid, category_title]
        );
      } else {
        await pool.query(
          `INSERT INTO VisitCategory 
             (report_id, email, category_title, summary_text, detail_text)
           VALUES (?, ?, ?, ?, ?)`,
          [reportid, email, category_title, summary_text, detail_text]
        );
      }
    }

    return { success: true, updated: parsedItems.length };
  } catch (err) {
    console.error('❌ Error in updateVisitCategory:', err);
    throw err;
  }
}
// 5.27 Must Modify
// 이 라우터는 websocket close 시에 websocket 서버가 호출.
// 추후 websocket 서버 -> stt 모듈 -> (요약모듈) -> updateVisitCategory호출 이렇게 수정해야함
// 현재는 요약모듈 연결 건너뛰고 stt 모듈만 반영
// async function updateVisitCategory(reportid, email, txt_file) {
//   try {
//     ///////////////////////////////////////////////////
//     // 반드시 AI result로 변경되어야함
//     // txt_file =  "[{ \"subject\": \"건강\", \"abstract\": \"청각 및 의사소통 관련\", \"detail\": \"문제없이 잘 들리며 의사소통에 지장이 없음\" }]"
//     callOllama(txt_file)
//         .then(result => {
//             console.log('Ollama 결과:', result);
//         })
//         .catch(err => {
//             console.error('오류:', err.message);
//         });

//     // 1) AI 결과를 랜덤으로 세 가지 중 하나로 주입
//     const txtTemplates = [
//     "[{ \"subject\": \"청각\", \"abstract\": \"청각 및 의사소통 관련\", \"detail\": \"문제없이 잘 들리며 의사소통에 지장이 없음\" }]",
//     "[{ \"subject\": \"청각\", \"abstract\": \"의사소통 중 경미한 청력 저하 감지\", \"detail\": \"상대방의 말을 한두 번 더 묻는 경우가 있음 (경고 : 데이터 부족으로 요약이 정확하지 않을 수 있습니다.)\" }]",
//     "[{ \"subject\": \"청각\", \"abstract\": \"의사소통 시 집중 필요\", \"detail\": \"시끄러운 환경에서는 말귀를 잘 못 알아듣는 경향이 있음. 하지만 기타 치료방법등의 개선을 통해 나아질 부분이 보임\" }]"
//     ];

//     // 랜덤 적용
//     txt_file = txtTemplates[Math.floor(Math.random() * txtTemplates.length)];
//     console.log("txt_file : ", txt_file)
//     /////////////////////////////////////////////////
//     const parsedItems = parseTxtFile(txt_file);  // STT 결과 파싱 가정
//     // reportid = 1 // why do you do this fucking thing?? because of POC 6.26... juntheworld

//     for (const item of parsedItems) {
//       const { category_title, summary_text, detail_text } = item;

//       // 동일한 report_id + category_title row가 존재하면 email만 업데이트
//       const [rows] = await pool.query(`
//         SELECT id FROM VisitCategory 
//         WHERE report_id = ? AND category_title = ?
//       `, [reportid, category_title]);

//       if (rows.length > 0) {
//         await pool.query(`
//           UPDATE VisitCategory 
//           SET email = ?, summary_text = ?, detail_text = ? 
//           WHERE report_id = ? AND category_title = ?
//         `, [email, summary_text, detail_text, reportid, category_title]);
//       } else {
//         await pool.query(`
//           INSERT INTO VisitCategory (report_id, email, category_title, summary_text, detail_text)
//           VALUES (?, ?, ?, ?, ?)
//         `, [reportid, email, category_title, summary_text, detail_text]);
//       }
//     }

//     return { success: true, updated: parsedItems.length };
//   } catch (err) {
//     console.error('❌ Error in updateVisitCategory:', err);
//     throw err;
//   }
// }
/**
 * reportid로 file_path 조회
 * @param {number} reportid
 * @returns {Promise<string|null>}
 */
async function getFilePathByReportId(reportid) {
  const sql = "SELECT file_path FROM report_info WHERE reportid = ?";
  const [rows] = await pool.query(sql, [reportid]);

  if (!rows.length) return null;
  return rows[0].file_path || null;
}

// 예시용 파싱 함수 (실제 구현 시 txt_file 형식에 따라 수정 필요)
function parseTxtFile(txt) {
  // 예시: 단순 JSON 문자열로 가정
  const items = JSON.parse(txt);
  return items.map(i => ({
    category_title: i.subject,
    summary_text: i.abstract,
    detail_text: i.detail
  }));
}

// report_id와 email로 img_path 조회
async function getSignImgPath(reportid, email) {
    console.log("getSignImgPath : ");
    console.log(reportid, email);

    const [rows] = await pool.query(
        `SELECT img_path 
         FROM Sign_Img 
         WHERE report_id = ? AND email = ?`,
        [reportid, email]
    );

    if (rows.length === 0) {
        return {
            status: false,
            msg: "지정된 사용자의 이미지가 존재하지 않습니다."
        };
    }

    return {
        status: true,
        img_path: rows[0].img_path
    };
}

/**
 * fee_exemption 테이블에 데이터 삽입
 * @param {number} reportid - 보고서 ID
 * @param {boolean|number} is_exempt - 1(면제) 또는 0(비면제)
 * @param {string|null} content - 설명(없으면 null)
 */
async function insertFeeExemption(reportid, isexempt, content) {
  if (!Number.isInteger(reportid)) {
    throw new Error("reportid must be an integer");
  }
  if (isexempt !== 0 && isexempt !== 1) {
    throw new Error("isexempt must be 0 or 1");
  }

  const sql = `
    INSERT INTO fee_exemption (reportid, is_exempt, content)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE
      is_exempt = VALUES(is_exempt),
      content   = VALUES(content)
  `;

  const [result] = await pool.query(sql, [reportid, isexempt, content]);
  return result;
}


// report_id와 email로 img_path 조회
async function getConstructionSignImgPath(reportid, num, email) {
    console.log("getConstructionSignImgPath : ");
    console.log(reportid, email, num);

    const [rows] = await pool.query(
        `SELECT img_path 
         FROM Sign_Img 
         WHERE report_id = ? AND email = ? AND num = ?`,
        [reportid, email, num]
    );

    if (rows.length === 0) {
        return {
            status: false,
            msg: "지정된 사용자의 이미지가 존재하지 않습니다."
        };
    }

    return {
        status: true,
        img_path: rows[0].img_path
    };
}

/**
 * fee_exemption 테이블에 데이터 삽입
 * @param {number} reportid - 보고서 ID
 * @param {boolean|number} is_exempt - 1(면제) 또는 0(비면제)
 * @param {string|null} content - 설명(없으면 null)
 */
async function insertFeeExemption(reportid, is_exempt, content) {
  const sql = `
    INSERT INTO fee_exemption (reportid, is_exempt, content)
    VALUES (?, ?, ?)
  `;

  try {
    const [result] = await pool.query(sql, [
      reportid,
      is_exempt ? 1 : 0,
      content || null
    ]);
    console.log(`Inserted row in FeeExemption with reportid=${reportid}`);
    return result;
  } catch (err) {
    console.error('Error inserting fee exemption:', err);
    throw err;
  }
}


/**
 * applicant_info; 테이블에 데이터 삽입
 * @param {Object} data - 입력 데이터
 */
async function insertIdCardInfo(data) {
  const sql = `
    INSERT INTO applicant_info 
    (reportid, name, birth_date, address, passport, phone, email, fax, business_number, gender)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const params = [
    data.reportid,
    data.name,
    data.birthDate,
    data.address,
    data.passport,
    data.phone,
    data.email,
    data.fax,
    data.businessNumber,
    data.gender
  ];

  try {
    const [result] = await pool.query(sql, params);
    return result;
  } catch (err) {
    console.error('Error inserting ID card info:', err);
    throw err;
  }
}


/**
 * 특정 이메일의 report_info 데이터 모두 조회
 * @param {string} email - 검색할 이메일
 * @returns {Promise<Array>} 해당 이메일의 모든 행 데이터
 */
async function getReportInfoHistory() {
  const query = `
    SELECT *
    FROM report_info
    ORDER BY reportid DESC;
  `;

  try {
    const [rows] = await pool.query(query);
    return rows; // report_info 전체 내용 배열로 반환
  } catch (err) {
    console.error('DB 전체 조회 에러:', err);
    throw err;
  }
}


// === 유틸: 안전 파싱 ===
const nz = (v, alt = "") => (v === null || v === undefined ? alt : v);

// === DB 집계: report_id -> payload 각 섹션 ===
async function buildPayloadFromDB(reportid) {
  console.log("buildPayload start!!!!!!!!!");
  // 1) 신청인 정보 applicant_info
  const [appRows] = await pool.query(
    `SELECT name, birth_date, address, passport, gender, phone, email, fax, business_number
        FROM applicant_info
      WHERE reportid = ?
      LIMIT 1`,
    [reportid]
  );
  const app = appRows[0] || {};
  const applicantData = {
    name: nz(app.name),
    birthDate: nz(app.birth_date),             // 서버에서 요구하는 포맷으로 이미 저장돼 있다고 가정
    address: nz(app.address),
    gender: nz(app.gender),
    passport: nz(app.passport),
    phone: nz(app.phone),
    email: nz(app.email),
    fax: nz(app.fax),
    businessNumber: nz(app.business_number),
  };

  console.log("applicantData : ", applicantData)

  // 2) 요약/내용 VisitCategory
  const [vcRows] = await pool.query(
    `SELECT category_title, summary_text, detail_text
        FROM VisitCategory
      WHERE report_id = ?
      ORDER BY created_at DESC, id DESC
      LIMIT 1`,
    [reportid]
  );
  const vc = vcRows[0] || {};
  // const contentText =
  //   (vc.summary_text && vc.summary_text.trim()) ||
  //   (vc.detail_text && vc.detail_text.trim()) ||
  //   (vc.category_title ? `[${vc.category_title}] report ${reportid}` : `Report ${reportid}`);

  const contentText = vc.detail_text || "요약 내용이 없습니다.";
  const summaryData = {
    content: contentText,
    isPublic: true, // 필요 시 테이블 확장
  };

  console.log("summaryData : ", summaryData)

  // 3) 공개/수령 방법 yangchun_method_checklist
  const [mcRows] = await pool.query(
    `SELECT view, copy, electronic, copy_print, other,
            direct, mail, fax, notification, email
        FROM yangchun_method_checklist
      WHERE reportid = ?
      ORDER BY id DESC
      LIMIT 1`,
    [reportid]
  );
  const mc = mcRows[0] || {
    view: 0, copy: 0, electronic: 0, copy_print: 0, other: 0,
    direct: 0, mail: 0, fax: 0, notification: 0, email: 0,
  };
  const methodData = {
    // [열람, 사본, 전자파일, 출력물, 기타]
    disclosureMethods: [mc.view, mc.copy, mc.electronic, mc.copy_print, mc.other].map((v) => (v ? 1 : 0)),
    // [직접, 우편, 팩스, 휴대전화(알림), 이메일]
    receiveMethods: [mc.direct, mc.mail, mc.fax, mc.notification, mc.email].map((v) => (v ? 1 : 0)),
    otherDisclosureMethod: "",
    otherReceiveMethod: "",
  };

  console.log("methodData : ", methodData)

  // 4) 수수료감면 fee_exemption
  const [feRows] = await pool.query(
    `SELECT is_exempt, content
        FROM fee_exemption
      WHERE reportid = ?
      LIMIT 1`,
    [reportid]
  );
  const fe = feRows[0] || { is_exempt: 0, content: null };
  const feeData = {
    exemptionType: fe.is_exempt ? "exempt" : "non-exempt",
    exemptionReason: nz(fe.content),
  };

  console.log("feeData : ", feeData)

  // 5) 서명 이미지 Sign_Img (가장 최근)
  const [siRows] = await pool.query(
    `SELECT img_path
        FROM Sign_Img
      WHERE report_id = ?
      LIMIT 1`,
    [reportid]
  );
  const si = siRows[0];
  const imagePath = si?.img_path || '/new_data/sw_excellent/upload_sign/default_sign.png';

  console.log("imagePath from buildPayloadFromDB : ", imagePath)

  return { applicantData, summaryData, methodData, feeData, imagePath };
}

// report_info 테이블에 새로운 데이터 삽입 혹시 reportid 중복되면 업데이트
async function updateReportInfo(reportid, request_type, content) {
    // 1. Users 테이블에서 사용자 정보 조회
    // 사용자 정보 조회
    let users = [];

    console.log("request_type : ", request_type)
    if (request_type === "건설기계조종사면허증(재)발급") {
      [users] = await pool.query(
        `SELECT name FROM license_info WHERE reportid = ? LIMIT 1`,
        [reportid]
      );
    } else if (request_type === "정보공개청구") {
      [users] = await pool.query(
        `SELECT name FROM applicant_info WHERE reportid = ? LIMIT 1`,
        [reportid]
      );
    }

  console.log("user Name : ", users)
  const administrator = users[0].name;

  const query = `
    INSERT INTO report_info
      (reportid, report_date, report_time, request_type, content, administrator)
    VALUES (?, CURDATE(), CURTIME(), ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      report_date = CURDATE(),
      report_time = CURTIME(),
      request_type = VALUES(request_type),
      content = VALUES(content)
  `;
  const values = [reportid, request_type, content, administrator];
  const [result] = await pool.query(query, values);
  return result;
}


// report_info 테이블의 file_path 업데이트
async function updateReportFilePath(reportid, file_path) {
  const query = `
    UPDATE report_info
    SET file_path = ?
    WHERE reportid = ?
  `;
  const values = [file_path, reportid];
  const [result] = await pool.query(query, values);
  return result;
}

async function insertLicenseInfo(data) {
  const query = `
    INSERT INTO license_info 
    (reportid, qualification_type, registration_number, license_number, gender, issue_date, name, resident_number, address, phone, license_type, is_reissue, reissue_reason) 
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  const values = [
    data.reportid,
    data.qualificationType,
    data.registrationNumber,
    data.licenseNumber,
    data.gender,
    data.issueDate,
    data.name,
    data.residentNumber,
    data.address,
    data.phone,
    data.licenseType,
    data.isreissue ? 1 : 0,
    data.reissueReason || null,
  ];

  const [result] = await pool.query(query, values);
  return result;
}

async function buildConstructionPayloadFromDB(reportid) {
  try {
    // === license_info 조회 ===
    const [rows] = await pool.query(
      `SELECT 
          qualification_type,
          registration_number,
          license_number,
          issue_date,
          name,
          resident_number,
          address,
          phone,
          license_type,
          is_reissue,
          reissue_reason
       FROM license_info
       WHERE reportid = ?`,
      [reportid]
    );

    if (rows.length === 0) {
      throw new Error(`No license_info found for reportid=${reportid}`);
    }

    const row = rows[0];

    const licenseData = {
      qualificationType: row.qualification_type || null,
      registrationNumber: row.registration_number || null,
      licenseNumber: row.license_number || null,
      issueDate: row.issue_date || null,
      name: row.name || null,
      gender: row.gender || null,
      residentNumber: row.resident_number || null,
      address: row.address || null,
      phone: row.phone || null,
      licenseType: row.license_type || null,
      isreissue: !!row.is_reissue,
      reissueReason: row.reissue_reason || null,
    };

    // === Sign_Img 조회 ===
    const [siRows] = await pool.query(
      `SELECT img_path
         FROM Sign_Img
       WHERE report_id = ?
       ORDER BY visittime DESC, created_at DESC
       LIMIT 2`,
      [reportid]
    );

    console.log("images by db : ", siRows)

    let imagePaths = null;

    if (siRows.length === 1) {
      imagePaths = siRows[0].img_path || '/new_data/sw_excellent/upload_sign/default_sign.png';
    } else if (siRows.length >= 2) {
      imagePaths = {
        imagePath1: siRows[0].img_path || '/new_data/sw_excellent/upload_sign/default_sign.png',
        imagePath2: siRows[1].img_path || '/new_data/sw_excellent/upload_sign/default_sign.png',
      };
    }

    return { licenseData, imagePaths };
  } catch (err) {
    console.error("buildConstructionPayloadFromDB Error:", err);
    throw err;
  }
}

module.exports = {
    runDbFunction,
    getUser,
    getTargetInfo,
    getTodayList,
    getDefaultReportList,
    getResultReportList,
    getVisitDetails,
    createUser,
    loginUser,
    updateUser,
    deleteUser,
    getClient,
    createClient,
    updateClient,
    deleteClient,
    getPolicyInfo,
    createPolicyInfo,
    updatePolicyInfo,
    deletePolicyInfo,
    getChecklist,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    getConsultationComment,
    createConsultationComment,
    updateConsultationComment,
    deleteConsultationComment,
    updateSelectedAnswer,
    getQuestionsById,
    getWelfarePolicyById,
    getAllWelfarePolicies,
    getAllWelfareData,
    getWelfareDataById,
    updatePolicyForUser,
    getConversationLogById,
    getUserChecklist,
    updateChecklistIdForUser,
    getUserQuestions,
    updateUserQuestionSet,
    uploadReportDefaultInfo,
    uploadVisitDetail,
    uploadReportImages,
    uploadVisitCategoryItems,
    uploadVisitPolicyStatus,
    makeUploadMiddleware,
    getSTTTranscriptFile,
    getReport,
    authenticateToken,
    setEmailToReport,
    getAllVisitReports,
    addTarget,
    getAllTargets,
    addVisitReport,
    visitReportDone,
    isEmailDuplicate,
    prepareSttFile,
    getYangchunResultList,
    getYangchunSTTTranscriptFile,
    getYangchunsttAbstract,
    updateSttTranscriptPath,
    getTranscriptPath,
    updateVisitCategory,
    yangchun_get_all_report_info,
    insertSignImg,
    insertConstructionSignImg,
    getSignImgPath,
    getConstructionSignImgPath,
    insertYangchunReceiveMethodChecklist,
    insertFeeExemption,
    insertIdCardInfo,
    buildPayloadFromDB,
    updateReportInfo,
    updateReportFilePath,
    getReportInfoHistory,
    getFilePathByReportId,
    insertLicenseInfo,
    buildConstructionPayloadFromDB
};
