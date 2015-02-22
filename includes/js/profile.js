//get list of courses
(function() {
	console.log(window.localStorage.getItem("userEmail"));
	$.ajax({
		type : "GET",
		url : "http://lecturus.herokuapp.com/users/getCourses/",
		dataType : 'json',
		data : {
			email : window.localStorage.getItem("userEmail")
		},
		success : function(data) {
			console.log("Courses: ", data);

			$.each(data.courses, function(key, val) {
				$("#coursesList").append("<section class='degreeTitle'>" + key + "</section>");
				$.each(val, function(key, val) {
					$("#coursesList").append("<a href='courseVideos.html?course=" + val + "'><section class='degreeCourse'>" + val + "</section></a>");
				});
			});

		},
		error : function(objRequest, errortype) {
			//console.log(errortype);
			console.log("#####Can't do because: " + error);
		}
	});
})();

$(window).load(function() {
	initializeTopNav();
});

//Initialize the top nav with user's details
function initializeTopNav() {
	$('#userName').html(window.localStorage.getItem("userName"));
	$('.profilePicture').css('background-image', "url(" + window.localStorage.getItem("profilePicture") + ")");
}
