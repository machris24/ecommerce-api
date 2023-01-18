const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require("../auth");

// Route for checking email
router.post("/checkEmail", (req, res) => {
	userController.checkEmailExists(req.body, res).then(resultFromController => res.send(resultFromController)) 
});

// Route for user registration
router.post("/signup", (req, res) => {
	userController.registerUser(req.body).then(resultFromController => res.send(resultFromController))
})

// Route for user log in
router.post("/login", (req, res) => {
	userController.loginUser(req.body).then(resultFromController => res.send(resultFromController))
});

// Retrieve user profile
router.get("/profile", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)
	console.log(req.headers.authorization);

	userController.getProfile({id: userData.id}).then(resultFromController => res.send(resultFromController))
});

// Route for retrieving user details (Admin ONLY)
router.get("/profile/allUsers", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)

	if(userData.isAdmin) {
		userController.userDetails({id: userData.id}).then(resultFromController => res.send(resultFromController))

    } else {
		res.send(`Hi ${userData.username}!. You do not have permission on this page.`)
    }
}); 

// Route for Enabling Admin Status (Admin ONLY)
router.patch("/profile/setAdmin", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)

	if(userData.isAdmin) {
		userController.enableAdmin(req.body).then(resultFromController => res.send(resultFromController))

    } else {
		res.send(`Hi ${userData.username}!. You do not have permission on this page.`)
    }
}); 

// Route for retrieving all ADMINS (Admin ONLY)
router.get("/profile/allAdmins", auth.verify, (req, res) => {

	const userData = auth.decode(req.headers.authorization);
	console.log(userData)

	if(userData.isAdmin) {
		userController.showAllAdmins({isA: userData.id}).then(resultFromController => res.send(resultFromController))

    } else {
		res.send(`Hi ${userData.username}!. You do not have permission of access on this page.`)
    }
}); 



module.exports = router;