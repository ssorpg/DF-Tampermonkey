// ==UserScript==
// ==UserLibrary==
// @name        Helpers
// @grant       none
// @version     1.0
// @description Library to provide extraneous helper functions
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/
// @namespace   https://greasyfork.org/users/279200
// ==/UserLibrary==
// ==/UserScript==

(function() {
	"use strict";

	window.ssorpg1 ??= {};
	if (window.ssorpg1.Helpers) {
		return;
	}

	class Helpers {
		// Courtesy of https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
		roundToTwo(num) {
			return +(Math.round(num + "e+2") + "e-2");
		}
	};

	window.ssorpg1.Helpers = new Helpers();
})();
