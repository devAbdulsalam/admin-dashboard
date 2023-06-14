import express from 'express';
const router = express.Router();
// const requireAuth = require('../middleware/requireAuth');
import {
	signinUser,
	loginUser,
	updateProfile,
	updateUserProfile,
	updateProfileImage,
	forgetPassword,
	resetPassword,
	changePassword,
	updatePassword,
	deleteUser,
} from '../controllers/user.js';

// // get user
router.post('/login', loginUser);

// //new user
router.post('/signup', signinUser);

// //forgetPassword
router.post('/forget-password', forgetPassword);

// // //resetPassword
router.get('/reset-password/:token', resetPassword);

// // //change Password
router.post('/change-password', changePassword);

// // //update Password
router.post('/update-password', updatePassword);

// // //update Password
router.put('/update-profile', updateProfile);

// // //update user profile with image or without image
router.put('/update-user-profile', updateUserProfile);

// // //update user profile with image
router.put('/update-profile-image', updateProfileImage);

// Authenticate user
// router.use(requireAuth);

// //new user
// router.post('/update', updateProfile);

router.delete('/delete-account', deleteUser);

export default router;
