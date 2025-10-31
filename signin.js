// Configure API base URL. Change this if your backend runs on a different host/port.
const API_BASE = window.__API_BASE__ || 'http://127.0.0.1:3000';

document.addEventListener('DOMContentLoaded', () => {
    const signInForm = document.querySelector('form');
    
    if (signInForm) {
        signInForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            
            try {
                const response = await fetch(`${API_BASE}/api/signin`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    // Store the auth token
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('userData', JSON.stringify(data.user));
                    
                    // Redirect to dashboard
                    window.location.href = '/dashboard.html';
                } else {
                    alert(data.message || 'Sign in failed');
                }
            } catch (error) {
                console.error('Error:', error);
                alert('An error occurred during sign in');
            }
        });
    }
});