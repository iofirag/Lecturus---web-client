var videoJson;

var video_timeCounter=0;	//whole video
var audio_timeCounter=0;	//specific audio playing

var interval;

//stopwatch
var starttimeMS;
var endtimeMS;
var totaltimeMS=0;
var resttimeMS=0;
var isSeek = false;

$(document).ready(function() {
	
	/* download video json from lecturus web-service */
	$.ajax({
        type: "GET",
        url: 'includes/js/test_video2.json',
        async: false,
        success : function(data) {
			// Build video obj
			videoJson = data;
			
			// set the title
			$("#title").html(videoJson.title);
			
			//put the first audio
			$("#audioSrc").attr("src", videoJson.audio[audio_timeCounter].sound);
			
			//adjust slider for full video length
			$("#secondSlider").prop({
	            'min': 0,
	            'max': videoJson.totalSecondLength
	        });
	        $("#progress-bar").prop({
	            'min': 0,
	            'max': videoJson.totalSecondLength
	        });
		},
		error : function(objRequest, errortype) {
			console.log(errortype);
			console.log("Can't do because: " + error);
		}
    });
	
	
	
	var video = document.getElementById("media-video");
	video.oncanplaythrough  = function() {
		console.log("oncanplaythrough");
	};
	video.onplay = function() {
		console.log("onPlay");
		starttimeMS=new Date();
		
		if (resttimeMS<1000 && resttimeMS>0){
			console.log("wait: "+resttimeMS);
			setTimeout(doEverySecond, resttimeMS);
		}
		if (interval == null){
			interval = setInterval(doEverySecond , 1000);
		}
	};
	video.onpause = function() {
		console.log("onPause");
		clearInterval(interval); interval=null;
		endtimeMS=new Date();
		totaltimeMS = endtimeMS-starttimeMS;
		resttimeMS = 1000 - ((endtimeMS-starttimeMS)%1000);
	};
	video.onended = function() {
		console.log("onended");
		//if (onpause && onended){
		audio_timeCounter++;
		
		// If thare are more videos
		// if (Object.keys(videoJson.audio).length > audio_timeCounter){
		if (audio_timeCounter < videoJson.audio.length){
			
			// Change audio source
			// Load & play
			$("#audioSrc").attr("src", videoJson.audio[audio_timeCounter].sound);
			var video = document.getElementById("media-video");
			video.load();
			video.play();
			
			// Start intervals again
			//interval = setInterval(doEverySecond , 1000);
		}else{
			// video has finished, init param:
			clearInterval(interval); interval=null;
			audio_timeCounter=0;
			video_timeCounter=0;
			console.log("video finish");
		}
		//}
	};
	video.onerror = function() {
		console.log("onerror");
	    alert("Error! Something went wrong");
	    alert("Cannot play video because load failed.");
	};
	
	secondSlider_Handler();
}); 

function doEverySecond() {
	//update slider
	video_timeCounter = parseInt($("#secondSlider").val())+1;
	console.log(video_timeCounter);
	$("#secondSlider").val( video_timeCounter );
	$('#showtime').html(video_timeCounter);
	
	$.each(videoJson.elements[video_timeCounter], function(key, val) {
		switch (key) {
			case "photo":
				$("#media-video").attr("poster", videoJson.elements[video_timeCounter].photo);
				break;
			case "text":
				$("#subtitle").html(videoJson.elements[video_timeCounter].text);
				break;
		}
	});
}

function secondSlider_Handler(){
	// Slider triggerd by code
	$("#secondSlider").on("input change",function() {
		secondSlider = this.valueAsNumber;
		$('#showtime').html(secondSlider);
		
		console.log(secondSlider);
	});
	
	// If seek - seek the sound too
	$("#secondSlider").change(function() {
		secondSlider = this.valueAsNumber;
		$('#showtime').html(secondSlider);
		console.log("seek to: "+secondSlider);
		
		// find witch video contain the second user seek
		var bestMatch;
		$.each(videoJson.audio, function(i) {
			if ( (secondSlider >= videoJson.audio[i].startSecond)
				&& (secondSlider <= videoJson.audio[i].startSecond + videoJson.audio[i].length) ){
				bestMatch = i;
			}
		});
		//get the sound in this second-val + how many forward
		calcSeek = (secondSlider-videoJson.audio[bestMatch].startSecond);
		soundContain = videoJson.audio[bestMatch].sound;
		console.log("This second located in: "+soundContain);
		console.log("Need to seek from start: "+calcSeek);
		
		//load & prepare sound
		//change source if need to: 'videoJson.audio[bestMatch].sound' and seek: 'calcSeek'
		//auto play, and at the end do the seek:
		
		//init
		// starttimeMS=0;
		// endtimeMS=0;
		//totaltimeMS=0;
		resttimeMS=0;
		
		isSeek=true;
		audio_timeCounter = bestMatch;
		
		// Play
		$("#audioSrc").attr("src", videoJson.audio[audio_timeCounter].sound);
		var video = document.getElementById("media-video");
		video.load();
		video.play();
		video.currentTime=calcSeek;
		
		
		
		// Start intervals again
//		interval = setInterval(doEverySecond , 1000);
		
		// change shared values
		//audio_timeCounter = bestMatch;
	});
}

// NOT-WORKING as a function
function playAudio(timeToSeek){
	console.log("--start -playAudio()");
	$("#audioSrc").attr("src", videoJson.audio[audio_timeCounter].sound);
	var video = document.getElementById("media-video");
	//video.load();
	video.currentTime=timeToSeek;
	video.play();
	console.log("-- -playAudio()");
}