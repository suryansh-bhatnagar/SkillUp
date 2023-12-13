const mongoose = require('mongoose');
const { default: mailSender } = require('../utils/mailSender');

const OTPSchema = new mongoose.Schema({

    email: {
        type: String,
        rewuired: true,
    },
    otp: {
        type: String,
        rewuired: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 5 * 60
    }

})


const sendVerificationEmail = async (email, otp) => {
    try {
        const mailResponse = await mailSender(email, "Verification Email from   Notion", otp);
        console.log("Email send successfully", mailResponse);
    } catch (error) {
        console.log("Error occured while send verification email", error);

    }
}

OTPSchema.pre("save", async function (next) {
    await sendVerificationEmail(this.email, this.otp);
    next();
})

module.exports = mongoose.model('OTP', OTPSchema);