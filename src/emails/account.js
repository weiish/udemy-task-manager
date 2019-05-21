const sgMail = require('@sendgrid/mail')

const sendgridAPIKey = process.env.SENDGRID_APIKEY

sgMail.setApiKey(sendgridAPIKey)

const sendWelcomeEmail = (email, name) => {
    try{
        sgMail.send({
            to: email,
            from: 'shixwei@gmail.com',
            subject: `Welcome, ${name}`,
            text: `Hi ${name}, thank you for signing up. Welcome to the service`
        })
    } catch (e) {
        console.log('Error: ', e.message)
    }
    
}

const sendGoodbyeEmail = (email, name) => {
    try {
        sgMail.send({
            to: email,
            from: 'shixwei@gmail.com',
            subject: `Sorry to see you go, ${name}`,
            text: `Dear ${name}, thank you for using our service. If you have a few moments, please tell us why you're leaving by replying to this email.`
        })
    } catch(e) {
        console.log('Error: ', e.message)
    }
}

module.exports = {
    sendWelcomeEmail,
    sendGoodbyeEmail
}