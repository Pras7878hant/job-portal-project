import axios from 'axios';

export const sendOtpEmail = async (email, name, otp) => {
     try {
          const payload = {
               service_id: process.env.EMAILJS_SERVICE_ID,
               template_id: process.env.EMAILJS_TEMPLATE_ID,
               user_id: process.env.EMAILJS_PUBLIC_KEY,
               accessToken: process.env.EMAILJS_PRIVATE_KEY,
               template_params: {
                    to_email: email,
                    to_name: name,
                    otp_code: otp
               }
          };

          await axios.post('https://api.emailjs.com/api/v1.0/email/send', payload);
          return true;
     } catch (error) {
          console.error("EmailJS sending failed:", error.response?.data || error.message);
          return false;
     }
};