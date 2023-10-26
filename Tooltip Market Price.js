// ==UserScript==
// @name        Tooltip Market Price
// @grant       none
// @version     1.0
// @description Automatically fetches the current market price of hovered inventory items and displays in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @require     https://greasyfork.org/scripts/478195-df-item-class/code/DF%20-%20Item%20Class.js?version=1270347
// @require     https://greasyfork.org/scripts/478276-df-domeditor/code/DF%20-%20DOMEditor.js?version=1270354
// @require     https://greasyfork.org/scripts/478194-df-helpers/code/DF%20-%20Helpers.js?version=1270351
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

    const { DF_Item, DOMEditor, helpers } = window.ssorpg1;

    const DEFAULT_CREDIT_AMOUNT = 100;
    const DEBOUNCE_TIME = 500;

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

        resetTimeout();
    }

    function resetTimeout() {
        // Debounce time 500ms
        clearTimeout(timeout);
        timeout = setTimeout(() => waitForTradeSearch(curItem), DEBOUNCE_TIME);
    }

    async function waitForTradeSearch(item) {
        await item.tradeSearch();

        // New curItem, drop this one
        if (!DF_Item.checkSameItem(item, curItem)) {
            return;
        }

        item.setMarketPriceAverage();
        setMarketPriceDiv(item);
    }

    function setMarketPriceDiv(item) {
        const [tooltipDiv, scrapValueDiv, marketPriceDiv] = DOMEditor.createTooltipDiv();
        marketPriceDiv.textContent = "Est. market price: $"
            + Math.round(item.marketPriceAverage * item.quantity).toLocaleString()
            + (item.quantity > 1 ? `\r\n($${helpers.roundToTwo(item.marketPriceAverage).toLocaleString()} ea)` : "");
    }
})();