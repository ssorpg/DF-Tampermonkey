// ==UserScript==
// @name        Tooltip Market Price
// @grant       none
// @version     1.0
// @description Automatically fetches the current market price of hovered inventory items and displays it in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/DF3D/DF3D_InventoryPage.php?page=31*
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/Item.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/WebcallScheduler.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/Helpers.js
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

    const { Item, DOMEditor, WebcallScheduler, Helpers } = window.ssorpg1;

    const DEFAULT_CREDIT_AMOUNT = 100;

    let curItem = null;
    let nextItem = null;

    // When dragging and dropping, don't set nextItem
    let enabled = true;
    document.addEventListener("mousedown", (e) => enabled = false);
    document.addEventListener("mouseup", (e) => enabled = true);

    const newEventListenerParams = {
        element: document.getElementById("inventoryholder"),
        event: "mousemove",
        functionName: "infoCard",
        functionBefore: null,
        functionAfter: setNextItem
    };

    DOMEditor.replaceEventListener(newEventListenerParams);

    // TODO: convert to code injector
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
			const quantity = curItem.type == "credits" ? DEFAULT_CREDIT_AMOUNT : curItem.quantity;
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
        nextItem = itemElement ? new Item(itemElement) : null;

        // No need to debounce if no item selected
        if (!nextItem) {
            return;
        }

        // Credits override
        if (nextItem.type == "credits") {
            nextItem.name = "1 Credits";
        }

        // No need to debounce if exact same item selected
        if (Item.checkSameItem(nextItem, curItem)) {
            if (curItem.marketPriceAverage) {
                setMarketPriceDiv(curItem);
            }
            return;
        }

        curItem = nextItem;
        nextItem = null;

		if (!curItem.transferable) {
			return;
		}

        // Save it so we don't lose it on callback
        const item = curItem;
		WebcallScheduler.enqueue(async () => await tradeSearch(item));
    }

	// Fetches an item's market data from the marketplace
	async function tradeSearch(item) {
		// New curItem, drop this one
		if (!Item.checkSameItem(item, curItem)) {
			return;
		}

		await item.setMarketData();
        item.setMarketPriceAverage();
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
    }
})();
