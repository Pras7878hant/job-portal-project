export function loadHeader() {
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const currentPath = window.location.pathname;
  const role = localStorage.getItem("userRole") || user?.role;

  const isAdminPage = currentPath.includes("/admin/");
  const basePath = isAdminPage ? ".." : ".";

  const headerTemplate = `
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav class="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        
        <a href="${basePath}/index.html">
          <img class="h-10 w-auto" src="${basePath}/assets/images/myLogo.png" alt="Skratchr">
        </a>

        <button class="rounded-md p-2 text-slate-700 md:hidden" onclick="toggleNav()" aria-label="Open navigation">
          <i class="fas fa-bars"></i>
        </button>

        <div class="hidden items-center gap-2 md:flex" id="navMenu">

          <a href="${basePath}/index.html" class="${navClass(currentPath, "index.html")}">
            Home
          </a>

          ${user && role === "recruiter"
      ? `
                <a href="${basePath}/admin/companies.html" class="${navClass(currentPath, "companies.html")}">
                  Companies
                </a>

                <a href="${basePath}/admin/post-job.html" class="${navClass(currentPath, "post-job.html")}">
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

                ${user
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

        <div class="flex items-center gap-3">
          ${user
      ? `
                <div class="relative">

                  <button id="user-menu" class="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border border-slate-200 bg-slate-100">
                    <img 
                      src="${user.profilePhoto || `${basePath}/assets/images/default-avatar.jpg`}" 
                      alt="User" 
                      class="h-full w-full object-cover"
                    >
                  </button>

                  <div id="user-dropdown" class="hidden absolute right-0 mt-2 w-44 overflow-hidden rounded-md border border-slate-200 bg-white shadow-lg">

                    <a href="${basePath}/profile.html" class="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      Profile
                    </a>

                    <button id="logout-btn" class="block w-full px-4 py-2 text-left text-sm text-slate-700 hover:bg-slate-50">
                      Logout
                    </button>

                  </div>
                </div>
              `
      : `
                <a 
                  class="rounded-md px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100"
                  href="${basePath}/login.html"
                >
                  Log in
                </a>

                <a 
                  class="rounded-md bg-slate-950 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
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
      "top-16",
      "flex",
      "w-full",
      "flex-col",
      "border-b",
      "bg-white",
      "p-4"
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

  return `rounded-md px-3 py-2 text-sm font-medium ${active
      ? "bg-slate-950 text-white"
      : "text-slate-700 hover:bg-slate-100"
    }`;
}