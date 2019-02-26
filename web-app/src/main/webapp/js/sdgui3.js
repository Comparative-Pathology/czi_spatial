const mouse = {
	x : 0,
	y : 0, // coordinates
	lastX : 0,
	lastY : 0, // last frames mouse position
	guiX : 0
// lastX for GUI line not query
}

var clickQuery = false;
var lastX = 0;

$.getScript("js/human.js");
$.getScript("js/scale.js");
$.getScript("js/mouse.js");

function resizeCanvas() {
	var dpi = window.devicePixelRatio;
	var can = document.getElementById('modelCanvas');
	var ctx = can.getContext('2d');
	var style_height = +getComputedStyle(can).getPropertyValue("height").slice(
			0, -2);
	var style_width = +getComputedStyle(can).getPropertyValue("width").slice(0,
			-2);

	can.setAttribute('height', style_height * dpi);
	can.setAttribute('width', style_width * dpi);
	drawHuman();

	can = document.getElementById('scaleCanvas');
	can.setAttribute('height', style_height * dpi);
	can.setAttribute('width', style_width * dpi);
	drawScale();

	can = document.getElementById('modelCanvas2');
	can.setAttribute('height', style_height * dpi);
	can.setAttribute('width', style_width * dpi);
	drawMouse();
};

function mouseClicked(event) {
	if (clickQuery) {
		var clickTypeSelected = document.getElementById('clickType').value;
		if ($(model2row).is(':hidden') && clickTypeSelected == '') {
			alert("Please use the listbox to select a type of query.");
		} else {
			if (clickTypeSelected == 'point' || lastX == 0
					|| $(model2row).is(':visible')) {
				resizeCanvas();
				document.getElementById('displayArea').innerHTML = "<br />";
			}
			var can = document.getElementById('modelCanvas');
			var ctx = can.getContext('2d');
			var bounds = can.getBoundingClientRect();
			// get the mouse coordinates, subtract the canvas top left and any
			// scrolling
			mouse.x = event.pageX - bounds.left - scrollX;
			mouse.y = event.pageY - bounds.top - scrollY;
			// first normalize the mouse coordinates from 0 to 1 (0,0) top left
			// off canvas and (1,1) bottom right by dividing by the bounds width
			// and height
			mouse.x /= bounds.width;
			mouse.y /= bounds.height;
			// then scale to canvas coordinates by multiplying the normalized
			// coords with the canvas resolution
			mouse.x *= can.width;
			mouse.y *= can.height;

			var queryPos = Math.round(h_length - ((mouse.x / can.width) * h_length));

			// draw line
			var can = document.getElementById('modelCanvas');
			var ctx = can.getContext('2d');
			ctx.beginPath();
			ctx.strokeStyle = "red";
			ctx.lineWidth = 10;
			ctx.moveTo(mouse.x, (can.height / 2));
			ctx.lineTo(mouse.x, (can.height / 2) + 40);
			ctx.stroke();

			if ($(model2row).is(':visible')) {
				Query4Mapping(queryPos, 'human', 'mouse');
			} else if (clickTypeSelected == 'point') {
				alert(2);
				QueryBySingleClick(queryPos, 'human');
			} else if (lastX == 0) {
				lastX = queryPos;
			} else if (lastX != 0) {
				if (lastX < queryPos) {
					QueryByDoubleClick(lastX, queryPos, 'human');
				} else {
					QueryByDoubleClick(queryPos, lastX, 'human');
				}
				guiX = lastX;
				lastX = 0;
			}
		}
	} else {
		alert("Switch to the 'Click 2 Query' tab");
	}
}

function drawMousePoint(point) {	
	alert("WTF! "+point);
	var can = document.getElementById('modelCanvas2');
	var m_unit = (can.width - 1) / m_length;
	var ctx = can.getContext('2d');
	alert(can.width + " " + m_length + " " + m_unit);
	ctx.beginPath();
	ctx.strokeStyle = "red";
	ctx.lineWidth = 10;
//	ctx.moveTo(can.width / 2, (can.height / 2));
//	ctx.lineTo(can.width / 2, (can.height / 2) + 40);
	alert(point + " " + (m_anus - point) + " " + (m_anus - point) * m_unit + " "+ can.width);
	ctx.moveTo((m_anus - point) * m_unit, (can.height / 2));
	ctx.lineTo((m_anus - point) * m_unit, (can.height / 2) + 40);	
	ctx.stroke();
}

function processOutput(queryResult) {
	alert(queryResult);
	var output = '';
	var obj = JSON.parse(queryResult);
	if (obj.status === 'fail') {
		output = "<div><b>MESSAGE:<p>" + obj.message + "</p></b></div>";
	} else {

		if (clickQuery || $(model2row).is(':visible')) {
			var clickTypeSelected = document.getElementById('clickType').value;
			if (clickTypeSelected == 'point') {
				var queryPos = Math.round(h_length - ((mouse.x / can.width-1) * h_length));
				output = "<br /><h3>Results for point: "
						+ queryPos
						+ "</h3><table><tr><th>image id</th><th>position</th></tr>";
			} else if (clickTypeSelected == 'range') {
				// range
				var rangePos1 = Math.round(h_length - ((mouse.x / can.width-1) * h_length));
				var rangePos2 = guiX;
				if (rangePos1 < rangePos2) {
					output = "<br /><h3>Results for range: "
							+ rangePos1
							+ " to "
							+ rangePos2
							+ "</h3><table><tr><th>image id</th><th>position</th></tr>";
				} else {
					output = "<br /><h3>Results for range: "
							+ rangePos2
							+ " to "
							+ rangePos1
							+ "</h3><table><tr><th>image id</th><th>position</th></tr>";
				}
				guiX = 0;
			} else {
				var queryPos = Math.round(h_length - ((mouse.x / can.width-1) * h_length));
				output = "<br /><h3>Human point: " + queryPos
						+ "mm maps to Mouse point: " + guiX
				+"mm</h3><p>Results for the mouse are: </p> <br />" +
						"<table><tr><th>image id</th><th>position</th></tr>";

				drawMousePoint(guiX);
				guiX = 0;
			}
		} else {
			output = "<br /><h3>Results</h3><table><tr><th>image id</th><th>position</th></tr>";
		}
		var obj = JSON.parse(queryResult);
		for (i in obj.result) {
			output += "<tr><td>" + obj.result[i].imageId + "</td><td>"
					+ obj.result[i].position + "</td></tr>";
		}
		output += "</table>";
	}
	document.getElementById("displayArea").innerHTML = output;
}

function Query4Mapping(point, species1, species2) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && (this.status == 200 || this.status == 500)) {			
			alert(this.responseText);
			var obj = JSON.parse(this.responseText);
			var position2 = obj.result.position2;
			alert(position2);
			// processOutput(this.responseText);
			guiX = position2;
			QueryBySingleClick(position2, 'mouse');
		}
		;
	};
	var url = "mapping/" + species1 + "/" + species2 + "?point=" + point;
	xhttp.open("GET", encodeURI(url), true);
	xhttp.send();
}

function QueryBySingleClick(point, species) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && (this.status == 200 || this.status == 500)) {			
			processOutput(this.responseText);
		}
		;
	};
	var url = "query/" + species + "/searchByPosition?point=" + point;
	xhttp.open("GET", encodeURI(url), true);
	xhttp.send();
}

function QueryByDoubleClick(start, stop, species) {
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && (this.status == 200 || this.status == 500)) {			
			processOutput(this.responseText);
		}
		;
	};
	var url = "query/" + species + "/searchByRange?point1=" + start 
			+ "&point2=" + stop;
	xhttp.open("GET", encodeURI(url), true);
	xhttp.send();
}

function Query(operation, value, species) {
	resizeCanvas();
	document.getElementById('displayArea').innerHTML = "<br />";
	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if (this.readyState == 4 && (this.status == 200 || this.status == 500)) {			
			processOutput(this.responseText);
		}
		;
	};
	var url = "query/";
	if (operation == "searchByComponent") {
		url += species + "/searchByComponent?component=" + value;
		// } else if (operation == "searchByPosition") {
		// var position = 2000;
		// switch (value) {
		// case "apr":
		// position = 100;
		// break;
		// case "icv":
		// position = 1500;
		// break;
		// case "hf":
		// position = 1310;
		// break;
		// case "sf":
		// position = 810;
		// break;
		// default:
		// alert('Invalid landmark selected!');
		// }
		// url += species+"/searchByPosition?point=" + position;
	} else {
		alert("Unknow search type");
	}
	xhttp.open("GET", encodeURI(url), true);
	xhttp.send();
	updateHuman(value);
}

// function QueryHalf(axis, component) {
// document.getElementById('displayArea').innerHTML = "<br />";
// resizeCanvas();
// var startPos = 200;
// var stopPos = 201;
// var image = component + "_" + axis;
//
// if (component == 'anal') {
// if (axis == 'distal') {
// startPos = 0;
// stopPos = 2;
// } else if (axis == 'proximal') {
// startPos = 2;
// stopPos = 4;
// }
// } else if (component == 'rectum') {
// if (axis == 'distal') {
// startPos = 4;
// stopPos = 10;
// } else if (axis == 'proximal') {
// // ± 3
// startPos = 10;
// stopPos = 16;
// }
// } else if (component == 'sigmoid') {
// if (axis == 'distal') {
// startPos = 16;
// stopPos = 36;
// } else if (axis == 'proximal') {
// startPos = 36;
// stopPos = 56;
// }
// } else if (component == 'descending') {
// if (axis == 'distal') {
// startPos = 16;
// stopPos = 36;
// } else if (axis == 'proximal') {
// startPos = 36;
// stopPos = 56;
// }
// } else if (component == 'transverse') {
// if (axis == 'distal') {
// startPos = 16;
// stopPos = 36;
// } else if (axis == 'proximal') {
// startPos = 36;
// stopPos = 56;
// }
// } else if (component == 'ascending') {
// if (axis == 'distal') {
// startPos = 16;
// stopPos = 36;
// } else if (axis == 'proximal') {
// startPos = 36;
// stopPos = 56;
// }
// } else if (component == 'cecum') {
// if (axis == 'distal') {
// startPos = 16;
// stopPos = 36;
// } else if (axis == 'proximal') {
// startPos = 36;
// stopPos = 56;
// }
// }
//
// var xhttp = new XMLHttpRequest();
// xhttp.onreadystatechange = function() {
// if (this.readyState == 4 && this.status == 200 || this.readyState == 4
// && this.status == 500) {
// processOutput(this.responseText);
// }
// ;
// };
// xhttp.open("GET", "query/searchByRange/" + startPos + "/" + stopPos, true);
// xhttp.send();
// updateModel(image);
// }

// function QueryRange(place, nearBy) {
// document.getElementById('displayArea').innerHTML = "<br />";
// resizeCanvas();
// var startPos = 200;
// var stopPos = 201;
// var image = nearBy + "_" + place;
//
// if (nearBy == 'anal') {
// if (place == 'start') {
// startPos = 0;
// stopPos = startPos + 3;
// } else if (place == 'middle') {
// // the whole thing
// startPos = 0;
// stopPos = 4;
// } else if (place == 'end') {
// stopPos = 4;
// startPos = stopPos - 3;
// }
// } else if (nearBy == 'rectum') {
// if (place == 'start') {
// startPos = 4;
// stopPos = startPos + 3;
// } else if (place == 'middle') {
// // ± 3
// startPos = 7;
// stopPos = 13;
// } else if (place == 'end') {
// stopPos = 16;
// startPos = stopPos - 3;
// }
// } else if (nearBy == 'sigmoid') {
// if (place == 'start') {
// startPos = 16;
// stopPos = startPos + 3;
// } else if (place == 'middle') {
// startPos = 33;
// stopPos = 39;
// } else if (place == 'end') {
// stopPos = 56;
// startPos = stopPos - 3;
// }
// } else if (nearBy == 'descending') {
// if (place == 'start') {
// startPos = 56;
// stopPos = startPos + 3;
// } else if (place == 'middle') {
// // not quite the middle
// startPos = 65;
// stopPos = 71;
// } else if (place == 'end') {
// stopPos = 81;
// startPos = stopPos - 3;
// }
// } else if (nearBy == 'transverse') {
// if (place == 'start') {
// startPos = 81;
// stopPos = startPos + 3;
// } else if (place == 'middle') {
// startPos = 103;
// stopPos = 109;
// } else if (place == 'end') {
// stopPos = 131;
// startPos = stopPos - 3;
// }
// } else if (nearBy == 'ascending') {
// if (place == 'start') {
// startPos = 131;
// stopPos = startPos + 3;
// } else if (place == 'middle') {
// startPos = 135;
// stopPos = 141;
// } else if (place == 'end') {
// stopPos = 146;
// startPos = stopPos - 3;
// }
// } else if (nearBy == 'cecum') {
// if (place == 'start') {
// startPos = 146;
// stopPos = startPos + 3;
// } else if (place == 'middle') {
// // whole thing
// startPos = 146;
// stopPos = 150;
// } else if (place == 'end') {
// stopPos = 150;
// startPos = stopPos - 3;
// }
// }
//
// var xhttp = new XMLHttpRequest();
// xhttp.onreadystatechange = function() {
// if (this.readyState == 4 && this.status == 200 || this.readyState == 4
// && this.status == 500) {
// processOutput(this.responseText);
// }
// ;
// };
// xhttp.open("GET", "query/searchByRange/" + startPos + "/" + stopPos, true);
// xhttp.send();
// updateModel(image);
// }
