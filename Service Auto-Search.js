// ==UserScript==
// @name        Service Auto-Search
// @grant       none
// @version     1.0
// @description Automatically searches for service professionals of a certain level
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @require		https://raw.githubusercontent.com/ssorpg/DF-Tampermonkey/Tooltip-Crafting-Material/libraries/WebcallScheduler.js
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

	const { WebcallScheduler } = window.ssorpg1;

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

        document.getElementById("searchField").value = "75";
        document.getElementById("categoryChoice").dataset.catname = "Engineer";
        document.getElementById("categoryChoice").dataset.cattype = "service";
        document.getElementById("cat").textContent = "Services - Repair";
        document.getElementById("makeSearch").disabled = false;

		WebcallScheduler.enqueue(tradeSearch);
    });

	async function tradeSearch() {
        const callData = {
            pagetime: window.userVars.pagetime,
            tradezone: window.userVars.DFSTATS_df_tradezone,
            searchname: "75",
            memID: "",
            searchtype: "buyinglist",
            profession: "Engineer",
            category: "",
            search: "services"
        };

		const data = await new Promise((resolve) => window.webCall("trade_search", callData, resolve, true));
		window.flshToArr(`${data}&services=${callData.profession}&searcheditem=${callData.searchname}`, "", window.listMarket);
		window.populateInventory();
		window.updateAllFields();
		return true;
	}

    buttonHolder.appendChild(newButton);
    document.body.appendChild(buttonHolder);
})();
