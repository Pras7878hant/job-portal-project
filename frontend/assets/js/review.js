import { USER_API_END_POINT } from './utils.js';

let applicants = [];
let currentIndex = 0;
let isZenActive = false;

const zenOverlay = document.getElementById('zen-mode-overlay');
const zenContent = document.getElementById('zen-content');
const triggerZenBtn = document.getElementById('trigger-zen-btn');

document.addEventListener('DOMContentLoaded', fetchApplicants);

async function fetchApplicants() {
     try {
          const jobId = new URLSearchParams(window.location.search).get('jobId');
          const response = await axios.get(`http://localhost:8000/api/v1/application/${jobId}/applicants`, { withCredentials: true });
          applicants = response.data.application || [];
     } catch (error) {
          console.error("Failed to load applicants");
     }
}

triggerZenBtn?.addEventListener('click', () => {
     if (applicants.length === 0) return alert("No applicants to review.");
     currentIndex = 0;
     isZenActive = true;
     zenOverlay.classList.remove('hidden');
     document.body.style.overflow = 'hidden';
     renderZenApplicant();
});

function renderZenApplicant() {
     if (currentIndex >= applicants.length) {
          exitZenMode();
          return alert("You have reviewed all applicants!");
     }

     const applicant = applicants[currentIndex].applicant;

     document.getElementById('zen-counter').textContent = `Applicant ${currentIndex + 1} of ${applicants.length}`;
     document.getElementById('zen-name').textContent = applicant.fullName;
     document.getElementById('zen-skills').textContent = applicant.skills?.join(' • ') || 'No skills listed';

     const resumeBtn = document.getElementById('zen-resume');
     if (applicant.resume) {
          resumeBtn.href = applicant.resume;
          resumeBtn.classList.remove('hidden');
     } else {
          resumeBtn.classList.add('hidden');
     }

     const videoPlayer = document.getElementById('zen-video');
     if (applicant.videoPitch) {
          videoPlayer.src = applicant.videoPitch;
          videoPlayer.classList.remove('hidden');
     } else {
          videoPlayer.src = '';
          videoPlayer.classList.add('hidden');
     }

     zenContent.classList.remove('opacity-0');
}

async function updateStatus(status) {
     zenContent.classList.add('opacity-0');

     try {
          const applicationId = applicants[currentIndex]._id;
          await axios.post(`http://localhost:8000/api/v1/application/status/${applicationId}/update`, { status }, { withCredentials: true });
     } catch (error) {
          console.error("Failed to update status");
     }

     setTimeout(() => {
          currentIndex++;
          renderZenApplicant();
     }, 300);
}

function exitZenMode() {
     isZenActive = false;
     zenOverlay.classList.add('hidden');
     document.body.style.overflow = 'auto';
     const videoPlayer = document.getElementById('zen-video');
     videoPlayer.pause();
     videoPlayer.src = '';
}

document.addEventListener('keydown', (e) => {
     if (!isZenActive) return;

     if (e.key === 'ArrowRight') {
          updateStatus('Interview');
     } else if (e.key === 'ArrowLeft') {
          updateStatus('Rejected');
     } else if (e.key === 'Escape') {
          exitZenMode();
     }
});