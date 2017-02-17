// ==UserScript==
// @name        4chan full res thumbs
// @namespace   andyault
// @include     http://boards.4chan.org/*/thread/*
// @version     1
// @grant       none
// ==/UserScript==

var preload = function(elem) {
  if(elem.href.indexOf('.gif') + elem.href.indexOf('.webm') < 0)
    elem.children[0].src = elem.href;
  else {
    //not sure if this works for webms
    var img = new Image();
    img.src = elem.href;
  }
}

window.onload = function() {
  var thumbs = document.getElementsByClassName('fileThumb');
  
  for(var i = 0; i < thumbs.length; i++) {
    preload(thumbs[i]);
  }
}

document.addEventListener('4chanThreadUpdated', function(event) {
  if(!event) return;
  
  var thumbs = document.getElementsByClassName('fileThumb');
  
  for(var i = -event.detail.count; i < 0; i++) {
    preload(thumbs[thumbs.length + i]);
  }
})