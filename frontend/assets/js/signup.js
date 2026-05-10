import { USER_API_END_POINT, displayMessage } from './utils.js';

const form = document.getElementById('signup-form');
const step1 = document.getElementById('step-1');
const step2 = document.getElementById('step-2');
const submitBtn = document.getElementById('submit-btn');
const messageDiv = document.getElementById('message');

let currentStep = 1;
let registeredEmail = '';

if (form) {
     form.addEventListener('submit', async (event) => {
          event.preventDefault();
          displayMessage(messageDiv, 'Processing...', 'info');

          if (currentStep === 1) {
               const requestBody = {
                    fullName: form.fullName.value.trim(),
                    email: form.email.value.trim(),
                    phone: form.phoneNumber.value.trim(),
                    password: form.password.value,
                    role: form.role.value
               };

               if (!requestBody.fullName || !requestBody.email || !requestBody.phone || !requestBody.password || !requestBody.role) {
                    displayMessage(messageDiv, 'Please fill in all fields.', 'error');
                    return;
               }

               try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Sending Email...";

                    const response = await axios.post(`${USER_API_END_POINT}/register/send-otp`, requestBody, { withCredentials: true });

                    if (response.data.success) {
                         registeredEmail = requestBody.email;
                         step1.classList.add('hidden');
                         step2.classList.remove('hidden');
                         currentStep = 2;
                         submitBtn.textContent = "Verify & Create Account";
                         submitBtn.disabled = false;
                         displayMessage(messageDiv, '', 'info'); 
                    }
               } catch (error) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Send Verification OTP";
                    displayMessage(messageDiv, error.response?.data?.message || 'Failed to send OTP. Please try again.', 'error');
               }
          } else if (currentStep === 2) {
               const otp = form.otp.value.trim();
               if (otp.length !== 6) {
                    displayMessage(messageDiv, 'Please enter a valid 6-digit OTP.', 'error');
                    return;
               }

               try {
                    submitBtn.disabled = true;
                    submitBtn.textContent = "Verifying...";

                    const response = await axios.post(`${USER_API_END_POINT}/register/verify`, { email: registeredEmail, otp }, { withCredentials: true });

                    if (response.data.success) {
                         const color = response.data.status === 'Pending' ? 'orange' : 'success';
                         displayMessage(messageDiv, response.data.message, color);
                         
                         setTimeout(() => window.location.href = 'login.html', 3000);
                    }
               } catch (error) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = "Verify & Create Account";
                    displayMessage(messageDiv, error.response?.data?.message || 'Invalid OTP.', 'error');
               }
          }
     });
}