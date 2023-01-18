const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const auth = require("../auth");


// Routes
// Route for creating an order
router.post("/orderProducts", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)
	console.log(req.headers.authorization);

	if(userData.isAdmin) {
        res.send(false)

    } else {
        
		let productData = {
			productId: req.body.productId,
            quantity: req.body.quantity
		}
		orderController.orderProducts(userData.id, productData)
			.then(resultFromController => res.send(resultFromController))
    }

	
});

// Route for adding more products in a cart
router.put("/addtoCart/:_id", auth.verify, (req, res) => {

    const userData = auth.decode(req.headers.authorization);
	console.log(userData)

	if(userData.isAdmin) {
        res.send(false)

    } else {
		orderController.addtoCart(req.params, req.body)
			.then(resultFromController => res.send(resultFromController))
    }
    
});

// Route for changing the product quantity
router.patch("/updateQuantity/:_id", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)

	if(userData.isAdmin) {
		res.send(`Hi ${userData.username}!. 
		You do not have permission on this page.`)

    } else {
		orderController.updateQuantity(req.params, req.body)
			.then(resultFromController => res.send(resultFromController))
    }
}); 

// Route for removing products from the cart
router.patch("/remove/:_id", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)

	if(userData.isAdmin) {
		res.send(`Hi ${userData.username}!. 
		You do not have permission on this page.`)

    } else {
		orderController.removeProduct(userData.id, req.params, req.body)
			.then(resultFromController => res.send(resultFromController))
    }

});


// Route for order cancellation
router.delete("/cancelOrder/:_id", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)
	console.log(req.headers.authorization);

	if(userData.isAdmin) {
        res.send(`Hey admin ${userData.username}!. 
		You are not allowed checkout an item!`)

    } else {
		orderController.cancelOrder(userData.id, req.params)
			.then(resultFromController => res.send(resultFromController))
    }

	
});

// Route for retrieving ALL Orders (ADMIN ONLY)
router.get("/", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)
	console.log(req.headers.authorization);

	if(userData.isAdmin) {
		orderController.showOrders()
			.then(resultFromController => res.send(resultFromController))

    } else {
		res.send(`Hey ${userData.username}!. 
		You are do not have permission of access on this page!`)
    }

	
});

// Route for retrieving user's Cart of Orders
router.get("/myCart", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization)
	console.log(userData)
	
	orderController.whatsInMyCart(userData.id)
		.then(resultFromController => res.send(resultFromController))

	
});



module.exports = router;