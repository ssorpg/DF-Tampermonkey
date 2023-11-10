"use strict";

import { IItemElement } from "../Interfaces/ItemElement";
import { IInventoryJS, Issorpg1 } from "../Interfaces/Window";
import { getItemSelector, parseFlashReturn } from "./Helpers";
import { ItemBase } from "./ItemBase";

declare const window: Window & IInventoryJS & Issorpg1;

window.ssorpg1_itemBases ??= {};

// Represents a particular instance of an item
export class Item {
	// Element this item was constructed from
	private _itemElement: IItemElement;
	public get itemElement() {
		return this._itemElement;
	}

	private _itemBase: ItemBase;
	public get itemBase() {
		return this._itemBase;
	}

	// Flag that shows this item is awaiting serviceData
	private _serviceWaiting = false;
	public get serviceWaiting() {
		return this._serviceWaiting;
	}

	// Flag that shows this item is awaiting marketData
	private _marketPriceWaiting = false;
	public get marketPriceWaiting() {
		return this._marketPriceWaiting;
	}

	constructor(itemElement: IItemElement) {
		if (!itemElement.dataset.type) {
			throw new Error("No item data for itemElement passed to Item constructor");
		}

		const itemSelector = getItemSelector(itemElement);
		window.ssorpg1_itemBases[itemSelector] ??= new ItemBase(itemSelector);

		this._itemElement = itemElement;
		this._itemBase = window.ssorpg1_itemBases[itemSelector];
	}

	public get color() {
		const possibleColors = this.itemBase.itemData.othercolours?.split(",");

		if (this.itemElement.textContent && possibleColors) {
			const firstWord = this.itemElement.textContent.split(" ")[0];

			for (const color of possibleColors) {
				if (firstWord == color) {
					return color;
				}
			}
		}

		return "";
	}

	public get quantity() {
		return this.itemElement.dataset.quantity ?? "1";
	}

	public get scrapValue() {
		return window.scrapValue(this.itemElement.dataset.type, Number(this.quantity));
	}

	public getServiceInfo() {
		const serviceInfo = {
			serviceRequired: false,
			serviceAction: "",
			serviceLevel: "0",
			serviceType: ""
		};

		if (this.itemBase.category == "armour" && Number(this.quantity) < Number(this.itemBase.itemData.hp)) {
			serviceInfo.serviceRequired = true;
			serviceInfo.serviceAction = "buyrepair";
			serviceInfo.serviceLevel = (Number(this.itemBase.itemData.shop_level) - 5).toString();
			serviceInfo.serviceType = "Engineer";
		}
		else if (this.itemBase.itemData.needdoctor == "1") {
			serviceInfo.serviceRequired = true;
			serviceInfo.serviceAction = "buyadminister";
			serviceInfo.serviceLevel = (Number(this.itemBase.itemData.level) - 5).toString();
			serviceInfo.serviceType = "Doctor";
		}
		else if (this.itemBase.itemData.needcook == "1") {
			serviceInfo.serviceRequired = true;
			serviceInfo.serviceAction = "buycook";
			serviceInfo.serviceLevel = (Number(this.itemBase.itemData.level) - 5).toString();
			serviceInfo.serviceType = "Chef";
		}

		return serviceInfo;
	}

	public async getMarketPriceAverage() {
		if (this._marketPriceWaiting) {
			// console.warn("Already awaiting a market price for this item");
			return;
		}

		this._marketPriceWaiting = true;
		const marketPriceAverage = await this.itemBase.getMarketPriceAverage();
		this._marketPriceWaiting = false;

		return marketPriceAverage;
	}

	public async useService() {
		if (this._serviceWaiting) {
			// console.warn("Already awaiting a service price for this item type");
			return false;
		}

		const { serviceRequired, serviceAction, serviceLevel, serviceType } = this.getServiceInfo();

		if (!serviceRequired) {
			return false;
		}

		this._serviceWaiting = true;
		const lowestPriceService = await this._getLowestPriceService(serviceLevel, serviceType);

		if (!lowestPriceService) {
			return false;
		}

		if (!this.itemElement.parentElement?.dataset.slot) {
			return false;
		}

		const { userVars, webCall, updateIntoArr, flshToArr, populateCharacterInventory, populateInventory, updateAllFields } = window;
		const callData = {
			pagetime: window.userVars.pagetime,
			templateID: userVars.template_ID,
			sc: userVars.sc,
			creditsnum: "0",
			buynum: lowestPriceService.id_member,
			renameto: "undefined`undefined",
			expected_itemprice: lowestPriceService.price,
			expected_itemtype: "",
			expected_itemtype2: "",
			itemnum: this.itemElement.parentElement.dataset.slot,
			itemnum2: "0",
			price: this.scrapValue.toString(),
			action: serviceAction,
			gv: "42",
			userID: userVars.userID,
			password: userVars.password
		};

		const response: string = await new Promise((resolve) => webCall("inventory_new", callData, resolve, true));
		this._serviceWaiting = false;

		updateIntoArr(flshToArr(response, "DFSTATS_"), userVars);
		populateCharacterInventory();
		populateInventory();
		updateAllFields();
		return true;
	}

	private async _getLowestPriceService(serviceLevel: string, serviceType: string) {
		const { userVars, webCall } = window;
		const callData = {
			pagetime: userVars.pagetime,
			tradezone: userVars.DFSTATS_df_tradezone,
			searchname: serviceLevel,
			memID: "",
			profession: serviceType,
			category: "",
			search: "services",
			searchtype: "buyinglist"
		};

		const rawServiceData = await new Promise<string>((resolve) => webCall("trade_search", callData, resolve, true));
		const parsedServiceData = parseFlashReturn(rawServiceData);
		const filteredServiceData = Object.entries(parsedServiceData).filter(([key, value]) => value.level == serviceLevel);
		filteredServiceData.forEach((value, i) => value[0] = i.toString());
		return filteredServiceData.length ? filteredServiceData[0][1] : {};
	}

	public async useItem() {
		console.log("useItem called");
		return false;

		// TODO: implement use directly
		// var dataArr = {};
		// dataArr["pagetime"] = userVars["pagetime"];
		// dataArr["templateID"] = userVars["template_ID"];
		// dataArr["sc"] = userVars["sc"];
		// dataArr["creditsnum"] = 0;
		// dataArr["buynum"] = 0;
		// dataArr["renameto"] = "undefined`undefined";
		// dataArr["expected_itemprice"] = "-1";
		// dataArr["expected_itemtype2"] = "";
		// dataArr["expected_itemtype"] = currentItem.dataset.type;
		// dataArr["itemnum2"] = "0";
		// dataArr["itemnum"] = currentItem.parentNode.dataset.slot;
		// dataArr["price"] = 0;
		// dataArr["gv"] = 42;

		// dataArr["action"] = "newuse";		// medicine
		// dataArr["action"] = "newconsume";	// food

		// webCall("inventory_new", dataArr, function(webData)
		// {
		// 	if(doPageRefresh)
		// 	{
		// 		location.reload(true);
		// 		return;
		// 	}
		// 	updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
		// 	populateInventory();
		// 	populateCharacterInventory();
		// 	updateAllFields();
		// }, true);
	}
}