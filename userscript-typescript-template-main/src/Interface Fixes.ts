// ==UserScript==
// @name		Interface Fixes
// @grant		none
// @version		1.0
// @description	Fixes various interface bugs
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

"use strict";

import { IInventoryJS, IMarketJS, Issorpg1 } from "./Interfaces/Window";
import { windowHasInventoryJS, windowHasMarketJS } from "./Libraries/TypeChecks";
import "./Libraries/DOMEditor";

declare const window: Window & IInventoryJS & IMarketJS & Issorpg1;

(function() {
	const { inventoryHolder, infoBox } = window;

	// Hides the tooltip when not hovering over an item
	if (windowHasInventoryJS()) {
		inventoryHolder.addEventListener("mouseout", () => infoBox.style.visibility = "hidden");
		inventoryHolder.style.overflow = "visible";
	}

	// Allows the infoBox to flow outside the main game window
	const overflowHiddenElements_1 = document.getElementsByClassName("design2010") as HTMLCollectionOf<HTMLElement>;
	if (overflowHiddenElements_1) {
		Array.from(overflowHiddenElements_1).forEach((element) => {
			if (element.tagName == "TABLE") {
				element.style.overflow = "visible";
			}
		});
	}

	const overflowHiddenElements_2 = document.querySelectorAll("[style*='_height: 1%; overflow: auto;']") as NodeListOf<HTMLElement>;
	if (overflowHiddenElements_2) {
		Array.from(overflowHiddenElements_2).forEach((element) => element.style.overflow = "visible");
	}

	// Unlocks the page after exiting a context menu in the marketplace
	if (windowHasInventoryJS() && windowHasMarketJS()) {
		const { ctxMenuHolder } = window;

		let contextMenuOpened = false;

		const newEventListenerParams = {
			element: inventoryHolder,
			event: "click",
			functionName: "openSellContextMenu",
			functionAfter: () => contextMenuOpened = true
		};

		window.ssorpg1_DOMEditor.replaceEventListener(newEventListenerParams);

		document.addEventListener("mousedown", (e) => {
			// Not sure what the mouse clicked on, so just return
			if (!(e.target instanceof HTMLElement)) {
				return;
			}

			if (contextMenuOpened && e.target != ctxMenuHolder && e.target.parentElement != ctxMenuHolder) {
				window.pageLock = false;
				contextMenuOpened = false;
			}
		});
	}
})();
