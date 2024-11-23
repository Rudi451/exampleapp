import {Router} from 'express';

import {ensureLoggedIn} from '../middlewares/member-routers-helpers.js';
import User from '../models/user-class.js';
import Course from '../models/course-class.js';
import {
	makeNewPayment,
	checkPayment,
	getAllPayments,
} from '../controllers/payment-controllers.js';

const router = new Router();
router.get('/', ensureLoggedIn, getAllPayments);
router.get('/checkPayment', ensureLoggedIn, checkPayment);
router.post('/new', ensureLoggedIn, makeNewPayment);

export default router;
