import { COMPANY_API_END_POINT, JOB_API_END_POINT, USER_API_END_POINT, handleLogout } from './utils.js';

const welcomeMessage = document.getElementById('welcome-message');
const postJobForm = document.getElementById('post-job-form');
const messageDiv = document.getElementById('message');
const companySelect = document.getElementById('company');
const companyRedirectMessageDiv = document.getElementById('company-redirect-message');
const logoutButton = document.querySelector('.logout-btn');

function authHeaders() {
     const token = localStorage.getItem('token');
     return token ? { Authorization: `Bearer ${token}` } : {};
}

function displayLocalMessage(msg, type) {
     const tone = type === 'success' ? 'border-emerald-200 bg-emerald-50 text-emerald-800' : 'border-red-200 bg-red-50 text-red-800';
     messageDiv.textContent = msg;
     messageDiv.className = `rounded-md border px-4 py-3 text-sm ${tone}`;
     messageDiv.style.display = type === 'hidden' || !msg ? 'none' : 'block';
     if (type !== 'hidden') companyRedirectMessageDiv.classList.add('hidden');
}

async function verifyRecruiterSession() {
     try {
          const response = await axios.get(`${USER_API_END_POINT}/profile`, {
               headers: authHeaders(),
               withCredentials: true
          });

          if (response.data.success && response.data.user?.role === 'recruiter') {
               welcomeMessage.textContent = `Welcome, ${response.data.user.fullName || 'Recruiter'}!`;
               localStorage.setItem('userRole', response.data.user.role);
               return true;
          }

          displayLocalMessage('Access denied. Redirecting...', 'error');
          localStorage.removeItem('userRole');
          setTimeout(() => window.location.href = 'browse.html', 1200);
          return false;
     } catch (error) {
          displayLocalMessage(error.response?.data?.message || 'Please log in again.', 'error');
          localStorage.removeItem('userRole');
          localStorage.removeItem('token');
          setTimeout(() => window.location.href = 'login.html', 1200);
          return false;
     }
}

async function fetchCompanies() {
     try {
          const response = await axios.get(`${COMPANY_API_END_POINT}/get`, {
               headers: authHeaders(),
               withCredentials: true
          });

          if (response.data.success && response.data.companies?.length > 0) {
               companySelect.innerHTML = '<option value="">Select Company</option>';
               response.data.companies.forEach(company => {
                    const option = document.createElement('option');
                    option.value = company._id;
                    option.textContent = company.name;
                    companySelect.appendChild(option);
               });
               companySelect.disabled = false;
               postJobForm.style.display = 'grid';
               companyRedirectMessageDiv.classList.add('hidden');
               displayLocalMessage('', 'hidden');
               return;
          }

          companySelect.innerHTML = '<option value="">No companies found.</option>';
          companySelect.disabled = true;
          postJobForm.style.display = 'none';
          companyRedirectMessageDiv.classList.remove('hidden');
     } catch (error) {
          companySelect.innerHTML = '<option value="">Error loading companies</option>';
          companySelect.disabled = true;
          postJobForm.style.display = 'none';
          displayLocalMessage(error.response?.data?.message || 'Failed to load companies.', 'error');
     }
}

postJobForm.addEventListener('submit', async (event) => {
     event.preventDefault();

     const submitButton = event.target.querySelector('.btn-submit');
     submitButton.disabled = true;
     submitButton.textContent = 'Posting Job...';
     displayLocalMessage('', 'hidden');

     const jobData = Object.fromEntries(new FormData(postJobForm).entries());
     jobData.requirements = jobData.requirements.split(',').map(item => item.trim()).filter(Boolean);
     jobData.salary = Number(jobData.salary);

     try {
          const response = await axios.post(`${JOB_API_END_POINT}/post`, jobData, {
               headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders()
               },
               withCredentials: true
          });

          if (response.data.success) {
               displayLocalMessage(response.data.message || 'Job posted successfully.', 'success');
               postJobForm.reset();
               setTimeout(() => window.location.href = 'jobs.html', 1200);
          } else {
               displayLocalMessage(response.data.message || 'Failed to post job.', 'error');
          }
     } catch (error) {
          displayLocalMessage(error.response?.data?.message || 'An error occurred while posting the job.', 'error');
     } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Post Job';
     }
});

document.addEventListener('DOMContentLoaded', async () => {
     const isRecruiter = await verifyRecruiterSession();
     if (isRecruiter) await fetchCompanies();
});

if (logoutButton) {
     logoutButton.addEventListener('click', handleLogout);
}
