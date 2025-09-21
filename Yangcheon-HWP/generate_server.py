from flask import Flask, request, send_file, jsonify
from pyhwpx import Hwp
import tempfile
import json
from datetime import datetime
import os
import re

app = Flask(__name__)

# JSON 구조를 <a.b.c> => value 형식으로 평탄화
def flatten_json(prefix, data, result):
    for k, v in data.items():
        full_key = f"{prefix}.{k}" if prefix else k
        if isinstance(v, dict):
            flatten_json(full_key, v, result)
        elif isinstance(v, list):
            for idx, item in enumerate(v):
                result[f"{full_key}.{idx}"] = "√" if item else " "
        else:
            result[f"{full_key}"] = str(v)


# 전화번호 형식 맞추기
# phone의 길이가 13일때, 그대로, 길이가11일때 3/4/4 사이에 "-" 넣기, 길이가 13,11 모두 아닐때 그대로 두기
def _format_phone(p):
    """대한민국 전화번호 안전 포맷터.
    - 이미 'xx(x)-xxx(x)-xxxx' 형식이면 그대로
    - 010 11자리 -> 3-4-4
    - 011/016/017/018/019 10자리 -> 3-3-4
    - 02 지역(9/10자리) -> 2-(3 or 4)-4
    - 그 외 지역(0xx, 10/11자리) -> 3-(3 or 4)-4
    - 이상값은 원본 유지
    """
    try:
        if p in (-1, None, ""):
            return p
        s = str(p).strip()

        # 이미 하이픈 포맷이면 그대로
        if re.fullmatch(r"\d{2,3}-\d{3,4}-\d{4}", s):
            return s

        # 숫자만 추출
        digits = re.sub(r"\D", "", s)

        # 휴대폰
        if digits.startswith("010") and len(digits) == 11:
            return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
        if digits[:3] in {"011","016","017","018","019"} and len(digits) == 10:
            return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"

        # 서울(02): 총 9 or 10자리
        if digits.startswith("02") and len(digits) in (9, 10):
            mid_len = len(digits) - 6  # 2(지역)+4(마지막)
            return f"{digits[:2]}-{digits[2:2+mid_len]}-{digits[-4:]}"

        # 기타 지역번호(0xx): 총 10 or 11자리
        if digits.startswith("0") and len(digits) in (10, 11):
            area = digits[:3]
            mid_len = len(digits) - 7   # 3(지역)+4(마지막)
            return f"{area}-{digits[3:3+mid_len]}-{digits[-4:]}"

        # 그 외 합리적 포백
        if len(digits) == 11:
            return f"{digits[:3]}-{digits[3:7]}-{digits[7:]}"
        if len(digits) == 10:
            return f"{digits[:3]}-{digits[3:6]}-{digits[6:]}"

        return s
    except Exception as e:
        # 예외 삼켜서 500 방지 + 서버 로그 확인용
        print(f"[phone-format-error] value={p!r}, err={e}")
        return p


# 치환용 딕셔너리 생성
def build_replacements(data):
    result = {}
    flatten_json("", data, result)

    # 전화번호 파싱
    # 전화번호가 01087154894 이런식으로 들어오면
    # 전화번호가 010-8715-4894 이런식으로 맞추기
    raw_phone = (
        (data.get("applicantData", {}) or {}).get("phone")
        or data.get("phone", "")
    )
    phone_txt = _format_phone(raw_phone)
    if phone_txt:
        # applicantData.phone 또는 phone 필드명에 맞게 결과 dict에 삽입
        if "applicantData" in data:
            result["applicantData.phone"] = phone_txt
        else:
            result["phone"] = phone_txt
            
    # 남/여(0/1) 파싱
    gender = data.get("items", {}).get("applicantData", {}).get("gender", 0)
    result["applicantData.gender"] = "남" if gender == 0 else "여"

    # 조건부 체크 처리: feeData.exemptionType
    exemption = data.get("feeData", {}).get("exemptionType", " ")
    result["feeData.exemptionType.0"] = "√" if exemption == "exempt" else " "
    result["feeData.exemptionType.1"] = " " if exemption == "exempt" else "√"

    # reportType이 construction_machinery_license이면 추가 처리
    # if data.get("reportType") == "construction_machinery_license":
    isreissue = data.get("isreissue", False)
    result["isreissue.0"] = "√" if isreissue else " "  # ■ or □
    result["isreissue.1"] = " " if isreissue else "√"
    if not isreissue :
        result["reissueReason"] = "-"

    # 오늘 날짜 삽입
    today = datetime.today()
    result["YYYY"] = str(today.year)
    result["MM"] = f"{today.month:02d}"
    result["DD"] = f"{today.day:02d}"

    return {f"<{k}>": v for k, v in result.items() if v != ""}

def insert_sign_image(hwp: Hwp, image_path: str, marker: str = "<sign>", width_mm: int = 27.6, height_mm: int = 12.6):
    if not os.path.exists(image_path):
        raise FileNotFoundError(f"이미지 파일이 존재하지 않습니다: {image_path}")

    count = 0
    found = hwp.find(marker)

    while found:
        hwp.insert_picture(
            image_path,
            sizeoption=1,
            width=int(width_mm),   # mm → 0.01mm 단위
            height=int(height_mm)
        )

        # 이미지 글자 뒤로 보내기
        action_id = "ShapeObjDialog"
        hwp.FindCtrl()  # 마지막 삽입한 개체 선택
        action = hwp.CreateAction(action_id)
        parameterset = action.CreateSet()
        action.GetDefault(parameterset)
        parameterset.SetItem("TreatAsChar", False)
        parameterset.SetItem("TextWrap", 2)  # 글자 뒤에 배치
        action.Execute(parameterset)

        count += 1
        found = hwp.find(marker)
    
    print(f"✅ 총 {count}개의 서명 이미지를 삽입했습니다.")


from clear import clear_leftover_markers


@app.route('/', methods=['POST'])
def generate():
    try:
        raw_json = request.form.get("data")
        if not raw_json:
            return jsonify({"error": "Missing data field"}), 400
        try:
            form = json.loads(raw_json)
        except json.JSONDecodeError:
            return jsonify({"error": "Invalid JSON format"}), 400
        
        print("🧾 Content-Type:", request.headers.get("Content-Type"))
        print("🗂 form keys:", list(request.form.keys()))
        print("📦 files keys:", list(request.files.keys()))
        


        # ✅ 이미지 수신 (최대 2장) — 'images' 또는 'image' 모두 지원
        files = request.files.getlist("images")[::-1]
        if not files:
            # 단일 키로 올 때 대비
            candidates = []
            if 'image' in request.files:
                candidates.append(request.files['image'])
            # 추가로 image1, image2 같은 키도 허용 (있으면)
            for k in ("image1", "image2", "file", "file1", "file2"):
                if k in request.files:
                    candidates.append(request.files[k])
            files = candidates[::-1]

        # 저장
        image_paths = []
        if files:
            os.makedirs("output/signs", exist_ok=True)
            from werkzeug.utils import secure_filename
            for idx, file in enumerate(files[:2]):  # 최대 2개
                base = secure_filename(file.filename or f"sign_{idx}.png")
                _, ext = os.path.splitext(base)
                if not ext:
                    ext = ".png"
                saved = f"output/signs/{datetime.now().strftime('%Y%m%d%H%M%S')}_{idx}{ext}"
                file.save(saved)
                image_paths.append(saved)




        report_type = form.get("reportType")
        file_name = form.get("file_name", "generated.hwp")
        items = form.get("items", {})

        if not report_type or not items:
            return jsonify({"error": "Missing reportType or items"}), 400

        replacements = build_replacements({"reportType": report_type, **items})
        template_path = f"templates/{report_type}.hwp"
        local_output_dir = "output"
        os.makedirs(local_output_dir, exist_ok=True)
        local_output_path = os.path.join(local_output_dir, file_name)

        with tempfile.NamedTemporaryFile(delete=False, suffix=".hwp") as tmp:
            response_output_path = tmp.name

        hwp = Hwp()
        hwp.RegisterModule("FilePathCheckDLL", "SecurityModule")
        hwp.XHwpWindows.Item(0).Visible = False
        hwp.Open(template_path)

        for target, replacement in replacements.items():
            hwp.HAction.GetDefault("AllReplace", hwp.HParameterSet.HFindReplace.HSet)
            hwp.HParameterSet.HFindReplace.HSet.SetItem("FindString", target)
            hwp.HParameterSet.HFindReplace.HSet.SetItem("ReplaceString", replacement)
            hwp.HParameterSet.HFindReplace.HSet.SetItem("Scope", 0)
            hwp.HParameterSet.HFindReplace.HSet.SetItem("FindType", 1)
            hwp.HParameterSet.HFindReplace.HSet.SetItem("IgnoreMessage", True)
            hwp.HParameterSet.HFindReplace.HSet.SetItem("MatchCase", False)
            hwp.HParameterSet.HFindReplace.HSet.SetItem("IgnoreSpace", True)
            hwp.HAction.Execute("AllReplace", hwp.HParameterSet.HFindReplace.HSet)


        image_markers = ["<sign>", "<sign2>"]
        for path, marker in zip(image_paths, image_markers):
            insert_sign_image(hwp, path, marker=marker)

        '''
        if image_path:
            insert_sign_image(hwp, image_path)
        '''
        
        clear_leftover_markers(hwp)

        hwp.SaveAs(local_output_path)
        hwp.Quit()
        print("📄 HWP 저장 경로:", os.path.abspath(local_output_path), 
      "존재:", os.path.exists(local_output_path))

        with open(local_output_path, "rb") as src, open(response_output_path, "wb") as dst:
            dst.write(src.read())

        return send_file(response_output_path, as_attachment=True, download_name=file_name)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='127.0.0.1', port=8091)
