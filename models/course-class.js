import validator from 'validator';
import path from 'path';
import fs from 'fs/promises';

import CatchError from './catch-error.js';

const PATH_COURSES_JSON = path.join(process.cwd(), '.', 'data', 'courses.json');

export default class Course {
	constructor() {}
	/**
	 * Validierung ob ein wert Id ist
	 * @param {*} courseId
	 * @returns {boolean}
	 */
	static ValidateById(courseId) {
		if (!validator.isUUID(courseId)) {
			return false;
		} else {
			return true;
		}
	}
	/**
	 * Kurs von User holen
	 * @param {*} courseId
	 * @returns {Object, CatchError} mit Kurs oder mit Fehler
	 */
	static async getCourseById(courseId) {
		const jsonStr = await fs.readFile(PATH_COURSES_JSON, 'utf-8');
		const courses = JSON.parse(jsonStr);

		const foundCourse = courses.find((course) => course.courseId === courseId);
		if (!foundCourse) {
			return new CatchError(
				`Kein Course mit CourseId ${courseId} gefunden`,
				404
			);
		}
		return foundCourse;
	}
	/**
	 * Kurs Kosten holen
	 * @param {*} courseId
	 * @returns {string} mit Preis
	 */
	static async getAmountById(courseId) {
		const course = await this.getCourseById(courseId);

		return course.price;
	}
}
