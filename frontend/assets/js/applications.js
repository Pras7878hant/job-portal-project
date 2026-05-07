import { isAuthenticatedFrontend, handleLogout, APPLICATION_API_END_POINT, authFetch } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
     if (!isAuthenticatedFrontend()) {
          window.location.href = 'login.html';
          return;
     }

     const userRole = localStorage.getItem('userRole');
     if (userRole !== 'student') {
          window.location.href = 'index.html';
          return;
     }

     await fetchAppliedJobs();

     const logoutButton = document.getElementById('logoutButton');
     if (logoutButton) logoutButton.addEventListener('click', handleLogout);
});

async function fetchAppliedJobs() {
     const applicationsContainer = document.getElementById('applicationsContainer');
     applicationsContainer.innerHTML = '<p class="text-slate-600">Loading your applications...</p>';

     try {
          const response = await authFetch(`${APPLICATION_API_END_POINT}/get`);
          const applications = response.data.applications || [];

          if (!applications.length) {
               applicationsContainer.innerHTML = '<p class="text-slate-600">You have not applied for any jobs yet.</p>';
               return;
          }

          applicationsContainer.innerHTML = '';
          applications.forEach(application => applicationsContainer.appendChild(createApplicationCard(application)));
     } catch (error) {
          applicationsContainer.innerHTML = '<p class="rounded-md border border-red-200 bg-red-50 p-4 text-sm text-red-800">Error fetching your applications. Please try again later.</p>';
          if (error.response?.status === 401 || error.response?.status === 403) handleLogout();
     }
}

function createApplicationCard(application) {
     const card = document.createElement('div');
     card.className = 'rounded-md border border-slate-200 bg-white p-5 shadow-sm';

     const jobTitle = application.job?.title || 'N/A';
     const companyName = application.job?.company?.name || 'N/A';
     const applicationStatus = application.status || 'pending';
     const appliedAt = application.createdAt ? new Date(application.createdAt).toLocaleDateString() : 'N/A';
     const jobId = application.job?._id || '';

     card.innerHTML = `
        <div>
            <h3 class="text-lg font-semibold text-slate-950">${jobTitle}</h3>
            <p class="mt-2 text-sm text-slate-600"><strong>Company:</strong> ${companyName}</p>
            <p class="mt-1 text-sm text-slate-600"><strong>Applied On:</strong> ${appliedAt}</p>
        </div>
        <div class="mt-5 flex flex-wrap items-center justify-between gap-3">
            <span class="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold capitalize text-slate-700">${applicationStatus}</span>
            <div class="flex gap-2">
                <a href="job-details.html?id=${jobId}" class="rounded-md border border-slate-300 px-3 py-2 text-sm font-semibold text-slate-800 hover:bg-slate-50">View Job</a>
                <a href="application-details.html?id=${application._id}" class="rounded-md bg-slate-950 px-3 py-2 text-sm font-semibold text-white hover:bg-slate-800">View Application</a>
            </div>
        </div>
    `;
     return card;
}
