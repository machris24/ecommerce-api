const Order = require('../models/Order');
const User = require('../models/User');
const Product = require('../models/Product');


// Controller Functions:

// Creating an order
module.exports.orderProducts = async (user, reqBody) => {

    try {

        // To automatically populate the product price of each ordered product
            let specProduct = await Product.findById(reqBody.productId)
                                        .then(result => {
                                            return result
                                        }).catch(err => {
                                            return err
                                        });
	
        // First, check if the Product STOCKS is sufficient versus order quantity
        if(specProduct.stocks < reqBody.quantity) {

            // Automatically set a product isActive property to FALSE if STOCKS <= 0
            checkStocks(specProduct);

            return false

        } else {

	        // Pass the data from the reqBody
	        let newOrder = new Order ({
	                    userId:  user,
	                    productId: reqBody.productId,
	                    quantity: reqBody.quantity
	                });
	                     
            
	            // Initiate saving the order
	            let checkout = await newOrder.save()
	                    .then(newOrder => {
	                        newOrder.productCart.push({
	                            productId: reqBody.productId, 
	                            quantity: reqBody.quantity,
	                            price: specProduct.price,
	                            subTotal: reqBody.quantity * specProduct.price
	                           })
	
	                        let cart = newOrder.productCart
	                        newOrder.totalAmount = cart.reduce(function(prev,cur){
	                            return prev + cur.subTotal;
	                        }, 0)
	
	                        return newOrder
	                    }).catch(err => {
                            return err
                        });
    
                console.log(checkout)

                    // User's shopping cart array update
                    let isUserUpdated = await User.findById(user)
                        .then(user => {
                            user.shoppingCart.push({orderId: checkout._id})

                                return user.save()
                                    .then((user, error) => {
                                        if(error) {
                                            return false
                                        } else {
                                            return true
                                        }
                                    }).catch(err => {
                                        return err
                                    });
                        }).catch(err => {
                            return err
                        });

                // Product's order cart array update
                let isProductUpdated = await Product.findById(reqBody.productId)
                    .then(product => {

                        // Update product Cart's orderId
                        product.orderCart.push({orderId: checkout._id})

                        // update the product Stocks
                        product.stocks = product.stocks - reqBody.quantity
                        console.log(product)
                        console.log(product.stocks)

                        // Automatically set a product isActive property to FALSE if STOCKS <= 0
                        checkStocks(product);

                            return product.save()
                                .then((product, error) => {
                                    if(error) {
                                        return false
                                    } else {
                                        return true
                                    }
                                }).catch(err => {
                                    return err
                                });

                    }).catch(err => {
                        return err
                    });

                //Check if all of the cart arrays are updated    
                if(checkout && isUserUpdated && isProductUpdated) {
                    
                    return newOrder.save()
                        .then((order, error) => {
                                if(error) {
                                    // an Error occured
                                   return false

                               } else {
                                    // Order successful
                                    return true

                                      }

                        }).catch(err => {
                             return err
                        });

                } else {
                    // Order UNsuccessful
                    return false
                }

        }
    } catch (error) {
        return error

    
    };


};

// Adding More products in the shopping Cart
module.exports.addtoCart = async (reqParams, reqBody) => {
            
           try {

                // Check if the product exist in the Order Cart
                let exist = await doesProductExist(reqParams, reqBody)
                    .then(result => {
                        
                        return result
                    }).catch(err => {
                        return err
                    });
            
                    console.log(exist)

                    try {
                        // If product does not exist in the order/shopping cart....
                        if(exist === false){

                            // To automatically populate the product details of each ordered product
                            let prod = reqBody.productId
                            let prodFind = await Product.findById(prod)
                                .then(result => {
                                    return result
                            
                            }).catch(err => {
                                return err
                            });

                            console.log(prodFind)

                            //ADD THE NEW PRODUCT TO CART
                            let updatedCart = await callOrder(reqParams)
                            .then( async result => {

                                console.log(result)


                                let cart = result.productCart
                                
                                // PUSH the new info/details to the Order's shopping/order cart array
                                cart.push({
                                    productId: reqBody.productId,
                                        quantity: reqBody.quantity,
                                        price: prodFind.price,
                                        subTotal: reqBody.quantity * prodFind.price
                                });

                                // Update the total amount based on the added products
                                result.totalAmount = cart.reduce((total, obj) => obj.subTotal + total,0);

                                console.log(result)

                                    //Products order/shopping cart array update
                                    let isProductUpdated = await Product.findById(prod)
                                    .then(product => {

                                        // Push the the new orderID details to the product order list cart
                                        product.orderCart.push({orderId: result._id})

                                            // Save the update :)
                                            return product.save().then((product, error) => {
                                                if(error) {
                                                    return false
                                                } else {
                                                    return true
                                                }
                                            })

                                    }).catch(err => {
                                        return err
                                    });

                                    //Check if the product's order list cart is updated?...
                                        if(isProductUpdated) {

                                                // SAVE the resulted new order
                                                return result.save()
                                                    .then(result => {
                                                            
                                                            return `The product ${prodFind.name} has been added to your order!
                                                            ${result}`
                                                                    
                                                        }).catch(err => {
                                                            return err
                                                        });

                                                } else {
                                                    return `It seems there is an issue saving your request.`
                                                }
                         
                             }).catch(err => {
                                  return err
                             });
                    
                        console.log(updatedCart)
                        return updatedCart  

                        } else {
                            
                            // The product being added exists... CALL updateQuantity() function and return the result here....
                            return this.updateQuantity(reqParams, reqBody)
        
	                    }

                    } catch (error) {
                        return error
                    }
        

        } catch (error) {
            return error
        }
        
  
};


// Updating quantity of previously ordered products
module.exports.updateQuantity = async (reqParams, reqBody) => {

        try {

            // Check if the product exists in the Order Cart
            let exist = await doesProductExist(reqParams, reqBody)
                .then(result => {

                    return result

                }).catch(err => {
                    return err
                });

                console.log(exist)

            try {

                // If product does not exist in the order/shopping cart....
	            if(exist === false){

                    try {

	                     // The product being altered(quantity update) does not exist... CALL addtoCart() function and return the result here....
	                    return this.addtoCart(reqParams, reqBody);

                    } catch (error) {
                        return error
                    }

	            } else {
                        
                        let prod = reqBody.productId;

                        // To automatically populate the product details of each ordered product
                        let prodFind = await Product.findById(prod)
                            .then(result => {

                                return result
                       
                            }).catch(err => {
                                return err
                            });

                        console.log(prodFind)
                        
                        // Update happens here....
                        let updatedCart = await callOrder(reqParams)
                            .then(order => {

                                console.log(order)

                                    // call the product instance/object and update :)
                                    let specificOrder = callSpecificOrder(order, prod)
                                        .then(async result => {
                                            
                                            // } else if(output > 0) {

                                            //      // Return Stocks for each removed product from cart
                                            //      Product.findById(result.productId)
                                            //      .then(prod => {

                                            //         let output = reqBody.quantity - result.quantity
 
                                            //              // return the oredered quantity to each product stocks
                                            //              prod.stocks += output
 
                                            //              // Automatically set a product isActive property to TRUE if STOCKS !<= 0;
                                            //              checkStocks(prod);
                                            //              console.log(prod)
 
                                            //              // return the saved info in the product   
                                            //              return prod.save()
                                            //              .then((product, error) => {
                                            //                  if(error) {
                                            //                      return false
                                            //                  } else {
                                            //                      return true
                                            //                  }
                                            //              }).catch(err => {
                                            //                  return err
                                            //              });
 
                                            //          })

                                            // }
                                            console.log(result.quantity)
                                            console.log(reqBody.quantity)
                                            let output = result.quantity - reqBody.quantity
                                            console.log(output)

                                            // Update the properties based on the given details from the reqBody
                                            result.quantity = reqBody.quantity
                                            result.price = prodFind.price
                                            result.subTotal = reqBody.quantity * prodFind.price
                        
                                            console.log(result)

                                            

                                            // let t = 5;
                                            // t -= output
                                            // console.log(t)

                                            // if(output < 0) {

                                                 // Return Stocks for each removed product from cart
                                                await Product.findById(result.productId)
                                                .then(prod => {

                                                    console.log(`before: ${prod.stocks}`)

                                                    if(output > 0) {

                                                        // return the oredered quantity to each product stocks
                                                        prod.stocks += output

                                                        console.log(`after +: ${prod.stocks}`)

                                                    } else if(output < 0) {

                                                        let pos = 0;
                                                        pos =- output
                                                        
                                                        // return the oredered quantity to each product stocks
                                                        prod.stocks -= pos

                                                        console.log(`after -: ${prod.stocks}`)

                                                    }
                                                        
                                                       // Automatically set a product isActive property to TRUE if STOCKS !<= 0;
                                                        checkStocks(prod);
                                                        console.log(prod)

                                                        // return the saved info in the product   
                                                        return prod.save()
                                                        .then((product, error) => {
                                                            if(error) {
                                                                return false
                                                            } else {
                                                                return true
                                                            }
                                                        }).catch(err => {
                                                            return err
                                                        });

                                                    }).catch(err => {
                                                        return err
                                                    });

                                        }).catch(err => {
                                            return err
                                        });

                                        console.log(specificOrder)

                                        // Update the total amount based on the quantity update
                                        order.totalAmount = order.productCart.reduce((total, obj) => obj.subTotal + total,0)
                                            console.log(order)

                                    // return the saved info in the order
                                    return order.save()
                                        .then(result => {
                                            console.log(result)

                                                 // Order successful          
                                                return `You have successfully change the quantity of your order ${prodFind.name} to ${reqBody.quantity}!`
                                                                    
                                        }).catch(err => {
                                            return err
                                        });

                            }).catch(err => {
                                return err
                            });

                        return updatedCart
  
                }; 

            }catch (error) {
                return error
            };

        }catch (error) {
            return error
        };
};

// Removing a product from the cart
module.exports.removeProduct = async (user, reqParams, reqBody) => {

    try {

        // Check if the product exists in the Order Cart
        let exist = await doesProductExist(reqParams, reqBody)
                .then(result => {
                    
                    return result

                }).catch(err => {
                    return err
                });

                console.log(exist)

            try {

                // If product does not exist in the order/shopping cart....
                if(exist === false){
                    
                    try {

	                    return `product does not exist`

                    } catch (error) {
                        return error
                    }

	            } else {

                    
                    let prod = reqBody._id;
                    console.log(prod)

                    // To automatically populate the product details of each ordered product
                    let prodFind = await Product.findById(prod)
                        .then(result => {

                            return result
                   
                        }).catch(err => {
                            return err
                        });
        

                    console.log(prodFind)

                    // Removal of product happens here....
                    let removeTheProduct = await callOrder(reqParams)
                        .then(order => {
                            console.log(order)

                                // Find the specific Product to remove
                                let specificOrderId = callSpecificOrder(order, prod)
                                    .then(result => {
                                        console.log(result)

                                         // Return Stocks for each removed product from cart
                                        Product.findById(result.productId)
                                            .then(prod => {

                                                    // return the oredered quantity to each product stocks
                                                    prod.stocks += result.quantity

                                                    // Automatically set a product isActive property to TRUE if STOCKS !<= 0;
                                                    checkStocks(prod);
                                                    console.log(prod)

                                                    // return the saved info in the product   
                                                    return prod.save()
                                                    .then((product, error) => {
                                                        if(error) {
                                                            return false
                                                        } else {
                                                            return true
                                                        }
                                                    }).catch(err => {
                                                        return err
                                                    });

                                                })
                                        

                                        // Get the product ID from the extracted order
                                        let productObjectId = result._id
                                        console.log(result._id)
                                        return productObjectId

                                    }).catch(err => {
                                    return err
                                    });

                                // Remove the product from the Order's product/shopping cart
                                order.productCart.splice(order.productCart.findIndex(v => v._id === specificOrderId), 1);
                                console.log(order)

                                // Update the total amount omitting the product 
                                order.totalAmount = order.productCart.reduce((total, obj) => obj.subTotal + total,0);
                                console.log(order)
                            
                            // Check: IS THE productCart.isEmpty === true? : cancel the whole order.. else save the order.
                            if(order.productCart.length === 0) {

                                try {

                                    return this.cancelOrder(user, reqParams);

                                } catch (error) {
                                    return error
                                }
                                
                            } else {

                                // Update Product's order cart array
                                Product.findById(prod)
                                .then(product => {
                                    console.log(product)

                                try {
  
                                // Update Product's orderCart array
                                    // Cut the specific product from the product's orderCart array
                                    let cart = product.orderCart
                                    cart.splice(cart.findIndex(({orderId}) => orderId == reqParams), 1);
                            
                                    console.log(prod)

                                        // return the saved info in the order   
                                        return product.save()
                                            .then((user, error) => {
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
                                    }


                                }).catch(err => {
                                    return err
                                });


                                // return the saved info in the order
                                return order.save()
                                .then(result => {
                                    console.log(result)

                                         // Order successful          
                                        return `You have successfully removed ${prodFind.name} from your cart order reference # ${order._id}!`
                                                            
                                }).catch(err => {
                                    return err
                                });

                            }
                                

                        }).catch(err => {
                            return err
                        });
        

                    return removeTheProduct;

                }
            } catch (error) {
                return error
            };

    } catch (error) {
        return error
    };
};

// Cancellation of Orders
module.exports.cancelOrder = async (user, reqParams) => {

    try {

        // Check if the order data/id exists?
        let exist = await callOrder(reqParams)
            .then(result => {
        
                if(result) {
                    return true
                } else {
                    return false
                }

            }).catch(err => {
                return err
            });
       
            console.log(exist)

        try {

             // If order does not exist....
            if(exist === false){

                return `It seems the order details you are looking for does not exist.`

            } else {

                // Order does exist so... lets' cancel it!
                let canceledOrder = await callOrder(reqParams)
                .then( async result => {
                    // console.log(result)

                    // Return Stocks for each products on cart
                    result.productCart.forEach(function(item){
                        return Product.findById(item.productId)
                         .then(prod => {

                                 // return the oredered quantity to each product stocks
                                 prod.stocks += item.quantity

                                 // Automatically set a product isActive property to TRUE if STOCKS !<= 0;
                                 checkStocks(prod);
                                 console.log(prod)

                                 // return the saved info in the product   
                                return prod.save()
                                .then((product, error) => {
                                    if(error) {
                                        return false
                                    } else {
                                        return true
                                    }
                                }).catch(err => {
                                    return err
                                });

                             })
                     });

                    
                    // Update User's shopping cart array
                    let isUserUpdated = await User.findById(user)
                        .then(user => {

                            console.log(user)

                            try {

                                // Find the specific order element from the shopping cart array
                            let cart = user.shoppingCart

                            cart.splice(cart.findIndex(({orderId}) => orderId == reqParams), 1);
    
                            console.log(user)

                                 // return the saved info in the order   
                                return user.save()
                                    .then((user, error) => {
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
                            }

                        }).catch(err => {
                            return err
                        });

                            // Extract the product ID from the found order
                            let orderdetails = await productIdFromSpecOrder(reqParams)
                                .then(result => {

                                    return result

                                }).catch(err => {
                                    return err
                                });

                        // console.log(orderdetails)

                        // Update Product's order cart array
                        let isProductUpdated = await Product
                            .findById(orderdetails)
                            .then(product => {
                                console.log(product)

                                try {

	                                    
                                 // Find the specific order element from the shopping cart array
                               
                                let cart = product.orderCart
                                cart.splice(cart.findIndex(({orderId}) => orderId == reqParams), 1);
        
                                console.log(product)

                                     // return the saved info in the order   
                                    return product.save()
                                        .then((user, error) => {
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
                                }


                            }).catch(err => {
                                return err
                            });
                
                    // is the Users' shopping cart array and Products' order list cart updated?
                    if(isUserUpdated && isProductUpdated) {
                        console.log(reqParams)

                                // Deleting the order here...
                                let longAwaitedResult =  await Order.deleteOne({ _id: { $eq: reqParams } })
                                    .then((order, error) => {

                                        if(error) {
                                            return false
                                        } else {
                                            return `Your Order Cancellation is Successful!
                                            You have cancelled your order reference #${reqParams._id}`
                                        }

                                    }).catch(err => {
                                        return err
                                    });

                                console.log(longAwaitedResult)
                                return longAwaitedResult

                    } else {

                        return `Cancellation unsuccessful`             
                    
                    }

                }).catch(err => {
                    return err
                })

            // console.log(canceledOrder)                
            return canceledOrder

            }
        } catch (error) {
             return error
         }
    }  catch (error) {
        return error
    }
};
    				
// Retrieving ALL Orders (ADMIN ONLY)
module.exports.showOrders = () => {

    try {
	// Find all orders
	    return Order.find({})
	        .then(result => {
	            if (result == null) {
	                return false
	            } else {
	                return result
	            }

		}).catch(err => {
            return err
        });

    } catch (error) {
        return error
    };
};

// Retrieving user's Cart of Orders
module.exports.whatsInMyCart = (user) => {
    
   try {
	 // Find and return all the orders of the user in reqparams
	    let shopCart = User.findById(user)
	        .then(result => {
	            
	            return result.shoppingCart

	        }).catch(err => {
            return err
            });
	
	    return shopCart

    } catch (error) {
        return error
    }
   
};





// GLOBAL FUNCTIONS:

// Function to find and call a specific order data
function callOrder(orderId) {
    let orderData = Order.findById(orderId)
    .then(order => {
        return order
    })
    
    return orderData
}
// Function to find and call a specific product ordered inside a shopping/order cart
async function callSpecificOrder(result, prodId) {
    try {

	 let container = await result.productCart.find(prod => prod.productId === prodId)

            console.log(container)
            return container

} catch (error) {
    return error
	
}
}

// Function to find and call a specific product ordered inside a shopping/order cart
function checkAvailability(arr, val) {
    console.log(`array ${arr}`)
    console.log(val)
    let temp = arr.some(func => func === val)
    console.log(temp)
    return temp
}

// Function to extract the product ID from the Order
function productIdFromSpecOrder(orderId){
    
    let orderdetails = callOrder(orderId)
    .then(order => {

        if(order) {
            let productIdfromOrder = order.productCart.map(({productId}) => productId);
            return productIdfromOrder
        } else {
            return null
        }
        
    })
    console.log(orderdetails)
    return orderdetails
    
}

// Function to find out if a product previously exists/has been ordered before in an order cart
function doesProductExist(reqParams, reqBody) {
    
    // Find the specific order based on reqParams
    let doesProductExist = callSpecificOrder(reqParams, reqBody)
    .then( async obj => {
        
        let instance = await callOrder(reqParams)
            .then(result => {
                console.log(result)
                let productIdfromOrder = result.productCart.map(({productId}) => productId);
                
                console.log(productIdfromOrder)

                let prod = reqBody._id
                
                
                
                let check = checkAvailability(productIdfromOrder, prod)
                console.log(check)
                return check
            })

       return instance

    })
    console.log(doesProductExist)
    return doesProductExist
}

// Function to automatically set to FALSE a product that has STOCKS <= 0 else isActive true
function checkStocks(specProduct) {
    if(specProduct.stocks <= 0) {
        
       // assign "false" in isActive property
       specProduct.isActive = false

       return specProduct.save()
          .then((product, error) => {
                 if(error) {
                    return false
                 } else {
                    return true
                 }
          }).catch(err => {
                return err
          });

    } else {

        // assign "true" in isActive property
       specProduct.isActive = true

       return specProduct.save()
          .then((product, error) => {
                 if(error) {
                    return false
                 } else {
                    return true
                 }
          }).catch(err => {
                return err
          });

    }
               
}

