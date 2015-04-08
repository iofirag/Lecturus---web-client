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
	url : "http://lecturus.herokuapp.com/users/getUser",
	type : 'post',
	dataType : "json",
	data : {"email":"vandervidi@gmail.com"}, success : function(data) {
		//If this user is a known user of lecturus
		if (data.status == "1") {
			

			//Redirect to User's main page
			window.location.href = "home.html";
		} else {
			alert("Sorry but you musr register via our mobile application");
		}
	}, error : function(objRequest, errortype) {
		alert("Something went wrong..");
	}
});

}






