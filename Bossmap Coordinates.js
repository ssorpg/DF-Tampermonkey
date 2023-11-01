// ==UserScript==
// @name         Bossmap Coordinates
// @version      1.0
// @description  Displays coordinates on the DFProfiler Bossmap
// @author       ssorpg1
// @match        https://www.dfprofiler.com/bossmap
// @grant        none
// ==/UserScript==

(function() {
    "user strict";

    setTimeout(setup, 1000);

    function setup() {
        const bossTable = document.getElementById("boss-table");
        for (const tr of bossTable.firstElementChild.children) {
            for (const td of tr.children) {
                td.addEventListener("click", (e) => setTimeout(setCoordsDiv(e), 0));
            }
        }
    }

    function setCoordsDiv(e) {
        const classNames = e.currentTarget.className.split(" ");
        const [, x, y] = classNames;

        let coordsDiv = document.getElementById("ssorpg1_BossmapCoordinates");

        if (!coordsDiv) {
            coordsDiv = document.createElement("div");
            coordsDiv.id = "ssorpg1_BossmapCoordinates";
            document.getElementById("mission-info").prepend(coordsDiv);
        }

        coordsDiv.textContent = `${x}, ${y}`;
    }
})();