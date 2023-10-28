// ==UserScript==
// @name		Double-Click Search
// @grant		none
// @version		1.0
// @description	Allows the user to double-click an item on the marketplace screen to search for it
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/DOMEditor.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { Item, DOMEditor, WebcallScheduler } = window.ssorpg1;

	DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("dblclick", (e) => {
		if (window.marketScreen != "buy") {
			return;
		}

		WebcallScheduler.enqueue(tradeSearch);
	}));

	async function tradeSearch() {
		if (window.marketScreen != "buy") {
			return;
		}

		const itemElement = window.curInfoItem;

		if (!itemElement) {
			return;
		}

		const item = new Item(itemElement);

		const {
			searchField,
			categoryChoice,
			cat,
			makeSearch
		} = DOMEditor.getTradeSearchElements();

		searchField.value = item.marketName;
		categoryChoice.dataset.catname = "";
		categoryChoice.dataset.cattype = "";
		cat.textContent = "Everything";
		makeSearch.disabled = false;

		window.search();
		return true;
	}
})();
