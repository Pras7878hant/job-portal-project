export function loadHeader() {
  const user = JSON.parse(localStorage.getItem('user'));
  const currentPath = window.location.pathname;

  const headerTemplate = `
    <header>
      <nav class="nav">
        <div class="nav-logo">
          <a href="/index.html">
            <img class="logo" src="/assets/images/myLogo.png" alt="Skratchr">
          </a>
        </div>

        <div class="nav-toggle" onclick="toggleNav()">
          <i class="fas fa-bars"></i>
        </div>

        <div class="nav-menu" id="navMenu">
          <a href="/index.html" class="${currentPath.includes('index.html') ? 'active' : ''}">Home</a>
          ${user && user.role === 'recruiter' ? `
            <a href="/admin/companies.html" class="${currentPath.includes('companies.html') ? 'active' : ''}">Companies</a>
            <a href="/admin/jobs.html" class="${currentPath.includes('jobs.html') ? 'active' : ''}">Jobs</a>
          ` : `
            <a href="/browse.html" class="${currentPath.includes('browse.html') ? 'active' : ''}">Browse Jobs</a>
            <a href="/applications.html" class="${currentPath.includes('applications.html') ? 'active' : ''}">My Applications</a>
          `}
        </div>

        <div class="nav-right">
          ${user ? `
            <div class="relative">
              <button id="user-menu" class="user-menu-button">
                <img src="${user.profilePhoto || '/assets/images/default-avatar.png'}" alt="User" class="nav-profile-img">
              </button>
              <div id="user-dropdown" class="hidden user-dropdown">
                <a href="/profile.html" class="dropdown-item">Profile</a>
                <button id="logout-btn" class="dropdown-item">Logout</button>
              </div>
            </div>
          ` : `
            <a class="navAnc" href="/signup.html"><button class="nav-btn">Sign up</button></a>
            <a class="navAnc" href="/login.html"><button class="nav-btn">Log in</button></a>
          `}
        </div>
      </nav>
    </header>
  `;

  document.body.insertAdjacentHTML('afterbegin', headerTemplate);

  // Nav toggle for small screens
  window.toggleNav = function () {
    document.getElementById('navMenu').classList.toggle('show');
  };

  // Toggle profile dropdown
  const userMenu = document.getElementById('user-menu');
  const userDropdown = document.getElementById('user-dropdown');
  if (userMenu) {
    userMenu.addEventListener('click', () => {
      userDropdown.classList.toggle('hidden');
    });
  }

  // Logout logic
  const logoutBtn = document.getElementById('logout-btn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
      try {
        await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        alert('Logged out successfully!');
        window.location.href = '/index.html';
      } catch (error) {
        alert('Error during logout.');
      }
    });
  }
}

















// export function loadHeader() {
//   const user = JSON.parse(localStorage.getItem('user'));
//   const currentPath = window.location.pathname;

//   const headerTemplate = `
//     <header>
//       <nav class="nav">
//         <div class="nav-logo">
//           <a href="index.html">
//             <img class="logo" src="./assets/images/myLogo.png" alt="Skratchr">
//           </a>
//         </div>

//         <div class="nav-toggle" onclick="toggleNav()">
//           <i class="fas fa-bars"></i>
//         </div>

//         <div class="nav-menu" id="navMenu">
//           <a href="index.html" class="${currentPath.includes('index.html') ? 'active' : ''}">Home</a>
//           ${user && user.role === 'recruiter' ? `
//             <a href="admin/companies.html" class="${currentPath.includes('companies.html') ? 'active' : ''}">Companies</a>
//             <a href="admin/jobs.html" class="${currentPath.includes('jobs.html') ? 'active' : ''}">Jobs</a>
//           ` : `
//             <a href="browse.html" class="${currentPath.includes('browse.html') ? 'active' : ''}">Browse Jobs</a>
//             <a href="applications.html" class="${currentPath.includes('applications.html') ? 'active' : ''}">My Applications</a>
//           `}
//         </div>

//         <div class="nav-right">
//           ${user ? `
//             <div class="relative">
//               <button id="user-menu" class="user-menu-button">
//                 <img src="${user.profilePhoto || 'assets/images/default-avatar.png'}" alt="User" class="nav-profile-img">
//               </button>
//               <div id="user-dropdown" class="hidden user-dropdown">
//                 <a href="profile.html" class="dropdown-item">Profile</a>
//                 <button id="logout-btn" class="dropdown-item">Logout</button>
//               </div>
//             </div>
//           ` : `
//             <a class="navAnc" href="signup.html"><button class="nav-btn">Sign up</button></a>
//             <a class="navAnc" href="login.html"><button class="nav-btn">Log in</button></a>
//           `}
//         </div>
//       </nav>
//     </header>
//   `;

//   document.body.insertAdjacentHTML('afterbegin', headerTemplate);

//   // Nav toggle for small screens
//   window.toggleNav = function () {
//     document.getElementById('navMenu').classList.toggle('show');
//   };

//   // Toggle profile dropdown
//   const userMenu = document.getElementById('user-menu');
//   const userDropdown = document.getElementById('user-dropdown');
//   if (userMenu) {
//     userMenu.addEventListener('click', () => {
//       userDropdown.classList.toggle('hidden');
//     });
//   }

//   // Logout logic
//   const logoutBtn = document.getElementById('logout-btn');
//   if (logoutBtn) {
//     logoutBtn.addEventListener('click', async () => {
//       try {
//         await axios.get('http://localhost:8000/api/v1/user/logout', { withCredentials: true });
//         localStorage.removeItem('user');
//         localStorage.removeItem('token');
//         alert('Logged out successfully!');
//         window.location.href = 'index.html';
//       } catch (error) {
//         alert('Error during logout.');
//       }
//     });
//   }
// }












// export function loadHeader() {

//   // More robust page detection
//   const currentPath = window.location.pathname;
//   const navLinks = [
//     { url: 'index.html', text: 'Home' },
//     { url: 'browse.html', text: 'Browse Jobs' },
//     { url: 'profile.html', text: 'Profile' },
//     { url: 'applications.html', text: 'My Applications' },
//     { url: 'admin/companies.html', text: 'Manage Companies' },
//     { url: 'admin/jobs.html', text: 'Manage Jobs' }
//   ];

//   const headerTemplate = `
//     <header>
//       <nav class="nav">
//         <div class="nav-logo">
//           <a href="index.html">
//             <img class="logo" src="./assets/images/myLogo.png" alt="Skratchr">
//           </a>
//         </div>

//         <div class="nav-toggle" onclick="toggleNav()">
//           <i class="fas fa-bars"></i>
//         </div>

//         <div class="nav-menu" id="navMenu">
//           ${navLinks.map(link => `
//             <a href="${link.url}" 
//                class="${currentPath.includes(link.url) ? 'active' : ''}"
//                data-link="${link.url}">
//               ${link.text}
//             </a>
//           `).join('')}
//         </div>

//         <div class="nav-right">
//           <a class="navAnc" href="signup.html">
//             <button class="nav-btn">Sign up</button>
//           </a>
//           <a class="navAnc" href="login.html">
//             <button class="nav-btn">Log in</button>
//           </a>
//         </div>
//       </nav>
//     </header>
//   `;

//   document.body.insertAdjacentHTML('afterbegin', headerTemplate);

//   // Add click handlers to update active state
//   document.querySelectorAll('.nav-menu a').forEach(link => {
//     link.addEventListener('click', function () {
//       document.querySelectorAll('.nav-menu a').forEach(a => a.classList.remove('active'));
//       this.classList.add('active');
//     });
//   });
// }

// window.toggleNav = function () {
//   document.getElementById('navMenu').classList.toggle('show');
// };