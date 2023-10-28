// ==UserScript==
// @name		Tooltip Scrap Value
// @grant		none
// @version		1.0
// @description	Automatically fetches the current scrap value of hovered inventory items and displays it in the tooltip
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/DF3D/DF3D_InventoryPage.php?page=31*
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/double-click-search/libraries/DOMEditor.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { Item, DOMEditor } = window.ssorpg1;

	const newEventListenerParams = {
		element: window.inventoryHolder,
		event: "mousemove",
		functionName: "infoCard",
		functionBefore: null,
		functionAfter: setScrapValueDiv
	};

	DOMEditor.replaceEventListener(newEventListenerParams);

	function setScrapValueDiv() {
		const itemElement = window.curInfoItem;

		if (!itemElement) {
			return;
		}

		const item = new Item(itemElement);

		const { scrapValueDiv } = DOMEditor.createTooltipDiv();
		scrapValueDiv.textContent = `Scrap value: $${item.scrapValue.toLocaleString()}`;
		DOMEditor.infoBoxCorrection();
	}
})();
