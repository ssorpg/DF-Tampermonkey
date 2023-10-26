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
        itemData = null;

        name = null;
        color = null;
        type = null;
        stackable = false;
        quantity = null;
        transferable = true;
        scrapValue = null;

        marketData = null;
        marketPriceAverage = null;

        constructor(itemElement) {
            this.itemElement = itemElement;
            this._setItemDataFromElement();

            this._setNameAndColor();
            this._setType();
            this._setStackable();
            this._setQuantity();
            this._setTransferable();
            this._setScrapValue();
        }

        _setItemDataFromElement() {
            this.itemData = window.globalData[(this.itemElement.dataset.type.trim().split("_"))[0]];
        }

        // Seperates clothing colors from item name
        _setNameAndColor() {
            const nameAsArr = this._getItemNameFromElement().split(" ");
            for (const word of Item.INVALID_WORDS) {
                if (nameAsArr[0] == word) {
                    this.color = nameAsArr.shift();
                    break;
                }
            }

            this.name = nameAsArr.join(" ");
        }

        _getItemNameFromElement() {
            return window.itemNamer(this.itemElement.dataset.type, this.itemElement.dataset.quantity);
        }

        _setType() {
            this.type = this.itemElement.dataset.itemtype;
        }

        _setStackable() {
            this.stackable = this.type == "ammo" || this.type == "credits";
        }

        _setQuantity() {
            this.quantity = this.stackable ? Number(this.itemElement.dataset.quantity) : 1;
        }

        _setTransferable() {
            this.transferable = this.itemData.no_transfer != "1";
        }

        _setScrapValue() {
            this.scrapValue = window.scrapValue(this.itemElement.dataset.type, this.itemElement.dataset.quantity);
        }

		async setMarketData() {
			const dataArray = {
				pagetime: window.userVars.pagetime,
				tradezone: window.userVars.DFSTATS_df_tradezone,
				searchname: this.name,
				memID: "",
				profession: "",
				category: "",
				search: "trades",
				searchtype: "buyinglistitemname"
			};

			const rawMarketData = await new Promise((resolve) => window.webCall("trade_search", dataArray, resolve, true));
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
            for (const { key, entity } in this.marketData) {
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
        const flashMatches = flash.matchAll(/(.*?)_(.*?)_(.*?)=(.*?)&/g);

        for (const entity of flashMatches) {
            const [, type, num, field, value] = entity;
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
