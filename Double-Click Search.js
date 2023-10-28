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

	DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("dblclick", tradeSearch));

	async function tradeSearch(e) {
		if (window.marketScreen != "buy") {
			return;
		}

		const itemElement = window.curInfoItem;
        const item = itemElement ? new Item(itemElement) : null;
		console.log(item);
	}
})();
