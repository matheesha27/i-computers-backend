import dotenv from "dotenv";
import nodemailer from "nodemailer";

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

export async function sendSupportMessage(req, res) {

    try {
        const senderEmail = req.body.senderEmail
        const senderName = req.body.senderName
        const senderMessage = req.body.senderMessage

        const message = {
            from: senderEmail,
            to: "matheesha27@gmail.com",
            subject: "Support Request from " + senderName,
            text: senderMessage
        }
        console.log(message)
        transporter.sendMail(message, (err, info) => {
            if (err) {
                res.status(500).json(
                    {
                        message: "Failed to send Support Message"
                    }
                )
            } else {
                res.json(
                    {
                        message: "Support Message sent successfully"
                    }
                )
            }
        });
    } catch (error) {
        res.status(500).json(
            {
                message: "Failed to send Support Message",
                error: error.message
            }
        )
    }
}