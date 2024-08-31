const nodeMailer = require('nodemailer');

const sendEmail = async (options) => {
  const transporter = nodeMailer.createTransport({
    host: process.env.SMPT_HOST,
    port: process.env.SMPT_PORT,
    service: process.env.SMPT_SERVICE,
    secure: true, // true for 465, false for other ports
    auth: {
      user: process.env.SMPT_MAIL, // your email address
      pass: process.env.SMPT_APP_PASSWORD, // your App Password
    },
  });

  const mailOptions = {
    from: process.env.SMPT_MAIL,
    to: options.email,
    subject: options.subject,
    text: options.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendEmail;
