const axios = require('axios');

async function callAiFuncUsingWeb() {
    try {
        const response = await axios.get('http://127.0.0.1:24001/run_python_function');
        console.log('Python server response:', response.data.result);
        return response.data.result;
    } catch (error) {
        console.error('Error while communicating with Python server:', error);
        throw error;
    }
}

module.exports = {
    callAiFuncUsingWeb
};
