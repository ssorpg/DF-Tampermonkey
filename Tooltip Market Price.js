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

	const DEBOUNCE_TIME = 100;

	let curItem = null;
	let debounceTimeout = null;

	// When dragging and dropping, setNextItem only once
	let dragging = false;
	let hasSetItemOnDrag = false;
	document.addEventListener("mousedown", (e) => dragging = true);
	document.addEventListener("mouseup", (e) => {
		dragging = false;
		hasSetItemOnDrag = false;
	});

	const newEventListenerParams = {
		element: window.inventoryHolder,
		event: "mousemove",
		functionName: "infoCard",
		functionBefore: null,
		functionAfter: debounce
	};

	DOMEditor.replaceEventListener(newEventListenerParams);

	// Forces a tooltip update when dragging
	DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("mousedown", (e) => {
		window.curInfoItem = e.currentTarget.firstChild;
		setNextItem();
	}));

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

	function debounce() {
		clearTimeout(debounceTimeout);
		debounceTimeout = setTimeout(setNextItem, DEBOUNCE_TIME);
	}

	function setNextItem() {
		// Only allow a single item update when we start dragging the item
		if (dragging && hasSetItemOnDrag) {
			return;
		}
		else if (dragging) {
			hasSetItemOnDrag = true;
		}

		const itemElement = window.curInfoItem;

		// No item selected
		if (!itemElement) {
			return;
		}

		const nextItem = new Item(itemElement);

		// Exact same item selected
		if (Item.checkSameItem(nextItem, curItem)) {
			if (curItem.marketPriceAverage) {
				setMarketPriceDiv(curItem);
			}
			return;
		}

		// Credits override
		if (nextItem.category == "credits") {
			nextItem.name = "1 Credits";
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
