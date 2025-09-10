const axios = require('axios');

async function updateSelectedAnswer() {
    const checklistId = 1; // 업데이트할 checklistId
    const url = `http://101.79.9.58:3000/db/checklists/${checklistId}/answer`;
    
    const data = {
        commentId: 1,
        consultantId: 1,
        clientId: 1,
        selectedAnswer: "Updated Answer Text"
    };
    
    try {
        const response = await axios.put(url, data, {
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        console.log('Response:', response.data);
    } catch (error) {
        console.error('Error:', error.response ? error.response.data : error.message);
    }
}

updateSelectedAnswer();
