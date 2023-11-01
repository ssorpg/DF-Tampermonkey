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
                td.addEventListener("click", (e) => setTimeout(setCoords(e), 0));
            }
        }
    }

    function setCoords(e) {
        const classNames = e.currentTarget.className.split(" ");
        const [, x, y] = classNames;
        const coords = document.createElement("div");
        document.getElementById("mission-info").prepend(coords);
        coords.textContent = `${x}, ${y}`;
    }
})();