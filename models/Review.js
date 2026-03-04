import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
    {
        email: {
            type: String,
            required: true
        },
        productId: {
            type: String,
            required: true
        },
        rating: {
            type: String,
            default: "5.0"
        },
        comment: {
            type: String,
            required: true
        }
    }
)

const Review = mongoose.model("Review", reviewSchema);

export default Review;