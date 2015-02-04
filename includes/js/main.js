var userMail;

function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
		// Update the app to reflect a signed in user
		// Hide the sign-in button now that the user is authorized, for example:
		document.getElementById('signinButton').setAttribute('style', 'display: none');
		//console.log(authResult);
		gapi.client.load('plus', 'v1', function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(resp) {
				// find the primary email of user account
				userMail = getPrimaryEmail(resp);
				
				// get data from lecturus web-service
				get_lectures_by_usermail(userMail);
				
				console.log(resp);
				console.log('Retrieved profile for: ' + resp.displayName);
				console.log("This user's email is: " + userMail);
			});
		});

	} else {
		/*	Update the app to reflect a signed out user
			Possible error values:
				"user_signed_out" - User is signed-out
				"access_denied" - User denied access to your app
				"immediate_failed" - Could not automatically log in the user */
		console.log('Sign-in state: ' + authResult['error']);
		$('#userName').html("Something went wrong");
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

function get_lectures_by_usermail(email) {
	var lectures;
	$.ajax({
		type: "POST",
		url : "http://lecturus.herokuapp.com/users/getUser",
		dataType : 'json',
		//jsonpCallback : 'lecturusCallback',
		data : {
			data : email
		},
		success : function(data) {
			debugger;
			console.log("data", data);
			$('#userName').html();
			document.getElementById('responseContainer').value = email+" is a valid lecturus user.\n\n"+JSON.stringify(data[0]);
		},
		error : function(objRequest, errortype) {
			console.log(errortype);
			console.log("Can't do because: " + error);
		}
	});
}