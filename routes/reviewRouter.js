import express from "express";
import { saveReview, getReviewsByProductId } from "../controllers/reviewController.js"

const reviewRouter = express.Router()

reviewRouter.post("/", saveReview)
reviewRouter.get("/:productId", getReviewsByProductId)

export default reviewRouter;