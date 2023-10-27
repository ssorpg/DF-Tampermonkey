// ==UserScript==
// @name        Tooltip Crafting Material
// @grant       none
// @version     1.0
// @description Automatically fetches the number of crafting materials in storage when hovering over a craftable item and displays in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=59
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/Item.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/WebcallScheduler.js
// @require     https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/Helpers.js
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
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

		for (const [key, value] of Object.entries(parsedStorageData)) {
			const { type, quantity } = value;
			if (!storage[type]) {
				storage[type] = new Item(type);
				storage[type].quantity = 0;
			}
			storage[type].quantity += Number(quantity);
		}

		// TODO: convert to code injector
		DOMEditor.getCraftingTableCells().forEach((cell) => cell.addEventListener("mousemove", getCraftingMaterialsEvent));
		return true;
	}

	function getCraftingMaterialsEvent() {
		setTimeout(getCraftingMaterials, 0);
	}

	function getCraftingMaterials() {
		// TODO: color differently based on whether user has enough of item?
		const craftingMaterialMatches = DOMEditor.getCraftingTooltip().textContent.matchAll(/\s*([a-z\s]*)\sx\s([0-9]*)/gi);
		const craftingMaterialNames = Array.from(craftingMaterialMatches).map((match) => match[1]);

		const storageEntries = Object.entries(storage).filter((storedItem) => craftingMaterialNames.includes(storedItem[1].name));
		if (!storageEntries.length) {
			return;
		}

		const { storedItemsDiv } = DOMEditor.createTooltipDiv();
		const storedItemsTitleDiv = document.createElement("div");
		storedItemsTitleDiv.textContent = "In Storage:";
		storedItemsDiv.appendChild(storedItemsTitleDiv);

		for (const [key, value] of storageEntries) {
			const [ id, storedItem ] = value;
			const storedItemDiv = document.createElement("div");
			storedItemDiv.textContent = `${storedItem.name} x ${storedItem.quantity}`;
			storedItemsDiv.appendChild(storedItemDiv);
		}
	}
})();
