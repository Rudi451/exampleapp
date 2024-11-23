import {fakerDE_AT as faker} from '@faker-js/faker';
import validator from 'validator';
import path from 'path';
import fs from 'fs/promises';

import CatchError from '../models/catch-error.js';

const PATH_COURSES_JSON = path.join('./data', 'courses.json');

const generateFitnessCourses = async () => {
	const courses = [];

	const powerLevels = ['low', 'medium', 'high']; // Verschiedene Power Levels
	const studios = ['FitnessLounge', 'HealthGym', 'PowerFit', 'YogaStudio']; // Studios zur Auswahl
	const daysOfWeek = [
		['Mo', 'Mi'],
		['Di', 'Do'],
		['Fr', 'Sa'],
		['Mo', 'Mi', 'Fr'],
	]; // Verschiedene Tage

	for (let i = 0; i < 30; i++) {
		const course = {
			courseId: faker.string.uuid(), // Zufällige Kurs-ID
			name: faker.company.name() + ' Kurs', // Zufälliger Kursname
			description: faker.lorem.sentence(), // Zufällige Beschreibung
			ageFrom: faker.number.int({min: 18, max: 25}), // Zufälliges Alter von
			ageTo: faker.number.int({min: 30, max: 50}), // Zufälliges Alter bis
			powerLevel: faker.helpers.arrayElement(powerLevels), // Zufälliges Power-Level
			startDate: faker.date.future().toISOString().split('T')[0], // Zufälliges Startdatum
			stopDate: faker.date.future({years: 1}).toISOString().split('T')[0], // Zufälliges Enddatum
			dayOfWeek: faker.helpers.arrayElement(daysOfWeek), // Zufällige Tage der Woche
			address: `${faker.location.street()}, ${faker.location.buildingNumber()}`,
			// bookedUsers: [faker.string.uuid()], // Zufällige gebuchte User
			fitnessStudio: faker.helpers.arrayElement(studios), // Zufälliges Studio
			price: faker.commerce.price({min: 10, max: 300, dec: 0, symbol: '€'}),
			location: {
				lat: null, // Zufälliger Längengrad
				lng: null, // Zufälliger Breitengrad
			},
		};
		course.location.lat = studioLocation(course.fitnessStudio)[0];
		course.location.lng = studioLocation(course.fitnessStudio)[1];
		courses.push(course);
	}

	// console.log(courses);
	const writed = await fs.writeFile(PATH_COURSES_JSON, JSON.stringify(courses));
	if (writed) {
		console.log('Daten erfolgreich gefälscht');
	}
};

const studioLocation = (studioName) => {
	switch (studioName) {
		case 'FitnessLounge':
			return [48.20849, 16.37208];
		case 'HealthGym':
			return [48.22249, 16.35708];
		case 'PowerFit':
			return [48.20049, 16.35208];
		case 'YogaStudio':
			return [48.19849, 16.38808];
		default:
			return [null, null];
	}
};

export {generateFitnessCourses};
