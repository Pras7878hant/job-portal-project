
// import { isAuthenticatedFrontend, handleLogout, APPLICATION_API_END_POINT } from './utils.js';

import {
    isAuthenticatedFrontend,
    handleLogout,
    APPLICATION_API_END_POINT,
    authFetch
} from './utils.js';



document.addEventListener('DOMContentLoaded', async () => {
     // Check if the user is authenticated (using the function from utils.js)
     if (!isAuthenticatedFrontend()) {
          window.location.href = 'login.html'; // Redirect to login if not authenticated
          return; // Stop execution
     }

     // Ensure the user is a 'student' to view applications
     const userRole = localStorage.getItem('userRole');
     if (userRole !== 'student') {
          // Redirect or show an error if not a student
          alert('Access Denied: Only students can view this page.');
          window.location.href = 'index.html'; // Or a more appropriate page
          return;
     }

     // Removed: M.AutoInit(); (Materialize JS is no longer used)

     // Fetch and display applied jobs when the page loads
     await fetchAppliedJobs();

     // Attach logout functionality to the logout button
     const logoutButton = document.getElementById('logoutButton');
     if (logoutButton) {
          logoutButton.addEventListener('click', handleLogout); // handleLogout is exposed globally from utils.js
     }
});

async function fetchAppliedJobs() {
     const applicationsContainer = document.getElementById('applicationsContainer');
     applicationsContainer.innerHTML = '<p class="text-center">Loading your applications...</p>';

     try {
          const response = await authFetch(`${APPLICATION_API_END_POINT}/get`);
          const applications = response.data.applications;

          if (applications && applications.length > 0) {
               applicationsContainer.innerHTML = ''; // Clear loading message
               applications.forEach(app => {
                    const applicationCard = createApplicationCard(app);
                    applicationsContainer.appendChild(applicationCard);
               });
          } else {
               applicationsContainer.innerHTML = '<p class="text-center">You have not applied for any jobs yet.</p>';
          }
     } catch (error) {
          console.error('Error fetching your applications:', error);
          applicationsContainer.innerHTML = '<p class="text-center text-danger">Error fetching your applications. Please try again later.</p>';

          if (error.response) {
               if (error.response.status === 401 || error.response.status === 403) {
                    alert('Session expired or unauthorized. Please log in again.');
                    handleLogout();
               } else {
                    console.error('Backend error:', error.response.data.message || error.response.statusText);
               }
          } else if (error.request) {
               console.error('Network error: No response received from server.');
          } else {
               console.error('Frontend error setting up request:', error.message);
          }
     }
}

// MODIFIED: createApplicationCard for simple CSS and improved layout
function createApplicationCard(application) {
     const card = document.createElement('div');
     card.classList.add('app-card'); // Custom class for the card

     // Ensure all nested properties are safely accessed
     const jobTitle = application.job ? application.job.title : 'N/A';
     const companyName = (application.job && application.job.company) ? application.job.company.name : 'N/A';
     const applicationStatus = application.status ? application.status : 'N/A';
     const appliedAt = application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A';
     const jobId = application.job ? application.job._id : '';

     card.innerHTML = `
        <div class="app-card-content">
            <h3 class="app-card-title">${jobTitle}</h3>
            <p><strong>Company:</strong> ${companyName}</p>
            <p><strong>Applied On:</strong> ${appliedAt}</p>
        </div>
        <div class="app-card-footer">
            <span class="application-status-tag status-${applicationStatus.toLowerCase()}">${applicationStatus}</span>
            <div>
                <a href="job-details.html?id=${jobId}" class="app-button app-button-primary">View Job</a>
                <a href="application-details.html?id=${application._id}&v=2" class="app-button app-button-secondary">View Application</a>
            </div>
        </div>
    `;
     return card;
}
