const mongoose = require('mongoose');
const { mailSender } = require('../utils/mailSender');

const OTPSchema = new mongoose.Schema({

    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now(),
        expires: 30 * 60
    }

})

//  function to send emails
const sendVerificationEmail = async (email, otp) => {
    try {
        const mailResponse = await mailSender(email, "Verification Email from Notion", otp);
        console.log("Email send successfully");
    } catch (error) {
        console.log("Error occured while send verification email", error);

    }
}

// post-save hook to send email after the document has been saved
OTPSchema.pre("save", async function (next) {

    if (this.isNew) {
        await sendVerificationEmail(this.email, this.otp);
    }
    next();
})

module.exports = mongoose.model('OTP', OTPSchema);