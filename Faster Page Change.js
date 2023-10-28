// ==UserScript==
// @name        Faster Page Change
// @grant       none
// @version     1.0
// @description Flip between DF webpages quickly
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=*
// @match       https://fairview.deadfrontier.com/onlinezombiemmo/index.php?action=pm*
// @require     https://raw.githubusercontent.com/ssorpg/main/Tooltip-Crafting-Material/libraries/DOMEditor.js
// @namespace   https://greasyfork.org/users/279200
// ==/UserScript==

(function() {
    "use strict";

    const { DOMEditor } = window.ssorpg1;

    // The pages we display the buttons for
    const pages = [
        { name: "Bank", page: "15" },
        { name: "The Yard", page: "24" },
        { name: "Inventory", page: "25" },
        { name: "Marketplace", page: "35" },
        { name: "Storage", page: "50" },
        { name: "Crafting", page: "59" },
    ];

    const params = (new URL(document.location)).searchParams;
    if (params.has("page")) {
        // Determine if current page is one of the above pages
        let isValidPage = false;

        for (const page of pages) {
            if (params.has("page", page.page)) {
                isValidPage = true;
                break;
            }
        }

        if (!isValidPage) {
            return;
        }
    }
    // On messages page
    else if (params.has("action", "pm")) {
        DOMEditor.getMessagesTable().style.marginTop = "10px";
    }

    // Get parent we're going to append to
    const parent = DOMEditor.getMainMenuBottom();
    parent.style.position = "relative";

    // Contains the buttons
    const buttonHolder = document.createElement("div");
    buttonHolder.id = "ssorpg1_PageChangeDiv";
    buttonHolder.style.textAlign = "center";
    buttonHolder.style.position = "absolute";
    buttonHolder.style.left = "61.1%";
    buttonHolder.style.bottom = "-4px";
    buttonHolder.style.width = "100%";
    buttonHolder.style.transform = "translate(-50%, 0)";

    // Modular button creation
    // To add a new button, just add the relevant object to pages array
    for (const page of pages) {
        const newButton = document.createElement("input");
        newButton.type = "button";
        newButton.style.margin = "0 2px 0 2px";
        newButton.style.width = "80px";
        newButton.value = page.name;
        newButton.dataset.page = page.page;
        newButton.addEventListener("click", (e) => {
            window.location.href = `https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=${e.currentTarget.dataset.page}`;
        });
        buttonHolder.appendChild(newButton);
    }

    parent.append(buttonHolder);
})();
