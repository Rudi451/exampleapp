import {v4 as uuidv4} from 'uuid';
import {validationResult, matchedData} from 'express-validator';
import {Router} from 'express';
import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import bcrypt from 'bcrypt';
import validator from 'validator';

import CatchError from '../models/catch-error.js';

const PATH_USERS_JSON = path.join(process.cwd(), '.', 'data', 'users.json');
/**
 * User erzeugen, speichern, ändern und prüfen.
 * Mit Validierung
 */
class User {
	//________________Constructor____________________
	constructor() {}
	//________________________________________________
	//  getUserById()
	static async getUserDataById(userId) {
		//userId validieren
		const validResult = this.validateData({userId});
		if (validResult.valid === false) {
			return new CatchError(validResult.result, 422);
		}
		// den Datei auslesen
		const jsonStr = await fs.readFile(PATH_USERS_JSON, 'utf-8');
		const users = JSON.parse(jsonStr);
		//den User finden
		const foundUser = users.find((user) => user.userId === userId);
		if (!foundUser) {
			return new CatchError(`Kein USer mit UserId ${userId} gefunden`, 404);
		}

		// die von gefundene User alle Daten retournieren
		return foundUser;
	}
	// #end getUser()
	//________________ #start create() _______________
	/**
	 * neue User samt Daten asynchron ins Datei anlegen
	 * @param {*} username
	 * @param {*} password
	 * @return {boolean} true or error
	 */
	static async create(username, password) {
		const validResult = this.validateData({username, password});
		if (validResult.valid === false) {
			return new CatchError(validResult.result, 422);
		}
		//
		const jsonStr = await fs.readFile(PATH_USERS_JSON, 'utf-8');
		const users = JSON.parse(jsonStr);

		if (users.find((user) => user.username === username)) {
			console.log('User ist schon vorhanden');

			return new CatchError('Username is already exist', 409);
		}
		// Falls User neu - initialisieren und speichern:
		const passwordHash = await bcrypt.hash(password, 10);

		const userObj = {
			userId: uuidv4(),
			username,
			password: passwordHash,
			email: '',
			name: '',
			age: '',
			powerLevel: '',
			payments: [],
		};
		users.push(userObj);
		try {
			await fs.writeFile(PATH_USERS_JSON, JSON.stringify(users));
			return {
				created: true,
				loggedIn: true,
				userId: userObj.userId,
				username: userObj.username,
			};
		} catch (err) {
			console.log('Server error in register area, in user class: ', err);
			return new CatchError('Registrierung failed', 422);
		}
	}
	//___________________________#end create() _________________
	//
	//#start login
	static async checkUserLogin(username, password) {
		const validResult = this.validateData({username, password});
		if (validResult.valid === false) {
			return new CatchError(validResult.result, 422);
		}
		try {
			const jsonStr = await fs.readFile(PATH_USERS_JSON, 'utf-8');
			const users = JSON.parse(jsonStr);
			const userFound = users.find((user) => user.username === username);

			if (userFound) {
				// Username gefunden
				const result = await bcrypt.compare(password, userFound.password);
				if (result) {
					// User und Passwort stimmen überein, Login erfolgreich
					return {
						loggedIn: true,
						userId: userFound.userId,
						username: userFound.username,
					};
				} else {
					// User und Passwort stimmen NICHT überein
					console.log('User und Passwort stimmen nicht überein ');
					return new CatchError('Login failed', 404);
				}
			} else {
				// Kein User mit diesem Username gefunden
				console.log('Kein User gefunden ');
				return new CatchError('Login failed', 404);
			}
		} catch (err) {
			console.log('Server error in login area: ', err);
			return new CatchError('Login failed', 422);
		}
	}
	//#end login

	//
	//__________________________ #start Getters ___________________
	/** Asynchron,das Ganze Data vom User mit username und password bekommen
	 * @param {*} username required
	 * @returns {Object} UserData or Error
	 */
	static async getMyUserData(username) {
		return this.handleUserData(username, 'getMyUserData');
	}

	/** Asynchron, eine Id vom User mit username und password bekommen
	 * @param {*} username required
	 * @returns UserId or Error
	 */
	static async getMyUserId(username) {
		return this.handleUserData(username, 'getMyUserId');
	}

	//__________________________ #end   Getters ___________________
	//
	//__________________________ #start Setters ___________________
	/**
	 * Die User Daten ändern
	 * @param {*} username
	 * @param {Object} updatedFields: {"name", "age", "email","powerLevel"}
	 * @returns
	 */
	static async updateUserData(username, updatedFields) {
		// console.log('updatedFields', Object.keys(updatedFields).length);
		if (Object.keys(updatedFields).length === 0) {
			return new CatchError('Nichts zu ändern im Profil', 422);
		} else {
			return this.handleUserData(username, 'update', updatedFields);
		}
	}
	static async setNewPayment(userId, courseId, statusPaymentId) {
		const updatedFields = {userId, courseId, statusPaymentId};
		const user = await this.getUserDataById(userId);
		return this.handleUserData(user.username, 'updatePayment', updatedFields);
	}
	static async deleteUserData(username) {
		return this.handleUserData(username, 'delete');
	}
	//__________________________ #end   Setters ___________________
	/**
	 * Asynchron, Den UserDaten auf leere Felder prüfen
	 * @param {*} userId
	 * @returns {json} json mit die Liste
	 */
	static async checkEmptyFields(userId) {
		try {
			const jsonStr = await fs.readFile(PATH_USERS_JSON, 'utf-8');
			const users = JSON.parse(jsonStr);
			const userFound = users.find((user) => user.userId === userId);

			console.log('validateFields: ');
			const emptyFields = [];

			// Überprüfen auf leere Felder
			if (!userFound.userId) emptyFields.push('userId');
			if (!userFound.username) emptyFields.push('username');
			if (!userFound.email) emptyFields.push('email');
			if (!userFound.password) emptyFields.push('password');
			if (!userFound.name) emptyFields.push('name');
			if (!userFound.age) emptyFields.push('age');
			if (!userFound.powerLevel) emptyFields.push('powerLevel');

			return emptyFields;
		} catch (err) {
			console.log('Server error in user checking for empty fields area: ', err);
			return new CatchError(`${err.massage ?? err}`, 500);
		}
	}
	//
	// ___________________#start Funktionalität des Classes_______
	static async handleUserDataById(userId) {
		try {
			const jsonStr = await fs.readFile(PATH_USERS_JSON, 'utf-8');
			const users = JSON.parse(jsonStr);

			const {userId, username, email, password, name, age, powerLevel} =
				users.find((user) => user.userId === userId);
		} catch (err) {
			console.log(err);
			return new CatchError(err.massage, 404);
		}
	}
	/**
	 * Haupt Funktion des Klasse: abhängig von eingaben wird ein Get oder Set Funktionalität durchgeführt
	 * @param {*} username
	 * @param {string} option
	 * @param {Object} updatedFields
	 * @returns Daten, "true" or Error
	 */
	static async handleUserData(username, option, updatedFields) {
		const validResult = this.validateData(username);
		if (validResult.valid === false) {
			return new CatchError(validResult.result, 422);
		}
		try {
			//user finden
			const jsonStr = await fs.readFile(PATH_USERS_JSON, 'utf-8');
			const users = JSON.parse(jsonStr);
			console.log('users.json path: ', PATH_USERS_JSON);
			const userFoundIndex = users.findIndex(
				(user) => user.username === username
			);
			const userFound = users.find((user) => user.username === username);
			if (userFound) {
				// Username gefunden
				const passwordBuffer = userFound.password;
				delete userFound.password;
				switch (option) {
					case 'getMyUserData':
						return userFound;
					case 'getMyUserId':
						return userFound.userId;
					case 'update':
						const validResult = this.validateData(updatedFields);
						if (validResult.valid === false) {
							return new CatchError(validResult.result, 422);
						}
						// console.log('updatedFields : ', updatedFields);
						try {
							userFound.email = updatedFields.email
								? updatedFields.email
								: userFound.email;
							userFound.name = updatedFields.name
								? updatedFields.name
								: userFound.name;
							userFound.age = updatedFields.age
								? updatedFields.age
								: userFound.age;
							userFound.powerLevel = updatedFields.powerLevel
								? updatedFields.powerLevel
								: userFound.powerLevel;
							userFound.password = passwordBuffer;
							//neue userFound im Datei updaten
							users[userFoundIndex] = {...users[userFoundIndex], ...userFound};
							// console.log(
							// 	'was ist users[userFoundIndex]: ',
							// 	users[userFoundIndex]
							// );
							await fs.writeFile(
								PATH_USERS_JSON,
								JSON.stringify(users, null, 2),
								'utf-8'
							);
							console.log(
								`Benutzer ${userFound.username} erfolgreich aktualisiert`
							);
							return `Benutzer ${userFound.username} erfolgreich aktualisiert`;
						} catch (err) {
							console.log(
								`Fehler beim Benutzer ${userFound.username} Aktualisierung`
							);
							return new CatchError(
								`Fehler beim Benutzer ${userFound.username} Aktualisierung`,
								500
							);
						}
					case 'delete':
						users.splice(userFoundIndex, 1);
						try {
							await fs.writeFile(
								PATH_USERS_JSON,
								JSON.stringify(users, null, 2),
								'utf-8'
							);
							console.log(
								`Benutzer ${userFound.username} erfolgreich gelöscht`
							);
							return `Benutzer ${userFound.username} erfolgreich gelöscht`;
						} catch (err) {
							console.log(`Fehler beim Benutzer ${userFound.username} Löschen`);
							return new CatchError(
								`Fehler beim Benutzer ${userFound.username} Löschen`,
								500
							);
						}
					case 'updatePayment':
						const {userId, courseId, statusPaymentId} = updatedFields;
						const paymentObj = {
							paymentId: statusPaymentId,
							payed: true,
							date: new Date(),
							courseId,
						};
						userFound.password = passwordBuffer;

						userFound.payments.push(paymentObj);

						try {
							users[userFoundIndex] = {...users[userFoundIndex], ...userFound};
							await fs.writeFile(
								PATH_USERS_JSON,
								JSON.stringify(users, null, 2),
								'utf-8'
							);
							console.log(
								`Payment List im Benutzer ${userFound.username} wurde erfolgreich aktualisiert`
							);
							return `Payment ${statusPaymentId} is in User ${userId} successful saved`;
							// }
						} catch (err) {
							return new CatchError(
								'Fehler beim schreiben Payment Object ins Datei',
								500
							);
						}

					default:
						return `You should Set following options: 'getMyUserData', 'getMyUserId', 'update', 'delete'`;
				}
			} else {
				// Kein User mit diesem Username gefunden
				console.log('kein User gefunden ');
				return new CatchError('Getting User Data failed', 404);
			}
			//beim Fehler return error
		} catch (err) {
			console.log('Server error in getMyUserId area: ', err);
			return new CatchError('Getting User Data failed', 422);
		}
	}

	/**
	 * Date Validierung Funktion, hier muss ein object übergeben mit die keys : "username""email""password"	"name"	"age"
	 * "powerLevel"	"payments"	"coursesBooked"
	 * @example mit early-return:
	 * const validResult = this.validateData({username, password});
	 * 		if (validResult.valid === false) {
	 * 			return new CatchError(validResult.result, 422);
	 * 		}
	 * @param {object} data
	 */
	static validateData = (data) => {
		const result = [];
		for (const key in data) {
			switch (key) {
				case 'userId':
					if (!validator.isUUID(data[key])) {
						result.push(`Ungültige UserId`);
					}
					break;
				case 'username':
					if (
						!data[key] ||
						validator.isEmpty(data[key]) ||
						!validator.isLength(data[key], {min: 2, max: 50}) ||
						!validator.matches(data[key], /^[a-zA-Z0-9\s]*$/)
					)
						result.push(
							`Username muss von 2 bis 50 Zeichen erhalten. Sonderzeichen sind nicht erlaubt.`
						);
					break;
				case 'password':
					if (
						!data[key] ||
						validator.isEmpty(data[key]) ||
						!validator.isLength(data[key], {min: 8, max: 80})
					)
						result.push(
							`Passwort muss von 8 bis 50 Zeichen erhalten. Sonderzeichen sind erlaubt.`
						);
					break;
				case 'email':
					if (
						!validator.isEmail(data[key]) ||
						!validator.isLength(data[key], {max: 50})
					)
						result.push(`Überprüfen Sie den Email Eingabe`);
					break;
				case 'name':
					if (!validator.isLength(data[key], {max: 50}))
						result.push(
							`Name darf nicht länger als 50 Zeichen sein und keine Sonderzeichen erhalten `
						);
					break;
				case 'age':
					if (!validator.isInt(data[key]))
						result.push(`Alter kann nur ein Nummer sein`);
					break;
				case 'powerLevel':
					if (!['medium', 'high', 'low'].includes(data[key]))
						result.push(`PowerLevel kann nur 'medium' 'high' oder 'low' sein`);
					break;
			}
		}

		if (result.length > 0) {
			console.log('hier');
			return {valid: false, result};
		} else {
			return {valid: true};
		}
	};
}

export default User;
