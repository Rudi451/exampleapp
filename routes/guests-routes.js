import {Router} from 'express';
import express from 'express';
import {body} from 'express-validator';

import {
	login,
	register,
	redirectIfLogged,
} from '../controllers/users-controllers.js';

const router = new Router();

/**
 * @param username required
 * @param password required
 */
router.post(
	'/login',
	body('username').trim().escape().isLength({min: 2, max: 50}),
	body('password').escape().isLength({min: 8, max: 50}),
	login
);

/**
 * @param username required
 * @param password required
 */
router.post(
	'/register',
	body('username').trim().escape().isLength({min: 2, max: 50}),
	body('password').escape().isLength({min: 8, max: 50}),
	body('email')
		.trim()
		.escape()
		.toLowerCase()
		.optional()
		.isEmail()
		.isLength({min: 4, max: 100}),
	register
);

//
export default router;
