// ==UserScript==
// @name        Tooltip Market Price
// @grant       none
// @version     1.0
// @description Automatically fetches the current market price of hovered inventory items and displays in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/DF3D/DF3D_InventoryPage.php?page=31*
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/Item.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/WebcallScheduler.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/Helpers.js
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

    // TODO: convert to code injector
    DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("mousemove", setNextItemEvent));

    // Courtesy of https://stackoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
	// Code injector
    window.loadMarket = (function() {
        const cachedFunction = window.loadMarket;

        return function() {
            const result = cachedFunction.apply(this, arguments);

            if (window.marketScreen === "sell") {
                document.getElementById("creditSlot").addEventListener("mousemove", setNextItemEvent);
            }

            return result;
        };
    })();

    function setNextItemEvent(e) {
        if (!enabled) {
            return;
        }

        // `currentTarget` is lost after a timeout
        const inventoryCell = e.currentTarget;

        // Push to end of event queue so that window variables are up-to-date
        setTimeout(setNextItem, 0, inventoryCell);
    }

    // TODO: convert to code injector
    const gcDiv = document.getElementById("gamecontent");
	if (gcDiv) {
		const gcObserver = new MutationObserver((mutationList, observer) => {
			if (window.marketScreen !== "sell") {
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

    function setNextItem(inventoryCell) {
        // Item in the inv slot we moused over
        nextItem = inventoryCell.firstChild ? new Item(inventoryCell.firstChild) : null;

        // No need to debounce if no item selected
        if (!nextItem) {
            return;
        }

        // Credits override
        if (nextItem.type == "credits") {
            nextItem.name = "1 Credits"
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

		enqueue(curItem);
    }

	function enqueue(item) {
		if (!item.transferable) {
			return;
		}

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

        const [tooltipDiv, scrapValueDiv, marketPriceDiv] = DOMEditor.createTooltipDiv();
        marketPriceDiv.textContent = "Est. market price: $"
            + Math.round(item.marketPriceAverage * item.quantity).toLocaleString()
            + (item.quantity > 1 ? `\r\n($${Helpers.roundToTwo(item.marketPriceAverage).toLocaleString()} ea)` : "");
    }
})();
