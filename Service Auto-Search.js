// ==UserScript==
// @name        Service Auto-Search
// @grant       none
// @version     1.0
// @description Macro which automatically searches for service professionals of a certain level
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=35
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

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

        const dataArray = {
            pagetime: window.userVars["pagetime"],
            tradezone: window.userVars["DFSTATS_df_tradezone"],
            searchname: "75",
            memID: "",
            searchtype: "buyinglist",
            profession: "Engineer",
            category: "",
            search: "services"
        };
        
        window.webCall(
            "trade_search",
            dataArray,
            (data) => {
                data += "&services=" + dataArray["profession"] + "&searcheditem=" + dataArray["searchname"];
                window.flshToArr(data, "", window.listMarket);
                window.populateInventory();
                window.updateAllFields();
            },
            true
        );
    });

    buttonHolder.appendChild(newButton);
    document.body.appendChild(buttonHolder);
})();