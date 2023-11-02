// ==UserScript==
// @name         Crafting Material Search
// @version      1.0
// @description  Expands the search function on the crafting page
// @author       ssorpg1
// @match        https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=59
// @grant        none
// ==/UserScript==

(function() {
    "use strict";

	const DROPDOWN_SELECTIONS = ["Everything", "Name", "Materials", "Category"];
	let searchDropdownOpen = false;

	// Courtesy of https://stackoverflow.com/questions/5525071/how-to-wait-until-an-element-exists
	const craftingObserver = new MutationObserver(function(mutations) {
		const crafting = document.getElementById("crafting");
		
		if (crafting) {
			setup(crafting);
			craftingObserver.disconnect();
		}
	});
	
	// Start observing
	craftingObserver.observe(document.body, {
		childList: true,
		subtree: true
	});

	function setup(crafting) {
		const items = crafting.getElementsByClassName("fakeItem");
		const opElem = document.getElementsByClassName("opElem");
		const filters = opElem[opElem.length - 1];
		const searchBar = opElem[opElem.length - 2];

		crafting.style.left = "50px";
		crafting.style.right = "50px";
		filters.style.left = "50px";
		filters.style.right = "49px";
		searchBar.style.right = "160px";

		for (const item of items) {
			item.style.display = "flex";
			item.firstChild.style.marginLeft = "2px";
			item.lastChild.style.flexGrow = "1";
			item.lastChild.style.textAlign = "right";
			item.lastChild.style.marginRight = "10px";
		}

		const recipesObserver = new MutationObserver(function(mutations) {
			for (const mutation of mutations) {
				if (mutation.target.style.display == "block") {
					mutation.target.style.display = "flex";
				}
			}
		});

		recipesObserver.observe(document.getElementById("recipes"), {
			subtree: true,
			attributes: true,
			attributeFilter: ["style"]
		});

		const inventoryholder = document.getElementById("inventoryholder");

		const searchDropdown = document.createElement("div");
		searchDropdown.className = "opElem";
		searchDropdown.id = "ssorpg1_SearchDropdown";
		searchDropdown.dataset.selection = "Name";
		searchDropdownStyle(searchDropdown);
		inventoryholder.appendChild(searchDropdown);

		const searchDropdownList = document.createElement("div");
		searchDropdownListStyle(searchDropdownList);
		inventoryholder.appendChild(searchDropdownList);

		const cat = document.createElement("span");
		cat.textContent = "Name";
		searchDropdown.appendChild(cat);

		const dog = document.createElement("span");
		dog.style.float = "right";
		dog.style.marginRight = "2px";
		dog.textContent = "◄";
		searchDropdown.appendChild(dog);

		for (const SELECTION of DROPDOWN_SELECTIONS) {
			const selection = document.createElement("div");
			selection.style.cursor = "pointer";
			selection.dataset.selection = SELECTION;
			selection.textContent = SELECTION;
			selection.addEventListener("click", () => {
				cat.textContent = SELECTION;
				searchDropdown.dataset.selection = SELECTION;
				toggleDropdown();
				// TODO: update recipe list here
			});
			selection.addEventListener("mouseenter", () => selection.style.backgroundColor = "#333333");
			selection.addEventListener("mouseleave", () => selection.style.backgroundColor = "");
			searchDropdownList.appendChild(selection);
		}

		searchDropdown.addEventListener("click", toggleDropdown);

		function toggleDropdown() {
			if (searchDropdownOpen) {
				searchDropdownList.style.display = "none";
				dog.textContent = "◄";
			}
			else {
				searchDropdownList.style.display = "block";
				dog.textContent = "▼";
			}

			searchDropdownOpen = !searchDropdownOpen;
		}

		// TODO: replace event listener for searchBar, add event listener for searchDropdown
		// TODO: search algorithms for name, materials, category
	}

	function searchDropdownStyle(searchDropdown) {
		searchDropdown.style.top = "40px";
		searchDropdown.style.right = "24px";
		searchDropdown.style.cursor = "pointer";
		searchDropdown.style.width = "132px";
		searchDropdown.style.textAlign = "center";
		searchDropdown.style.backgroundColor = "#222";
		searchDropdown.style.border = "1px solid #990000";
	}

	function searchDropdownListStyle(searchDropdownList) {
		searchDropdownList.style.display = "none";
		searchDropdownList.style.position = "absolute";
		searchDropdownList.style.zIndex = 10;
		searchDropdownList.style.width = "132px";
		searchDropdownList.style.top = "57px";
		searchDropdownList.style.right = "24px";
		searchDropdownList.style.backgroundColor = "#111";
		searchDropdownList.style.border = "1px solid #990000";
		searchDropdownList.style.borderTop = "0";
		searchDropdownList.style.textAlign = "center";
	}
})();