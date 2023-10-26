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

window.ssorpg1 ??= {};

(function() {
	"use strict";

	if (window.ssorpg1.WebcallScheduler) {
		return;
	}

	class WebcallScheduler {
		scheduler = null;
		queue = [];

		enqueue(webcall) {
			if (!webcall) {
				return;
			}

			this.queue.push(webcall);
			if (!this.scheduler) {
				this.scheduler = setTimeout(() => this.dequeue(), 0);
			}
		}

		async dequeue() {
			const webcall = this.queue.shift();
			if (!webcall) {
				this.scheduler = clearTimeout(this.scheduler);
				return;
			}

			const res = await webcall();
			if (!res) {
				this.dequeue();
				return;
			}

			this.scheduler = setTimeout(() => this.dequeue(), WebcallScheduler.RATE_LIMIT);
		}
	}

	WebcallScheduler.RATE_LIMIT = 3000;

	window.ssorpg1.WebcallScheduler = new WebcallScheduler();
})();
