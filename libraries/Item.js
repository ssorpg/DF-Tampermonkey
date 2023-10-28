// ==UserScript==
// ==UserLibrary==
// @name        Item
// @grant       none
// @version     1.0
// @description Library to provide item fetching
// @author      ssorpg1
// @match       https://fairview.deadfrontier.com/
// @namespace   https://greasyfork.org/users/279200
// ==/UserLibrary==
// ==/UserScript==

(function() {
    "use strict";

	window.ssorpg1 ??= {};
    if (window.ssorpg1.Item) {
        return;
    }

    class Item {
        // The element this Item was constructed from
        itemElement = null;
        // A string which can be used to select itemData `window.globalData`
        itemSelector = null;
        // Its data from `window.globalData`
        itemData = null;
        // The item's stated quantity (only relevant if constructed from an element)
        itemQuantity = null;

        // Color of the item
        color = null;
        // Display name of the item (no color)
        name = null;
        // Item category (ammo, armor, etc)
        category = null;
        // Can this item be stacked?
        stackable = false;
        // "Real" quantity of the item
        quantity = null;
        // Can this item be transfered?
        transferable = true;
        // Dollar value for scrapping
        scrapValue = null;

        // The item's searchable name (for use fetching marketData)
        marketName = null;
        // Flash data fetched from backend
        marketData = null;
        // Calculated from `marketData`
        marketPriceAverage = null;

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

            this._setColorAndName();
            this._setCategory();
            this._setStackable();
            this._setQuantity();
            this._setTransferable();
            this._setScrapValue();

            this._setMarketName();
        }

        _setItemData() {
            this.itemData = window.globalData[this.itemSelector];
        }

        _setItemQuantity() {
            this.itemQuantity = this.itemElement ? this.itemElement.dataset.quantity : 1;
        }

        // Seperates clothing colors from item name
        _setColorAndName() {
            const nameAsArr = window.itemNamer(this.itemSelector, this.itemQuantity).split(" ");
            for (const word of Item.COLORS) {
                if (nameAsArr[0] == word) {
                    this.color = nameAsArr.shift();
                    break;
                }
            }

            this.name = nameAsArr.join(" ");
        }

        _setCategory() {
            this.category = this.itemData.itemcat;
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
            this.scrapValue = window.scrapValue(this.itemSelector, this.itemQuantity);
        }

        _setMarketName() {
            this.marketName = this.name.length >= Item.MAX_MARKET_NAME ? this.name.substr(0, Item.MAX_MARKET_NAME) : this.name;
        }

		async setMarketData() {
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
		}

        // Calculates and set the price average for this item
        setMarketPriceAverage() {
			if (!this.marketData) {
				return;
			}

            let marketPriceSum = 0;
            let counter = 0;
            for (const [key, value] of Object.entries(this.marketData)) {
                const { price, quantity } = value;
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

    Item.parseFlashReturn = function(flash) {
        const flashAsObj = {};
        const flashMatches = flash.trim().matchAll(/([a-z]*_*[a-z]+)_*([0-9]+)_(.*?)=(.*?)(?:&|$)/gi);

        for (const value of flashMatches) {
            const [match, type, num, itemData, itemValue] = value;
            flashAsObj[num] ??= {};
            flashAsObj[num][itemData] = itemValue;
        }

        return flashAsObj;
    }

    Item.checkSameItem = function(item1, item2) {
        return (item1 && item2 && item1.name == item2.name && item1.quantity == item2.quantity);
    }

    Item.COLORS = ["Black", "Blue", "Brown", "Green", "Grey", "Red", "White", "Yellow"];
    Item.MAX_PRICES_TO_AVERAGE = 5;
    Item.MAX_MARKET_NAME = 20;

    window.ssorpg1.Item = Item;
})();
