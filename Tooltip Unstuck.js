// ==UserScript==
// @name         Tooltip Unstuck
// @grant        none
// @version      1.0
// @description  Fixes the tooltip becoming stuck on the screen
// @author       Ssorpg1
// @match        https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @namespace    https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

	const inventory = document.getElementById("inventoryholder");
	if (!inventory) {
		return;
	}

	inventory.addEventListener("mouseout", () => document.getElementById("infoBox").style.visibility = "hidden");
})();
