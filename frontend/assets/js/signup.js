document.getElementById('signup-form').addEventListener('submit', async (e) => {
     e.preventDefault();
     const form = e.target;
     const formData = new FormData();
     formData.append('fullName', form.fullName.value);
     formData.append('email', form.email.value);
     formData.append('phoneNumber', form.phoneNumber.value);
     formData.append('password', form.password.value);
     formData.append('role', form.role.value);

     try {
          const response = await axios.post(`${USER_API_END_POINT}/register`, formData, {
               withCredentials: true
          });
          if (response.data.success) {
               alert('Sign up successful! Please log in.');
               window.location.href = 'login.html';
          } else {
               alert(response.data.message);
          }
     } catch (error) {
          console.error('Sign up error:', error); // Line 21: This is where the error is logged
          alert('Sign up failed. Please try again.');
     }
}); console.log('Sign up form submitted.');
console.log('Form data:', formData);
console.log('Response:', response);
console.log('Error:', error);