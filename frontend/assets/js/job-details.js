import { JOB_API_END_POINT, USER_API_END_POINT, displayMessage, handleLogout } from './utils.js';

async function fetchJobDetails() {
     console.log("--- fetchJobDetails started ---");
     console.log("window.location.href:", window.location.href);

     console.log("window.location.search:", window.location.search);

     const urlParams = new URLSearchParams(window.location.search);
     const jobId = urlParams.get('id');

     console.log("URLSearchParams size:", urlParams.size);
     console.log("Extracted Job ID:", jobId);

     const jobDetailsDiv = document.getElementById('job-details');
     const applyBtn = document.getElementById('apply-btn');

     if (!jobId) {
          jobDetailsDiv.innerHTML = '<p class="error-message">Job ID not found in URL.</p>';
          applyBtn.classList.add('hidden');
          console.error("DEBUG: Job ID was not found or was empty, stopping.");
          return;
     }

     const role = localStorage.getItem('role'); // Get role from localStorage
     const token = localStorage.getItem('token');

     try {
          axios.defaults.withCredentials = true; // Essential for sending cookies with Axios

          // Fetch job details
          const response = await axios.get(`${JOB_API_END_POINT}/${jobId}`);
          const job = response.data.job;

          if (!job) {
               jobDetailsDiv.innerHTML = '<p class="error-message">Job not found.</p>';
               applyBtn.classList.add('hidden');
               return;
          }

          jobDetailsDiv.innerHTML = `
            <h2 class="text-2xl font-bold">${job.title}</h2>
            <p class="text-lg"><strong>Company:</strong> ${job.company?.name || 'N/A'}</p>
            <p><strong>Location:</strong> ${job.location}</p>
            <p><strong>Job Type:</strong> ${job.jobType}</p>
            <p><strong>Experience Level:</strong> ${job.experienceLevel}</p>
            <p><strong>Salary:</strong> ${job.salary ? `$${job.salary.toLocaleString()}` : 'N/A'}</p>
            <p><strong>Position:</strong> ${job.position}</p>
            <h3>Description:</h3>
            <p>${job.description}</p>
            <h3>Requirements:</h3>
            <ul>
                ${job.requirements.map(req => `<li>${req}</li>`).join('')}
            </ul>
        `;

          // Check if user is a student and show/hide apply button
          if (role === 'student' && token) {
               applyBtn.classList.remove('hidden');

               // IMPORTANT CHANGE: Redirect to the new application page
               applyBtn.onclick = () => {
                    // Pass the jobId to the new application page
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

// Call the function when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', fetchJobDetails);