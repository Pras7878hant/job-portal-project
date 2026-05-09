import { JOB_API_END_POINT, APPLICATION_API_END_POINT } from './utils.js';

axios.defaults.withCredentials = true;

const token = localStorage.getItem('token');

const authHeaders = token
     ? { Authorization: `Bearer ${token}` }
     : {};

let applicants = [];
let currentIndex = 0;
let isZenActive = false;

const zenOverlay = document.getElementById('zen-mode-overlay');
const zenContent = document.getElementById('zen-content');
const triggerZenBtn = document.getElementById('trigger-zen-btn');
const standardApplicantList = document.getElementById('standard-applicant-list');

const lockScroll = () => {
     document.documentElement.classList.add('overflow-hidden');
     document.body.classList.add('overflow-hidden');
};

const unlockScroll = () => {
     document.documentElement.classList.remove('overflow-hidden');
     document.body.classList.remove('overflow-hidden');
};

window.openVideoModal = (url) => {

     const modal = document.getElementById('video-modal');
     const player = document.getElementById('modal-video-player');

     player.src = url;

     modal.classList.remove('hidden');
     modal.classList.add('flex');

     lockScroll();

     setTimeout(() => {
          player.play().catch(() => { });
     }, 100);
};

window.closeVideoModal = () => {

     const modal = document.getElementById('video-modal');
     const player = document.getElementById('modal-video-player');

     player.pause();

     player.currentTime = 0;

     player.src = '';

     modal.classList.add('hidden');
     modal.classList.remove('flex');

     if (!isZenActive) {
          unlockScroll();
     }
};

document.addEventListener('DOMContentLoaded', fetchApplicants);

async function fetchApplicants() {

     try {

          const jobId = new URLSearchParams(window.location.search).get('jobId');

          const response = await axios.get(
               `${JOB_API_END_POINT}/recruiter-jobs`,
               {
                    headers: authHeaders,
                    withCredentials: true
               }
          );

          const jobs = response.data.jobs || [];

          const currentJob = jobs.find(job => job._id === jobId);

          applicants = currentJob?.applications || [];

          renderApplicants();

     } catch (error) {

          standardApplicantList.innerHTML = `
               <div class="col-span-full rounded-[2rem] border border-red-200 bg-red-50 p-10 text-center">
                    <div class="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-500">
                         <i class="fas fa-triangle-exclamation text-2xl"></i>
                    </div>

                    <h2 class="text-2xl font-black text-black">
                         Failed to load applicants
                    </h2>

                    <p class="mt-3 text-sm font-medium text-gray-500">
                         Please refresh the page and try again.
                    </p>
               </div>
          `;
     }
}

function renderApplicants() {

     if (!applicants.length) {

          standardApplicantList.innerHTML = `
               <div class="col-span-full flex min-h-[350px] flex-col items-center justify-center rounded-[2rem] border border-dashed border-gray-300 bg-white/70 p-10 text-center backdrop-blur-sm">

                    <div class="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                         <i class="fas fa-users-slash text-3xl text-gray-400"></i>
                    </div>

                    <h2 class="text-2xl font-black text-black">
                         No applicants yet
                    </h2>

                    <p class="mt-3 text-sm font-medium text-gray-500">
                         Applications will appear here once students apply.
                    </p>

               </div>
          `;

          return;
     }

     standardApplicantList.innerHTML = applicants.map((app) => {

          const user = app.applicant || {};

          const status = app.status
               ? app.status.toLowerCase()
               : 'pending';

          return `
               <div class="group overflow-hidden rounded-[2rem] border border-gray-200 bg-white p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">

                    <div class="flex items-start justify-between gap-4">

                         <div class="flex items-center gap-4">

                              <img
                                   src="${user.profilePhoto || './assets/images/default-avatar.jpg'}"
                                   alt="Applicant"
                                   class="h-16 w-16 rounded-2xl border border-gray-200 object-cover">

                              <div>

                                   <h3 class="text-lg font-black text-black">
                                        ${user.fullName || 'Unknown User'}
                                   </h3>

                                   <p class="mt-1 break-all text-sm font-medium text-gray-500">
                                        ${user.email || 'No email'}
                                   </p>

                                   <p class="mt-1 text-xs font-semibold uppercase tracking-wide text-gray-400">
                                        ${user.phone || 'No phone'}
                                   </p>

                              </div>

                         </div>

                         <span class="rounded-full border border-gray-200 bg-gray-50 px-4 py-2 text-xs font-bold uppercase tracking-wide text-gray-600">
                              ${status}
                         </span>

                    </div>

                    <div class="mt-6 flex flex-wrap gap-3">

                         ${user.resume
                    ? `
                              <a
                                   href="${user.resume}"
                                   target="_blank"
                                   class="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-100 px-5 py-2.5 text-sm font-bold text-black transition-all duration-300 hover:bg-gray-200">

                                   <i class="fas fa-file-pdf mr-2"></i>
                                   Resume
                              </a>
                         `
                    : ''}

                         ${user.videoPitch
                    ? `
                              <button
                                   onclick="openVideoModal('${user.videoPitch}')"
                                   class="inline-flex items-center justify-center rounded-full border border-black bg-black px-5 py-2.5 text-sm font-bold text-white transition-all duration-300 hover:bg-gray-900">

                                   <i class="fas fa-play mr-2"></i>
                                   Video Pitch
                              </button>
                         `
                    : `
                              <span class="inline-flex items-center justify-center rounded-full border border-gray-200 bg-gray-50 px-5 py-2.5 text-sm font-medium text-gray-400">

                                   <i class="fas fa-video-slash mr-2"></i>
                                   No Video
                              </span>
                         `}

                    </div>

                    <div class="mt-6">

                         <select
                              onchange="window.updateStandardStatus('${app._id}', this.value)"
                              class="w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold text-black outline-none transition-all duration-300 focus:border-black focus:bg-white">

                              <option value="Pending" ${status === 'pending' ? 'selected' : ''}>
                                   Pending
                              </option>

                              <option value="Reviewed" ${status === 'reviewed' ? 'selected' : ''}>
                                   Reviewed
                              </option>

                              <option value="Interview" ${status === 'interview' ? 'selected' : ''}>
                                   Interview
                              </option>

                              <option value="Accepted" ${status === 'accepted' || status === 'selected' ? 'selected' : ''}>
                                   Accepted
                              </option>

                              <option value="Rejected" ${status === 'rejected' ? 'selected' : ''}>
                                   Rejected
                              </option>

                         </select>

                    </div>

               </div>
          `;

     }).join('');
}

window.updateStandardStatus = async (applicationId, status) => {

     try {

          await axios.put(
               `${APPLICATION_API_END_POINT}/status/${applicationId}`,
               { status },
               {
                    headers: authHeaders,
                    withCredentials: true
               }
          );

     } catch (error) {

          alert('Failed to update status');

     }
};

triggerZenBtn?.addEventListener('click', () => {

     if (!applicants.length) {
          alert('No applicants to review');
          return;
     }

     currentIndex = 0;

     isZenActive = true;

     zenOverlay.classList.remove('hidden');
     zenOverlay.classList.add('flex');

     lockScroll();

     renderZenApplicant();
});

function renderZenApplicant() {

     if (currentIndex >= applicants.length) {

          exitZenMode();

          alert('All applicants reviewed');

          return;
     }

     const applicantData = applicants[currentIndex];

     const applicant = applicantData.applicant || {};

     document.getElementById('zen-counter').textContent =
          `Applicant ${currentIndex + 1} of ${applicants.length}`;

     document.getElementById('zen-name').textContent =
          applicant.fullName || 'Unknown User';

     document.getElementById('zen-skills').textContent =
          applicant.skills?.join(' • ') || 'No skills listed';

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

          videoPlayer.pause();

          videoPlayer.currentTime = 0;

          videoPlayer.src = '';

          videoPlayer.classList.add('hidden');

     }

     zenContent.classList.remove('opacity-0');
}

async function updateStatus(status) {

     zenContent.classList.add('opacity-0');

     try {

          const applicationId = applicants[currentIndex]._id;

          await axios.put(
               `${APPLICATION_API_END_POINT}/status/${applicationId}`,
               { status },
               {
                    headers: authHeaders,
                    withCredentials: true
               }
          );

          applicants[currentIndex].status = status;

          renderApplicants();

     } catch (error) {

          console.log(error);

     }

     setTimeout(() => {

          currentIndex++;

          renderZenApplicant();

     }, 300);
}

function exitZenMode() {

     isZenActive = false;

     zenOverlay.classList.add('hidden');
     zenOverlay.classList.remove('flex');

     unlockScroll();

     const videoPlayer = document.getElementById('zen-video');

     videoPlayer.pause();

     videoPlayer.currentTime = 0;

     videoPlayer.src = '';
}

document.addEventListener('keydown', (e) => {

     if (!isZenActive) return;

     if (e.key === 'ArrowRight') {

          updateStatus('Interview');

     }

     if (e.key === 'ArrowLeft') {

          updateStatus('Rejected');

     }

     if (e.key === 'Escape') {

          exitZenMode();

     }
});

window.addEventListener('beforeunload', () => {
     unlockScroll();
});