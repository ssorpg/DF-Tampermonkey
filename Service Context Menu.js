// ==UserScript==
// @name		Service Context Menu
// @grant		none
// @version		1.0
// @description	Provides a right-click context menu to automatically search for service professionals
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/WebcallScheduler.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	const { Item, DOMEditor, WebcallScheduler } = window.ssorpg1;

	let contextMenu = null;
	let mouseIsOverContextMenu = false;

	DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("contextmenu", openContextMenu));
	document.addEventListener("mousedown", () => {
		if (!contextMenu || mouseIsOverContextMenu) {
			return;
		}

		contextMenu.remove();
	});

	function openContextMenu(e) {
		e.preventDefault();
		const itemElement = e.currentTarget.firstChild;

		if (window.marketScreen != "buy" || !itemElement) {
			return;
		}

		if (contextMenu) {
			contextMenu.remove();
		}

		const item = new Item(itemElement);
		let catname = null;
		let cat = null;
		let level = null;

		if (item.category == "armour") {
			catname = "Engineer";
			cat = "Services - Repair";
			level = item.itemData.shop_level;
		}
		else if (item.itemData.needdoctor == "1") {
			catname = "Doctor";
			cat = "Services - Medical";
			level = item.itemData.level;
		}
		else if (item.itemData.needcook == "1") {
			catname = "Chef";
			cat = "Services - Cooking";
			level = item.itemData.level;
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
		contextMenu.style.width = "140px";
		mouseIsOverContextMenu = false;
		contextMenu.addEventListener("mouseenter", () => mouseIsOverContextMenu = true);
		contextMenu.addEventListener("mouseleave", () => mouseIsOverContextMenu = false);

		const title = document.createElement("div");
		title.style.textAlign = "center";
		title.textContent = item.name;

		const button = document.createElement("button");
		button.textContent = "Find " + catname;
		button.style.width = "100%";
		button.dataset.level = (Number(level) - 5).toString();
		button.dataset.catname = catname;
		button.dataset.cat = cat;
		button.addEventListener("mousedown", () => findService(button));

		contextMenu.appendChild(title);
		contextMenu.appendChild(button);
		window.inventoryHolder.appendChild(contextMenu);
		DOMEditor.contextMenuCorrection(contextMenu);
		contextMenu.style.visibility = "visible";
	}

	function findService(button) {
		const {
			searchField,
			categoryChoice,
			cat,
			makeSearch
		} = DOMEditor.getTradeSearchElements();

		searchField.value = button.dataset.level;
		categoryChoice.dataset.catname = button.dataset.catname;
		categoryChoice.dataset.cattype = "service";
		cat.textContent = button.dataset.cat;
		makeSearch.disabled = false;

		contextMenu.remove();
		WebcallScheduler.enqueue(async () => {
			window.search();
			return true;
		});
	}
})();
