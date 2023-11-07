"use strict";

import { IitemData } from "./Types";
import { parseFlashReturn } from "./Helpers";

// Represents a type of item, and not a particular instance of it
export class Item {
	// A string which can be used to select itemData `window.globalData`
	private _itemSelector: string;
	// Its data from `window.globalData`
	private _itemData: IitemData;

	// Flag that shows this item is awaiting serviceData
	private _serviceWaiting = false;

	// Flag that shows this item is awaiting marketData
	private _marketPriceWaiting = false;
	// Calculated from `marketData`
	private _marketPriceAverage = 0;
	// The time after which this object's `marketPriceAverage` needs to be calculated again
	private _marketPriceExpiration = 0;

	constructor(itemSelector: string) {
		this._itemSelector = itemSelector;
		this._itemData = window.globalData[this._itemSelector];
	}

	public get itemSelector() {
		return this._itemSelector;
	}

	public get itemData() {
		return this._itemData;
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

	public getScrapValue(quantity: number) {
		return window.scrapValue(this.itemSelector, quantity);
	}

	public get craftingMaterials() {
		return this.itemData.requiredItemsDesc;
	}

	public getServiceInfo(armourHP?: number) {
		const serviceInfo = {
			serviceType: "",
			serviceAction: "",
			serviceLevel: 0
		};

		// Specifically undefined, because it could be 0
		if (armourHP != undefined && this.category == "armour" && armourHP < Number(this.itemData.hp)) {
			serviceInfo.serviceType = "Engineer";
			serviceInfo.serviceAction = "buyrepair";
			serviceInfo.serviceLevel = (Number(this.itemData.shop_level) - 5);
		}
		else if (this.itemData.needdoctor == "1") {
			serviceInfo.serviceType = "Doctor";
			serviceInfo.serviceAction = "buyadminister";
			serviceInfo.serviceLevel = (Number(this.itemData.level) - 5);
		}
		else if (this.itemData.needcook == "1") {
			serviceInfo.serviceType = "Chef";
			serviceInfo.serviceAction = "buycook";
			serviceInfo.serviceLevel = (Number(this.itemData.level) - 5);
		}

		return serviceInfo;
	}

	public get serviceWaiting() {
		return this._serviceWaiting;
	}

	public get marketName() {
		return this.name.length >= Item.MAX_MARKET_NAME ? this.name.substring(0, Item.MAX_MARKET_NAME) : this.name;
	}

	async getMarketPriceAverage() {
		if (Date.now() > this._marketPriceExpiration) {
			await this.setMarketPriceAverage();
		}

		return this._marketPriceAverage;
	}

	// Fetches and parses market data
	async setMarketPriceAverage() {
		this._marketPriceWaiting = true;

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
			if (counter >= Item.MAX_PRICES_TO_AVERAGE) {
				break;
			}
		}

		this._marketPriceExpiration = Date.now() + Item.EXPIRATION_TIME;

		if (counter == 0) {
			return;
		}

		this._marketPriceAverage = marketPriceSum / counter;
		this._marketPriceWaiting = false;
	}

	public async getLowestPriceService(armourHP?: number) {
		this._serviceWaiting = true;

		const serviceInfo = this.getServiceInfo(armourHP);
		const { userVars, webCall } = window;
		const callData = {
			pagetime: userVars.pagetime,
			tradezone: userVars.DFSTATS_df_tradezone,
			searchname: serviceInfo.serviceLevel,
			memID: "",
			profession: serviceInfo.serviceType,
			category: "",
			search: "services",
			searchtype: "buyinglist"
		};

		const rawServiceData = await new Promise<string>((resolve) => webCall("trade_search", callData, resolve, true));
		const parsedServiceData = parseFlashReturn(rawServiceData);
		const filteredServiceData = Object.entries(parsedServiceData).filter(([key, value]) => value.level == serviceInfo.serviceLevel);
		filteredServiceData.forEach((value, i) => value[0] = i.toString());

		this._serviceWaiting = false;
		return filteredServiceData.length ? filteredServiceData[0][1] : {};
	}

	static readonly MAX_PRICES_TO_AVERAGE = 5;		// Average at-most 5 prices
	static readonly MAX_MARKET_NAME = 20;			// 20 char limit
	static readonly DEFAULT_CREDIT_AMOUNT = 100;	// 100 credits
	static readonly EXPIRATION_TIME = 20000;		// 20 seconds
}

window.ssorpg1 ??= {};
window.ssorpg1.Item = Item;