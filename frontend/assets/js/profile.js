// frontend/assets/js/profile.js
import { USER_API_END_POINT, displayMessage, handleLogout } from './utils.js';

// Display elements (These IDs match your HTML and are correct)
const display_profilePhoto = document.getElementById('display-profilePhoto');
const display_fullName = document.getElementById('display-fullName');
const display_email = document.getElementById('display-email');
const display_phone = document.getElementById('display-phone');
const display_bio = document.getElementById('display-bio');
const display_skills = document.getElementById('display-skills');
const display_resume = document.getElementById('display-resume');
const display_role = document.getElementById('display-role');
const display_createdAt = document.getElementById('display-createdAt');
const display_updatedAt = document.getElementById('display-updatedAt');

// Form input elements (CRITICAL FIXES HERE)
const profileForm = document.getElementById('profile-form');
// CORRECTED ID: Matches <input type="file" id="profilePhotoFile" ...>
const profilePhotoFileInput = document.getElementById('profilePhotoFile');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const bioTextarea = document.getElementById('bio');
const skillsInput = document.getElementById('skills');
// CORRECTED ID: Matches <input type="file" id="resumeFile" ...>
const resumeFileInput = document.getElementById('resumeFile');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');

// Elements for displaying current photo/resume path in edit mode (from my previous suggestion)
const currentProfilePhotoUrl = document.getElementById('current-profilePhoto-url');
const currentResumeUrl = document.getElementById('current-resume-url');


// Buttons and sections
const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const profileDisplaySection = document.getElementById('profile-display');
const profileEditSection = document.getElementById('profile-edit-section');

// Message div (used in both fetchProfile and updateProfile)
const messageDiv = document.getElementById('message');

// Set Axios defaults for authentication (if using JWT tokens, cookies are handled by withCredentials)
axios.defaults.withCredentials = true; // Essential for sending HTTP-only cookies

// Removed axios.defaults.headers.common['Authorization'] setup here
// because you're using httpOnly cookies, which Axios handles with 'withCredentials'.
// If you're mixing httpOnly cookies with localStorage JWT, it's more complex.
// For now, assuming httpOnly cookies are primary.

document.addEventListener('DOMContentLoaded', async () => {
     // Initial fetch of profile data
     await fetchProfile();

     // Event listener for "Edit Profile" button
     if (editProfileBtn) { // Defensive check
          editProfileBtn.addEventListener('click', () => {
               profileDisplaySection.classList.add('hidden');
               profileEditSection.classList.remove('hidden');

               // Populate edit form fields with current display values
               // DO NOT try to set .value for file inputs.
               if (fullNameInput) fullNameInput.value = display_fullName.textContent;
               if (emailInput) emailInput.value = display_email.textContent;
               if (phoneInput) phoneInput.value = display_phone.textContent;
               if (bioTextarea) bioTextarea.value = display_bio.textContent;
               if (skillsInput) skillsInput.value = display_skills.textContent;

               // Clear password fields for security when opening edit form
               if (passwordInput) passwordInput.value = '';
               if (confirmPasswordInput) confirmPasswordInput.value = '';
          });
     } else {
          console.error("Edit Profile button not found!");
     }


     // Event listener for "Cancel" button
     if (cancelEditBtn) { // Defensive check
          cancelEditBtn.addEventListener('click', () => {
               profileEditSection.classList.add('hidden');
               profileDisplaySection.classList.remove('hidden');
               if (messageDiv) messageDiv.style.display = 'none'; // Clear any messages
          });
     } else {
          console.error("Cancel button not found!");
     }
});

async function fetchProfile() {
     console.log('Fetching profile...');
     // You might want a loading indicator here as well, similar to updateProfile
     // const loadingMessageDiv = document.getElementById('loading-message'); // If you add this to HTML
     // if (loadingMessageDiv) loadingMessageDiv.style.display = 'block';

     if (messageDiv) messageDiv.style.display = 'none'; // Clear previous messages

     try {
          const response = await axios.get(`${USER_API_END_POINT}/profile`);

          if (response.data.success && response.data.user) {
               const user = response.data.user;
               console.log('Profile fetched:', user);

               // Update display spans and elements
               if (display_profilePhoto) display_profilePhoto.src = user.profilePhoto || 'assets/images/default-avatar.jpg';
               if (display_fullName) display_fullName.textContent = user.fullName || 'N/A';
               if (display_email) display_email.textContent = user.email || 'N/A';
               if (display_phone) display_phone.textContent = user.phone || 'N/A';
               if (display_bio) display_bio.textContent = user.bio || 'No bio provided.';
               if (display_skills) display_skills.textContent = (user.skills && Array.isArray(user.skills) && user.skills.length > 0) ? user.skills.join(', ') : 'No skills listed.';

               // Handle resume display
               if (display_resume) {
                    if (user.resume) {
                         display_resume.href = user.resume;
                         display_resume.textContent = 'View Resume';
                         display_resume.style.pointerEvents = 'auto'; // Make clickable
                    } else {
                         display_resume.href = '#';
                         display_resume.textContent = 'No resume uploaded.';
                         display_resume.style.pointerEvents = 'none'; // Make unclickable
                    }
               }

               if (display_role) display_role.textContent = user.role || 'N/A';
               if (display_createdAt) display_createdAt.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
               if (display_updatedAt) display_updatedAt.textContent = user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A';


               // Populate update form text fields (not file inputs)
               if (fullNameInput) fullNameInput.value = user.fullName || '';
               if (emailInput) emailInput.value = user.email || '';
               if (phoneInput) phoneInput.value = user.phone || '';
               if (bioTextarea) bioTextarea.value = user.bio || '';
               if (skillsInput) skillsInput.value = (user.skills && Array.isArray(user.skills) ? user.skills.join(', ') : user.skills || '');

               // Update the 'Current' displays for file inputs (if you use those IDs from my previous HTML)
               if (currentProfilePhotoUrl) {
                    currentProfilePhotoUrl.src = user.profilePhoto || 'assets/images/default-avatar.jpg';
               }
               if (currentResumeUrl) {
                    if (user.resume) {
                         currentResumeUrl.href = user.resume;
                         currentResumeUrl.textContent = 'View Resume';
                    } else {
                         currentResumeUrl.href = '#';
                         currentResumeUrl.textContent = 'No resume uploaded';
                    }
               }
          } else {
               // Using a centralized message display function
               displayMessage(messageDiv, response.data.message || 'Failed to load profile.', 'error');
          }
     } catch (error) {
          console.error('Error fetching profile:', error);
          const errorMessage = error.response?.data?.message || 'An error occurred while loading profile.';
          displayMessage(messageDiv, errorMessage, 'error'); // Using the centralized message div

          if (error.response && (error.response.status === 401 || error.response.status === 403)) {
               alert("Session expired. Please log in again.");
               localStorage.removeItem('userRole');
               // Assuming 'token' is also handled by httpOnly cookies, if not, clear it.
               // localStorage.removeItem('token');
               window.location.href = '../login.html';
          }
     }
     // finally {
     //     if (loadingMessageDiv) loadingMessageDiv.style.display = 'none';
     // }
}

// Handle form submission for profile update
if (profileForm) {
     profileForm.addEventListener('submit', async (e) => {
          e.preventDefault();

          if (messageDiv) messageDiv.style.display = 'none'; // Clear previous messages

          const password = passwordInput.value;
          const confirmPassword = confirmPasswordInput.value;

          if (password && password !== confirmPassword) {
               displayMessage(messageDiv, 'Passwords do not match.', 'error');
               return;
          }
          if (password && password.length < 6) {
               displayMessage(messageDiv, 'Password must be at least 6 characters long.', 'error');
               return;
          }

          const formData = new FormData();

          // Append text fields with defensive checks
          if (fullNameInput) formData.append('fullName', fullNameInput.value.trim());
          if (phoneInput) formData.append('phone', phoneInput.value.trim());
          if (bioTextarea) formData.append('bio', bioTextarea.value.trim());
          if (skillsInput) formData.append('skills', skillsInput.value.trim()); // Send as comma-separated string

          // Append file fields ONLY if a new file has been selected
          // Using the CORRECTED IDs: profilePhotoFileInput and resumeFileInput
          if (profilePhotoFileInput && profilePhotoFileInput.files && profilePhotoFileInput.files[0]) {
               formData.append('profilePhoto', profilePhotoFileInput.files[0]);
          }
          if (resumeFileInput && resumeFileInput.files && resumeFileInput.files[0]) {
               formData.append('resume', resumeFileInput.files[0]);
          }
          // Only append password if it's provided (not empty)
          if (password) {
               formData.append('password', password);
          }

          try {
               const response = await axios.put(`${USER_API_END_POINT}/profile`, formData, {
                    headers: {
                         // Axios automatically sets 'Content-Type': 'multipart/form-data' for FormData
                         // when no explicit Content-Type is provided, which is what we want.
                    },
                    withCredentials: true
               });

               if (response.data.success) {
                    displayMessage(messageDiv, response.data.message, 'success');
                    profileEditSection.classList.add('hidden');
                    profileDisplaySection.classList.remove('hidden');
                    await fetchProfile(); // Refresh displayed profile details
               } else {
                    displayMessage(messageDiv, response.data.message || 'Failed to update profile.', 'error');
               }

          } catch (error) {
               console.error('Error updating profile:', error);
               const errorMessage = error.response?.data?.message || 'An error occurred while updating profile.';
               displayMessage(messageDiv, errorMessage, 'error');

               if (error.response && (error.response.status === 401 || error.response.status === 403)) {
                    alert("Session expired. Please log in again.");
                    localStorage.removeItem('userRole');
                    // localStorage.removeItem('token'); // Uncomment if you are using localStorage JWT
                    window.location.href = '../login.html';
               }
          }
     });
} else {
     console.error("Profile form element not found!");
     displayMessage(messageDiv, "Initialization error: Profile form not found.", 'error');
}