// ==UserScript==
// @name        Tooltip Scrap Value
// @grant       none
// @version     1.0
// @description Automatically fetches the current scrap value of hovered inventory items and displays in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @require     https://greasyfork.org/scripts/478195-df-item-class/code/DF%20-%20Item%20Class.js?version=1270347
// @require     https://greasyfork.org/scripts/478276-df-domeditor/code/DF%20-%20DOMEditor.js?version=1270354
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

    const { DF_Item, DOMEditor } = window.ssorpg1;

    // TODO: convert to code injector
    DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("mousemove", setScrapValueDivEvent));

    function setScrapValueDivEvent(e) {
        // `currentTarget` is lost after a timeout
        const currentTarget = e.currentTarget;

        // Push to end of event queue so that window variables are up-to-date
        setTimeout(setScrapValueDiv, 0, currentTarget);
    }

    function setScrapValueDiv(inventoryCell) {
        const item = inventoryCell.firstChild ? new DF_Item(inventoryCell.firstChild) : null;

        if (!item) {
            return;
        }

        const [tooltipDiv, scrapValueDiv, marketPriceDiv] = DOMEditor.createTooltipDiv();
        scrapValueDiv.textContent = `Scrap value: $${item.scrapValue.toLocaleString()}`;
    }
})();