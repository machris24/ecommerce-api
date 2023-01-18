const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema({
    userId: {
            type: String
    },
    productCart: [
        {
            productId: { 
                type: String, 
                required: [true, `Please add a product.`]
            },
            quantity: {
                type: Number,
                required: [true, `Please add quantity`]
            },
            price: {
                type: Number,
                default: 0
            },
            subTotal: {
                type: Number,
                default: 0
            }
        }
    ],
    totalAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        default: "Pending for seller processing"
    },
    purchasedOn: {
        type: Date,
        default: new Date()
    }
});

module.exports = mongoose.model("Order", orderSchema);