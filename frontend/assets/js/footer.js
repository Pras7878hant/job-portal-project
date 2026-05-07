const footerTemplate = ` 
  <footer class="mt-16 border-t border-slate-200 bg-white">
    <div class="mx-auto grid max-w-7xl gap-8 px-4 py-10 text-sm text-slate-600 sm:px-6 md:grid-cols-4 lg:px-8">
      <div>
        <img class="h-10 w-auto" src="/assets/images/myLogo.png" alt="Skratchr">
        <p class="mt-4 leading-6">Your gateway to focused job opportunities for students and recruiters.</p>
      </div>

      <div>
        <h4 class="font-semibold text-slate-950">Useful Links</h4>
        <ul class="mt-3 space-y-2">
          <li><a class="hover:text-slate-950" href="/browse.html">Browse Jobs</a></li>
          <li><a class="hover:text-slate-950" href="/login.html">Login</a></li>
          <li><a class="hover:text-slate-950" href="/signup.html">Register</a></li>
        </ul>
      </div>

      <div>
        <h4 class="font-semibold text-slate-950">Contact</h4>
        <p class="mt-3">Email: prashantrajput0912@gmail.com</p>
        <p class="mt-2">Phone: +91 767565467</p>
        <p class="mt-2">Meerut, UP</p>
      </div>

      <div>
        <h4 class="font-semibold text-slate-950">Follow Us</h4>
        <div class="mt-3 flex gap-3 text-lg">
          <a class="hover:text-slate-950" href="#"><i class="fab fa-facebook-f"></i></a>
          <a class="hover:text-slate-950" href="#"><i class="fab fa-twitter"></i></a>
          <a class="hover:text-slate-950" href="#"><i class="fab fa-linkedin-in"></i></a>
          <a class="hover:text-slate-950" href="https://www.instagram.com/i.rajput_78/"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
    <div class="border-t border-slate-200 py-4 text-center text-xs text-slate-500">
      <p>&copy; 2026 Skratchr. All rights reserved.</p>
    </div>
  </footer>
`;

export function loadFooter() {
  document.body.insertAdjacentHTML('beforeend', footerTemplate);
}
