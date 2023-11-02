// ==UserScript==
// @name		Shift-Click Sell
// @grant		none
// @version		1.0
// @description	Allows the user to shift-click an item on the marketplace screen to sell it
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/WebcallScheduler.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { Item, DOMEditor, WebcallScheduler } = window.ssorpg1;

	let items = {};

	DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("mousedown", (e) => {
		if (window.marketScreen != "sell" || !e.shiftKey) {
			return;
		}

		// Save to variable so we don't lose it
		const itemElement = e.currentTarget.firstChild;
		WebcallScheduler.enqueue(async () => await tradeSearch(itemElement));
	}));

	async function tradeSearch(itemElement) {
		if (window.marketScreen != "sell" || !itemElement) {
			return;
		}

		const newItem = new Item(itemElement);
		const { itemSelector } = newItem;
		const item = items[itemSelector];

		if (item && item.name == newItem.name && Item.checkExpiredPrice(item) && item.marketPriceAverage) {
			items[itemSelector].quantity = item.quantity;
			WebcallScheduler.enqueue(() => sellItem(items[itemSelector]));
			return;
		}

		await newItem.setMarketData();
		newItem.setMarketPriceAverage();
		items[itemSelector] = newItem;
		WebcallScheduler.enqueue(() => sellItem(items[itemSelector]));
		return true;
	}

	function sellItem(item) {
		window.sellItem({
			itemData: {
				0: item.quantity,
				1: item.type
			},
			2: Math.ceil(item.quantity * item.marketPriceAverage),
			3: item.itemNum
		});
		return true;
	}
})();
