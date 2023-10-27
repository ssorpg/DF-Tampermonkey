// ==UserScript==
// @name        Tooltip Crafting Material
// @grant       none
// @version     1.0
// @description Automatically fetches the number of crafting materials in storage when hovering over a craftable item and displays in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=59
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Item.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/WebcallScheduler.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Helpers.js
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

window.addEventListener("load", (function() {
    "use strict";

    const { Item, DOMEditor, WebcallScheduler } = window.ssorpg1;

	const storage = {};
	WebcallScheduler.enqueue(getStorage);

	async function getStorage() {
		const callData = {
			pagetime: window.userVars.pagetime,
			sc: window.userVars.sc,
			userID: window.userVars.userID,
			password: window.userVars.password
		};
	
		const storageData = await new Promise((resolve) => window.webCall("get_storage", callData, resolve, true));
		const parsedStorageData = Item.parseFlashReturn(storageData);

		parsedStorageData.forEach((entity) => {
			storage[entity.type] ??= { quantity: 0 };
			storage[entity.type].quantity += entity.quantity;
		});

		// TODO: convert to code injector
		DOMEditor.getCraftingTableCells().forEach((cell) => cell.addEventListener("mousemove", () => setTimeout(getCraftingMaterials, 0)));
		return true;
	}

	function getCraftingMaterials() {
		const craftingMaterials = DOMEditor.getCraftingTooltip().textContent.matchAll(/([a-z\s]*)\sx\s([0-9]*)/gi);
	}
}));
