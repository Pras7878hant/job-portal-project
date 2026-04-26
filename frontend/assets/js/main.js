import { loadHeader } from './header.js';
import { loadFooter } from './footer.js';

// Initialize when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
     loadHeader();
     loadFooter();
});