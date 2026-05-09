export function loadFooter() {
  const currentPath = window.location.pathname;

  const isAdminPage = currentPath.includes("/admin/");
  const basePath = isAdminPage ? ".." : ".";

  const footerTemplate = `
    <footer class="mt-20 border-t-4 border-black bg-black text-white bg-[radial-gradient(rgba(255,255,255,0.15)_1px,transparent_1px)] [background-size:24px_24px]">
      
      <div class="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-12 lg:px-8">
        
        <div class="md:col-span-5 lg:col-span-4">
          <div class="flex items-center gap-2 mb-6">
            <img 
              class="h-10 w-auto object-contain brightness-0 invert drop-shadow-lg" 
              src="${basePath}/assets/images/myLogo.png" 
              alt="Skratchr"
            >
            <span class="text-2xl font-black tracking-tighter uppercase drop-shadow-md">Skratchr</span>
          </div>

          <p class="leading-relaxed text-gray-300 font-medium">
            Your premium gateway to highly focused, aesthetic job opportunities for top-tier students and elite recruiters.
          </p>
        </div>

        <div class="md:col-span-3 lg:col-span-2 lg:col-start-6">
          <h4 class="mb-6 text-sm font-black uppercase tracking-widest text-white drop-shadow-md">
            Platform
          </h4>
          <ul class="space-y-4 text-sm font-semibold text-gray-400">
            <li>
              <a class="transition-colors hover:text-white hover:underline underline-offset-4" href="${basePath}/browse.html">
                Browse Jobs
              </a>
            </li>
            <li>
              <a class="transition-colors hover:text-white hover:underline underline-offset-4" href="${basePath}/login.html">
                Log In
              </a>
            </li>
            <li>
              <a class="transition-colors hover:text-white hover:underline underline-offset-4" href="${basePath}/signup.html">
                Register
              </a>
            </li>
          </ul>
        </div>

        <div class="md:col-span-4 lg:col-span-3">
          <h4 class="mb-6 text-sm font-black uppercase tracking-widest text-white drop-shadow-md">
            Contact
          </h4>
          <ul class="space-y-4 text-sm font-medium text-gray-400">
            <li class="flex items-center gap-3">
              <i class="fas fa-envelope text-white"></i>
              <a href="mailto:prashantrajput0912@gmail.com" class="hover:text-white transition-colors">prashantrajput0912@gmail.com</a>
            </li>
            <li class="flex items-center gap-3">
              <i class="fas fa-phone-alt text-white"></i>
              <span>+91 767565467</span>
            </li>
            <li class="flex items-center gap-3">
              <i class="fas fa-map-marker-alt text-white"></i>
              <span>Meerut, UP</span>
            </li>
          </ul>
        </div>

        <div class="md:col-span-12 lg:col-span-2">
          <h4 class="mb-6 text-sm font-black uppercase tracking-widest text-white drop-shadow-md">
            Connect
          </h4>
          <div class="flex gap-4">
            <a class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]" href="#">
              <i class="fab fa-facebook-f"></i>
            </a>
            <a class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]" href="#">
              <i class="fab fa-twitter"></i>
            </a>
            <a class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]" href="#">
              <i class="fab fa-linkedin-in"></i>
            </a>
            <a class="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-all duration-300 hover:-translate-y-1 hover:bg-white hover:text-black hover:shadow-[0_0_15px_rgba(255,255,255,0.5)]" href="https://www.instagram.com/i.rajput_78/" target="_blank">
              <i class="fab fa-instagram text-lg"></i>
            </a>
          </div>
        </div>

      </div>

      <div class="border-t border-white/10 bg-black/60 backdrop-blur-md py-6">
        <div class="mx-auto flex max-w-7xl flex-col items-center justify-between px-4 sm:px-6 md:flex-row lg:px-8">
          <p class="text-xs font-semibold tracking-wide text-gray-400">
            &copy; 2026 Skratchr. All rights reserved.
          </p>
          <div class="mt-4 flex gap-6 text-xs font-bold uppercase tracking-widest text-gray-500 md:mt-0">
            <a href="#" class="hover:text-white transition-colors">Privacy</a>
            <a href="#" class="hover:text-white transition-colors">Terms</a>
          </div>
        </div>
      </div>

    </footer>
  `;

  document.body.insertAdjacentHTML("beforeend", footerTemplate);
}