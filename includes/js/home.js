var userEmail,
    appendString,
    loopingKey;

function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
		gapi.client.load('plus', 'v1', function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(resp) {
				userEmail = resp.emails[0].value;
				initPage();
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
		//load the degrees and courses json file
		$.ajax({
			type : "POST",
			url : 'http://lecturus.herokuapp.com/auxiliary/getCourses/',
			dataType : 'json',
			data : {
				"email" : "vandervidi@gmail.com"
			},
			success : function(data) {
				if (data.status == 1) {
					$.ajax({
						type : "GET",
						url : 'http://lecturus.herokuapp.com/session/getAllVideos',
						data : {
							"email" : userEmail
						},
						success : function(data) {
							if (data.status == 1) {
								console.log(data);
								console.log(secondsToTimeFormat(data.info[0].totalSecondLength));
								appendString = "";

								$.each(data.info, function(key, val) {
									loopingKey = key;

									//Start new row of videos
									if ((key % 3) == 0) {
										appendString += "<section class='row'> " + " <section class='col-md-4'>" + "	<section class='singleVideoWrapper'>" + "		 <a href='playmovie.html?videoId=" + val.sessionId + "'><section class='videoImage'>"
										+"<section class='videotimeHolder'>" + secondsToTimeFormat(val.totalSecondLength) +"  </section></section></a>" + "	<section class='videoParticipants'>";

										//populate participants section
										//Add the admin picture
										appendString += "<img class='profilePic tooltip' src='includes/img/personThumbnail.jpg' title='" + val.owner + "' />";

										//Add other particimapnts picture
										$.each(val.participants, function(key, val) {
											appendString += "<img class='profilePic tooltip' src='includes/img/personThumbnail.jpg' title='" + val.user + "' />";
										});

										appendString += "</section>" + "		<section class='videoTitle'><a href='playmovie.html?videoId=" + val.sessionId + "'>" + val.name + "</a></section>" + "		<section class='videoDetails'>" + val.degree + " , " + val.course + "</section>" + "		<section class='videoLecturer'>Lecturer: " + val.lecturer + "</section>" + "		<section class='videoViews'>" + val.views + " views</section>" + "	  </section>" + " </section>";

										//$("#videosWrapper").append(appendString);

									}
									//otherwise append to the existong row of videos
									else {
										appendString += " <section class='col-md-4'>" + "	<section class='singleVideoWrapper'>" + "		 <a href='playmovie.html?videoId=" + val.sessionId + "'><section class='videoImage'>"
										+"<section class='videotimeHolder'>" + secondsToTimeFormat(val.totalSecondLength) +"  </section></section></a>" + "	<section class='videoParticipants'>";
										//populate participants section
										//Add the admin picture
										appendString += "<img class='profilePic tooltip' src='includes/img/personThumbnail.jpg' title='" + val.owner + "' />";

										//Add other particimapnts picture
										$.each(val.participants, function(key, val) {
											appendString += "<img class='profilePic tooltip' src='includes/img/personThumbnail.jpg' title='" + val.user + "' />";
										});

										appendString += "</section>" + "		<section class='videoTitle'><a href='playmovie.html?videoId=" + val.sessionId + "'>" + val.name + "</a></section>" + "		<section class='videoDetails'>" + val.degree + " , " + val.course + "</section>" + "		<section class='videoLecturer'>Lecturer: " + val.lecturer + "</section>" + "		<section class='videoViews'>" + val.views + " views</section>" + "	  </section>" + " </section>";
										//if the next item opens a new row, Close current  row section
										if ((key + 1) % 3 == 0) {
											appendString += "</section>";
										}

										//$("#videosWrapper").append(appendString);
									}
								});

								//Close last row at the end
								if ((loopingKey + 1) % 3 != 0) {
									appendString += "</section>";
									//$("#videosWrapper").append(appendString);

								}

								//finally, append  everything
								$("#videosWrapper").append(appendString);

							}

						},
						error : function(objRequest, errortype) {
							console.log("Cannot get video Json");
						}
					});
				}
			},
			error : function(objRequest, errortype) {
				console.log("Cannot get video Json");
			}
		});

	});

}

function secondsToTimeFormat(secondsToConvert) {
	hours = Math.floor(secondsToConvert / 3600);
	secondsToConvert %= 3600;
	minutes = Math.floor(secondsToConvert / 60);
	seconds = secondsToConvert % 60;
	if(seconds<10){
		seconds = "0"+seconds;
	}
		if(minutes<10){
		minutes = "0"+minutes;
	}
		if(hours<10){
		hours = "0"+hours;
	}
	return hours + ":" + minutes +":" + seconds;

}

