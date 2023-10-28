// ==UserScript==
// @name        Tooltip Crafting Material
// @grant       none
// @version     1.0
// @description Automatically fetches the number of crafting materials in storage when hovering over a craftable item and displays it in the tooltip
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=59
// @require     https://raw.githubusercontent.com/ssorpg/main/Tooltip-Crafting-Material/libraries/Item.js
// @require     https://raw.githubusercontent.com/ssorpg/main/Tooltip-Crafting-Material/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/main/Tooltip-Crafting-Material/libraries/WebcallScheduler.js
// @require     https://raw.githubusercontent.com/ssorpg/main/Tooltip-Crafting-Material/libraries/Helpers.js
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
	
		// Get and convert the storage data to an object
		const storageData = await new Promise((resolve) => window.webCall("get_storage", callData, resolve, true));
		const parsedStorageData = Item.parseFlashReturn(storageData);

		// Count how many of each item we have in storage
		for (const [key, value] of Object.entries(parsedStorageData)) {
			const { type, quantity } = value;
			if (!storage[type]) {
				storage[type] = new Item(type);
				storage[type].quantity = 0;
			}
			storage[type].quantity += Number(quantity);
		}

		const newEventListenerParams = {
			element: window.inventoryHolder,
			event: "mousemove",
			functionName: "infoCard",
			functionBefore: null,
			functionAfter: getCraftingMaterials
		};

		DOMEditor.replaceEventListener(newEventListenerParams);
		return true;
	}

	function getCraftingMaterials() {
		const itemElement = window.curInfoItem;
		if (!itemElement) {
			return;
		}

		// Copied from `inventory.js`
		if (!(itemElement.classList.contains("fakeItem") && itemElement.parentNode.id == "recipes")) {
			return;
		}

		// Fetches from the tooltip itself
		const craftingMaterialMatches = DOMEditor.getCraftingMaterialsTooltip().textContent.matchAll(/\s*([a-z\s]*)\sx\s([0-9]*)/gi);
		const craftingMaterialNames = Array.from(craftingMaterialMatches).map((match) => match[1]);

		const storageValues = Object.values(storage).filter((storedItem) => craftingMaterialNames.includes(storedItem.name));
		if (!storageValues.length) {
			return;
		}

		setStoredItemsDiv(storageValues);
	}

	function setStoredItemsDiv(storageValues) {
		// TODO: color differently based on whether user has enough of item?
		const { storedItemsDiv } = DOMEditor.createTooltipDiv();
		storedItemsDiv.style.marginBottom = "12px";
		DOMEditor.removeAllChildNodes(storedItemsDiv);

		const storedItemsTitleDiv = document.createElement("div");
		storedItemsTitleDiv.textContent = "In Storage:";
		storedItemsTitleDiv.style.color = "white";
		storedItemsDiv.appendChild(storedItemsTitleDiv);

		for (const value of storageValues) {
			const storedItemDiv = document.createElement("div");
			storedItemDiv.textContent = `${value.name} x ${value.quantity}`;
			storedItemsDiv.appendChild(storedItemDiv);
		}

		DOMEditor.infoBoxCorrection();
	}
})();
