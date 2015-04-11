var userEmail;

function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
		initPage();
		gapi.client.load('plus', 'v1', function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(resp) {
				$('#topNavProfilePic').css('background-image', "url(" + resp.image.url + ")");
				$("#userName").text(resp.displayName);
			});
		});

		//Sign out button click listener.
		$("#signOut").click(function() {
			gapi.auth.signOut();
		});

	} else {
		/*	Update the app to reflect a signed out user
		 Possible error values:
		 "user_signed_out" - User is signed-out
		 "access_denied" - User denied access to your app
		 "immediate_failed" - Could not automatically log in the user */
		console.log('Sign-in state: ' + authResult['error']);
		window.location.href = "index.html";

	}
}

function initPage() {
	$(document).ready(function() {
		$.ajax({
			type : "GET",
			url : 'http://lecturus.herokuapp.com/session/getAllVideos',
			data : {
				"email" : "vandervidi@gmail.com"
				},
			success : function(data) {
				debugger
				console.log(data);
				if (data.status == 1) {
					console.log(data);
				}
			},
			error : function(objRequest, errortype) {
				console.log("Cannot get video Json");
			}
		});

	});

}
