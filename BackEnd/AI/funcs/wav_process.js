const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');

function wavProcess(newFilePath) {
    return new Promise((resolve, reject) => {
        //const uploadsPath = path.join(__dirname, '../../uploads');
        //const targetwavname = getLatestCreatedWavFile(uploadsPath);
        const targetwavname = newFilePath
        const scriptPath = path.resolve(__dirname, '../../AI/funcs/python/wav_to_txt_process.py');

        const command = 'python3';
        const args = ['-u', scriptPath, targetwavname]; // Add -u here

        console.log(`Executing Python script: ${command} ${args.join(' ')}`);

        const pythonProcess = spawn(command, args);

        let output = '';
        let errorOutput = '';

        pythonProcess.stdout.on('data', (data) => {
            const message = data.toString();
            console.log(`Python stdout: ${message}`); // Log Python output
            output += message;
        });

        pythonProcess.stderr.on('data', (data) => {
            const errorMessage = data.toString();
            console.error(`Python stderr: ${errorMessage}`);
            errorOutput += errorMessage;
        });

        pythonProcess.on('close', (code) => {
            if (code !== 0) {
                console.error(`Python script exited with code ${code}`);
                return reject(new Error(errorOutput || `Exit code: ${code}`));
            }
            resolve(output.trim());
        });
    });
}


// 가장 최근에 생성된 .wav 파일 찾기
/*
function getLatestCreatedWavFile(directory) {
    const files = fs.readdirSync(directory); // 디렉터리 내 파일 목록 읽기
    const wavFiles = files
        .filter(file => file.endsWith('.wav')) // .wav 확장자 필터
        .map(file => {
            const filePath = path.join(directory, file);
            const stats = fs.statSync(filePath); // 파일 정보 가져오기
            return {
                name: file,
                path: filePath,
                birthtime: stats.birthtime // 생성 시간
            };
        })
        .sort((a, b) => b.birthtime - a.birthtime); // 생성 시간 기준 내림차순 정렬

    return wavFiles.length > 0 ? wavFiles[0].path : null; // 가장 최근 파일 경로 반환
}
*/

module.exports = {
    wavProcess
};
