"use strict";

import { IInventoryJS, IItemData, Issorpg1 } from "../Interfaces/Window";
import { parseFlashReturn } from "./Helpers";

declare const window: Window & IInventoryJS & Issorpg1;

// Represents a type of item, and not a particular instance of that item
export class ItemBase {
	static readonly MAX_PRICES_TO_AVERAGE = 5;		// Average at-most 5 prices
	static readonly MAX_MARKET_NAME = 20;			// 20 char limit
	static readonly DEFAULT_CREDIT_AMOUNT = 100;	// 100 credits
	static readonly EXPIRATION_TIME = 20000;		// 20 seconds

	// A string which can be used to select itemData `window.globalData`
	private _itemSelector: string;
	public get itemSelector() {
		return this._itemSelector;
	}

	// Its data from `window.globalData`
	private _itemData: IItemData;
	public get itemData() {
		return this._itemData;
	}

	// Calculated from market data
	private _marketPriceAverage = 0;

	// The time after which this object's `marketPriceAverage` needs to be calculated again
	private _marketPriceExpiration = 0;

	constructor(itemSelector: string) {
		this._itemSelector = itemSelector;
		this._itemData = window.globalData[this.itemSelector];

		if (!this._itemData) {
			throw new Error("Invalid itemSelector passed to ItemBase constructor");
		}
	}

	public get category() {
		return this.itemData.itemcat;
	}

	public get name() {
		return this.itemData.name;
	}

	public get stackable() {
		return (this.category == "ammo" || this.category == "credits");
	}

	public get transferable() {
		return (this.itemData.no_transfer != "1");
	}

	public get craftingMaterials() {
		return this.itemData.requiredItemsDesc;
	}

	public get marketName() {
		return this.name.substring(0, ItemBase.MAX_MARKET_NAME);
	}

	async getMarketPriceAverage() {
		if (Date.now() > this._marketPriceExpiration) {
			await this._setMarketPriceAverage();
		}

		return this._marketPriceAverage;
	}

	// Fetches and parses market data
	private async _setMarketPriceAverage() {
		const { userVars, webCall } = window;
		const callData = {
			pagetime: userVars.pagetime,
			tradezone: userVars.DFSTATS_df_tradezone,
			searchname: this.marketName,
			memID: "",
			profession: "",
			category: "",
			search: "trades",
			searchtype: "buyinglistitemname"
		};

		const rawMarketData = await new Promise<string>((resolve) => webCall("trade_search", callData, resolve, true));
		this._marketPriceExpiration = Date.now() + ItemBase.EXPIRATION_TIME;

		const parsedMarketData = parseFlashReturn(rawMarketData);
		const filteredMarketData = Object.entries(parsedMarketData).filter(([key, value]) => value.itemname == this.name);
		filteredMarketData.forEach((value, i) => value[0] = i.toString());

		let marketPriceSum = 0;
		let counter = 0;
		for (const [key, value] of filteredMarketData) {
			const { price, quantity, id_member } = value;

			// Don't consider prices from the same user
			if (id_member == userVars.userID) {
				continue;
			}

			const _quantity = this.stackable ? Number(quantity) : 1;
			marketPriceSum += Number(price) / _quantity;

			counter++;
			if (counter >= ItemBase.MAX_PRICES_TO_AVERAGE) {
				break;
			}
		}

		if (counter == 0) {
			return;
		}

		this._marketPriceAverage = marketPriceSum / counter;
	}
}
