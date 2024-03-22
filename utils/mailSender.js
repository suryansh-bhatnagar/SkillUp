const nodeMailer = require('nodemailer');
const dotenv = require("dotenv");

exports.mailSender = async (email, title, body) => {
    try {
        let transporter = nodeMailer.createTransport({
            host: process.env.MAIL_HOST,
            port: 587,
            secure: false,
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS
            }
        })

        let info = await transporter.sendMail({
            from: { name: "SkillUp - By Suryansh", address: process.env.MAIL_USER },
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