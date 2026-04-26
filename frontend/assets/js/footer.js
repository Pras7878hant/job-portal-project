const footerTemplate = ` 
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-about">
        <img class="footerLogo" src="/assets/images/myLogo.png" alt="Skratchr">
        <p>Your gateway to the best job opportunities. We connect employers and job seekers with ease and trust.</p>
      </div>

      <div class="footer-links">
        <h4>Useful Links</h4>
        <ul>
          <li><a href="/about.html">About Us</a></li>
          <li><a href="/browse.html">Browse Jobs</a></li>
          <li><a href="/login.html">Login</a></li>
          <li><a href="/signup.html">Register</a></li>
        </ul>
      </div>

      <div class="footer-contact">
        <h4>Contact</h4>
        <p>Email: prashantrajput0912@gmail.com</p>
        <p>Phone: +91 767565467</p>
        <p>Address: Ganga vihar, Meerut(UP)</p>
      </div>

      <div class="footer-social">
        <h4>Follow Us</h4>
        <div class="social-icons">
          <a href="#"><i class="fab fa-facebook-f"></i></a>
          <a href="#"><i class="fab fa-twitter"></i></a>
          <a href="#"><i class="fab fa-linkedin-in"></i></a>
          <a href="https://www.instagram.com/i.rajput_78/"><i class="fab fa-instagram"></i></a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2025 Skratchr. All rights reserved.</p>
    </div>
  </footer>
`;

export function loadFooter() {
  document.body.insertAdjacentHTML('beforeend', footerTemplate);
}
