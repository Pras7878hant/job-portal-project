import { USER_API_END_POINT } from './utils.js';

document.addEventListener('DOMContentLoaded', fetchPortfolio);

async function fetchPortfolio() {
     const urlParams = new URLSearchParams(window.location.search);
     const username = urlParams.get('u');

     const loadingState = document.getElementById('loading-state');
     const errorState = document.getElementById('error-state');
     const portfolioContent = document.getElementById('portfolio-content');

     if (!username) {
          showError("No username provided.");
          return;
     }

     try {
          const response = await axios.get(`${USER_API_END_POINT}/portfolio/${username}`);

          if (response.data.success) {
               populatePortfolio(response.data.user);

               loadingState.classList.add('hidden');
               portfolioContent.classList.remove('hidden');
               setTimeout(() => portfolioContent.classList.remove('opacity-0'), 50);
          }
     } catch (error) {
          loadingState.classList.add('hidden');
          showError(error.response?.data?.message || "This portfolio is unavailable.");
     }

     function showError(message) {
          document.getElementById('error-message').textContent = message;
          errorState.classList.remove('hidden');
     }
}

function populatePortfolio(user) {
     applyTheme(user.portfolioTheme || 'light');

     document.title = `${user.fullName} | Portfolio`;
     document.getElementById('port-photo').src = user.profilePhoto || 'assets/images/default-avatar.jpg';
     document.getElementById('port-name').textContent = user.fullName;
     document.getElementById('port-role').textContent = user.role || 'Professional';
     document.getElementById('port-bio').textContent = user.bio || 'This user has not provided a bio yet.';

     const resumeBtn = document.getElementById('port-resume');
     if (user.resume) {
          resumeBtn.href = user.resume;
     } else {
          resumeBtn.style.display = 'none';
     }

     const skillsContainer = document.getElementById('port-skills');
     if (user.skills && user.skills.length > 0) {
          const skillHTML = user.skills.map(skill =>
               // Updated classes here to force a dark background and white text on the pills
               `<span class="px-3 py-1 rounded-full text-sm font-medium bg-slate-800 text-white border border-slate-600 shadow-sm">
                    ${skill}
               </span>`
          ).join('');
          skillsContainer.innerHTML = skillHTML;
     } else {
          skillsContainer.innerHTML = '<p class="italic text-slate-400">No skills listed yet.</p>';
     }
}

function applyTheme(themeName) {
     const body = document.getElementById('theme-body');
     const nav = document.getElementById('portfolio-nav');
     const border = document.getElementById('main-content-border');

     body.className = 'min-h-screen transition-colors duration-300';

     if (themeName === 'dark') {
          body.classList.add('bg-slate-900', 'text-slate-50');
          nav.classList.add('border-slate-700');
          border.classList.add('border-slate-700');
     } else if (themeName === 'minimal') {
          body.classList.add('bg-white', 'text-black', 'font-serif');
          nav.classList.add('border-gray-200');
          border.classList.add('border-gray-200');
     } else {
          body.classList.add('bg-slate-50', 'text-slate-950');
          nav.classList.add('border-slate-300');
          border.classList.add('border-slate-300');
     }
}