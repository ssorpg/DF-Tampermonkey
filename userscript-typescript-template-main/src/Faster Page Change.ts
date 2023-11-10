// ==UserScript==
// @name		Faster Page Change
// @grant		none
// @version		1.0
// @description	Flip between DF webpages quickly
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?action=pm*
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

"use strict";

import { Issorpg1 } from "./Interfaces/Window";
import "./Libraries/DOMEditor";

declare const window: Window & Issorpg1;

(function() {
	// The pages we display the buttons for
	const pages = [
		{ name: "Bank", page: "15" },
		{ name: "The Yard", page: "24" },
		{ name: "Inventory", page: "25" },
		{ name: "Marketplace", page: "35" },
		{ name: "Storage", page: "50" },
		{ name: "Crafting", page: "59" },
	];

	let isValidPage = false;
	const params = (new URL(document.location.toString())).searchParams;

	if (params.has("page")) {
		// Determine if current page is one of the above pages
		for (const page of pages) {
			if (params.get("page") == page.page) {
				isValidPage = true;
				break;
			}
		}

		if (!isValidPage) {
			return;
		}
	}
	// On messages page
	else if (params.get("action") == "pm") {
		window.ssorpg1_DOMEditor.getMessagesTable().style.marginTop = "10px";
	}

	// Get parent we're going to append to
	const mainMenuBottom = window.ssorpg1_DOMEditor.getMenuBottom();
	mainMenuBottom.style.position = "relative";

	// Contains the buttons
	const buttonHolder = document.createElement("div");
	buttonHolder.id = "ssorpg1_PageChangeDiv";
	buttonHolder.style.textAlign = "center";
	buttonHolder.style.position = "absolute";
	buttonHolder.style.left = "61.1%";
	buttonHolder.style.bottom = "-4px";
	buttonHolder.style.width = "100%";
	buttonHolder.style.transform = "translate(-50%, 0)";

	// To add a new button, just add the relevant object to pages array
	for (const page of pages) {
		const newButton = document.createElement("input");
		newButton.type = "button";
		newButton.style.margin = "0 2px 0 2px";
		newButton.style.width = "80px";
		newButton.value = page.name;
		newButton.dataset.page = page.page;
		newButton.addEventListener("click", (e) => {
			const currentTarget = e.currentTarget as HTMLInputElement;

			if (!currentTarget?.dataset.page) {
				return;
			}

			window.location.href = `https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=${currentTarget.dataset.page}`;
		});
		buttonHolder.appendChild(newButton);
	}

	mainMenuBottom.append(buttonHolder);
})();
