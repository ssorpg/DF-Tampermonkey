// ==UserScript==
// ==UserLibrary==
// @name        Helpers
// @grant       none
// @version     1.0
// @description Library to provide helper functions
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/
// @namespace   https://greasyfork.org/users/279200
// ==/UserLibrary==
// ==/UserScript==

window.ssorpg1 ??= {};

(function() {
	"use strict";

	if (window.ssorpg1.helpers) {
		return;
	}

	const helpers = {};

	// Courtesy of https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
	helpers.roundToTwo = function(num) {
		return +(Math.round(num + "e+2") + "e-2");
	}

	window.ssorpg1.helpers = helpers;
})();
