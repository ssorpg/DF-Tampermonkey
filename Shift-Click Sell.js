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

	window.ssorpg1.items ??= {};
	const { items, Item, DOMEditor, WebcallScheduler } = window.ssorpg1;

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
		const curItem = items[newItem.itemSelector];

		if (!newItem.itemNum || !newItem.transferable) {
			return;
		}

		if (curItem && curItem.name == newItem.name && Item.checkExpiredPrice(curItem) && curItem.marketPriceAverage) {
			curItem.quantity = newItem.quantity;
			curItem.itemNum = newItem.itemNum;
			sellItem(curItem);
			return true;
		}

		await newItem.setMarketData();
		newItem.setMarketPriceAverage();
		items[newItem.itemSelector] = newItem;
		sellItem(newItem);
		return true;
	}

	// TODO: fix inventory bug when `enqueue`ing this
	function sellItem(item) {
		window.sellItem({
			itemData: {
				0: item.itemNum,
				1: item.itemSelector
			},
			2: Math.ceil(item.quantity * item.marketPriceAverage)
		});
	}
})();
