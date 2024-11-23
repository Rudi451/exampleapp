import CatchError from '../models/catch-error.js';
import Payment from '../models/payment-class.js';
import User from '../models/user-class.js';

export const makeNewPayment = async (req, res, next) => {
	const user = await User.getMyUserData(req.session.username);
	const userId = user.userId;
	const {courseId, paymentMethod} = req.query;
	//checken ob der User schon den Kurs gekauft hat
	const courseExists = user.payments.find(
		(payment) => payment.courseId === courseId
	);
	if (courseExists) {
		return next(
			new CatchError(
				`User ${req.session.username} hat schon den Kurs mit ID ${courseId} gekauft`,
				409
			)
		);
	}
	// Payment fake
	if (paymentMethod === 'Paypal') {
		const statusPayment = await Payment.newPayment(
			userId,
			courseId,
			paymentMethod
		);
		if (statusPayment.status === 'COMPLETED') {
			console.log('wasi st statusPayment', statusPayment);
			User.setNewPayment(userId, courseId, statusPayment.id);
			res.send(statusPayment);
		} else {
			return next(
				new CatchError(
					`Payment Failed: 
        Name ${statusPayment.name}
        Message: ${statusPayment.message}
        Debug_ID: ${statusPayment.debug_id}
        Details:${JSON.stringify(statusPayment.details)}`,
					422
				)
			);
		}
	}
};

export const checkPayment = async (req, res, next) => {
	const paymentValid = await Payment.checkPaymentByUser(
		await User.getMyUserId(req.session.username),
		req.query.paymentId
	);
	res.send(paymentValid);
};

export const getAllPayments = async (req, res, next) => {
	const userId = await User.getMyUserId(req.session.username);
	res.send(await Payment.getPayments(userId));
};
