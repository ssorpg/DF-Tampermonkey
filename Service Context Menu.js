// ==UserScript==
// @name		Service Context Menu
// @grant		none
// @version		1.0
// @description	Provides a right-click context menu to automatically search for service professionals
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Upgraded-Service-Context-Menu/libraries/Item.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Upgraded-Service-Context-Menu/libraries/DOMEditor.js
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Upgraded-Service-Context-Menu/libraries/WebcallScheduler.js
// @namespace	https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
	"use strict";

	if (!window.inventoryHolder) {
		return;
	}

	const { ssorpg1, marketScreen, inventoryHolder, populateInventory, updateAllFields, userVars, updateIntoArr, flshToArr, populateCharacterInventory } = window;
	const { Item, DOMEditor, WebcallScheduler } = ssorpg1;

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

		if (marketScreen != "buy" || !itemElement) {
			return;
		}

		if (contextMenu) {
			contextMenu.remove();
		}

		const item = new Item(itemElement);
		let textContent = null;

		if (item.serviceType == "Engineer") {
			textContent = "Repair with engineer";
		}
		else if (item.serviceType == "Doctor") {
			textContent = "Administer with doctor";
		}
		else if (item.serviceType == "Chef") {
			textContent = "Cook with chef";
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
		contextMenu.style.width = "240px";
		mouseIsOverContextMenu = false;
		contextMenu.addEventListener("mouseenter", () => mouseIsOverContextMenu = true);
		contextMenu.addEventListener("mouseleave", () => mouseIsOverContextMenu = false);

		const title = document.createElement("div");
		title.style.textAlign = "center";
		title.textContent = item.name;

		const button = document.createElement("button");
		button.textContent = textContent;
		button.style.width = "100%";
		button.addEventListener("mousedown", () => WebcallScheduler.enqueue(() => findService(item)));

		contextMenu.appendChild(title);
		contextMenu.appendChild(button);
		inventoryHolder.appendChild(contextMenu);
		DOMEditor.contextMenuCorrection(contextMenu);
		contextMenu.style.visibility = "visible";
	}

	async function findService(item) {
		contextMenu.remove();
		await item.setServiceData();
		await useService(item);
		populateInventory();
		updateAllFields();
		return true;
	}

	async function useService(item) {
		const selectedService = item.serviceData[0];

		if (!selectedService) {
			return;
		}

		const callData = {
			pagetime: userVars.pagetime,
			templateID: userVars.template_ID,
			sc: userVars.sc,
			creditsnum: 0,
			buynum: selectedService.id_member,
			renameto: "undefined`undefined",
			expected_itemprice: selectedService.price,
			expected_itemtype: "",
			expected_itemtype2: "",
			itemnum: item.itemElement.parent.dataset.slot,
			itemnum2: "0",
			price: item.scrapValue,
			action: item.serviceAction,
			gv: "42",
			userID: userVars.userID,
			password: userVars.password
		};

		const response = await new Promise((resolve) => webCall("inventory_new", callData, resolve, true));
		updateIntoArr(flshToArr(response, "DFSTATS_"), userVars);
		populateCharacterInventory();
	}

	// Use directly
	// var dataArr = {};
	// dataArr["pagetime"] = userVars["pagetime"];
	// dataArr["templateID"] = userVars["template_ID"];
	// dataArr["sc"] = userVars["sc"];
	// dataArr["creditsnum"] = 0;
	// dataArr["buynum"] = 0;
	// dataArr["renameto"] = "undefined`undefined";
	// dataArr["expected_itemprice"] = "-1";
	// dataArr["expected_itemtype2"] = "";
	// dataArr["expected_itemtype"] = currentItem.dataset.type;
	// dataArr["itemnum2"] = "0";
	// dataArr["itemnum"] = currentItem.parentNode.dataset.slot;
	// dataArr["price"] = 0;
	// dataArr["gv"] = 42;

	// dataArr["action"] = "newuse";		// medicine
	// dataArr["action"] = "newconsume";	// food

	// webCall("inventory_new", dataArr, function(webData)
	// {
	// 	if(doPageRefresh)
	// 	{
	// 		location.reload(true);
	// 		return;
	// 	}
	// 	updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
	// 	populateInventory();
	// 	populateCharacterInventory();
	// 	updateAllFields();
	// }, true);
})();
