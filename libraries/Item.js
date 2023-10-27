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
        name = null;
        color = null;
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
            else if (itemElementOrSelector instanceof String) {
                this.itemSelector = itemElementOrSelector;
            }
            else {
                throw new Error("Wrong type in Item constructor");
            }

            this._setItemData();
            this._setItemQuantity();

            this._setNameAndColor();
            this._setType();
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

        // Seperates clothing colors from item name
        _setNameAndColor() {
            const nameAsArr = window.itemNamer(this.itemSelector, this.itemQuantity).split(" ");
            for (const word of Item.INVALID_WORDS) {
                if (nameAsArr[0] == word) {
                    this.color = nameAsArr.shift();
                    break;
                }
            }

            this.name = nameAsArr.join(" ");
        }

        _setType() {
            this.type = this.itemData.itemcat;
        }

        _setStackable() {
            this.stackable = this.type == "ammo" || this.type == "credits";
        }

        _setQuantity() {
            this.quantity = this.stackable ? this.itemQuantity : 1;
        }

        _setTransferable() {
            this.transferable = !this.itemData.no_transfer;
        }

        _setScrapValue() {
            this.scrapValue = window.scrapValue(this.itemSelector, this.itemQuantity);
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
            const filteredMarketData = Object.entries(parsedMarketData).filter(([key, entity]) => entity.itemname == this.name);
            this.marketData = Object.fromEntries(filteredMarketData);
		}

        // Calculates and set the price average for this item
        setMarketPriceAverage() {
			if (!this.marketData) {
				return;
			}

            let marketPriceSum = 0;
            let counter = 0;
            for (const [key, entity] of Object.entries(this.marketData)) {
                const { price, quantity } = entity;
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
        const flashMatches = flash.matchAll(/([a-z]*[_a-z]+)_*([0-9]*)_(.*?)=(.*?)&/gi);

        for (const entity of flashMatches) {
            const [match, type, num, field, value] = entity;
            flashAsObj[num] ??= {};
            flashAsObj[num][field] = value;
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
