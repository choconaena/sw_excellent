const axios = require('axios');

async function loginUser() {
    const loginData = {
        email: 'johndoe@example.com',
        password: 'asdf1234'
    };
    // const loginData = {
    //     email: 'jenny7732@naver.com',
    //     password: 'asdf1234'
    // };

    try {
        const response = await axios.post('http://211.188.55.88:23000/db/login', loginData);
        console.log('Login Success:', response.data);
    } catch (error) {
        console.error('Login Error:', error.response ? error.response.data : error.message);
    }
}

loginUser();

