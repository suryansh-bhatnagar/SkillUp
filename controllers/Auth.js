const otpGenerator = require("otp-generator");
const bcrypt = require("bcrypt");
const OTP = require("../models/OTP");
const User = require("../models/User");
const Profile = require("../models/Profile");
const jwt = require("jsonwebtoken");

require("dotenv").config();



exports.sendotp = async (req, res) => {
    try {

        const { email } = req.body;

        const isUserExist = await User.findOne({ email });
        console.log('Is user exist ', isUserExist)

        if (isUserExist) {
            return res.status(401).json({
                success: false,
                message: "User already exists",
            })
        }

        const maxAttempts = 20;
        let attempt = 0;
        let otp;

        do {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            });
            console.log("Generated OTP ", otp);

            const isOtpExist = OTP.findOne({ otp: otp });

            if (!isOtpExist) {
                break;
            }

            attempt++;
        } while (attempt < maxAttempts);


        const otpPayload = { email, otp };

        const otpBody = await OTP.create(otpPayload);
        console.log("OTP Body ", otpBody);

        res.status(200).json({
            success: true,
            message: "OTP sent successfully"
        })

    } catch (error) {
        res.status(500).json({
            success: false,
            message: "Error occured while sending OTP"
        })
    }



}

exports.signup = async (req, res) => {


    try {

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            otp,
        } = req.body


        if (!firstName || !lastName || !email || !password || !confirmPassword || !otp) {
            return res.status(403).json({
                success: false,
                message: "Please enter all the required information"
            })
        }

        if (password !== confirmPassword) {
            return res.status(400).json({
                success: false,
                message: "Password do not match with confirm password"
            })

        }

        const isUserExist = await User.findOne({ email });
        if (isUserExist) {
            return res.status(401).json({
                success: false,
                message: "User already exists",
            })
        }
        console.log('User not exist')

        const recentOTP = await OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recent otp: ", recentOTP[0].otp);

        if (recentOTP.length === 0) {
            return res.status(400).json({
                success: false, message: "OTP not found",
            })
        } else if (recentOTP[0].otp !== otp) {
            return res.status(400).json({
                success: false, message: "Invalid OTP",
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            dateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        let approved = "";
        approved === "Instructor" ? (approved = false) : (approved = true);

        // Create the user
        const userData = await User.create({
            firstName,
            lastName,
            email,
            password: hashedPassword,
            accountType: accountType,
            approved: approved,
            additionalDetails: profileDetails._id,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,
        });


        return res.status(200).json({
            success: true, message: "User registered successfully"
        })

    } catch (error) {
        return res.status(500).json({
            success: false, message: "User cannot be registered .Please try again"
        })
    }

}


exports.login = async (req, res) => {

    try {



        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(403).json({
                success: false,
                messsage: "All fields required"
            })
        }

        const user = await User.findOne({ email: email });

        if (!user) {
            res.status(401).json({ success: false, message: "User not registered, please signup first" });
        }

        if (await bcrypt.compare(password, user.password)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '2h'
            })

            user.token = token;
            user.password = undefined;

            const options = {
                expires: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
                httpOnly: true
            }

            res.cookie("token", token, options).status(200).json({
                success: true,
                token,
                user,
                message: "Logged in successfully"
            })

        } else {
            return res.status(401).json({
                message: "Incorrect credentials",
                success: false
            })
        }
    } catch (error) {
        return res.status(500).json({
            message: "Login failed, please try again",
            success: false
        })
    }

}

// Controller for Changing Password
exports.changePassword = async (req, res) => {
    try {
        // Get user data from req.user
        const userDetails = await User.findById(req.user.id);

        // Get old password, new password, and confirm new password from req.body
        const { oldPassword, newPassword, confirmNewPassword } = req.body;

        // Validate old password
        const isPasswordMatch = await bcrypt.compare(
            oldPassword,
            userDetails.password
        );
        if (!isPasswordMatch) {
            // If old password does not match, return a 401 (Unauthorized) error
            return res
                .status(401)
                .json({ success: false, message: "The password is incorrect" });
        }

        // Match new password and confirm new password
        if (newPassword !== confirmNewPassword) {
            // If new password and confirm new password do not match, return a 400 (Bad Request) error
            return res.status(400).json({
                success: false,
                message: "The password and confirm password does not match",
            });
        }

        // Update password
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUserDetails = await User.findByIdAndUpdate(
            req.user.id,
            { password: encryptedPassword },
            { new: true }
        );

        // Send notification email
        try {
            const emailResponse = await mailSender(
                updatedUserDetails.email,
                passwordUpdated(
                    updatedUserDetails.email,
                    `Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
                )
            );
            console.log("Email sent successfully:", emailResponse.response);
        } catch (error) {
            // If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
            console.error("Error occurred while sending email:", error);
            return res.status(500).json({
                success: false,
                message: "Error occurred while sending email",
                error: error.message,
            });
        }

        // Return success response
        return res
            .status(200)
            .json({ success: true, message: "Password updated successfully" });
    } catch (error) {
        // If there's an error updating the password, log the error and return a 500 (Internal Server Error) error
        console.error("Error occurred while updating password:", error);
        return res.status(500).json({
            success: false,
            message: "Error occurred while updating password",
            error: error.message,
        });
    }
};