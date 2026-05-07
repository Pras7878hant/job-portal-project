import { JOB_API_END_POINT, USER_API_END_POINT, displayMessage, handleLogout } from './utils.js';

async function fetchJobDetails() {
     const urlParams = new URLSearchParams(window.location.search);
     const jobId = urlParams.get('id');

     const jobDetailsDiv = document.getElementById('job-details');
     const applyBtn = document.getElementById('apply-btn');

     if (!jobId) {
          jobDetailsDiv.innerHTML = '<p class="error-message">Job ID not found in URL.</p>';
          applyBtn.classList.add('hidden');
          return;
     }

     const role = localStorage.getItem('role'); // Get role from localStorage
     const token = localStorage.getItem('token');

     try {
          axios.defaults.withCredentials = true; // Essential for sending cookies with Axios

          const response = await axios.get(`${JOB_API_END_POINT}/${jobId}`);
          const job = response.data.job;

          if (!job) {
               jobDetailsDiv.innerHTML = '<p class="error-message">Job not found.</p>';
               applyBtn.classList.add('hidden');
               return;
          }

          jobDetailsDiv.innerHTML = `
            <p class="text-sm font-semibold uppercase tracking-widest text-slate-500">${job.company?.name || 'N/A'}</p>
            <h1 class="mt-2 text-3xl font-bold text-slate-950">${job.title}</h1>
            <div class="mt-5 grid gap-3 text-sm text-slate-700 sm:grid-cols-2">
                <p><strong>Location:</strong> ${job.location}</p>
                <p><strong>Job Type:</strong> ${job.jobType}</p>
                <p><strong>Experience:</strong> ${job.experienceLevel}</p>
                <p><strong>Salary:</strong> ${job.salary ? `Rs. ${job.salary.toLocaleString()}` : 'N/A'}</p>
                <p><strong>Position:</strong> ${job.position}</p>
            </div>
            <h2 class="mt-8 text-lg font-semibold">Description</h2>
            <p class="mt-2 leading-7 text-slate-600">${job.description}</p>
            <h2 class="mt-8 text-lg font-semibold">Requirements</h2>
            <ul class="mt-2 list-disc space-y-1 pl-5 text-slate-600">
                ${job.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
        `;

          if (role === 'student' && token) {
               applyBtn.classList.remove('hidden');

               applyBtn.onclick = () => {
                    window.location.href = `apply-job.html?id=${jobId}`;
               };
          } else {
               applyBtn.classList.add('hidden'); // Ensure hidden if not student or not logged in
          }

     } catch (error) {
          console.error('Error fetching job details:', error);
          jobDetailsDiv.innerHTML = '<p class="error-message">Failed to load job details. Please try again.</p>';
          applyBtn.classList.add('hidden');
          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
               alert("Session expired or unauthorized. Please log in again.");
               localStorage.removeItem('role');
               localStorage.removeItem('token'); // Clear token too
               window.location.href = 'login.html';
          } else if (error.response && error.response.status === 404) {
               jobDetailsDiv.innerHTML = '<p class="error-message">Job not found with the given ID.</p>';
          }
     }
}

document.addEventListener('DOMContentLoaded', fetchJobDetails);
