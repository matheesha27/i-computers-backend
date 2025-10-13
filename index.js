import express from "express"
import mongoose from "mongoose"
import userRouter from "./routes/userRouter.js"
import jwt from "jsonwebtoken";
import productRouter from "./routes/productRouter.js";

// database connectivity
const mongoUri = "mongodb+srv://admin:1234@cluster0.ppfyb8o.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
// const mongoUri = "mongodb+srv://admin:1234@cluster0.ppfyb8o.mongodb.net/matheesha?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(mongoUri).then(()=>{
    console.log("Connected to MongoDB Cluster")
})

let app = express()

//middleware - cleans request data and pass that to the backend
app.use(express.json())

// next() is a function
app.use(
    (req, res, next)=>{
        const authorizationHeader = req.header("Authorization")

        if (authorizationHeader != null) {
            const token = authorizationHeader.replace("Bearer ", "")
            // console.log(token)

            // Decrypt token - jwt.verify(token, secretKey, errorFunction)
            jwt.verify(token, "secretKey96#5",
                (error, content) => {
                    if (content == null) {
                        console.log("Invalid token")
                        res.json({
                            message: "Invalid token"
                        })
                    } else {
                        // console.log(content)
                        // this content has the role as admin or customer
                        req.user = content
                        next()
                    }
                }
            )
        } else {
            next()
        }
})

function abc() {
    console.log("Server is running")
}

// app.listen(port, initialFunction)
app.listen(3000, abc)

// add the route "/students"
// app.use(path, routerFile)
app.use("/user", userRouter)
app.use("/products", productRouter)