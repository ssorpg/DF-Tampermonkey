// ==UserScript==
// @name        Tooltip Scrap Value
// @grant       none
// @version     1.0
// @description Automatically fetches the current scrap value of hovered inventory items and displays in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/Item.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/DOMEditor.js
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

    const { Item, DOMEditor } = window.ssorpg1;

    // TODO: convert to code injector
    DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("mousemove", setScrapValueDivEvent));

    function setScrapValueDivEvent(e) {
        // `currentTarget` is lost after a timeout
        const currentTarget = e.currentTarget;

        // Push to end of event queue so that window variables are up-to-date
        setTimeout(setScrapValueDiv, 0, currentTarget);
    }

    function setScrapValueDiv(inventoryCell) {
        const item = inventoryCell.firstChild ? new Item(inventoryCell.firstChild) : null;

        if (!item) {
            return;
        }

        const [tooltipDiv, scrapValueDiv, marketPriceDiv] = DOMEditor.createTooltipDiv();
        scrapValueDiv.textContent = `Scrap value: $${item.scrapValue.toLocaleString()}`;
    }
})();