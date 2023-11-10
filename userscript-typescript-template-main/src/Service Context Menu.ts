// ==UserScript==
// @name		Service Context Menu
// @grant		none
// @version		1.0
// @description	Provides a right-click context menu to automatically search for service professionals
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

import { IItemElement } from "./Interfaces/ItemElement";
import { IInventoryJS, IMarketJS, Issorpg1 } from "./Interfaces/Window";
import { Item } from "./Libraries/Item";
import { windowHasInventoryJS, windowHasMarketJS } from "./Libraries/TypeChecks";
import "./Libraries/WebcallScheduler";

declare const window: Window & IInventoryJS & IMarketJS & Issorpg1;

(function() {
	"use strict";

	if (!windowHasInventoryJS() || !windowHasMarketJS()) {
		return;
	}

	const { inventoryHolder, ssorpg1_DOMEditor, ssorpg1_WebcallScheduler } = window;

	let contextMenu: HTMLDivElement;
	let mouseIsOverContextMenu = false;

	ssorpg1_DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("contextmenu", openContextMenu));
	document.addEventListener("click", () => {
		if (!contextMenu || mouseIsOverContextMenu) {
			return;
		}

		contextMenu.remove();
	});

	function openContextMenu(e: Event) {
		if (window.marketScreen != "buy") {
			return;
		}

		const itemElement = (e.currentTarget as HTMLElement)?.firstChild;
		if (!itemElement) {
			return;
		}

		e.preventDefault();

		if (contextMenu) {
			contextMenu.remove();
		}

		const item = new Item(itemElement as IItemElement);
		const { serviceType } = item.getServiceInfo();
		let serviceText = null;
		let useText = null;

		if (serviceType == "Engineer") {
			serviceText = "Repair with engineer";
		}
		else if (serviceType == "Doctor") {
			serviceText = "Administer with doctor";
			useText = "Use";
		}
		else if (serviceType == "Chef") {
			serviceText = "Cook with chef";
			useText = "Eat";
		}
		else {
			return;
		}

		contextMenu = document.createElement("div");
		contextMenu.id = "ssorpg1_ContextMenu";
		contextMenu.style.visibility = "hidden";
		contextMenu.style.backgroundColor = "black";
		contextMenu.style.border = "1px solid white";
		contextMenu.style.zIndex = "20";
		contextMenu.style.textAlign = "left";
		contextMenu.style.position = "absolute";
		contextMenu.style.width = "200px";
		mouseIsOverContextMenu = false;
		contextMenu.addEventListener("mouseenter", () => mouseIsOverContextMenu = true);
		contextMenu.addEventListener("mouseleave", () => mouseIsOverContextMenu = false);

		const title = document.createElement("div");
		title.style.textAlign = "center";
		title.textContent = item.itemBase.name;

		const serviceButton = document.createElement("button");
		serviceButton.textContent = serviceText;
		serviceButton.style.width = "100%";
		serviceButton.addEventListener("click", () => {
			contextMenu.remove();
			ssorpg1_WebcallScheduler.enqueue(() => item.useService());
		});

		contextMenu.appendChild(title);
		contextMenu.appendChild(serviceButton);

		if (useText) {
			const useButton = document.createElement("button");
			useButton.textContent = useText;
			useButton.style.width = "100%";
            useButton.addEventListener("click", () => {
                contextMenu.remove();
                ssorpg1_WebcallScheduler.enqueue(() => item.useItem());
            });

			contextMenu.appendChild(useButton);
		}

		inventoryHolder.appendChild(contextMenu);
		ssorpg1_DOMEditor.contextMenuCorrection(contextMenu);
		contextMenu.style.visibility = "visible";
	}
})();
