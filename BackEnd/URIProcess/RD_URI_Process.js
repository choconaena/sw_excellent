const express = require('express');
const router = express.Router();
const remoteDataModule = require('../REMOTEDATA/rd_api');

// Remote Data 모듈 라우팅
router.get('/', (req, res) => {
    remoteDataModule.runRemoteDataFunction();
    res.send('Remote Data module executed');
});

module.exports = router;
