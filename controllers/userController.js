import User from "../models/User.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export function createUser(req, res) {
    const data = req.body

    // hashing - 10 times hashing (salting rounds)
    const hashedPassword = bcrypt.hashSync(data.password, 10)
    // res.json({
    //     message: "Hashed Password: " + hashedPassword
    // })
    
    // const user = new User(data)
    const user = new User(
        {
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            password: hashedPassword,
            role: data.role
        }
    )
    user.save().then(()=>{
        res.json({
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
            // console.log(users)
            if(users[0] == null) {
                res.json({
                    message: "User Not Found"
                })
            } else {
                const user = users[0]
                // console.log(email, password)

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

                    res.json({
                        message: "Login Successful",
                        token: jwtToken,
                        role: user.role
                    })
                } else {
                    // User.updateOne({email: email}, {
                    //     invalidTries: user.invalidTries + 1
                    // }).then(() => {
                    //     res.json({
                    //     message: "Invalid Password"
                    // })
                    // })
                    res.status(401).json({
                        message: "Invalid Password"
                    })
                }
                
            }
        }
    )
}