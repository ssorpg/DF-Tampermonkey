"use strict";

import { Issorpg1 } from "../Interfaces/Window";

declare const window: Window & Issorpg1;

export class WebcallScheduler {
	static readonly RATE_LIMIT = 300;	// Time to wait between webcalls

	timeout: NodeJS.Timeout | number = 0;
	queue: (() => Promise<boolean>)[] = [];

	// Pass a callback which contains a webcall
	enqueue(callback: (() => Promise<boolean>), toFront?: Boolean) {
		if (toFront) {
			this.queue.unshift(callback);
		}
		else {
			this.queue.push(callback);
		}
		
		if (!this.timeout) {
			this.timeout = setTimeout(() => this.dequeue(), 0);
		}
	}

	// Runs the next function in queue
	async dequeue() {
		const callback = this.queue.shift();
		if (!callback) {
			clearTimeout(this.timeout);
			return;
		}

		const calledToServer = await callback();
		if (!calledToServer) {
			this.dequeue();
			return;
		}

		this.timeout = setTimeout(() => this.dequeue(), WebcallScheduler.RATE_LIMIT);
	}
}

window.ssorpg1_WebcallScheduler ??= new WebcallScheduler();
