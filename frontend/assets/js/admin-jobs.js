import { handleLogout, authFetch, COMPANY_API_END_POINT, JOB_API_END_POINT } from '/assets/js/utils.js';

document.addEventListener('DOMContentLoaded', async () => {
     console.log('admin-job.js: DOM Content Loaded, starting initialization.');

     const token = localStorage.getItem('token');
     const companySelect = document.getElementById('job-company');
     const postJobForm = document.getElementById('post-job-form');

     if (!token) {
          console.warn('admin-job.js: Token not found, redirecting to login.');
          alert('Please log in to post a job.');
          window.location.href = '../login.html';
          return;
     }
     console.log('admin-job.js: Token found:', token);

     async function populateCompaniesDropdown() {
          console.log('admin-job.js: Attempting to populate companies dropdown...');
          try {
               const response = await authFetch(`${COMPANY_API_END_POINT}/get`, {
                    method: 'GET',
                    withCredentials: true,
               });

               if (response.data.success && response.data.companies.length > 0) {
                    console.log('admin-job.js: Companies fetched successfully:', response.data.companies);
                    companySelect.innerHTML = '<option value="">Select a Company</option>';
                    response.data.companies.forEach(company => {
                         const option = document.createElement('option');
                         option.value = company._id;
                         option.textContent = company.name;
                         companySelect.appendChild(option);
                    });
               } else {
                    console.warn('admin-job.js: No companies found or API call failed:', response.data);
                    companySelect.innerHTML = '<option value="">No companies found. Please register one first.</option>';
                    alert('You need to register a company first to post jobs.');
               }
          } catch (error) {
               console.error('admin-job.js: Error fetching companies:', error);
               console.error('Response data:', error.response?.data);
               companySelect.innerHTML = '<option value="">Error loading companies.</option>';
               alert('Failed to load companies. Please try again.');
               if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.error('admin-job.js: Unauthorized, logging out.');
                    handleLogout();
               }
          }
     }

     await populateCompaniesDropdown();
     console.log('admin-job.js: populateCompaniesDropdown finished.');

     postJobForm.addEventListener('submit', async (e) => {
          e.preventDefault();
          console.log('admin-job.js: Form submit button clicked.');

          const formData = {
               title: document.getElementById('job-title').value,
               description: document.getElementById('job-description').value,
               requirements: document.getElementById('job-requirements').value.split(',').map(item => item.trim()).filter(item => item),
               jobType: document.getElementById('job-type').value,
               experienceLevel: document.getElementById('job-experience-level').value,
               position: document.getElementById('job-position').value,
               companyId: document.getElementById('job-company').value, // Changed to companyId
               location: document.getElementById('job-location').value,
               salary: Number(document.getElementById('job-salary').value),
          };

          console.log('admin-job.js: Sending formData:', formData);

          // Validate form data
          if (!formData.title) {
               console.warn('admin-job.js: Validation failed: title is empty.');
               alert('Please fill in the job title field.');
               return;
          }
          if (!formData.description) {
               console.warn('admin-job.js: Validation failed: description is empty.');
               alert('Please fill in the description field.');
               return;
          }
          if (!Array.isArray(formData.requirements) || formData.requirements.length === 0) {
               console.warn('admin-job.js: Validation failed: requirements is empty or not an array.');
               alert('Please provide at least one requirement (comma-separated).');
               return;
          }
          if (!formData.jobType || !['Full-Time', 'Part-Time', 'Contract', 'Temporary', 'Internship'].includes(formData.jobType)) {
               console.warn('admin-job.js: Validation failed: jobType is invalid.');
               alert('Please select a valid job type.');
               return;
          }
          if (!formData.experienceLevel || !['Entry-Level', 'Mid-Level', 'Senior-Level', 'Director', 'Executive'].includes(formData.experienceLevel)) {
               console.warn('admin-job.js: Validation failed: experienceLevel is invalid.');
               alert('Please select a valid experience level.');
               return;
          }
          if (!formData.position) {
               console.warn('admin-job.js: Validation failed: position is empty.');
               alert('Please fill in the position field.');
               return;
          }
          if (!formData.companyId || !/^[0-9a-fA-F]{24}$/.test(formData.companyId)) {
               console.warn('admin-job.js: Validation failed: companyId is invalid.');
               alert('Please select a valid company.');
               return;
          }
          if (!formData.location) {
               console.warn('admin-job.js: Validation failed: location is empty.');
               alert('Please fill in the location field.');
               return;
          }
          if (isNaN(formData.salary) || formData.salary <= 0) {
               console.warn('admin-job.js: Validation failed: salary is invalid or not positive.');
               alert('Please enter a valid positive number for salary.');
               return;
          }

          try {
               const response = await authFetch(`${JOB_API_END_POINT}/post`, {
                    method: 'POST',
                    data: formData,
                    withCredentials: true,
               });

               if (response.data.success) {
                    console.log('admin-job.js: Job posted successfully:', response.data);
                    alert(response.data.message);
                    postJobForm.reset();
                    window.location.href = './companies.html';
               } else {
                    console.error('admin-job.js: Backend reported failure:', response.data);
                    alert(response.data.message || 'Failed to post job.');
               }
          } catch (error) {
               console.error('admin-job.js: Error posting job:', error);
               console.error('Response data:', error.response?.data);
               alert(`Error posting job: ${error.response?.data?.message || 'Bad request. Check console for details.'}`);
               if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    console.error('admin-job.js: Unauthorized, logging out.');
                    handleLogout();
               }
          }
     });
});