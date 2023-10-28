// ==UserScript==
// @name		Tooltip Market Price
// @grant		none
// @version		1.0
// @description	Automatically fetches the current market price of hovered inventory items and displays it in the tooltip
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/DF3D/DF3D_InventoryPage.php?page=31*
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/WebcallScheduler.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/Helpers.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { Item, DOMEditor, WebcallScheduler, Helpers } = window.ssorpg1;

	let curItem = null;

	// When dragging and dropping, don't set nextItem
	let enabled = true;
	document.addEventListener("mousedown", (e) => enabled = false);
	document.addEventListener("mouseup", (e) => enabled = true);

	const newEventListenerParams = {
		element: window.inventoryHolder,
		event: "mousemove",
		functionName: "infoCard",
		functionBefore: null,
		functionAfter: setNextItem
	};

	DOMEditor.replaceEventListener(newEventListenerParams);

	// TODO: replace function instead
	const gcDiv = document.getElementById("gamecontent");
	if (gcDiv) {
		const gcObserver = new MutationObserver((mutationList, observer) => {
			if (window.marketScreen != "sell") {
				return;
			}

			if (!curItem || !curItem.marketPriceAverage) {
				return;
			}

			const moneyField = document.getElementsByClassName("moneyField");
			if (moneyField.length == 0) {
				return;
			}

			// Price field
			const quantity = curItem.category == "credits" ? Item.DEFAULT_CREDIT_AMOUNT : curItem.quantity;
			moneyField[0].value = Math.round(curItem.marketPriceAverage * quantity);

			// `Yes` button
			gcDiv.children[2].disabled = false;
		});

		// Waits for child additions or removals and calls the above function
		gcObserver.observe(gcDiv, { childList: true });
	}

	function setNextItem() {
		if (!enabled) {
				return;
		}

		const itemElement = window.curInfoItem;

		// No item selected
		if (!itemElement) {
			return;
		}

		const nextItem = new Item(itemElement);

		// Credits override
		if (nextItem.category == "credits") {
			nextItem.name = "1 Credits";
		}

		// Exact same item selected
		if (Item.checkSameItem(nextItem, curItem)) {
			if (curItem.marketPriceAverage) {
				setMarketPriceDiv(curItem);
			}
			return;
		}

		curItem = nextItem;

		if (!curItem.transferable) {
			return;
		}

		// Save it so we don't lose it on callback
		const item = nextItem;
		WebcallScheduler.enqueue(async () => await tradeSearch(item));
	}

	// Fetches an item's market data from the marketplace
	async function tradeSearch(item) {
		const isSameItem = Item.checkSameItem(item, curItem);

		// New curItem, drop this one
		if (!isSameItem) {
			return;
		}

		// No need to fetch if exact same item selected and has already fetched
		if (isSameItem && curItem.marketPriceAverage) {
			setMarketPriceDiv(curItem);
			return;
		}

		await curItem.setMarketData();
		curItem.setMarketPriceAverage();
		setMarketPriceDiv(item);
		return true;
	}

	function setMarketPriceDiv(item) {
		if (!Item.checkSameItem(item, curItem)) {
			return;
		}

		const { marketPriceDiv } = DOMEditor.createTooltipDiv();
		marketPriceDiv.textContent = "Est. market price: $"
			+ Math.round(item.marketPriceAverage * (item.stackable ? item.quantity : 1)).toLocaleString()
			+ (item.stackable ? `\r\n($${Helpers.roundToTwo(item.marketPriceAverage).toLocaleString()} ea)` : "");
		DOMEditor.infoBoxCorrection();
	}
})();
