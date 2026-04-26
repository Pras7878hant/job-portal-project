// frontend/assets/js/post-job.js

// Import necessary variables and functions from utils.js
// Assuming utils.js is in the same directory (assets/js/)
import { BASE_API_URL, AUTH_API_END_POINT, COMPANY_API_END_POINT, JOB_API_END_POINT, USER_API_END_POINT, APPLICATION_API_END_POINT, displayMessage, handleLogout } from './utils.js';

const welcomeMessage = document.getElementById('welcome-message');
const postJobForm = document.getElementById('post-job-form');
const messageDiv = document.getElementById('message'); // This is the general message div in the form
const companySelect = document.getElementById('company');
const companyRedirectMessageDiv = document.getElementById('company-redirect-message');
const logoutButton = document.querySelector('.logout-btn'); // Get logout button

/**
 * Displays a message in the main messageDiv (id="message").
 * @param {string} msg The message to display.
 * @param {string} type The type of message ('success', 'error', 'info', or 'hidden' to clear).
 */
function displayLocalMessage(msg, type) {
     messageDiv.textContent = msg;
     messageDiv.className = `message ${type}`;
     messageDiv.style.display = (type === 'hidden' || !msg) ? 'none' : 'block';
     // Hide other specific messages when displaying a general one
     if (type !== 'hidden') {
          companyRedirectMessageDiv.style.display = 'none';
     }
}


/**
 * Checks if the user is a logged-in recruiter using a backend endpoint.
 * This is more secure than relying solely on localStorage.
 * Assumes USER_API_END_POINT exists and is protected.
 * No 'Authorization' header needed if using HTTP-only cookies with withCredentials.
 */
async function verifyRecruiterSession() {
     // Rely on HttpOnly cookie for authentication.
     // No need to get token from localStorage.

     // Optional: Quick client-side check. If userRole is not present, skip backend call to save resources
     // if (!localStorage.getItem('userRole')) {
     //     console.log("No userRole found in localStorage. Redirecting to login.");
     //     displayLocalMessage("You are not logged in. Redirecting to login.", "error");
     //     setTimeout(() => window.location.href = '../login.html', 2000);
     //     return false;
     // }

     try {
          // Axios is configured with `withCredentials = true`, so the HttpOnly cookie will be sent automatically.
          // No need for 'Authorization' header here.
          const response = await axios.get(`${USER_API_END_POINT}/profile`);

          // Check if the response indicates success and the user's role is 'recruiter'
          if (response.data.success && response.data.user && response.data.user.role === 'recruiter') {
               console.log("Recruiter session verified successfully.");
               welcomeMessage.textContent = `Welcome, ${response.data.user.fullName || 'Recruiter'}!`;
               // It's good practice to ensure localStorage.userRole is also set/updated here
               localStorage.setItem('userRole', response.data.user.role);
               return true;
          } else {
               console.log("User is not a recruiter or session invalid.", response.data);
               displayLocalMessage("Access Denied: You do not have recruiter privileges. Redirecting...", "error");
               // Clear client-side userRole if backend says they are not a recruiter
               localStorage.removeItem('userRole');
               setTimeout(() => window.location.href = '../browse.html', 2000); // Redirect to a public page
               return false;
          }
     } catch (error) {
          console.error('Error verifying recruiter session:', error.response?.data?.message || error.message);
          const statusCode = error.response?.status;

          if (statusCode === 401 || statusCode === 403) {
               displayLocalMessage("Session expired or unauthorized. Please log in again.", "error");
          } else {
               displayLocalMessage("An error occurred verifying your session. Redirecting to login.", "error");
          }
          // Only clear the client-side userRole flag. The HttpOnly cookie is managed by the browser/backend.
          localStorage.removeItem('userRole');
          setTimeout(() => window.location.href = '../login.html', 2000);
          return false;
     }
}

/**
 * Fetches companies associated with the logged-in recruiter.
 * Assumes COMPANY_API_END_POINT is correctly defined in utils.js.
 * No 'Authorization' header needed if using HTTP-only cookies with withCredentials.
 */
async function fetchCompanies() {
     try {
          // Axios will send the HttpOnly cookie automatically.
          const response = await axios.get(`${COMPANY_API_END_POINT}/get`);

          console.log("Response from /company/get:", response.data);

          if (response.data.success && response.data.companies && response.data.companies.length > 0) {
               companySelect.innerHTML = '<option value="">Select Company</option>'; // Clear loading message
               response.data.companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company._id;
                    option.textContent = company.name;
                    companySelect.appendChild(option);
               });
               companySelect.disabled = false;
               postJobForm.style.display = 'block'; // Show the form if companies are found
               companyRedirectMessageDiv.style.display = 'none'; // Hide no-companies message
               displayLocalMessage('', 'hidden'); // Clear any general messages
          } else {
               // No companies found for this recruiter or API returned specific message.
               console.warn('No companies found for this recruiter or API returned specific message.');
               companySelect.innerHTML = '<option value="">No companies found.</option>';
               companySelect.disabled = true;
               postJobForm.style.display = 'none'; // Hide the job posting form
               companyRedirectMessageDiv.style.display = 'block'; // Show "no companies" message
               displayLocalMessage('', 'hidden'); // Hide general message div
          }
     } catch (error) {
          console.error('Error fetching companies:', error.response?.data?.message || error.message);
          const backendMessage = error.response?.data?.message || '';
          const status = error.response?.status;

          if (status === 401 || status === 403) {
               displayLocalMessage("Session expired or unauthorized. Please log in again.", "error");
               // Only clear the client-side userRole flag.
               localStorage.removeItem('userRole');
               setTimeout(() => window.location.href = '../login.html', 2000);
          } else {
               // General error if not auth-related, but still couldn't fetch companies
               companySelect.innerHTML = '<option value="">Error loading companies</option>';
               companySelect.disabled = true;
               postJobForm.style.display = 'none';
               companyRedirectMessageDiv.style.display = 'none'; // Ensure this is hidden for generic errors
               displayLocalMessage('Error: ' + (backendMessage || 'Failed to load companies. Please try again.'), 'error');
          }
     }
}

// Handle form submission for posting a job
postJobForm.addEventListener('submit', async (e) => {
     e.preventDefault();

     displayLocalMessage('', 'hidden'); // Clear previous messages
     const submitButton = e.target.querySelector('.btn-submit');
     submitButton.disabled = true;
     submitButton.textContent = 'Posting Job...';

     // No need to get token from localStorage for HttpOnly cookies.
     // The browser will automatically send it.

     const formData = new FormData(postJobForm);
     const jobData = Object.fromEntries(formData.entries());

     // Process requirements string into an array
     jobData.requirements = jobData.requirements.split(',').map(item => item.trim()).filter(item => item !== '');
     jobData.salary = parseFloat(jobData.salary); // Ensure salary is a number

     console.log("Attempting to post job with data:", jobData);

     try {
          // Axios will send the HttpOnly cookie automatically.
          // No need for 'Authorization' header here.
          const response = await axios.post(`${JOB_API_END_POINT}/post`, jobData, {
               headers: {
                    'Content-Type': 'application/json' // Explicitly set content type for JSON body
               }
          });

          if (response.data.success) {
               displayLocalMessage(response.data.message || 'Job posted successfully!', 'success');
               postJobForm.reset(); // Clear form fields
               // Optionally, redirect to a 'My Jobs' or 'Recruiter Dashboard' page
               setTimeout(() => {
                    window.location.href = 'jobs.html'; // Assuming this is your recruiter jobs list
               }, 2000);
          } else {
               displayLocalMessage(response.data.message || 'Failed to post job.', 'error');
          }
     } catch (error) {
          console.error('Error posting job:', error.response?.data?.message || error.message);
          const errorMessage = error.response?.data?.message || 'An error occurred while posting the job. Please try again.';
          displayLocalMessage(errorMessage, 'error');

          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
               alert("Session expired or unauthorized. Please log in again.");
               // Only clear the client-side userRole flag.
               localStorage.removeItem('userRole');
               window.location.href = '../login.html';
          }
     } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Post Job';
     }
});

// Initial load: Verify session, then fetch companies if authorized
document.addEventListener('DOMContentLoaded', async () => {
     // axios.defaults.withCredentials = true; should be set globally and early in your HTML
     // if (typeof axios !== 'undefined') {
     //     axios.defaults.withCredentials = true; // This is now set in the HTML directly after axios.min.js
     // } else {
     //     console.error('Axios is not defined. Ensure axios.min.js is loaded before this script.');
     //     displayLocalMessage('Application error: Missing dependencies. Please refresh.', 'error');
     //     return;
     // }

     const isRecruiter = await verifyRecruiterSession();
     if (isRecruiter) {
          await fetchCompanies();
     } else {
          // If not a recruiter, the verifyRecruiterSession already handled redirection.
          // We ensure the form is hidden.
          postJobForm.style.display = 'none';
     }
});

// Attach handleLogout to the logout button via JavaScript
if (logoutButton) {
     logoutButton.addEventListener('click', handleLogout);
}