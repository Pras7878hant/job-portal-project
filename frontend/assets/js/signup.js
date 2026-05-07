import { USER_API_END_POINT, displayMessage } from './utils.js';

const form = document.getElementById('signup-form');

if (form) {
     form.addEventListener('submit', async (event) => {
          event.preventDefault();

          const requestBody = {
               fullName: form.fullName.value.trim(),
               email: form.email.value.trim(),
               phone: form.phoneNumber.value.trim(),
               password: form.password.value,
               role: form.role.value
          };

          if (!requestBody.fullName || !requestBody.email || !requestBody.phone || !requestBody.password || !requestBody.role) {
               displayMessage('Please fill in all fields.', 'error');
               return;
          }

          try {
               const response = await axios.post(`${USER_API_END_POINT}/register`, requestBody, {
                    withCredentials: true
               });

               if (response.data.success) {
                    displayMessage(response.data.message || 'Account created successfully. Please log in.', 'success');
                    setTimeout(() => {
                         window.location.href = 'login.html';
                    }, 900);
               } else {
                    displayMessage(response.data.message || 'Sign up failed.', 'error');
               }
          } catch (error) {
               displayMessage(error.response?.data?.message || 'Sign up failed. Please try again.', 'error');
          }
     });
}
