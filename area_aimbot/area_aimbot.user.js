// ==UserScript==
// @namespace   Andrew Ault
// @name        Area Aimbot
// @description Never miss a hotspot again :)
// @version 	0.1
// @exclude     *
// @grant 		GM_getResourceText
// @grant 		GM_addStyle
// @run-at 		document-idle
// @noframes
// @resource 	style style.css
// ==/UserScript==

var ext = ext || {
	selectors: ['area', '.hotspot-area'],
	col: {
		def: '#f00',
		hov: '#0f0'
	},
	mouse: {},
	fn: {}
}

//new approach - click through canvas
ext.fn.createCanvas = function() {
	//create our element
	ext.canvasElem = document.createElement('canvas');
	ext.canvasElem.id = 'areaAimbotCanvas';
	
	//throw it on
	document.body.appendChild(ext.canvasElem);
	
	//get the actual canvas
	if(ext.canvasElem.getContext) {
		ext.canvas = ext.canvasElem.getContext("2d");

		return true;
	} else {
		//todo - add fallback? probably not
		console.log('AreaAimbot: Canvas not supported - sorry! :(');

		return false;
	}
}

var getBounds = function(elem) {
	var rect = elem.getBoundingClientRect();

	//areas
	if(elem.coords) {
		var coords = elem.coords.split(',');
		var x = [],
			y = [];

		for(j = 0; j < coords.length; j++) {
			if(j % 2 == 0)
				x[j/2] 			= parseInt(coords[j]);
			else
				y[j/2 - 0.5] 	= parseInt(coords[j]);
		}

		var bounds = [
			Math.min.apply(Math, y), 	//top
			Math.max.apply(Math, x), 	//right
			Math.max.apply(Math, y), 	//bottom
			Math.min.apply(Math, x) 	//left
		];

		rect = {
			x: 		rect.x + bounds[3], 	//x
			y: 		rect.y + bounds[0], 	//y
			width: 	bounds[1] - bounds[3], 	//width
			height: bounds[2] - bounds[0] 	//height
		}
	}
	
	return rect;
}

//draw hook
ext.fn.paint = function(cv) {
	//cumulative list of elems we want
	var elems = [];
	
	for(var i = 0; i < ext.selectors.length; i++) {
		var sel = ext.selectors[i];
		
		var list = document.querySelectorAll(sel);
		
		for(var j = 0; j < list.length; j++) {
			var elem = list[j];
			
			//weird way to make sure it's visible
			if(elem.offsetParent !== null)
				elems[elems.length] = elem;
		}
	}
	
	//get mouse pos
	var m = ext.mouse;
	
	//loop through all of them
	for(var i = 0; i < elems.length; i++) {
		var elem = elems[i];
		var rect = getBounds(elem);
		
		//see if we're hovering
		if(m.x > rect.x && m.x < (rect.x + rect.width) &&
		   m.y > rect.y && m.y < (rect.y + rect.height)) {
			if(elem.title) {
				cv.fillStyle = 'rgba(0, 0, 0, 0.5)';
				cv.fillRect(rect.x, rect.y + rect.height - 24, rect.width, 24);
				
				cv.font = '12px arial';
				cv.fillStyle = '#fff';
				cv.fillText(elem.title, rect.x + 8, rect.y + rect.height - 8);
			}
			
			cv.strokeStyle = ext.col.hov;
		} else
			cv.strokeStyle = ext.col.def;
		
		cv.strokeRect(rect.x, rect.y, rect.width, rect.height);
	}
	
	//check onclicks
	var as = document.querySelectorAll('*[onclick]');
	
	for(var i = 0; i < as.length; i++) {
		var a 		= as[i];
		var rect 	= getBounds(a);
		
		//see if we're hovering
		if(m.x > rect.x && m.x < (rect.x + rect.width) &&
		   m.y > rect.y && m.y < (rect.y + rect.height)) {
			var onclick = a.onclick.toString().match(/{[^}]([^}]*)/)[1];

			cv.font = '12px arial';
			var metrics = cv.measureText(onclick);

			cv.fillStyle = 'rgba(0, 0, 0, 0.5)';
			cv.fillRect(rect.x, rect.y + rect.height, metrics.width + 12, 24);

			cv.fillStyle = '#fff';
			cv.fillText(onclick, rect.x + 8, rect.y + rect.height + 16);
		}
	}
	
	//paint the mouse
	//cv.fillStyle = '#0ff';
	//cv.fillRect(m.x - 1, m.y - 1, 2, 2);
}

//think
ext.fn.think = function() {
	var cv = ext.canvas;

	//make our context size fit our real size
	var w = cv.canvas.clientWidth,
		h = cv.canvas.clientHeight;

	if(cv.canvas.width != w || cv.canvas.height != h) {
		cv.canvas.width = w;
		cv.canvas.height = h;
		
		cv.clearRect(0, 0, w, h)
		ext.fn.paint(cv);
	}
}

ext.init = function() {
	//see if we need it - don't run on every page
	var found = false;
	
	for(var i = 0; i < ext.selectors.length; i++)
		if(document.querySelector(ext.selectors[i]))
			found = true;
	
	if(!found) {
		console.log('no elems found');
		//return;
	}
	
	//add styles to our document
	GM_addStyle(GM_getResourceText('style'));
	
	if(!ext.fn.createCanvas()) return;
	
	//hook the mouse
	var update = function(e) {
		if(e) {
			ext.mouse.x = e.clientX;
			ext.mouse.y = e.clientY;
		}
		
		var cv = ext.canvas;
		
		cv.clearRect(0, 0, cv.canvas.width, cv.canvas.height);
		ext.fn.paint(cv);
	}
	
	document.documentElement.onmousemove = update;
	
	//first paint
	update();
	
	//think
	window.setInterval(ext.fn.think, 100);
}

ext.init();