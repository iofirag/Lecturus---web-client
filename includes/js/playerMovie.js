$(window).load(function() {
	initializeTopNav();
});

//Initialize the top nav with user's details
function initializeTopNav() {
	$('#userName').html(window.localStorage.getItem("userName"));
	$('.profilePicture').css('background-image', "url(" + window.localStorage.getItem("profilePicture") + ")");
}
