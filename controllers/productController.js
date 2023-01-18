const Product = require('../models/Product');
const Order = require('../models/Order');
const orderController = require('../controllers/orderController');

// Controller Functions:

// Adding a new product
module.exports.addProduct = (user, reqBody) => {

            try {

                    // Assign the reqBody values
                    let newProduct = new Product ({
                        name: reqBody.name, 
                        description: reqBody.description, 
                        price: reqBody.price,
                        stocks: reqBody.stocks,
                        category: reqBody.category

                    });
                    
                    // Push the userdetails in the addedByAdmin array
                    newProduct.addedByAdmin.push({
                        userId: user.userId,
                        username: user.username
                    });
        
                    console.log(newProduct)

                    // Check if the product STOCKS is <= 0 ? : true, then set isActive : false
                    checkStocks(newProduct);


                    // Save the new data as a new product
                    return newProduct.save()
                        .then((product, error) => {

                            if(error) {
                                return false //"Product Addition failed"
                            } else {
                                

                                return true
                            }

                        }).catch(err => {
                            return err
                        })

            } catch (error) {
                return error
            }

};

// Adding a new product
module.exports.deleteProduct = (reqParams) => {

    try{
        // Find the product matched the reqparams productID
        return Product.findById(reqParams)
            .then(async result => {
                    console.log(result)

                // update the Order Carts
                // For each product's orderCart element do the following:
                let isOrderUpdated = await result.orderCart.forEach(element => {
                    console.log(element.orderId)
                    // Find the specific order for each element's orderId from the Order collection.
                   let sliceComplete = Order.findById(element.orderId)
                         .then( async order => {
                            console.log(order)
                            console.log(order._id.valueOf())
                            console.log(order.userId)

                            let orderID = order._id.valueOf()

                            try {

                                // then, call the function productIdFromSpecOrder() to get each order's productId and pass it to the variable orderProductId
                                let orderProductId = await (await productIdFromSpecOrder(orderID)).toString()
                                

                                let orderProductIdString = `{"_id": "${orderProductId}"}`
                                
                                let orderProductIdObject = JSON.parse(orderProductIdString)
                               

                                // Call the module removeProduct() from the orderController to remove/slice the product from all orders' productCart array it is associated with
                               return await orderController.removeProduct(order.userId, orderID, orderProductIdObject);


                            } catch (error) {
                                return error.stack
                            }

                         }).catch(err => {
                            return err.stack
                         })
                    console.log(sliceComplete)

                    if(!sliceComplete){
                        return false
                    } else {
                        return true
                    }

                });
    
            }).then(() => {
                return Product.deleteOne(reqParams)
                .then((product, error) => {
        
                    if(error) {
        
                        return `Product Deletion Unsuccessful` 
        
                    } else {
        
                        return `Successfully deleted the product!
                        You have deleted a product with id# ${reqParams._id}`
                    }
        
                }).catch(err => {
                    return err.stack
                });
            }).catch(err => {
                return err.stack
            });
       
    
        }catch(error) {
            return error.stack
        }
};

//Retrieving All Active Products
module.exports.getAllActiveProducts = () => {

    try {
            // Find all and show all active products
            return Product.find({isActive: true})
                    .then(result => {

                        return result

                    }).catch(err => {
                        return err.stack
                    })

    } catch (error) {
        return error.stack
    }
};

//Retrieving All Products (Strictly for ADMIN ONLY)
module.exports.getAllProducts = () => {

    try {
            // Find and show all the products
            return Product.find({})
                    .then(result => {
                        
                        return result

                    }).catch(err => {
                        return err
                    });

    } catch (error) {
        return error
    };
};

//Retrieve a product
module.exports.getAProduct = (reqParams) => {
    
        try {
    
        //Find and show a specific product info    
        return Product.findById(reqParams)
                .then(result => {
                    
                        if(result){

                            return result

                        } else {
                            return `it seems the product identifier you have entered is incorrect.`
                        }
                
                    
                }).catch(err => {
                    return err.stack
                });

    } catch (error) {
        return error.stack
    };
};

//Update product information (For Admin Only)
module.exports.updateProduct = (reqParams, reqBody) => {

    try {

        // Assign the reqBody values
        let updatedProduct = {
                name: reqBody.name,
                description: reqBody.description,
                price: reqBody.price,
                stocks: reqBody.stocks,
                category: reqBody.category
            }
            console.log(updatedProduct)

            // Check if the product STOCKS is <= 0 ? : true, then set isActive : false
            checkStocks(updatedProduct);
        
            // Find the product and update
            return Product.findByIdAndUpdate(reqParams, updatedProduct)
                .then((updatedProduct, error) => {
                    
                    if(error) {
                        return false
                    } else {
                        return true

                    }

                }).catch(err => {
                    return err
                });

    } catch (error) {
        return error
    };
};

//Archiving a product
module.exports.archiveProduct = (data) => {
    
    try {

        // Find the prduct by ID based in reqParams
        return Product.findById(data._id).then((result, err) => {

            if(data.isAdmin === true) {
    
                result.isActive = false;
    
                return result.save().then((archiveProduct, err) => {
    
                    // Product not archived
                    if(err) {
    
                        return false;
    
                    // Product archived successfully
                    } else {
    
                        return true;
                    }
                })
    
            } else {
    
                //If user is not Admin
                return false
            }
    
        })
    

    } catch (error) {
        return error
    }

};

//Activating a product
module.exports.activateProduct = (data) => {
    

    try {
    
    // Find the prduct by ID based in reqParams
	return Product.findById(data._id).then((result, err) => {

        if(data.isAdmin === true) {

            result.isActive = true;

            return result.save().then((activateProduct, err) => {

                // Product not archived
                if(err) {

                    return false;

                // Product archived successfully
                } else {

                    return true;
                }
            })

        } else {

            //If user is not Admin
            return false
        }

    })


    } catch (error) {
        return error
    }

};



// Global Functions:

// Function to automatically set to FALSE a product that has STOCKS <= 0 else isActive true
function checkStocks(specProduct) {
    if(specProduct.stocks <= 0) {
        
       // assign "false" in isActive property
       specProduct.isActive = false

    } else {

        // assign "true" in isActive property
       return specProduct.isActive = true

    }
               
}

// Function to find and call a specific order data
async function callOrder(orderId) {
    let orderData = await Order.findById(orderId)
    .then(order => {
        return order
    })
    
    return orderData
}

// Function to extract the product ID from the Order
function productIdFromSpecOrder(orderId){
    
    let orderdetails = callOrder(orderId)
    .then(order => {

        if(order) {
            let productIdfromOrder = order.productCart.map(({productId}) => productId);
            return productIdfromOrder
        } else {
            return `bluff`
        }
        
    })
    console.log(orderdetails)
    return orderdetails
    
}


    
           
