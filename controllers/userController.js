import axios from "axios";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
import nodemailer from "nodemailer";
import Otp from "../models/Otp.js";
import { text } from "express";
import { isAdmin } from "./productController.js";

dotenv.config();

const transporter = nodemailer.createTransport(
    {
        service: "gmail",
        host: "smtp.gmail.com",
        port: 587,
        secure: false,
        auth: {
            user: "matheesha27@gmail.com",
            pass: process.env.GMAIL_APP_PASSWORD
        }
    }
)

export function createUser(req, res) {

    const data = req.body

    // hashing - 10 times hashing (salting rounds)
    const hashedPassword = bcrypt.hashSync(data.password, 10)
    
    const user = new User(
        {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            password: hashedPassword
        }
    )
    user.save().then(()=>{
        res.status(201).json({
            message: "User saved successfully"
        })
    })
}

export function loginUser(req, res) {

    const email = req.body.email
    const password = req.body.password
    console.log("Request to login: " + email + ", " + password)

    User.find({email: email}).then(
        (users) => {
            if(users[0] == null) {
                res.status(404).json({
                    message: "User Not Found"
                })
            } else {
                const user = users[0]

                // if (user.invalidTries >= 3) {
                //     res.json(
                //         {
                //             message: "Your account is blocked due to multiple failed login attempts."
                //         }
                //     )
                //     return;
                // }
                // bcrypt.compareSync(plainTextPassword, hashedPassword)
                const isPasswordCorrect = bcrypt.compareSync(password, user.password)

                if(isPasswordCorrect) {
                    
                    // payload which is to be encrypted
                    const payload = {
                        email: user.email,
                        firstName: user.firstName,
                        lastName: user.lastName,
                        role: user.role,
                        isEmailVerified: user.isEmailVerified,
                        image: user.image
                                        }
                    // Generate JWT token
                    const jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "24h"})
                    res.status(200).json({
                        message: "Login Successful",
                        token: jwtToken,
                        role: user.role
                    })
                } else {
                    res.status(401).json({
                        message: "Invalid Password"
                    })
                }
                
            }
        }
    )
}

export function getUser(req, res) {

    if(req.user == null) {
        res.status(404).json({
            message: "Unauthorized"
        })
        return
    }

    res.json(req.user);
}

export async function googleLogin(req, res) {

    console.log(req.body.token)

    // validate the access token
    try{
        const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
            headers: {
                Authorization: `Bearer ${req.body.token}`
            }
        })
        console.log(response.data)

        const user = await User.findOne({email: response.data.email})
        if (user == null) {
            const newUser = new User(
                {
                    email: response.data.email,
                    firstName: response.data.given_name,
                    lastName: response.data.family_name,
                    password: "123",
                    image: response.data.picture
                }
            )
            await newUser.save();
            console.log("Created a new user")
            const payload = {
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
                role: newUser.role,
                isEmailVerified: true,
                image: newUser.image
            }
            // Generate JWT token
            const jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "24h"})
            res.json({
                message: "Login Successful",
                token: jwtToken,
                role: user.role
            })
        } else {
            console.log("User already exists!")
            const payload = {
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
                image: user.image
            }
            // Get the jwt token from the user data to check with the database
            const jwtToken = jwt.sign(payload, process.env.JWT_SECRET_KEY, {expiresIn: "24h"})
            res.json({
                message: "Login Successful",
                token: jwtToken,
                role: user.role
            })
        }
    } catch(error){
        res.status(500).json({
            message: "Google login failed",
            error: error.message
        })
    }
}

export async function sendOTP(req, res) {
    
    try {
        const email = req.params.email
        const user = await User.findOne(
            {
                email: email
            });
        if (user == null) {
            res.status(404).json(
                {
                    message: "User not found"
                }
            )
            return
        }
        await Otp.deleteMany(
            {
                email: email
            }
        )

        // Generate a 6 digit OTPs
        const otpCode = Math.floor(100000 + Math.random()*900000).toString()
        const newOtp = new Otp(
            {
                email: email,
                otp: otpCode
            }
        )
        // Save OTP in the database
        await newOtp.save();

        const message = {
            from: "matheesha27@gmail.com",
            to: email,
            subject: "Your OTP",
            text: "Your OTP is " + otpCode
        }
        transporter.sendMail(message, (err, info) => {
            if (err) {
                res.status(500).json(
                    {
                        message: "Failed to send OTP"
                    }
                )
            } else {
                res.json(
                    {
                        message: "OTP sent successfully"
                    }
                )
            }
        });
    } catch(error) {
        res.status(500).json(
            {
                message: "Failed to send OTP",
                error: error.message
            }
        )
    }
}

export async function validateOtpAndUpdatePassword(req, res) {

    try {
        const otp = req.body.otp
        const newPassword = req.body.newPassword
        const email = req.body.email

        const otpRecord = await Otp.findOne({email: email, otp: otp});
        if (otpRecord == null) {
            res.status(400).json(
                {
                    message: "Invalid OTP"
                }
            );
            return
        }

        await Otp.deleteMany({email: email});

        const hashedPassword = bcrypt.hashSync(newPassword, 10);
        await User.updateOne(
            {email: email},
            {$set: {password: hashedPassword, isEmailVerified: true}}    
        );
        res.status(201).json(
            {
                message: "Password updated successfully"
            }
        )
    } catch(error) {
        res.status(500).json(
            {
                message: "Failed to update password"
            }
        )
    }
}

export async function getAllUsers(req, res) {
    
    if (!isAdmin(req)) {
        res.status(401).json(
            {
                message: "Unauthorized"
            }
        );
        return
    }

    try {
        const users = await User.find();
        res.json(users);
    } catch(error) {
        res.status(500).json(
            {
                message: "Error fetching users",
                error: error.message
            }
        );
    }
}