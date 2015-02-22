var userMail;

function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
		// Update the app to reflect a signed in user
		// Hide the sign-in button now that the user is authorized, for example:
		document.getElementById('signinButton').setAttribute('style', 'display: none');

		gapi.client.load('plus', 'v1', function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(resp) {
				console.log(resp);
				// find the primary email of user's account
				userMail = getPrimaryEmail(resp);

				//Check if this is a valid lecturus user
				validateUser(userMail, resp);

			});
		});

	} else {
		/*	Update the app to reflect a signed out user
		Possible error values:
		"user_signed_out" - User is signed-out
		"access_denied" - User denied access to your app
		"immediate_failed" - Could not automatically log in the user */
		console.log('Sign-in state: ' + authResult['error']);
		
	}
}

function getPrimaryEmail(resp) {
	var primaryEmail;
	for (var i = 0; i < resp.emails.length; i++) {
		if (resp.emails[i].type === 'account')
			primaryEmail = resp.emails[i].value;
	}
	return primaryEmail;
}

//This function sends an email to the server in order to validate if it is a lecturus user.
//On success : User is a lecturus user.
function validateUser(email, resp) {
	var lectures;
	$.ajax({
		type : "POST",
		url : "http://lecturus.herokuapp.com/users/getUser",
		dataType : 'json',
		//jsonpCallback : 'lecturusCallback',
		data : {
			data : email
		},
		success : function(data) {

			//Save user's email to the localStorage and set a 'loggedIn' flag = true
			window.localStorage.setItem("userEmail", email);
			window.localStorage.setItem("loggedIn", "true");

			//Save user's name to the localStorage
			window.localStorage.setItem("userName", resp.displayName);

			//Save user's profile picture to the localStorage
			window.localStorage.setItem("profilePicture", resp.image.url);
							
			console.log(window.localStorage.getItem("userEmail"));
			console.log(window.localStorage.getItem("loggedIn"));
			console.log(window.localStorage.getItem("profilePicture"));

			//Redirect to User's main page
			window.location.href = "profile.html";
		},
		error : function(objRequest, errortype) {
			console.log(errortype);
			alert("Something went wrong..");
		}
	});
}

//get list of courses
function getCoursesList() {
	$.ajax({
		type : "GET",
		url : "http://lecturus.herokuapp.com/users/getCourses",
		dataType : 'json',
		data : {
			email : "avishay"
		},
		success : function(data) {

			console.log("Courses: ", data);
		},
		error : function(objRequest, errortype) {
			//console.log(errortype);
			console.log("#####Can't do because: " + error);
		}
	});
}

//get course videos
$.ajax({
	type : "GET",
	url : "http://lecturus.herokuapp.com/users/getCourseVideos/",
	dataType : 'json',
	data : {
		email : "avishay",
		courseName : "linearit"
	},
	success : function(data) {

		console.log("Curses list by id: ", data);
	},
	error : function(objRequest, errortype) {
		//console.log(errortype);
		console.log("#####Can't do because: " + error);
	}
});

//get video by Id
$.ajax({
	type : "GET",
	url : "http://lecturus.herokuapp.com/session/getVideoId/",
	dataType : 'json',
	data : {
		videoId : "temp"
	},
	success : function(data) {

		console.log("Video by ID: ", data);
	},
	error : function(objRequest, errortype) {
		//console.log(errortype);
		console.log("#####Can't do because: " + error);
	}
});
