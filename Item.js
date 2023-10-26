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

window.ssorpg1 ??= {};

(function() {
    "use strict";

    if (window.ssorpg1.DF_Item) {
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

        // Fetches this item's market data from the marketplace
        async tradeSearch() {
            // No need to fetch if it's not tradeable
            if (!this.transferable) {
                return;
            }

            const dataArray = {
                pagetime: window.userVars["pagetime"],
                tradezone: window.userVars["DFSTATS_df_tradezone"],
                searchname: this.name,
                memID: "",
                profession: "",
                category: "",
                search: "trades",
                searchtype: "buyinglistitemname"
            };

            // TODO: create WebcallScheduler
            this.marketData = await new Promise((resolve) => window.webCall("trade_search", dataArray, resolve, true));
        }
        
        // TODO: refactor at some point
        // Calculates and set the price average for this item
        setMarketPriceAverage() {
            // Fetch indexes of all items with the exact name
            let startIndex = -1;
            let endIndex = -1;
            const names = [...this.marketData.matchAll(/_itemname=(.*?)&/g)];
            for (let i = 0; i < names.length; i++) {
                const name = names[i][1];
        
                // We reached the first item with the exact name
                if (startIndex == -1 && name == this.name) {
                    startIndex = i;
                }
        
                // We reached the last item with the exact name
                if (startIndex != -1 && (name != this.name || i == names.length - 1)) {
                    endIndex = i;
                    break;
                }
            }

            // Push prices to items object
            const prices = [];
            const matchedPrices = [...this.marketData.matchAll(/_price=([0-9]*?)&/g)];
            for (let i = startIndex; prices.length < Item.MAX_PRICES_TO_AVERAGE && i < endIndex; i++) {
                prices.push(Number(matchedPrices[i][1]));
            }

            // If it can have quantity > 1
            let quantities = [];
            if (this.stackable) {
                // Push quantites to items object
                const matchedQuantities = [...this.marketData.matchAll(/_quantity=([0-9]*?)&/g)];
                for (let i = startIndex; quantities.length < Item.MAX_PRICES_TO_AVERAGE && i < endIndex; i++) {
                    quantities.push(Number(matchedQuantities[i][1]));
                }
            }
            else {
                quantities = (new Array(Item.MAX_PRICES_TO_AVERAGE)).fill(1);
            }

            let marketPriceSum = 0;
            for (let i = 0; i < prices.length && i < quantities.length; i++) {
                marketPriceSum += prices[i] / quantities[i];
            }
        
            this.marketPriceAverage = marketPriceSum / prices.length;
        }
    }

    Item.INVALID_WORDS = ["Black", "Blue", "Brown", "Green", "Grey", "Red", "White", "Yellow"];
    Item.MAX_PRICES_TO_AVERAGE = 5;

    Item.checkSameItem = function(item1, item2) {
        return (item1 && item2 && item1.name == item2.name && item1.quantity == item2.quantity);
    }

    window.ssorpg1.DF_Item = Item;
})();
