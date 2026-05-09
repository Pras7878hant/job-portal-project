export function loadHeader() {
  let user = null;
  try {
    const storedUser = localStorage.getItem("user");
    if (storedUser && storedUser !== "null" && storedUser !== "undefined") {
      user = JSON.parse(storedUser);
      if (Object.keys(user).length === 0) user = null;
    }
  } catch (e) {
    user = null;
  }

  const currentPath = window.location.pathname;
  const role = localStorage.getItem("userRole") || user?.role;
  const isAdminPage = currentPath.includes("/admin/");
  const basePath = isAdminPage ? ".." : ".";
  const isLoggedIn = user && user._id;

  const headerTemplate = `
    <header class="sticky top-0 z-40 border-b border-gray-200 bg-white/80 backdrop-blur-lg shadow-sm">
      <nav class="mx-auto flex h-20 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <a href="${basePath}/index.html" class="flex items-center gap-2 group transition-transform duration-300 hover:scale-105">
         
          <span class="text-2xl font-black tracking-tighter text-black uppercase">Skratchr</span>
        </a>

        <button class="rounded-full border border-gray-200 bg-white p-2 text-black shadow-sm transition-all hover:bg-black hover:text-white md:hidden" onclick="toggleNav()" aria-label="Open navigation">
          <i class="fas fa-bars text-lg"></i>
        </button>

        <div class="hidden items-center gap-2 md:flex" id="navMenu">
          <a href="${basePath}/index.html" class="${navClass(currentPath, "index.html")}">
            Home
          </a>

          ${isLoggedIn && role === "recruiter"
      ? `
                <a href="${basePath}/admin/companies.html" class="${navClass(currentPath, "companies.html")}">
                  Companies
                </a>
                <a href="${basePath}/post-job.html" class="${navClass(currentPath, "post-job.html")}">
                  Post Job
                </a>
                <a href="${basePath}/admin/jobs.html" class="${navClass(currentPath, "jobs.html")}">
                  Jobs
                </a>
              `
      : `
                <a href="${basePath}/browse.html" class="${navClass(currentPath, "browse.html")}">
                  Browse Jobs
                </a>
                ${isLoggedIn
        ? `
                      <a href="${basePath}/applications.html" class="${navClass(currentPath, "applications.html")}">
                        My Applications
                      </a>
                    `
        : ""
      }
              `
    }
        </div>

        <div class="flex items-center gap-4">
          ${isLoggedIn
      ? `
                <div class="relative">
                  <button id="user-menu" class="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full border-2 border-black bg-white text-black shadow-md transition-all duration-300 hover:scale-110 hover:shadow-xl focus:outline-none focus:ring-4 focus:ring-gray-200">
                    ${user.profilePhoto && user.profilePhoto.trim() !== "" && !user.profilePhoto.includes("default-avatar")
        ? `<img src="${user.profilePhoto}" alt="User" class="h-full w-full object-cover grayscale">`
        : `<i class="fas fa-user text-xl"></i>`
      }
                  </button>

                  <div id="user-dropdown" class="hidden absolute right-0 mt-3 w-56 origin-top-right overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-2xl transition-all">
                    <div class="border-b border-gray-100 px-4 py-3">
                      <p class="text-sm font-bold text-black truncate">${user.fullName || 'User'}</p>
                      <p class="text-xs font-medium text-gray-500 truncate">${user.email || ''}</p>
                    </div>
                    <div class="p-2">
                      <a href="${basePath}/profile.html" class="flex items-center gap-3 rounded-xl px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-black hover:text-white">
                        <i class="fas fa-user-circle"></i> Profile
                      </a>
                      <button id="logout-btn" class="flex w-full items-center gap-3 rounded-xl px-4 py-2.5 text-left text-sm font-semibold text-gray-700 transition-colors hover:bg-red-600 hover:text-white">
                        <i class="fas fa-sign-out-alt"></i> Logout
                      </button>
                    </div>
                  </div>
                </div>
              `
      : `
                <a 
                  class="rounded-full border-2 border-transparent px-5 py-2.5 text-sm font-bold tracking-wide text-black transition-all duration-300 hover:border-black hover:bg-gray-50 hidden sm:block"
                  href="${basePath}/login.html"
                >
                  Log in
                </a>

                <a 
                  class="rounded-full border-2 border-black bg-black px-6 py-2.5 text-sm font-bold tracking-wide text-white shadow-lg transition-all duration-300 hover:bg-white hover:text-black hover:shadow-xl"
                  href="${basePath}/signup.html"
                >
                  Sign up
                </a>
              `
    }
        </div>

      </nav>
    </header>
  `;

  document.body.insertAdjacentHTML("afterbegin", headerTemplate);

  window.toggleNav = function () {
    const menu = document.getElementById("navMenu");

    [
      "hidden",
      "absolute",
      "left-0",
      "top-20",
      "flex",
      "w-full",
      "flex-col",
      "gap-4",
      "border-b",
      "border-gray-200",
      "bg-white/95",
      "backdrop-blur-lg",
      "p-6",
      "shadow-xl"
    ].forEach((className) => {
      menu.classList.toggle(className);
    });
  };

  const userMenu = document.getElementById("user-menu");
  const userDropdown = document.getElementById("user-dropdown");

  if (userMenu) {
    userMenu.addEventListener("click", () => {
      userDropdown.classList.toggle("hidden");
    });
  }

  document.addEventListener("click", (event) => {
    if (userMenu && !userMenu.contains(event.target) && !userDropdown.contains(event.target)) {
      userDropdown.classList.add("hidden");
    }
  });

  const logoutBtn = document.getElementById("logout-btn");

  if (logoutBtn) {
    logoutBtn.addEventListener("click", async () => {
      try {
        await axios.get("http://localhost:8000/api/v1/user/logout", {
          withCredentials: true
        });
      } finally {
        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("role");
        localStorage.removeItem("userRole");

        window.location.href = `${basePath}/index.html`;
      }
    });
  }
}

function navClass(currentPath, slug) {
  const active = currentPath.includes(slug);

  return `rounded-full px-5 py-2 text-sm font-bold tracking-wide transition-all duration-300 ${active
    ? "bg-black text-white shadow-md scale-105"
    : "text-gray-600 hover:bg-black hover:text-white hover:scale-105"
    }`;
}