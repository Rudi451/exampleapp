import {Router} from 'express';
import path from 'path';

import {ensureLoggedIn} from '../middlewares/member-routers-helpers.js';

import {getAllCourses} from '../controllers/course-controllers.js';

const router = new Router();

const PATH_COURSES_JSON = path.join(process.cwd(), '.', 'data', 'courses.json');
const PATH_USERS_JSON = path.join(process.cwd(), '.', 'data', 'users.json');

router.get('/', getAllCourses);

export default router;
