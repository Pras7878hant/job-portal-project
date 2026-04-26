// assets/js/edit-company.js

// Import only `displayMessage` from utils.js, as per your utils.js file
import { displayMessage } from './utils.js';

// --- Local function for clearing messages within this module ---
// This clearMessage function is defined here because it's not exported from your utils.js
function clearMessage() {
     const messageDiv = document.getElementById('message');
     if (messageDiv) {
          messageDiv.textContent = '';
          messageDiv.className = 'message'; // Reset class
          messageDiv.style.display = 'none';
     } else {
          console.warn('Message div with ID "message" not found in the DOM for edit-company.js.');
     }
}
// --- End of local clearMessage function ---


document.addEventListener('DOMContentLoaded', async () => {
     // Get company ID from URL parameters
     const urlParams = new URLSearchParams(window.location.search);
     const companyId = urlParams.get('id');

     // Get form elements
     const editCompanyForm = document.getElementById('editCompanyForm');
     const companyNameInput = document.getElementById('companyName');
     const companyDescriptionInput = document.getElementById('companyDescription');
     const companyWebsiteInput = document.getElementById('companyWebsite');
     const companyLocationInput = document.getElementById('companyLocation'); // Input for location

     // If no company ID is found in the URL, display an error and exit
     if (!companyId) {
          displayMessage('Error: Company ID not found in URL.', 'error');
          return;
     }

     // --- Function to Fetch Company Details and Populate the Form ---
     const fetchCompanyDetails = async () => {
          try {
               const token = localStorage.getItem('token');
               if (!token) {
                    displayMessage('You are not logged in. Please log in to edit companies.', 'error');
                    setTimeout(() => { window.location.href = '../auth/login.html'; }, 20000);
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
               companyWebsiteInput.value = company.website || ''; // Use empty string if website is null/undefined
               companyLocationInput.value = company.location || ''; // Use empty string if location is null/undefined

          } catch (error) {
               console.error('Error fetching company details:', error);
               const errorMessage = error.response?.data?.message || 'Failed to fetch company details. Please try again.';
               displayMessage(errorMessage, 'error');

               // Redirect if the company is not found or user is unauthorized to view it
               if (error.response && (error.response.status === 404 || error.response.status === 403)) {
                    setTimeout(() => { window.location.href = 'companies.html'; }, 20000);
               }
          }
     };

     // Call the function to fetch details when the page loads
     await fetchCompanyDetails();

     // --- Event Listener for Form Submission (Update Company) ---
     editCompanyForm.addEventListener('submit', async (e) => {
          e.preventDefault(); // Prevent default form submission behavior
          clearMessage(); // Clear any previous messages

          // Get updated values from the form inputs
          const name = companyNameInput.value.trim();
          const description = companyDescriptionInput.value.trim();
          const website = companyWebsiteInput.value.trim();
          const location = companyLocationInput.value.trim(); // Get updated location

          // Basic client-side validation
          if (!name || !description) {
               displayMessage('Company name and description are required.', 'error');
               return;
          }

          try {
               const token = localStorage.getItem('token');
               if (!token) {
                    displayMessage('You are not logged in. Please log in to update companies.', 'error');
                    setTimeout(() => { window.location.href = '../auth/login.html'; }, 20000);
                    return;
               }

               // Send a PUT request to update the company details
               const response = await axios.put(`http://localhost:8000/api/v1/company/${companyId}`, {
                    name,
                    description,
                    website,
                    location // Include location in the update payload
               }, {
                    headers: {
                         Authorization: `Bearer ${token}`, // Include JWT token
                         'Content-Type': 'application/json' // Specify content type
                    }
               });

               displayMessage(response.data.message || 'Company updated successfully!', 'success');
               // Optionally, you might want to redirect the user back to the companies list
               // setTimeout(() => { window.location.href = 'companies.html'; }, 1500); // Redirect after 1.5 seconds

          } catch (error) {
               console.error('Error updating company:', error);
               const errorMessage = error.response?.data?.message || 'Failed to update company. Server error.';
               displayMessage(errorMessage, 'error');
          }
     });
});