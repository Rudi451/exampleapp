const profilFormInputName = document.querySelector('#profil-form-input-name');
const profilFormInputEmail = document.querySelector('#profil-form-input-email');
const profilFormInputAge = document.querySelector('#profil-form-input-age');
const profilFormInputPowerLevel = document.querySelector(
	'#profil-form-input-powerLevel'
);
const profilFormBookedCourses = document.querySelector(
	'#profil-form-bookedCourses'
);
const bookedCoursesList = document.querySelector('#booked-courses-list');

const profilFormSaveButton = document.querySelector('#profil-form-save-button');

document
	.querySelector('#nav-profile-tab')
	.addEventListener('click', (event) => {
		getUserData();
		console.log('was ist user data im event lisetener:', userData);
		profilFormInputName.value = userData.name;
		profilFormInputEmail.value = userData.email;
		profilFormInputAge.value = userData.age;
		profilFormInputPowerLevel.value = userData.powerLevel;
		// den List mit gebuchte Kursen bilden
		bookedCoursesList.innerHTML = '';
		userData.payments.forEach((item) => {
			const bookedCourse = courseList.find(
				(course) => course.courseId === item.courseId
			);

			const listEl = document.createElement('li');
			listEl.innerText += bookedCourse.name;
			bookedCoursesList.appendChild(listEl);
		});
		checkEmptyFields();
	});

profilFormSaveButton.addEventListener('click', (event) => {
	const formData = {
		name: profilFormInputName.value,
		email: profilFormInputEmail.value,
		age: profilFormInputAge.value,
		powerLevel: profilFormInputPowerLevel.value,
	};
	axios
		.put(HOST + '/api/users/members/myUserData', formData)
		.then((res) => {
			console.log(
				'Daten sind erfolgreich geändert. Was ist res beim put: ',
				res
			);
			getUserData();
			showInfoMessage('Daten sind erfolgreich geändert');
			const spanElements = navProfile.querySelectorAll('.badge');
			spanElements.forEach((badge) => {
				badge.classList.add('hidden');
			});
			// ändern alle invalid popups to valid
			[
				profilFormInputName,
				profilFormInputEmail,
				profilFormInputAge,
				profilFormInputPowerLevel,
			].forEach((el) => {
				if (el.classList.contains('is-invalid')) {
					el.classList.remove('is-invalid');
				}
			});
		})
		.catch((err) => {
			console.log(err);
			showErrorMessage(
				`Tragen Sie bitte alle Daten ein <br /> bzw Überprüfen Sie Ihre Angaben, ErrorCode`,
				422
			);
		});
});

const checkEmptyFields = () => {
	axios
		.post(HOST + '/api/users/members/checkUserFields')
		.then((res) => {
			console.log('was ist params', res);
			const userEmptyFields = res.data.EmptyFields;
			userEmptyFields.forEach((element) => {
				showInvalid(element);
			});
		})
		.catch((err) => {
			console.log(err);
			showErrorMessage(err.message || err, err.code);
		});
};

const showInvalid = (element) => {
	console.log(element);
	document
		.querySelector(`#profil-form-input-${element}`)
		.classList.add('is-invalid');

	//text für invalid situation setzen
	document.querySelector(
		`#invalid-fb-input-${element}`
	).innerText = `Bitte füllen Sie aus`;
};

// wenn ein Formular geändert war -> badge anzeigen
[
	profilFormInputName,
	profilFormInputEmail,
	profilFormInputAge,
	profilFormInputPowerLevel,
].forEach((element) => {
	element.addEventListener('change', (event) => {
		const spanElement = element.nextElementSibling;
		spanElement.classList.remove('hidden');

		element.classList.remove('is-invalid');
	});
});
