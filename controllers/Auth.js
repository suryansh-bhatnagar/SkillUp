const User = require("../models/User");
const OTP = require("../models/OTP");
const otpGenerator = require("otp-generator");
const jwt = require("jsonwebtoken");

require("dotenv").config();

const bcrypt = require("bcrypt");


exports.sendOtp = async (req, res) => {
    try {

        const { email } = req.body;

        const isUserExist = User.findOne({ email });

        if (isUserExist) {
            res.status(401).json({
                success: false,
                message: "User already exists",
            })
        }

        let otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            lowerCaseAlphabets: false,
            specialChars: false
        })
        console.log("Generated OTP");

        let isOtpExist = OTP.findOne({ otp: otp });

        while (isOtpExist) {
            otp = otpGenerator.generate(6, {
                upperCaseAlphabets: false,
                lowerCaseAlphabets: false,
                specialChars: false
            })

            isOtpExist = OTP.findOne({ otp: otp });
        }

        const otpPayload = { email, otp };

        const otpBody = OTP.create(otpPayload);
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

exports.signUp = async (req, res) => {


    try {

        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accoundType,
            otp,
        } = res.body

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

        const isUserExist = User.findOne({ email });
        if (isUserExist) {
            res.status(401).json({
                success: false,
                message: "User already exists",
            })
        }

        const recentOTP = OTP.find({ email }).sort({ createdAt: -1 }).limit(1);
        console.log("recent otp: " + recentOTP);

        if (recentOTP.length === 0) {
            return res.status(400).json({
                success: false, message: "OTP not found",
            })
        } else if (recentOTP.otp !== otp) {
            return res.status(400).json({
                success: false, message: "Invalid OTP",
            })
        }

        const hashedPassowrd = bcrypt.hash(password, 10);

        const profileDetails = await Profile.create({
            gender: null,
            doateOfBirth: null,
            about: null,
            contactNumber: null,
        })

        const user = await User.create({
            firstName,
            lastName,
            accountType,
            additionalDetails: profileDetails._id,
            email,
            passowrd: hashedPassowrd,
            image: `https://api.dicebear.com/5.x/initials/svg?seed=${firstName} ${lastName}`,


        })

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

        if (await bcrypt.compare(password, user.passowrd)) {

            const payload = {
                email: user.email,
                id: user._id,
                accountType: user.accountType
            }

            const token = jwt.sign(payload, process.env.JWT_SECRET, {
                expiresIn: '2h'
            })

            user.token = token;
            user.passowrd = undefined;

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