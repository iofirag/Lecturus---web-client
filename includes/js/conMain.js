var userEmail;

function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
				gapi.client.load('plus', 'v1', function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(resp) {
				console.log(resp);
				$("#profilePicture").attr("src", resp.image.url);

			});
		});
		
	console.log(authResult);


	

	} else {
		/*	Update the app to reflect a signed out user
		 Possible error values:
		 "user_signed_out" - User is signed-out
		 "access_denied" - User denied access to your app
		 "immediate_failed" - Could not automatically log in the user */
		console.log('Sign-in state: ' + authResult['error']);

	}
}


$(window).load(function() {
	initializeTopNav();
});

//Initialize the top nav with user's details
function initializeTopNav() {
	$('#userName').html(window.localStorage.getItem("userName"));
	$('.profilePicture').css('background-image', "url(" + window.localStorage.getItem("profilePicture") + ")");
}
