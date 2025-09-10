const { exec } = require('child_process');

function callAiFuncUsingSTTAbstractLocalFunc(param1, param2) {
    return new Promise((resolve, reject) => {
        const command = `python3 ./llm/stt_origin_to_abstract.py "${param1}" "${param2}"`;

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
            resolve(stdout);
        });
    });
}

module.exports = {
    callAiFuncUsingSTTAbstractLocalFunc
};

