// ==UserScript==
// ==UserLibrary==
// @name        DOMEditor
// @grant       none
// @version     1.0
// @description Library to provide DOM selectors for difficult-to-select elements, as well as elements shared between scripts
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/
// @namespace   https://greasyfork.org/users/279200
// ==/UserLibrary==
// ==/UserScript==

window.ssorpg1 ??= {};

(function() {
	"use strict";

	if (window.ssorpg1.DOMEditor) {
		return;
	}

	const DOMEditor = {
		getMessagesTable: () => {
			return document.getElementsByName("stratoV5_TBLS_01")[0].closest("table");
		},
		getMainMenuBottom: () => {
			return document.querySelector("*[background='https://files.deadfrontier.com/deadfrontier/DF3Dimages/mainpage/menu_bottom.jpg']").parentElement;
		},
		createTooltipDiv: () => {
			let tooltipDiv = document.getElementById("ssorpg1_TooltipDiv");
			let scrapValueDiv = document.getElementById("ssorpg1_ScrapValueDiv");
			let marketPriceDiv = document.getElementById("ssorpg1_MarketPriceDiv");

			if (!tooltipDiv) {
				tooltipDiv = document.createElement("div");
				tooltipDiv.id = "ssorpg1_TooltipDiv";
				tooltipDiv.style.textAlign = "left";
				tooltipDiv.style.whiteSpace = "pre";
				tooltipDiv.style.marginTop = "12px";
				tooltipDiv.style.color = "#ff8c00";
	
				scrapValueDiv = document.createElement("div");
				scrapValueDiv.id = "ssorpg1_ScrapValueDiv";
	
				marketPriceDiv = document.createElement("div");
				marketPriceDiv.id = "ssorpg1_MarketPriceDiv";
	
				tooltipDiv.appendChild(scrapValueDiv);
				tooltipDiv.appendChild(marketPriceDiv);
	
				document.getElementById("infoBox").appendChild(tooltipDiv);
			}

			return [tooltipDiv, scrapValueDiv, marketPriceDiv];
		},
    	// Cells for use with `Item` class
    	getInventoryCells: () => {
			const inventory = document.getElementById("inventory");

			if (!inventory) {
				return [];
			}

			return Array.from(inventory.children).flatMap((row) => Array.from(row.children));
		}
	}

	window.ssorpg1.DOMEditor = DOMEditor;
})();
