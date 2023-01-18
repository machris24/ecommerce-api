const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const auth = require("../auth");

// Routes

// Route for adding products
router.post("/add", auth.verify, (req, res) => {

    const userRole = auth.decode(req.headers.authorization);
    console.log(userRole)
	console.log(req.headers.authorization);

    if(userRole.isAdmin === false) {
        res.send(`You do not have an access on this page.`)
    } else {
        productController.addProduct(userRole, req.body).then(resultFromController => res.send(resultFromController))
    }
    
});

// Route for deleting products
router.put("/delete/:_id", auth.verify, (req, res) => {

    const userRole = auth.decode(req.headers.authorization);
    console.log(userRole)
	console.log(req.headers.authorization);

    if(userRole.isAdmin === false) {
        res.send(`You do not have an access on this page.`)
    } else {
        productController.deleteProduct(req.params).then(resultFromController => res.send(resultFromController))
    }
    
});

// Route for retrieving all active products (For ALL USERS)
router.get("/", (req, res) => {

    productController.getAllActiveProducts()
        .then(resultFromController => res.send(resultFromController))
});

// Route for retrieving all products (For ADMIN ONLY)
router.get("/all", auth.verify, (req, res) => {

    const userRole = auth.decode(req.headers.authorization);
    console.log(userRole)
	console.log(req.headers.authorization);

    if(userRole.isAdmin === false) {
        res.send(false)
    } else {
        productController.getAllProducts()
        .then(resultFromController => res.send(resultFromController))
    }
    
});

// Route for retrieving a single product
router.get("/:_id", (req, res) => {

    productController.getAProduct(req.params)
        .then(resultFromController => res.send(resultFromController))
});

// Route for updating a product info
router.put("/:_id", auth.verify, (req, res) => {
    const userData = auth.decode(req.headers.authorization)

    console.log(userData)
    if(userData.isAdmin) {
        productController.updateProduct(req.params, req.body)
        .then(resultFromController => res.send(resultFromController))
    } else {
        res.send(`You do not have an access on this page.`)
    }

});

// Route for archiving a product
router.patch("/archive/:_id", auth.verify, (req, res) => {

    const data = {
		_id : req.params._id,
		isAdmin : auth.decode(req.headers.authorization).isAdmin
	}

	productController.archiveProduct(data).then(resultFromController => res.send(resultFromController))


});

// Route for reactivating a product
router.patch("/activate/:_id", auth.verify, (req, res) => {

    const data = {
		_id : req.params._id,
		isAdmin : auth.decode(req.headers.authorization).isAdmin
	}

	productController.activateProduct(data).then(resultFromController => res.send(resultFromController))

});




module.exports = router;