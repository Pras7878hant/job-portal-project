function showMessage(message, color = 'red') {
     const loginMessage = document.getElementById('login-message');
     if (loginMessage) {
          loginMessage.textContent = message;
          loginMessage.style.color = color;
     }
}

document.addEventListener('DOMContentLoaded', () => {
     const form = document.getElementById('login-form');
     if (!form) return;

     form.addEventListener('submit', async (e) => {
          e.preventDefault();

          const email = form.email.value.trim();
          const password = form.password.value.trim();
          const role = form.role.value;

          if (!email || !password || !role) {
               showMessage('Please enter email, password, and select your role.');
               return;
          }

          try {
               const response = await fetch('http://localhost:8000/api/v1/user/login', {
                    method: 'POST',
                    headers: {
                         'Content-Type': 'application/json'
                    },
                    credentials: 'include',
                    body: JSON.stringify({ email, password, role })
               });

               const data = await response.json();

               if (!response.ok || !data.success) {
                    showMessage(data.message || 'Login failed.');
                    return;
               }

               const user = data.user;
               localStorage.setItem('user', JSON.stringify(user));
               localStorage.setItem('token', data.token);
               localStorage.setItem('role', user.role);
               localStorage.setItem('userRole', user.role);

               showMessage('Login successful! Redirecting...', 'green');

               if (user.role === 'recruiter') {
                    window.location.href = 'post-job.html';
               } else if (user.role === 'student') {
                    window.location.href = 'browse.html';
               } else {
                    window.location.href = 'index.html';
               }
          } catch (error) {
               console.error('Login request error:', error);
               showMessage('Login failed. Please make sure backend is running and try again.');
          }
     });
});
