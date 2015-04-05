var minimalMode=false;
// Json get in ajax
var videoJson;

// Sound ref
var mediaSound;

// Whole video second counter
var video_timeCounter = 0;

// Specific audio playing
var audio_timeCounter = 0;

// Stopwatch for interval
var starttimeMS;
var endtimeMS;
var totaltimeMS = 0;
var resttimeMS = 0;
var interval;

// Flags to handle play/pause auto in seeking & self-finish
var seek = false;
var currentEnd_loadSecond = false;

// Player buttons
var playPauseBtn;
var muteBtn;

// Song contains the second user seek to
var bestMatch;

var op = {
	height: 256,
	width: 256
};

function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
		gapi.client.load('plus', 'v1', function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(resp) {
				$('#topNavProfilePic').css('background-image', "url("+ resp.image.url + ")");
				$("#userName").text(resp.displayName);
			});
		});

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


$(document).ready(function() {
	// init the top page
	//initializeTopNav();
	
	if (window.location.pathname.indexOf('editVideo.html') >= 0 ) minimalMode=true;
	
	if (!minimalMode) {
		console.log('full mode');
		/* download video json from lecturus web-service */
		var videoId = "";
		if (getParameterByName("videoId")!=''){
			videoId = getParameterByName("videoId");
		
			$.ajax({
				type : "GET",
				url :  'http://lecturus.herokuapp.com/session/getVideoById/?videoId='+videoId, // //'includes/js/example_video.json',
				async : false,
				dataType : 'json',
				success : function(data) {
					
					if (data.status==1){
						run_media_player(data , false);
					}else{
						console.log('server status code are not 1');
					}
				},
				error : function(objRequest, errortype) {
					console.log(errortype);
					console.log("Can't do because: " + error);
				}
			});
		}else{
			console.log('QueryString "?videoId=NUMBER" are missing!');
		}
	}
});

function run_media_player(data, minimal_flag){
	minimalMode = minimal_flag;
	// init media obj
	mediaSound = $('#mediaSound')[0];
	
	initialiseMediaPlayer();
					
	// Build video obj
	videoJson = data.info;
	
	if (!minimalMode) {
		// set the title
		$("#degreeName").html( get_name_from_degreeNum(videoJson.degree) );
		$('#courseName').html('&nbsp;> ' + get_name_from_courseNum(videoJson.course) );
		$('#videoTitle').html('&nbsp;> ' + videoJson.title);
	
		// Votes
		$('#voteDown_val').html(videoJson.rating.negative.value);
		$('#voteUp_val').text(videoJson.rating.positive.value);
	}
	//put the first audio
	$("#audioSrc").attr("src", videoJson.audios[audio_timeCounter].url);
	mediaSound.load();
	
	//adjust slider for full video length
	$("#secondSlider").prop({
		'min' : 0,
		'max' : videoJson.totalSecondLength
	});
	
	// slider events handler
	secondSlider_Handler();
	
	if (!minimalMode) {
		// Check if admin
		show_edit_button_if_admin();
	}
}

function doEverySecond() {
	//update slider
	video_timeCounter = parseInt($("#secondSlider").val()) + 1;
	console.log(video_timeCounter);
	$("#secondSlider").val(video_timeCounter);
	$('#showtime').html( secondToTime(video_timeCounter) );

	// Update input-range fill before and after thumb
	var val = (video_timeCounter - $("#secondSlider").attr('min')) / ($("#secondSlider").attr('max') - $("#secondSlider").attr('min'));
	changeProgressColor(val);
	
	if (!minimalMode) {
		// Check if there is element with 'video_timeCounter' key
		if (videoJson.elements.hasOwnProperty(video_timeCounter + '')) {
			$.each(videoJson.elements[video_timeCounter], function(key, val) {
				switch (key) {
				case "photo":
					console.log("find in key: "+key+" "+videoJson.elements[video_timeCounter].photo.url);
					$('#viewPhotos').attr("src" ,videoJson.elements[video_timeCounter].photo.url);
					break;
				case "tags":
					$("#viewerTag").empty();
					$.each( videoJson.elements[video_timeCounter].tags, function(index, val){
						var finalText = '<section>'+val.text+'</section>';
						$("#viewerTag").append(finalText);
					});
					
					break;
				}
			});
		}
	}
}
function secondSlider_Handler() {
													console.log('secondSlider_Handler');
	$("#secondSlider").on("input", function() {
		// get value as sliding - use for show brief images & find witch sound to use
													console.log("input");
		
		//pause video
		mediaSound.pause();
		//debugger;
		//show second to user
		secondSlider = this.value;
		//changeProgressColor(secondSlider);
		$('#showtime').html( secondToTime(secondSlider));
													console.log("seek to: " + secondSlider);
		
		// find witch sound contain the second user seek
		$.each(videoJson.audios, function(audioObj) {
			if ((secondSlider >= videoJson.audios[audioObj].startAt) && (secondSlider <= videoJson.audios[audioObj].startAt + videoJson.audios[audioObj].length)) {
				bestMatch = audioObj;
			}
		});
		
		//get the sound in this second-val + seconds_to_forward
		calcSeek = (secondSlider - videoJson.audios[bestMatch].startAt);
		soundContain = videoJson.audios[bestMatch].url;
													console.log("This second located in: " + soundContain);
													console.log("Need to seek from start: " + calcSeek);
		
		if (!minimalMode) {
			// find if in this second there is something to show
			findView();
		}
	});
	
	$("#secondSlider").on("change", function() {
		// play the fuckaaaa sound (and run the interval)
													console.log("change");		
		//debugger;							
		if (audio_timeCounter == bestMatch){
			//seek in the same song
			//do the seek & auto play
			playAudio_withSeek(calcSeek, false);
		}else{
			//seek to another song
			//load & prepare sound
			//change source to: 'videoJson.audios[bestMatch].sound' and seek: 'calcSeek'
			//do the seek & auto play
			audio_timeCounter = bestMatch;
			playAudio_withSeek(calcSeek, true);
		}
	});
}

function playAudio_withSeek(timeToSeek, seekAnotherSong) {
	if (seekAnotherSong){
		//seek to another sound
														console.log("seek to other song");
		$("#audioSrc").attr("src", videoJson.audios[audio_timeCounter].url);
		seek = true;
		mediaSound.load();
	}else{
		//seek in the same sound
														console.log("seek in the song");
		mediaSound.play();
	}
	mediaSound.currentTime = timeToSeek;
}





/**************************************************************************************************/
/**************************************************************************************************/
/**************************************************************************************************/

// Media Player using HTML5's Media API
function initialiseMediaPlayer() {
	console.log("initialiseMediaPlayer");
	
	// Get handles to each of the buttons and required elements
	playPauseBtn = $('#play')[0];
	muteBtn = $('#mute')[0];

	// Hide the browser's default controls
	mediaSound.controls = false;
	
	mediaSound.oncanplaythrough = function() {
		console.log("oncanplaythrough");
		if (seek || currentEnd_loadSecond) {
															console.log("seek || currentEnd_loadSecond");
			seek=false;
			currentEnd_loadSecond=false;
			mediaSound.play();
		}
	};
	mediaSound.onplay = function() {						console.log("my onPlay");
		if (!minimalMode) showOp();
		changeButtonType(playPauseBtn, 'pause');
		starttimeMS = new Date();

		if (resttimeMS < 1000 && resttimeMS > 0) {
															console.log("wait: " + resttimeMS);
			setTimeout(doEverySecond, resttimeMS);
		}
		if (interval == null) {
			interval = setInterval(doEverySecond, 1000);
		}
	};
	mediaSound.onpause = function() {											console.log("my onPause");
		if (!minimalMode) showOp();
		changeButtonType(playPauseBtn, 'play');
		clearInterval(interval);
		interval = null;
		endtimeMS = new Date();
		totaltimeMS = endtimeMS - starttimeMS;
		resttimeMS = 1000 - ((endtimeMS - starttimeMS) % 1000);
	};
	mediaSound.onended = function() {
		console.log("onended");
		audio_timeCounter++;

		// If thare are more videos
		if (audio_timeCounter < videoJson.audios.length) {

			// Change audio-source & Load func & Play func
			playAudio_withSeek(0, true);
			currentEnd_loadSecond = true;
		} else {
			// video has finished, init param:
			clearInterval(interval);
			interval = null;
			audio_timeCounter = 0;
			video_timeCounter = 0;
			console.log("video finish");
		}
	};
	mediaSound.onerror = function(e) {
		console.log('Error loading: '+e.target.src);
		alert("Error! Something went wrong");
		alert("Cannot play video because load failed.");
		//mediaSound.pause();
	};
	mediaSound.onvolumechange = function(){
		console.log("volumechange");
		// Update the button to be mute/unmute
		if (mediaSound.muted) changeButtonType(muteBtn, 'unmute');
		else changeButtonType(muteBtn, 'mute');
	};
}

// Use only in playmovie.html
// use to find views to show at input range current second
function findView(){
	console.log("findView");
	//init layout
	$("#viewerTag").empty();

	var wasPic = false;
	// Show the last pic (optional the text too if exist)
	for ( i = $("#secondSlider").val(); i >= 0; i--) {
		if (videoJson.elements.hasOwnProperty(i + '')) {
			if (videoJson.elements[i].hasOwnProperty('photo')) {
				$('#viewPhotos').attr("src" ,videoJson.elements[i].photo.url);
				wasPic = true;
												console.log("need to show image:"+ $('#viewPhotos').attr("src") );
				if (videoJson.elements[i].hasOwnProperty('tags')) {
					$("#viewerTag").empty();
					$.each( videoJson.elements[i].tags, function(index, val){
						//debugger;
						var finalText = '<section>'+val.text+'</section>';
						$("#viewerTag").append(finalText);
					});
				}
				break;
			}
			else if (videoJson.elements[i].hasOwnProperty('tags')) {
				$("#viewerTag").empty();
				$.each( videoJson.elements[i].tags, function(index, val){
					//debugger;
					var finalText = '<section>'+val.text+'</section>';
					$("#viewerTag").append(finalText);
				});
				//console.log('text in sec '+i+' is: '+videoJson.elements[i].tags.text);
				// if (videoJson.elements[i].hasOwnProperty('photo')) {
					// $('#viewPhotos').attr("src" ,videoJson.elements[i].photo.url);
					wasPic = true;
				// }
				break;
			}
		}
	}
	if (!wasPic) $('#viewPhotos').attr("src", 'includes/img/default_poster.png');
}

function togglePlayPause() {
	// If the mediaSound is currently paused or has ended
	if (mediaSound.paused || mediaSound.ended) {
		// Change the button to be a pause button
		changeButtonType(playPauseBtn, 'pause');
		// Play the media
		mediaSound.play();
	}
	// Otherwise it must currently be playing
	else {
		// Change the button to be a play button
		changeButtonType(playPauseBtn, 'play');
		// Pause the media
		mediaSound.pause();
	}
}

// Stop the current media from playing, and return it to the start position
function stopPlayer() {
	mediaSound.pause();
	mediaSound.currentTime = 0;
	// Reset the progress bar to 0
	$("#secondSlider").val(0);
	if (!minimalMode) {
		$('#viewPhotos').attr("src" ,'includes/img/default_poster.png');
		$("#viewerTag").empty();
	}
	changeProgressColor(0);
}

// Changes the volume on the media player
function changeVolume(direction) {
	if (direction === '+') mediaSound.volume += mediaSound.volume == 1 ? 0 : 0.1;
	else mediaSound.volume -= (mediaSound.volume == 0 ? 0 : 0.1);
	mediaSound.volume = parseFloat(mediaSound.volume).toFixed(1);
}

// Toggles the media player's mute and unmute status
function toggleMute() {
	if (mediaSound.muted) {
		// Change the cutton to be a mute button
		changeButtonType(muteBtn, 'mute');
		// Unmute the media player
		mediaSound.muted = false;
	}
	else {
		// Change the button to be an unmute button
		changeButtonType(muteBtn, 'unmute');
		// Mute the media player
		mediaSound.muted = true;
	}
}

// Replays the media currently loaded in the player
function replayMedia() {
	resetPlayer();
	mediaSound.play();
}

// Updates a button's title, innerHTML and CSS class to a certain value
function changeButtonType(btn, value) {
	btn.title = value;
	btn.innerHTML = value;
	btn.id = value;
}

// Loads a video item into the media player
function loadVideo() {
	for (var i = 0; i < arguments.length; i++) {
		var file = arguments[i].split('.');
		var ext = file[file.length - 1];
		// Check if this media can be played
		if (canPlayVideo(ext)) {
			// Reset the player, change the source file and load it
			resetPlayer();
			mediaSound.src = arguments[i];
			mediaSound.load();
			break;
		}
	}
}

// Checks if the browser can play this particular type of file or not
function canPlayVideo(ext) {
	var ableToPlay = mediaSound.canPlayType('video/' + ext);
	if (ableToPlay == '') return false;
	else return true;
}

// Resets the media player
function resetPlayer() {
	// Reset the progress bar to 0
	$("#secondSlider").val(0);
	if (!minimalMode) {
		$('#viewPhotos').attr("src" ,'includes/img/default_poster.png');
		$("#viewerTag").empty();
	}
	changeProgressColor(0);
		
	// Move the media back to the start
	mediaSound.currentTime = 0;
	
	// Ensure that the play pause button is set as 'play'
	changeButtonType(playPauseBtn, 'pause');
}
function changeProgressColor(val){
	$("#secondSlider").css('background-image', '-webkit-gradient(linear, left top, right top, ' + 'color-stop(' + val + ', #cc0000), ' + 'color-stop(' + val + ', #666666)' + ')');
}

/***********************************************************************************************/
/***********************************************************************************************/
/***********************************************************************************************/
// Use only in playmovie.html
function showOp(){
	//append img child for 'view' section
	
	if (mediaSound.paused || mediaSound.ended) {
		// Pause button
		$('#viewOp').attr('src','includes/img/pauseCircle.png');
	}
	// Otherwise it must currently be playing
	else {
		// Play image
		$('#viewOp').attr('src','includes/img/playCircle.png');
	}
	
	// Change location
	$('#viewOp').removeAttr("style");
	$('#viewOp').css('position', 'absolute' ); 
	var position = $('#viewContainer').position();
	var videoHeight = $('#viewContainer').height();
	var videoWidth = $('#viewContainer').width();
	var centerVideo = {
		fromTop: position.top + videoHeight/2 - op.height/2,
		fromLeft: position.left + videoWidth/2 - op.width/2
	};	
	$('#viewOp').css('top', centerVideo.fromTop+'px' );
	$('#viewOp').css('left', centerVideo.fromLeft+'px'); 
	
	var timesRun = 0;
	var interval = setInterval(function(){
	    timesRun += 1;
	    if(timesRun === 1){
	        clearInterval(interval);
	        $('#viewOp').removeAttr('src');
	        $('#viewOp').hide();
	    }
	    //do whatever here..
	}, 400);
}

// Use only in playmovie.html
function show_edit_button_if_admin(){
	if (isAdmin()){
		$('#admin_button_holder').html("<input type='button' value='edit' onclick='goto_editPage();'>");
	}
}

// Use only in playmovie.html
function goto_editPage(){
	window.location.href = "editVideo.html?videoId="+videoJson.sessionId;
}

// Use only in playmovie.html
// Vote
function isUserVote(){
	
}

// Use only in playmovie.html
function get_user_vote(){
	
}
// Use only in playmovie.html
function what_user_vote(){
	if (isUserVote()){
		if ( get_user_vote() == 'true' ){
			$('#voteUp').css('background', 'no-repeat url(//s.ytimg.com/yts/imgbin/www-hitchhiker-vflq3y4n_.webp) -20px -116px');
		}else{
			$('#voteDownLink').css('opacity', 1);
		}
	}
}
// Use only in playmovie.html
function check_if_user_vote_before(){
		
}
// Use only in playmovie.html
function disable_vote(){
	
}
// Use only in playmovie.html
function set_user_vote() {
	if ( check_if_user_vote_before() ) {
		disable_vote();
	}
	vote();
}
// Use only in playmovie.html
function vote(val){
	if (val == 1){
		$('#voteUp').css('background', 'no-repeat url(//s.ytimg.com/yts/imgbin/www-hitchhiker-vflynt-iQ.webp) -279px -142px');
	}else if (val == -1){
		$('#voteDownLink').css('opacity', 1);
	}
}
