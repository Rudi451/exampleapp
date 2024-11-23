import {Router} from 'express';
import express from 'express';
import {body} from 'express-validator';
import path from 'path';
import {
	checkUserFields,
	getMyUserData,
	updateMyUserData,
	deleteMyUserData,
	validateReqData,
} from '../controllers/users-controllers.js';

import {
	redirectMembersHome,
	ensureLoggedIn,
} from '../middlewares/member-routers-helpers.js';

import User from '../models/user-class.js';

const router = new Router();
const _user = new User();

// geschützte Profil Seite (dashboard)
router.use('/', express.static('private'));
router.get('/', redirectMembersHome);
/**
 * router /myUserData werden alle Methoden 'MethodChaining' gemacht
 */
router
	.route('/myUserData')
	.get(
		(req, res, next) => {
			console.log('get/myUserData');
			console.log('session: ', req.session);
			next();
		},
		ensureLoggedIn,
		getMyUserData
	)
	.put(ensureLoggedIn, validateReqData, updateMyUserData)
	.delete(ensureLoggedIn, deleteMyUserData);
//
/**
 * /checkUserFields
 */
router.post('/checkUserFields', ensureLoggedIn, checkUserFields);
//
/**
 * /logout
 */
router.post('/logout', ensureLoggedIn, async (req, res) => {
	req.session.loggedIn = false;
	console.log('		req.session.loggedIn =', req.session.loggedIn);
	res.redirect('/');
});
//
export default router;
