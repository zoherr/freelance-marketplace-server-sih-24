import createError from "../utils/createError.js";
import Order from "../models/order.model.js";
import Gig from "../models/gig.model.js";
import User from "../models/user.model.js"; // Import the User model
import Stripe from "stripe";
import dotenv from "dotenv";

dotenv.config();
const stripe = new Stripe(process.env.STRIPE); // Initialize Stripe once

export const intent = async (req, res, next) => {
    try {
        const gig = await Gig.findById(req.params.id);
        if (!gig) return next(createError(404, "Gig not found"));

        const paymentIntent = await stripe.paymentIntents.create({
            amount: gig.price * 100,
            currency: "inr",
            automatic_payment_methods: {
                enabled: true,
            },
        });

        const newOrder = new Order({
            gigId: gig._id,
            img: gig.cover,
            title: gig.title,
            buyerId: req.userId,
            sellerId: gig.userId,
            price: gig.price,
            payment_intent: paymentIntent.id,
        });

        await newOrder.save();

        res.status(200).send({
            // success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (err) {
        console.error("Error creating payment intent or order:", err); // Enhanced logging

        next(err);
    }
};


export const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find({
            ...(req.isSeller ? { sellerId: req.userId } : { buyerId: req.userId }),
            isCompleted: true,
        });

        res.status(200).send(orders);
    } catch (err) {
        next(err);
    }
};

export const confirm = async (req, res, next) => {
    try {
        const order = await Order.findOneAndUpdate(
            { payment_intent: req.body.payment_intent },
            { $set: { isCompleted: true } },
            { new: true }
        );

        if (!order) return next(createError(404, "Order not found"));

        res.status(200).send("Order has been confirmed.");
    } catch (err) {
        next(err);
    }
};

export const complete = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) return next(createError(404, "Order not found"));

        // if (order.status !== "pending") {
        //     return next(createError(400, "Order cannot be moved to 'in progress'"));
        // }



        const seller = await User.findById(order.sellerId);
        seller.payment += order.price
        await seller.save();

//         if (!seller || !seller.stripeAccountId) {
//             return next(createError(404, "Seller or Stripe account not found"));
//         }
//  // Log the stripeAccountId for debugging
//  console.log(`Stripe Account ID: ${seller.stripeAccountId}`);
//         // Transfer funds to the seller
//         const transfer = await stripe.transfers.create({
//             amount: order.price * 100, // Adjust the amount to match the actual order price
//             currency: 'inr',
//             destination: seller.stripeAccountId, // Use the correct account ID
//             transfer_group: `ORDER_${order._id}`, // Optional: Use a unique transfer group identifier
//         });

//         transfer()

        order.status = "completed";
        await order.save();
        res.status(200).send('Funds transferred to seller.');
    } catch (err) {
        next(err);
    }
};
