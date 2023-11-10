"use strict";

import { IInventoryJS, Issorpg1 } from "../Interfaces/Window";
import { IReplaceEventListenerParams, IReplaceFunctionParams } from "../Interfaces/DOMEditor";

// Small hack to allow replacing arbitrary function and event listeners on the page
type IArbitraryFunctions = {
    [key: string]: (...args: any) => void
}

declare const window: Window & IInventoryJS & IArbitraryFunctions & Issorpg1;

export class DOMEditor {
	// On personal message page
	getMessagesTable() {
		const messagesTable = document.getElementsByName("stratoV5_TBLS_01")?.[0].closest("table");

		if (!messagesTable) {
			throw new Error("Missing required window elements for getMessagesTable");
		}

		return messagesTable;
	}

	// On all pages
	getMenuBottom() {
		const menuBottom = document.querySelector("*[background='https://files.deadfrontier.com/deadfrontier/DF3Dimages/mainpage/menu_bottom.jpg']")?.parentElement;

		if (!menuBottom) {
			throw new Error("Missing required window elements for getMenuBottom");
		}

		return menuBottom;
	}

	// Gets every inventory cell on pages with an inventory
	getInventoryCells() {
		const inventoryCells = document.getElementById("inventory")?.children;

		if (!inventoryCells) {
			throw new Error("Missing required window elements for getInventoryCells");
		}

		return Array.from(inventoryCells).flatMap((row) => Array.from(row.children));
	}

	// All the elements required to perform a trade search
	getTradeSearchElements() {
		const searchField = document.getElementById("searchField");
		const categoryChoice = document.getElementById("categoryChoice");
		const cat = document.getElementById("cat");
		const makeSearch = document.getElementById("makeSearch");

		if (!searchField || !categoryChoice || !cat || !makeSearch) {
			throw new Error("Missing required window elements for getTradeSearchElements");
		}

		return { searchField, categoryChoice, cat, makeSearch };
	}

	// Custom tooltip div
	// TODO: refactor
	createTooltipDiv() {
		if (!window.infoBox) {
			throw new Error("Missing required window elements for createTooltipDiv");
		}

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

	removeAllChildNodes(parent: HTMLElement) {
		while (parent.firstChild) {
			parent.removeChild(parent.firstChild);
		}
	}

	replaceEventListener(newEventListenerParams: IReplaceEventListenerParams) {
		const { element, event, functionName } = newEventListenerParams;

		if (!<keyof HTMLElementEventMap>event) {
			throw new Error("Invalid event passed to replaceEventListener");
		}

		element.removeEventListener(event, window[functionName]);
		this.replaceFunction(newEventListenerParams);
		element.addEventListener(event, window[functionName]);
	}

	// Courtesy of https://stackoverflow.com/questions/9134686/adding-code-to-a-javascript-function-programmatically
	// Appends or prepends a new function to run before or after the given function (on the window)
	replaceFunction(newFunctionParams: IReplaceFunctionParams) {
		const { functionName, functionBefore, functionAfter } = newFunctionParams;
		const cachedFunction = window[functionName];

		// Sets back to the same `window[functionName]` so that further functions can be injected
		window[functionName] = function(...args) {
			if (functionBefore) {
				functionBefore(args);
			}
			const result = cachedFunction.apply(this, args);
			if (functionAfter) {
				functionAfter(args);
			}
			return result;
		}
	}

	// Corrects the location of the `infoBox` when new information is appended
	// Copied from `inventory.js`
	infoBoxCorrection() {
		const { inventoryHolder, mousePos, infoBox } = window;

		if (!inventoryHolder || !mousePos || !infoBox) {
			throw new Error("Missing required window elements for infoBoxCorrection");
		}
		
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

	// Corrects the location of the `contextMenu`
	// Copied from `market.js`
	contextMenuCorrection(contextMenu: HTMLDivElement) {
		const { inventoryHolder, mousePos } = window;

		if (!inventoryHolder || !mousePos) {
			throw new Error("Missing required window elements for contextMenuCorrection");
		}

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

window.ssorpg1_DOMEditor ??= new DOMEditor();
