const User = require('../models/User');
const bcrypt = require("bcrypt");
const auth = require("../auth");

// Checking Email
module.exports.checkEmailExists = (reqBody, res) => { 
	// The result is sent back to the frontend via the "then" method found in the route file
	return User.find({email: reqBody.email}).then(result => {
		console.log(result.length)
		// The "find" method returns a record if a match is found
		if(result.length > 0) {
			return true
		// No duplicate email found
		// The user is not yet registered in the database
		} else {
			return false
		}
	})
	.catch(error => res.send(error.stack))
};

// User Registration
module.exports.registerUser = (reqBody) => {

    try {

        // Find out if the email already exists in the system
        return User.findOne({email: reqBody.email})
                .then(user => {
                    
                    // If user is null...
                    if(user === null) {
                        
                        // Assign values 
                        let newUser = new User({
                            email: reqBody.email,
                            username: reqBody.username,
                            password: bcrypt.hashSync(reqBody.password, 10),
                            firstName: reqBody.firstName,
                            lastName: reqBody.lastName,
                            mobileNo: reqBody.mobileNo
                        });
                    
                    // Save the newUser details
                    return newUser.save()
                        .then((user, error) => {
                
                            if(error) {
                                return false
                            } else {
                                return true
                            }

                        }).catch(err => {
                            return err.stack
                        });
                        
                        // If the email already exists..
                    } else if(user.email === reqBody.email) {

                        return false
                        
                    }

	    }).catch(err => {
            return err.stack
        });
	
    } catch(error) {
        return error.stack
    };
};

// User Log in and Authentication
module.exports.loginUser = (reqBody) => {

	try {

        // Find the user using email 
        return User.findOne({email: reqBody.email})
            .then(result => {

                // If result is null..
                if(result == null) {
                    console.log(result)
                    return false

                } else {
                    
                    // Encrypt the password
                    const isPasswordCorrect = bcrypt.compareSync(reqBody.password, result.password)

                    // Is the password corect?
                    if(isPasswordCorrect){
                        
                        // return the JWT Access
                        return {access: auth.createAccessToken(result)}
                    } else {
                        // Password incorrect
                        return false
                    };

                };

        }).catch(err => {
            return err.stack
        });

    } catch (error) {
        return error.stack
    };

};

// Retreive user details
module.exports.getProfile = (userData) => {
	return User.findById(userData.id).then(result => {
		// console.log(data.userId);
		// console.log(result);
		
		if (result == null) {
			return false
		} else {
			result.password = "*****"

			// Returns the user information with the password as an empty string or asterisk.
			return result
		}
	})
};


//Retrieving User Details (Admin ONLY)
module.exports.userDetails = () => {

    try {
            // Find the ALL user details and show
            return User.find({})
                .then(result => {

                    // If the result is null..
                    if (result == null) {

                        return false

                    } else {
                        // Assign **** to the found user details
                        result.password = `*****`
                        // Show the result
                        return result

                    }
            }).catch(err => {
                return err.stack
            })
    } catch (error) {
        return error.stack
    }
};

//Retrieving All Users with ADMIN status (Admin ONLY)
module.exports.showAllAdmins = () => {

	try {

        // Find the ALL admins' details and show
        return User.find({isAdmin: true})
            .then(result => {

                 // If the result is null..
                if (result == null) {

                    return false

                } else {

                        return result
                }

            }).catch(err => {
                return err.stack
            })

    } catch (error) {
        return error.stack
    }
};

//Enabling Admin Status (Admin ONLY)
module.exports.enableAdmin = (reqBody) => {

    try {

	// Find the user using USERiD 
	    return User.findOne({_id: reqBody.userId})
	    .then(result => {
	
	        // Assign the isAdmin as "true"
	        result.isAdmin = true
	        
	        return result.save()
	    })
	    .catch(err => {
	        return err.stack
	    });
		
    } catch (error) {
        return error.stack
    };
    
};

