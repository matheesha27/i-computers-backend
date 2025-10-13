import Product from "../models/Product.js";

export function createProduct(req, res) {

    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Forbidden"
        })
        return
    }

    const product = new Product(req.body)

    product.save().then(
        () => {
            res.json({
                message: "Product created successfully"
            })
        }
    ).catch(
        (error) => {
            res.status(500).json({
                message: "Error creating product",
                error: error.message
            })
        }
    )
}

export function isAdmin(req) {

    // check whether user role is admin
    if (req.user == null) {
        return false
    }
    // the below req.user is appended by the index.js
    if (req.user.role != "admin") {
        return false
    }
    return true
}

export async function getAllProducts(req, res) {

    // send all product details IF user role is admin
    // send only available products IF user role is NOT admi (customer)
    try {
        if (isAdmin(req)) {
        // Product.find().then(
        //     (products) => {
        //         res.json(products)
        //     }
        // ).catch(
        //     (error) => {
        //         res.json({
        //             message: "Error fetching products",
        //             error: error.message
        //         })
        //     }
        // )

        const products = await Product.find()
        
        } else {
            Product.find({isAvailable: true}).then(
                (products) => {
                    res.json(products)
                }
            ).catch(
                (error) => {
                    res.status(500).json({
                        message: "Error fetching available products",
                        error: error.message
                    })
                }
            )
        }
    } catch(error) {
        res.status(500).json({
            message: "Error fetching products"
        }
        )
    }
}

export function updateProduct(req, res) {
    
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Only admins can update products"
        })
        return
    }
    
    const productId = req.params.productId

    Product.updateOne({productId: productId}, req.body).then(
        () => {
            res.json({
                message: "Product updated successfully"
            })
        }
    )
}

export function deleteProduct(req, res) {

    if (!isAdmin(req)){
        res.status(403).json({
            message: "Only admins can delete products"
        })
    }
    const productId = req.params.productId

    Product.deleteOne({productId: productId}).then(
        () => {
            res.json({
                message: "Product deleted successfully"
            })
        }
    )
}

export function getProductById(req, res) {

    const productId = req.params.productId

    Product.findOne({productId: productId}).then(
        (product) => {
            if (product == null) {
                res.status(404).json({
                    message: "Product Not Found"
                })
            } else {
                if (product.isAvailable) {
                    res.json(product)
                } else {
                    if (isAdmin(req)) {
                        res.json(product)
                    } else {
                        res.status(404).json({
                            message: "Product Not Found"
                        })
                    }
                }
                
            }
        }
    ).catch(
        (error) => {
            res.status(500).json(
                {
                    message: "Error fetching product"
                }
            )
        }
    )
}