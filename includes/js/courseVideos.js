$(window).load(function() {
	 initializeTopNav();
	//Get the course parameter from the URL
	getCourseVideos($.querystring('course'));
});

//Initialize the top nav with user's details
function initializeTopNav() {
	$('#userName').html(window.localStorage.getItem("userName"));
	$('.profilePicture').css('background-image', "url(" + window.localStorage.getItem("profilePicture") + ")");
}


function getCourseVideos(course) {
	$.ajax({
		type : "GET",
		url : "http://lecturus.herokuapp.com/users/getCourseVideos/",
		dataType : 'json',
		data : {
			email : window.localStorage.getItem("userEmail"),
			courseName : course
		},
		success : function(data) {
			console.log("Curses list by id: ", data);
			
			var sHTML = "<section class='videoWrapper'>";
			$.each(data, function(key,val){
				
				sHTML+="<a href='playmovie.html?videoId="+val.id+"'><section class='videoTitle'>"+ val.title+"</section></a>"
						+"Group Recorded by:<section class='participants'> ";
						
					 $.each(val.participants, function(key,val){
					 	sHTML+="<section class='participant'><img class='participantProfilePicture' src='includes/images/personThumbnail.jpg'>" + val +"</section>";
					 });
				
			});
			sHTML += "</section></section>";
			$("#videosList").append(sHTML);
		},
		error : function(objRequest, errortype) {
			//console.log(errortype);
			console.log("#####Can't do because: " + error);
		}
	});
}

//This function gets parameters from the URL
(function($) {
	$.extend({
		querystring : function(name) {
			var match = RegExp('[?&]' + name + '=([^&]*)').exec(window.location.search);
			return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
		}
	});
})(jQuery);