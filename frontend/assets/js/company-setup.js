import { COMPANY_API_END_POINT, displayMessage, handleLogout } from './utils.js';

const companySetupForm = document.getElementById('company-setup-form');
const messageElement = document.getElementById('message');
const logoutBtn = document.getElementById('logoutBtn');

document.addEventListener('DOMContentLoaded', async () => {
     const userRole = localStorage.getItem('userRole');

     if (!userRole) {
          alert("You are not logged in. Redirecting to login.");
          window.location.href = '../login.html';
          return;
     } else if (userRole !== 'recruiter') {
          alert("You are not authorized to register companies.");
          window.location.href = userRole === 'student' ? '../student/dashboard.html' : '../browse.html';
          return;
     }

     if (logoutBtn) {
          logoutBtn.addEventListener('click', handleLogout);
     }
});


companySetupForm.addEventListener('submit', async (event) => {
     event.preventDefault();

     const companyName = document.getElementById('company-name').value.trim();
     const companyDescription = document.getElementById('company-description').value.trim();
     const companyWebsite = document.getElementById('company-website').value.trim();
     const companyLocation = document.getElementById('company-location').value.trim();
     const token = localStorage.getItem('token');

     if (!token) {
          displayMessage('Authentication token is missing. Please log in again.', 'error');
          localStorage.removeItem('userRole');
          window.location.href = '../login.html';
          return;
     }

     if (!companyName || !companyDescription) {
          displayMessage('Company name and description are required.', 'error');
          return;
     }

     const requestBody = {
          name: companyName,
          description: companyDescription,
     };
     if (companyWebsite) {
          requestBody.website = companyWebsite;
     }
     if (companyLocation) { // New: Add location to request body if it exists
          requestBody.location = companyLocation;
     }

     try {
          const response = await axios.post(
               `${COMPANY_API_END_POINT}/register`,
               requestBody,
               {
                    headers: {
                         'Authorization': `Bearer ${token}`
                    }
               }
          );

          if (response.data.success) {
               displayMessage(response.data.message || 'Company registered successfully!', 'success');
               companySetupForm.reset();
          } else {
               displayMessage(response.data.message || 'Failed to register company.', 'error');
          }
     } catch (error) {
          console.error('Error registering company:', error);

          if (error.response) {
               console.error('Server error response data:', error.response.data);
               console.error('Server error status:', error.response.status);

               const backendMessage = error.response.data.message;

               if (error.response.status === 400) {
                    displayMessage(`Validation Error: ${backendMessage || 'Please check your inputs.'}`, 'error');
               } else if (error.response.status === 401 || error.response.status === 403) {
                    alert("Session expired or unauthorized. Please log in again.");
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('token');
                    window.location.href = '../login.html';
               } else if (error.response.status === 409) {
                    displayMessage(`Conflict: ${backendMessage || 'Company with this name already exists.'}`, 'error');
               } else {
                    displayMessage(`Error: ${backendMessage || 'Something went wrong on the server.'}`, 'error');
               }
          } else if (error.request) {
               displayMessage('No response from server. Please check if the backend is running and accessible.', 'error');
          } else {
               displayMessage(`An unexpected error occurred: ${error.message}`, 'error');
          }
     }
});