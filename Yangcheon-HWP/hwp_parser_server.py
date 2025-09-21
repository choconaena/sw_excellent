"""
HWP 파일 파싱 서버
Windows 데스크탑에서 실행되며, Linux 서버의 28090 포트로 SSH 터널을 통해 연결됩니다.
HWP 파일을 받아서 텍스트 내용을 추출하여 반환합니다.
"""

from flask import Flask, request, jsonify
from pyhwpx import Hwp
import tempfile
import os
import traceback
from datetime import datetime

app = Flask(__name__)

def extract_hwp_text(hwp_file_path):
    """
    HWP 파일에서 텍스트 내용을 추출합니다.

    Args:
        hwp_file_path (str): HWP 파일 경로

    Returns:
        str: 추출된 텍스트 내용
    """
    hwp = None
    try:
        hwp = Hwp()
        hwp.RegisterModule("FilePathCheckDLL", "SecurityModule")
        hwp.XHwpWindows.Item(0).Visible = False

        # HWP 파일 열기
        hwp.Open(hwp_file_path)

        # 전체 문서 선택
        hwp.HAction.GetDefault("SelectAll", hwp.HParameterSet.HSelectionOpt.HSet)
        hwp.HAction.Execute("SelectAll", hwp.HParameterSet.HSelectionOpt.HSet)

        # 선택된 텍스트 가져오기
        text_content = hwp.GetText()

        return text_content

    except Exception as e:
        print(f"HWP 텍스트 추출 오류: {e}")
        traceback.print_exc()
        raise e

    finally:
        if hwp:
            try:
                hwp.Quit()
            except:
                pass

@app.route('/', methods=['GET'])
def health_check():
    """서버 상태 확인"""
    return jsonify({
        "status": "running",
        "service": "HWP Parser Server",
        "timestamp": datetime.now().isoformat(),
        "port": 28091
    })

@app.route('/parse', methods=['POST'])
def parse_hwp():
    """
    HWP 파일을 받아서 텍스트 내용을 추출합니다.

    Request:
        - Content-Type: multipart/form-data
        - hwpFile: HWP 파일
        - formName: (선택) 폼 이름

    Response:
        JSON 형태로 추출된 텍스트와 메타데이터 반환
    """
    try:
        print(f"[{datetime.now()}] HWP 파싱 요청 받음")

        # 파일 확인
        if 'hwpFile' not in request.files:
            return jsonify({
                "success": False,
                "error": "HWP 파일이 없습니다.",
                "message": "hwpFile 필드가 필요합니다."
            }), 400

        hwp_file = request.files['hwpFile']
        form_name = request.form.get('formName', 'unknown')

        if hwp_file.filename == '':
            return jsonify({
                "success": False,
                "error": "파일이 선택되지 않았습니다.",
                "message": "유효한 HWP 파일을 선택해주세요."
            }), 400

        print(f"파일명: {hwp_file.filename}, 폼명: {form_name}")

        # 임시 파일로 저장
        with tempfile.NamedTemporaryFile(delete=False, suffix='.hwp') as tmp_file:
            hwp_file.save(tmp_file.name)
            temp_path = tmp_file.name

        try:
            # HWP 텍스트 추출
            print("HWP 텍스트 추출 시작...")
            extracted_text = extract_hwp_text(temp_path)
            print(f"추출된 텍스트 길이: {len(extracted_text)} 문자")

            # 응답 데이터 구성
            response_data = {
                "success": True,
                "message": "HWP 파싱 완료",
                "data": {
                    "fileName": hwp_file.filename,
                    "formName": form_name,
                    "extractedText": extracted_text,
                    "textLength": len(extracted_text),
                    "timestamp": datetime.now().isoformat()
                }
            }

            print("HWP 파싱 성공")
            return jsonify(response_data)

        finally:
            # 임시 파일 정리
            try:
                os.unlink(temp_path)
            except:
                pass

    except Exception as e:
        print(f"HWP 파싱 오류: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "HWP 파싱 중 오류가 발생했습니다."
        }), 500

@app.route('/save-template', methods=['POST'])
def save_template():
    """
    새로운 HWP 템플릿 파일을 templates 폴더에 저장합니다.

    Request:
        - hwpFile: 원본 HWP 파일
        - reportType: 양식 타입 (파일명으로 사용)
        - templateName: 저장할 템플릿 파일명
    """
    try:
        print(f"[{datetime.now()}] 템플릿 저장 요청 받음")

        if 'hwpFile' not in request.files:
            return jsonify({
                "success": False,
                "error": "HWP 파일이 없습니다."
            }), 400

        hwp_file = request.files['hwpFile']
        report_type = request.form.get('reportType', 'unknown')
        template_name = request.form.get('templateName', f'{report_type}.hwp')

        if not template_name.endswith('.hwp'):
            template_name += '.hwp'

        # templates 디렉토리 확인/생성
        templates_dir = os.path.join(os.path.dirname(__file__), 'templates')
        os.makedirs(templates_dir, exist_ok=True)

        # 템플릿 파일 저장
        template_path = os.path.join(templates_dir, template_name)
        hwp_file.save(template_path)

        print(f"템플릿 저장 완료: {template_path}")

        return jsonify({
            "success": True,
            "message": "템플릿 저장 완료",
            "data": {
                "reportType": report_type,
                "templateName": template_name,
                "templatePath": template_path,
                "timestamp": datetime.now().isoformat()
            }
        })

    except Exception as e:
        print(f"템플릿 저장 오류: {e}")
        traceback.print_exc()
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "템플릿 저장 중 오류가 발생했습니다."
        }), 500

@app.route('/generate', methods=['POST'])
def generate_hwp():
    """
    기존 HWP 생성 기능 (generate_server.py와 동일)
    템플릿 기반으로 HWP 문서를 생성합니다.
    """
    try:
        # 기존 generate_server.py의 로직을 여기에 포함
        # (생략 - 필요시 추가)
        return jsonify({
            "success": True,
            "message": "HWP 생성 기능은 별도 서버에서 처리됩니다.",
            "redirect": "generate_server.py"
        })

    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e),
            "message": "HWP 생성 중 오류가 발생했습니다."
        }), 500

if __name__ == '__main__':
    print("=" * 50)
    print("🔧 HWP Parser Server 시작")
    print("📡 포트: 28092 (SSH 터널을 통해 28090으로 연결)")
    print("🔗 Linux 서버 연결: ssh -N -R 0.0.0.0:28090:127.0.0.1:28092 root@211.188.56.255")
    print("=" * 50)

    app.run(host='127.0.0.1', port=28092, debug=True)