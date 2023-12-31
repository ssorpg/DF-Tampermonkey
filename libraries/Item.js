// ==UserScript==
// ==UserLibrary==
// @name		Item
// @grant		none
// @version		1.0
// @description	Library to provide item fetching
// @author		ssorpg1
// @match		https://fairview.deadfrontier.com/
// @namespace	https://greasyfork.org/users/279200
// ==/UserLibrary==
// ==/UserScript==

(function() {
    "use strict";

	window.ssorpg1 ??= {};
	if (window.ssorpg1.Item) {
		return;
	}

	class Item {
		// The element this item was constructed from
		itemElement = null;
		// A string which can be used to select itemData `window.globalData`
		itemSelector = null;
		// Its data from `window.globalData`
		itemData = null;
		// The quantity of the item
		itemQuantity = null;

		// Item category (ammo, armor, etc)
		category = null;
		// Color of the item (for clothing/armor)
		color = null;
		// Item display name without color
		name = null;
		// Whether the item has been cooked or not
		cooked = false;
		// Can this item be stacked?
		stackable = false;
		// The quantity of the item, capped to 1 for armor and credits
		quantity = null;
		// Can this item be transfered?
		transferable = true;
		// Dollar value when scrapping
		scrapValue = null;
		// Materials required to craft
		craftingMaterials = null;

		// Item display name without color, capped to 20 characters
		marketName = null;
		// Flag that shows this item is awaiting marketData
		marketWaiting = false;
		// Flash data fetched from backend
		marketData = null;
		// Calculated from `marketData`
		marketPriceAverage = null;
		// The time after which this object's `marketPriceAverage` needs to be calculated again
		marketPriceExpiration = null;

		constructor(itemElementOrSelector) {
			if (itemElementOrSelector instanceof HTMLElement) {
				this.itemElement = itemElementOrSelector;
				this.itemSelector = (this.itemElement.dataset.type.trim().split("_"))[0];
			}
			else if (typeof itemElementOrSelector === "string") {
				this.itemSelector = itemElementOrSelector;
			}
			else {
				throw new Error("Wrong type in Item constructor");
			}

			this._setItemData();
			this._setItemQuantity();

			this._setCategory();
			this._setCooked();
			this._setColorAndName();
			this._setStackable();
			this._setQuantity();
			this._setTransferable();
			this._setScrapValue();
			this._setCraftingMaterials();

			this._setMarketName();
		}

		_getItemSelector() {
			return this.itemSelector + (this.cooked ? "_cooked" : "");
		}

		_setItemData() {
			this.itemData = window.globalData[this.itemSelector];
		}

		_setItemQuantity() {
			this.itemQuantity = this.itemElement ? this.itemElement.dataset.quantity : 1;
		}

		_setCategory() {
			this.category = this.itemData.itemcat;
		}

		_setCooked() {
			this.cooked = this.itemElement ? this.itemElement.dataset.type.includes("_cooked") : false;
		}

		// Seperates clothing colors from item display name
		_setColorAndName() {
			if (this.category == "credits") {
				this.name = "1 Credits";
				return;
			}

			const nameAsArr = window.itemNamer(this.itemSelector, this.itemQuantity).split(" ");
			if (this.itemData.othercolours?.includes(nameAsArr[0])) {
				this.color = nameAsArr.shift();
			}

			this.name = (this.cooked ? "Cooked " : "") + nameAsArr.join(" ");
		}

		_setStackable() {
			this.stackable = this.category == "ammo" || this.category == "credits";
		}

		_setQuantity() {
			this.quantity = this.stackable ? this.itemQuantity : 1;
		}

		_setTransferable() {
			this.transferable = this.itemData.no_transfer != "1";
		}

		_setScrapValue() {
			this.scrapValue = window.scrapValue(this.itemElement ? this.itemElement.dataset.type : this.itemSelector, this.itemQuantity);
		}

		_setCraftingMaterials() {
			const { requiredItemsDesc } = this.itemData;

			if (!requiredItemsDesc) {
				return;
			}

			this.craftingMaterials = {};
			const craftingMaterialMatches = requiredItemsDesc.matchAll(/\s*([a-z\s]*)\sx\s([0-9]*)/gi);
			for (const value of craftingMaterialMatches) {
				const [ match, item, quantity ] = value;
				this.craftingMaterials[item] = quantity;
			}
		}

		_setMarketName() {
			this.marketName = this.name.length >= Item.MAX_MARKET_NAME ? this.name.substr(0, Item.MAX_MARKET_NAME) : this.name;
		}

		// Fetches and parses market data
		async setMarketData() {
			this.marketWaiting = true;

			const callData = {
				pagetime: window.userVars.pagetime,
				tradezone: window.userVars.DFSTATS_df_tradezone,
				searchname: this.marketName,
				memID: "",
				profession: "",
				category: "",
				search: "trades",
				searchtype: "buyinglistitemname"
			};

			const rawMarketData = await new Promise((resolve) => window.webCall("trade_search", callData, resolve, true));
			const parsedMarketData = Item.parseFlashReturn(rawMarketData);
			const filteredMarketData = Object.entries(parsedMarketData).filter(([key, value]) => value.itemname == this.name);
			this.marketData = Object.fromEntries(filteredMarketData);
			this.marketWaiting = false;
			this.marketPriceExpiration = Date.now() + Item.EXPIRATION_TIME;
		}

		// Calculates and sets the price average for this item
		setMarketPriceAverage() {
			if (!this.marketData) {
				return;
			}

			let marketPriceSum = 0;
			let counter = 0;
			for (const [key, value] of Object.entries(this.marketData)) {
				const { price, quantity, id_member } = value;

				// Don't consider prices from the same user
				if (id_member == window.userID) {
					continue;
				}

				const _quantity = this.stackable ? Number(quantity) : 1;
				marketPriceSum += Number(price) / _quantity;

				counter++;
				if (counter >= Item.MAX_PRICES_TO_AVERAGE) {
					break;
				}
			}

			if (counter == 0) {
				return;
			}

			this.marketPriceAverage = marketPriceSum / counter;
		}
	}

	// Parses flash returns from server
	Item.parseFlashReturn = function(flash) {
		const flashAsObj = {};
		const flashMatches = flash.trim().matchAll(/([a-z]*_*[a-z]+)_*([0-9]+)_(.*?)=(.*?)(?:&|$)/gi);

		for (const value of flashMatches) {
			const [match, type, num, itemKey, itemValue] = value;
			flashAsObj[num] ??= {};
			flashAsObj[num][itemKey] = itemValue;
		}

		return flashAsObj;
	}

	// Checks whether this item needs to recalculate its price average
	Item.checkExpiredPrice = function(item) {
		return Date.now() < item.marketPriceExpiration;
	}

	Item.MAX_PRICES_TO_AVERAGE = 5;		// Average at-most 5 prices
	Item.MAX_MARKET_NAME = 20;			// 20 char limit
	Item.DEFAULT_CREDIT_AMOUNT = 100;	// 100 credits
	Item.EXPIRATION_TIME = 20000;		// 20 seconds

	window.ssorpg1.Item = Item;
})();
