// ==UserScript==
// @namespace 	andyault
// @name 		Facepunch new post button
// @description Adds the new post button to every thread
// @version 	0.1
// @include 	*facepunch.com*
// @run-at 		document-idle
// ==/UserScript==

(function() {
	var threads = document.getElementsByClassName('threadtitle');

	for(var i = 0; i < threads.length; i++) {
		var thread = threads[i];

		if(!thread.getElementsByClassName('newposts').length) {
			var threadId = thread.firstElementChild.id.match(/\d+$/)[0];

			var btn = document.createElement('a');
			btn.id = 'thread_gotonew_' + threadId;
			btn.className = 'newposts';
			btn.href = 'showthread.php?t=' + threadId + '&goto=newpost';

			btn.innerHTML = '<img src="/fp/newpost.gif"></img> newest post';

			thread.appendChild(btn);
		}
	}
})();