"use strict";

export interface IItemElement extends HTMLDivElement {
	dataset: {
		type: string,
		quantity: string,
		price?: string,
		itemtype?: string
	}
}