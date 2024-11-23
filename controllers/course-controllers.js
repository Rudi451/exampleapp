import CatchError from '../models/catch-error.js';
import fs from 'fs/promises';
import path from 'path';

const PATH_COURSES_JSON = path.join(process.cwd(), './data', 'courses.json');
const PATH_USERS_JSON = path.join(process.cwd(), './data', 'users.json');

export const getAllCourses = async (req, res, next) => {
	try {
		const jsonData = await fs.readFile(PATH_COURSES_JSON, 'utf-8');
		const courses = JSON.parse(jsonData);
		res.send(courses);
	} catch (err) {
		return next(new CatchError('Server Error by loading courses list', 500));
	}
};
