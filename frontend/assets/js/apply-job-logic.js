import { APPLICATION_API_END_POINT, JOB_API_END_POINT, USER_API_END_POINT, displayMessage } from './utils.js';

const messageDiv = document.getElementById('message');
const jobDetailsSummary = document.getElementById('job-details-summary');
const applicationForm = document.getElementById('application-form');
const fullNameInput = document.getElementById('full-name');
const emailInput = document.getElementById('email');
const phoneNumberInput = document.getElementById('phone-number');
const coverLetterInput = document.getElementById('cover-letter');
const resumeInput = document.getElementById('resume');
const submitButton = document.querySelector('.btn-submit');
let currentJobId = null;

function authHeaders() {
     const token = localStorage.getItem('token');
     return token ? { Authorization: `Bearer ${token}` } : {};
}

async function fetchJobDetails(jobId) {
     const response = await axios.get(`${JOB_API_END_POINT}/${jobId}`, {
          headers: authHeaders(),
          withCredentials: true
     });
     const job = response.data.job;
     jobDetailsSummary.innerHTML = `
          <h2 class="font-semibold text-slate-950">${job.title}</h2>
          <p class="mt-2"><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
          <p><strong>Location:</strong> ${job.location}</p>
          <p><strong>Salary:</strong> Rs. ${job.salary ? job.salary.toLocaleString() : 'N/A'}</p>
          <p><strong>Job Type:</strong> ${job.jobType}</p>
     `;
     return job;
}

async function fetchUserProfile() {
     const response = await axios.get(`${USER_API_END_POINT}/profile`, {
          headers: authHeaders(),
          withCredentials: true
     });
     const user = response.data.user;
     fullNameInput.value = user.fullName || '';
     emailInput.value = user.email || '';
     phoneNumberInput.value = user.phone || '';
     return user;
}

async function checkApplicationStatus(jobId) {
     const response = await axios.get(`${APPLICATION_API_END_POINT}/check-status/${jobId}`, {
          headers: authHeaders(),
          withCredentials: true
     });

     if (response.data.success && response.data.applied) {
          displayMessage(messageDiv, `You have already applied for this job. Status: ${response.data.status}`, 'info');
          submitButton.disabled = true;
          submitButton.textContent = 'Already Applied';
          return true;
     }

     return false;
}

applicationForm.addEventListener('submit', async (event) => {
     event.preventDefault();

     displayMessage(messageDiv, '', 'info');
     submitButton.disabled = true;
     submitButton.textContent = 'Submitting...';

     const resumeFile = resumeInput.files[0];
     if (!resumeFile) {
          displayMessage(messageDiv, 'Please select a resume file.', 'error');
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Application';
          return;
     }

     const formData = new FormData();
     formData.append('coverLetter', coverLetterInput.value.trim());
     formData.append('resume', resumeFile);

     try {
          const response = await axios.post(`${APPLICATION_API_END_POINT}/apply/${currentJobId}`, formData, {
               headers: authHeaders(),
               withCredentials: true
          });

          if (response.data.success) {
               displayMessage(messageDiv, response.data.message || 'Application submitted successfully.', 'success');
               applicationForm.reset();
               setTimeout(() => {
                    window.location.href = 'applications.html';
               }, 1200);
          } else {
               displayMessage(messageDiv, response.data.message || 'Application submission failed.', 'error');
          }
     } catch (error) {
          displayMessage(messageDiv, error.response?.data?.message || 'Server error submitting application. Please try again.', 'error');
     } finally {
          submitButton.disabled = false;
          submitButton.textContent = 'Submit Application';
     }
});

document.addEventListener('DOMContentLoaded', async () => {
     const role = localStorage.getItem('role') || localStorage.getItem('userRole');
     const token = localStorage.getItem('token');
     currentJobId = new URLSearchParams(window.location.search).get('id');

     if (role !== 'student' || !token) {
          window.location.href = 'login.html';
          return;
     }

     if (!currentJobId) {
          displayMessage(messageDiv, 'Job ID not found in URL.', 'error');
          submitButton.disabled = true;
          return;
     }

     document.getElementById('back-to-job-details').href = `job-details.html?id=${currentJobId}`;

     try {
          const [job, user] = await Promise.all([fetchJobDetails(currentJobId), fetchUserProfile()]);
          if (job && user) await checkApplicationStatus(currentJobId);
     } catch (error) {
          displayMessage(messageDiv, error.response?.data?.message || 'Failed to load application form.', 'error');
          submitButton.disabled = true;
     }
});
