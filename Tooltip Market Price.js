// ==UserScript==
// @name        Tooltip Market Price
// @grant       none
// @version     1.0
// @description Automatically fetches the current market price of hovered inventory items and displays in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/Item.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/DOMEditor.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/Helpers.js
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

    const { DF_Item, DOMEditor, WebcallScheduler, helpers } = window.ssorpg1;

    const DEFAULT_CREDIT_AMOUNT = 100;
    const DEBOUNCE_TIME = 200;

    let timeout = null;

    let curItem = null;
    let nextItem = null;

    // When dragging and dropping, don't set nextItem
    let enabled = true;
    document.addEventListener("mousedown", (e) => enabled = false);
    document.addEventListener("mouseup", (e) => enabled = true);

    // TODO: convert to code injector
    DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("mousemove", setNextItemEvent));

    // Courtesy of https://stackoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
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
        nextItem = inventoryCell.firstChild ? new DF_Item(inventoryCell.firstChild) : null;

        // No need to debounce if no item selected
        if (!nextItem) {
            return;
        }

        // Credits override
        if (nextItem.type == "credits") {
            nextItem.name = "1 Credits"
        }

        // No need to debounce if exact same item selected
        if (DF_Item.checkSameItem(curItem, nextItem)) {
            if (curItem.marketPriceAverage) {
                setMarketPriceDiv(curItem);
            }
            return;
        }

        curItem = nextItem;
        nextItem = null;

        resetTimeout(curItem);
    }

    function resetTimeout(item) {
        // Debounce time 200ms
        clearTimeout(timeout);

		// No need to fetch if it's not tradeable
		if (!item.transferable) {
			return;
		}

        timeout = setTimeout(WebcallScheduler.enqueue(async () => doTradeSearch(item)), DEBOUNCE_TIME);
    }

	// Fetches an item's market data from the marketplace
	function doTradeSearch(item) {
		const dataArray = {
			pagetime: window.userVars["pagetime"],
			tradezone: window.userVars["DFSTATS_df_tradezone"],
			searchname: this.name,
			memID: "",
			profession: "",
			category: "",
			search: "trades",
			searchtype: "buyinglistitemname"
		};

		// New curItem, drop this one
		if (!DF_Item.checkSameItem(item, curItem)) {
			return;
		}

		window.webCall("trade_search", dataArray, (marketData) => tradeSearchCallback(item, marketData), true);
		return true;
	}

    async function tradeSearchCallback(item, marketData) {
		// New curItem, drop this one
		if (!DF_Item.checkSameItem(item, curItem)) {
			return;
		}

        item.setMarketPriceAverage(marketData);
        setMarketPriceDiv(item);
    }

    function setMarketPriceDiv(item) {
        const [tooltipDiv, scrapValueDiv, marketPriceDiv] = DOMEditor.createTooltipDiv();
        marketPriceDiv.textContent = "Est. market price: $"
            + Math.round(item.marketPriceAverage * item.quantity).toLocaleString()
            + (item.quantity > 1 ? `\r\n($${helpers.roundToTwo(item.marketPriceAverage).toLocaleString()} ea)` : "");
    }
})();