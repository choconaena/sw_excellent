const axios = require('axios');

// Base URL of your API
const BASE_URL = 'http://127.0.0.1:3000/db/users';

// Function to get a user by ID
async function getUser(userId) {
    try {
        const response = await axios.get(`${BASE_URL}/${userId}`);
        console.log('User retrieved:', response.data);
    } catch (error) {
        console.error('Error retrieving user:', error.response ? error.response.data : error.message);
    }
}

// Function to create a new user
async function createUser(userData) {
    try {
        const response = await axios.post(BASE_URL, userData);
        console.log('User created:', response.data);
    } catch (error) {
        console.error('Error creating user:', error.response ? error.response.data : error.message);
    }
}

// Function to update a user by ID
async function updateUser(userId, userData) {
    try {
        const response = await axios.put(`${BASE_URL}/${userId}`, userData);
        console.log('User updated:', response.data);
    } catch (error) {
        console.error('Error updating user:', error.response ? error.response.data : error.message);
    }
}

// Function to delete a user by ID
async function deleteUser(userId) {
    try {
        const response = await axios.delete(`${BASE_URL}/${userId}`);
        console.log('User deleted:', response.data);
    } catch (error) {
        console.error('Error deleting user:', error.response ? error.response.data : error.message);
    }
}

// Example usage
(async () => {
    // Replace these values with actual user data for testing
    const newUser = {
        name: 'John Doe',
        phoneNumber: '123-456-7890',
        email: 'john.doe@example.com',
        birthdate: '1990-01-01',
        gender: 'Male',
        permission: 'User'
    };

    // Create a new user
    await createUser(newUser);

    // Get a user by ID
    await getUser(2);

    // Update a user by ID
    const updatedUserData = {
        name: 'Jane Doe',
        phoneNumber: '098-765-4321',
        email: 'jane.doe@example.com',
        birthdate: '1992-02-02',
        gender: 'Female',
        permission: 'Admin'
    };
    await updateUser(1, updatedUserData);

    // Delete a user by ID
    // await deleteUser(1);
})();
