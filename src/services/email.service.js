const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        type: 'OAuth2',
        user: process.env.EMAIL_USER,
        clientId: process.env.CLIENT_ID,
        clientSecret: process.env.CLIENT_SECRET,
        refreshToken: process.env.REFRESH_TOKEN,
    },
});

transporter.verify((error, success) => {
    if (error) {
        console.log('Error setting up email transporter:', error);
    } else {
        console.log('Email server is ready');
    }
});

const sendEmail = async (to, subject, text, html) => {
    try {
        const info = await transporter.sendMail({
            from: `"Banking System"<${process.env.EMAIL_USER}>`,
            to,
            subject,
            text,
            html
        });
        console.log('Email sent:', info.messageId);
        console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

async function sendRegistrationEmail(username, email) {
    const subject = 'Welcome to Banking System';
    const text = `Hi ${username},\n\nThank you for registering with our banking system! We're excited to have you on board.\n\nBest regards,\nBanking System Team`;
    const html = `<p>Hi ${username},</p><p>Thank you for registering with our banking system! We're excited to have you on board.</p><p>Best regards,<br>Banking System Team</p>`;
    
    await sendEmail(email, subject, text, html);
}

async function sendTransactionEmail(username, email, amount, toAccount) {
    const subject = 'Transaction Successful';
    const text = `Hi ${username},\n\nYour transaction of amount ${amount} to account ${toAccount} was successful.\n\nBest regards,\nBanking System Team`;
    const html = `<p>Hi ${username},</p><p>Your transaction of amount <strong>${amount}</strong> to account <strong>${toAccount}</strong> was successful.</p><p>Best regards,<br>Banking System Team</p>`;
    
    await sendEmail(email, subject, text, html);
}

async function sendTransactionFailureEmail(username, email, amount, toAccount, reason) {
    const subject = 'Transaction Failed';
    const text = `Hi ${username},\n\nYour transaction of amount ${amount} to account ${toAccount} failed. Reason: ${reason}\n\nBest regards,\nBanking System Team`;
    const html = `<p>Hi ${username},</p><p>Your transaction of amount <strong>${amount}</strong> to account <strong>${toAccount}</strong> failed. Reason: <strong>${reason}</strong></p><p>Best regards,<br>Banking System Team</p>`;
    
    await sendEmail(email, subject, text, html);
}


module.exports = { transporter, sendEmail, sendRegistrationEmail, sendTransactionEmail, sendTransactionFailureEmail };