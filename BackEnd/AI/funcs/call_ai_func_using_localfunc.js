const { exec } = require('child_process');

function callAiFuncUsingLocalFunc() {
    return new Promise((resolve, reject) => {
        exec('python3 ./Tools/example_python_func/helloworld.py', (error, stdout, stderr) => {
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
    callAiFuncUsingLocalFunc
};
