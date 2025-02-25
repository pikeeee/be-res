import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: "sandbox.smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: "0e07b88bfc7ce5",
    pass: "026c20ce6b8137"
  }
});

export const sendVerificationCode = async (email, code) => {
  const mailOptions = {
    from: '"Your App" <no-reply@yourapp.com>',
    to: email,
    subject: 'Your Verification Code',
    text: `Your verification code is ${code}. Please use this code to verify your account.`
  };

  console.log(`[DEV LOG] Sending verification code to ${email}: ${code}`);
  
  try {
    await transporter.sendMail(mailOptions);
    console.log('Verification email sent');
  } catch (error) {
    console.error('Error sending email', error);
  }
};
