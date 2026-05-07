import { JOB_API_END_POINT, USER_API_END_POINT, displayMessage, handleLogout } from './utils.js';

const jobListElement = document.getElementById('job-list');
const loadingMessage = document.getElementById('loading-message');
const errorMessage = document.getElementById('error-message');
const noJobsMessage = document.getElementById('no-jobs-message');
const welcomeMessage = document.getElementById('welcome-message');
const myApplicationsBtn = document.getElementById('my-applications-btn');

document.addEventListener('DOMContentLoaded', () => {
     const role = localStorage.getItem('role') || localStorage.getItem('userRole');

     if (!role) {
          alert("You are not logged in. Redirecting to login.");
          window.location.href = 'login.html';
          return;
     }

     welcomeMessage.textContent = `Welcome, ${role.charAt(0).toUpperCase() + role.slice(1)}!`;

     if (role === 'student') {
          myApplicationsBtn.classList.remove('hidden');
     } else if (role === 'recruiter') {
          myApplicationsBtn.classList.add('hidden');
          alert("Recruiters can post and manage jobs from their dashboard. You are currently viewing public listings.");
     } else {
          alert("Invalid user role. Redirecting to login.");
          localStorage.removeItem('role');
          localStorage.removeItem('userRole');
          window.location.href = 'login.html';
          return;
     }

     axios.defaults.withCredentials = true;
     const token = localStorage.getItem('token');
     if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
     } else {
          delete axios.defaults.headers.common['Authorization'];
     }

     fetchJobs();
});

async function fetchJobs() {
     loadingMessage.style.display = 'block';
     jobListElement.innerHTML = '';
     errorMessage.style.display = 'none';
     noJobsMessage.style.display = 'none';

     try {
          const response = await axios.get(`${JOB_API_END_POINT}`);

          if (response.data.success && response.data.jobs.length > 0) {
               loadingMessage.style.display = 'none';
               response.data.jobs.forEach(job => {
                    const jobItem = document.createElement('li');
                    jobItem.className = 'rounded-md border border-slate-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md';
                    jobItem.innerHTML = `
                    <h3 class="text-lg font-semibold text-slate-950">${job.title}</h3>
                    <p class="mt-2 text-sm text-slate-600"><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
                    <p class="mt-1 text-sm text-slate-600"><strong>Location:</strong> ${job.location}</p>
                    <div class="mt-3 flex flex-wrap gap-2 text-xs font-medium">
                         <span class="rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">${job.jobType}</span>
                         <span class="rounded-full bg-emerald-50 px-2.5 py-1 text-emerald-700">Rs. ${job.salary ? job.salary.toLocaleString() : 'N/A'}</span>
                    </div>
                    <a href="job-details.html?id=${job._id}" class="mt-5 inline-flex rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800">View Details</a>
                `;
                    jobListElement.appendChild(jobItem);
               });
          } else {
               loadingMessage.style.display = 'none';
               noJobsMessage.style.display = 'block';
          }
     } catch (error) {
          console.error('Error fetching jobs:', error);
          loadingMessage.style.display = 'none';
          errorMessage.textContent = 'Failed to load jobs. Please try again.';
          errorMessage.style.display = 'block';

          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
               alert("Session expired or unauthorized. Please log in again.");
               localStorage.removeItem('role');
               localStorage.removeItem('userRole');
               localStorage.removeItem('token');
               window.location.href = 'login.html';
          } else if (error.request) {
               errorMessage.textContent = "Network error: No response from server. Is the backend running?";
          } else {
               errorMessage.textContent = `An unexpected error occurred: ${error.message}`;
          }
     }
}
