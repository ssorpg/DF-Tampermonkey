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
		if (dragging || !window.curInfoItem) {
			return;
		}

		const newItem = new Item(window.curInfoItem);
		const curItem = items[newItem.itemSelector];

		if (!newItem.transferable) {
			return;
		}

		// No need to fetch if exact same item selected and has already fetched
		if (curItem && curItem.name == newItem.name && Item.checkExpiredPrice(curItem) && curItem.marketPriceAverage) {
			curItem.quantity = newItem.quantity;
			setMarketPriceDiv(curItem);
			return;
		}

		items[newItem.itemSelector] = newItem;
		WebcallScheduler.enqueue(async () => await tradeSearch(newItem));
	}

	// Fetches an item's market data from the marketplace
	async function tradeSearch(item) {
		let newItem = new Item(window.curInfoItem);
		const curItem = items[item.itemSelector];

		// No need to fetch if same item selected and has already fetched
		if (newItem && newItem.name == curItem.name) {
			if (curItem.marketPriceAverage) {
				curItem.quantity = newItem.quantity;
				setMarketPriceDiv(curItem);
			}
			else if (curItem.marketWaiting) {
				return;
			}
		}
		// New newItem, drop this one
		else if (newItem.name != curItem.name) {
			return;
		}

		await curItem.setMarketData();

		newItem = new Item(window.curInfoItem);
		if (newItem && newItem.name == curItem.name) {
			if (curItem.marketPriceAverage) {
				curItem.quantity = newItem.quantity;
				setMarketPriceDiv(curItem);
			}
			else if (curItem.marketWaiting) {
				return;
			}
		}
		else if (newItem.name != curItem.name) {
			return;
		}

		curItem.setMarketPriceAverage();
		setMarketPriceDiv(curItem);
		return true;
	}

	function setMarketPriceDiv(curItem) {
		const { marketPriceDiv } = DOMEditor.createTooltipDiv();
		marketPriceDiv.textContent = "Est. market price: $"
			+ Math.round(curItem.marketPriceAverage * (curItem.stackable ? curItem.quantity : 1)).toLocaleString()
			+ (curItem.stackable ? `\r\n($${Helpers.roundToTwo(curItem.marketPriceAverage).toLocaleString()} ea)` : "");
		DOMEditor.infoBoxCorrection();
	}
})();
