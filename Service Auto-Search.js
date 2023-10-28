// ==UserScript==
// @name		Service Auto-Search
// @grant		none
// @version		1.0
// @description	Automatically searches for service professionals of a certain level
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/main/libraries/WebcallScheduler.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

// TODO: convert this to a right-click context menu
(function() {
	"use strict";

	const { DOMEditor, WebcallScheduler } = window.ssorpg1;

	const buttonHolder = document.createElement("div");
	buttonHolder.id = "ssorpg1_EngineerAutoSearchDiv";
	buttonHolder.style.position = "absolute";
	buttonHolder.style.right = "12.5%";
	buttonHolder.style.top = "50%";

	const newButton = document.createElement("input");
	newButton.type = "button";
	newButton.style.margin = "0 2px 0 2px";
	newButton.style.width = "120px";
	newButton.value = "Level 75 Engineer";
	newButton.addEventListener("click", (e) => {
		if (window.marketScreen != "buy") {
			return;
		}

		WebcallScheduler.enqueue(tradeSearch);
	});

	async function tradeSearch() {
		if (window.marketScreen != "buy") {
				return;
		}

		const {
			searchField,
			categoryChoice,
			cat,
			makeSearch
		} = DOMEditor.getTradeSearchElements();

		searchField.value = "75";
		categoryChoice.dataset.catname = "Engineer";
		categoryChoice.dataset.cattype = "service";
		cat.textContent = "Services - Repair";
		makeSearch.disabled = false;

		window.search();
		return true;
	}

	buttonHolder.appendChild(newButton);
	document.body.appendChild(buttonHolder);
})();
