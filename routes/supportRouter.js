import express from "express"
import { sendSupportMessage } from "../controllers/supportController.js"

const supportRouter = express.Router()

supportRouter.post("/send-support-message", sendSupportMessage)

export default supportRouter;