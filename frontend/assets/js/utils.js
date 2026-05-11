const configuredApiUrl = window.__API_BASE_URL__;
export const BASE_API_URL = configuredApiUrl || 'https://skratchr-job-portal.onrender.com/api/v1';

export const AUTH_API_END_POINT = `${BASE_API_URL}/user`;
export const COMPANY_API_END_POINT = `${BASE_API_URL}/company`;
export const JOB_API_END_POINT = `${BASE_API_URL}/job`;
export const USER_API_END_POINT = `${BASE_API_URL}/user`;
export const APPLICATION_API_END_POINT = `${BASE_API_URL}/application`;

export function displayMessage(targetOrMessage, messageOrType = 'info', maybeType = 'info') {
     const messageDiv = targetOrMessage instanceof HTMLElement
          ? targetOrMessage
          : document.getElementById('message');
     const message = targetOrMessage instanceof HTMLElement ? messageOrType : targetOrMessage;
     const type = targetOrMessage instanceof HTMLElement ? maybeType : messageOrType;

     if (messageDiv) {
          messageDiv.textContent = message;
          messageDiv.className = `message ${type} rounded-md border px-4 py-3 text-sm ${getMessageClass(type)}`;
          messageDiv.style.display = message ? 'block' : 'none';
     } else {
          alert(`${type.toUpperCase()}: ${message}`);
     }
}

function getMessageClass(type) {
     if (type === 'success') return 'border-emerald-200 bg-emerald-50 text-emerald-800';
     if (type === 'error') return 'border-red-200 bg-red-50 text-red-800';
     return 'border-sky-200 bg-sky-50 text-sky-800';
}

export async function handleLogout() {
     try {
          await axios.get(`${AUTH_API_END_POINT}/logout`);
     } catch (error) {
          console.error('Error during backend logout:', error.response?.data?.message || error.message);
     } finally {
          localStorage.removeItem('user');
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userRole');
          window.location.href = '/login.html';
     }
}

export function isAuthenticatedFrontend() {
     const token = localStorage.getItem('token');
     return !!token;
}

export async function authFetch(url, options = {}) {
     const token = localStorage.getItem('token');
     if (!token) throw new Error('No token found');

     return axios({
          url,
          withCredentials: true,
          headers: {
               Authorization: `Bearer ${token}`,
               ...options.headers,
          },
          ...options,
     });
}