var video; 
var current=0;
var interval;
$(document).ready(function() {
	
	/* download video json from lecturus web-service */
	$.ajax({
        type: "GET",
        url: 'includes/js/test_video.json',
        async: false,
        success : function(data) {
			// Build video obj
			video = data;
			//put the first
			$("#audioSrc").attr("src", video.elements[0].audio);
		}
    });
	

	
	var audio = document.getElementById("audio");
	audio.oncanplaythrough  = function() {
		current=0;
		//alert("Can play through video without stopping");
	};
	audio.onended = function() {
		current=0;
		alert("The video has ended");
	};
	audio.onplay = function() {
		interval = setInterval(doEverySecond , 1000);
	};
	audio.onpause = function() {
		clearInterval(interval);
	};
}); 

function doEverySecond() {

	$.each(video.elements[current], function(key, val) {
		switch (key) {
			case "audio":
				// fire onclick
				break;
			case "photo":
				$("#photo").attr("src", video.elements[current].photo);
				break;
			case "text":
				$("#title").html(video.elements[current].text);
				break;
		}
	}); 

	current++;
}