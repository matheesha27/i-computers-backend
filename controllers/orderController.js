import Order from "../models/Order.js";
import Product from "../models/Product.js";
import { isAdmin } from "./productController.js";

export async function createOrder(req, res) {

    if(req.user == null) {
        res.status(401).json({
            message: "Unauthorized"
        })
        return
    }

    try {
         // ORD00001
        const latestOrder = await Order.findOne().sort({date: -1})

        let orderId = "ORD00001"
        if (latestOrder != null) {
            let latestOrderId = latestOrder.orderId; // "ORD00001"
            let latestOrderNumberString = latestOrderId.replace("ORD", ""); // "00001"
            let latestOrderNumberInteger = parseInt(latestOrderNumberString); // 1
            let newOrderNumber = latestOrderNumberInteger + 1; // 2

            let newOrderNumberString = newOrderNumber.toString().padStart(5, "0");
            orderId = "ORD" + newOrderNumberString;
        }

        // calculate the total cost
        const items = []
        let total = 0
        for (let i = 0; i < req.body.items.length; i++) {

            const product = await Product.findOne({productId: req.body.items[i].productId})

            if (product == null) {
                return res.status(400).json(
                    {
                        message: `Product with Product ID ${req.body.items[i].productId} not found`
                    }
                )
            }

            items.push(
                {
                    productId: product.productId,
                    name: product.name,
                    price: product.price,
                    quantity: req.body.items[i].quantity,
                    image: product.images[0]
                }
            )

            // decrease the quantity from the stock
            // await Product.updateOne(
            //     {productId: product.productId},
            //     {stock: product.stock - req.body.items[i].quantity}
            // )

            total += product.price * req.body.items[i].quantity
        }

        let name = req.body.name;
        if (name == null) {
            name = req.user.firstName + " " + req.user.lastName;
        }

        const newOrder = new Order(
            {
                orderId: orderId,
                email: req.user.email,
                name: name,
                address: req.body.address,
                total: total,
                items: items,
                phone: req.body.phone
            }
        )
        await newOrder.save();

        return res.json(
            {
                message: "Order placed successfully",
                orderId: orderId
            }
        )

    } catch(error) {
        return res.status(500).json({
            message: "Error placing the order",
            error: error.message
        })
    }
}

export async function getOrders(req, res) {

    if (req.user == null) {
        res.status(401).json(
            {
                message: "Unauthorized"
            }
        );
        return
    }
    
    if (isAdmin(req)) {
        const orders = await Order.find().sort({date: -1})
        res.json(orders)
    } else {
        const orders = await Order.find({email: req.user.email}).sort({date: -1})
        res.json(orders)
    }
}

export async function updateOrderStatus(req, res) {
    
    if (!isAdmin(req)) {
        res.status(403).json({
            message: "Only admins can update products"
        })
        return
    }
    
    const orderId = req.params.orderId
    console.log("OrderID: " + orderId)

    Order.updateOne({orderId: orderId}, req.body).then(
        () => {
            res.status(201).json({
                message: "Order status updated successfully"
            })
        }
    )
}