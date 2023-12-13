const User = require("../models/User");
const mailSender = require("../utils/mailSender");

exports.resetPasswordToken = async (req, res) => {

    try {
        const { email } = req.body;
        const user = await User.findOne({
            email: email
        });
        if (!user) {
            res.status(401).json({ success: false, message: "User not registered with entered email" });
        }
        const token = crypto.randomUUID();
        const updatedDetails = await User.findOneAndUpdate(
            { email }, { token: token, resetPasswordExpires: Date.now() + 5 * 60 * 1000 }, { new: true });
        const url = `http://localhost:3000/update-password/${token}`;

        await mailSender(email, "Password reset link", `Password reset link: ${url}`);
        return res.json({
            success: true,
            messsage: "Email sent successfully, please check email and change password"
        });

    } catch (error) {
        return res.status(error.status).json({
            success: false,
            message: "Something went wrong while sending password reset link"
        })
    }
}

exports.resetPassword = async (req, res) => {
    try {

        const { password, confirmedPassword, token } = req.body;

        if (password !== confirmedPassword) {
            return res.status(401).json({ success: false, message: "Password does not match wihout confirmed password" })
        }

        const userDetails = await User.findOne({ token });
        if (!userDetails) {
            return res.status(401).json({
                success: false, message: "Token is invalid"
            })
        }
        if (userDetails.resetPasswordExpires < Date.now()) {
            return res.status(401).json({ success: false, message: "Token is expired, please regenerate your token" });
        };

        const hashedPassowrd = await bcrypt.hash(password, 10);

        await User.findOneAndUpdate({ token }, { password: hashedPassowrd }, { new: true });
        return res.status(200).json({
            success: true, message: "Password reset successfully"
        })
    } catch (error) {
        return res.status(error.status).json({
            success: false,
            message: "Something went wrong while sending password reset link"
        })
    }




}