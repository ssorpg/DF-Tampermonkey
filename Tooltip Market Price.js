// ==UserScript==
// @name		Tooltip Market Price
// @grant		none
// @version		1.0
// @description	Automatically fetches the current market price of hovered inventory items and displays it in the tooltip
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/DF3D/DF3D_InventoryPage.php?page=31*
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/WebcallScheduler.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Helpers.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	if (!window.inventoryHolder) {
		return;
	}

	window.ssorpg1.items ??= {};
	const { items, Item, DOMEditor, WebcallScheduler, Helpers } = window.ssorpg1;

	const newEventListenerParams = {
		element: window.inventoryHolder,
		event: "mousemove",
		functionName: "infoCard",
		functionBefore: null,
		functionAfter: setNextItem
	};

	DOMEditor.replaceEventListener(newEventListenerParams);

	// Disabled when dragging and dropping
	let dragging = false;
	document.addEventListener("mousedown", (e) => dragging = true);
	document.addEventListener("mouseup", (e) => dragging = false);

	function setNextItem() {
		if (dragging || !window.curInfoItem) {
			return;
		}

		const newItem = new Item(window.curInfoItem);
		const curItem = items[newItem.itemSelector];

		if (!newItem.transferable || (curItem && sameNameAlreadyFetched(curItem, newItem))) {
			return;
		}
		else if (!curItem) {
			items[newItem.itemSelector] = newItem;
		}

		WebcallScheduler.enqueue(async () => await tradeSearch(newItem));
	}

	// Fetches an item's market data from the marketplace
	async function tradeSearch(item) {
		let newItem = new Item(window.curInfoItem);
		const curItem = items[item.itemSelector];

		if (sameNameAlreadyFetched(curItem, newItem) || curItem.marketWaiting || curItem.name != newItem.name) {
			return;
		}

		await curItem.setMarketData();
		curItem.setMarketPriceAverage();

		newItem = new Item(window.curInfoItem);

		if (sameNameAlreadyFetched(curItem, newItem) || curItem.name != newItem.name) {
			return true;
		}

		setMarketPriceDiv(curItem);
		return true;
	}

	function sameNameAlreadyFetched(curItem, newItem) {
		// No need to fetch if same item selected and has already fetched
		if (curItem.name == newItem.name && Item.checkExpiredPrice(curItem) && curItem.marketPriceAverage) {
			curItem.quantity = newItem.quantity;
			setMarketPriceDiv(curItem);
			return true;
		}
	}

	function setMarketPriceDiv(curItem) {
		const { marketPriceDiv } = DOMEditor.createTooltipDiv();
		marketPriceDiv.textContent = "Est. market price: $"
			+ Math.round(curItem.marketPriceAverage * (curItem.stackable ? curItem.quantity : 1)).toLocaleString()
			+ (curItem.stackable ? `\r\n($${Helpers.roundToTwo(curItem.marketPriceAverage).toLocaleString()} ea)` : "");
		DOMEditor.infoBoxCorrection();
	}
})();
