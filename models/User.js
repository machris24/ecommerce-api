const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: [true, "Please add your email address."]
    },
    username: {
        type: String,
        required: [true, "Please add a username."]
    },
    password: {
        type: String,
        required: [true, "Please add a valid password."]
    },
    firstName: {
        type: String,
        required: [true, "Please add your given name."]
    },
    lastName: {
        type: String,
        required: [true, "Please add your surname."]
    },
    isAdmin: {
        type: Boolean,
        default: false,
        required: [true, "Please let us know if you are an admin."]
    },
    mobileNo: {
        type: String,
        required: [true, "Please enter your contact number."]
    },
    registeredOn: {
        type: Date,
        default: new Date()
    },
    shoppingCart: [
        {
            orderId: {
                type: String,
                required: [true, "Error: Order Id missing."]
            },
            orderedOn: {
                type: Date,
                default: new Date()
            },
            status: {
                type: String,
                default: "Pending"
            }
        }
    ]
});

module.exports = mongoose.model("User", userSchema);