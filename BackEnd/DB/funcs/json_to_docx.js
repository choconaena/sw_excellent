const fs = require('fs');
const path = require('path');
const {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} = require('docx');

// JSON 로드
const data = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'data.json'), 'utf8')
);

// 한글 레이블 매핑
const LABELS = {
  reportid:     '보고서 ID',
  reportstatus: '상태',
  visittime:    '방문 시각',
  endTime:      '종료 시각',
  visitType:    '방문 유형',
  detail:       '상세 내용',
  targetid:      '대상 ID',
  targetname:    '대상 이름',
  address1:      '주소(1)',
  address2:      '주소(2)',
  targetcallnum: '전화번호',
  gender:        '성별',
  age:           '나이',
  email:     '이메일',
  username:  '사용자명',
  callnum:   '연락처',
  birthday:  '생년월일',
  etc:       '기타',
  role:      '역할',
};

// 성별 숫자를 한글 문자열로 변환
function prettifyValue(key, value) {
  if (key === 'gender') {
    if (value === 1) return '남자';
    if (value === 0) return '여자';
  }
  return String(value);
}

// 문단 생성 헬퍼
function makeFieldParagraph(key, value) {
  return new Paragraph({
    children: [
      new TextRun({
        text: `${LABELS[key]}: `,
        bold: true,
        size: 20, // 10pt
        font: 'Malgun Gothic',
      }),
      new TextRun({
        text: prettifyValue(key, value),
        size: 20,
        font: 'Malgun Gothic',
      }),
    ],
    indent: { left: 720 },
    spacing: { after: 60 },
  });
}

async function buildDocx(outputPath) {
  const { targetInfo, userInfo, ...basicInfo } = data;

  const doc = new Document({
    sections: [{
      children: [
        // 타이틀
        new Paragraph({
          children: [
            new TextRun({
              text: '서비스 방문 보고서',
              bold: true,
              size: 36, // 이전보다 약간 줄인 제목 글자 (18pt)
              font: 'Malgun Gothic',
            }),
          ],
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
        }),

        // 1. 기본 정보
        new Paragraph({
          children: [ new TextRun({ text: '1. 기본 정보', bold: true, size: 24, font: 'Malgun Gothic' }) ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }),
        ...Object.entries(basicInfo).map(([k, v]) => makeFieldParagraph(k, v)),

        // 2. 대상 정보
        new Paragraph({
          children: [ new TextRun({ text: '2. 대상 정보', bold: true, size: 24, font: 'Malgun Gothic' }) ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }),
        ...Object.entries(targetInfo).map(([k, v]) => makeFieldParagraph(k, v)),

        // 3. 사용자 정보
        new Paragraph({
          children: [ new TextRun({ text: '3. 사용자 정보', bold: true, size: 24, font: 'Malgun Gothic' }) ],
          heading: HeadingLevel.HEADING_3,
          spacing: { before: 200, after: 100 },
        }),
        ...Object.entries(userInfo).map(([k, v]) => makeFieldParagraph(k, v)),
      ],
    }],
  });

  const buffer = await Packer.toBuffer(doc);
  await fs.promises.writeFile(outputPath, buffer);
  console.log(`✔ DOCX generated at ${outputPath}`);
}

// 실행
(async () => {
  const baseName = `report_${data.reportid}_${data.visittime.replace(/[:\s]/g, '-')}`;
  const outPath = path.join(__dirname, baseName + '.docx');
  await buildDocx(outPath);
})();
