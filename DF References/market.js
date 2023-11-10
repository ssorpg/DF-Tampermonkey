var marketData;
var sellingData;
var privateData;
var marketHolder;
var marketScreen = "buy";
var menuOpen = false;
var serviceData = false;
var skillType = "";
var prompt;
var freeInventorySpace = true;
var inPrivateTrading = false;
var pageLogo;


// ANTI-MEATY
setTimeout(function () {
	if (document.querySelector("input[value=Deposit][type=button]") && document.querySelector("input[value=Withdraw][type=button]")) {
		document.querySelector("input[value=Deposit][type=button]").parentNode.style.display = "none";
		document.querySelector("input[value=Withdraw][type=button]").parentNode.style.display = "none";
		alert('This page has detected the use of a third-party script that prevents it from functioning.\nPlease uninstall "Meaty\'s Scripts" and reload the page.');
	}
}, 1000);

function initiateMarketplace() {
	marketHolder = document.getElementById("marketplace");
	prompt = document.getElementById("gamecontent");
	pageLogo = document.getElementById("pageLogo");
	loadMarket();
	document.getElementById("invController").addEventListener("contextmenu", openSellContextMenu, false);
}

function initiatePrivateTrade() {
	marketHolder = document.getElementById("marketplace");
	prompt = document.getElementById("gamecontent");
	marketScreen = "private";
	inPrivateTrading = true;
	privateMarket();
	document.getElementById("invController").addEventListener("contextmenu", openSellContextMenu, false);
}

function loadMarket() {
	marketHolder.innerHTML = "";
	pageLogo.textContent = "";
	pageLogo.dataset.marketType = marketScreen;
	var pageNavigation = document.createElement("div");
	pageNavigation.id = "selectMarket";
	pageNavigation.innerHTML = "<button data-action='switchMarket' data-page='buy' id='loadBuying'>buying</button>";
	pageNavigation.innerHTML += "<button data-action='switchMarket' data-page='sell' id='loadSelling'>selling</button>";
	pageNavigation.innerHTML += "<button data-action='switchMarket' data-page='private' id='loadPrivate'>private</button>";
	pageNavigation.innerHTML += "<button data-action='switchMarket' data-page='itemforitem' id='loadItemForItem'>item-for-item</button>";
	pageNavigation.querySelector("button#loadBuying").addEventListener("click", marketAction);
	pageNavigation.querySelector("button#loadSelling").addEventListener("click", marketAction);
	pageNavigation.querySelector("button#loadPrivate").addEventListener("click", marketAction);
	pageNavigation.querySelector("button#loadItemForItem").addEventListener("click", marketAction);
	marketHolder.appendChild(pageNavigation);
	switch (marketScreen) {
		case "buy":
			marketHolder.querySelector("button#loadBuying").disabled = true;
			var searchBox = document.createElement("div");
			searchBox.id = "searchArea";
			var categorySelect = "";
			searchBox.innerHTML = "<div style='text-align: left; width: 185px; display: inline-block;'>Search for:<br /><input id='searchField' type='text' name='marketSearch' /></div>";
			categorySelect += "<div style='display: inline-block; width: 260px;'>In Category:<br/><div id='categoryChoice' data-catname=''><span id='cat'>Everything</span><span id='dog' style='float: right;'>&#9668;</span></div>";
			categorySelect += "<div id='categoryList'>";
			categorySelect += "<div data-catname=''>Everything</div>";
			categorySelect += "<div data-catname='Chef' data-cattype='service'>Services - Cooking</div>";
			categorySelect += "<div data-catname='Doctor' data-cattype='service'>Services - Medical</div>";
			categorySelect += "<div data-catname='Engineer' data-cattype='service'>Services - Repair</div>";
			categorySelect += "<div data-catname='credits'>Credits</div>";
			categorySelect += "<div data-catname='armour'>Armour</div>";
			categorySelect += "<div data-catname='weapon_melee'>Weapon - Melee</div>";
			categorySelect += "<div data-catname='weapon_pistol'>Weapon - Pistols</div>";
			categorySelect += "<div data-catname='weapon_rifle'>Weapon - Rifles</div>";
			categorySelect += "<div data-catname='weapon_shotgun'>Weapon - Shotguns</div>";
			categorySelect += "<div data-catname='weapon_lightmachinegun'>Weapon - Light Machineguns</div>";
			categorySelect += "<div data-catname='weapon_heavymachinegun'>Weapon - Heavy Machineguns</div>";
			categorySelect += "<div data-catname='weapon_grenadelauncher'>Weapon - Grenade Launchers</div>";
			categorySelect += "<div data-catname='ammo_handgun'>Ammo - Handgun</div>";
			categorySelect += "<div data-catname='ammo_rifle'>Ammo - Rifle</div>";
			categorySelect += "<div data-catname='ammo_shotgun'>Ammo - Shotgun</div>";
			categorySelect += "<div data-catname='ammo_grenade'>Ammo - Grenades</div>";
			categorySelect += "<div data-catname='ammo_fuel'>Ammo - Gasoline</div>";
			categorySelect += "<div data-catname='food'>Item - Food</div>";
			categorySelect += "<div data-catname='medical'>Item - Medical</div>";
			categorySelect += "<div data-catname='clothing_basic'>Clothing - Basic</div>";
			categorySelect += "<div data-catname='clothing_coat'>Clothing - Coats</div>";
			categorySelect += "<div data-catname='clothing_headwear'>Clothing - Headwear</div>";
			categorySelect += "<div data-catname='barricading'>Item - Barricading</div>";
			categorySelect += "<div data-catname='misc'>Item - Misc</div>";
			categorySelect += "<div data-catname='implants'>Implants</div>";
			categorySelect += "<span>!SERVICES MOVED TO TOP!</span></div></div>";
			searchBox.innerHTML += categorySelect;
			searchBox.innerHTML += "<button id='makeSearch'>search</button>";
			$(searchBox).find("#categoryList div").click(openCategories);

			var boxLabels = document.createElement("div");
			boxLabels.id = "tradesLabels";
			boxLabels.innerHTML = "<span>Item Name</span><span style='position: absolute; left: 208px; width: 80px; width: max-content;'>Trade Zone</span><span style='position: absolute; left: 320px; width: max-content;'>Seller</span><span style='position: absolute; left: 480px; width: 70px; width: max-content;'>Sale Price</span>";
			boxLabels.classList.add("opElem");
			boxLabels.style.top = "116px";
			boxLabels.style.left = "26px";

			marketHolder.appendChild(boxLabels);

			var boxLabels = document.createElement("div");
			boxLabels.id = "servicesLabels";
			boxLabels.innerHTML = "<span>Seller</span><span style='position: absolute; left: 198px; width: max-content;'>Level</span><span style='position: absolute; left: 280px; width: 80px; width: max-content;'>Trade Zone</span><span style='position: absolute; left: 430px; width: max-content;'>Price</span>";
			boxLabels.classList.add("opElem");
			boxLabels.style.top = "116px";
			boxLabels.style.left = "26px";
			boxLabels.style.display = "none";

			marketHolder.appendChild(boxLabels);

			marketHolder.appendChild(searchBox);

			var itemDisplay = document.createElement("div");
			itemDisplay.id = "itemDisplay";
			itemDisplay.classList.add("marketDataHolder");
			marketHolder.appendChild(itemDisplay);
			document.getElementById("categoryChoice").addEventListener("click", openCategories);
			document.getElementById("makeSearch").addEventListener("click", function () {
				var itemDisplay = document.getElementById("itemDisplay");
				itemDisplay.scrollTop = 0;
				itemDisplay.scrollLeft = 0;
				search();
			});
			document.getElementById("searchField").addEventListener("input", function (e) {
				if (e.target.value.length >= 20) {
					e.preventDefault();
					e.target.value = e.target.value.substr(0, 20);
				}
				e.target.value.replace(/[^A-Z a-z 0-9\'\`\-   ]/g, "");
				if (e.target.value.length > 0) {
					document.getElementById("makeSearch").disabled = false;
				} else {
					if (document.getElementById("categoryChoice").dataset.catname !== "") {
						document.getElementById("makeSearch").disabled = false;
					} else {
						document.getElementById("makeSearch").disabled = true;
					}
				}
			});
			document.getElementById("searchField").addEventListener("keydown", function (e) {
				if (e.keyCode === 13 && !document.getElementById("makeSearch").disabled) {
					var itemDisplay = document.getElementById("itemDisplay");
					itemDisplay.scrollTop = 0;
					itemDisplay.scrollLeft = 0;
					search();
				}
			});
			if (marketData) {
				document.getElementById("makeSearch").disabled = false;
				document.getElementById("searchField").value = marketData["searcheditem"];
				listMarket();
			} else {
				document.getElementById("makeSearch").disabled = true;
			}
			updateAllFields();
			break;
		case "sell":
			marketHolder.querySelector("button#loadSelling").disabled = true;
			var itemBox = document.createElement("div");
			itemBox.id = "sellitems";
			itemBox.classList.add("marketDataHolder");
			itemBox.classList.add("fakeSlot");
			itemBox.dataset.action = "sellitem";
			marketHolder.appendChild(itemBox);

			var boxLabels = document.createElement("div");
			boxLabels.id = "sellingLabels";
			boxLabels.innerHTML = "<span>Item Name</span><span style='margin-left: 280px;'>Sale Price</span>";
			boxLabels.classList.add("opElem");
			boxLabels.style.top = "60px";
			boxLabels.style.left = "26px";

			marketHolder.appendChild(boxLabels);

			if (userVars["DFSTATS_df_credits"] > 0) {
				var creditSlot;
				if (document.getElementById("creditSlot")) {
					creditSlot = document.getElementById("creditSlot");
				} else {
					creditSlot = document.createElement("div");
				}
				creditSlot.id = "creditSlot";
				creditSlot.dataset.slottype = "credits";
				creditSlot.classList.add("opElem");
				creditSlot.classList.add("blockedValidSlot");
				creditSlot.style.top = "350px";
				creditSlot.style.left = "40px";
				creditSlot.innerHTML = "<div class='item' data-type='credits' data-quantity='" + userVars["DFSTATS_df_credits"] + "' style='background-image: url(\"https://files.deadfrontier.com/deadfrontier/inventoryimages/large/credits.png\");' data-itemtype='credits'></div>";

				marketHolder.appendChild(creditSlot);
			} else if (document.getElementById("creditSlot")) {
				var creditSlot = document.getElementById("creditSlot");
				creditSlot.parentNode.removeChild(creditSlot);
			}

			if (userVars["DFSTATS_df_profession"] === "Doctor" || userVars["DFSTATS_df_profession"] === "Chef" || userVars["DFSTATS_df_profession"] === "Engineer") {
				serviceData = true;
				var serviceBox = document.createElement("div");
				serviceBox.id = "sellServiceInfoBox";
				serviceBox.classList.add("marketDataHolder");

				var imgSrc = "hotrods/hotrods_v" + hrV + "/HTML5/images/market_";
				switch (userVars["DFSTATS_df_profession"]) {
					case "Doctor":
						imgSrc += "heal";
						skillType = "medical";
						break;
					case "Chef":
						imgSrc += "cook";
						skillType = "cooking";
						break;
					case "Engineer":
						imgSrc += "repair";
						skillType = "repair";
						break;
				}
				imgSrc += ".png";

				var serviceImg = document.createElement("img");
				serviceImg.src = imgSrc;

				serviceBox.appendChild(serviceImg);

				var serviceText = document.createElement("div");
				serviceText.style.position = "absolute";
				serviceText.style.width = "290px";
				serviceText.style.left = "65px";
				serviceText.style.top = "5px";

				serviceBox.appendChild(serviceText);

				var serviceButton = document.createElement("button");
				serviceButton.classList.add("opElem");
				serviceButton.style.left = "130px";
				serviceButton.style.bottom = "10px";
				serviceButton.style.width = "100px";

				serviceButton.addEventListener("click", marketAction);

				serviceBox.appendChild(serviceButton);

				marketHolder.appendChild(serviceBox);
			}

			getSellingList();
			break;
		case "private":
			marketHolder.querySelector("button#loadPrivate").disabled = true;

			var itemBox = document.createElement("div");
			itemBox.id = "privateIncoming";
			itemBox.classList.add("marketDataHolder");
			itemBox.classList.add("privateBox");
			marketHolder.appendChild(itemBox);

			itemBox = document.createElement("div");
			itemBox.id = "privateOutgoing";
			itemBox.classList.add("marketDataHolder");
			itemBox.classList.add("privateBox");
			marketHolder.appendChild(itemBox);

			var boxSign = document.createElement("div");
			boxSign.innerHTML = "All Incoming Offers";
			boxSign.classList.add("cashhack");
			boxSign.classList.add("redElements");
			boxSign.classList.add("opElem");
			boxSign.dataset.cash = "All Incoming Offers";
			boxSign.style.left = "20px";
			boxSign.style.top = "58px";
			marketHolder.appendChild(boxSign);
			var boxLabels = document.createElement("div");
			boxLabels.innerHTML = "<span>Item Name</span><span style='position: absolute; left: 208px; width: 80px; width: max-content;'>Trade Zone</span><span style='position: absolute; left: 320px; width: max-content;'>Seller</span><span style='position: absolute; left: 460px; width: 65px; width: max-content;'>Sale Price</span>";
			boxLabels.classList.add("opElem");
			boxLabels.style.top = "70px";
			boxLabels.style.left = "26px";

			marketHolder.appendChild(boxLabels);

			boxSign = document.createElement("div");
			boxSign.innerHTML = "All Outgoing Offers";
			boxSign.classList.add("cashhack");
			boxSign.classList.add("redElements");
			boxSign.classList.add("opElem");
			boxSign.dataset.cash = "All Outgoing Offers";
			boxSign.style.left = "20px";
			boxSign.style.bottom = "267px";
			marketHolder.appendChild(boxSign);
			boxLabels = document.createElement("div");
			boxLabels.innerHTML = "<span>Item Name</span><span style='position: absolute; left: 208px; width: max-content;'>Status</span><span style='position: absolute; left: 320px; width: 70px; width: max-content;'>Offered To</span><span style='position: absolute; left: 460px; width: 65px; width: max-content;'>Sale Price</span>";
			boxLabels.classList.add("opElem");
			boxLabels.style.bottom = "255px";
			boxLabels.style.left = "26px";

			marketHolder.appendChild(boxLabels);

			getPrivateTrading();
			break;
		case "itemforitem":
			marketHolder.querySelector("button#loadItemForItem").disabled = true;
			loadItemForItem();
			break;
	}

	/*var withdrawBox = document.createElement("div");
	withdrawBox.classList.add("opElem");
	withdrawBox.style.left = "20px";
	
	var withdrawElem = document.createElement("input");
	withdrawElem.classList.add("cashfield");
	withdrawElem.style.width = "84px";
	withdrawElem.type = "number";
	withdrawElem.value = 0;
	withdrawElem.min = 0;
	withdrawElem.max = userVars["DFSTATS_df_bankcash"];
	
	withdrawBox.appendChild(withdrawElem);
	withdrawBox.appendChild(document.createElement("br"));
	
	withdrawElem = document.createElement("button");
	withdrawElem.textContent = "withdraw";
	
	withdrawBox.appendChild(withdrawElem);
	
	marketHolder.appendChild(withdrawBox);
	
	var depositBox = document.createElement("div");
	depositBox.classList.add("opElem");
	depositBox.style.left = "120px";
	
	var depositElem = document.createElement("input");
	depositElem.classList.add("cashfield");
	depositElem.style.width = "84px";
	depositElem.type = "number";
	depositElem.value = 0;
	depositElem.min = 0;
	depositElem.max = userVars["DFSTATS_df_cash"];
	
	depositBox.appendChild(depositElem);
	depositBox.appendChild(document.createElement("br"));
	
	depositElem = document.createElement("button");
	depositElem.textContent = "deposit";
	
	depositBox.appendChild(depositElem);
	
	marketHolder.appendChild(depositBox);*/
}

function SellMenuItemPopulate(itemElem) {
	pageLock = true;
	var itemType = currentItem.dataset.type.split('_');
	var itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id, currentItem.dataset.quantity];

	var itemName = document.createElement("div");
	itemName.style.textAlign = "center";

	if (globalData[itemType[0]]["itemcat"] === "weapon") {
		var n = currentItem.dataset.type.indexOf("_stats") + 6;
		n = currentItem.dataset.type.substring(n, n + 3);
		if (mcData[n] && mcData[n][0] !== "") {
			itemName.style.color = mcData[n][0];
			itemElem.style.borderColor = mcData[n][0];
		}
	} else if (globalData[itemType[0]]["itemcat"] === "armour") {
		var n = currentItem.dataset.type.indexOf("_stats") + 6;
		n = currentItem.dataset.type.substring(n, n + 4);
		if (mcData[n] && mcData[n][0] !== "") {
			itemName.style.color = mcData[n][0];
			itemElem.style.borderColor = mcData[n][0];
		}
	}


	if (itemData[1].indexOf("_name") >= 0) {
		itemName.innerHTML += itemData[1].substring(itemData[1].indexOf("_name") + 5);
	} else {
		itemName.innerHTML += globalData[itemType[0]]["name"];
	}
	itemElem.appendChild(itemName);

	var button1 = document.createElement("button");
	button1.textContent = "Sell";
	button1.style.width = "100%";

	button1.onclick = function () {
		var priceHolder = document.createElement("div");
		priceHolder.style.position = "absolute";
		priceHolder.style.width = "100%";
		priceHolder.style.textAlign = "center";
		priceHolder.style.bottom = "30px";

		if (itemData[1] === "credits") {
			prompt.innerHTML = "How many Credits would you like to sell and for how much?";
			var creditInput = document.createElement("input");
			creditInput.dataset.type = "credit";
			creditInput.style.color = "#cccccc";
			creditInput.style.backgroundColor = "#555555";
			creditInput.type = "number";
			creditInput.min = 0;
			creditInput.value = 100;
			if (parseInt(userVars["DFSTATS_df_credits"]) > 4000) {
				creditInput.max = 4000;
			} else {
				creditInput.max = userVars["DFSTATS_df_credits"];
			}
			var creditLabel = document.createElement("label");
			creditLabel.textContent = "C";
			creditLabel.style.color = "#cccccc";
			priceHolder.appendChild(creditLabel);
			priceHolder.appendChild(creditInput);
			priceHolder.appendChild(document.createElement("br"));
		} else {
			prompt.innerHTML = "How much would you like to sell the ";
			if (itemData[1].indexOf("_name") >= 0) {
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else {
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += " for?";
		}

		var priceLabel = document.createElement("label");
		priceLabel.textContent = "$";
		priceLabel.style.color = "#ffff00";
		var priceInput = document.createElement("input");
		priceInput.dataset.type = "price";
		priceInput.classList.add("moneyField");
		priceInput.type = "number";
		priceInput.max = 9999999999;
		priceInput.min = 0;

		if (marketLastMoney !== false && lastItemSold === itemType[0]) {
			priceInput.value = marketLastMoney;
		} else {
			priceInput.value = '';
			marketLastMoney = false;
			lastItemSold = itemType[0];
		}

		priceHolder.appendChild(priceLabel);
		priceHolder.appendChild(priceInput);


		var extraData = { "itemData": itemData };
		if (inPrivateTrading) {
			extraData["sendto"] = userVars["member_to"];
		}


		prompt.appendChild(priceHolder);



		var noButton = document.createElement("button");
		noButton.style.position = "absolute";
		noButton.style.top = "72px";
		noButton.addEventListener("click", function () {
			cleanPlacementMessage();
			prompt.parentNode.style.display = "none";
			prompt.innerHTML = "";
			prompt.classList.remove("warning");
			prompt.classList.remove("redhighlight");
			pageLock = false;
		});
		noButton.textContent = "No";
		noButton.style.right = "86px";
		var yesButton = document.createElement("button");
		yesButton.textContent = "Yes";
		yesButton.style.position = "absolute";
		yesButton.style.left = "86px";
		yesButton.style.top = "72px";
		yesButton.addEventListener("click", function () {
			yesButton.disabled = true;
			cleanPlacementMessage();
			prompt.classList.remove("warning");
			prompt.classList.remove("redhighlight");
			sellpriceConfirm(extraData);
		});

		prompt.appendChild(yesButton);
		prompt.onkeydown = function (e) {
			if (e.keyCode === 13) {
				prompt.onkeydown = null;
				yesButton.click();
			}
		};

		var dataInput = prompt.querySelectorAll("input");
		if (dataInput.length) {
			yesButton.disabled = true;
			for (var h in dataInput) {
				dataInput[h].oninput = function (dE) {
					var keepDisabled = false;
					for (var g in dataInput) {
						if (dataInput[g].value === '') {
							keepDisabled = true;
						}
					}
					if (keepDisabled) {
						yesButton.disabled = true;
					} else {
						yesButton.disabled = false;
					}
					if (dE.target.type === "number") {
						if (dE.target.value < 0) {
							dE.target.value = 0;
						} else if (parseInt(dE.target.value) > parseInt(dE.target.max)) {
							dE.target.value = dE.target.max;
						}
						if (dE.target.classList.contains("moneyField")) {
							if (itemData[1] === "credits") {
								if (dE.target.value < scrapValue(itemData[1], dataInput[0].value)) {
									var msgX = (prompt.getBoundingClientRect().left - 20) + prompt.offsetWidth / 2 - 165 / 2;
									var msgY = (prompt.getBoundingClientRect().top) + 90;
									displayPlacementMessage("This is less than scrap value for this item ($" + scrapValue(itemData[1], dataInput[0].value) + ")", msgX, msgY, "ERROR");
								} else {
									cleanPlacementMessage();
								}
							} else {
								if (dE.target.value < scrapValue(itemData[1], itemData[3])) {
									var msgX = (prompt.getBoundingClientRect().left - 20) + prompt.offsetWidth / 2 - 165 / 2;
									var msgY = (prompt.getBoundingClientRect().top) + 90;
									displayPlacementMessage("This is less than scrap value for this item ($" + scrapValue(itemData[1], itemData[3]) + ")", msgX, msgY, "ERROR");
								} else {
									cleanPlacementMessage();
								}
							}
						}
					}
					if (dE.target.type === "text") {
						if (dE.target.value.length >= 24) {
							dE.preventDefault();
							dE.target.value = dE.target.value.substr(0, 24);
						}
						dE.target.value = dE.target.value.replace(/[^A-Z a-z 0-9\'\`\-   ]/g, "");
					}
				};
				dataInput[h].onkeydown = function (dE) {
					/*if(dE.target.type === "number")
					 {
					 if(dE.key.length === 1 && isNaN(dE.key) && !dE.ctrlKey || dE.key === "v")
					 {
					 dE.preventDefault();
					 }
					 }*/
					if (dE.target.type === "text") {
						/*if(!dE.key.match(/[A-Z a-z 0-9\'\`\-   ]/g))
						 {
						 dE.preventDefault();
						 }*/
						if (dE.key === "'" || dE.key === '"') {
							dE.preventDefault();
							if (dE.target.value.length < 24) {
								dE.target.value += "`";
								if (dE.target.value === '') {
									yesButton.disabled = true;
								} else {
									yesButton.disabled = false;
								}
							}
						}
					}
				};
			}
		}

		prompt.appendChild(noButton);
		prompt.parentNode.style.display = "block";

		//prompt.focus();
		priceInput.focus();
		ctxMenuHolder.style.display = "none";
	};


	itemElem.appendChild(button1);
}

function openSellContextMenu(e) {
	if (e.target.classList.contains("item") && !e.target.parentNode.classList.contains("locked") && (marketScreen === "sell" || inPrivateTrading)) {
		currentItem = e.target;
		var itemType = currentItem.dataset.type.split('_');
		if (globalData[itemType[0]]["no_transfer"] !== "1") {
			e.preventDefault();

			ctxMenuHolder.innerHTML = "";
			ctxMenuHolder.style.display = "block";
			ctxMenuHolder.style.backgroundColor = "black";
			ctxMenuHolder.style.border = "white solid 1px";
			ctxMenuHolder.style.zIndex = "20";
			ctxMenuHolder.style.textAlign = "left";

			ctxMenuHolder.style.position = "absolute";

			ctxMenuHolder.style.width = "140px";

			SellMenuItemPopulate(ctxMenuHolder);

			ctxMenuHolder.style.visibility = "hidden";
			ctxMenuHolder.style.display = "block";

			var invHoldOffsets = inventoryHolder.getBoundingClientRect();

			if (mousePos[1] + ctxMenuHolder.offsetHeight > invHoldOffsets.bottom) {
				ctxMenuHolder.style.top = (mousePos[1] - ctxMenuHolder.offsetHeight - invHoldOffsets.top) + "px";
			} else {
				ctxMenuHolder.style.top = (mousePos[1] - invHoldOffsets.top) + "px";
			}

			if (mousePos[0] + ctxMenuHolder.offsetWidth > invHoldOffsets.right) {
				ctxMenuHolder.style.left = (inventoryHolder.offsetWidth - 40 - ctxMenuHolder.offsetWidth) + "px";
			} else {
				ctxMenuHolder.style.left = (mousePos[0] - invHoldOffsets.left) + "px";
			}

			ctxMenuHolder.style.visibility = "visible";
		} else {
			ctxMenuHolder.style.display = "none";
		}
	} else {
		ctxMenuHolder.style.display = "none";
	}
}

function privateMarket() {
	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	prompt.parentNode.style.display = "block";
	marketHolder.innerHTML = "";
	document.getElementById("pageLogo").dataset.marketType = marketScreen;
	document.getElementById("pageLogo").textContent = "";

	var itemBox = document.createElement("div");
	itemBox.id = "privateIncoming";
	itemBox.dataset.action = "receiveItemPrivate";
	itemBox.classList.add("marketDataHolder");
	itemBox.classList.add("privateBox");
	marketHolder.appendChild(itemBox);

	itemBox = document.createElement("div");
	itemBox.id = "privateOutgoing";
	itemBox.dataset.action = "sendItemPrivate";
	itemBox.classList.add("fakeSlot");
	itemBox.classList.add("marketDataHolder");
	itemBox.classList.add("privateBox");
	marketHolder.appendChild(itemBox);

	var boxSign = document.createElement("div");
	boxSign.innerHTML = "Incoming Offers from " + userVars["member_to_name"];
	boxSign.classList.add("cashhack");
	boxSign.classList.add("redElements");
	boxSign.classList.add("opElem");
	boxSign.dataset.cash = "Incoming Offers from " + userVars["member_to_name"];
	boxSign.style.left = "20px";
	boxSign.style.top = "36px";
	marketHolder.appendChild(boxSign);
	var boxLabels = document.createElement("div");
	boxLabels.innerHTML = "<span>Item Name</span><span style='margin-left: 109px;'>Trade Zone</span><span style='margin-left: 60px;'>Seller</span><span style='margin-left: 90px;'>Sale Price</span>";
	boxLabels.classList.add("opElem");
	boxLabels.style.top = "48px";
	boxLabels.style.left = "26px";

	marketHolder.appendChild(boxLabels);

	boxSign = document.createElement("div");
	boxSign.innerHTML = "Outgoing Offers to " + userVars["member_to_name"];
	boxSign.classList.add("cashhack");
	boxSign.classList.add("redElements");
	boxSign.classList.add("opElem");
	boxSign.dataset.cash = "Outgoing Offers to " + userVars["member_to_name"];
	boxSign.style.left = "20px";
	boxSign.style.bottom = "297px";
	marketHolder.appendChild(boxSign);
	boxLabels = document.createElement("div");
	boxLabels.innerHTML = "<span>Item Name</span><span style='margin-left: 109px;'>Status</span><span style='margin-left: 90px;'>Offered To</span><span style='margin-left: 60px;'>Sale Price</span>";
	boxLabels.classList.add("opElem");
	boxLabels.style.bottom = "285px";
	boxLabels.style.left = "26px";

	marketHolder.appendChild(boxLabels);

	if (userVars["DFSTATS_df_credits"] > 0) {
		var creditSlot;
		if (document.getElementById("creditSlot")) {
			creditSlot = document.getElementById("creditSlot");
		} else {
			creditSlot = document.createElement("div");
		}
		creditSlot.id = "creditSlot";
		creditSlot.dataset.slottype = "credits";
		creditSlot.classList.add("opElem");
		creditSlot.classList.add("blockedValidSlot");
		creditSlot.style.bottom = "96px";
		creditSlot.style.left = "12px";
		creditSlot.innerHTML = "<div class='item' data-type='credits' data-quantity='" + userVars["DFSTATS_df_credits"] + "' style='background-image: url(\"https://files.deadfrontier.com/deadfrontier/inventoryimages/large/credits.png\");' data-itemtype='credits'></div>";

		marketHolder.appendChild(creditSlot);
	} else if (document.getElementById("creditSlot")) {
		var creditSlot = document.getElementById("creditSlot");
		creditSlot.parentNode.removeChild(creditSlot);
	}

	var itemForItemButton = document.createElement("button");
	itemForItemButton.classList.add("opElem");
	itemForItemButton.textContent = "Item-for-Item";
	itemForItemButton.onclick = initiatePrivateItemForItem;
	itemForItemButton.style.right = "60px";
	itemForItemButton.style.top = "10px";

	marketHolder.appendChild(itemForItemButton);

	getPrivateTrading(userVars["member_to"]);
}

function listSelling(nuData) {
	var freeSlots = 0;
	for (var i = 0; i < parseInt(userVars["DFSTATS_df_invslots"]); i++) {
		if (userVars["DFSTATS_df_inv" + i + "_type"] === "") {
			freeSlots++;
		}
	}
	if (freeSlots === 0) {
		freeInventorySpace = false;
	} else {
		freeInventorySpace = true;
	}
	if (userVars["DFSTATS_df_credits"] > 0) {
		var creditSlot;
		if (document.getElementById("creditSlot")) {
			creditSlot = document.getElementById("creditSlot");
		} else {
			creditSlot = document.createElement("div");
		}
		creditSlot.id = "creditSlot";
		creditSlot.dataset.slottype = "credits";
		creditSlot.classList.add("opElem");
		creditSlot.classList.add("blockedValidSlot");
		creditSlot.style.top = "350px";
		creditSlot.style.left = "40px";
		creditSlot.innerHTML = "<div class='item' data-type='credits' data-quantity='" + userVars["DFSTATS_df_credits"] + "' style='background-image: url(\"https://files.deadfrontier.com/deadfrontier/inventoryimages/large/credits.png\");' data-itemtype='credits'></div>";

		marketHolder.appendChild(creditSlot);
	} else if (document.getElementById("creditSlot")) {
		var creditSlot = document.getElementById("creditSlot");
		creditSlot.parentNode.removeChild(creditSlot);
	}
	if (nuData) {
		sellingData = nuData;
	}
	tradeListSize = sellingData["tradelist_totalsales"];

	var tradeSlots;
	if (document.querySelector(".tradeSlotDisplay")) {
		tradeSlots = document.querySelector(".tradeSlotDisplay");
	} else {
		tradeSlots = document.createElement("div");
		tradeSlots.classList.add("tradeSlotDisplay");
	}
	tradeSlots.style.bottom = "180px";
	tradeSlots.style.right = "25px";
	tradeSlots.textContent = tradeListSize + " / " + userVars["DFSTATS_df_invslots"];

	if (checkLSBool("general", "statusPercents")) {
		tradeSlots.textContent += " (" + Math.round((parseInt(tradeListSize) / parseInt(userVars["DFSTATS_df_invslots"])) * 100) + "%)";
	}

	marketHolder.appendChild(tradeSlots);

	var sellingDisplay = document.getElementById("sellitems");
	sellingDisplay.innerHTML = "";

	var potentialSaleGains = 0;
	if (sellingData["tradelist_maxresults"]) {
		for (var i = 0; i < sellingData["tradelist_maxresults"]; i++) {
			var marketItem = document.createElement("div");
			marketItem.classList.add("fakeItem");
			marketItem.dataset.type = sellingData["tradelist_" + i + "_item"];
			marketItem.dataset.quantity = sellingData["tradelist_" + i + "_quantity"];
			marketItem.dataset.price = sellingData["tradelist_" + i + "_price"];


			var itemData = sellingData["tradelist_" + i + "_item"];
			var itemType = itemData.split('_')[0];

			var addToName = " " + calcMCTag(itemData, false, "span", "");

			if (getItemType(globalData[itemType]) !== "armour" && getItemType(globalData[itemType]) !== "credits" && parseInt(sellingData["tradelist_" + i + "_quantity"]) > 1) {
				addToName += " (" + sellingData["tradelist_" + i + "_quantity"] + ")";
			}

			var itemName = sellingData["tradelist_" + i + "_itemname"];
			for (var x in itemData.split('_')) {
				if (itemData.split('_')[x].indexOf("colour") >= 0) {
					itemName = itemData.split('_')[x].substring(6) + " " + itemName;
					break;
				}
			}

			if (itemName.length + addToName.replace(/(<([^>]+)>)/gi, "").length > 46) {
				if (addToName !== "") {
					marketItem.dataset.originalLength = addToName.replace(/(<([^>]+)>)/gi, "").length;
					itemName = itemName.substr(0, 43 - addToName.replace(/(<([^>]+)>)/gi, "").length) + "...";
				} else {
					itemName = itemName.substr(0, 43) + "...";
				}
			}

			marketItem.innerHTML = "<div class='itemName cashhack credits' data-cash='" + itemName + "'>" + itemName + "</div>";
			if (addToName !== "") {
				marketItem.innerHTML += addToName;
			}


			if (sellingData["tradelist_" + i + "_price"] === "0") {
				marketItem.innerHTML += "<div class='salePrice'>Free</div>";
			} else {
				marketItem.innerHTML += "<div class='salePrice'>$" + nf.format(sellingData["tradelist_" + i + "_price"]) + "</div>";
				potentialSaleGains += parseInt(sellingData["tradelist_" + i + "_price"]);
			}

			var buttonData = document.createElement("button");
			buttonData.textContent = "cancel sale";
			buttonData.dataset.action = "cancelSale";
			if (!freeInventorySpace && getItemType(globalData[itemType]) !== "credits") {
				buttonData.disabled = true;
			}
			buttonData.dataset.itemLocation = i;
			buttonData.addEventListener("click", marketAction);
			marketItem.appendChild(buttonData);
			sellingDisplay.appendChild(marketItem);
		}
	}

	if (potentialSaleGains > 0) {
		var salesTotal = document.createElement("div");
		salesTotal.classList.add("profitList");
		salesTotal.innerHTML += "<div>Potential Revenue</div><div class='salePrice'>$" + nf.format(potentialSaleGains) + "</div>";
		sellingDisplay.appendChild(salesTotal);
	}

	if (serviceData) {
		if (sellingData["yourservice_price"] && parseInt(sellingData["yourservice_price"]) > 0) {
			document.getElementById("sellServiceInfoBox").querySelector("div").textContent = "Your level " + userVars["DFSTATS_df_level"] + " " + skillType + " services are currently on sale for $" + nf.format(sellingData["yourservice_price"]) + " per job.";
			document.getElementById("sellServiceInfoBox").querySelector("button").textContent = "cancel sale";
			document.getElementById("sellServiceInfoBox").querySelector("button").dataset.action = "cancelService";
		} else {
			document.getElementById("sellServiceInfoBox").querySelector("div").textContent = "Your level " + userVars["DFSTATS_df_level"] + " " + skillType + " services are not currently on sale.";
			document.getElementById("sellServiceInfoBox").querySelector("button").textContent = "sell services";
			document.getElementById("sellServiceInfoBox").querySelector("button").dataset.action = "sellService";
		}
	}
}

function listPrivate(nuData) {
	var freeSlots = 0;
	for (var i = 0; i < parseInt(userVars["DFSTATS_df_invslots"]); i++) {
		if (userVars["DFSTATS_df_inv" + i + "_type"] === "") {
			freeSlots++;
		}
	}
	if (freeSlots === 0) {
		freeInventorySpace = false;
	} else {
		freeInventorySpace = true;
	}
	if (inPrivateTrading && userVars["DFSTATS_df_credits"] > 0) {
		var creditSlot;
		if (document.getElementById("creditSlot")) {
			creditSlot = document.getElementById("creditSlot");
		} else {
			creditSlot = document.createElement("div");
		}
		creditSlot.id = "creditSlot";
		creditSlot.dataset.slottype = "credits";
		creditSlot.classList.add("opElem");
		creditSlot.classList.add("blockedValidSlot");
		creditSlot.style.bottom = "96px";
		creditSlot.style.left = "12px";
		creditSlot.innerHTML = "<div class='item' data-type='credits' data-quantity='" + userVars["DFSTATS_df_credits"] + "' style='background-image: url(\"https://files.deadfrontier.com/deadfrontier/inventoryimages/large/credits.png\");' data-itemtype='credits'></div>";

		marketHolder.appendChild(creditSlot);
	} else if (document.getElementById("creditSlot")) {
		var creditSlot = document.getElementById("creditSlot");
		creditSlot.parentNode.removeChild(creditSlot);
	}
	if (nuData) {
		privateData = nuData;
	}
	tradeListSize = privateData["tradelist_totalsales"];

	var tradeSlots;
	if (document.querySelector(".tradeSlotDisplay")) {
		tradeSlots = document.querySelector(".tradeSlotDisplay");
	} else {
		tradeSlots = document.createElement("div");
		tradeSlots.classList.add("tradeSlotDisplay");
	}
	tradeSlots.style.bottom = "90px";
	tradeSlots.style.right = "25px";
	tradeSlots.textContent = tradeListSize + " / " + userVars["DFSTATS_df_invslots"];

	if (checkLSBool("general", "statusPercents")) {
		tradeSlots.textContent += " (" + Math.round((parseInt(tradeListSize) / parseInt(userVars["DFSTATS_df_invslots"])) * 100) + "%)";
	}

	marketHolder.appendChild(tradeSlots);

	var incomingDisplay = document.getElementById("privateIncoming");
	var outgoingDisplay = document.getElementById("privateOutgoing");
	incomingDisplay.innerHTML = "";
	outgoingDisplay.innerHTML = "";
	if (privateData["tradelist_maxresults"] !== "0") {
		for (var i = 0; i < privateData["tradelist_maxresults"]; i++) {
			var marketItem = document.createElement("div");
			marketItem.classList.add("fakeItem");
			marketItem.dataset.type = privateData["tradelist_" + i + "_item"];
			marketItem.dataset.quantity = privateData["tradelist_" + i + "_quantity"];
			marketItem.dataset.price = privateData["tradelist_" + i + "_price"];


			var itemData = privateData["tradelist_" + i + "_item"];
			var itemType = itemData.split('_')[0];

			var addToName = " " + calcMCTag(itemData, false, "span", "");

			if (getItemType(globalData[itemType]) !== "armour" && getItemType(globalData[itemType]) !== "credits" && parseInt(privateData["tradelist_" + i + "_quantity"]) > 1) {
				addToName += " (" + privateData["tradelist_" + i + "_quantity"] + ")";
			}

			var itemName = privateData["tradelist_" + i + "_itemname"];
			for (var x in itemData.split('_')) {
				if (itemData.split('_')[x].indexOf("colour") >= 0) {
					itemName = itemData.split('_')[x].substring(6) + " " + itemName;
					break;
				}
			}

			if (itemName.length + addToName.replace(/(<([^>]+)>)/gi, "").length > 29) {
				if (addToName !== "") {
					marketItem.dataset.originalLength = addToName.replace(/(<([^>]+)>)/gi, "").length;
					itemName = itemName.substr(0, 26 - addToName.replace(/(<([^>]+)>)/gi, "").length) + "...";
				} else {
					itemName = itemName.substr(0, 26) + "...";
				}
			}

			marketItem.innerHTML = "<div class='itemName cashhack credits' data-cash='" + itemName + "'>" + itemName + "</div>";
			if (addToName !== "") {
				marketItem.innerHTML += addToName;
			}
			var privateTradeDenyAction;
			if (privateData["tradelist_" + i + "_deny_private"] === "0") {
				privateTradeDenyAction = "pending";
			} else {
				privateTradeDenyAction = "rejected"; // ff0000
			}
			marketItem.innerHTML += "<div class='tradeZone' " + ((privateTradeDenyAction === "pending") ? "" : "style='color: #ff0000;'") + ">" + privateTradeDenyAction + "</div>";
			marketItem.innerHTML += "<div class='seller'>" + privateData["tradelist_" + i + "_member_to_name"].substring(0, 18) + "</div>";
			if (privateData["tradelist_" + i + "_price"] === "0") {
				marketItem.innerHTML += "<div class='salePrice'>Free</div>";
			} else {
				marketItem.innerHTML += "<div class='salePrice'>$" + nf.format(privateData["tradelist_" + i + "_price"]) + "</div>";
			}

			var buttonData = document.createElement("button");
			buttonData.textContent = "cancel sale";
			if (!freeInventorySpace && getItemType(globalData[itemType]) !== "credits") {
				buttonData.disabled = true;
			}
			buttonData.dataset.action = "cancelPrivate";
			buttonData.dataset.itemLocation = i;
			buttonData.addEventListener("click", marketAction);
			marketItem.appendChild(buttonData);
			outgoingDisplay.appendChild(marketItem);
		}
	} else {
		// No results
		var errorMessage = document.createElement("div");
		if (inPrivateTrading) {
			errorMessage.classList.add("fakeSlot");
			errorMessage.dataset.action = "sendItemPrivate";
		}
		errorMessage.style.marginTop = "60px";
		errorMessage.style.textAlign = "center";
		errorMessage.style.color = "#ff0000";
		errorMessage.textContent = "You aren't selling anything";
		outgoingDisplay.appendChild(errorMessage);
	}
	if (privateData["tradelist2_maxresults"] !== "0") {
		for (var i = 0; i < privateData["tradelist2_maxresults"]; i++) {
			var marketItem = document.createElement("div");
			marketItem.classList.add("fakeItem");
			marketItem.dataset.type = privateData["tradelist2_" + i + "_item"];
			marketItem.dataset.quantity = privateData["tradelist2_" + i + "_quantity"];
			marketItem.dataset.price = privateData["tradelist2_" + i + "_price"];

			var itemData = privateData["tradelist2_" + i + "_item"];
			var itemType = itemData.split('_')[0];

			var addToName = " " + calcMCTag(itemData, false, "span", "");

			if (getItemType(globalData[itemType]) !== "armour" && getItemType(globalData[itemType]) !== "credits" && parseInt(privateData["tradelist2_" + i + "_quantity"]) > 1) {
				addToName += " (" + privateData["tradelist2_" + i + "_quantity"] + ")";
			}

			var itemName = privateData["tradelist2_" + i + "_itemname"];
			for (var x in itemData.split('_')) {
				if (itemData.split('_')[x].indexOf("colour") >= 0) {
					itemName = itemData.split('_')[x].substring(6) + " " + itemName;
					break;
				}
			}

			if (itemName.length + addToName.replace(/(<([^>]+)>)/gi, "").length > 29) {
				if (addToName !== "") {
					marketItem.dataset.originalLength = addToName.replace(/(<([^>]+)>)/gi, "").length;
					itemName = itemName.substr(0, 26 - addToName.replace(/(<([^>]+)>)/gi, "").length) + "...";
				} else {
					itemName = itemName.substr(0, 26) + "...";
				}
			}

			marketItem.innerHTML = "<div class='itemName cashhack credits' data-cash='" + itemName + "'>" + itemName + "</div>";
			if (addToName !== "") {
				marketItem.innerHTML += addToName;
			}

			var addToTradeZone = "";
			var validBuy = true;
			if (privateData["tradelist2_" + i + "_trade_zone"] !== userVars["DFSTATS_df_tradezone"]) {
				addToTradeZone += "style='color: #ff0000;'";
				validBuy = false;
			}
			marketItem.innerHTML += "<div class='tradeZone' " + addToTradeZone + ">" + tradezoneNamerShort(parseInt(privateData["tradelist2_" + i + "_trade_zone"])) + "</div>";
			marketItem.innerHTML += "<div class='seller'>" + privateData["tradelist2_" + i + "_member_name"].substring(0, 18) + "</div>";

			if (!freeInventorySpace && getItemType(globalData[itemType]) !== "credits") {
				validBuy = false;
			}

			if (parseInt(userVars["DFSTATS_df_cash"]) < parseInt(privateData["tradelist2_" + i + "_price"])) {
				validBuy = false;
				marketItem.innerHTML += "<div class='salePrice' style='color: red;'>$" + nf.format(privateData["tradelist2_" + i + "_price"]) + "</div>";
			} else {
				if (privateData["tradelist2_" + i + "_price"] === "0") {
					marketItem.innerHTML += "<div class='salePrice'>Free</div>";
				} else {
					marketItem.innerHTML += "<div class='salePrice'>$" + nf.format(privateData["tradelist2_" + i + "_price"]) + "</div>";
				}
			}

			var buttonData = document.createElement("button");
			buttonData.textContent = "buy";
			buttonData.dataset.action = "buyPrivate";
			buttonData.style.width = "30px";
			buttonData.dataset.itemLocation = i;
			buttonData.addEventListener("click", marketAction);
			if (!validBuy) {
				buttonData.disabled = true;
			}
			marketItem.appendChild(buttonData);

			buttonData = document.createElement("button");
			buttonData.textContent = "reject";
			buttonData.dataset.action = "rejectItem";
			buttonData.dataset.itemLocation = i;
			buttonData.addEventListener("click", marketAction);
			marketItem.appendChild(buttonData);
			incomingDisplay.appendChild(marketItem);
		}
	} else {
		var errorMessage = document.createElement("div");
		errorMessage.style.width = "100%";
		errorMessage.style.marginTop = "60px";
		errorMessage.style.textAlign = "center";
		errorMessage.style.color = "#ff0000";
		errorMessage.textContent = "No incoming trades";
		incomingDisplay.appendChild(errorMessage);
	}
}

function listMarket(nuData) {
	var freeSlots = 0;
	for (var i = 0; i < parseInt(userVars["DFSTATS_df_invslots"]); i++) {
		if (userVars["DFSTATS_df_inv" + i + "_type"] === "") {
			freeSlots++;
		}
	}
	if (freeSlots === 0) {
		freeInventorySpace = false;
	} else {
		freeInventorySpace = true;
	}
	if (nuData) {
		marketData = nuData;
	}
	var itemDisplay = document.getElementById("itemDisplay");
	itemDisplay.innerHTML = "";
	if (marketData["services"]) {
		document.getElementById("tradesLabels").style.display = "none";
		document.getElementById("servicesLabels").style.display = "block";
	} else {
		document.getElementById("tradesLabels").style.display = "block";
		document.getElementById("servicesLabels").style.display = "none";
	}
	if (marketData["tradelist_maxresults"]) {
		if (marketData["services"]) {
			var levelCap = /^\d+$/.test(document.getElementById("searchField").value) ? parseInt(document.getElementById("searchField").value) : false;
			for (var i = 0; i < marketData["tradelist_maxresults"]; i++) {
				if (!levelCap || levelCap <= parseInt(marketData["tradelist_" + i + "_level"])) {
					var marketItem = document.createElement("div");

					marketItem.classList.add("serviceItem");
					marketItem.innerHTML = "<div class='seller'>" + marketData["tradelist_" + i + "_member_name"].substring(0, 22) + "</div>";
					marketItem.innerHTML += "<div class='level'>" + marketData["tradelist_" + i + "_level"] + "</div>";
					marketItem.innerHTML += "<div class='tradeZone'>" + tradezoneNamerShort(parseInt(marketData["tradelist_" + i + "_trade_zone"])) + "</div>";
					var buttonData = "<div class='fakeSlot " + marketData["services"] + "Icon' data-action='buyservice' data-price='" + marketData["tradelist_" + i + "_price"] + "' ";
					buttonData += "data-buynum='" + marketData["tradelist_" + i + "_id_member"] + "' data-profession='" + marketData["tradelist_" + i + "_profession"] + "' data-level='" + marketData["tradelist_" + i + "_level"] + "' ";
					if (parseInt(userVars["DFSTATS_df_cash"]) < parseInt(marketData["tradelist_" + i + "_price"])) {
						buttonData += "data-disabled=true";
						marketItem.innerHTML += "<div class='salePrice' style='color: red;'>$" + nf.format(marketData["tradelist_" + i + "_price"]) + "</div>";
					} else {
						if (marketData["tradelist_" + i + "_price"] === "0") {
							marketItem.innerHTML += "<div class='salePrice'>Free</div>";
						} else {
							marketItem.innerHTML += "<div class='salePrice'>$" + nf.format(marketData["tradelist_" + i + "_price"]) + "</div>";
						}
					}
					buttonData += "></div>";
					marketItem.innerHTML += buttonData;

					itemDisplay.appendChild(marketItem);
				}
			}
		} else {
			for (var i = 0; i < marketData["tradelist_maxresults"]; i++) {
				var marketItem = document.createElement("div");
				marketItem.classList.add("fakeItem");
				marketItem.dataset.type = marketData["tradelist_" + i + "_item"];
				marketItem.dataset.quantity = marketData["tradelist_" + i + "_quantity"];
				marketItem.dataset.price = marketData["tradelist_" + i + "_price"];

				var itemData = marketData["tradelist_" + i + "_item"];
				var itemType = itemData.split('_')[0];

				var addToName = " " + calcMCTag(itemData, false, "span", "");

				var itemType = itemData.split('_')[0];
				if (getItemType(globalData[itemType]) !== "armour" && getItemType(globalData[itemType]) !== "credits" && parseInt(marketData["tradelist_" + i + "_quantity"]) > 1) {
					addToName += " (" + marketData["tradelist_" + i + "_quantity"] + ")";
				}


				var itemName = marketData["tradelist_" + i + "_itemname"];
				for (var x in itemData.split('_')) {
					if (itemData.split('_')[x].indexOf("colour") >= 0) {
						itemName = itemData.split('_')[x].substring(6) + " " + itemName;
						break;
					}
				}

				if (itemName.length + addToName.replace(/(<([^>]+)>)/gi, "").length > 29) {
					if (addToName !== "") {
						marketItem.dataset.originalLength = addToName.replace(/(<([^>]+)>)/gi, "").length;
						itemName = itemName.substr(0, 26 - addToName.replace(/(<([^>]+)>)/gi, "").length) + "...";
					} else {
						itemName = itemName.substr(0, 26) + "...";
					}
				}

				marketItem.innerHTML = "<div class='itemName cashhack credits' data-cash='" + itemName + "'>" + itemName + "</div>";


				if (addToName !== "") {
					marketItem.innerHTML += addToName;
				}
				marketItem.innerHTML += "<div class='tradeZone'>" + tradezoneNamerShort(parseInt(marketData["tradelist_" + i + "_trade_zone"])) + "</div>";
				marketItem.innerHTML += "<div class='seller'>" + marketData["tradelist_" + i + "_member_name"].substring(0, 22) + "</div>";
				var buttonData = document.createElement("button");
				if (parseInt(userVars["DFSTATS_df_cash"]) < parseInt(marketData["tradelist_" + i + "_price"])) {
					buttonData.disabled = true;
					marketItem.innerHTML += "<div class='salePrice' style='color: red;'>$" + nf.format(marketData["tradelist_" + i + "_price"]) + "</div>";
				} else {
					if (marketData["tradelist_" + i + "_price"] === "0") {
						marketItem.innerHTML += "<div class='salePrice'>Free</div>";
					} else {
						marketItem.innerHTML += "<div class='salePrice'>$" + nf.format(marketData["tradelist_" + i + "_price"]) + "</div>";
					}
				}
				if (!freeInventorySpace && getItemType(globalData[itemType]) !== "credits") {
					buttonData.disabled = true;
				}

				buttonData.textContent = "buy";
				buttonData.dataset.action = "buyItem";
				buttonData.dataset.itemLocation = i;
				buttonData.dataset.buynum = marketData["tradelist_" + i + "_trade_id"];
				buttonData.addEventListener("click", marketAction);
				marketItem.appendChild(buttonData);
				itemDisplay.appendChild(marketItem);
			}
		}
	}
	//prompt.innerHTML = "";
	//prompt.parentNode.style.display = "none";
}

function openCategories(e) {
	var categoryHolder = document.getElementById("categoryList");
	var categoryChoice = document.getElementById("categoryChoice");
	if (menuOpen) {
		// close menu
		menuOpen = false;
		categoryHolder.style.display = "none";
		if (categoryChoice !== e.target && categoryChoice !== e.target.parentElement) {
			categoryChoice.querySelector("#cat").textContent = e.target.textContent;
			categoryChoice.dataset.catname = e.target.dataset.catname;
		}
		categoryChoice.querySelector("#dog").textContent = "\u25C4";
		if (e.target.dataset.cattype) {
			categoryChoice.dataset.cattype = e.target.dataset.cattype;
		} else {
			categoryChoice.dataset.cattype = "";
		}
	} else {
		// open menu
		menuOpen = true;
		categoryChoice.querySelector("#dog").textContent = "\u25BC";
		categoryHolder.style.display = "block";
	}
	if (categoryHolder.dataset.catname !== "") {
		document.getElementById("makeSearch").disabled = false;
	} else {
		if (document.getElementById("searchField").value.length > 0) {
			document.getElementById("makeSearch").disabled = false;
		} else {
			document.getElementById("makeSearch").disabled = true;
		}
	}
	document.getElementById("searchField").focus();
}

function clickOff() {
	if (menuOpen) {
		menuOpen = false;
		document.getElementById("categoryList").style.display = "none";
	}
}

function marketAction(e) {
	var question = false;
	var action;
	var extraData = {};
	switch (e.target.dataset.action) {
		case "buyItem":
			extraData["buynum"] = marketData["tradelist_" + e.target.dataset.itemLocation + "_trade_id"];
			extraData["price"] = marketData["tradelist_" + e.target.dataset.itemLocation + "_price"];
			var price = "";
			if (marketData["tradelist_" + e.target.dataset.itemLocation + "_price"] > 0) {
				price = "$" + nf.format(marketData["tradelist_" + e.target.dataset.itemLocation + "_price"]);
			} else {
				price = "free";
			}
			prompt.textContent = "Are you sure you want to buy " + marketData["tradelist_" + e.target.dataset.itemLocation + "_itemname"] + " for " + price + "?";
			action = buyItem;
			question = true;
			break;
		case "buyPrivate":
			extraData["buynum"] = privateData["tradelist2_" + e.target.dataset.itemLocation + "_trade_id"];
			extraData["price"] = privateData["tradelist2_" + e.target.dataset.itemLocation + "_price"];
			if (privateData["tradelist2_" + e.target.dataset.itemLocation + "_price"] > 0) {
				price = "$" + nf.format(privateData["tradelist2_" + e.target.dataset.itemLocation + "_price"]);
			} else {
				price = "free";
			}
			prompt.textContent = "Are you sure you want to buy " + privateData["tradelist2_" + e.target.dataset.itemLocation + "_itemname"] + " for " + price + "?";
			action = buyPrivate;
			question = true;
			break;
		default:
			console.log(e.target.dataset.action);
			return;
			break;
		case "switchMarket":
			prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
			prompt.parentNode.style.display = "block";
			marketScreen = e.target.dataset.page;
			loadMarket();
			return;
			break;
		case "cancelSale":
			extraData["buynum"] = sellingData["tradelist_" + e.target.dataset.itemLocation + "_trade_id"];
			prompt.textContent = "Are you sure you want to stop selling the " + sellingData["tradelist_" + e.target.dataset.itemLocation + "_itemname"] + "?";
			action = cancelSale;
			question = true;
			break;
		case "cancelPrivate":
			extraData["buynum"] = privateData["tradelist_" + e.target.dataset.itemLocation + "_trade_id"];
			prompt.textContent = "Are you sure you want to stop selling the " + privateData["tradelist_" + e.target.dataset.itemLocation + "_itemname"] + "?";
			action = cancelPrivate;
			question = true;
			break;
		case "rejectItem":
			extraData["buynum"] = privateData["tradelist2_" + e.target.dataset.itemLocation + "_trade_id"];
			prompt.textContent = "Are you sure you want to reject the offer of the " + privateData["tradelist2_" + e.target.dataset.itemLocation + "_itemname"] + " from " + privateData["tradelist2_" + e.target.dataset.itemLocation + "_member_name"] + "?";
			action = rejectItem;
			question = true;
			break;
		case "sellService":
			prompt.textContent = "How much would you like to charge per job?";

			question = true;
			var priceHolder = document.createElement("div");
			priceHolder.style.position = "absolute";
			priceHolder.style.width = "100%";
			priceHolder.style.textAlign = "center";
			priceHolder.style.bottom = "30px";

			var priceLabel = document.createElement("label");
			priceLabel.textContent = "$";
			priceLabel.style.color = "#ffff00";
			var priceInput = document.createElement("input");
			priceInput.dataset.type = "price";
			priceInput.classList.add("moneyField");
			priceInput.type = "number";
			priceInput.max = 9999999999;
			priceInput.min = 0;
			priceInput.value = '';

			priceInput.onchange = function (dE) {
				if (dE.target.value < 0) {
					dE.target.value = 0;
				} else if (dE.target.value > 9999999999) {
					dE.target.value = 9999999999;
				}
			};

			priceHolder.appendChild(priceLabel);
			priceHolder.appendChild(priceInput);

			prompt.appendChild(priceHolder);
			action = sellService;
			break;
		case "cancelService":
			prompt.textContent = "Are you sure you want to stop selling your services?";

			question = true;
			action = cancelService;
			break;
	}
	var noButton = document.createElement("button");

	noButton.style.position = "absolute";
	noButton.style.top = "72px";
	noButton.addEventListener("click", function () {
		prompt.parentNode.style.display = "none";
		prompt.innerHTML = "";
		pageLock = false;
	});
	if (question) {
		noButton.textContent = "No";
		noButton.style.right = "86px";
		var yesButton = document.createElement("button");
		yesButton.textContent = "Yes";
		yesButton.style.position = "absolute";
		yesButton.style.left = "86px";
		yesButton.style.top = "72px";
		yesButton.addEventListener("click", function () {
			yesButton.disabled = true;
			action(extraData);
		});

		var dataInput = prompt.querySelectorAll("input");
		if (dataInput.length) {
			yesButton.disabled = true;
			for (var h in dataInput) {
				dataInput[h].oninput = function (dE) {
					var keepDisabled = false;
					for (var g in dataInput) {
						if (dataInput[g].value === '') {
							keepDisabled = true;
						}
					}
					if (keepDisabled) {
						yesButton.disabled = true;
					} else {
						yesButton.disabled = false;
					}
					if (dE.target.type === "number") {
						if (dE.target.value < 0) {
							dE.target.value = 0;
						} else if (parseInt(dE.target.value) > parseInt(dE.target.max)) {
							dE.target.value = dE.target.max;
						}
						if (dE.target.classList.contains("moneyField")) {
							if (e.target.dataset.action === "sellService") {
								if (dE.target.value < 0) {
									dE.target.value = 0;
								} else if (dE.target.value > 9999999999) {
									dE.target.value = 9999999999;
								}
								dE.target.value = parseInt(dE.target.value);
							}
						}
					}
					if (dE.target.type === "text") {
						if (dE.target.value.length >= 24) {
							dE.preventDefault();
							dE.target.value = dE.target.value.substr(0, 24);
						}
						dE.target.value = dE.target.value.replace(/[^A-Z a-z 0-9\'\`\-   ]/g, "");
					}
				};
				dataInput[h].onkeydown = function (dE) {
					if (dE.target.type === "text") {
						if (dE.key === "'" || dE.key === '"') {
							dE.preventDefault();
							if (dE.target.value.length < 24) {
								dE.target.value += "`";
								if (dE.target.value === '') {
									yesButton.disabled = true;
								} else {
									yesButton.disabled = false;
								}
							}
						}
					}
				};
			}
		}

		prompt.appendChild(yesButton);
		prompt.onkeydown = function (e) {
			if (e.keyCode === 13) {
				yesButton.click();
			}
		};
	} else {
		noButton.textContent = "ok";
		noButton.style.left = "125px";
		prompt.onkeydown = function (e) {
			if (e.keyCode === 13) {
				noButton.click();
			}
		};
	}
	prompt.appendChild(noButton);
	prompt.parentNode.style.display = "block";
	prompt.focus();
}

function sellService(data) {
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["templateID"] = userVars["template_ID"];
	dataArray["sc"] = userVars["sc"];
	dataArray["creditsnum"] = 0;
	dataArray["buynum"] = "";
	dataArray["renameto"] = "";
	dataArray["expected_itemprice"] = "-1";
	dataArray["expected_itemtype2"] = "";
	dataArray["expected_itemtype"] = "";
	dataArray["itemnum2"] = 0;
	dataArray["itemnum"] = 0;
	dataArray["price"] = prompt.querySelector("input[data-type='price']").value;
	dataArray["action"] = "sellservice";
	dataArray["gv"] = 42;
	dataArray["userID"] = userVars["userID"];
	dataArray["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArray, function (data) {
		updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		getSellingList();
		updateAllFields();
	}, true);
}

function cancelService(data) {
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["templateID"] = userVars["template_ID"];
	dataArray["sc"] = userVars["sc"];
	dataArray["creditsnum"] = 0;
	dataArray["buynum"] = "";
	dataArray["renameto"] = "";
	dataArray["expected_itemprice"] = "-1";
	dataArray["expected_itemtype2"] = "";
	dataArray["expected_itemtype"] = "";
	dataArray["itemnum2"] = 0;
	dataArray["itemnum"] = 0;
	dataArray["price"] = 0;
	dataArray["action"] = "cancelsellservice";
	dataArray["gv"] = 42;
	dataArray["userID"] = userVars["userID"];
	dataArray["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArray, function (data) {
		updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		getSellingList();
	}, true);
}

function rejectItem(data) {
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["templateID"] = userVars["template_ID"];
	dataArray["sc"] = userVars["sc"];
	dataArray["creditsnum"] = "0";
	dataArray["buynum"] = data["buynum"];
	dataArray["renameto"] = "";
	dataArray["expected_itemprice"] = "-1";
	dataArray["expected_itemtype2"] = "";
	dataArray["expected_itemtype"] = "";
	dataArray["itemnum2"] = 0;
	dataArray["itemnum"] = 0;
	dataArray["price"] = 0;
	dataArray["action"] = "denyprivatetrade";
	dataArray["gv"] = 42;
	dataArray["userID"] = userVars["userID"];
	dataArray["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArray, function (data) {
		updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		if (userVars["member_to"] && userVars["member_to"] !== "") {
			getPrivateTrading(userVars["member_to"]);
		} else {
			getPrivateTrading();
		}
	}, true);
}

function cancelPrivate(data) {
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["templateID"] = userVars["template_ID"];
	dataArray["sc"] = userVars["sc"];
	dataArray["creditsnum"] = "0";
	dataArray["buynum"] = data["buynum"];
	dataArray["renameto"] = "";
	dataArray["expected_itemprice"] = "-1";
	dataArray["expected_itemtype2"] = "";
	dataArray["expected_itemtype"] = "";
	dataArray["itemnum2"] = 0;
	dataArray["itemnum"] = 0;
	dataArray["price"] = 0;
	dataArray["action"] = "newcancelsale";
	dataArray["gv"] = 42;
	dataArray["userID"] = userVars["userID"];
	dataArray["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArray, function (data) {
		updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		if (userVars["member_to"] && userVars["member_to"] !== "") {
			getPrivateTrading(userVars["member_to"]);
		} else {
			getPrivateTrading();
		}
	}, true);
}

function cancelSale(data) {
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["templateID"] = userVars["template_ID"];
	dataArray["sc"] = userVars["sc"];
	dataArray["creditsnum"] = "0";
	dataArray["buynum"] = data["buynum"];
	dataArray["renameto"] = "";
	dataArray["expected_itemprice"] = "-1";
	dataArray["expected_itemtype2"] = "";
	dataArray["expected_itemtype"] = "";
	dataArray["itemnum2"] = 0;
	dataArray["itemnum"] = 0;
	dataArray["price"] = 0;
	dataArray["action"] = "newcancelsale";
	dataArray["gv"] = 42;
	dataArray["userID"] = userVars["userID"];
	dataArray["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArray, function (data) {
		updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		getSellingList();
	}, true);
}

function buyPrivate(data) {
	playSound("buysell");
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["templateID"] = userVars["template_ID"];
	dataArray["sc"] = userVars["sc"];
	dataArray["creditsnum"] = "undefined";
	dataArray["buynum"] = data["buynum"];
	dataArray["renameto"] = "undefined`undefined";
	dataArray["expected_itemprice"] = data["price"];
	dataArray["expected_itemtype2"] = "";
	dataArray["expected_itemtype"] = "";
	dataArray["itemnum2"] = 0;
	dataArray["itemnum"] = 0;
	dataArray["price"] = 0;
	dataArray["action"] = "newbuy";
	dataArray["gv"] = 42;
	dataArray["userID"] = userVars["userID"];
	dataArray["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArray, function (data) {
		if (data === "") {
			prompt.textContent = "You have missed this item.";
			var noButton = document.createElement("button");

			noButton.style.position = "absolute";
			noButton.style.top = "72px";
			noButton.addEventListener("click", function () {
				prompt.parentNode.style.display = "none";
				prompt.innerHTML = "";
				pageLock = false;
			});
			noButton.textContent = "ok";
			noButton.style.left = "125px";

			prompt.appendChild(noButton);
		} else {
			updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		}
		if (userVars["member_to"] && userVars["member_to"] !== "") {
			getPrivateTrading(userVars["member_to"]);
		} else {
			getPrivateTrading();
		}
	}, true);
}

function buyItem(data) {
	playSound("buysell");
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["templateID"] = userVars["template_ID"];
	dataArray["sc"] = userVars["sc"];
	dataArray["creditsnum"] = "undefined";
	dataArray["buynum"] = data["buynum"];
	dataArray["renameto"] = "undefined`undefined";
	dataArray["expected_itemprice"] = data["price"];
	dataArray["expected_itemtype2"] = "";
	dataArray["expected_itemtype"] = "";
	dataArray["itemnum2"] = 0;
	dataArray["itemnum"] = 0;
	dataArray["price"] = 0;
	dataArray["action"] = "newbuy";
	dataArray["gv"] = 42;
	dataArray["userID"] = userVars["userID"];
	dataArray["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArray, function (data) {
		if (data === "") {
			prompt.textContent = "You have missed this item.";
			var noButton = document.createElement("button");

			noButton.style.position = "absolute";
			noButton.style.top = "72px";
			noButton.addEventListener("click", function () {
				prompt.parentNode.style.display = "none";
				prompt.innerHTML = "";
				pageLock = false;
			});
			noButton.textContent = "ok";
			noButton.style.left = "125px";

			prompt.appendChild(noButton);
		} else {
			updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		}
		search();
	}, true);
}

function getSellingList() {
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["tradezone"] = "";
	dataArray["searchname"] = "";
	dataArray["searchtype"] = "sellinglist";
	dataArray["search"] = "trades";
	dataArray["memID"] = userVars["userID"];
	dataArray["category"] = "";
	dataArray["profession"] = "";

	webCall("trade_search", dataArray, function (data) {
		populateInventory();
		flshToArr(data, "", listSelling);
		updateAllFields();
	}, true);
}

function getPrivateTrading(memto) {
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["tradezone"] = "";
	dataArray["searchname"] = "";

	dataArray["search"] = "trades";
	if (memto) {
		dataArray["memberto"] = memto;
		dataArray["searchtype"] = "privatemember";
	} else {
		dataArray["searchtype"] = "private";
	}
	dataArray["memID"] = userVars["userID"];
	dataArray["category"] = "";
	dataArray["profession"] = "";

	webCall("trade_search", dataArray, function (data) {
		flshToArr(data, "", listPrivate);
		populateInventory();
		updateAllFields();
	}, true);
}

function search() {
	menuOpen = false;
	document.getElementById("categoryList").style.display = "none";
	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	prompt.parentNode.style.display = "block";
	var categoryChoice = document.getElementById("categoryChoice");
	var dataArray = {};

	dataArray["pagetime"] = userVars["pagetime"];
	dataArray["tradezone"] = userVars["DFSTATS_df_tradezone"];
	dataArray["searchname"] = document.getElementById("searchField").value;

	dataArray["memID"] = "";

	if (categoryChoice.dataset.cattype === "service") {
		dataArray["searchtype"] = "buyinglist";
		dataArray["profession"] = categoryChoice.dataset.catname;
		dataArray["category"] = "";
		dataArray["search"] = "services";
	} else {
		dataArray["profession"] = "";
		dataArray["category"] = categoryChoice.dataset.catname;
		dataArray["search"] = "trades";
		if (dataArray["searchname"] === "") {
			dataArray["searchtype"] = "buyinglistcategory";
		} else {
			if (dataArray["category"] !== "") {
				dataArray["searchtype"] = "buyinglistcategoryitemname";
			} else {
				dataArray["searchtype"] = "buyinglistitemname";
			}
		}
	}


	webCall("trade_search", dataArray, function (data) {
		if (dataArray["search"] === "services") {
			data += "&services=" + dataArray["profession"];
		}
		data += "&searcheditem=" + document.getElementById("searchField").value;
		flshToArr(data, "", listMarket);
		populateInventory();
		updateAllFields();
	}, true);
}