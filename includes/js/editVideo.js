var currentPos,
    moveTo,
    videoJson,
    coursesJson,
    rangeXzeroPosition,
    oneStep,
    rangeValue,
    tmpPicture,
    tmpTag,
    moveElementToThisSecond,
    tagSec,
    tagPos,
    imageId,
    degreeSelectedPosition,
    courseSelectedPosition,
    degreeSelectedCode,
    courseSelectedCode,
    clickedTagText,
    currTagInitSecond,
    videoId;


function signinCallback(authResult) {
	if (authResult['status']['signed_in']) {
				gapi.client.load('plus', 'v1', function() {
			var request = gapi.client.plus.people.get({
				'userId' : 'me'
			});
			request.execute(function(resp) {
				console.log(resp);
				
				
					
	$('#userName').html(resp.displayName);
	$('.profilePicture').css('background-image', "url(" + resp.image.url + ")");



			});
		});
		

	} else {
		/*	Update the app to reflect a signed out user
		 Possible error values:
		 "user_signed_out" - User is signed-out
		 "access_denied" - User denied access to your app
		 "immediate_failed" - Could not automatically log in the user */
		console.log('Sign-in state: ' + authResult['error']);

	}
}

$(document).ready(function() {
	videoId = "123";
	/*Get list of courses */
	$.ajax({
		type : "POST",
		url : 'http://lecturus.herokuapp.com/auxiliary/getCourses/',
		dataType : 'json',
		data : {
			email : "vandervidi@gmail.com"
		},
		success : function(data) {
			coursesJson = data;
			console.log(coursesJson);
			/* Get video json from lecturus web-service */
			$.ajax({
				type : "GET",
				url : 'http://lecturus.herokuapp.com/session/getVideoById/?videoId=' + videoId,
				dataType : 'json',
				// data : {
				// videoId : "123"
				// },
				success : function(data) {
					// Save this object for editing.
					videoJson = data.info;

					rangeXzeroPosition = $(".slider").offset().left;
					$(".slider").attr("max", videoJson.totalSecondLength);
					oneStep = $(".slider").width() / videoJson.totalSecondLength;
					rangeValue = parseInt($(".slider").attr("value"));

					console.log(videoJson);

					//set degrees list
					$.each(coursesJson.degrees, function(key, val) {

						if (val.id == videoJson.degree) {
							$("#listOfDegrees").append('<option value="' + key + '" selected>' + val.name + '</option>');
							degreeSelectedPosition = key;
							degreeSelectedCode = val.id;
						} else {
							$("#listOfDegrees").append('<option value="' + key + '">' + val.name + '</option>');
						}
					});

					//Degrees list change event
					$('#listOfDegrees').change(function() {
						courseSelectedPosition = 0;

						//Selected degree id is:
						degreeSelectedPosition = $(this).val();

						//Update the VideoJson value for degree
						videoJson.degree = degreeSelectedCode;
						console.log(videoJson);

						//update Courses list
						updateCoursesList(degreeSelectedPosition);

						//Clear lecturers list
						$("#listOfLecturers").empty();

						//set la lecturer from the first course of the degree selected
						$("#listOfLecturers").append('<option value="' + 0 + '" selected>' + coursesJson.degrees[degreeSelectedPosition].courses[courseSelectedPosition].lecturer + '</option>');

					});

					//set courses list
					$.each(coursesJson.degrees[degreeSelectedPosition].courses, function(key, val) {
						if (val.id == videoJson.course) {
							$("#listOfCourses").append('<option value="' + key + '" selected>' + val.name + '</option>');
							courseSelectedPosition = key;
							courseSelectedCode = val.id;
						} else {
							$("#listOfCourses").append('<option value="' + key + '">' + val.name + '</option>');
						}
					});

					//Courses list change event
					$('#listOfCourses').change(function() {

						//Selected course id is:
						courseSelectedPosition = $(this).val();

						//save the lecturer of the first course in case the user doesnt choose it because it appears first
						videoJson.lecturer = coursesJson.degrees[degreeSelectedPosition].courses[courseSelectedPosition].lecturer;

						//Update the VideoJson value for degree
						videoJson.course = courseSelectedCode;
						console.log(videoJson);

						//Clear lecturers list
						$("#listOfLecturers").empty();

						//update Courses list
						updateLecturersList(degreeSelectedPosition, courseSelectedPosition);
					});

					//set lecturers list
					if (coursesJson.degrees[degreeSelectedPosition].courses[courseSelectedPosition].lecturer == videoJson.lecturer) {
						$("#listOfCourses").append('<option value="' + key + '" selected>' + val.name + '</option>');
					}

					//Set title input
					$("#editLectureTitleInput").val(videoJson.title);

					//Set decription
					$("#descriptionLectureInput").val(videoJson.description);

					//Set privacy switch
					if (videoJson.privacy == true) {
						$("#myonoffswitch").prop('checked', false);

					} else if (videoJson.privacy == false) {
						$("#myonoffswitch").prop('checked', true);
					}
					;
					console.log("privacy = ", $("#myonoffswitch").prop('checked'));

					$("#onoffswitch").on("click", function() {
						console.log("clicked");
						if ($("#myonoffswitch").prop('checked') == false) {
							$("#myonoffswitch").prop('checked', true);
							videoJson.privacy = false;
							console.log(videoJson.privacy);
						} else if ($("#myonoffswitch").prop('checked')) {
							$("#myonoffswitch").prop('checked', false);
							ideoJson.privacy = true;
							console.log(videoJson.privacy);
						}
						;

					});

					//Set draggable images & Set draggable tags
					$.each(videoJson.elements, function(key, val) {
						currTagInitSecond = key;

						if (val.photo) {
							$("<section>", {
								"html" : "<a href='" + val.photo.url + "' data-lightbox='image-" + key + "'><img class='img-thumbnail' src='" + val.photo.url + "'></a>",
								"class" : "draggableImage",
								"id" : "image" + key,
								"css" : {
									"left" : oneStep * key
								}

							}).appendTo("#draggableImagesHolder");
						}
						if (val.tags) {
							$.each(val.tags, function(key, val) {

								$("<section>", {
									"id" : "tagPos" + key + "Sec" + currTagInitSecond,
									"class" : "draggableTag",
									"html" : "<section id='editTagButtonsHolder'>" + "	<section id='tagEditButton'>" + "		<button id='editButton' class='btn btn-info'>Edit</button>" + "		<button id='deleteButton' class='btn btn-danger'>Delete</button>" + " </section>" + "	<section id='confirmOrCancelButtons'>" + "			<button id='confirmButton' class='btn btn-success'>confirm</button>" + "			<button id='cancelButton' class='btn btn-danger'>cancel</button>" + "	</section>" + "</section>" + "<section id='tagTextHolder'>" + val.text + "</section>",
									"css" : {
										"left" : oneStep * currTagInitSecond
									}
								}).appendTo("#draggableTagsHolder");
							});
						}
					});

					$(".draggableImage, .draggableTag").draggable({
						axis : "x",
						containment : "#editWrapper", //The parent element that contains the draggable elements
						drag : function(event, ui) {
							currentPos = $(this).position();
							//console.log("CURRENT: \nLeft: " + currentPos.left + "\nTop: " + currentPos.top);
							moveTo = (currentPos.left + 75) * (videoJson.totalSecondLength / $(".slider").width());
							if (moveTo < 0)
								moveTo = 0;
							// make sure the slider doesnt drag objects to negative values
							$(".slider").val(moveTo);
							$(".slider").attr("value", moveTo);
						}
					});

					//Draggable mouseup event handler
					//Here we update an image.
					$(".draggableImage, .draggableTag").on("mouseup", (function() {
						//Get the value of the slider when an object is released after beeing dragged
						moveElementToThisSecond = parseInt($(".slider").attr("value"), 10);

						//In case a picture is dragged
						if ($(this).hasClass("draggableImage")) {
							//Get the image id of dragged image
							imageId = $(this).attr("id").split("image");
							console.log("This is the image beeing dragged: " + videoJson.elements[imageId[1]].photo.url);

							//Save its value from the Json file representing a video
							tmpPicture = videoJson.elements[imageId[1]].photo;

							//delete the image from the Json
							delete videoJson.elements[imageId[1]].photo;

							if ( typeof videoJson.elements[imageId[1]].tags == "undefined") {
								delete videoJson.elements[imageId[1]];
							}

							//Set a new 'id' attribute to this element
							$(this).attr("id", "image" + moveElementToThisSecond);

							//Add the image to the Json in its new position according to the seconds
							//case 1: Current second has also a tag
							if ( typeof videoJson.elements[moveElementToThisSecond] != "undefined") {
								videoJson.elements[moveElementToThisSecond]['photo'] = tmpPicture;

								

								//case 3 : the element is empty. Add the photo
							} else {
								videoJson.elements[moveElementToThisSecond] = {
									"photo" : tmpPicture
								};
							}

							console.log(moveElementToThisSecond);
							console.log(videoJson);
						}

						//In case a tag is dragged
						else if ($(this).hasClass("draggableTag")) {
							$(".draggableTag button").unbind("mouseup");
							
							tagSec = $(this).attr("id").split("Sec");
							tagPos = tagSec[0].split("Pos");

							//Save its value from the Json file representing a tag
							tmpTag = videoJson.elements[tagSec[1]].tags[tagPos[1]];

							//delete the tag from the Json
							//delete videoJson.elements[tagSec[1]].tags[tagPos[1]];
						console.log("dragged element atags array size = "+ videoJson.elements[tagSec[1]].tags.length );
							videoJson.elements[tagSec[1]].tags.splice(parseInt([tagPos[1]], 10), 1);

							//If 'Tags' array is empty then delete 'Tags' from the videoJson file
							
							console.log("dragged element atags array size = "+ videoJson.elements[tagSec[1]].tags.length );
							if (videoJson.elements[tagSec[1]].tags.length == 0) {
								delete videoJson.elements[tagSec[1]].tags;
							}

							//if 'Photo' and 'Tags array are empty , Delete the whole element from videoJson
							if (( typeof videoJson.elements[tagSec[1]].tags == "undefined") && ( typeof videoJson.elements[tagSec[1]].photo == "undefined")) {
								delete videoJson.elements[tagSec[1]];
							}

							//Add the tag to the Json in its new position according to the seconds
							//case 1: Current second already has some tags
							if ( typeof videoJson.elements[moveElementToThisSecond] != "undefined") {
								if ( typeof videoJson.elements[moveElementToThisSecond].tags != "undefined") {
									videoJson.elements[moveElementToThisSecond].tags.push(tmpTag);

								} else {
									debugger;
									//case 2 : the element doesnt have tags at all
									//			but has an photo
									if ( typeof videoJson.elements[moveElementToThisSecond].photo != "undefined") {
										//save the photo
										tmpPhoto = videoJson.elements[moveElementToThisSecond].photo;
										videoJson.elements[moveElementToThisSecond] = {
											"tags" : [tmpTag],
											"photo" : [tmpPhoto]
										};
									}
									
									

								}
							} else {
								videoJson.elements[moveElementToThisSecond] = {
									"tags" : [tmpTag]
								};
							}

							//Set a new 'id' attribute to this element
							$(this).attr("id", "tagPos" + (videoJson.elements[moveElementToThisSecond].tags.length - 1) + "Sec" + moveElementToThisSecond);

							console.log(moveElementToThisSecond);
							console.log(videoJson);
						}

					}));

					//edit a tag button click listener
					$(".draggableTag #editButton").click(function() {
						//Display confirm or cancel buttons
						$(this).parents().eq(1).children("#confirmOrCancelButtons").css("display", "inline");
						//Save tag text before editing
						var refThis = $(this).parents().eq(2).children("#tagTextHolder");
						clickedTagText = $(this).parents().eq(2).children("#tagTextHolder").text();
						//clear the tag text holder section and append a text area
						refThis.empty();
						var inputForTag = "<textarea id='editTagTextArea' rows='4' cols='20'>" + clickedTagText + "</textarea>";
						$(this).parents().eq(2).children("#tagTextHolder").append(inputForTag);

					});

					//confirm tag edit button click listener
					$(".draggableTag #confirmButton").click(function() {
						var refThis = $(this).parents().eq(2).children("#tagTextHolder");
						//Get text from the text area
						var textAreaTagText = $('#editTagTextArea').val();

						//empty 'tagTextHolder'
						refThis.empty();

						//Hide confirm or cancel buttons
						$(this).parents().eq(1).children("#confirmOrCancelButtons").css("display", "none");

						//save new tag to videoJson file
						var editedTagSec = $(this).parents().eq(2).attr("id").split("Sec");
						var editedTagPos = editedTagSec[0].split("Pos");
						debugger;
						videoJson.elements[editedTagSec[1]].tags[editedTagPos[1]].text =""+ textAreaTagText;

						//add text of new tag to tagTextHolder section
						refThis.text(textAreaTagText);
					});

					//Cancel a tag edit button click listener
					$(".draggableTag #cancelButton").click(function() {
						var refThis = $(this).parents().eq(2).children("#tagTextHolder");

						//Hide confirm or cancel buttons
						$(this).parents().eq(1).children("#confirmOrCancelButtons").css("display", "none");

						//empty 'tagTextHolder'
						refThis.empty();

						//add text of old tag to tagTextHolder section
						refThis.text(clickedTagText);
					});

					//Deleta a tag button click listener
					$(".draggableTag #deleteButton").click(function() {
						//delete the tag from the Json
						var refThis = $(this).parents().eq(2);
						tagSec = $(this).parents().eq(2).attr("id").split("Sec");
						tagPos = tagSec[0].split("Pos");
						delete videoJson.elements[tagSec[1]].tags[tagPos[1]];

						if (( typeof videoJson.elements[tagSec[1]].tags == "undefined") && ( typeof videoJson.elements[tagSec[1]].photo == "undefined")) {
							delete videoJson.elements[tagSec[1]];

						} else if (( typeof videoJson.elements[tagSec[1]].tags == "undefined")) {
							delete videoJson.elements[tagSec[1]].tags;
						}

						//after deletion remove this section from the DOM
						refThis.remove();
						console.log(videoJson);

					});

					//save changes click listener

					$("#saveChanges").click(function() {
						
						//save text from 'title' input to the Json
						videoJson.title = $("#editLectureTitleInput").val();

						//save text from description text area
						videoJson.description = $("#descriptionLectureInput").val();
						debugger;
						$.ajax({
							type : "POST",
							url : 'http://lecturus.herokuapp.com/session/updateSession/',
							dataType : 'json',
							data : videoJson,
							success : function(data) {
								if (data.status == 1) {
									console.log(videoJson);
									alert("updates are sent");
								}
							},
							error : function(objRequest, errortype) {
								console.log("Cannot get video Json");
							}
						});


					});
				},
				error : function(objRequest, errortype) {
					console.log("Cannot get video Json");
				}
			});

		},
		error : function(objRequest, errortype) {
		}
	});

});

/**A function that recieves a degree Id number
 * and updates the courses list accordingly
 * @param {Object} degreeSelectedPosition
 */
function updateCoursesList(degreeSelectedPosition) {
	//Empty the list first
	$("#listOfCourses").empty();

	//set courses list
	$.each(coursesJson.degrees[degreeSelectedPosition].courses, function(key, val) {
		$("#listOfCourses").append('<option value="' + key + '">' + val.name + '</option>');
	});
}

function updateLecturersList(degreeSelectedPosition, courseSelectedPosition) {

	$("#listOfLecturers").append('<option value="' + 0 + '" selected>' + coursesJson.degrees[degreeSelectedPosition].courses[courseSelectedPosition].lecturer + '</option>');
	videoJson.lecturer = coursesJson.degrees[degreeSelectedPosition].courses[courseSelectedPosition].lecturer;
}