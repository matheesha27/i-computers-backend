import axios from "axios";
import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
            // Generate JWT token
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