// ==UserScript==
// ==UserLibrary==
// @name        WebcallScheduler
// @grant       none
// @version     1.1
// @description Library to provide a client-side ratelimit to webcalls
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/
// @namespace   https://greasyfork.org/users/279200
// ==/UserLibrary==
// ==/UserScript==

(function() {
	"use strict";

	window.ssorpg1 ??= {};
	if (window.ssorpg1.WebcallScheduler) {
		return;
	}

	class WebcallScheduler {
		scheduler = null;
		queue = [];

		// Pass a function which contains a webcall
		enqueue(webcall) {
			if (!webcall) {
				return;
			}

			this.queue.push(webcall);
			if (!this.scheduler) {
				this.scheduler = setTimeout(() => this.dequeue(), 0);
			}
		}

		// Runs the next function in queue
		async dequeue() {
			const webcall = this.queue.shift();
			if (!webcall) {
				this.scheduler = clearTimeout(this.scheduler);
				return;
			}

			const calledToServer = await webcall();
			if (!calledToServer) {
				this.dequeue();
				return;
			}

			this.scheduler = setTimeout(() => this.dequeue(), WebcallScheduler.RATE_LIMIT);
		}
	}

	// Time to wait between webcalls
	WebcallScheduler.RATE_LIMIT = 300;

	window.ssorpg1.WebcallScheduler = new WebcallScheduler();
})();
