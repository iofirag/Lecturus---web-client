function get_name_from_degreeNum( degreeNum ){
	
	return degreeNum;
}

function get_name_from_courseNum( courseNum ){
	
	return courseNum;
}

function isAdmin(){
	if (videoJson.owner == window.localStorage.getItem("userEmail")){
		return true;
	}
	return false;
}

function secondToTime(second){
	var sec_num = parseInt(second, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);
	
	if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    
	// remove zore priffix 
    for (i=0; i<4; i++){
    	if (time[0]=='0' || time[0]==':'){
    		time = time.substring(1, time.length);
    	}
    }
    return time;
}

//Initialize the top nav with user's details
function initializeTopNav() {
	$('#userName').html(window.localStorage.getItem("userName"));
	var url_img = window.localStorage.getItem("profilePicture");
	if (url_img != null) $('.profilePicture').css('background-image', "url(" + url_img + ")");
}

function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}