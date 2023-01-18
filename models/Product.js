const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "Please add the product name."]
    },
    description: {
        type: String,
        required: [true, "Product description is required."]
    },
    price: {
        type: Number,
        required: [true, "Please add your product's price."]
    },
    stocks: {
        type: Number,
        required: [true, "Please add the product inventory stocks."]
    },
    category: {
        type: String,
        required: [true, "Please add the product's category."]
    },
    isActive: {
        type: Boolean,
        default: true
    },
    addedByAdmin: [
        {
            userId: {
                type: String
            },
            username: {
                type: String
            }
        }
    ],
    createdOn: {
        type: Date,
        default: new Date()
    },
    orderCart: [
        {
            orderId: {
                type: String
            },
            updatedOn: {
                type: Date,
                default: new Date()
            }
        }
    ]
});

module.exports = mongoose.model("Product", productSchema);