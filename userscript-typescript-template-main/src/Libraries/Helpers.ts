"use strict";

// Parses flash returns from server
export function parseFlashReturn(flash: string) {
	const flashAsObj: { [key: string]: { [key:string]: string } } = {};
	const flashMatches = flash.trim().matchAll(/([a-z]*_*[a-z]+)_*([0-9]+)_(.*?)=(.*?)(?:&|$)/gi);

	for (const value of flashMatches) {
		const [match, type, num, itemKey, itemValue] = value;
		flashAsObj[num] ??= {};
		flashAsObj[num][itemKey] = itemValue;
	}

	return flashAsObj;
}

// Courtesy of https://stackoverflow.com/questions/11832914/how-to-round-to-at-most-2-decimal-places-if-necessary
export function roundToTwo(num: number) {
	return +(Math.round(num + Number("e+2")) + "e-2");
}

export function getItemSelector(itemElement: HTMLDivElement) {
	return (itemElement.dataset.type?.trim().split("_"))?.[0] ?? "";
}
