// ==UserScript==
// @name         Tooltip Fixer
// @grant        none
// @version      1.0
// @description  Fixes the tooltip becoming stuck on the screen as well as clipping once the tooltip becomes too long
// @author       Ssorpg1
// @match        https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @namespace    https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

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
