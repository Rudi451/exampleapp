const usernameEl = document.querySelector('#username');
const errorMessageEl = document.querySelector('#error-message');
const courseListEl = document.querySelector('#course-list');
const courseInfoAreaEl = document.querySelector('#course-info-area');
const logoutBtn = document.querySelector('#logoutBtn');
const navProfile = document.querySelector('#nav-profile');
const modalWindowEl = document.getElementById('modalWindow');
const navFinderTabBtn = document.querySelector('#nav-finder-tab');

const myModal = new bootstrap.Modal(modalWindowEl);

let courseList;
let userData;
let animationToogle = false;
let navFinderTabBtnToogle = true;

console.log('in script');

const HOST = 'http://localhost:7001';
// const HOST = 'https://bytegears.de';

// Zuerst holen alle Daten von Server: Kurs list, User Data
// das wird mit die Funktionen Ganz unter gemacht
//

/**
 * UserData von server holen und in variable UserData speichern
 */
const getUserData = () => {
	axios
		.get(HOST + '/api/users/members/myUserData')
		.then((res) => {
			console.log('was ist userdata:', res.data);
			if (res.data.username) {
				userData = res.data;
				// usernameEl.innerHTML = res.data.username;
				usernameEl.innerHTML = `<div class="circleUser"></div><span> Hello, ${res.data.username}</span>`;
				window.sharedUserData = userData;
				if (res.data.payments.length > 0) {
					// document.querySelector('#booked-course1').innerText =
					// 	getCourseNameById(res.data.payments[0].courseId);

					if (res.data.payments[1]) {
						document.querySelector('#booked-course2').innerText =
							res.data.payments[1];
					}
				}
			}
			// document.querySelector('#userData').textContent = res.data;
		})
		.catch((error) => {
			console.log(error);
			showErrorMessage(error.message, error.code);
			errorMessageEl.innerHTML += `<a href="${HOST}"> Zurück zur Start Seite </a>`;
			window.location.replace(HOST);
		});
};

/**
 *
 * @param {Object} data
 * @return HTML code mit den Liste
 */
const buildCourseList = (data) => {
	console.log('build course list: data:', data);
	//für jede Einheit ein Html list mit eventListener erstellen
	data.forEach((item) => {
		const listEl = document.createElement('button');
		listEl.classList.add('list-group-item', 'list-group-item-action');
		listEl.innerText = item.name;
		listEl.addEventListener('click', (event) => {
			// console.log(item.courseId);
			buildCourseInfo(item);
			const buttons = courseListEl.getElementsByTagName('button');
			// Use a for loop to iterate through the HTMLCollection
			for (let i = 0; i < buttons.length; i++) {
				buttons[i].classList.remove('active');
			}
			listEl.classList.add('active');
			try {
				document
					.querySelector('#bookBtn')
					.addEventListener('click', (params) => {
						bookedCourseId = params.target.getAttribute('data-id');
						bookedCourseName = params.target.getAttribute('data-name');
						openModal(bookedCourseId, bookedCourseName);
						// params.target.classList.add('active');
					});
			} catch (err) {
				console.log(err);
			}
		});
		courseListEl.append(listEl);
	});
};

const buildCourseInfo = (item) => {
	const html = `<div class="card">
  
  <div class="card-body">
    <h5 class="card-title text-dark">${item.name}</h5>
    <p class="card-text">
		<b>Studio:</b>
		${item.fitnessStudio}<br/>
		<b>Adresse:</b>
		${item.address}<br/>
		<b>Beschreibung:</b>
		${item.description}<br/>
		<b>Alter:</b>
		 ${item.ageFrom} - ${item.ageTo}<br/>
		 <b>WochenTage:</b>
		${item.dayOfWeek}<br/>
		<b>Intensität:</b>
		${item.powerLevel}<br/>
		<b>ZeitRaum:</b>
		${dateFormatting(item.startDate)} - ${dateFormatting(item.stopDate)}<br/>
		</p>
     ${checkCourseBooked(item)}
  </div>
</div>`;
	courseInfoAreaEl.innerHTML = html;
};

const dateFormatting = (dateString) => {
	const date = new Date(dateString);
	//formatieren
	const options = {day: 'numeric', month: 'short', year: 'numeric'};
	return date.toLocaleDateString('de-AT', options).replace(',', '.');
};

const checkCourseBooked = (item) => {
	const userPayments = userData.payments;
	const courseBooked = userPayments.find(
		(payment) => payment.courseId === item.courseId
	);
	if (courseBooked) {
		return `<p class="badge bg-success">Sie haben den Kurs schon gebucht</p><br/><a href="#" class="btn btn-primary disabled">Kurs Buchen</a>
		`;
	} else {
		// return courseInfoAreaEl.appendChild(bookCourseBtn(item));
		return bookCourseBtn(item);
	}
};

const bookCourseBtn = (item) => {
	const bookCourseButtonEl = document.createElement('button');
	bookCourseButtonEl.classList.add('btn', 'btn-primary');
	bookCourseButtonEl.innerText = 'Kurs buchen';
	bookCourseButtonEl.setAttribute('id', 'bookBtn');
	bookCourseButtonEl.setAttribute('data-id', item.courseId);
	bookCourseButtonEl.setAttribute('data-name', item.name);
	bookCourseButtonEl.setAttribute('type', 'button');
	bookCourseButtonEl.setAttribute('data-bs-toggle', 'modal');
	bookCourseButtonEl.setAttribute('data-bs-target', '#modalWindow');
	// courseInfoAreaEl.appendChild(bookCourseButtonEl);
	return bookCourseButtonEl.outerHTML;
};

const toPayment = (courseId, bookedCourseName) => {
	const paymentMethod = 'Paypal';
	const spinner = document.querySelector('#spinner');
	spinner.classList.remove('hidden');
	document.querySelector('#closeBtnHeader').classList.add('disabled');
	document.querySelector('#closeBtnFooter').classList.add('disabled');
	document.querySelector('#btnPayment').classList.add('disabled');
	document.querySelector('#btnPaymentText').innerText = '';
	console.log(courseId);
	axios
		.post(
			HOST +
				'/api/payments/new?courseId=' +
				courseId +
				'&paymentMethod=' +
				paymentMethod
		)
		.then((res) => {
			console.log('res beim buchen', res);
			if (res.data.status === 'COMPLETED') {
				modalWindowReboot();
				// getUserData();
				document.querySelector(
					'#bookBtn'
				).outerHTML = `<p class="badge bg-success">Sie haben den Kurs schon gebucht</p><br/><a href="#" class="btn btn-primary disabled">Kurs Buchen</a>`;

				//den info anzeigen
				errorMessageEl.innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">
          Sie haben sich zur Fitness Programm <b> ${bookedCourseName}</b> erfolgreich angemeldet
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
				//den userData erneut holen
				getUserData();

				console.log('res.data:', res.data);
			}
		})
		.catch((error) => {
			console.log(error);
			showErrorMessage(error.message, error.code); // errorMessageEl.innerHTML += `${error.message}: ${error.code} <br/>`;
			//Payment Failed
			//modal zurücksetzen , schließen
			modalWindowReboot();
			//Fehler Meldung
			errorMessageEl.innerHTML += `<div class="alert alert-danger alert-dismissible fade show" role="alert">
	Den Kauf ist Fehlgeschlagen
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
		});
};

const openModal = (bookedCourseId, bookedCourseName) => {
	console.log('modal fenster');
	const paymentMethodInputEl = document.querySelector('#paymentMethod');
	const agb_checkboxInputEl = document.querySelector('#agb_checkbox');

	paymentMethodInputEl.addEventListener('change', (event) => {
		console.log(paymentMethodInputEl.value, agb_checkboxInputEl.checked);
		checkPaymentAndAgb(bookedCourseId, bookedCourseName);
	});
	agb_checkboxInputEl.addEventListener('change', (event) => {
		console.log(paymentMethodInputEl.value, agb_checkboxInputEl.checked);

		checkPaymentAndAgb(bookedCourseId, bookedCourseName);
	});
	// toPayment(bookedCourseId);
};

const checkPaymentAndAgb = (bookedCourseId, bookedCourseName) => {
	const paymentMethodInputEl = document.querySelector('#paymentMethod');
	const agb_checkboxInputEl = document.querySelector('#agb_checkbox');
	const btnPayment = document.querySelector('#btnPayment');

	if (
		paymentMethodInputEl.value !== 'empty' &&
		agb_checkboxInputEl.checked === true
	) {
		btnPayment.classList.remove('disabled');
		btnPayment.addEventListener('click', (event) => {
			toPayment(bookedCourseId, bookedCourseName);
		});
	} else {
		btnPayment.classList.add('disabled');
	}
};

/**
 * Retourniert ins ErrorMessage Element den Fehler text
 * @param {*} errorMessage
 * @param {*} errorCode
 */
const showErrorMessage = (errorMessage, errorCode) => {
	errorMessageEl.innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">
	${errorMessage}: ${errorCode}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
};
/**
 * Über ErrorMessage Element eine Info anzeigen (andere backgroundColor)
 * @param {string} message
 */
const showInfoMessage = (message) => {
	errorMessageEl.innerHTML = `<div class="alert alert-primary alert-dismissible fade show" role="alert">
	${message}
          <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Close"></button>
        </div>`;
};

logoutBtn.addEventListener('click', (event) => {
	axios
		.post(HOST + '/api/users/members/logout')
		.then((res) => {
			console.log('was ist res: ', res);
			window.location.replace(HOST);
		})
		.catch((err) => {
			console.log(err);
			window.location.replace(HOST);
		});
});

const modalWindowReboot = () => {
	myModal.hide();
	//den Modal Fenster erfrischen ->
	console.log('was ist modalFenster', modalWindowEl);
	modalWindowEl.querySelector('#closeBtnFooter').classList.remove('disabled');
	modalWindowEl.querySelector('#closeBtnHeader').classList.remove('disabled');
	//und den pay button zurücksetzen
	modalWindowEl.querySelector('#btnPayment').classList.remove('disabled');
	modalWindowEl.querySelector('#spinner').classList.add('hidden');
	modalWindowEl.querySelector('#btnPaymentText').innerText = 'Kauf abschließen';
	//payment Method select auf null setzen
	modalWindowEl.querySelector('#paymentMethod').value = 'empty';
	//und den hacken wegräumen
	modalWindowEl.querySelector('#agb_checkbox').checked = false;
};

usernameEl.addEventListener('click', (event) => {
	logoutBtn.style.display = 'inline-block';
	// animationToogle = false;
});
logoutBtn.addEventListener('animationend', (event) => {
	animationToogle = true;
	logoutBtn.style.animation = 'none';
});

// Function to hide the logout container
function hideElementOnOutsideClick(event) {
	const logoutBtn = document.getElementById('logoutBtn');

	// Check if the click is outside the container
	if (
		!logoutBtn.contains(event.target) &&
		logoutBtn.style.display === 'inline-block' &&
		animationToogle === true
	) {
		animationToogle = false;
		logoutBtn.style.display = 'none';
		logoutBtn.style.animation = 'slideInFromTop 0.5s ease-out';
	}
}
// Add event listener to document
document.addEventListener('click', hideElementOnOutsideClick);

navFinderTabBtn.addEventListener('click', (event) => {
	console.log('navfinder, navFinderTabBtnToogle:', navFinderTabBtnToogle);
	showFitnessList();
});

document
	.querySelector('#dashboard-profil-card')
	.addEventListener('click', (event) => {
		const tabTrigger = document.querySelector('#nav-profile-tab');
		const tab = new bootstrap.Tab(tabTrigger);
		tab.show();
	});
document
	.querySelector('#dashboard-gebuchtekurse-card')
	.addEventListener('click', (event) => {
		const tabTrigger = document.querySelector('#nav-myfitness-tab');
		const tab = new bootstrap.Tab(tabTrigger);
		tab.show();
	});

document
	.querySelector('#dashboard-fitnessfinder-card')
	.addEventListener('click', (event) => {
		const tabTrigger = document.querySelector('#nav-finder-tab');
		const tab = new bootstrap.Tab(tabTrigger);
		showFitnessList();
		tab.show();
	});

const showFitnessList = () => {
	if (navFinderTabBtnToogle) {
		buildCourseList(courseList);

		buildCourseInfo(courseList[0]);
		navFinderTabBtnToogle = false;

		try {
			document.querySelector('#bookBtn').addEventListener('click', (params) => {
				bookedCourseId = params.target.getAttribute('data-id');
				bookedCourseName = params.target.getAttribute('data-name');
				openModal(bookedCourseId, bookedCourseName);
			});
		} catch (err) {
			console.log(err);
		}
	}
};

const courseListRefresh = () => {
	axios
		.get(HOST + '/api/courses/')
		.then((res) => {
			document.querySelector('#booked-course1').innerText =
				'Sie habe noch kein Fitness gebucht';
			// document.querySelector('#booked-course2').innerText = res.data[1].name;
			document.querySelector('#booked-course2').innerText = '...';
			// getUserData();
			buildCourseListForTab(courseList);
		})
		.catch((error) => {
			console.log(error);
			showErrorMessage(error.message, error.code);
			errorMessageEl.innerHTML += `<a href="${HOST}"> Zurück zur Start Seite </a>`;
			window.location.replace(HOST);
		});

	const buildCourseListForTab = (data) => {
		const payments = userData.payments;
		try {
			const matchingCourses = data.filter((course1) =>
				payments.some((course2) => course1.courseId === course2.courseId)
			);

			console.log(matchingCourses);
			matchingCourses.forEach((course, index) => {
				document.querySelector(
					'#booked-courses-list2'
				).innerHTML += `<li data-id="${course.courseId}" ${
					course.courseId === 'f3ac9e7f-a3cd-4c2e-84c7-6b77c46172cd'
						? 'style="background-color: #FF5733;"'
						: null
				}>${course.name}</li>`;
				if (index < 2) {
					document.querySelector('#booked-courses-list3').innerHTML += `<li
																		class="dashboard-card-list"
																		>
																		${course.name}
																	</li>`;
				}
			});
			document.querySelector('#booked-courses-list3').innerHTML += `<li
																		class="dashboard-card-list"
																		>
																		...
																	</li>`;
		} catch (err) {
			console.log(err);
			document.querySelector(
				'#booked-courses-list2'
			).innerHTML += `<li><b>Sie haben noch kein Fitness Gebucht</b></li>`;
		}
	};
};
const getCourseNameById = (id) => {
	return courseList.find((course) => course.courseId === id);
};

//Zuerst Alle anfragen An den Server machen
getUserData();
courseListRefresh();
//
