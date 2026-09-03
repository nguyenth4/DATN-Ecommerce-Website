require('dotenv').config();
const sgMail = require('@sendgrid/mail');

console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "Loaded" : "Missing");
console.log("SENDGRID_FROM_EMAIL:", process.env.SENDGRID_FROM_EMAIL);

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const msg = {
  to: 'sprylo123@gmail.com', // admin email
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Test email from SendGrid integration',
  text: 'If you receive this, SendGrid is working!',
  html: '<strong>If you receive this, SendGrid is working!</strong>',
};

sgMail
  .send(msg)
  .then(() => {
    console.log('Email sent successfully!');
  })
  .catch((error) => {
    console.error('Error sending email:');
    console.error(error.response ? error.response.body : error);
  });
