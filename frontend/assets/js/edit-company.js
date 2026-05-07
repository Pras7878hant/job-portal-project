import { displayMessage } from './utils.js';

function clearMessage() {
     const messageDiv = document.getElementById('message');
     if (messageDiv) {
          messageDiv.textContent = '';
          messageDiv.className = '';
          messageDiv.style.display = 'none';
     }
}


document.addEventListener('DOMContentLoaded', async () => {
     const urlParams = new URLSearchParams(window.location.search);
     const companyId = urlParams.get('id');

     const editCompanyForm = document.getElementById('editCompanyForm');
     const companyNameInput = document.getElementById('companyName');
     const companyDescriptionInput = document.getElementById('companyDescription');
     const companyWebsiteInput = document.getElementById('companyWebsite');
     const companyLocationInput = document.getElementById('companyLocation');

     if (!companyId) {
          displayMessage('Error: Company ID not found in URL.', 'error');
          return;
     }

     const fetchCompanyDetails = async () => {
          try {
               const token = localStorage.getItem('token');
               if (!token) {
                    displayMessage('You are not logged in. Please log in to edit companies.', 'error');
                    setTimeout(() => { window.location.href = '../login.html'; }, 1200);
                    return;
               }

               const response = await axios.get(`http://localhost:8000/api/v1/company/get/${companyId}`, {
                    headers: {
                         Authorization: `Bearer ${token}`
                    }
               });

               const company = response.data.company;
               companyNameInput.value = company.name;
               companyDescriptionInput.value = company.description;
               companyWebsiteInput.value = company.website || '';
               companyLocationInput.value = company.location || '';

          } catch (error) {
               console.error('Error fetching company details:', error);
               const errorMessage = error.response?.data?.message || 'Failed to fetch company details. Please try again.';
               displayMessage(errorMessage, 'error');

               if (error.response && (error.response.status === 404 || error.response.status === 403)) {
                    setTimeout(() => { window.location.href = 'companies.html'; }, 1200);
               }
          }
     };

     await fetchCompanyDetails();

     editCompanyForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          clearMessage();

          const name = companyNameInput.value.trim();
          const description = companyDescriptionInput.value.trim();
          const website = companyWebsiteInput.value.trim();
          const location = companyLocationInput.value.trim();

          if (!name || !description) {
               displayMessage('Company name and description are required.', 'error');
               return;
          }

          try {
               const token = localStorage.getItem('token');
               if (!token) {
                    displayMessage('You are not logged in. Please log in to update companies.', 'error');
                    setTimeout(() => { window.location.href = '../login.html'; }, 1200);
                    return;
               }

               const response = await axios.put(`http://localhost:8000/api/v1/company/${companyId}`, {
                    name,
                    description,
                    website,
                    location
               }, {
                    headers: {
                         Authorization: `Bearer ${token}`,
                         'Content-Type': 'application/json'
                    }
               });

               displayMessage(response.data.message || 'Company updated successfully!', 'success');

          } catch (error) {
               console.error('Error updating company:', error);
               const errorMessage = error.response?.data?.message || 'Failed to update company. Server error.';
               displayMessage(errorMessage, 'error');
          }
     });
});
