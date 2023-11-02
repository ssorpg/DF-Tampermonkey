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

	const { Item, DOMEditor, WebcallScheduler, Helpers } = window.ssorpg1;

	const DEBOUNCE_TIME = 50;

	let curItem = null;
	let debounceTimeout = null;

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

	// TODO: replace `SellMenuItemPopulate` function instead of watching for changes to DOM
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
		clearTimeout(debounceTimeout);

		if (dragging || !window.curInfoItem) {
			return;
		}

		const item = new Item(window.curInfoItem);

		if (!item.transferable) {
			return;
		}

		// No need to fetch if exact same item selected and has already fetched
		if (Item.checkSameItem(item, curItem) && curItem.marketPriceAverage) {
			setMarketPriceDiv(curItem);
			return;
		}

		// Credits override
		if (item.category == "credits") {
			item.name = "1 Credits";
		}

		curItem = item;
		debounceTimeout = setTimeout(() => WebcallScheduler.enqueue(async () => await tradeSearch(item)), DEBOUNCE_TIME);
	}

	// Fetches an item's market data from the marketplace
	async function tradeSearch(item) {
		let isSameItem = Item.checkSameItem(item, curItem);
		// No need to fetch if exact same item selected and has already fetched
		if (isSameItem) {
			if (curItem.marketPriceAverage) {
				setMarketPriceDiv(curItem);
			}
			else if (curItem.marketWaiting) {
				return;
			}
		}
		// New curItem, drop this one
		else if (!isSameItem) {
			return;
		}

		await item.setMarketData();

		isSameItem = Item.checkSameItem(item, curItem);
		if (isSameItem) {
			if (curItem.marketPriceAverage) {
				setMarketPriceDiv(curItem);
			}
			else if (curItem.marketWaiting) {
				return;
			}
		}
		else if (!isSameItem) {
			return;
		}

		curItem = item;
		item.setMarketPriceAverage();
		setMarketPriceDiv(item);
		return true;
	}

	function setMarketPriceDiv(item) {
		if (!Item.checkSameItem(item, curItem) || !item.marketPriceAverage) {
			return;
		}

		const { marketPriceDiv } = DOMEditor.createTooltipDiv();
		marketPriceDiv.textContent = "Est. market price: $"
			+ Math.round(item.marketPriceAverage * (item.stackable ? item.quantity : 1)).toLocaleString()
			+ (item.stackable ? `\r\n($${Helpers.roundToTwo(item.marketPriceAverage).toLocaleString()} ea)` : "");
		DOMEditor.infoBoxCorrection();
	}
})();
