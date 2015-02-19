var videoJson;

var video_timeCounter=0;	//whole video
var audio_timeCounter=0;	//specific audio playing

var interval;

//stopwatch
var starttimeMS;
var endtimeMS;
var totaltimeMS=0;
var resttimeMS=0;

var seek=false;
$(document).ready(function() {
	
	/* download video json from lecturus web-service */
	$.ajax({
        type: "GET",
        url: 'includes/js/test_video.json',
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
		if (seek){
			//init layout
			$("#subtitle").html("");
			$("#media-video").attr("poster", 'includes/media/default_poster.png');
			
			// Show the last pic (optional the text too if exist)
			for (i=$("#secondSlider").val(); i>=0; i--){
				if (videoJson.elements.hasOwnProperty(i+'')){
					if (videoJson.elements[i].hasOwnProperty('photo')){
						$("#media-video").attr("poster", videoJson.elements[i].photo);
						if (videoJson.elements[i].hasOwnProperty('text')){
							$("#subtitle").html(videoJson.elements[i].text);
						}
						break;
					}
				}
			}
			seek=false;
		}
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
		if (audio_timeCounter < videoJson.audio.length){
			
			// Change audio-source & Load func & Play func
			playAudio_withSeek(0);
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
	
	// Update input-range fill before and after thumb
	var val = (video_timeCounter - $("#secondSlider").attr('min')) / ($("#secondSlider").attr('max') - $("#secondSlider").attr('min'));
	$("#secondSlider").css('background-image',
		                '-webkit-gradient(linear, left top, right top, '
		                + 'color-stop(' + val + ', #94A14E), '
		                + 'color-stop(' + val + ', #C5C5C5)'
		                + ')'
	);
		                
	// Check if there is element with 'video_timeCounter' key
	if (videoJson.elements.hasOwnProperty(video_timeCounter+'')){
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
}

function secondSlider_Handler(){
	// If seek - seek the sound too
	$("#secondSlider").on("input change",function() {	
	
	// $("#secondSlider").change(function() {
		seek=true;
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
		//get the sound in this second-val + seconds_to_forward
		calcSeek = (secondSlider-videoJson.audio[bestMatch].startSecond);
		soundContain = videoJson.audio[bestMatch].sound;
		console.log("This second located in: "+soundContain);
		console.log("Need to seek from start: "+calcSeek);
		
		
		
		//load & prepare sound
		//change source if need to: 'videoJson.audio[bestMatch].sound' and seek: 'calcSeek'
		//auto play, and at the end do the seek:
		
		audio_timeCounter = bestMatch;
		
		// Play
		playAudio_withSeek(calcSeek);
	});
}

function playAudio_withSeek(timeToSeek){
	$("#audioSrc").attr("src", videoJson.audio[audio_timeCounter].sound);
	var video = $("#media-video")[0];
	video.load();
	video.play();
	video.currentTime=timeToSeek;
}