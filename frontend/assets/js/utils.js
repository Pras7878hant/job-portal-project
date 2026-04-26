export const BASE_API_URL = 'http://localhost:8000/api/v1';

export const AUTH_API_END_POINT = `${BASE_API_URL}/user`;
export const COMPANY_API_END_POINT = `${BASE_API_URL}/company`;
export const JOB_API_END_POINT = `${BASE_API_URL}/job`;
export const USER_API_END_POINT = `${BASE_API_URL}/user`;
export const APPLICATION_API_END_POINT = `${BASE_API_URL}/application`;

export function displayMessage(message, type) {
     const messageDiv = document.getElementById('message');
     if (messageDiv) {
          messageDiv.textContent = message;
          messageDiv.className = `message ${type}`;
          messageDiv.style.display = 'block';
     } else {
          alert(`${type.toUpperCase()}: ${message}`);
     }
}

export async function handleLogout() {
     try {
          await axios.get(`${AUTH_API_END_POINT}/logout`);
     } catch (error) {
          console.error('Error during backend logout:', error.response?.data?.message || error.message);
     } finally {
          localStorage.removeItem('token');
          localStorage.removeItem('role');
          localStorage.removeItem('userRole');
          window.location.href = '../login.html';
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
          headers: {
               Authorization: `Bearer ${token}`,
               ...options.headers,
          },
          ...options,
     });
}
