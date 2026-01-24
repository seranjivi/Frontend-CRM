// Test CORS and API directly from browser console
// Copy and paste this into the browser console on the User Management page

async function testUserAPI() {
    
    // Check token
    const token = localStorage.getItem('token');
    
    if (!token) {
        console.error('No authentication token found!');
        return;
    }
    
    // Test API call
    try {
        
        const response = await fetch('http://localhost:8000/api/users', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        
       
        
        if (response.ok) {
            const data = await response.json();
            console.log('Success! Users data:', data);
            console.log('Number of users:', data.length);
        } else {
            const errorText = await response.text();
            console.error('API Error:', response.status, errorText);
        }
    } catch (error) {
        console.error('Network/CORS Error:', error);
    }
}

// Run the test
testUserAPI();
