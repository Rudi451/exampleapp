import {fakerDE_AT as faker} from '@faker-js/faker';
import Course from './course-class.js';
import CatchError from './catch-error.js';
import fs from 'fs/promises';
import path from 'path';
import User from './user-class.js';
import validator from 'validator';

const PATH_PAYMENTS_JSON = path.join(
	process.cwd(),
	'.',
	'data',
	'payments.json'
);

export default class Payment {
	constructor() {}

	/**
	 *
	 * @param {*} userId
	 * @param {*} courseId
	 * @param {*} paymentMethod
	 * @returns {Object} Erfolgreiche Zahlung Beispiel:  {  id,
				status: 'COMPLETED',
				purchase_units: [
					{	amount,
						status: 'COMPLETED',

						courseId,
						userId,	}, ], }
	 * @returns {Object} Misserfolgene Zahlung: {	name: 'INVALID_RESOURCE_ID',
				message: 'The requested resource ID was not found',
				debug_id: '1234567890',
				details: { userId, courseId, date: new Date() }, };
	 */
	static async newPayment(userId, courseId, paymentMethod) {
		if ((await Course.getCourseById(courseId)) instanceof CatchError) {
			return new CatchError('KursId ist falsch', 404);
		}

		const paymentStatus = await this.fakePayment(
			userId,
			courseId,
			await Course.getAmountById(courseId)
		);
		let paymentObj;
		if (paymentStatus.name === 'INVALID_RESOURCE_ID') {
			paymentObj = paymentStatus;
		} else {
			//egal ob Fail oder Erfolg -> eine Payment initialisieren und speichern
			const units = [];
			paymentStatus.purchase_units.forEach((el) => {
				units.push(el);
			});
			paymentObj = {
				paymentId: paymentStatus.id,
				paymentMethod,

				dateOfPayment: new Date(),
				status:
					paymentStatus.status ||
					`${paymentStatus.name} / ${paymentStatus.message}`,
				units: units || null,
			};
		}
		const paymentsListStr = await fs.readFile(PATH_PAYMENTS_JSON, 'utf-8');
		const payments = JSON.parse(paymentsListStr);
		payments.push(paymentObj);
		await fs.writeFile(
			PATH_PAYMENTS_JSON,
			JSON.stringify(payments, null, 2),
			'utf-8'
		);
		return paymentStatus;
	}

	/**
	 * Prüft ob der User die Zahlung gemacht hat
	 * @param {*} userId
	 * @param {*} paymentId
	 * @returns {boolean}
	 */
	static async checkPaymentByUser(userId, paymentId) {
		if (!validator.isUUID(paymentId) || !validator.isUUID(userId)) {
			return false;
		}
		//user holen
		const user = await User.getUserDataById(userId);
		//in user payment den payment finden
		const foundPayment = user.payments.find(
			(payment) => payment.paymentId === paymentId
		);
		//true ausgeben
		if (foundPayment) {
			return true;
		} else {
			// nicht finden -> false
			return false;
		}
	}

	/**
	 * Alle Payments von User als Array holen
	 * @param {*} userId
	 * @returns {Array}
	 */
	static async getPayments(userId) {
		if (!validator.isUUID(userId)) {
			return new CatchError('Ungültige UserId', 500);
		}
		const paymentsListStr = await fs.readFile(PATH_PAYMENTS_JSON, 'utf-8');
		const payments = JSON.parse(paymentsListStr);
		// const foundPayments = payments.filter(
		// 	(payment) => payment.units.userId === userId
		// );
		// const foundPayments = payments.filter((payment) =>
		// 	payment.units.find((unit) => unit.userId === userId)
		// );
		let foundPayments = [];
		payments.forEach((payment, index) => {
			if (payment.units) {
				// console.log('was ist payment', index, ' : ', payment);
				foundPayments.push(
					payment.units.find((unit) => unit.userId === userId)
				);
			}
		});
		return foundPayments;
	}
	/**
	 * payedStatus kann man ändern um eine Fail Payment zu zeigen
	 * @param {*} userId
	 * @param {*} courseId
	 * @param {*} amount
	 * @returns {Object}
	 */
	static fakePayment(userId, courseId, amount) {
		const payedStatus = true;

		if (payedStatus) {
			return {
				id: faker.string.uuid(),
				status: 'COMPLETED',
				purchase_units: [
					{
						amount,
						status: 'COMPLETED',

						courseId,
						userId,
					},
				],
			};
		} else {
			return {
				name: 'INVALID_RESOURCE_ID',
				message: 'The requested resource ID was not found',
				debug_id: '1234567890',
				details: {userId, courseId, date: new Date()},
			};
		}
	}
}
