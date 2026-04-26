// frontend/admin/admin-companies.js

import { COMPANY_API_END_POINT, displayMessage, handleLogout } from './utils.js';

document.addEventListener('DOMContentLoaded', async () => {
     const companiesList = document.getElementById('companies-list');
     const logoutBtn = document.getElementById('logoutBtn');

     const userRole = localStorage.getItem('userRole');
     const token = localStorage.getItem('token');

     if (!userRole) {
          alert('Please log in to access this page.');
          window.location.href = '../login.html';
          return;
     }

     if (userRole !== 'recruiter' && userRole !== 'admin') {
          alert('You are not authorized to access this page.');
          window.location.href = '../browse.html';
          return;
     }

     if (!token) {
          displayMessage('Authentication token is missing. Please log in again.', 'error');
          localStorage.removeItem('userRole');
          window.location.href = '../login.html';
          return;
     }

     if (logoutBtn) {
          logoutBtn.addEventListener('click', handleLogout);
     } else {
          console.warn("Logout button with ID 'logoutBtn' not found in the HTML. Ensure it exists if you want logout functionality.");
     }

     try {
          const response = await axios.get(
               `${COMPANY_API_END_POINT}/get`,
               {
                    headers: {
                         'Authorization': `Bearer ${token}`
                    }
               }
          );

          if (response.data.success) {
               const companies = response.data.companies;
               companiesList.innerHTML = '';

               if (companies.length === 0) {
                    companiesList.innerHTML = '<p class="text-gray-500">No companies found.</p>';
                    return;
               }

               companies.forEach(company => {
                    const companyCard = document.createElement('div');
                    companyCard.className = 'bg-white p-4 rounded shadow mb-4';
                    companyCard.innerHTML = `
                    <h2 class="text-xl font-semibold">${company.name}</h2>
                    <p class="text-gray-600">${company.description || 'No description provided.'}</p>
                    ${company.website ? `<p class="text-blue-500"><a href="${company.website}" target="_blank" rel="noopener noreferrer">${company.website}</a></p>` : ''}
                    ${company.location ? `<p class="text-gray-600">Location: ${company.location}</p>` : ''} 
                    ${company.logo ? `<img src="${company.logo}" alt="${company.name} Logo" class="mt-2 w-16 h-16 object-contain">` : ''}
                    <p class="text-gray-500 text-sm mt-2">ID: ${company._id}</p>
                    <div class="mt-3 space-x-2">
                        <button class="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600" data-company-id="${company._id}">Edit</button>
                        <button class="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600" data-company-id="${company._id}">Delete</button>
                    </div>
                `;
                    companiesList.appendChild(companyCard);
               });

               companiesList.querySelectorAll('button[data-company-id]').forEach(button => {
                    const companyId = button.dataset.companyId;
                    if (button.textContent === 'Edit') {
                         button.addEventListener('click', () => window.editCompany(companyId));
                    } else if (button.textContent === 'Delete') {
                         button.addEventListener('click', () => window.deleteCompany(companyId));
                    }
               });


          } else {
               displayMessage(response.data.message || 'Failed to fetch companies.', 'error');
          }
     } catch (error) {
          console.error('Error fetching companies:', error);

          if (error.response) {
               console.error('Server error response data:', error.response.data);
               console.error('Server error status:', error.response.status);

               const backendMessage = error.response.data.message;

               if (error.response.status === 401 || error.response.status === 403) {
                    displayMessage(backendMessage || 'Session expired or unauthorized. Please log in again.', 'error');
                    alert(backendMessage || 'Session expired or unauthorized. Please log in again.');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('token');
                    window.location.href = '../login.html';
               } else {
                    displayMessage(`Error: ${backendMessage || 'Something went wrong on the server while fetching companies.'}`, 'error');
                    companiesList.innerHTML = `<p class="text-red-500">${backendMessage || 'Error loading companies.'}</p>`;
               }
          } else if (error.request) {
               displayMessage('No response from server. Please check if the backend is running and accessible.', 'error');
               companiesList.innerHTML = '<p class="text-red-500">Could not connect to the server. Please check your network and backend status.</p>';
          } else {
               displayMessage(`An unexpected error occurred: ${error.message}`, 'error');
               companiesList.innerHTML = `<p class="text-red-500">An unexpected client-side error occurred: ${error.message}</p>`;
          }
     }
});

window.editCompany = function (companyId) {
     console.log(`Edit company with ID: ${companyId}`);
     window.location.href = `edit-company.html?id=${companyId}`;
};

window.deleteCompany = async function (companyId) {
     console.log(`Delete company with ID: ${companyId}`);
     if (!confirm('Are you sure you want to delete this company?')) {
          return;
     }

     const token = localStorage.getItem('token');
     if (!token) {
          displayMessage('Authentication token is missing. Please log in again.', 'error');
          localStorage.removeItem('userRole');
          localStorage.removeItem('token');
          window.location.href = '../login.html';
          return;
     }

     try {
          const response = await axios.delete(
               `${COMPANY_API_END_POINT}/${companyId}`,
               {
                    headers: {
                         'Authorization': `Bearer ${token}`
                    }
               }
          );

          if (response.data.success) {
               displayMessage(response.data.message || 'Company deleted successfully!', 'success');
               document.location.reload();
          } else {
               displayMessage(response.data.message || 'Failed to delete company.', 'error');
          }
     } catch (error) {
          console.error('Error deleting company:', error);
          if (error.response) {
               displayMessage(error.response.data.message || 'Error deleting company on server.', 'error');
               if (error.response.status === 401 || error.response.status === 403) {
                    alert(error.response.data.message || 'Unauthorized to delete company. Please log in.');
                    localStorage.removeItem('userRole');
                    localStorage.removeItem('token');
                    window.location.href = '../login.html';
               }
          } else {
               displayMessage('Could not delete company. Network error or server unreachable.', 'error');
          }
     }
};