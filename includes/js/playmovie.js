var videoJson;
var video_timeCounter=0;	//whole video
var audio_timeCounter=0;	//specific audio playing
var interval;
var onpause;
var onended;
$(document).ready(function() {
	
	// for (i=60; i<250; i++){
	//		console.log('"'+i+'" : {\n"text" : "this is titles '+i+'"\n},\n');
	// }
	
	/* download video json from lecturus web-service */
	$.ajax({
        type: "GET",
        url: 'includes/js/test_video.json',
        async: false,
        success : function(data) {
			// Build video obj
			videoJson = data;
			//put the first audio
			$("#audioSrc").attr("src", videoJson.audio[audio_timeCounter]);
			
			$("#title").html(videoJson.title);
		}
    });
	

	
	var video = document.getElementById("video");
	video.oncanplaythrough  = function() {
		console.log("oncanplaythrough");
	};
	video.onplay = function() {
		console.log("onPlay");
		if (interval == null){
			interval = setInterval(doEverySecond , 1000);
		}
		// init:
		onpause=false;
		onended=false;
	};
	video.onpause = function() {
		console.log("onPause");
		clearInterval(interval); interval=null;
		onpause=true;
	};
	video.onended = function() {
		console.log("onended");
		
		onended=true;
		// Audio has finish
		if (onpause && onended){
			audio_timeCounter++;
			
			// If thare are more videos
			if (Object.keys(videoJson.audio).length > audio_timeCounter){
				
				// Change audio source
				// Load & play
				$("#audioSrc").attr("src", videoJson.audio[audio_timeCounter]);
				video.load();
				video.play();
				
				// Start intervals again
				interval = setInterval(doEverySecond , 1000);
			}else{
				// video has finished, init param:
				clearInterval(interval); interval=null;
				audio_timeCounter=0;
				video_timeCounter=0;
			}
		}
	};
}); 

function doEverySecond() {
	$.each(videoJson.elements[video_timeCounter], function(key, val) {
		switch (key) {
			case "photo":
				$("#video").attr("poster", videoJson.elements[video_timeCounter].photo);
				break;
			case "text":
				$("#subtitle").html(videoJson.elements[video_timeCounter].text);
				break;
		}
	}); 
	video_timeCounter++;
}

// function simulateEvent(tag, eventName){
		// // Create event and fire it.
		// debugger;
		// //if (eventName!="blur"){
			// if ("createEvent" in document) {
				// var eventItem = document.createEvent("HTMLEvents");
				// eventItem.initEvent(eventName ,true,true);
				// tag.dispatchEvent(eventItem);
				// // try{
					// // tag.trigger(eventName);
				// // }catch(e){
					// // console.log("e");
				// // }
			// }
			// else
			    // tag.fireEvent("on"+eventName);
		// //}else{
		// //	if (document.dispatchEvent) {// W3C
		// //		var oEvent = document.createEvent("MouseEvents");
		// //		oEvent.initMouseEvent("blur", true, true, window, 1, 1, 1, 1, 1, false, false, false, false, 0, tag);
		// //		tag.dispatchEvent(oEvent);
		// //	}else if (document.fireEvent) {// IE
		// //		tag.fireEvent("onblur");
		// //	}
		// //}
	// }