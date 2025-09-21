/**
 * 양식 관리 API 라우팅
 */

const express = require('express');
const router = express.Router();
const formDb = require('../database/formSchemas');

// 양식 목록 조회
router.get('/', getForms);

// 특정 양식 조회
router.get('/:id', getForm);

// 양식 수정
router.put('/:id', updateForm);

// 양식 삭제/비활성화
router.delete('/:id', deleteForm);

// 양식 활성화/비활성화 토글
router.post('/:id/toggle', toggleForm);

/**
 * 양식 목록 조회 API
 */
async function getForms(req, res) {
    try {
        const includeDisabled = req.query.includeDisabled === 'true';
        const result = formDb.getForms(includeDisabled);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: '양식 목록 조회 완료'
            });
        } else {
            res.status(500).json({
                success: false,
                error: result.error,
                message: '양식 목록 조회 실패'
            });
        }
    } catch (error) {
        console.error('양식 목록 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '양식 목록 조회 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 특정 양식 조회 API
 */
async function getForm(req, res) {
    try {
        const { id } = req.params;
        const result = formDb.getForm(id);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: '양식 조회 완료'
            });
        } else {
            res.status(404).json({
                success: false,
                error: result.error,
                message: '양식을 찾을 수 없습니다.'
            });
        }
    } catch (error) {
        console.error('양식 조회 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '양식 조회 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 양식 수정 API
 */
async function updateForm(req, res) {
    try {
        const { id } = req.params;
        const updateData = req.body;

        console.log('양식 수정 요청:', { id, updateData });

        const result = formDb.updateForm(id, updateData);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: '양식 수정 완료'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                message: '양식 수정 실패'
            });
        }
    } catch (error) {
        console.error('양식 수정 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '양식 수정 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 양식 삭제 API
 */
async function deleteForm(req, res) {
    try {
        const { id } = req.params;

        console.log('양식 삭제 요청:', { id });

        const result = formDb.deleteForm(id);

        if (result.success) {
            res.json({
                success: true,
                data: result.data,
                message: result.message || '양식 삭제 완료'
            });
        } else {
            res.status(400).json({
                success: false,
                error: result.error,
                message: '양식 삭제 실패'
            });
        }
    } catch (error) {
        console.error('양식 삭제 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '양식 삭제 중 오류가 발생했습니다.'
        });
    }
}

/**
 * 양식 활성화/비활성화 토글 API
 */
async function toggleForm(req, res) {
    try {
        const { id } = req.params;

        console.log('양식 토글 요청:', { id });

        // 현재 양식 상태 조회
        const getResult = formDb.getForm(id);
        if (!getResult.success) {
            return res.status(404).json({
                success: false,
                error: '양식을 찾을 수 없습니다.',
                message: '양식 토글 실패'
            });
        }

        const currentForm = getResult.data;
        const newEnabled = !currentForm.enabled;

        // 상태 업데이트
        const updateResult = formDb.updateForm(id, { enabled: newEnabled });

        if (updateResult.success) {
            res.json({
                success: true,
                data: updateResult.data,
                message: `양식이 ${newEnabled ? '활성화' : '비활성화'}되었습니다.`
            });
        } else {
            res.status(400).json({
                success: false,
                error: updateResult.error,
                message: '양식 상태 변경 실패'
            });
        }
    } catch (error) {
        console.error('양식 토글 API 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message,
            message: '양식 상태 변경 중 오류가 발생했습니다.'
        });
    }
}

module.exports = router;