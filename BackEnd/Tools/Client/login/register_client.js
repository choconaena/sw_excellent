const axios = require('axios');

async function registerUser() {
    const registerData = {
        name: 'John Doe',
        phoneNumber: '01012345678',
        email: 'johndoe2@example.com',
        birthdate: '1995-08-15',
        gender: 0,            // 또는 'female'
        permission: 1,         // 예: 'user', 'admin' 등 역할 기반 권한
        password: 'asdf1234',
    };

    try {
        const response = await axios.post('http://211.188.55.88:3000/db/register', registerData);
        console.log('Register Success:', response.data);
    } catch (error) {
        console.error('Register Error:', error.response ? error.response.data : error.message);
    }
}

registerUser();
