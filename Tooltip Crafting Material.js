// ==UserScript==
// @name		Tooltip Crafting Material
// @grant		none
// @version		1.0
// @description	Automatically fetches the number of crafting materials in storage when hovering over a craftable item and displays it in the tooltip
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=59
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/WebcallScheduler.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Helpers.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { ssorpg1, userVars, webCall, inventoryHolder, curInfoItem } = window;
	const { Item, DOMEditor, WebcallScheduler } = ssorpg1;

	const storage = {};

	WebcallScheduler.enqueue(getStorage);

	async function getStorage() {
		const callData = {
			pagetime: userVars.pagetime,
			sc: userVars.sc,
			userID: userVars.userID,
			password: userVars.password
		};
	
		// Get and convert the storage data to an object
		const storageData = await new Promise((resolve) => webCall("get_storage", callData, resolve, true));
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
			element: inventoryHolder,
			event: "mousemove",
			functionName: "infoCard",
			functionBefore: null,
			functionAfter: getCraftingMaterials
		};

		DOMEditor.replaceEventListener(newEventListenerParams);
		return true;
	}

	function getCraftingMaterials() {
		const itemElement = curInfoItem;

		// Copied from `inventory.js`
		if (!itemElement || !(itemElement.classList.contains("fakeItem") && itemElement.parentNode.id == "recipes")) {
			return;
		}

		const item = new Item(itemElement);
		const storageValues = Object.values(storage).filter((storedItem) => item.craftingMaterials[storedItem.name]);

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
