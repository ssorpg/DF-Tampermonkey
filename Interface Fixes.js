// ==UserScript==
// @name		Interface Fixes
// @grant		none
// @version		1.0
// @description	Fixes various interface bugs
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { ssorpg1, inventoryHolder, infoBox, marketScreen } = window;
	const { DOMEditor } = ssorpg1;

	// Hides the tooltip when not hovering over an item
	if (inventoryHolder) {
		inventoryHolder.addEventListener("mouseout", () => infoBox.style.visibility = "hidden");
		inventoryHolder.style.overflow = "visible";
	}

	// Allows the infoBox to flow outside the main game window
	const overflowHiddenElements_1 = document.getElementsByClassName("design2010");
	if (overflowHiddenElements_1) {
		Array.from(overflowHiddenElements_1).forEach((element) => {
			if (element.tagName == "TABLE") {
				element.style.overflow = "visible";
			}
		});
	}

	const overflowHiddenElements_2 = document.querySelectorAll("[style*='_height: 1%; overflow: auto;']");
	if (overflowHiddenElements_2) {
		Array.from(overflowHiddenElements_2).forEach((element) => element.style.overflow = "visible");
	}

	// Unlocks the page after exiting a context menu in the marketplace
	if (marketScreen) {
		const { ctxMenuHolder } = window;

		let contextMenuOpened = false;

		const newEventListenerParams = {
			element: inventoryHolder,
			event: "contextmenu",
			functionName: "openSellContextMenu",
			functionBefore: null,
			functionAfter: () => contextMenuOpened = true
		};

		DOMEditor.replaceEventListener(newEventListenerParams);

		document.addEventListener("mousedown", (e) => {
			if (contextMenuOpened && e.target !== ctxMenuHolder && e.target.parentNode !== ctxMenuHolder) {
				window.pageLock = false;
				contextMenuOpened = false;
			}
		});
	}
})();
