// ==UserScript==
// @name		Service Context Menu
// @grant		none
// @version		1.0
// @description	Provides a context menu to automatically searches for service professionals of a certain level
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Services-Context-Menu/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Services-Context-Menu/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Services-Context-Menu/libraries/WebcallScheduler.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

// TODO: convert this to a right-click context menu
(function() {
	"use strict";

	const { Item, DOMEditor, WebcallScheduler } = window.ssorpg1;

	DOMEditor.getInventoryCells().forEach((cell) => cell.addEventListener("contextmenu", openContextMenu));

	function openContextMenu(e) {
		if (window.marketScreen != "buy") {
			return;
		}

		e.preventDefault();

		const itemElement = e.currentTarget.firstChild;

		if (!itemElement) {
			return;
		}

		const item = new Item(itemElement);
		let catname;
		let textContent;

		if (item.category == "armour") {
			catname = "Engineer";
			textContent = "Services - Repair";
		}
		else if (item.itemData.needdoctor == "1") {
			catname = "Doctor";
			textContent = "Services - Medical";
		}
		else if (item.itemData.needcook == "1") {
			catname = "Chef";
			textContent = "Services - Cooking";
		}
		else {
			return;
		}

		const contextMenu = document.createElement("div");
		contextMenu.style.visibility = "hidden";
		contextMenu.style.id = "ssorpg1_ContextMenu";
		contextMenu.style.backgroundColor = "black";
		contextMenu.style.border = "1px solid white";
		contextMenu.style.zIndex = "20";
		contextMenu.style.textAlign = "left";
		contextMenu.style.position = "absolute";
		contextMenu.style.width = "140px";
		DOMEditor.contextMenuCorrection(contextMenu);

		const title = document.createElement("div");
		title.style.textAlign = "center";
		title.textContent = item.name;

		const button = document.createElement("button");
		button.textContent = "Find";
		button.style.width = "100%";
		button.dataset.find_level = item.itemData.find_level;
		button.dataset.catname = catname;
		button.dataset.textContent = textContent;
		button.addEventListener("mousedown", WebcallScheduler.enqueue(async (e) => await findService(e)));

		contextMenu.appendChild(title);
		contextMenu.appendChild(button);
		contextMenu.style.visibility = "visible";
	}

	async function findService(e) {
		const button = e.currentTarget;

		const {
			searchField,
			categoryChoice,
			cat,
			makeSearch
		} = DOMEditor.getTradeSearchElements();

		searchField.value = button.dataset.find_level;
		categoryChoice.dataset.catname = button.dataset.catname;
		categoryChoice.dataset.cattype = "service";
		cat.textContent = button.dataset.textContent;
		makeSearch.disabled = false;
		document.getElementById("ssorpg1_ContextMenu").remove();
		window.search();
		return true;
	}
})();
