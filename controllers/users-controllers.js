import {body} from 'express-validator';
import path from 'path';

import {validationResult, matchedData} from 'express-validator';

import CatchError from '../models/catch-error.js';
import User from '../models/user-class.js';
import {isLoggedIn} from '../middlewares/member-routers-helpers.js';

const PATH_USERS_JSON = path.join(process.cwd(), '.', 'data', 'users.json');
//
/**
 * wenn User gefunden und die Password stimmt überein, dann wird es bearbeitet, sonst bekommt man eine Fehler
 */
const checkUserFields = async (req, res, next) => {
	const userId = req.session.userId;
	try {
		//den fields validator durchführen
		const fieldsValidResult = await User.checkEmptyFields(userId);
		//senden zurück die leere Felder
		res.send({EmptyFields: fieldsValidResult});
	} catch (err) {
		console.log('Server error in user checking area: ', err);
		return next(new CatchError(`${err.massage ?? err}`, 500));
	}
};
/**
 * User data holen, man sollte eingeloggt sein und der username in session gespeichert haben
 */
const getMyUserData = async (req, res, next) => {
	const data = await User.getMyUserData(req.session.username);
	res.json(data);
};

/**
 * User Data erneuern, man sollte eingeloggt sein und der username in session gespeichert haben
 */
const updateMyUserData = async (req, res, next) => {
	console.log('was ist req.body', req.body);
	try {
		const validatedData = valid(req, res, next);
		if (validatedData instanceof CatchError) {
			return next(validatedData);
		}
		console.log('validateDta:', validatedData);
		const data = await User.updateUserData(req.session.username, validatedData);
		if (data instanceof CatchError) {
			// console.log('User updaten error');
			return next(data);
		} else {
			// console.log('typeof data', data);
			res.send(data);
		}
	} catch (err) {
		return next(new CatchError('Fehler beim User Data Aktualisierung'));
	}
};
/**
 * User data löschen, man sollte eingeloggt sein und der username in session gespeichert haben
 */
const deleteMyUserData = async (req, res, next) => {
	const data = await User.deleteUserData(req.session.username);
	res.send(data);
};

/**
 * Weiterleiten wenn ein Eingeloggte User auf Login-page Landet
 * @param {*} req
 * @param {*} res
 * @param {*} next
 */
const redirectIfLogged = (req, res, next) => {
	console.log(req.session);
	console.log('in redirect redirectIfLogged');
	if (isLoggedIn(req)) res.redirect('/api/users/members');
	else next();
};

/**
 *Login Funktion
 *username und password im req.body erforderlich
 */
const login = async (req, res, next) => {
	// console.log('was ist req.body', req.body);
	// Validiere Formulardaten
	const {username, password} = valid(req, res, next);

	const data = await User.checkUserLogin(username, password);
	if (data.loggedIn) {
		req.session.loggedIn = data.loggedIn;
		req.session.userId = data.userId;
		req.session.username = data.username;
		delete req.session.password;
		res.redirect('/api/users/members');
	} else {
		return next(new CatchError('Login failed', 422));
	}
};
/**
 *Login Funktion
 *username, password und email im req.body erforderlich
 */
const register = async (req, res, next) => {
	try {
		// Validiere Formulardaten
		// if (valid(req) instanceof CatchError) {
		// 	return next(valid(req));
		// }
		const {username, password, email} = valid(req, res, next);
		const userCreate = await User.create(username, password);
		if (email) {
			await User.updateUserData(username, {email});
		}
		if (userCreate.created === true) {
			req.session.loggedIn = userCreate.loggedIn;
			req.session.userId = userCreate.userId;
			req.session.username = userCreate.username;
			delete req.session.password;
			res.redirect('/api/users/members');
		} else if (userCreate instanceof CatchError) {
			console.log('User creating error:', userCreate);
			next(userCreate); // Falls ein Fehler Object kommt -> weiterleiten
		} else {
			next(new CatchError('Internal Server Error', 500));
		}
	} catch (err) {
		// Programmfehler Server
		console.log('Server error in register area: ', err);
		return next(new CatchError('Registrierung failed', 422));
	}
};
//
/**
 * Validierung Daten im Register Post-Request
 * Falls nicht erfolgreich gibt an server ein Error mit message and statuscode
 * @returns {Object} with data aus req.body
 */
const valid = (req, res, next) => {
	const result = validationResult(req);
	if (!result.isEmpty()) {
		let resultJson = [];
		console.log('was ist result', result);
		result.errors.forEach((element) => {
			resultJson.push({
				field: element.path,
				message: element.msg,
			});
		});
		return new CatchError(JSON.stringify(resultJson), 422);
	}
	const matchedDataBuff = matchedData(req);
	console.log('was ist matchecData', matchedDataBuff);
	return matchedData(req);
};
//
/**
 * Middleware zur Validierung von Anfrage-Daten
 */
const validateReqData = [
	body('email')
		.optional()
		.trim()
		.escape()
		.isLength({min: 2, max: 50})
		.withMessage('Email must be between 2 and 50 characters')
		.isEmail()
		.withMessage('Please provide a valid email address')
		.normalizeEmail(),

	body('name')
		.optional()
		.trim()
		.escape()
		.isLength({min: 2, max: 50})
		.withMessage('Name must be between 2 and 50 characters')
		.matches(/^[A-Za-z\s]+$/)
		.withMessage('Name must contain only letters and spaces'),

	body('age')
		.optional()
		.trim()
		.escape()
		.isNumeric()
		.isInt({min: 1, max: 99})
		.withMessage('Age must be a number between 1 and 99')
		.isLength({max: 3})
		.withMessage('Age must be at most 3 digits long'),

	body('powerLevel')
		.optional()
		.isIn(['medium', 'high', 'low'])
		.withMessage('PowerLevel must be one of: medium, high, low'),
];

//
//

export {
	checkUserFields,
	getMyUserData,
	updateMyUserData,
	deleteMyUserData,
	validateReqData,
	login,
	register,
	redirectIfLogged,
};
