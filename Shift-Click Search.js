// ==UserScript==
// @name		Shift-Click Search
// @grant		none
// @version		1.0
// @description	Allows the user to shift-click an item on the marketplace screen to search for it
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/WebcallScheduler.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { ssorpg1, marketScreen, search } = window;
	const { Item, DOMEditor, WebcallScheduler } = ssorpg1;

	DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("mousedown", (e) => {
		if (marketScreen != "buy" || !e.shiftKey) {
			return;
		}

		// Save to variable so we don't lose it
		const itemElement = e.currentTarget.firstChild;
		WebcallScheduler.enqueue(async () => await tradeSearch(itemElement));
	}));

	async function tradeSearch(itemElement) {
		if (marketScreen != "buy" || !itemElement) {
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

		search();
		return true;
	}
})();
