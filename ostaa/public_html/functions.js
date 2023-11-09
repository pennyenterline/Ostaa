// Author: Penny Enterline
// JS functions to send info to server when button pressed

// sends new user data to userdb
addUser.addEventListener("click", () => {

	let user = document.querySelector("#username");
	let pass = document.querySelector("#password");

	var obj = {
		username: user.value,
		password: pass.value
	};

	fetch("/add/user", {
		method: 'POST',
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(obj)
	});

	sendUser();

	window.confirm("You have created a user!");
});

// creates a session for the current user logged in
loginButton.addEventListener("click", () => {

	let user = document.querySelector("#usernameLogin");
	let pass = document.querySelector("#passwordLogin");

	var obj = {
		username: user.value,
		password: pass.value
	};

	fetch("/login", {
		method: 'POST',
		headers: {
			"Content-type": "application/json"
		},
		body: JSON.stringify(obj)
	})
		.then(response => { return response.json(); })
		.then((userObject) => {
			if (userObject) {
				console.log('valid')
				console.log(userObject)
				document.cookie = `username=${userObject.username}`;
				window.location.href = "/home.html"
			} else {
				console.log('invalid')
				document.cookie = `username=`;
			}
		})
});

// clears text boxes
function sendUser() {
	document.getElementById("usernameLogin").value = '';
	document.getElementById("passwordLogin").value = '';
}


