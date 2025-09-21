/**
 * 동적 생성된 양식 스키마들을 관리하는 데이터베이스 모듈
 */

const fs = require('fs');
const path = require('path');

// 양식 데이터 저장 경로
const FORMS_DATA_PATH = path.join(__dirname, 'generated_forms.json');

/**
 * 기본 양식 데이터 구조
 */
const DEFAULT_FORMS = [
    {
        id: 'information_open',
        title: '정보공개청구',
        icon: '📋',
        requiresRecording: true,
        isSystem: true,
        route: 'https://yangcheon.ai.kr:28443/정보공개청구',
        tabletRoute: 'https://yangcheon.ai.kr:28443/tablet/consultation?view=form&step=consent-collection',
        createdAt: new Date().toISOString(),
        enabled: true
    },
    {
        id: 'construction_machinery_license',
        title: '건설기계조종사면허(재)발급',
        icon: '🚜',
        requiresRecording: false,
        isSystem: true,
        route: 'https://yangcheon.ai.kr:28443/건설기계조종사면허',
        tabletRoute: 'https://yangcheon.ai.kr:28443/tablet/construction-equipment-operator?step=1',
        createdAt: new Date().toISOString(),
        enabled: true
    }
];

/**
 * 양식 데이터 파일 읽기
 */
function loadForms() {
    try {
        if (fs.existsSync(FORMS_DATA_PATH)) {
            const data = fs.readFileSync(FORMS_DATA_PATH, 'utf8');
            const forms = JSON.parse(data);

            // 기본 양식들이 없으면 추가
            const existingIds = forms.map(f => f.id);
            DEFAULT_FORMS.forEach(defaultForm => {
                if (!existingIds.includes(defaultForm.id)) {
                    forms.unshift(defaultForm); // 기본 양식은 맨 앞에
                }
            });

            return forms;
        } else {
            // 파일이 없으면 기본 양식들로 초기화
            saveForms(DEFAULT_FORMS);
            return DEFAULT_FORMS;
        }
    } catch (error) {
        console.error('양식 데이터 로드 오류:', error);
        return DEFAULT_FORMS;
    }
}

/**
 * 양식 데이터 파일 저장
 */
function saveForms(forms) {
    try {
        const dataDir = path.dirname(FORMS_DATA_PATH);
        if (!fs.existsSync(dataDir)) {
            fs.mkdirSync(dataDir, { recursive: true });
        }

        fs.writeFileSync(FORMS_DATA_PATH, JSON.stringify(forms, null, 2), 'utf8');
        console.log('양식 데이터 저장 완료:', FORMS_DATA_PATH);
        return true;
    } catch (error) {
        console.error('양식 데이터 저장 오류:', error);
        return false;
    }
}

/**
 * 새로운 양식 추가
 */
function addForm(formData) {
    try {
        const forms = loadForms();

        // ID 중복 체크
        if (forms.find(f => f.id === formData.id)) {
            return { success: false, error: '이미 존재하는 양식 ID입니다.' };
        }

        const newForm = {
            id: formData.id || formData.reportType,
            title: formData.title || formData.formName,
            icon: formData.icon || '📄',
            requiresRecording: true, // 동적 양식은 모두 STT 사용
            isSystem: false, // 사용자 생성 양식
            route: `https://yangcheon.ai.kr:28443/${formData.title || formData.formName}`,
            tabletRoute: `https://yangcheon.ai.kr:28443/tablet/dynamic-consultation?form=${encodeURIComponent(formData.title || formData.formName)}&step=form&substep=1`,
            schema: formData.schema, // 전체 스키마 저장
            createdAt: new Date().toISOString(),
            enabled: true,
            formName: formData.formName,
            fileName: formData.fileName
        };

        // 사용자 생성 양식은 기본 양식 다음에 추가
        const systemForms = forms.filter(f => f.isSystem);
        const userForms = forms.filter(f => !f.isSystem);

        userForms.push(newForm);
        const updatedForms = [...systemForms, ...userForms];

        if (saveForms(updatedForms)) {
            console.log('새 양식 추가 완료:', newForm.title);
            return { success: true, data: newForm };
        } else {
            return { success: false, error: '양식 저장 실패' };
        }

    } catch (error) {
        console.error('양식 추가 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 양식 목록 조회
 */
function getForms(includeDisabled = false) {
    try {
        const forms = loadForms();
        if (includeDisabled) {
            return { success: true, data: forms };
        } else {
            return { success: true, data: forms.filter(f => f.enabled) };
        }
    } catch (error) {
        console.error('양식 목록 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 특정 양식 조회
 */
function getForm(formId) {
    try {
        const forms = loadForms();
        const form = forms.find(f => f.id === formId);
        if (form) {
            return { success: true, data: form };
        } else {
            return { success: false, error: '양식을 찾을 수 없습니다.' };
        }
    } catch (error) {
        console.error('양식 조회 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 양식 수정
 */
function updateForm(formId, updateData) {
    try {
        const forms = loadForms();
        const index = forms.findIndex(f => f.id === formId);

        if (index === -1) {
            return { success: false, error: '양식을 찾을 수 없습니다.' };
        }

        // 시스템 양식은 제한적으로만 수정 가능
        if (forms[index].isSystem) {
            const allowedFields = ['enabled', 'title', 'icon'];
            const filteredUpdate = {};
            allowedFields.forEach(field => {
                if (updateData[field] !== undefined) {
                    filteredUpdate[field] = updateData[field];
                }
            });
            updateData = filteredUpdate;
        }

        forms[index] = { ...forms[index], ...updateData, updatedAt: new Date().toISOString() };

        if (saveForms(forms)) {
            return { success: true, data: forms[index] };
        } else {
            return { success: false, error: '양식 저장 실패' };
        }

    } catch (error) {
        console.error('양식 수정 오류:', error);
        return { success: false, error: error.message };
    }
}

/**
 * 양식 삭제 (시스템 양식은 비활성화만 가능)
 */
function deleteForm(formId) {
    try {
        const forms = loadForms();
        const form = forms.find(f => f.id === formId);

        if (!form) {
            return { success: false, error: '양식을 찾을 수 없습니다.' };
        }

        if (form.isSystem) {
            // 시스템 양식은 비활성화만
            return updateForm(formId, { enabled: false });
        } else {
            // 사용자 양식은 완전 삭제
            const updatedForms = forms.filter(f => f.id !== formId);
            if (saveForms(updatedForms)) {
                return { success: true, message: '양식이 삭제되었습니다.' };
            } else {
                return { success: false, error: '양식 삭제 실패' };
            }
        }

    } catch (error) {
        console.error('양식 삭제 오류:', error);
        return { success: false, error: error.message };
    }
}

module.exports = {
    loadForms,
    saveForms,
    addForm,
    getForms,
    getForm,
    updateForm,
    deleteForm
};