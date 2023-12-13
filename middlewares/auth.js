const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/User");

exports.isAuth = async (req, res, next) => {
    try {
        const token = res.cookies.token || res.body.token || res.header("Authorization").replace("Bearer", "");
        if (!token) {
            res.status(401).json({
                success: false,
                message: "Token is missing"
            });
        }

        try {

            const decode = await jwt.verify(token, process.env.JWT_SECRET);
            console.log(decode);
            req.user = decode

        } catch (error) {
            res.status(401).json({
                success: false,
                message: "Token is invalid"
            });
        }

        next()

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "Unauthorized"
        });
    }
}

exports.isStudent = async (req, res, next) => {

    try {
        if (req.user.accountType === "Student") {
            next();
        } else {
            res.status(401).json({
                success: false,
                message: "Please login as student"
            });
        }

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }

}
exports.isInstructor = async (req, res, next) => {

    try {
        if (req.user.accountType === "Instructor") {
            next();
        } else {
            res.status(401).json({
                success: false,
                message: "Please login as Instructor"
            });
        }

    } catch (error) {
        res.status(401).json({
            success: false,
            message: "User role cannot be verified, please try again"
        });
    }

}