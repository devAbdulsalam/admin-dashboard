import cloudinary from 'cloudinary';
import bcrypt from 'bcryptjs';
import validator from 'validator';
import User from '../models/User.js';
// const Wallet = require('../models/walletModel');
import jwt from 'jsonwebtoken';
// import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

import { uploadMiddleware } from '../utils/uploadMiddleware.js';

// // responsivehtmlemail.com, maizzle
import nodemailer from 'nodemailer';

const createToken = (_id, time) => {
	return jwt.sign({ _id }, process.env.SECRET, { expiresIn: time || '3d' });
};

// Configure Cloudinary with your account details
cloudinary.v2.config({
	cloud_name: process.env.CLOUD_NAME,
	api_key: process.env.API_KEY,
	api_secret: process.env.API_SECRET,
});

// const file = 'path/to/image.jpg';
// const options = {
// 	public_id: 'user_image',
// };

// email config

// // login user
export const loginUser = async (req, res) => {
	const { email, password } = req.body;
	try {
		// if (!email && !password) {
		// 	res.status(404).json({ error: 'All fields must be filled');
		// }

		// let user = await User.findOne({ email });

		// if (!user) {
		// 	res.status(404).json({ error: 'email or password is incorrect!!');
		// }
		// if(user){
		// const match = bcrypt.compare(password, user.password);
		// if (!match) {
		// 	res.status(404).json({ error: 'email or password is incorrect!');
		// }
		// }
		// retrieve user and wallet and transaction history
		const user = await User.login(email, password);
		// const wallet = await Wallet.findOne({ userId: user._id });
		// const transaction = await Transaction.find({ userId: user._id });
		// create a token
		const token = createToken(user._id);

		res.status(200).json({
			user,
			token,
			message: 'Log in successfully',
		});
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};

// // signinUser
export const signinUser = async (req, res) => {
	const { name, email, password } = req.body;
	console.log(req.body);
	try {
		if (!name) {
			res.status(404).json({ error: 'Name is required' });
		}
		if (!password) {
			res.status(404).json({ error: 'Password is required' });
		}
		if (!email) {
			res.status(404).json({ error: 'Email Number is required' });
		}

		if (!(password.length > 4)) {
			res.status(404).json({ error: 'Input a strong password' });
		}

		const emailexists = await User.findOne({ email });

		if (emailexists) {
			res.status(404).json({ error: 'Email Address already Exists' });
		}

		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const user = await User.create({ name, email, password: hash });
		// create a token
		const token = createToken(user._id);

		res.status(200).json({
			user,
			token,
			message: 'Account created successfully',
		});
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};

// // update user profile with image or without image
export const updateProfile = async (req, res) => {
	uploadMiddleware(req, res, async (err) => {
		if (err instanceof multer.MulterError) {
			return res.status(400).json({ error: err.message });
		} else if (err) {
			return res.status(500).json({ error: err.message });
		}

		const { id } = req.body;
		const formData = req.body;
		const image = req.file;

		// Extract data from the formData object
		const { name, address, phone, email, token } = formData;

		try {
			if (image) {
				const savePath = image.path;
				// Upload the image to Cloudinary
				const result = await cloudinary.uploader.upload(savePath);
				// Delete the local file after successful upload to Cloudinary
				fs.unlinkSync(savePath);
				// Update the user with the Cloudinary image URL
				image = result.secure_url;
			}
			const verify = jwt.verify(token, process.env.SECRET);
			if (!verify) {
				return res.status(401).json({ error: 'verification failed' });
			}
			let user = await User.findByIdAndUpdate(
				id,
				{
					image: image ? image.path : undefined,
					name,
					address,
					phone,
					email,
				},
				{ new: true }
			);

			res
				.status(200)
				.json({ user, token, message: 'User profile updated successfully' });
		} catch (error) {
			// Delete the local file in case of an error
			if (image) {
				const savePath = image.path;
				fs.unlinkSync(savePath);
			}

			res.status(500).json({ error: error.message });
		}
	});
};

// // update user profile with image
export const updateProfileImage = async (req, res) => {
	const { name, phone, email, address } = JSON.parse(req.body.user);
	console.log(name, phone, email, address);
	try {
		const image = req.files.image;
		const fileName = new Date().getTime().toString() + path.extname(image.name);
		const savePath = path.join(__dirname, 'public', 'uploads', fileName);
		await image.mv(savePath);
		let user = await User.findOne({ _id: id });
		if (!user) {
			res.status(404).json({ error: 'user does not exist!!' });
		}
		if (user) {
			user.name = name || req.body.name || user.name;
			user.phone = phone || req.bodyphone || user.phone;
			user.address = address || req.body.address || user.address;
			user.email = email || req.body.email || user.email;
			user.image = fileName;
		}
		user = await user.save();
		res.status(200).json({ message: 'image upload Successfully' });
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};
// update user without image
export const updateUserProfile = async (req, res) => {
	const { name, phone, email, address } = JSON.parse(req.body.user);
	console.log(name, phone, email, address);
	try {
		const image = req.files.image;
		const fileName = new Date().getTime().toString() + path.extname(image.name);
		const savePath = path.join(__dirname, 'public', 'uploads', fileName);
		await image.mv(savePath);
		let user = await User.findOne({ _id: id });
		if (!user) {
			res.status(404).json({ error: 'user does not exist!!' });
		}
		if (user) {
			user.name = name || req.body.name || user.name;
			user.phone = phone || req.bodyphone || user.phone;
			user.address = address || req.body.address || user.address;
			user.email = email || req.body.email || user.email;
			user.image = fileName;
		}
		user = await user.save();
		res.status(200).json({ message: 'image upload Successfully' });
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};

// // // update user Password
export const updatePassword = async (req, res) => {
	const { id, token, password, confirmPassword } = req.body;
	try {
		// // verify the token
		const verify = jwt.verify(token, process.env.SECRET);
		if (!verify) {
			return res.status(401).json({ error: 'verification failed' });
		}
		if (verify) {
			const newpassword = await User.changepsw(id, password, confirmPassword);

			let user = await User.findByIdAndUpdate(
				{ _id: id },
				{ password: newpassword },
				{ new: true }
			);
			res.status(200).json({ user, message: 'Password Changed Successfully' });
		} else {
			res.status(401).json({ status: 401, message: 'user not exist' });
		}
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};
// // // forget Password
export const forgetPassword = async (req, res) => {
	const { email } = req.body;
	try {
		const user = await User.fgtpswd(email);
		// create a token
		const token = createToken(user._id, '10m');
		const link = `${process.env.BASE_URL}/reset-password/${token}`;

		const mailoption = {
			from: 'ammuftau74@gmail.com', // sender address
			to: email, // receivers address
			subject: 'Email for Password Reset', // Subject line
			text: `This Link is valid for 10 Minutes ${link}`, // plain text body
			html: `<p>This Link is valid for 10 Minutes ${link}</p>`,
		};
		nodemailer
			.createTransport({
				service: 'gmail',
				auth: {
					user: process.env.EMAIL,
					pass: process.env.PASSWORD,
				},
			})
			.sendMail(mailoption, (error, info) => {
				if (error) {
					// console.log(error, 'error');
					res.status(401).json({ error: error });
				} else {
					// console.log(info.response, 'success');
					res.status(200).json({
						token,
						info,
						message: 'Password reset link sent successfully',
					});
				}
			});
	} catch (error) {
		res.status(404).json({ error: error });
	}
};

// // // reset Password
export const resetPassword = async (req, res) => {
	const { token } = req.params;
	try {
		// let user = await User.find({ _id: id });

		// if (!user) {
		// 	res.status(404).json({ error: 'Invald verification link!');
		// }
		// // verify the token
		const verify = jwt.verify(token, process.env.SECRET);

		if (!verify) {
			res.status(404).json({ error: 'verification failed' });
		}
		res
			.status(200)
			.json({ verify, token, message: 'Password Reset Successfully' });
	} catch (error) {
		res.status(401).json({ error: error, message: 'Something went wrong' });
	}
};

// // // change Password
export const changePassword = async (req, res) => {
	const { token, password, confirmPassword } = req.body;
	try {
		// // verify the token
		const verify = jwt.verify(token, process.env.SECRET);
		if (!verify) {
			return res.status(401).json({ error: 'verification failed' });
		}
		if (verify) {
			const newpassword = await User.changepsw(
				{ _id: verify._id },
				password,
				confirmPassword
			);

			let user = await User.findByIdAndUpdate(
				{ _id: verify._id },
				{ password: newpassword },
				{ new: true }
			);
			res.status(200).json({ message: 'Password Changed Successfully' });
		} else {
			res.status(401).json({ status: 401, message: 'user not exist' });
		}
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};

// // // delete user
export const deleteUser = async (req, res) => {
	const { id, token } = req.body;
	try {
		// // verify the token
		const verify = jwt.verify(token, process.env.SECRET);
		if (!verify) {
			return res.status(401).json({ error: 'verification failed' });
		}
		if (verify) {
			let user = await User.findByIdAndDelete({ _id: id });
			// let wallet = await Wallet.findByIdAndDelete({ userId: user._id });
			// let transaction = await Transaction.findByIdAndDelete({
			// 	userId: user._id,
			// });

			user = await user.save();
			res.status(200).json({ message: 'Account Deleted Successfully' });
		} else {
			res.status(401).json({ status: 401, message: 'user not exist' });
		}
	} catch (error) {
		res.status(404).json({ error: error.message });
	}
};

// s const {
// 	signinUser,
// 	loginUser,
// 	updateProfile,
// 	updateImage,
// 	forgetPassword,
// 	resetPassword,
// 	changePassword,
// 	deleteUser,
// };
