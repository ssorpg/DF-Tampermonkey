// ==UserScript==
// ==UserLibrary==
// @name        DOMEditor
// @grant       none
// @version     1.0
// @description Library to provide DOM selectors for difficult-to-select elements as well as elements shared between scripts
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/
// @namespace   https://greasyfork.org/users/279200
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
	
				scrapValueDiv = document.createElement("div");
				scrapValueDiv.id = "ssorpg1_ScrapValueDiv";
	
				marketPriceDiv = document.createElement("div");
				marketPriceDiv.id = "ssorpg1_MarketPriceDiv";
	
				tooltipDiv.appendChild(storedItemsDiv);
				tooltipDiv.appendChild(scrapValueDiv);
				tooltipDiv.appendChild(marketPriceDiv);
	
				document.getElementById("infoBox").appendChild(tooltipDiv);
			}

			return { tooltipDiv, storedItemsDiv, scrapValueDiv, marketPriceDiv };
		}

    	// Cells for use with `Item` class
    	getInventoryCells() {
			const inventory = document.getElementById("inventory");

			if (!inventory) {
				return [];
			}

			return Array.from(inventory.children).flatMap((row) => Array.from(row.children));
		}

		getCraftingTableCells() {
			return Array.from(document.getElementsByClassName("fakeItem"));
		}

		getCraftingTooltip() {
			return document.getElementById("infoBox").lastChild;
		}

		removeAllChildNodes(parent) {
			while (parent.firstChild) {
				parent.removeChild(parent.firstChild);
			}
		}
	}

	window.ssorpg1.DOMEditor = new DOMEditor();
})();
