const loginBtn = document.querySelector('#navElem1');
const registerBtn = document.querySelector('#navElem2');
const startButton = document.querySelector('#startButton');
const newHereBtn = document.querySelector('#newHere');

// Get the modal element
const myModal = new bootstrap.Modal(document.getElementById('exampleModal'));

// Close modal when close button or close footer button is clicked
document.getElementById('closeModalBtn').addEventListener('click', function () {
	myModal.hide();
});

document
	.getElementById('closeModalFooterBtn')
	.addEventListener('click', function () {
		myModal.hide();
	});

loginBtn.addEventListener('click', (event) => {
	myModal.show();
	showElement('login-form-el');
	// newHereBtn.innerText = 'Neu hier? Zum Register ->';
});
startButton.addEventListener('click', (event) => {
	myModal.show();
	showElement('login-form-el');
});
registerBtn.addEventListener('click', (event) => {
	myModal.show();
	showElement('register-form-el');
});

const showElement = (elementId) => {
	if (elementId) {
		// Alle Elemente ausblenden
		const elements = document.querySelectorAll('.element');
		elements.forEach((element) => {
			element.classList.add('hidden'); // Versteckt das Element
		});

		// Das angeklickte Element anzeigen
		try {
			const activeElement = document.getElementById(elementId);
			activeElement.classList.remove('hidden'); // Zeigt das Element
			if (elementId === 'register-form-el') {
				newHereBtn.innerText = 'Ich bin schon registriert';
				newHereBtn.addEventListener('click', (event) => {
					event.preventDefault();
					showElement('login-form-el');
				});
			} else {
				newHereBtn.innerText = 'Neu hier? Zum Register ->';
				newHereBtn.addEventListener('click', (event) => {
					event.preventDefault();
					showElement('register-form-el');
				});
			}
		} catch (err) {
			console.log(err);
		}
	} else {
		newHereBtn.addEventListener('click', (event) => {
			event.preventDefault();
			showElement('register-form-el');
		});
		showElement('login-form-el');
		newHereBtn.innerText = 'Neu hier? Zum Register ->';
	}
};

// Optional: Standardmäßig Element 1 anzeigen

window.onload = showElement();

//wenn eine Regestrierung fehlgeschlagen

const currentHash = window.location.hash;
console.log('currenthash', currentHash);

if (currentHash == '#failedRegistration') {
	document.getElementById('errorMessageIndex').innerText =
		'Registrierung fehlgeschlagen, prüfen Sie Ihre Angaben';
	myModal.show();
	showElement('register-form-el');
}

if (currentHash == '#usernameIsAlreadyExist') {
	document.getElementById('errorMessageIndex').innerHTML =
		'Registrierung fehlgeschlagen, <b>Username ist schon vorhanden</b>';
	myModal.show();
	showElement('register-form-el');
}
