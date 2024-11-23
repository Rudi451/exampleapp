/**
 * Benutzerdefinierte Error Class, die einen Fehler mit einem bestimmten HTTP-Statuscode darstellt.
 * @class
 * @extends {Error}
 * @param {string} message
 * @param {number} statusCode
 */
class CatchError extends Error {
	constructor(message, statusCode) {
		super(message);
		this.errorCode = statusCode;
	}
}

export default CatchError;
