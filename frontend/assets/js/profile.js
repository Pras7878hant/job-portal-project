import { USER_API_END_POINT, displayMessage } from './utils.js';

const fields = {
     photo: document.getElementById('display-profilePhoto'),
     fullName: document.getElementById('display-fullName'),
     email: document.getElementById('display-email'),
     phone: document.getElementById('display-phone'),
     bio: document.getElementById('display-bio'),
     skills: document.getElementById('display-skills'),
     resume: document.getElementById('display-resume'),
     role: document.getElementById('display-role'),
     createdAt: document.getElementById('display-createdAt'),
     updatedAt: document.getElementById('display-updatedAt')
};

const profileForm = document.getElementById('profile-form');
const profilePhotoFileInput = document.getElementById('profilePhotoFile');
const resumeFileInput = document.getElementById('resumeFile');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const bioTextarea = document.getElementById('bio');
const skillsInput = document.getElementById('skills');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const currentProfilePhotoUrl = document.getElementById('current-profilePhoto-url');
const currentResumeUrl = document.getElementById('current-resume-url');
const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const profileDisplaySection = document.getElementById('profile-display');
const profileEditSection = document.getElementById('profile-edit-section');
const messageDiv = document.getElementById('message');

axios.defaults.withCredentials = true;
const token = localStorage.getItem('token');
if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;

document.addEventListener('DOMContentLoaded', async () => {
     await fetchProfile();

     editProfileBtn?.addEventListener('click', () => {
          profileDisplaySection.classList.add('hidden');
          profileEditSection.classList.remove('hidden');
          fullNameInput.value = fields.fullName.textContent;
          emailInput.value = fields.email.textContent;
          phoneInput.value = fields.phone.textContent;
          bioTextarea.value = fields.bio.textContent === 'No bio provided.' ? '' : fields.bio.textContent;
          skillsInput.value = fields.skills.textContent === 'No skills listed.' ? '' : fields.skills.textContent;
          passwordInput.value = '';
          confirmPasswordInput.value = '';
     });

     cancelEditBtn?.addEventListener('click', () => {
          profileEditSection.classList.add('hidden');
          profileDisplaySection.classList.remove('hidden');
          displayMessage(messageDiv, '', 'info');
     });
});

async function fetchProfile() {
     displayMessage(messageDiv, '', 'info');

     try {
          const response = await axios.get(`${USER_API_END_POINT}/profile`);
          const user = response.data.user;

          fields.photo.src = user.profilePhoto || 'assets/images/default-avatar.jpg';
          fields.fullName.textContent = user.fullName || 'N/A';
          fields.email.textContent = user.email || 'N/A';
          fields.phone.textContent = user.phone || 'N/A';
          fields.bio.textContent = user.bio || 'No bio provided.';
          fields.skills.textContent = user.skills?.length ? user.skills.join(', ') : 'No skills listed.';
          fields.role.textContent = user.role || 'N/A';
          fields.createdAt.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
          fields.updatedAt.textContent = user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A';

          setResumeLink(fields.resume, user.resume);
          setResumeLink(currentResumeUrl, user.resume);
          currentProfilePhotoUrl.src = user.profilePhoto || 'assets/images/default-avatar.jpg';

          fullNameInput.value = user.fullName || '';
          emailInput.value = user.email || '';
          phoneInput.value = user.phone || '';
          bioTextarea.value = user.bio || '';
          skillsInput.value = user.skills?.join(', ') || '';
     } catch (error) {
          displayMessage(messageDiv, error.response?.data?.message || 'An error occurred while loading profile.', 'error');
          if (error.response?.status === 401 || error.response?.status === 403) {
               localStorage.removeItem('userRole');
               localStorage.removeItem('token');
               window.location.href = '/login.html';
          }
     }
}

function setResumeLink(element, url) {
     if (!element) return;
     element.href = url || '#';
     element.textContent = url ? 'View Resume' : 'No resume uploaded';
     element.style.pointerEvents = url ? 'auto' : 'none';
}

profileForm?.addEventListener('submit', async (event) => {
     event.preventDefault();
     displayMessage(messageDiv, '', 'info');

     const password = passwordInput.value;
     if (password && password !== confirmPasswordInput.value) {
          displayMessage(messageDiv, 'Passwords do not match.', 'error');
          return;
     }
     if (password && password.length < 6) {
          displayMessage(messageDiv, 'Password must be at least 6 characters long.', 'error');
          return;
     }

     const formData = new FormData();
     formData.append('fullName', fullNameInput.value.trim());
     formData.append('phone', phoneInput.value.trim());
     formData.append('bio', bioTextarea.value.trim());
     formData.append('skills', skillsInput.value.trim());
     if (profilePhotoFileInput.files[0]) formData.append('profilePhoto', profilePhotoFileInput.files[0]);
     if (resumeFileInput.files[0]) formData.append('resume', resumeFileInput.files[0]);
     if (password) formData.append('password', password);

     try {
          const response = await axios.put(`${USER_API_END_POINT}/profile`, formData);
          displayMessage(messageDiv, response.data.message || 'Profile updated successfully.', 'success');
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...response.data.user }));
          profileEditSection.classList.add('hidden');
          profileDisplaySection.classList.remove('hidden');
          await fetchProfile();
     } catch (error) {
          displayMessage(messageDiv, error.response?.data?.message || 'An error occurred while updating profile.', 'error');
     }
});
import { USER_API_END_POINT, displayMessage } from './utils.js';

const fields = {
     photo: document.getElementById('display-profilePhoto'),
     fullName: document.getElementById('display-fullName'),
     email: document.getElementById('display-email'),
     phone: document.getElementById('display-phone'),
     bio: document.getElementById('display-bio'),
     skills: document.getElementById('display-skills'),
     resume: document.getElementById('display-resume'),
     role: document.getElementById('display-role'),
     createdAt: document.getElementById('display-createdAt'),
     updatedAt: document.getElementById('display-updatedAt'),
     username: document.getElementById('display-username'),
     portfolioStatus: document.getElementById('display-portfolioStatus'),
     portfolioTheme: document.getElementById('display-portfolioTheme')
};

const profileForm = document.getElementById('profile-form');
const profilePhotoFileInput = document.getElementById('profilePhotoFile');
const resumeFileInput = document.getElementById('resumeFile');
const fullNameInput = document.getElementById('fullName');
const emailInput = document.getElementById('email');
const phoneInput = document.getElementById('phone');
const bioTextarea = document.getElementById('bio');
const skillsInput = document.getElementById('skills');
const passwordInput = document.getElementById('password');
const confirmPasswordInput = document.getElementById('confirmPassword');
const currentProfilePhotoUrl = document.getElementById('current-profilePhoto-url');
const currentResumeUrl = document.getElementById('current-resume-url');
const editProfileBtn = document.getElementById('edit-profile-btn');
const cancelEditBtn = document.getElementById('cancel-edit-btn');
const profileDisplaySection = document.getElementById('profile-display');
const profileEditSection = document.getElementById('profile-edit-section');
const messageDiv = document.getElementById('message');

const isPortfolioPublicInput = document.getElementById('isPortfolioPublic');
const portfolioThemeInput = document.getElementById('portfolioTheme');
const publicLinkContainer = document.getElementById('public-link-container');
const publicLinkAnchor = document.getElementById('public-link-anchor');

axios.defaults.withCredentials = true;
const token = localStorage.getItem('token');
if (token) axios.defaults.headers.common.Authorization = `Bearer ${token}`;

document.addEventListener('DOMContentLoaded', async () => {
     await fetchProfile();

     editProfileBtn?.addEventListener('click', () => {
          profileDisplaySection.classList.add('hidden');
          profileEditSection.classList.remove('hidden');
          fullNameInput.value = fields.fullName.textContent;
          emailInput.value = fields.email.textContent;
          phoneInput.value = fields.phone.textContent;
          bioTextarea.value = fields.bio.textContent === 'No bio provided.' ? '' : fields.bio.textContent;
          skillsInput.value = fields.skills.textContent === 'No skills listed.' ? '' : fields.skills.textContent;
          passwordInput.value = '';
          confirmPasswordInput.value = '';

          if (isPortfolioPublicInput) {
               isPortfolioPublicInput.checked = fields.portfolioStatus?.textContent === 'Public';
          }
          if (portfolioThemeInput) {
               portfolioThemeInput.value = fields.portfolioTheme?.textContent || 'light';
          }
     });

     cancelEditBtn?.addEventListener('click', () => {
          profileEditSection.classList.add('hidden');
          profileDisplaySection.classList.remove('hidden');
          displayMessage(messageDiv, '', 'info');
     });
});

async function fetchProfile() {
     displayMessage(messageDiv, '', 'info');

     try {
          const response = await axios.get(`${USER_API_END_POINT}/profile`);
          const user = response.data.user;

          fields.photo.src = user.profilePhoto || 'assets/images/default-avatar.jpg';
          fields.fullName.textContent = user.fullName || 'N/A';
          fields.email.textContent = user.email || 'N/A';
          fields.phone.textContent = user.phone || 'N/A';
          fields.bio.textContent = user.bio || 'No bio provided.';
          fields.skills.textContent = user.skills?.length ? user.skills.join(', ') : 'No skills listed.';
          fields.role.textContent = user.role || 'N/A';
          fields.createdAt.textContent = user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A';
          fields.updatedAt.textContent = user.updatedAt ? new Date(user.updatedAt).toLocaleDateString() : 'N/A';

          // Update new portfolio 
          if (fields.username) fields.username.textContent = user.username || 'N/A';
          if (fields.portfolioStatus) fields.portfolioStatus.textContent = user.isPortfolioPublic ? 'Public' : 'Private';
          if (fields.portfolioTheme) fields.portfolioTheme.textContent = user.portfolioTheme || 'light';

          setResumeLink(fields.resume, user.resume);
          setResumeLink(currentResumeUrl, user.resume);
          currentProfilePhotoUrl.src = user.profilePhoto || 'assets/images/default-avatar.jpg';

          fullNameInput.value = user.fullName || '';
          emailInput.value = user.email || '';
          phoneInput.value = user.phone || '';
          bioTextarea.value = user.bio || '';
          skillsInput.value = user.skills?.join(', ') || '';

          // Generate and display the live public link if portfolio is active
          if (publicLinkContainer && publicLinkAnchor && user.username) {
               const baseUrl = window.location.origin;
               publicLinkAnchor.href = `/p/${user.username}`;
               publicLinkAnchor.textContent = `${baseUrl}/p/${user.username}`;

               if (user.isPortfolioPublic) {
                    publicLinkContainer.classList.remove('hidden');
               } else {
                    publicLinkContainer.classList.add('hidden');
               }
          }

     } catch (error) {
          displayMessage(messageDiv, error.response?.data?.message || 'An error occurred while loading profile.', 'error');
          if (error.response?.status === 401 || error.response?.status === 403) {
               localStorage.removeItem('userRole');
               localStorage.removeItem('token');
               window.location.href = '/login.html';
          }
     }
}

function setResumeLink(element, url) {
     if (!element) return;
     element.href = url || '#';
     element.textContent = url ? 'View Resume' : 'No resume uploaded';
     element.style.pointerEvents = url ? 'auto' : 'none';
}

profileForm?.addEventListener('submit', async (event) => {
     event.preventDefault();
     displayMessage(messageDiv, '', 'info');

     const password = passwordInput.value;
     if (password && password !== confirmPasswordInput.value) {
          displayMessage(messageDiv, 'Passwords do not match.', 'error');
          return;
     }
     if (password && password.length < 6) {
          displayMessage(messageDiv, 'Password must be at least 6 characters long.', 'error');
          return;
     }

     const formData = new FormData();
     formData.append('fullName', fullNameInput.value.trim());
     formData.append('phone', phoneInput.value.trim());
     formData.append('bio', bioTextarea.value.trim());
     formData.append('skills', skillsInput.value.trim());
     if (profilePhotoFileInput.files[0]) formData.append('profilePhoto', profilePhotoFileInput.files[0]);
     if (resumeFileInput.files[0]) formData.append('resume', resumeFileInput.files[0]);
     if (password) formData.append('password', password);

     // Append new portfolio fields
     if (isPortfolioPublicInput) formData.append('isPortfolioPublic', isPortfolioPublicInput.checked);
     if (portfolioThemeInput) formData.append('portfolioTheme', portfolioThemeInput.value);

     try {
          const response = await axios.put(`${USER_API_END_POINT}/profile`, formData);
          displayMessage(messageDiv, response.data.message || 'Profile updated successfully.', 'success');
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(localStorage.getItem('user') || '{}'), ...response.data.user }));
          profileEditSection.classList.add('hidden');
          profileDisplaySection.classList.remove('hidden');
          await fetchProfile();
     } catch (error) {
          displayMessage(messageDiv, error.response?.data?.message || 'An error occurred while updating profile.', 'error');
     }
});