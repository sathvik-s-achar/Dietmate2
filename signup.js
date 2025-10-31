document.addEventListener('DOMContentLoaded', () => {
    const signupForm = document.querySelector('form');
    
    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            password: document.getElementById('password').value
        };

        console.log('Attempting signup with:', { ...formData, password: '****' });

        try {
            const response = await fetch('http://localhost:3000/api/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            console.log('Response status:', response.status);
            
            // Check if the response has content
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                const data = await response.json();
                console.log('Response data:', data);

                if (response.ok) {
                    // Store both token and user data
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    // Redirect to dashboard
                    window.location.href = '/dashboard.html';
                } else {
                    alert(data.message || 'Signup failed. Please try again.');
                }
            } else {
                throw new Error('Server response was not JSON');
            }
        } catch (error) {
            console.error('Error during signup:', error);
            alert('An error occurred during signup. Please check the console for details.');
        }
    });
});