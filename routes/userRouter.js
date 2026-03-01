import express from "express"
import { createUser, getAllUsers, getUser, googleLogin, loginUser, sendOTP, validateOtpAndUpdatePassword } from "../controllers/userController.js"

const userRouter = express.Router()

userRouter.post("/", createUser)
userRouter.post("/login", loginUser)
userRouter.get("/", getUser)
userRouter.post("/google-login", googleLogin)
userRouter.get("/send-otp/:email", sendOTP)
userRouter.post("/validate-otp", validateOtpAndUpdatePassword)
userRouter.get("/all", getAllUsers)

export default userRouter;