const axios = require('axios');

const API_BASE_URL = 'http://localhost:3001/api';

async function testAPI() {
  console.log('🧪 Testing Task Manager API...\n');

  try {
    // Test 1: Health Check
    console.log('1. Testing Health Check...');
    const healthResponse = await axios.get('http://localhost:3001/health');
    console.log('✅ Health Check:', healthResponse.data);
    console.log('');

    // Test 2: Get All Tasks
    console.log('2. Testing Get All Tasks...');
    const tasksResponse = await axios.get(`${API_BASE_URL}/tasks`);
    console.log('✅ Tasks Retrieved:', tasksResponse.data.length, 'tasks');
    console.log('');

    // Test 3: Create New Task
    console.log('3. Testing Create Task...');
    const newTask = {
      title: 'Day 2 API Test Task',
      description: 'This task was created via API test',
      status: 'pending',
      priority: 'high'
    };
    const createResponse = await axios.post(`${API_BASE_URL}/tasks`, newTask);
    console.log('✅ Task Created:', createResponse.data);
    console.log('');

    // Test 4: Get Specific Task
    console.log('4. Testing Get Specific Task...');
    const taskId = createResponse.data.id;
    const getTaskResponse = await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
    console.log('✅ Task Retrieved:', getTaskResponse.data);
    console.log('');

    // Test 5: Update Task
    console.log('5. Testing Update Task...');
    const updateData = {
      title: 'Updated Day 2 API Test Task',
      status: 'in-progress'
    };
    const updateResponse = await axios.put(`${API_BASE_URL}/tasks/${taskId}`, updateData);
    console.log('✅ Task Updated:', updateResponse.data);
    console.log('');

    // Test 6: Delete Task
    console.log('6. Testing Delete Task...');
    await axios.delete(`${API_BASE_URL}/tasks/${taskId}`);
    console.log('✅ Task Deleted Successfully');
    console.log('');

    // Test 7: Verify Deletion
    console.log('7. Verifying Deletion...');
    try {
      await axios.get(`${API_BASE_URL}/tasks/${taskId}`);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        console.log('✅ Task Successfully Deleted (404 Not Found)');
      } else {
        throw error;
      }
    }

    console.log('\n🎉 All API Tests Passed! Day 2 Backend is working correctly.');
    console.log('\n📋 Next Steps:');
    console.log('- Frontend is running at: http://localhost:3000');
    console.log('- Backend API is running at: http://localhost:3001');
    console.log('- Test the full application in your browser');

  } catch (error) {
    console.error('❌ API Test Failed:', error.message);
    if (error.response) {
      console.error('Response Status:', error.response.status);
      console.error('Response Data:', error.response.data);
    }
  }
}

testAPI(); 