// Parses flash returns from server
export const parseFlashReturn = function(flash: string) {
	const flashAsObj: { [key: string]: any } = {};
	const flashMatches = flash.trim().matchAll(/([a-z]*_*[a-z]+)_*([0-9]+)_(.*?)=(.*?)(?:&|$)/gi);

	for (const value of flashMatches) {
		const [match, type, num, itemKey, itemValue] = value;
		flashAsObj[num] ??= {};
		flashAsObj[num][itemKey] = itemValue;
	}

	return flashAsObj;
}