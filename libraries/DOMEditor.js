// ==UserScript==
// ==UserLibrary==
// @name		DOMEditor
// @grant		none
// @version		1.0
// @description	Library to provide DOM selectors for difficult-to-select elements as well as elements shared between scripts
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/
// @namespace	https://greasyfork.org/users/279200
// ==/UserLibrary==
// ==/UserScript==

(function() {
	"use strict";

	window.ssorpg1 ??= {};
	if (window.ssorpg1.DOMEditor) {
		return;
	}

	class DOMEditor {
		getMessagesTable() {
			return document.getElementsByName("stratoV5_TBLS_01")[0].closest("table");
		}

		getMainMenuBottom() {
			return document.querySelector("*[background='https://files.deadfrontier.com/deadfrontier/DF3Dimages/mainpage/menu_bottom.jpg']").parentElement;
		}

		getInventoryCells() {
			return Array.from(document.getElementById("inventory").children).flatMap((row) => Array.from(row.children));
		}

		// All the elements required to perform a trade search
		getTradeSearchElements() {
			return {
				searchField: document.getElementById("searchField"),
				categoryChoice: document.getElementById("categoryChoice"),
				cat: document.getElementById("cat"),
				makeSearch: document.getElementById("makeSearch")
			}
		}

		// TODO: refactor
		createTooltipDiv() {
			let tooltipDiv = document.getElementById("ssorpg1_TooltipDiv");
			let storedItemsDiv = document.getElementById("ssorpg1_StoredItemsDiv");
			let scrapValueDiv = document.getElementById("ssorpg1_ScrapValueDiv");
			let marketPriceDiv = document.getElementById("ssorpg1_MarketPriceDiv");

			if (!tooltipDiv) {
				tooltipDiv = document.createElement("div");
				tooltipDiv.id = "ssorpg1_TooltipDiv";
				tooltipDiv.style.textAlign = "left";
				tooltipDiv.style.whiteSpace = "pre";
				tooltipDiv.style.marginTop = "12px";
				tooltipDiv.style.color = "#ff8c00";

				storedItemsDiv = document.createElement("div");
				storedItemsDiv.id = "ssorpg1_StoredItemsDiv";
				storedItemsDiv.className = "itemData";

				scrapValueDiv = document.createElement("div");
				scrapValueDiv.id = "ssorpg1_ScrapValueDiv";
				scrapValueDiv.className = "itemData";

				marketPriceDiv = document.createElement("div");
				marketPriceDiv.id = "ssorpg1_MarketPriceDiv";
				marketPriceDiv.className = "itemData";

				tooltipDiv.appendChild(storedItemsDiv);
				tooltipDiv.appendChild(scrapValueDiv);
				tooltipDiv.appendChild(marketPriceDiv);

				window.infoBox.appendChild(tooltipDiv);
				this.infoBoxCorrection();
			}

			return { tooltipDiv, storedItemsDiv, scrapValueDiv, marketPriceDiv };
		}

		removeAllChildNodes(parent) {
			while (parent.firstChild) {
				parent.removeChild(parent.firstChild);
			}
		}

		replaceEventListener(newEventListenerParams) {
			const { element, event, functionName } = newEventListenerParams;

			element.removeEventListener(event, window[functionName]);
			this.replaceFunction(newEventListenerParams);
			element.addEventListener(event, window[functionName]);
		}

		// Courtesy of https://stackoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
		// Appends or prepends a new function to run before or after the given function (on the window)
		replaceFunction(newFunctionParams) {
			const { functionName, functionBefore, functionAfter } = newFunctionParams;
			const cachedFunction = window[functionName];

			// Sets back to the same `window[functionName]` so that further functions can be injected
			window[functionName] = function() {
				if (functionBefore) {
					functionBefore(arguments);
				}
				const result = cachedFunction.apply(this, arguments);
				if (functionAfter) {
					functionAfter(arguments);
				}
				return result;
			}
		}

		// Corrects the location of the infoBox when new information is appended
		// Copied from `inventory.js`
		infoBoxCorrection() {
			const { inventoryHolder, mousePos, infoBox } = window;
			const invHoldOffsets = inventoryHolder.getBoundingClientRect();

			if (mousePos[1] - 30 - infoBox.offsetHeight < invHoldOffsets.top) {
				infoBox.style.top = (mousePos[1] + 30 - invHoldOffsets.top) + "px";
			}
			else {
				infoBox.style.top = (mousePos[1] - 30 - infoBox.offsetHeight - invHoldOffsets.top) + "px";
			}

			if (mousePos[0] + 20 + infoBox.offsetWidth > invHoldOffsets.right) {
				infoBox.style.left = (inventoryHolder.offsetWidth - infoBox.offsetWidth) + "px";
			}
			else {
				infoBox.style.left = (mousePos[0] + 20 - invHoldOffsets.left) + "px";
			}
		}

		contextMenuCorrection(contextMenu) {
			const { inventoryHolder, mousePos } = window;
			const invHoldOffsets = inventoryHolder.getBoundingClientRect();

			if (mousePos[1] + contextMenu.offsetHeight > invHoldOffsets.bottom) {
				contextMenu.style.top = (mousePos[1] - contextMenu.offsetHeight - invHoldOffsets.top) + "px";
			}
			else {
				contextMenu.style.top = (mousePos[1] - invHoldOffsets.top) + "px";
			}

			if (mousePos[0] + contextMenu.offsetWidth > invHoldOffsets.right) {
				contextMenu.style.left = (inventoryHolder.offsetWidth - 40 - contextMenu.offsetWidth) + "px";
			}
			else {
				contextMenu.style.left = (mousePos[0] - invHoldOffsets.left) + "px";
			}
		}
	}

	window.ssorpg1.DOMEditor = new DOMEditor();
	console.log(window.ssorpg1.DOMEditor);
})();
