import { USER_API_END_POINT } from './utils.js';

function showMessage(message, color = 'red') {
     const loginMessage = document.getElementById('login-message');
     if (loginMessage) {
          loginMessage.textContent = message;
          loginMessage.style.color = color === 'success' ? 'green' : color;
     }
}

document.addEventListener('DOMContentLoaded', () => {
     const form = document.getElementById('login-form');
     const step1 = document.getElementById('step-1');
     const step2 = document.getElementById('step-2');
     const submitBtn = document.getElementById('submit-btn');
     
     let currentStep = 1;
     let loginEmail = '';

     if (!form) return;

     form.addEventListener('submit', async (e) => {
          e.preventDefault();

          if (currentStep === 1) {
               const email = form.email.value.trim();
               const password = form.password.value.trim();
               const role = form.role.value;

               if (!email || !password || !role) {
                    showMessage('Please enter email, password, and select your role.');
                    return;
               }

               try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Verifying Credentials...";

                    const response = await fetch(`${USER_API_END_POINT}/login/send-otp`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         credentials: 'include',
                         body: JSON.stringify({ email, password, role })
                    });

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                         submitBtn.disabled = false;
                         submitBtn.textContent = "Request Login OTP";
                         showMessage(data.message || 'Verification failed.');
                         return;
                    }

                    loginEmail = email;
                    step1.classList.add('hidden');
                    step2.classList.remove('hidden');
                    currentStep = 2;
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Secure Login";
                    showMessage('', 'black');

               } catch (error) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Request Login OTP";
                    showMessage('Network error. Make sure backend is running.');
               }

          } else if (currentStep === 2) {
               const otp = form.otp.value.trim();
               
               if (otp.length !== 6) {
                    showMessage('Please enter a valid 6-digit OTP.');
                    return;
               }

               try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Logging in...";

                    const response = await fetch(`${USER_API_END_POINT}/login/verify`, {
                         method: 'POST',
                         headers: { 'Content-Type': 'application/json' },
                         credentials: 'include',
                         body: JSON.stringify({ email: loginEmail, otp })
                    });

                    const data = await response.json();

                    if (!response.ok || !data.success) {
                         submitBtn.disabled = false;
                         submitBtn.textContent = "Secure Login";
                         showMessage(data.message || 'Invalid OTP.');
                         return;
                    }

                    const user = data.user;
                    localStorage.setItem('user', JSON.stringify(user));
                    localStorage.setItem('token', data.token);
                    localStorage.setItem('role', user.role);
                    localStorage.setItem('userRole', user.role);

                    showMessage('Login successful! Redirecting...', 'success');

                    setTimeout(() => {
                         if (user.role === 'recruiter') {
                              window.location.href = 'post-job.html';
                         } else if (user.role === 'student') {
                              window.location.href = 'browse.html';
                         } else {
                              window.location.href = 'index.html';
                         }
                    }, 1000);

               } catch (error) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Secure Login";
                    showMessage('Login failed. Network error.');
               }
          }
     });
});