// function renderNavbar() {
//      const navbar = document.getElementById('navbar');
//      const user = JSON.parse(localStorage.getItem('user'));
//      let navContent = `
//         <div class="flex items-center justify-between mx-auto max-w-7xl h-16 bg-white">
//             <h1 class="text-2xl font-bold">Job<span class="text-red-500">Portal</span></h1>
//             <div class="flex items-center gap-12">
//                 <ul class="flex font-medium items-center gap-5">
//     `;
//      if (user && user.role === 'recruiter') {
//           navContent += `
//             <li><a href="admin/companies.html">Companies</a></li>
//             <li><a href="admin/jobs.html">Jobs</a></li>
//         `;
//      } else {
//           navContent += `
//             <li><a href="index.html">Home</a></li>
//             <li><a href="jobs.html">Jobs</a></li>
//             <li><a href="browse.html">Browse</a></li>
//         `;
//      }
//      navContent += `
//                 </ul>
//                 <div>
//                     ${user ? `
//                         <div class="relative">
//                             <button id="user-menu" class="flex items-center">
//                                 <img src="${user.profilePhoto || 'assets/images/default-avatar.png'}" alt="User" class="w-8 h-8 rounded-full">
//                             </button>
//                             <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
//                                 <a href="profile.html" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
//                                 <button id="logout-btn" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
//                             </div>
//                         </div>
//                     ` : `
//                         <a href="login.html" class="text-blue-500">Login</a>
//                         <a href="signup.html" class="ml-4 bg-blue-500 text-white px-4 py-2 rounded">Sign Up</a>
//                     `}
//                 </div>
//             </div>
//         </div>
//     `;
//      navbar.innerHTML = navContent;
//      const userMenu = document.getElementById('user-menu');
//      const userDropdown = document.getElementById('user-dropdown');
//      if (userMenu) {
//           userMenu.addEventListener('click', () => {
//                userDropdown.classList.toggle('hidden');
//           });
//      }
//      const logoutBtn = document.getElementById('logout-btn');
//      if (logoutBtn) {
//           logoutBtn.addEventListener('click', async () => {
//                try {
//                     await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
//                     localStorage.removeItem('user');
//                     localStorage.removeItem('token');
//                     alert('Logged out successfully!');
//                     window.location.href = 'index.html';
//                } catch (error) {
//                     alert('Error during logout.');
//                }
//           });
//      }
// }
// document.addEventListener('DOMContentLoaded', renderNavbar);






// === UPDATED navbar.js ===
function renderNavbar() {
    const navbar = document.getElementById('navbar');
    const user = JSON.parse(localStorage.getItem('user'));
    const userRole = localStorage.getItem('userRole');

    let navContent = `
        <div class="flex items-center justify-between mx-auto max-w-7xl h-16 bg-white">
            <h1 class="text-2xl font-bold">Job<span class="text-red-500">Portal</span></h1>
            <div class="flex items-center gap-12">
                <ul class="flex font-medium items-center gap-5">
    `;

    if (user && userRole === 'recruiter') {
        navContent += `
            <li><a href="index.html">Home</a></li>
            <li><a href="admin/companies.html">Companies</a></li>
            <li><a href="admin/jobs.html">Jobs</a></li>
        `;
    } else if (user && userRole === 'student') {
        navContent += `
            <li><a href="index.html">Home</a></li>
            <li><a href="browse.html">Browse Jobs</a></li>
            <li><a href="applications.html">My Applications</a></li>
        `;
    } else {
        navContent += `
            <li><a href="index.html">Home</a></li>
        `;
    }

    navContent += `
                </ul>
                <div>
                    ${user ? `
                        <div class="relative">
                            <button id="user-menu" class="flex items-center">
                                <img src="${user.profilePhoto || 'assets/images/default-avatar.png'}" alt="User" class="w-8 h-8 rounded-full">
                            </button>
                            <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-48 bg-white border rounded shadow-lg">
                                <a href="profile.html" class="block px-4 py-2 hover:bg-gray-100">Profile</a>
                                <button id="logout-btn" class="block w-full text-left px-4 py-2 hover:bg-gray-100">Logout</button>
                            </div>
                        </div>
                    ` : `
                        <a href="login.html" class="text-blue-500">Login</a>
                        <a href="signup.html" class="ml-4 bg-blue-500 text-white px-4 py-2 rounded">Sign Up</a>
                    `}
                </div>
            </div>
        </div>
    `;

    navbar.innerHTML = navContent;

    const userMenu = document.getElementById('user-menu');
    const userDropdown = document.getElementById('user-dropdown');
    if (userMenu) {
        userMenu.addEventListener('click', () => {
            userDropdown.classList.toggle('hidden');
        });
    }

    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await axios.get(`${USER_API_END_POINT}/logout`, { withCredentials: true });
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                localStorage.removeItem('userRole');
                alert('Logged out successfully!');
                window.location.href = 'index.html';
            } catch (error) {
                alert('Error during logout.');
            }
        });
    }
}

document.addEventListener('DOMContentLoaded', renderNavbar);


