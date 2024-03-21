const nodeMailer = require('nodemailer');

exports.mailSender = async (email, title, body) => {
    try {
        let transporter = nodeMailer.createTransport({
            host: smtp.ethereal.email,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        let info = await transporter.sendMail({
            from: 'SkillUp - By Suryansh',
            to: `${email}`,
            subject: `${title}`,
            html: `${body}`
        })
        console.log(info);
        return info;
    } catch (error) {
        console.log(error.message)
    }
}