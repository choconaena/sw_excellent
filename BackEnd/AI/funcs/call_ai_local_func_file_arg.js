const { exec } = require('child_process');

// call file_process with .wav
function callAiLocalFuncFileArg(filePath) {
    return new Promise((resolve, reject) => {
        // Add the file path as a parameter to the Python script
        const command = `python3 ./AI/funcs/python/file_process.py "${filePath}"`;

        exec(command, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error executing Python script: ${error.message}`);
                return reject(error);
            }
            if (stderr) {
                console.error(`Python script error: ${stderr}`);
                return reject(stderr);
            }
            console.log(`Python script output: ${stdout}`);
            resolve(stdout.trim());
        });
    });
}

module.exports = {
    callAiLocalFuncFileArg
};
