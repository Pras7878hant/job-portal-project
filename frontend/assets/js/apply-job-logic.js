// import { USER_API_END_POINT, JOB_API_END_POINT, APPLICATION_API_END_POINT } from './utils.js';

// // Ensure utils.js is loaded BEFORE this script for API_END_POINTs and axios defaults

// const applicationForm = document.getElementById('application-form'); // Changed ID to match HTML
// const jobDetailsSummaryDiv = document.getElementById('job-details-summary');
// const fullNameInput = document.getElementById('full-name'); // Corrected ID to match HTML
// const emailInput = document.getElementById('email');
// const phoneNumberInput = document.getElementById('phone-number'); // Corrected ID to match HTML
// const messageDiv = document.getElementById('message');
// const backToJobDetailsBtn = document.getElementById('back-to-job-details');

// let currentJobId = null; // Store job ID globally for this script

// document.addEventListener('DOMContentLoaded', async () => {
//      const role = localStorage.getItem('role');
//      const token = localStorage.getItem('token');
//      const urlParams = new URLSearchParams(window.location.search);
//      currentJobId = urlParams.get('id'); // Get jobId from URL

//      if (!role || role !== 'student' || !token) {
//           alert("You must be logged in as a student to apply for jobs. Redirecting to login.");
//           window.location.href = 'login.html';
//           return;
//      }

//      if (!currentJobId) {
//           jobDetailsSummaryDiv.innerHTML = '<p class="error-message">Job ID not found in URL. Cannot apply.</p>';
//           if (applicationForm) { // Check if form exists before trying to hide it
//                applicationForm.style.display = 'none'; // Hide form if no job ID
//           }
//           return;
//      }

//      // Set the back button's href dynamically
//      if (backToJobDetailsBtn) {
//           backToJobDetailsBtn.href = `job-details.html?id=${currentJobId}`;
//      }

//      await fetchJobAndStudentDetails(currentJobId, token); // Pass token to function
// });

// async function fetchJobAndStudentDetails(jobId, token) { // Accept token as argument
//      try {
//           // Fetch job details to display context
//           const jobResponse = await axios.get(`${JOB_API_END_POINT}/${jobId}`);
//           const job = jobResponse.data.job;

//           if (job) {
//                jobDetailsSummaryDiv.innerHTML = `
//                 <h3>${job.title}</h3>
//                 <p><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
//                 <p><strong>Location:</strong> ${job.location}</p>
//                 <p><strong>Salary:</strong> ${job.salary ? `$${job.salary.toLocaleString()}` : 'N/A'}</p>
//             `;
//           } else {
//                jobDetailsSummaryDiv.innerHTML = '<p class="error-message">Job details not found.</p>';
//                if (applicationForm) {
//                     applicationForm.style.display = 'none';
//                }
//           }

//           // Fetch student profile details to pre-fill the form
//           const studentProfileResponse = await axios.get(`${USER_API_END_POINT}/profile`, {
//                headers: {
//                     Authorization: `Bearer ${token}` // Send token for authentication
//                }
//           });
//           const student = studentProfileResponse.data.user; // Assuming response has a 'user' object

//           if (student) {
//                // Ensure these IDs match your HTML input fields
//                if (fullNameInput) fullNameInput.value = student.fullName || '';
//                if (emailInput) emailInput.value = student.email || '';
//                if (phoneNumberInput) phoneNumberInput.value = student.phone || ''; // Make sure your user model has a 'phone' field and it's named 'phone'
//           } else {
//                console.warn('Could not fetch student profile to pre-fill form.');
//                // Allow user to manually enter if profile fetch fails
//                if (fullNameInput) fullNameInput.readOnly = false;
//                if (emailInput) emailInput.readOnly = false;
//                if (phoneNumberInput) phoneNumberInput.readOnly = false;
//           }

//      } catch (error) {
//           console.error('Error fetching job or student details:', error);
//           jobDetailsSummaryDiv.innerHTML = '<p class="error-message">Failed to load details. Please try again.</p>';
//           if (applicationForm) {
//                applicationForm.style.display = 'none';
//           }
//           if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//                alert("Session expired or unauthorized. Please log in again.");
//                localStorage.removeItem('role');
//                localStorage.removeItem('token');
//                window.location.href = 'login.html';
//           }
//      }
// }

// // Event listener for form submission (using the corrected form ID)
// if (applicationForm) {
//      applicationForm.addEventListener('submit', async (e) => {
//           e.preventDefault();

//           const formData = new FormData(); // FormData for file uploads
//           formData.append('jobId', currentJobId);
//           formData.append('coverLetter', document.getElementById('cover-letter').value); // Corrected ID
//           formData.append('resume', document.getElementById('resume').files[0]); // Get the file object

//           displayMessage('Submitting application...', 'info'); // Show a loading message

//           try {
//                // You need to create this backend endpoint for application submission
//                // e.g., POST /api/v1/application/apply/:jobId
//                const response = await axios.post(`${APPLICATION_API_END_POINT}/apply/${currentJobId}`, formData, {
//                     headers: {
//                          'Content-Type': 'multipart/form-data', // IMPORTANT for file uploads
//                          Authorization: `Bearer ${localStorage.getItem('token')}` // Send token for authentication
//                     },
//                     withCredentials: true
//                });

//                if (response.data.success) {
//                     displayMessage('Application submitted successfully!', 'success');
//                     applicationForm.reset(); // Clear form
//                     // Optionally, disable submit button to prevent re-submission
//                     const submitBtn = document.querySelector('button[type="submit"]'); // Target submit button
//                     if (submitBtn) submitBtn.disabled = true;
//                     setTimeout(() => {
//                          window.location.href = `applied-jobs.html`; // Redirect to applied jobs page
//                     }, 2000);
//                } else {
//                     displayMessage(response.data.message || 'Failed to submit application.', 'error');
//                }
//           } catch (error) {
//                console.error('Error submitting application:', error);
//                const errorMessage = error.response?.data?.message || 'An error occurred while submitting your application. Please try again.';
//                displayMessage(errorMessage, 'error');
//                if (error.response && (error.response.status === 401 || error.response.status === 403)) {
//                     alert("Session expired or unauthorized. Please log in again.");
//                     localStorage.removeItem('role');
//                     localStorage.removeItem('token');
//                     window.location.href = 'login.html';
//                }
//           }
//      });
// }


// function displayMessage(msg, type) {
//      if (messageDiv) {
//           messageDiv.textContent = msg;
//           messageDiv.className = `message ${type}`; // Add type class for styling
//           messageDiv.style.display = 'block';
//      }
// }