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
        itemElement = null;
        itemSelector = null;
        itemData = null;
        itemQuantity = null;

        type = null;
        color = null;
        name = null;
        category = null;
        stackable = false;
        quantity = null;
        transferable = true;
        scrapValue = null;

        marketData = null;
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

            this._setType();
            this._setColorAndName();
            this._setCategory();
            this._setStackable();
            this._setQuantity();
            this._setTransferable();
            this._setScrapValue();
        }

        _setItemData() {
            this.itemData = window.globalData[this.itemSelector];
        }

        _setItemQuantity() {
            this.itemQuantity = this.itemElement ? this.itemElement.dataset.quantity : 1;
        }

        _setType() {
            this.type = this.itemElement ? this.itemElement.dataset.type : this.itemSelector;
        }

        // Seperates clothing colors from item name
        _setColorAndName() {
            const nameAsArr = window.itemNamer(this.type, this.itemQuantity).split(" ");
            for (const word of Item.INVALID_WORDS) {
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
            this.transferable = !this.itemData.no_transfer;
        }

        _setScrapValue() {
            this.scrapValue = window.scrapValue(this.type, this.itemQuantity);
        }

		async setMarketData() {
			const callData = {
				pagetime: window.userVars.pagetime,
				tradezone: window.userVars.DFSTATS_df_tradezone,
				searchname: this.name,
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

    Item.INVALID_WORDS = ["Black", "Blue", "Brown", "Green", "Grey", "Red", "White", "Yellow"];
    Item.MAX_PRICES_TO_AVERAGE = 5;

    window.ssorpg1.Item = Item;
})();
