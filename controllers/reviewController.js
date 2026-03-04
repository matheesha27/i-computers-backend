import Review from "../models/Review.js"

export function saveReview(req, res) {

    const review = new Review(req.body)
    const productId = review.productId;
    console.log(review);

    review.save().then(
        () => {
            res.json({
                message: `Review for ${productId} saved successfully`
            })
            console.log("Created review")
        }
    ).catch(
        (error) => {
            res.status(500).json({
                message: "Error creating review",
                error: error.message
            })
        }
    )
}

export function isAdmin(req) {

    if (req.user == null) {
        return false
    }
    if (req.user.role != "admin") {
        return false
    }
    return true
}

export async function getReviewsByProductId(req, res) {

    const productId = req.params.productId

    try {
        Review.find({productId: productId}).then(
            (reviews) => {
                res.json(reviews)
            }
        ).catch(
            (error) => {
                res.status(500).json({
                    message: "Error fetching reviews",
                    error: error.message
                })
            }
        )
    } catch (error) {
        res.status(500).json({
            message: "Error fetching reviews"
        }
        )
    }
}

