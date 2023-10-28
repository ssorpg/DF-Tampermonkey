// ==UserScript==
// @name         Double-Click Search
// @grant        none
// @version      1.0
// @description  Allows the user to double-click an item on the marketplace screen to search for it
// @author       ssorpg1
// @match        https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @namespace    https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

	const { Item, DOMEditor } = window.ssorpg1;

	DOMEditor.getInventoryCells.forEach((cell) => cell.addEventListener("dblclick", tradeSearch));

	if (window.inventoryHolder) {
		window.inventoryHolder.addEventListener("mouseout", () => window.infoBox.style.visibility = "hidden");
		window.inventoryHolder.style.overflow = "visible";
	}

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
})();
