"use strict";

import { DOMEditor } from "../Libraries/DOMEditor";
import { ItemBase } from "../Libraries/ItemBase";
import { WebcallScheduler } from "../Libraries/WebcallScheduler";

// Custom window properties
export interface Issorpg1 {
	ssorpg1_ItemBase: new (itemSelector: string) => ItemBase,
	ssorpg1_itemBases: { [key: string]: ItemBase },
	ssorpg1_DOMEditor: DOMEditor,
	ssorpg1_WebcallScheduler: WebcallScheduler
}

// The itemData, userVars, and js interfaces do not include every variable/function - only the ones used in this project
export interface IUserVars {
	userID: string,
	password: string,
	sc: string,
	template_ID: string,
	pagetime: string,
	DFSTATS_df_tradezone: string
}

export interface IBaseJS {
	webCall: (call: string, params: { [key: string]: string }, callback: (data: string) => void, hashed: boolean) => void,
	updateIntoArr: (flshArr: any[], baseArr: any[] | object) => void,
	flshToArr: (flashStr: string, padding?: string, callback?: Function) => string[],
	updateAllFields: () => void,
	userVars: IUserVars,
	pageLock: boolean
}

export interface IBankJS {
	pData: object // TODO: determine this type
}

export interface IItemData {
	name: string,
	itemcat: string,
	othercolours?: string,
	no_transfer: string,
	requiredItemsDesc?: string,
	hp?: string,
	shop_level?: string,
	level?: string,
	needdoctor?: string,
	needcook?: string
}

export interface IInventoryJS {
	scrapValue: (itemSelector: string, quantity: number) => number,
	populateInventory: () => void,
	populateCharacterInventory: () => void,
	globalData: { [key: string]: IItemData },
	inventoryHolder: HTMLDivElement,
	infoBox: HTMLDivElement,
	ctxMenuHolder: HTMLDivElement,
	mousePos: number[]
}

export interface IMarketJS {
	marketScreen: string
}

declare global {
	interface Window extends IBaseJS {}
}
