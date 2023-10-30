var storageTab = 0, currentX = 0, currentY = 0, active = 0, timeStart = 0, replaceeQuantity = 0, currentQuantity = 0;
var infoBox, replacee, currentItem, startX, startY, stackable, storageBox, canMove, hoverItem, hovering, textAddonRef, inventoryHolder, canComplete = false, slotNum, curInfoItem, fakeGrabbedItem;
var globalData = {}, tradeListSize = 0, dragIteration = 0, mousePos = [0, 0];
var blockingItem = "";
var ctxMenuHolder;
var marketLastMoney = false;
var lastItemSold = "";

var lockedSlots = [];

if(typeof useVars === "undefined")
{
	var userVars = [];
}
if(typeof hrV === "undefined")
{
	var hrV = 0;
}
if(typeof nf === "undefined")
{
	var nf = new Intl.NumberFormat();
}

var hoverEvent = document.createEvent("Event");
hoverEvent.initEvent("itemhover", true, true);

function mouseTracker(e)
{
	if(e.type === "touchmove")
	{
		mousePos[0] = e.touches[0].clientX;
		mousePos[1] = e.touches[0].clientY;
	} else
	{
		mousePos[0] = e.clientX;
		mousePos[1] = e.clientY;
	}
}

function populateStorage()
{
	if(checkLSBool("general", "simpleMenus"))
	{
		$("#speedContainer").empty();
		populateStorageAlt();
	} else
	{
		$("#storage").find(".validSlot").empty();
		$.each($("#storage").find("div"), function(index, value)
		{
			if(parseInt(value.dataset.slot) <= parseInt(userVars["DFSTATS_df_storage_slots"]))
			{
				if(!value.classList.contains("validSlot"))
				{
					value.classList.add("validSlot");
				}
			} else
			{
				value.classList.remove("validSlot");
			}
		});
		for(var i = (storageTab + 1) * 40 - 39; i <= (storageTab + 1) * 40; i++)
		{
			if(typeof (storageBox["df_store" + i + "_type"]) !== "undefined")
			{
				setSlotData(storageBox["df_store" + i + "_type"], storageBox["df_store" + i + "_quantity"], $("#storage").find("div[data-slot='" + i + "'].validSlot"));
			}
		}
	}
}

var validItems = 0;
function populateStorageAlt()
{
	validItems = 0;
	var currentlyHiddenItems = 0;
	for(var i = 0; i <= parseInt(userVars["DFSTATS_df_storage_slots"]); i++)
	{
		if(typeof storageBox["df_store" + i + "_type"] !== "undefined")
		{
			validItems++;

			var item = document.createElement("div");
			item.classList.add("fakeItem");
			item.dataset.type = storageBox["df_store" + i + "_type"];
			item.dataset.quantity = storageBox["df_store" + i + "_quantity"];
			item.dataset.slot = i;

			var itemData = storageBox["df_store" + i + "_type"];
			var itemType = itemData.split('_')[0];
			var itemCat = getItemType(globalData[itemType]);

			var addToName = " " + calcMCTag(itemData, false, "span", "");
			var storageQuanity = parseInt(storageBox["df_store" + i + "_quantity"]);


			if(storageQuanity !== 0 && storageQuanity !== 1 && storageBox["df_store" + i + "_quantity"] !== "" && storageBox["df_store" + i + "_quantity"] !== " " || itemCat === "armour" || itemCat === "ammo")
			{
				var dataString = "<span";

				if(itemCat !== "ammo")
				{
					dataString += " style='color: #" + damageColor(storageBox["df_store" + i + "_quantity"], globalData[itemType]["hp"]) + ";'";
				}

				dataString += "> (";

				if(itemData["quantity"] !== "")
				{
					dataString += storageQuanity;
				} else
				{
					dataString += "0";
				}


				dataString += ")</span>";

				addToName += dataString;
			}

			var itemName = globalData[itemType]["name"];
			var itemColour = "";
			for(var x in itemData.split('_'))
			{
				if(itemData.split('_')[x].indexOf("colour") >= 0)
				{
					itemColour = itemData.split('_')[x].substring(6) + " ";
				}
				if(itemData.split('_')[x].indexOf("name") >= 0)
				{
					itemName = itemData.split('_')[x].substring(4);
				}
			}

			itemName = itemColour + itemName;

			if(itemName.length + addToName.replace(/(<([^>]+)>)/gi, "").length > 46)
			{
				if(addToName !== "")
				{
					item.dataset.originalLength = addToName.replace(/(<([^>]+)>)/gi, "").length;
					itemName = itemName.substr(0, 43 - addToName.replace(/(<([^>]+)>)/gi, "").length) + "...";
				} else
				{
					itemName = itemName.substr(0, 43) + "...";
				}
			}

			item.innerHTML = "<div class='itemName cashhack credits' data-cash='" + itemName + "'>" + itemName + "</div>";
			if(addToName !== "")
			{
				item.innerHTML += addToName;
			}

			var buttonData = document.createElement("button");
			buttonData.textContent = "take";
			buttonData.dataset.action = "takeFromStorage";
			buttonData.dataset.type = storageBox["df_store" + i + "_type"];
			if(findFirstEmptyGenericSlot("inv"))
			{
				buttonData.addEventListener("click", inventoryAction);
			} else
			{
				buttonData.disabled = true;
			}

			item.appendChild(buttonData);

			if(document.getElementById("storageSearchBox").value !== "")
			{
				if(!searchPassConditions(document.getElementById("storageSearchBox").value, itemData, globalData[itemType]["name"]))
				{
					currentlyHiddenItems++;
					item.style.display = "none";
				}
			}

			document.getElementById("speedContainer").appendChild(item);
		}
	}

	var totalStorageSlotsDisplay = document.getElementById("remainingSlots");
	if(totalStorageSlotsDisplay === null)
	{
		totalStorageSlotsDisplay = document.createElement("div");
		totalStorageSlotsDisplay.id = "remainingSlots";
	}
	totalStorageSlotsDisplay.textContent = "Slots: " + validItems + " / " + userVars["DFSTATS_df_storage_slots"];

	var itemArr = Array.prototype.slice.call(document.getElementById("speedContainer").querySelectorAll(".fakeItem"), 0);
	itemArr = itemListSorter(itemArr);

	for(var item of itemArr)
	{
		document.getElementById("speedContainer").appendChild(item);
	}

	var noItemMessage = document.createElement("div");
	noItemMessage.classList.add("profitList");
	if(validItems > 0 && validItems !== currentlyHiddenItems)
	{
		noItemMessage.style.display = "none";
	}
	noItemMessage.style.textAlign = "center";
	noItemMessage.innerHTML += "No items found";
	document.getElementById("speedContainer").appendChild(noItemMessage);

	inventoryHolder.appendChild(totalStorageSlotsDisplay);
}

var itemTypeOrder = ["armour", "weapon"];

function itemListSorter(itemList)
{
	if(checkPropertyValid("inventory", "sortstyle") && parseInt(userSettings["inventory"]["sortstyle"]) !== 0)
	{
		var subItemLists = Array.apply(null, Array(itemTypeOrder.length + 1)).map(function(x, i) {return [];});
		for(var i = 0; i < itemList.length; i++)
		{
			var itemData = globalData[itemList[i].dataset.type.split('_')[0]];
			var sorted = false;

			for(var j = 0; j < itemTypeOrder.length; j++)
			{
				if(itemTypeOrder[j] === itemData["itemcat"])
				{
					subItemLists[j].push(itemList[i]);
					sorted = true;
					break;
				}
			}
			if(!sorted)
			{
				subItemLists[subItemLists.length - 1].push(itemList[i]);
			}
		}

		itemList = [];

		for(var i = 0; i < subItemLists.length; i++)
		{
			subItemLists[i].sort(itemAlphabeticalSort);
			itemList = itemList.concat(subItemLists[i]);
		}
	} else
	{
		itemList.sort(itemAlphabeticalSort);
	}

	return itemList;
}

function itemAlphabeticalSort(elemA, elemB)
{
	var aType = elemA.dataset.type;
	var bType = elemB.dataset.type;

	if(checkLSBool("inventory", "sortbyscrap"))
	{
		var aScrap = scrapValue(aType, elemA.dataset.quantity);
		var bScrap = scrapValue(bType, elemB.dataset.quantity);

		if(aScrap < bScrap)
		{
			return 1;
		} else if(bScrap < aScrap)
		{
			return -1;
		}
	}

	for(var i = 0; i < aType.length; i++)
	{
		if(aType.charCodeAt(i) && bType.charCodeAt(i))
		{
			if(aType.charCodeAt(i) < bType.charCodeAt(i))
			{
				return -1;
			} else if(aType.charCodeAt(i) > bType.charCodeAt(i))
			{
				return 1;
			}
		} else
		{
			break;
		}
	}
	if(typeof elemA.dataset.quantity !== "undefined")
	{
		if(typeof elemB.dataset.quantity !== "undefined")
		{
			var aQuantity = parseInt(elemA.dataset.quantity);
			var bQuantity = parseInt(elemB.dataset.quantity);
			if(aQuantity < bQuantity)
			{
				return -1;
			} else if(aQuantity > bQuantity)
			{
				return 1;
			}
		} else
		{
			return 1;
		}
	}

	return 0;
}

function setSlotData(itemType, quantity, appendTo)
{
	var itemData = {'type': itemType.trim().split("_"), 'quantity': quantity.trim()};
	var item = document.createElement("div");
	item.setAttribute("class", "item");
	if(itemType.indexOf("_cooked") >= 0)
	{
		item.classList.add("nonstack");
		item.classList.add("cooked");
	}
	if(typeof globalData[itemData["type"][0]] === "undefined")
	{
		itemData["type"][0] = "brokenitem";
		item.dataset.type = "brokenitem";
		item.dataset.broken = itemType;
	} else
	{
		itemData["image"] = itemData["type"][0];
		item.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
		item.dataset.type = itemType;
	}

	item.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
	if(itemData["quantity"] !== "0" && itemData["quantity"] !== "1" && itemData["quantity"] !== "" || item.dataset.itemtype === "armour" || item.dataset.itemtype === "ammo")
	{
		if(itemData["quantity"] !== "")
		{
			item.dataset.quantity = itemData["quantity"];
		} else
		{
			item.dataset.quantity = 0;
		}
		if(item.dataset.itemtype !== "ammo")
		{
			item.classList.add("nonstack");
			item.style.color = "#" + damageColor(itemData["quantity"], globalData[itemData["type"][0]]["hp"]);
		}
	}

	/*if(document.getElementById("storage"))
	{
		item.onmouseover = shiftHover;
		item.onmousemove = shiftHover;
		item.onkeypress = shiftHover;
		item.onmouseout = shiftUnhover;
		
	}*/

	appendTo.append(item);
}

function getUpgradePrice()
{
	var price = 0;
	price = parseInt(userVars["DFSTATS_df_storage_slots"]) * 5000;
	if(price > 500000)
	{
		price = 500000;
	}
	if(parseInt(userVars["DFSTATS_df_storage_slots"]) >= 400) {
		price = parseInt(userVars["DFSTATS_df_storage_slots"]) * 5000;
	}
	return price;
}

var mcData = {};
mcData["888"] = ["#897129", "God", "G"];
mcData["777"] = ["#c0c0c0", "Angel", "A"];
mcData["666"] = ["#AA0000", "Hell", "H"];

mcData["788"] = ["", "Near God", "NG"];
mcData["878"] = ["", "Near God", "NG"];
mcData["887"] = ["", "Near God", "NG"];

mcData["2424"] = ["#897129", "God", "G"];

mcData["2423"] = ["", "Near God", "NG"];
mcData["2324"] = ["", "Near God", "NG"];

function calcMCTag(itemData, fullText, nodeType, cssClass)
{
	var nameOutput = "";
	if(itemData.indexOf("_stats") >= 0)
	{
		var n = itemData.indexOf("_");
		var itemType = getItemType(globalData[itemData.substring(0, n).trim()]);
		n = itemData.indexOf("_stats") + 6;
		if(itemType === "armour")
		{
			var n = itemData.substring(n, n + 4);
		} else if(itemType === "weapon")
		{
			var n = itemData.substring(n, n + 3);
		}

		if(n !== "000" && n !== "0000")
		{
			if(mcData[n])
			{
				nameOutput += "<" + nodeType;
				if(cssClass && cssClass !== "")
				{
					nameOutput += " class='" + cssClass + "'";
				}
				if(mcData[n][0] !== "")
				{
					nameOutput += " style='color: " + mcData[n][0] + ";'";
				}
				nameOutput += ">";
				if(fullText)
				{
					nameOutput += "[" + mcData[n][1] + " Craft]";
				} else
				{
					nameOutput += "(" + mcData[n][2] + "C)";
				}
				nameOutput += "</" + nodeType + ">";
			} else
			{
				if(!fullText)
				{
					nameOutput += "<" + nodeType;
					if(cssClass && cssClass !== "")
					{
						nameOutput += " class='" + cssClass + "'";
					}
					nameOutput += ">(MC)</" + nodeType + ">";
				}
			}
		}
	}
	return nameOutput;
}

function findFirstEmptyStorageSlot()
{
	var maxStoreLocation = parseInt(userVars["DFSTATS_df_storage_slots"]);
	if((storageTab * 40) + 40 < parseInt(maxStoreLocation))
	{
		maxStoreLocation = (storageTab * 40) + 40
	}
	for(var i = (storageTab * 40) + 1; i <= userVars["DFSTATS_df_storage_slots"]; i++)
	{
		if(typeof storageBox["df_store" + i + "_type"] === "undefined")
		{
			return i;
		}
	}
	for(var i = 1; i <= userVars["DFSTATS_df_storage_slots"]; i++)
	{
		if(typeof storageBox["df_store" + i + "_type"] === "undefined")
		{
			return i;
		}
	}
	return false;
}

function findLastEmptyStorageSlot()
{
	for(var i = userVars["DFSTATS_df_storage_slots"]; i >= 1; i--)
	{
		if(typeof storageBox["df_store" + i + "_type"] === "undefined")
		{
			return i;
		}
	}
	return false;
}

function findFirstEmptyGenericSlot(slotType)
{
	for(var i = 1; i <= userVars["DFSTATS_df_" + slotType + "slots"]; i++)
	{
		if(userVars["DFSTATS_df_" + slotType + i + "_type"] === "")
		{
			return i;
		}
	}
	return false;
}

function findLastEmptyGenericSlot(slotType)
{
	for(var i = userVars["DFSTATS_df_" + slotType + "slots"]; i >= 1; i++)
	{
		if(userVars["DFSTATS_df_" + slotType + i + "_type"] === "")
		{
			return i;
		}
	}
	return false;
}

function shiftItem(elem)
{
	var itemData = [parseInt(elem.parentNode.dataset.slot), elem.dataset.type, elem.parentNode.parentNode.parentNode.id];
	var extraData = [itemData];
	if(document.getElementById("storage"))
	{
		if(elem.parentNode.parentNode.parentNode.id === "storage")
		{
			extraData[1] = [findFirstEmptyGenericSlot("inv"), "", "inventory"];
		} else
		{
			extraData[1] = [findFirstEmptyStorageSlot(), "", "storage"];
		}
	} else if(document.getElementById("implants") && elem.dataset.itemtype && elem.dataset.itemtype === "implant")
	{
		if(elem.parentNode.parentNode.parentNode.id === "implants")
		{
			extraData[1] = [findFirstEmptyGenericSlot("inv"), "", "inventory"];
		} else
		{
			extraData[1] = [findFirstEmptyGenericSlot("implant"), "", "implants"];
		}
	} else if(document.getElementById("character"))
	{
		if(elem.dataset.itemtype === "weapon")
		{
			if(elem.parentNode.dataset.slottype === "weapon")
			{
				extraData[1] = [findFirstEmptyGenericSlot("inv"), "", "inventory"];
			} else
			{
				var emptyWeaponSlot = 0;
				for(var i = 1; i <= 3; i++)
				{
					if(userVars["DFSTATS_df_weapon" + i + "type"] === "")
					{
						emptyWeaponSlot = i + 30;
						break;
					}
				}
				extraData[1] = [emptyWeaponSlot, "", "character"];
			}
		} else if(elem.dataset.itemtype === "armour")
		{
			if(elem.parentNode.dataset.slottype === "armour")
			{
				extraData[1] = [findFirstEmptyGenericSlot("inv"), "", "inventory"];
			} else
			{
				var armourType = "";
				var armourElem = document.getElementById("character").querySelector(".validSlot[data-slot='34']");
				if(armourElem.hasChildNodes())
				{
					armourType = armourElem.childNodes[0].dataset.type;
				}
				extraData[1] = [34, armourType, "character"];
			}
		} else
		{
			if(elem.parentNode.parentNode.parentNode.id === "character")
			{
				extraData[1] = [findFirstEmptyGenericSlot("inv"), "", "inventory"];
			} else
			{
				if(unblockedSlot(elem.dataset.type.split("_")[0].trim()))
				{
					var slotType = "";
					var slotElem = document.getElementById("character").querySelector(".validSlot[data-slottype='" + elem.dataset.itemtype + "']");
					if(slotElem.hasChildNodes())
					{
						slotType = slotElem.childNodes[0].dataset.type;
					}
					extraData[1] = [slotElem.dataset.slot, slotType, "character"];
				}
			}
		}
	}
	updateInventory(extraData);
}

function updateInventory(itemSlots)
{
	prompt.innerHTML = "<div style='text-align: center;'>Loading...</div>";
	prompt.parentNode.style.display = "block";
	if(itemSlots[0][2] === "storage")
	{
		itemSlots[0][0] += 40;
	} else if(itemSlots[0][2] === "implants")
	{
		itemSlots[0][0] += 1000;
	}
	if(itemSlots[1][2] === "storage")
	{
		itemSlots[1][0] += 40;
	} else if(itemSlots[1][2] === "implants")
	{
		itemSlots[1][0] += 1000;
	}
	var dataArr = {};
	dataArr["pagetime"] = userVars["pagetime"];
	dataArr["templateID"] = userVars["template_ID"];
	dataArr["sc"] = userVars["sc"];
	dataArr["creditsnum"] = userVars["DFSTATS_df_credits"];
	dataArr["buynum"] = "0";
	dataArr["renameto"] = "undefined`undefined";
	dataArr["expected_itemprice"] = "-1";
	dataArr["expected_itemtype2"] = itemSlots[1][1];
	dataArr["expected_itemtype"] = itemSlots[0][1];
	dataArr["itemnum2"] = itemSlots[1][0];
	dataArr["itemnum"] = itemSlots[0][0];
	dataArr["price"] = getUpgradePrice();
	dataArr["gv"] = 42;
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];

	if(itemSlots[0][2] === "inventory" && itemSlots[1][2] === "storage")
	{
		playSound("swap");
		dataArr["action"] = "store";
		webCall("inventory_new", dataArr, reloadStorageData, true);
	} else if(itemSlots[0][2] === "storage" && itemSlots[1][2] === "storage")
	{
		var notAmmo = true;
		if(typeof globalData[itemSlots[0][1]] !== "undefined" && globalData[itemSlots[0][1]]["itemcat"] === "ammo")
		{
			notAmmo = false;
		}
		if(itemSlots[1][1] === itemSlots[0][1] && storageBox["df_store" + (itemSlots[1][0] - 40) + "_quantity"] === storageBox["df_store" + (itemSlots[0][0] - 40) + "_quantity"] && notAmmo)
		{
			prompt.parentNode.style.display = "none";
			prompt.innerHTML = "";
			pageLock = false;
			return;
		}
		playSound("swap");
		dataArr["action"] = "swapstorage";
		webCall("inventory_new", dataArr, reloadStorageData, true);
	} else if(itemSlots[0][2] === "inventory" && itemSlots[1][2] === "inventory" || itemSlots[0][2] === "implants" || itemSlots[1][2] === "implants")
	{
		playSound("swap");
		dataArr["action"] = "newswap";
		webCall("inventory_new", dataArr, function(data)
		{
			updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
			populateInventory();
			if(itemSlots[0][2] === "implants" || itemSlots[1][2] === "implants")
			{
				populateImplants();
			}
			if(document.getElementById("sellitems") && sellingData)
			{
				listSelling(sellingData);
			} else if(document.getElementById("privateIncoming") && document.getElementById("privateOutgoing") && privateData)
			{
				listPrivate(privateData);
			} else if(document.getElementById("itemDisplay") && marketData)
			{
				listMarket(marketData);
			}
			updateAllFields();
		}, true);
	} else if(itemSlots[0][2] === "storage" && itemSlots[1][2] === "inventory")
	{
		playSound("swap");
		dataArr["action"] = "take";
		webCall("inventory_new", dataArr, reloadStorageData, true);
	} else if(itemSlots[1][2] === "discard")
	{
		dataArr["action"] = "newdiscard";
		webCall("inventory_new", dataArr, function(data)
		{
			updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
			populateInventory();
			populateCharacterInventory();
			updateAllFields();
			renderAvatarUpdate();
		}, true);
	} else if(itemSlots[0][2] === "character" || itemSlots[1][2] === "character")
	{
		playSound("equip");
		dataArr["action"] = "newequip";
		if(itemSlots[0][2] !== itemSlots[1][2])
		{
			if(itemSlots[0][2] === "character")
			{
				dataArr["expected_itemtype2"] = itemSlots[0][1];
				dataArr["expected_itemtype"] = itemSlots[1][1];
				dataArr["itemnum2"] = itemSlots[0][0];
				dataArr["itemnum"] = itemSlots[1][0];
			}
		}
		webCall("inventory_new", dataArr, function(data)
		{
			updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
			$.each($(".characterRender"), function(key, val)
			{
				renderAvatarUpdate(val, userVars);
			});
			populateInventory();
			populateCharacterInventory();
			updateAllFields();
			renderAvatarUpdate();
		}, true);
	} else if(itemSlots[0][2] === "" && itemSlots[1][2] === "")
	{
		playSound("swap");
		dataArr["action"] = "newswap";
		webCall("inventory_new", dataArr, function(data)
		{
			updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
			populateInventory();
			if(document.getElementById("sellitems") && sellingData)
			{
				listSelling(sellingData);
			} else if(document.getElementById("privateIncoming") && document.getElementById("privateOutgoing") && privateData)
			{
				listPrivate(privateData);
			} else if(document.getElementById("itemDisplay") && marketData)
			{
				listMarket(marketData);
			}
			updateAllFields();
		}, true);
	}
}

function reloadStorageData(invData)
{
	var oldStorageSlotCount = parseInt(userVars["DFSTATS_df_storage_slots"]);
	updateIntoArr(flshToArr(invData, "DFSTATS_"), userVars);
	if(document.getElementById("buyStorageSlots") && document.getElementById("buyStorageSlots").querySelector("span"))
	{
		document.getElementById("buyStorageSlots").querySelector("span").textContent = "Price: $" + nf.format(getUpgradePrice());
	}
	populateInventory();
	var dataArr = {};
	dataArr["pagetime"] = userVars["pagetime"];
	dataArr["sc"] = userVars["sc"];
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];

	if(checkLSBool("general", "simpleMenus"))
	{
		userVars["DFSTATS_df_storage_slots"] = parseInt(userVars["DFSTATS_df_storage_slots"]);
		if(oldStorageSlotCount !== userVars["DFSTATS_df_storage_slots"] && oldStorageSlotCount % 40 === 0)
		{
			forwardButton = document.getElementById("storageForward").style.display = "block";
			slotNum.textContent = "(";

			var slotJumper = document.createElement("input");
			slotJumper.placeholder = storageTab + 1;
			slotJumper.type = "number";
			slotJumper.style.width = "16px";
			slotJumper.textContent = 1;

			slotNum.appendChild(slotJumper);
			slotNum.innerHTML += "/" + Math.ceil(userVars["DFSTATS_df_storage_slots"] / 40) + ")";
			slotNum.querySelector("input").addEventListener("change", storage_autoChangePage);
		}
	}
	if(userVars["DFSTATS_df_storage_slots"] >= 480)
	{
		if(document.getElementById("buyStorageSlots") && document.getElementById("buyStorageSlots").querySelector("span"))
		{
			document.getElementById("buyStorageSlots").parentNode.removeChild(document.getElementById("buyStorageSlots"));
		}
	}

	webCall("get_storage", dataArr, function(data)
	{
		storageBox = flshToArr(data);
		populateStorage();
		updateAllFields();
	}, true);
	// updateIntoArr
}

function reloadInventoryData()
{
	var dataArr = {};
	dataArr["sc"] = userVars["sc"];
	dataArr["templateID"] = userVars["template_ID"];
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];

	webCall("get_values", dataArr, function(data)
	{
		updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		populateInventory();
		updateAllFields();
		renderAvatarUpdate();
	});
}

function populateInventory()
{
	$("#inventory").find(".validSlot").empty();
	for(var i = 1; i <= userVars["DFSTATS_df_invslots"]; i++)
	{
		if(userVars["DFSTATS_df_inv" + i + "_type"] !== "")
		{
			setSlotData(userVars["DFSTATS_df_inv" + i + "_type"], userVars["DFSTATS_df_inv" + i + "_quantity"], $("#inventory").find("td[data-slot='" + i + "'].validSlot"));
		}
	}
}

function damageColor(current, max)
{
	var color = "12FF00";
	var damagePercent = current / max;
	if(damagePercent <= 0)
	{
		color = "D20303";
	} else if(damagePercent < 0.25)
	{
		color = "D20303";
	} else if(damagePercent < 0.5)
	{
		color = "FF4800";
	} else if(damagePercent < 0.75)
	{
		color = "FFCC00";
	}

	return color;
}

function storageChange(direction)
{
	if(direction === "forward")
	{
		for(var i = 1; i <= 40; i++)
		{
			var currentSlot = i + (40 * storageTab);
			$("div[data-slot='" + currentSlot + "']")[0].dataset.slot = i + (40 * (storageTab + 1));
		}
		storageTab++;
		if((storageTab + 1) * 40 >= userVars["DFSTATS_df_storage_slots"])
		{
			document.getElementById("storageForward").style.display = "none";
		} else
		{
			document.getElementById("storageForward").style.display = "block";
		}
		document.getElementById("storageBackward").style.display = "block";
	} else if(direction === "backward")
	{
		for(var i = 1; i <= 40; i++)
		{
			var currentSlot = i + (40 * storageTab);
			$("div[data-slot='" + currentSlot + "']")[0].dataset.slot = i + (40 * (storageTab - 1));
		}
		storageTab--;
		if(storageTab - 1 < 0)
		{
			document.getElementById("storageBackward").style.display = "none";
		} else
		{
			document.getElementById("storageBackward").style.display = "block";
		}
		document.getElementById("storageForward").style.display = "block";
	}
	slotNum.textContent = "(";

	var slotJumper = document.createElement("input");
	slotJumper.placeholder = storageTab + 1;
	slotJumper.type = "number";
	slotJumper.style.width = "16px";
	slotJumper.textContent = 1;

	slotNum.appendChild(slotJumper);
	slotNum.innerHTML += "/" + Math.ceil(userVars["DFSTATS_df_storage_slots"] / 40) + ")";

	slotNum.querySelector("input").addEventListener("change", storage_autoChangePage);

	populateStorage();
}

function createGlobal(callback, flashErl)
{
	var dataHolder = {};
	flashErl = flashErl.split('&');
	for(var i in flashErl)
	{
		var splt = flashErl[i].explode('=', 2);
		if(splt[0].indexOf("GLOBALDATA_") >= 0)
		{
			var arr = splt[0].explode("_", 3);
			var valid = false;
			var type;
			if(arr[1].indexOf("weapon") >= 0)
			{
				valid = true;
				if(arr[2] === "code")
				{
					type = "weapon";
				}
			} else if(arr[1].indexOf("armour") >= 0)
			{
				valid = true;
				if(arr[2] === "code")
				{
					type = "armour";
				}
			} else if(arr[1].indexOf("item") >= 0)
			{
				valid = true;
				if(arr[2] === "code")
				{
					type = "item";
				}
			}
			if(valid)
			{
				if(!dataHolder[arr[1]])
				{
					dataHolder[arr[1]] = {};
				}
				dataHolder[arr[1]]["itemcat"] = type;
				dataHolder[arr[1]][arr[2]] = splt[1];
			}
		}
	}
	var varHold;
	for(var i in dataHolder)
	{
		var dataBank = dataHolder[i];
		if(!globalData[dataBank["code"]])
		{
			switch(dataBank["itemcat"])
			{
				case "weapon":
					if(dataBank["str_req"])
					{
						dataBank["str_req"] = parseInt(dataBank["str_req"]);
					}
					if(dataBank["pro_req"])
					{
						dataBank["pro_req"] = parseInt(dataBank["pro_req"]);
					}
					if(dataBank["bullet_capacity"] > 0)
					{
						if(dataBank["ammo_type"] === "fuelammo")
						{
							dataBank["bullet_capacity"] = dataBank["bullet_capacity"] + " mL Tank";
						} else
						{
							dataBank["bullet_capacity"] = dataBank["bullet_capacity"] + " Round Capacity";
						}
					}
					if(dataBank["critical"])
					{
						dataBank["critical"] = parseFloat(dataBank["critical"]);
						if(dataBank["critical"] > 0 && dataBank["critical"] <= 0.1)
						{
							varHold = "Very Low";
						} else if(dataBank["critical"] > 0.1 && dataBank["critical"] <= 0.5)
						{
							varHold = "Low";
						} else if(dataBank["critical"] > 0.5 && dataBank["critical"] <= 1)
						{
							varHold = "Average";
						} else if(dataBank["critical"] > 1 && dataBank["critical"] <= 2)
						{
							varHold = "High";
						} else if(dataBank["critical"] > 2)
						{
							varHold = "Very High";
						} else
						{
							varHold = "Zero";
						}
						dataBank["critical"] = varHold + " Critical Chance";
					}
					if(dataBank["reload_time"])
					{
						dataBank["reload_time"] = parseFloat(dataBank["reload_time"]);
						if(dataBank["reload_time"] > 0 && dataBank["reload_time"] <= 120)
						{
							varHold = "Fast";
						} else if(dataBank["reload_time"] > 120 && dataBank["reload_time"] <= 180)
						{
							varHold = "Slow";
						} else if(dataBank["reload_time"] > 180)
						{
							varHold = "Very Slow";
						}
						dataBank["reload_time"] = varHold + " Reload Speed";
					}
					if(dataBank["accuracy_mod"])
					{
						dataBank["accuracy_mod"] = parseFloat(dataBank["accuracy_mod"]);
						if(dataBank["accuracy_mod"] >= -8 && dataBank["accuracy_mod"] < 0)
						{
							varHold = "High";
						} else if(dataBank["accuracy_mod"] === 0)
						{
							varHold = "Average";
						} else if(dataBank["accuracy_mod"] > 0 && dataBank["accuracy_mod"] <= 10)
						{
							varHold = "Low";
						} else if(dataBank["accuracy_mod"] > 10 && dataBank["accuracy_mod"] <= 20)
						{
							varHold = "Very Low";
						} else if(dataBank["accuracy_mod"] > 20)
						{
							varHold = "Ultra Low";
						} else
						{
							varHold = "Very High";
						}
						dataBank["accuracy_mod"] = varHold + " Accuracy";
					}
					if(dataBank["shot_time"])
					{
						dataBank["shot_time"] = parseFloat(dataBank["shot_time"]);
						if(dataBank["shot_time"] < 60 && dataBank["shot_time"] >= 40)
						{
							varHold = "Slow";
						} else if(dataBank["shot_time"] < 40 && dataBank["shot_time"] >= 30)
						{
							varHold = "Average";
						} else if(dataBank["shot_time"] < 30 && dataBank["shot_time"] >= 20)
						{
							varHold = "Fast";
						} else if(dataBank["shot_time"] < 20 && dataBank["shot_time"] >= 7)
						{
							varHold = "Very Fast";
						} else if(dataBank["shot_time"] < 7 && dataBank["shot_time"] >= 5)
						{
							varHold = "Super Fast";
						} else if(dataBank["shot_time"] < 5)
						{
							varHold = "F***ing Fast!";
						} else if(dataBank["shot_time"] > 60)
						{
							varHold = "Super Slow";
						} else
						{
							varHold = "Very Slow";
						}
						if(dataBank["melee"] === "0")
						{
							varHold += " Firing Speed";
						} else
						{
							varHold += " Attack Speed";
						}
						dataBank["shot_time"] = varHold;
					}
					if(dataBank["type"])
					{
						if(dataBank["type"] === "autopistol" || dataBank["type"] === "revolver")
						{
							dataBank["weptype"] = "Pistol";
							dataBank["wepPro"] = "pistol";
						} else if(dataBank["type"] === "rifle")
						{
							dataBank["weptype"] = "Rifle";
							dataBank["wepPro"] = "rifle";
						} else if(dataBank["type"] === "grenadelauncher")
						{
							dataBank["weptype"] = "Explosive";
							dataBank["wepPro"] = "explosive";
						} else if(dataBank["type"] === "shotgun")
						{
							dataBank["weptype"] = "Shotgun";
							dataBank["wepPro"] = "shotgun";
						} else if(dataBank["type"] === "machinegun" || dataBank["type"] === "minigun" || dataBank["type"] === "bigmachinegun" || dataBank["type"] === "submachinegun")
						{
							dataBank["weptype"] = "Machine Gun";
							dataBank["wepPro"] = "machinegun";
						} else
						{
							dataBank["weptype"] = "Melee";
							dataBank["wepPro"] = "melee";
						}
					}
					break;
				case "item":
					if(dataBank["boostdamagehours"])
					{
						dataBank["boostdamagehours"] = parseFloat(dataBank["boostdamagehours"]);
					}
					if(dataBank["boostexphours"])
					{
						dataBank["boostexphours"] = parseFloat(dataBank["boostexphours"]);
					}
					if(dataBank["boostspeedhours"])
					{
						dataBank["boostspeedhours"] = parseFloat(dataBank["boostspeedhours"]);
					}
					break;
			}
			if(dataBank["scrapvalue"])
			{
				dataBank["scrapvalue"] = parseInt(dataBank["scrapvalue"]);
			}

			if(dataBank["unique_parameters"])
			{
				var temp = dataBank["unique_parameters"].split(", ");
				var tempArr = {};

				for(var i = 0; i < temp.length; i++)
				{
					var uniSplt = temp[i].explode("=", 2);
					tempArr[uniSplt[0]] = uniSplt[1];
				}

				dataBank["unique_parameters"] = tempArr;
			}

			globalData[dataBank["code"]] = dataBank;
		}
	}
	var waitForSetup = setInterval(function()
	{
		if(hrV !== 0)
		{
			clearInterval(waitForSetup);
			var jsonLocation = "hotrods/hotrods_v" + hrV + "/HTML5/json/inventory/stackables.json";
			if(window.location.pathname.indexOf("/DF3D/") >= 0)
			{
				jsonLocation = "../" + jsonLocation;
			}
			$.getJSON(jsonLocation, function(data)
			{
				for(var j in data)
				{
					data[j]["itemcat"] = "ammo";
				}
				data["credits"] = {"name": "Credits", "itemcat": "credits"};
				data["brokenitem"] = {"name": "Broken Item; Contact Support", "itemcat": "broken"};
				updateIntoArr(data, globalData);
				if(callback)
				{
					callback();
				}
			});
		}
	}, 10);
}

function loadRecovery()
{
	pageLock = true;
	prompt.innerHTML = "<div style='text-align: center;'>Loading...</div>";
	prompt.parentNode.style.display = "block";

	var dataArr = [];
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];
	dataArr["sc"] = userVars["sc"];
	dataArr["action"] = "list";
	dataArr["gv"] = 42;

	webCall("hotrods/recover", dataArr, function(data)
	{
		var recoverData = flshToArr(data);
		var recoverables = {};
		for(var i in recoverData)
		{
			var parsedArr = i.explode('_', 2);
			if(recoverables[parsedArr[0]] === undefined)
			{
				recoverables[parsedArr[0]] = {};
			}
			recoverables[parsedArr[0]][parsedArr[1]] = recoverData[i];
		}
		recoverables = Object.keys(recoverables).map(function(e)
		{
			return recoverables[e];
		});
		recoverables.sort(function(a, b) {return a["time"] - b["time"]});

		var recoveryMenu = document.createElement("div");
		recoveryMenu.id = "recoverymenu";
		recoveryMenu.innerHTML = "<div class='menutitle'>Recover Dismantled or Scrapped Items</div>You only have 2 hours to recover an item. Only 5 scraps, 5 dismantles, and 5 discards are saved.";
		var recTable = document.createElement("div");
		recTable.classList.add("rt");

		// labels
		var rtLabelRow = document.createElement("div");
		rtLabelRow.classList.add("rtrow");

		var rtItemLabel = document.createElement("div");
		rtItemLabel.style.left = "10px";
		rtItemLabel.textContent = "Item";
		rtLabelRow.appendChild(rtItemLabel);

		var rtCostLabel = document.createElement("div");
		rtCostLabel.style.left = "200px";
		rtCostLabel.style.right = "200px";
		rtCostLabel.style.textAlign = "center";
		rtCostLabel.textContent = "Cost to Recover";
		rtLabelRow.appendChild(rtCostLabel);

		var rtLabelTime = document.createElement("div");
		rtLabelTime.style.right = "100px";
		rtLabelTime.textContent = "Time Remaining";
		rtLabelRow.appendChild(rtLabelTime);

		recTable.appendChild(rtLabelRow);

		for(var i = 0; i < recoverables.length; i++)
		{
			var recoverable = recoverables[i];
			recoverable["time"] = parseInt(recoverable["time"]);
			var recRow = document.createElement("div");
			recRow.classList.add("rtrow");
			recRow.classList.add("fakeItem");
			recRow.dataset.type = recoverable["item"];
			//recRow.dataset.quantity = recoverable["quantity"];

			var itemLookup = recoverable["item"].split('_')[0];
			var outputName = "";
			if(recoverable["item"].indexOf("_name") !== -1)
			{
				outputName = recoverable["item"].substr(recoverable["item"].indexOf("_name") + 5);
			} else
			{
				outputName = globalData[itemLookup]["name"];
			}
			var colName = document.createElement("div");
			colName.style.left = "10px";
			colName.style.color = "red";
			colName.textContent = outputName;
			//if(recoverable["quantity"] > 1)
			//{
			//	colName.textContent += " (" + recoverable["quantity"] + ")";
			//}
			recRow.appendChild(colName);

			var colCost = document.createElement("div");
			colCost.style.left = "200px";
			colCost.style.right = "200px";
			colCost.style.textAlign = "center";
			if(recoverable["type"] === "scrap" || recoverable["type"] === "discard")
			{
				colCost.textContent = "$" + nf.format(recoverable["cash_earned"]);
			} else if(recoverable["type"] === "dismantle")
			{
				colCost.textContent = nf.format(recoverable["metal_earned"]) + " Rare Metal Scrap";
			}
			recRow.appendChild(colCost);

			var colRemainingTime = document.createElement("div");
			colRemainingTime.style.right = "140px";
			colRemainingTime.dataset.endtime = recoverable["time"] + 7200;
			colRemainingTime.classList.add("timeKeeper");

			recRow.appendChild(colRemainingTime);

			var colBtn = document.createElement("button");
			colBtn.style.right = "10px";
			colBtn.style.position = "absolute";
			colBtn.textContent = "Recover";
			colBtn.dataset.act = recoverable["type"];
			colBtn.dataset.stime = recoverable["time"];

			if((recoverable["type"] === "scrap" || recoverable["type"] === "discard") && userVars["df_cash"] < recoverable["cost"])
			{
				colBtn.disabled = true;
			} else if(recoverable["type"] === "dismantle" && findInInventory("raremetalscrap") === false)
			{
				colBtn.disabled = true;
			} else
			{
				colBtn.onclick = recoverItemRequest;
			}

			recRow.appendChild(colBtn);

			recTable.appendChild(recRow);
		}

		recoveryMenu.appendChild(recTable);
		inventoryHolder.appendChild(recoveryMenu);

		var rmClose = document.createElement("button");
		rmClose.style.position = "absolute";
		rmClose.style.top = "6px";
		rmClose.style.right = "5px";
		rmClose.style.fontSize = "12pt";

		rmClose.textContent = "close";
		rmClose.onclick = function()
		{
			recoveryMenu.parentNode.removeChild(recoveryMenu);
		};
		recoveryMenu.appendChild(rmClose);

		prompt.parentNode.style.display = "none";
		pageLock = false;
	});
}

setInterval(function()
{
	var timers = document.querySelectorAll('.timeKeeper');
	for(var i = 0; i < timers.length; i++)
	{
		var timer = timers[i];
		var remainingSeconds = parseInt(timer.dataset.endtime) - Math.round(Date.now() / 1000);
		var totalMinutes = Math.floor(remainingSeconds / 60);
		var outHours = Math.floor(totalMinutes / 60);
		var outStr = "";
		if(outHours > 0)
		{
			outStr += outHours + ":";
		}
		if(totalMinutes % 60 < 10)
		{
			outStr += "0";
			if(totalMinutes % 60 <= 0)
			{
				outStr += "0";
			} else
			{
				outStr += totalMinutes % 60;
			}
		} else
		{
			outStr += totalMinutes % 60;
		}
		timer.textContent = outStr;
	}
}, 1000);

function findInInventory(itemToFind)
{
	for(var i = 1; i <= userVars["DFSTATS_df_invslots"]; i++)
	{
		if(userVars["DFSTATS_df_inv" + i + "_type"] === itemToFind)
		{
			return i;
		}
	}
	return false;
}

function recoverItemRequest(evt)
{
	if(pageLock)
	{
		return;
	}
	pageLock = true;
	prompt.innerHTML = "<div style='text-align: center;'>Recovering...</div>";
	prompt.parentNode.style.display = "block";
	var evtTarget = evt.currentTarget;
	evtTarget.disabled = true;
	var dataArr = {
		userID: userVars["userID"],
		password: userVars["password"],
		sc: userVars["sc"],
		action: "recover",
		item: evtTarget.parentNode.dataset.type,
		slaction: evtTarget.dataset.act,
		itime: evtTarget.dataset.stime
	};

	webCall("hotrods/recover", dataArr, function(data)
	{
		evtTarget.parentNode.parentNode.removeChild(evtTarget.parentNode);
		if(data === "error")
		{
			webCallError();
			return;
		}
		data = flshToArr(data, "DFSTATS_");
		updateIntoArr(data, userVars);
		var recoveryMenu = document.getElementById("recoverymenu");
		recoveryMenu.parentNode.removeChild(recoveryMenu);
		populateInventory();
		populateCharacterInventory();
		updateAllFields();
		for(var i = 1; i < userVars["DFSTATS_df_invslots"]; i++)
		{
			if(data["DFSTATS_df_inv" + i + "_type"])
			{
				break;
			}
		}
		var runs = 5;
		var flashItem = setInterval(function()
		{
			var elemToFlash = document.querySelector(".validSlot[data-slot='" + i + "']");
			elemToFlash.classList.toggle("pointOut");
			if(runs > 0)
			{
				runs--;
			} else
			{
				clearInterval(flashItem);
			}
		}, 500);
	}, true)
}

function initiateInventory(flashErl, callback)
{
	inventoryHolder = document.getElementById("inventoryholder");
	textAddonRef = document.getElementById("textAddon");
	prompt = document.getElementById("gamecontent");
	prompt.tabIndex = "0";
	var invC = document.getElementById("invController");
	infoBox = document.getElementById("infoBox");

	ctxMenuHolder = document.createElement("div")
	inventoryHolder.appendChild(ctxMenuHolder);

	window.addEventListener("mousemove", mouseTracker, false);

	inventoryHolder.addEventListener("mousemove", infoCard, false);
	infoBox.addEventListener("mousemove", clearCard, false);

	window.addEventListener("mousemove", hoverAction, false);
	window.addEventListener("keyup", hoverAction, false);
	window.addEventListener("keydown", hoverAction, false);
	window.addEventListener("keyup", unhoverAction, false);

	// Drag actions
	invC.addEventListener("mousedown", dragStart, false);
	document.addEventListener("mouseup", dragEnd, false);
	inventoryHolder.addEventListener("mousemove", drag, false);
	invC.addEventListener("touchstart", dragStart, false);
	infoBox.addEventListener("mousedown", dragStart, false);
	infoBox.addEventListener("touchstart", dragStart, false);
	document.addEventListener("touchend", dragEnd, false);
	inventoryHolder.addEventListener("touchmove", drag, false);

	window.addEventListener("mousedown", function(e)
	{
		if(ctxMenuHolder.style.display === "block" && e.target !== ctxMenuHolder && e.target.parentNode !== ctxMenuHolder)
		{
			ctxMenuHolder.style.display = "none";
		}
	});


	flshToArr(flashErl, "", setUserVars);

	var backpackLabel = document.createElement("div");
	backpackLabel.style.textAlign = "center";
	backpackLabel.textContent = "Backpack";
	backpackLabel.classList.add("opElem");
	backpackLabel.style.bottom = "90px";
	backpackLabel.style.width = "100%";

	inventoryHolder.appendChild(backpackLabel);

	document.getElementById("inventory").innerHTML = "";
	for(var x = 0; x < 2; x++)
	{
		var invHalf = document.createElement("tr");
		for(var y = 0; y < userVars["DFSTATS_df_invslots"] / 2; y++)
		{
			var slot = document.createElement("td");
			slot.dataset.slot = ((x + 1) + (y * 2));
			slot.classList.add("validSlot");
			invHalf.appendChild(slot);
		}
		document.getElementById("inventory").appendChild(invHalf);
	}

	var dataArr = [];
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];
	dataArr["sc"] = userVars["sc"];
	dataArr["action"] = "list";
	dataArr["gv"] = 42;

	createGlobal(function()
	{
		if(typeof (callback) === "undefined")
		{
			callback = false;
		}

		if(callback)
		{
			callback();
		}

		webCall("hotrods/item_lock", dataArr, function(data)
		{
			lockedSlots = data.split(',');

			var lockSlotButton = document.createElement("button");
			lockSlotButton.classList.add("opElem");
			lockSlotButton.style.left = "20px";
			lockSlotButton.style.bottom = "86px";
			lockSlotButton.textContent = "SlotLock?";

			lockSlotButton.addEventListener("click", lockSlotPrompt);

			inventoryHolder.appendChild(lockSlotButton);
			doLockedElems();

		}, true);

		pageLock = false;
		populateInventory();
	}, flashErl);
	fakeGrabbedItem = document.getElementById("fakeGrabbedItem");

	if(window.location.pathname.indexOf("/DF3D/") === -1 && window.location.search.indexOf("page=31") === -1)
	{
		var setBtn = document.createElement("div");
		setBtn.id = "settingsButton";
		setBtn.addEventListener("click", loadSettings);
		inventoryHolder.appendChild(setBtn);
		var frm = document.createElement("iframe");
		frm.id = "settingsBox";
		inventoryHolder.parentNode.appendChild(frm);
		inventoryHolder.parentNode.style.position = "relative";
	} else
	{
		loadStatusData();
	}
}

function MenuItemPopulate(itemElem)
{
	var itemType = currentItem.dataset.type.split('_');
	var itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];

	var itemName = document.createElement("div");
	itemName.style.textAlign = "center";

	if(globalData[itemType[0]]["itemcat"] === "weapon")
	{
		var n = currentItem.dataset.type.indexOf("_stats") + 6;
		n = currentItem.dataset.type.substring(n, n + 3);
		if(mcData[n] && mcData[n][0] !== "")
		{
			itemName.style.color = mcData[n][0];
			itemElem.style.borderColor = mcData[n][0];
		}
	} else if(globalData[itemType[0]]["itemcat"] === "armour")
	{
		var n = currentItem.dataset.type.indexOf("_stats") + 6;
		n = currentItem.dataset.type.substring(n, n + 4);
		if(mcData[n] && mcData[n][0] !== "")
		{
			itemName.style.color = mcData[n][0];
			itemElem.style.borderColor = mcData[n][0];
		}
	}


	if(itemData[1].indexOf("_name") >= 0)
	{
		itemName.innerHTML += itemData[1].substring(itemData[1].indexOf("_name") + 5);
	} else
	{
		itemName.innerHTML += globalData[itemType[0]]["name"];
	}
	itemElem.appendChild(itemName);

	var button1 = document.createElement("button");
	button1.textContent = "Scrap";
	button1.style.width = "100%";

	button1.onclick = function()
	{
		var scrapPrice = scrapValue(currentItem.dataset.type, currentItem.dataset.quantity);
		extraData = [itemData, scrapPrice];
		extraData["action"] = "scrap";
		prompt.innerHTML = "Are you sure you want to scrap the ";
		if(itemData[1].indexOf("_name") >= 0)
		{
			prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
		} else
		{
			prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
		}
		prompt.innerHTML += " for $" + nf.format(scrapPrice) + "?";
		prompt.classList.add("warning");



		var noButton = document.createElement("button");
		noButton.style.position = "absolute";
		noButton.style.top = "72px";
		noButton.addEventListener("click", function()
		{
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
		yesButton.addEventListener("click", function()
		{
			yesButton.disabled = true;
			cleanPlacementMessage();
			prompt.classList.remove("warning");
			prompt.classList.remove("redhighlight");
			scrapItem(extraData);
		});

		prompt.appendChild(yesButton);
		prompt.onkeydown = function(e)
		{
			if(e.keyCode === 13)
			{
				prompt.onkeydown = null;
				yesButton.click();
			}
		};

		prompt.appendChild(noButton);
		prompt.parentNode.style.display = "block";

		prompt.focus();
		ctxMenuHolder.style.display = "none";
	};
	itemElem.appendChild(button1);

	if(currentItem.parentNode.parentNode.parentNode.id === "inventory")
		if(globalData[itemType[0]]["itemcat"] === "weapon" && globalData[itemType[0]]["pro_req"] >= 120 || globalData[itemType[0]]["itemcat"] === "armour" && globalData[itemType[0]]["shop_level"] - 5 >= 75 || globalData[itemType[0]]["implant"] === "1" && globalData[itemType]["holidayitem"] !== "1")
		{
			var button2 = document.createElement("button");
			button2.textContent = "Dismantle";
			button2.style.width = "100%";
			button2.onclick = function()
			{
				var scrapPrice = scrapValue(currentItem.dataset.type, currentItem.dataset.quantity);
				extraData = [itemData, scrapPrice];
				extraData["action"] = "dismantle";

				prompt.innerHTML = "Are you sure you want to dismantle the ";
				if(itemData[1].indexOf("_name") >= 0)
				{
					prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
				} else
				{
					prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
				}
				prompt.innerHTML += " for <span style='color: #12FF00;'>1 Rare Metal Scrap</span>?";
				prompt.classList.add("warning");



				var noButton = document.createElement("button");
				noButton.style.position = "absolute";
				noButton.style.top = "72px";
				noButton.addEventListener("click", function()
				{
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
				yesButton.addEventListener("click", function()
				{
					yesButton.disabled = true;
					cleanPlacementMessage();
					prompt.classList.remove("warning");
					prompt.classList.remove("redhighlight");
					scrapItem(extraData);
				});

				prompt.appendChild(yesButton);
				prompt.onkeydown = function(e)
				{
					if(e.keyCode === 13)
					{
						prompt.onkeydown = null;
						yesButton.click();
					}
				};

				prompt.appendChild(noButton);
				prompt.parentNode.style.display = "block";

				prompt.focus();
				ctxMenuHolder.style.display = "none";
			};
			itemElem.appendChild(button2);
		}
}

function openContextMenu(e)
{
	if(e.target.classList.contains("item") && !e.target.parentNode.classList.contains("locked"))
	{
		e.preventDefault();
		currentItem = e.target;

		ctxMenuHolder.innerHTML = "";
		ctxMenuHolder.style.display = "block";
		ctxMenuHolder.style.backgroundColor = "black";
		ctxMenuHolder.style.border = "white solid 1px";
		ctxMenuHolder.style.zIndex = "20";
		ctxMenuHolder.style.textAlign = "left";

		ctxMenuHolder.style.position = "absolute";

		ctxMenuHolder.style.width = "140px";

		MenuItemPopulate(ctxMenuHolder);

		ctxMenuHolder.style.visibility = "hidden";
		ctxMenuHolder.style.display = "block";

		var invHoldOffsets = inventoryHolder.getBoundingClientRect();

		if(mousePos[1] + ctxMenuHolder.offsetHeight > invHoldOffsets.bottom)
		{
			ctxMenuHolder.style.top = (mousePos[1] - ctxMenuHolder.offsetHeight - invHoldOffsets.top) + "px";
		} else
		{
			ctxMenuHolder.style.top = (mousePos[1] - invHoldOffsets.top) + "px";
		}

		if(mousePos[0] + ctxMenuHolder.offsetWidth > invHoldOffsets.right)
		{
			ctxMenuHolder.style.left = (inventoryHolder.offsetWidth - 40 - ctxMenuHolder.offsetWidth) + "px";
		} else
		{
			ctxMenuHolder.style.left = (mousePos[0] - invHoldOffsets.left) + "px";
		}

		ctxMenuHolder.style.visibility = "visible";
	} else
	{
		ctxMenuHolder.style.display = "none";
	}
}

function doLockedElems()
{
	for(var i = 0; i < lockedSlots.length; i++)
	{
		var workingSlot = parseInt(lockedSlots[i]);
		if(workingSlot >= 1000)
		{
			workingSlot -= 1000;

			var affectedElem = $("[data-slottype='implant'].validSlot[data-slot='" + workingSlot + "']").not("#storage .validSlot");
			affectedElem.addClass("locked");
		} else
		{
			var affectedElem = $(".validSlot[data-slot='" + workingSlot + "']").not("#storage .validSlot").not("[data-slottype='implant']");
			affectedElem.addClass("locked");
		}
	}
}

function loadStatusData()
{
	var armour = userVars["DFSTATS_df_armourtype"].split('_');
	var sideOutput = "";
	var health = "Healthy";
	var healthColor = "12FF00";
	var hp = parseInt(userVars["DFSTATS_df_hpcurrent"]) / parseInt(userVars["DFSTATS_df_hpmax"]);
	if(hp <= 0)
	{
		health = "DEAD";
		healthColor = "D20303";
	} else if(hp < 0.25)
	{
		health = "Critical";
		healthColor = "D20303";
	} else if(hp < 0.5)
	{
		health = "Serious";
		healthColor = "FF4800";
	} else if(hp < 0.75)
	{
		health = "Injured";
		healthColor = "FFCC00";
	}
	health += "<br />" + userVars["DFSTATS_df_hpcurrent"] + " / " + userVars["DFSTATS_df_hpmax"];
	if(checkLSBool("general", "statusPercents"))
	{
		health += "<br />(" + Math.round(hp * 100) + "%)";
	}

	sideOutput += "<div><img src='../hotrods/hotrods_v" + hrV + "/HTML5/images/heart.png'>";
	sideOutput += "<div class='playerHealth' style='top: 3px; width: 65px; text-align: center; font-weight: 100; color: #" + healthColor + ";'>" + health + "</div></div>";

	health = "Nourished";
	healthColor = "12FF00";
	hp = parseInt(userVars["DFSTATS_df_hungerhp"]);
	if(hp <= 0)
	{
		health = "Dying";
		healthColor = "D20303";
	} else if(hp < 25)
	{
		health = "Starving";
		healthColor = "D20303";
	} else if(hp < 50)
	{
		health = "Hungry";
		healthColor = "FF4800";
	} else if(hp < 75)
	{
		health = "Fine";
		healthColor = "FFCC00";
	}
	health += "<br />" + userVars["DFSTATS_df_hungerhp"] + " / 100";
	if(checkLSBool("general", "statusPercents"))
	{
		health += "<br />(" + Math.round(hp) + "%)";
	}

	sideOutput += "<div><img src='../hotrods/hotrods_v" + hrV + "/HTML5/images/yummytummy.png'>";
	sideOutput += "<div class='playerNourishment' style='top: 3px; width: 65px; text-align: center; font-weight: 100; color: #" + healthColor + ";'>" + health + "</div></div>";

	sideOutput += "<div id='statusBoxArmour'>";
	sideOutput += "<img src='";
	if(armour[0] !== "")
	{
		sideOutput += "https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + armour[0] + ".png' width='40' />";
		health = "Normal";
		healthColor = "12FF00";
		hp = parseInt(userVars["DFSTATS_df_armourhp"]) / parseInt(userVars["DFSTATS_df_armourhpmax"]);
		if(hp <= 0)
		{
			health = "Broken";
			healthColor = "D20303";
		} else if(hp < 0.4)
		{
			health = "Damaged";
			healthColor = "FF4800";
		} else if(hp < 0.75)
		{
			health = "Scratched";
			healthColor = "FFCC00";
		}
		health += "<br />" + userVars["DFSTATS_df_armourhp"] + " / " + userVars["DFSTATS_df_armourhpmax"];
		if(checkLSBool("general", "statusPercents"))
		{
			health += "<br />(" + Math.round(hp * 100) + "%)";
		}

		sideOutput += "<div style='top: 3px; width: 65px; text-align: center; font-weight: 100; color: #" + healthColor + ";'>" + health + "</div>";
	} else
	{
		sideOutput += "' width='40' />";
		sideOutput += "<div style='width: 65px; text-align: center; font-weight: 100;'></div>";
	}
	sideOutput += "</div>";

	var sidebarElem = document.createElement("div");
	sidebarElem.id = "statusBox";
	sidebarElem.innerHTML = sideOutput;

	inventoryHolder.appendChild(sidebarElem);
}

function initiateYard()
{
	var invC = document.getElementById("invController");
	invC.addEventListener("contextmenu", openContextMenu, false);
	initiateCharacterInventory();
	document.getElementById("getRich").addEventListener("click", function()
	{
		location.href = "index.php?page=29";
	});
	var recoveryBtn = document.createElement("button");
	recoveryBtn.textContent = "Recover Items";
	recoveryBtn.style.position = "absolute";
	recoveryBtn.style.left = "150px";
	recoveryBtn.style.bottom = "86px";
	recoveryBtn.onclick = loadRecovery;
	inventoryHolder.appendChild(recoveryBtn);
}

function lockSlotPrompt()
{
	pageLock = true;
	prompt.style.height = "125px";
	prompt.innerHTML = "<span>SlotLock will protect items in your locked slots from accidental scrapping and disposal! Items can still be moved into and out of locked slots.</span>";

	var noButton = document.createElement("button");

	noButton.style.position = "absolute";
	noButton.style.bottom = "12px";
	noButton.addEventListener("click", function()
	{
		prompt.parentNode.style.display = "none";
		prompt.innerHTML = "";
		prompt.style.height = "";
		pageLock = false;
	});
	noButton.textContent = "close";
	noButton.style.right = "12px";
	prompt.onkeydown = function(e)
	{
		if(e.keyCode === 13)
		{
			noButton.click();
		}
	};

	var explainButton = document.createElement("button");
	explainButton.style.position = "absolute";
	explainButton.style.left = "12px";
	explainButton.style.bottom = "12px";
	explainButton.textContent = "how to use?";
	explainButton.addEventListener("click", function()
	{
		prompt.querySelector("span").innerHTML = "Simply hold <span style='color: #ff0000;'>[ctrl]</span> while clicking an inventory slot you wish to lock! To unlock, just hold <span style='color: #ff0000;'>[ctrl]</span> and click the locked inventory slot.";
		explainButton.addEventListener("click", lockSlotPrompt);
		explainButton.textContent = "back";
	});

	prompt.appendChild(noButton);
	prompt.appendChild(explainButton);
	prompt.parentNode.style.display = "block";
	prompt.focus();
}

function enhanceValue(itemType)
{
	var itemData = itemType.trim().split('_');
	var tlevel = 0;
	var amount = false;
	if(globalData[itemData[0]]["enhancecost"])
	{
		amount = globalData[itemData[0]]["enhancecost"];
	} else
	{
		switch(globalData[itemData[0]]["itemcat"])
		{
			case "weapon":
				tlevel = globalData[itemData[0]]["pro_req"];
				amount = (tlevel * 500) + 1000;
				break;
			case "armour":
				tlevel = globalData[itemData[0]]["find_level"];
				amount = (tlevel * 1000) + 2000;
				break;
		}
	}

	return amount;
}

function dyeValue(itemType)
{
	var itemData = itemType.trim().split('_');
	var tlevel = 0;
	var amount = false;
	switch(globalData[itemData[0]]["itemcat"])
	{
		case "armour":
			tlevel = globalData[itemData[0]]["find_level"];
			amount = (tlevel * 1000) + 2000;
			break;
		case "item":
			if(globalData[itemData[0]]["othercolours"] && globalData[itemData[0]]["othercolours"] !== "" && globalData[itemData[0]]["clothingtype"] && globalData[itemData[0]]["clothtype"] !== "")
			{
				tlevel = parseInt(globalData[itemData[0]]["level"]);
				amount = (tlevel * 500) + 1000;
			}
			break;
	}
	return amount;
}

function scrapValue(itemType, quantity)
{
	var itemData = itemType.trim().split('_');
	var tlevel = 0;
	var amount = false;
	if(typeof globalData[itemData[0]]["scrapvalue"] !== "undefined" && globalData[itemData[0]]["scrapvalue"] > 0)
	{
		amount = globalData[itemData[0]]["scrapvalue"];
		if(itemType.indexOf("_stats") >= 0)
		{
			amount *= 2;
		}
	} else
	{
		switch(globalData[itemData[0]]["itemcat"])
		{
			case "weapon":
				tlevel = globalData[itemData[0]]["pro_req"];
				if(globalData[itemData[0]]["melee"] !== "0")
				{
					amount = Math.round((tlevel * tlevel * Math.round((tlevel / 40) + 1)) / 2) + 50;
				} else
				{
					amount = (tlevel * tlevel * Math.round((tlevel / 40) + 1)) + 50;
				}
				if(itemType.indexOf("_stats") >= 0)
				{
					amount *= 2;
				}
				break;
			case "armour":
				tlevel = globalData[itemData[0]]["shop_level"] * 2;
				amount = (tlevel * tlevel * Math.round((tlevel / 40) + 1)) + 250;
				if(itemType.indexOf("_stats") >= 0)
				{
					amount *= 2;
				}
				break;
			case "ammo":
				amount = Math.round(globalData[itemData[0]]["amountper"] * quantity * 2);
				break;
			case "credits":
				amount = Math.round(100 * quantity);
				break;
			case "item":
				tlevel = parseInt(globalData[itemData[0]]["level"]);
				if(globalData[itemData[0]]["implant"] === "1")
				{
					amount = (Math.round((tlevel * tlevel * Math.round((tlevel / 20) + 1)) / 2) + 50) * 4;
				} else if(globalData[itemData[0]]["clothingtype"] && globalData[itemData[0]]["clothtype"] !== "")
				{
					amount = Math.round((tlevel * tlevel * Math.round((tlevel / 20) + 1)) / 2) + 50;
				} else
				{
					amount = Math.round((tlevel * tlevel * Math.round((tlevel / 20) + 1)) / 20) + 5;
				}
				break;
		}
	}
	return amount;
}

function scrapAmount(itemType, quantity)
{
	var itemData = itemType.trim().split('_');
	var tlevel = 0;
	var amount = false;
	switch(globalData[itemData[0]]["itemcat"])
	{
		case "weapon":
			tlevel = globalData[itemData[0]]["pro_req"];
			if(globalData[itemData[0]]["melee"] !== "0")
			{
				amount = Math.round((tlevel * tlevel) / 2) + 50;
				break;
			} else
			{
				amount = (tlevel * tlevel) + 50;
				break;
			}
			if(itemType.indexOf("_stats") >= 0)
			{
				amount *= 2;
			}
			break;
		case "armour":
			tlevel = globalData[itemData[0]]["shop_level"];
			amount = (tlevel * tlevel) + 250;
			if(itemType.indexOf("_stats") >= 0)
			{
				amount *= 2;
			}
			break;
		case "ammo":
			amount = Math.round(globalData[itemData[0]]["amountper"] * quantity);
			break;
		case "item":
			tlevel = parseInt(globalData[itemData[0]]["level"]);
			amount = Math.round(tlevel / 2);
			break;
	}
	if(amount < 1)
	{
		amount = 1;
	}
	return amount;
}

function initiateCrafting()
{
	var craftHolder = document.getElementById("crafting");
	var craftCategories = [];
	var types = ["name", "price", "canCraft"];
	craftHolder.innerHTML = "<div style='display: inline-block; margin-left: 2px;'>Craftable Item</div>";
	craftHolder.innerHTML += "<div style='display: inline-block; margin-left: 139px;'>Cost</div>";
	var recipes = document.createElement("div");
	recipes.id = "recipes";
	for(var i = 0; i < userVars["DFSTATS_total_blueprints"]; i++)
	{
		if(typeof userVars["DFSTATS_blueprints_" + i + "_craftItem"] === "undefined" || typeof globalData[userVars["DFSTATS_blueprints_" + i + "_craftItem"]] === "undefined")
		{
			continue;
		}
		globalData[userVars["DFSTATS_blueprints_" + i + "_craftItem"]]["requiredItemsDesc"] = userVars["DFSTATS_blueprints_" + i + "_requiredItemsDesc"];
		globalData[userVars["DFSTATS_blueprints_" + i + "_craftItem"]]["craftPrice"] = "$" + nf.format(userVars["DFSTATS_blueprints_" + i + "_price"]);
		if(craftCategories.indexOf(globalData[userVars["DFSTATS_blueprints_" + i + "_craftItem"]]["itemcat"]) === -1)
		{
			craftCategories.push(globalData[userVars["DFSTATS_blueprints_" + i + "_craftItem"]]["itemcat"]);
		}
		var row = document.createElement("div");
		row.classList.add("fakeItem");
		row.dataset.type = userVars["DFSTATS_blueprints_" + i + "_craftItem"];
		if(globalData[userVars["DFSTATS_blueprints_" + i + "_craftItem"]]["hp"] !== "")
		{
			row.dataset.quantity = globalData[userVars["DFSTATS_blueprints_" + i + "_craftItem"]]["hp"];
		}
		for(var o = 0; o < 3; o++)
		{
			var column;
			switch(types[o])
			{
				case "name":
					column = document.createElement("div");
					column.textContent = userVars["DFSTATS_blueprints_" + i + "_craftItemName"];
					column.style.width = "250px";
					break;
				case "price":
					column = document.createElement("div");
					column.textContent = "$" + nf.format(userVars["DFSTATS_blueprints_" + i + "_price"]);
					column.style.width = "125px";
					column.style.color = "#FFFF00";
					break;
				case "canCraft":
					column = document.createElement("button");
					column.textContent = "craft";
					// /DF3D/DF3D_Crafting.php
					if(userVars["DFSTATS_blueprints_" + i + "_canCraft"] > 0)
					{
						column.disabled = false;
						column.addEventListener("click", inventoryAction);
						column.dataset.action = "craft";
					} else
					{
						column.disabled = true;
					}
					break;
			}
			column.classList.add("listItem");
			row.appendChild(column);
		}
		recipes.appendChild(row);
	}
	craftHolder.appendChild(recipes);

	var craftSearch = document.createElement("input");
	craftSearch.classList.add("opElem");
	craftSearch.style.top = "40px";
	craftSearch.style.right = "50px";
	craftSearch.placeholder = "Search...";
	craftSearch.style.color = "yellow";

	inventoryHolder.appendChild(craftSearch);

	var craftCategory = document.createElement("div");
	craftCategory.classList.add("opElem");
	craftCategory.style.top = "370px";
	craftCategory.style.left = "186px";
	craftCategory.style.right = "48px";
	craftCategory.style.display = "flex";
	craftCategory.style.justifyContent = "space-evenly";
	craftCategory.style.alignItems = "stretch";
	craftCategory.style.alignContent = "stretch";
	craftCategory.style.flexWrap = "wrap";

	for(var i of craftCategories)
	{
		var category = document.createElement("button");
		category.style.display = "inline-block";
		category.style.flexGrow = "1";
		category.style.flexBasis = "0";
		category.style.backgroundColor = "rgba(0, 0, 0, 0.6)";
		category.style.border = "1px solid #990000";
		category.style.height = "20px";
		category.dataset.type = i;
		category.textContent = i[0].toUpperCase() + i.slice(1);

		craftCategory.appendChild(category);
	}



	inventoryHolder.appendChild(craftCategory);

	var craftElems = recipes.childNodes;
	var searchTerm = "";
	var activeCat = "";

	craftSearch.oninput = function(e)
	{
		searchTerm = e.currentTarget.value.toLowerCase();
		for(var i = 0; i < craftElems.length; i++)
		{
			if((searchTerm === "" || craftElems[i].childNodes[0].textContent.toLowerCase().indexOf(searchTerm) !== -1) && (activeCat === "" || globalData[craftElems[i].dataset.type]["itemcat"] === activeCat))
			{
				craftElems[i].style.display = "block";
			} else
			{
				craftElems[i].style.display = "none";
			}
		}
	};

	craftCategory.onclick = function(e)
	{
		if(e.target.dataset.type)
		{
			for(var i = 0; i < craftCategory.childNodes.length; i++)
			{
				craftCategory.childNodes[i].classList.remove("disabledElem");
			}
			if(e.target.dataset.type === activeCat)
			{
				activeCat = "";
			} else
			{
				activeCat = e.target.dataset.type;
				e.target.classList.add("disabledElem");
			}
			for(var i = 0; i < craftElems.length; i++)
			{
				if((searchTerm === "" || craftElems[i].childNodes[0].textContent.toLowerCase().indexOf(searchTerm) !== -1) && (activeCat === "" || globalData[craftElems[i].dataset.type]["itemcat"] === activeCat))
				{
					craftElems[i].style.display = "block";
				} else
				{
					craftElems[i].style.display = "none";
				}
			}
		}
	};

	/*var charElem = document.getElementById("character").querySelector("div");
	charElem.innerHTML = "";
	charElem.textContent = "";
	var slotTypes = [["armour", 20, 340, 34]];

	for(var i in slotTypes)
	{
		var holder = document.createElement("div");
		holder.classList.add("opElem");
		holder.dataset.slottype = slotTypes[i][0];
		holder.dataset.slot = slotTypes[i][3];
		holder.style.left = slotTypes[i][1] + "px";
		holder.style.top = slotTypes[i][2] + "px";
		holder.classList.add("validSlot");
		charElem.appendChild(holder);
		var slotText = document.createElement("div");
		var actualText = slotTypes[i][0].charAt(0).toUpperCase() + slotTypes[i][0].slice(1);
		slotText.classList.add("opElem");
		slotText.classList.add("cashHack");
		slotText.classList.add("credits");
		slotText.dataset.cash = actualText;
		slotText.style.left = slotTypes[i][1] - 10 + "px";
		slotText.style.top = slotTypes[i][2] + 46 + "px";
		slotText.style.width = "64px";
		slotText.textContent = actualText;
		charElem.appendChild(slotText);
	}*/
	populateCharacterInventory();

}

function searchPassConditions()
{
	var args = arguments;
	for(var i = 1; i <= args.length - 1; i++)
	{
		if(args[i].toLowerCase().indexOf(args[0]) !== -1)
		{
			return true;
		}
	}
	return false;
}

function searchSimpleStorageList(e)
{
	var searchTerm = e.currentTarget.value;
	var allStorageItems = document.getElementById("speedContainer").querySelectorAll(".fakeItem");
	var currentlyHiddenItems = 0;
	for(var item of allStorageItems)
	{
		var itemData = item.dataset.type.split('_');
		var matchesSearch = false;
		if(searchPassConditions(searchTerm, item.dataset.type, globalData[itemData[0]]["name"]))
		{
			matchesSearch = true;
		}
		if(matchesSearch)
		{
			item.style.display = "";
		} else
		{
			currentlyHiddenItems++;
			item.style.display = "none";
		}
	}

	if(currentlyHiddenItems === validItems)
	{
		document.getElementById("speedContainer").querySelector(".profitList").style.display = "";
	} else
	{
		document.getElementById("speedContainer").querySelector(".profitList").style.display = "none";
	}
}

function initiateStorage()
{
	if(checkLSBool("general", "simpleMenus"))
	{
		document.getElementById("storage").innerHTML = "<div id='speedContainer' class='fakeSlot' data-action='simpleStore'></div>";

		if(userVars["DFSTATS_df_storage_slots"] < 480)
		{
			var upgradeButton = document.createElement("button");
			upgradeButton.textContent = "buy 5 more slots";
			upgradeButton.style.fontSize = "16px";
			upgradeButton.dataset.action = "storageUpgrade";

			var addBuy = document.createElement("div");
			addBuy.id = "buyStorageSlots";
			addBuy.classList.add("opElem");
			addBuy.style.width = "100%";
			addBuy.style.top = "46px";
			addBuy.style.color = "#E6CC4D";
			addBuy.appendChild(upgradeButton);
			addBuy.innerHTML += "<br /><span>Price: $" + nf.format(getUpgradePrice()) + "</span>";
			addBuy.querySelector("button").addEventListener("click", inventoryAction);
			inventoryHolder.appendChild(addBuy);
		}

		var storageSearchBox = document.createElement("input");
		storageSearchBox.id = "storageSearchBox";
		storageSearchBox.oninput = searchSimpleStorageList;
		storageSearchBox.placeholder = "Search...";
		inventoryHolder.appendChild(storageSearchBox);

	} else
	{
		document.getElementById("storage").innerHTML = "<div id='normalContainer'></div>";
		for(var y = 0; y < 5; y++)
		{
			for(var x = 0; x < 8; x++)
			{
				var slotId = ((y + 1) + (x * 5));
				var slot = document.createElement("div");
				slot.classList.add("slot");
				//slot.style.left = (x) * 68;
				//slot.style.top = (y) * 60;
				slot.dataset.slot = slotId;
				if(x % 2 !== 0)
				{
					slot.classList.add("reverse");
				}
				if(slotId <= userVars["DFSTATS_df_storage_slots"])
				{
					slot.classList.add("validSlot");

				}
				document.getElementById("storage").querySelector("#normalContainer").appendChild(slot);
			}

		}
		if(userVars["DFSTATS_df_storage_slots"] < 480)
		{
			var upgradeButton = document.createElement("button");
			upgradeButton.textContent = "buy 5 more slots";
			upgradeButton.style.fontSize = "16px";
			upgradeButton.dataset.action = "storageUpgrade";

			var addBuy = document.createElement("div");
			addBuy.id = "buyStorageSlots";
			addBuy.classList.add("opElem");
			addBuy.style.width = "100%";
			addBuy.style.top = "46px";
			addBuy.style.color = "#E6CC4D";
			addBuy.appendChild(upgradeButton);
			addBuy.innerHTML += "<br /><span>Price: $" + nf.format(getUpgradePrice()) + "</span>";
			addBuy.querySelector("button").addEventListener("click", inventoryAction);
			inventoryHolder.appendChild(addBuy);
		}

		slotNum = document.createElement("div");
		slotNum.classList.add("opElem");
		slotNum.style.right = "80px";
		slotNum.style.top = "70px";
		slotNum.textContent = "(";

		var slotJumper = document.createElement("input");
		slotJumper.placeholder = storageTab + 1;
		slotJumper.type = "number";
		slotJumper.style.width = "16px";
		slotJumper.textContent = 1;

		slotNum.appendChild(slotJumper);
		slotNum.innerHTML += "/" + Math.ceil(userVars["DFSTATS_df_storage_slots"] / 40) + ")";

		slotNum.querySelector("input").addEventListener("change", storage_autoChangePage);

		inventoryHolder.appendChild(slotNum);

		if((storageTab + 1) * 40 >= userVars["DFSTATS_df_storage_slots"])
		{
			document.getElementById("storageForward").style.display = "none";
		} else
		{
			document.getElementById("storageForward").style.display = "block";
		}


	}

	var dataArr = {};
	dataArr["pagetime"] = userVars["pagetime"];
	dataArr["sc"] = userVars["sc"];
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];

	webCall("get_storage", dataArr, function(data)
	{
		storageBox = flshToArr(data);
		populateStorage();
	}, true);
}

function storage_autoChangePage(e)
{
	var targetPage = e.currentTarget.value - 1;

	if(targetPage + 1 <= Math.ceil(userVars["DFSTATS_df_storage_slots"] / 40) && targetPage >= 0 && storageTab !== targetPage)
	{
		for(var i = 1; i <= 40; i++)
		{
			var currentSlot = i + (40 * storageTab);
			$("div[data-slot='" + currentSlot + "']")[0].dataset.slot = i + (40 * (targetPage));
		}

		if((storageTab + 1) * 40 >= userVars["DFSTATS_df_storage_slots"])
		{
			document.getElementById("storageForward").style.display = "none";
		} else
		{
			document.getElementById("storageForward").style.display = "block";
		}

		if(storageTab - 1 < 0)
		{
			document.getElementById("storageBackward").style.display = "none";
		} else
		{
			document.getElementById("storageBackward").style.display = "block";
		}


		console.log(targetPage);
		e.currentTarget.placeholder = e.currentTarget.value;
		storageTab = targetPage;
		populateStorage();
	}
	e.currentTarget.value = "";
}

function initiateInventoryEquipment()
{

	var implantElem = document.getElementById("implants");
	implantElem.innerHTML = "";
	implantElem.textContent = "";
	var impCount = 0;
	var invSection;
	for(var y = 0; y < userVars["DFSTATS_df_implantslots"]; y++)
	{
		if(impCount === 0)
		{
			invSection = document.createElement("tr");
		}
		var slot = document.createElement("td");
		slot.dataset.slot = y + 1;
		slot.dataset.slottype = "implant";
		slot.classList.add("validSlot");
		invSection.appendChild(slot);

		if(impCount === 3)
		{
			implantElem.appendChild(invSection);
			impCount = 0;
		} else
		{
			impCount++;
		}
		if(impCount < 3)
		{
			implantElem.appendChild(invSection);
		}
	}
	populateImplants();

	var hideArmours = document.createElement("button");
	hideArmours.classList.add("opElem");
	hideArmours.style.left = "400px";
	hideArmours.style.top = "205px";
	if(userVars["DFSTATS_df_hidearmour"] === "0")
	{
		hideArmours.textContent = "Show Armour [X]";
		hideArmours.dataset.hide = '1';
	} else
	{
		hideArmours.textContent = "Show Armour [ ]";
		hideArmours.dataset.hide = '0';
	}

	hideArmours.addEventListener("click", function(e)
	{
		var target = e.currentTarget;

		var hideData = {
			'action': "setarmour",
			'userID': userVars["userID"],
			'password': userVars["password"],
			'hide': target.dataset.hide
		};
		webCall("DF3D/DF3D_PlayerSettings", hideData, function(data)
		{
			updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
			if(userVars["DFSTATS_df_hidearmour"] === "0")
			{
				target.textContent = "Show Armour [X]";
				target.dataset.hide = '1';
			} else
			{
				target.textContent = "Show Armour [ ]";
				target.dataset.hide = '0';
			}
			renderAvatarUpdate();
			pageLock = false;
		});
	});

	inventoryHolder.appendChild(hideArmours);

	if(parseInt(userVars["DFSTATS_df_implantslots"]) > 0)
	{
		var implantLabel = document.createElement("div");
		implantLabel.classList.add("opElem");
		implantLabel.classList.add("cashHack");
		implantLabel.classList.add("credits");
		implantLabel.textContent = "Implants";
		implantLabel.dataset.cash = "Implants";
		implantLabel.style.top = "50px";
		inventoryHolder.appendChild(implantLabel);
		implantLabel.style.left = ((implantElem.offsetWidth / 2) - (implantLabel.offsetWidth / 4)) + "px";
	}

	if(userVars["DFSTATS_df_profession"] === "Doctor" || userVars["DFSTATS_df_profession"] === "Chef" || userVars["DFSTATS_df_profession"] === "Engineer")
	{
		if(!(parseInt(userVars["DFSTATS_df_positionx"]) > 0 && userVars["DFSTATS_df_minioutpost"] !== "1"))
		{
			var profSlot = document.createElement("div");
			profSlot.classList.add("opElem");
			profSlot.style.left = "78px";
			profSlot.style.top = "329px";
			profSlot.style.width = "52px";
			profSlot.style.height = "58px";
			profSlot.style.background = "no-repeat center center / cover";

			profSlot.classList.add("fakeSlot");
			profSlot.classList.add("hoverEffect");

			var profText = document.createElement("div");
			profText.classList.add("opElem");
			switch(userVars["DFSTATS_df_profession"])
			{
				case "Doctor":
					profSlot.dataset.action = "newadminister";
					profText.textContent = "Administer";
					profSlot.style.backgroundImage = "url(https://files.deadfrontier.com/hotrods/hotrods_v" + hrV + "/HTML5/images/market_heal.png)";
					break;
				case "Chef":
					profSlot.dataset.action = "newcook";
					profText.textContent = "Cook";
					profSlot.style.backgroundImage = "url(https://files.deadfrontier.com/hotrods/hotrods_v" + hrV + "/HTML5/images/market_cook.png)";
					break;
				case "Engineer":
					profSlot.dataset.action = "newrepair";
					profText.textContent = "Repair Armour";
					profSlot.style.backgroundImage = "url(https://files.deadfrontier.com/hotrods/hotrods_v" + hrV + "/HTML5/images/market_repair.png)";
					break;
			}
			profText.style.width = "120px";

			inventoryHolder.appendChild(profSlot);

			profText.style.left = profSlot.offsetLeft + (profSlot.offsetWidth / 2) - 60 + "px";
			profText.style.top = "380px";

			inventoryHolder.appendChild(profText);
		}
	}

	initiateCharacterInventory();
}

function initiateCharacterInventory()
{
	renderAvatarUpdate(inventoryHolder.querySelector(".characterRender"));
	var charElem = document.getElementById("character").querySelector("div");
	charElem.innerHTML = "";
	charElem.textContent = "";

	var slotTypes = [["hat", 242, 67, 40], ["mask", 398, 67, 39], ["coat", 222, 146, 38], ["armour", 418, 146, 34], ["shirt", 242, 231, 36], ["trousers", 398, 231, 37]];

	for(var i in slotTypes)
	{
		var holder = document.createElement("div");
		holder.classList.add("opElem");
		holder.dataset.slottype = slotTypes[i][0];
		holder.dataset.slot = slotTypes[i][3];
		holder.style.left = slotTypes[i][1] + "px";
		holder.style.top = slotTypes[i][2] + "px";
		holder.classList.add("validSlot");
		charElem.appendChild(holder);
		var slotText = document.createElement("div");
		var actualText = slotTypes[i][0].charAt(0).toUpperCase() + slotTypes[i][0].slice(1);
		slotText.classList.add("opElem");
		slotText.classList.add("cashHack");
		slotText.classList.add("credits");
		slotText.dataset.cash = actualText;
		slotText.style.left = slotTypes[i][1] - 10 + "px";
		slotText.style.top = slotTypes[i][2] + 46 + "px";
		slotText.style.width = "64px";
		slotText.textContent = actualText;
		charElem.appendChild(slotText);
	}

	slotTypes = [[222, 320, 31], [320, 340, 32], [418, 320, 33]];
	// 31,32,33
	var actualText = "Weapon";
	for(var i = 0; i < 3; i++)
	{
		var holder = document.createElement("div");
		holder.classList.add("opElem");
		holder.dataset.slottype = "weapon";
		holder.dataset.slot = slotTypes[i][2];
		holder.style.left = slotTypes[i][0] + "px";
		holder.style.top = slotTypes[i][1] + "px";
		holder.classList.add("validSlot");
		charElem.appendChild(holder);
		var slotText = document.createElement("div");
		slotText.classList.add("opElem");
		slotText.classList.add("cashHack");
		slotText.classList.add("credits");
		slotText.dataset.cash = actualText;
		slotText.style.left = slotTypes[i][0] - 10 + "px";
		slotText.style.top = slotTypes[i][1] + 46 + "px";
		slotText.style.width = "64px";
		slotText.textContent = actualText;
		charElem.appendChild(slotText);
	}

	var charMouth = document.createElement("div");
	charMouth.dataset.action = "giveToChar";
	charMouth.classList.add("fakeSlot");

	charElem.appendChild(charMouth);

	populateCharacterInventory();
}

function getItemType(itemData)
{
	if(itemData["implant"])
	{
		return "implant";
	} else if(itemData["clothingtype"])
	{
		if(itemData["clothingtype"] === "mask2")
		{
			return "mask";
		}
		return itemData["clothingtype"];
	} else
	{
		return itemData["itemcat"];
	}
}

function populateImplants()
{
	$("#implants").find(".validSlot").empty();
	for(var i = 1; i <= parseInt(userVars["DFSTATS_df_implantslots"]); i++)
	{
		if(userVars["DFSTATS_df_implant" + i + "_type"] !== "")
		{
			var itemData = {'type': userVars["DFSTATS_df_implant" + i + "_type"], 'image': userVars["DFSTATS_df_implant" + i + "_type"]};
			var item = document.createElement("div");
			item.classList.add("item");
			if(typeof globalData[userVars["DFSTATS_df_implant" + i + "_type"]] === "undefined")
			{
				itemData["type"] = "brokenitem";
				item.dataset.broken = userVars["DFSTATS_df_implant" + i + "_type"];
			} else
			{
				item.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
			}
			item.dataset.type = itemData["type"];
			item.dataset.itemtype = getItemType(globalData[itemData["type"].trim()]);

			$("#implants").find("td[data-slot='" + i + "'].validSlot").append(item);
		}
	}
}

function populateCharacterInventory()
{
	$("#character").find(".validSlot").empty();
	var itemData = {'type': "", 'image': ""};
	var temp;
	if(userVars["DFSTATS_df_avatar_hat"] !== "")
	{
		if(userVars["DFSTATS_df_avatar_hat"] !== "blocked_slot")
		{
			itemData["type"] = userVars["DFSTATS_df_avatar_hat"].trim().split("_");
			temp = document.createElement("div");
			temp.classList.add("item");
			temp.dataset.type = userVars["DFSTATS_df_avatar_hat"];
			temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
			itemData["image"] = itemData["type"][0];
			temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
			$("#character").find("[data-slottype=hat].validSlot").append(temp);
		} else
		{
			$("#character").find("[data-slottype=hat].validSlot").removeClass("validSlot").addClass("blockedSlot");
		}
	} else
	{
		$("#character").find("[data-slottype=hat].blockedSlot").removeClass("blockedSlot").addClass("validSlot");
	}

	if(userVars["DFSTATS_df_avatar_mask"] !== "")
	{
		if(userVars["DFSTATS_df_avatar_mask"] !== "blocked_slot")
		{
			itemData["type"] = userVars["DFSTATS_df_avatar_mask"].trim().split("_");
			temp = document.createElement("div");
			temp.classList.add("item");
			temp.dataset.type = userVars["DFSTATS_df_avatar_mask"];
			temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
			itemData["image"] = itemData["type"][0];
			temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
			$("#character").find("[data-slottype=mask].validSlot").append(temp);
		} else
		{
			$("#character").find("[data-slottype=mask].validSlot").removeClass("validSlot").addClass("blockedSlot");
		}
	} else
	{
		$("#character").find("[data-slottype=mask].blockedSlot").removeClass("blockedSlot").addClass("validSlot");
	}

	if(userVars["DFSTATS_df_avatar_coat"] !== "")
	{
		if(userVars["DFSTATS_df_avatar_coat"] !== "blocked_slot")
		{
			itemData["type"] = userVars["DFSTATS_df_avatar_coat"].trim().split("_");
			temp = document.createElement("div");
			temp.classList.add("item");
			temp.dataset.type = userVars["DFSTATS_df_avatar_coat"];
			temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
			itemData["image"] = itemData["type"][0];
			temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
			$("#character").find("[data-slottype=coat].validSlot").append(temp);
		} else
		{
			$("#character").find("[data-slottype=coat].validSlot").removeClass("validSlot").addClass("blockedSlot");
		}
	} else
	{
		$("#character").find("[data-slottype=coat].blockedSlot").removeClass("blockedSlot").addClass("validSlot");
	}

	if(userVars["DFSTATS_df_avatar_shirt"] !== "")
	{
		if(userVars["DFSTATS_df_avatar_shirt"] !== "blocked_slot")
		{
			itemData["type"] = userVars["DFSTATS_df_avatar_shirt"].trim().split("_");
			temp = document.createElement("div");
			temp.classList.add("item");
			temp.dataset.type = userVars["DFSTATS_df_avatar_shirt"];
			temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
			itemData["image"] = itemData["type"][0];
			temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
			$("#character").find("[data-slottype=shirt].validSlot").append(temp);
		} else
		{
			$("#character").find("[data-slottype=shirt].validSlot").removeClass("validSlot").addClass("blockedSlot");
		}
	} else
	{
		$("#character").find("[data-slottype=shirt].blockedSlot").removeClass("blockedSlot").addClass("validSlot");
	}

	if(userVars["DFSTATS_df_avatar_trousers"] !== "")
	{
		if(userVars["DFSTATS_df_avatar_trousers"] !== "blocked_slot")
		{
			itemData["type"] = userVars["DFSTATS_df_avatar_trousers"].trim().split("_");
			temp = document.createElement("div");
			temp.classList.add("item");
			temp.dataset.type = userVars["DFSTATS_df_avatar_trousers"];
			temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
			itemData["image"] = itemData["type"][0];
			temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
			$("#character").find("[data-slottype=trousers].validSlot").append(temp);
		} else
		{
			$("#character").find("[data-slottype=trousers].validSlot").removeClass("validSlot").addClass("blockedSlot");
		}
	} else
	{
		$("#character").find("[data-slottype=trousers].blockedSlot").removeClass("blockedSlot").addClass("validSlot");
	}

	if(userVars["DFSTATS_df_weapon1type"] !== "")
	{
		itemData["type"] = userVars["DFSTATS_df_weapon1type"].trim().split("_");
		temp = document.createElement("div");
		temp.classList.add("item");
		temp.dataset.type = userVars["DFSTATS_df_weapon1type"];
		temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
		itemData["image"] = itemData["type"][0];
		temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
		$("#character").find("[data-slot=31].validSlot").append(temp);
	}

	if(userVars["DFSTATS_df_weapon2type"] !== "")
	{
		itemData["type"] = userVars["DFSTATS_df_weapon2type"].trim().split("_");
		temp = document.createElement("div");
		temp.classList.add("item");
		temp.dataset.type = userVars["DFSTATS_df_weapon2type"];
		temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
		itemData["image"] = itemData["type"][0];
		temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
		$("#character").find("[data-slot=32].validSlot").append(temp);
	}

	if(userVars["DFSTATS_df_weapon3type"] !== "")
	{
		itemData["type"] = userVars["DFSTATS_df_weapon3type"].trim().split("_");
		temp = document.createElement("div");
		temp.classList.add("item");
		temp.dataset.type = userVars["DFSTATS_df_weapon3type"];
		temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
		itemData["image"] = itemData["type"][0];
		temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
		$("#character").find("[data-slot=33].validSlot").append(temp);
	}

	if(userVars["DFSTATS_df_armourtype"] !== "")
	{
		itemData["type"] = userVars["DFSTATS_df_armourtype"].trim().split("_");
		temp = document.createElement("div");
		temp.classList.add("item");
		temp.dataset.type = userVars["DFSTATS_df_armourtype"];
		temp.dataset.quantity = userVars["DFSTATS_df_armourhp"];
		temp.classList.add("nonstack");
		temp.style.color = "#" + damageColor(userVars["DFSTATS_df_armourhp"], globalData[itemData["type"][0]]["hp"]);
		temp.dataset.itemtype = getItemType(globalData[itemData["type"][0]]);
		itemData["image"] = itemData["type"][0];
		temp.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + itemData["image"] + ".png')";
		$("#character").find("[data-slottype=armour].validSlot").append(temp);
	}

}

function allowedInfoCard(elem)
{
	if(elem && typeof elem.classList !== "undefined" && (elem.classList.contains("item") || elem.classList.contains("fakeItem") || elem.parentNode.classList.contains("fakeItem")))
	{
		return true;
	} else
	{
		return false;
	}
}

function infoCard(e)
{
	var colorMod = infoBox.style.borderColor;
	if(!active && !pageLock && allowedInfoCard(e.target))
	{
		var target;
		if(e.target.parentNode.classList.contains("fakeItem"))
		{
			target = e.target.parentNode;
		} else
		{
			target = e.target;
		}
		if(infoBox.style.visibility === "hidden" || curInfoItem !== target)
		{
			curInfoItem = target;
			var slotData = target.dataset.type.trim().split("_");
			var itemData = globalData[slotData[0]];
			colorMod = "";
			var cooked = false;
			if(target.dataset.type.indexOf("_cooked") >= 0)
			{
				cooked = true;
			}
			var itemName = itemNamer(target.dataset.type, target.dataset.quantity);
			var icOut = "<div class='itemName'>" + itemName + "</div>";
			if(slotData.length > 1)
				for(var i = 1; i < slotData.length; i++)
				{
					if(slotData[i].indexOf("re") == 0)
					{
						icOut += "<div class='itemName'>Reinforced " + slotData[i].substr(2) + "0%</div>";
					}
				}

			if(itemData["itemcat"] === "weapon")
			{
				if(itemData["melee"] === "0")
				{
					if(itemData["ammo_type"] !== "")
					{
						icOut += "<div class='itemData'>" + globalData[itemData["ammo_type"]]["name"] + "</div>";
					}
					icOut += "<div class='itemData'>" + itemData["bullet_capacity"] + "</div>";
					icOut += "<div class='itemData'>" + itemData["reload_time"] + "</div>";
				}
				icOut += "<div class='itemData'>" + itemData["shot_time"] + "</div>";
				icOut += "<div class='itemData'>" + itemData["accuracy_mod"] + "</div>";
				icOut += "<div class='itemData'>" + itemData["critical"] + "</div>";
				if(typeof itemData["str_req"] !== "undefined" && itemData["str_req"] > 0)
				{
					icOut += "<div class='itemData'";
					if(userVars["DFSTATS_df_strength"] < itemData["str_req"])
					{
						icOut += " style='color: #B20108;'";
					}
					icOut += ">" + itemData["str_req"] + " Strength Required</div>";
				}
				if(typeof itemData["pro_req"] !== "undefined" && parseInt(itemData["pro_req"]) > 0)
				{
					icOut += "<div class='itemData'";
					if(userVars["DFSTATS_df_pro" + itemData["wepPro"]] < itemData["pro_req"])
					{
						icOut += " style='color: #B20108;'";
					}
					icOut += ">" + itemData["pro_req"] + " " + itemData["weptype"] + " Skill Required</div>";
				}

				if(typeof itemData["selective_fire_type"] !== "undefined")
				{
					switch(itemData["selective_fire_type"])
					{
						case "burst":
							fireString = parseFloat(itemData["selective_fire_amount"]) + " Round Burst Fire";
							break;
					}
					icOut += "<div class='itemData' style='color: #cc7100;'>" + fireString + "</div>";
				}

				if(typeof itemData["flamethrower"] !== "undefined" && itemData["flamethrower"] === "1")
				{
					if(typeof itemData["elemental"] !== "undefined" && itemData["elemental"] === "cryo")
					{
						icOut += "<div class='itemData' style='color: #00AAFF'>Frost-throwing Weapon</div>";
					} else
					{
						icOut += "<div class='itemData' style='color: #e25822'>Flame-throwing Weapon</div>";
					}
				}

				if(typeof itemData["elemental"] !== "undefined")
				{
					switch(itemData["elemental"])
					{
						case "cryo":
							icOut += "<div class='itemData' style='color: #00AAFF'>Slows infected by " + (parseFloat(itemData["elementalamount"]) * 100) + "% for " + parseFloat(itemData["elementalduration"]) + " seconds per hit</div>";
							break;
						case "armourpenetration":
							icOut += "<div class='itemData' style='color: #9947ad'>" + parseFloat(itemData["elementalamount"]) + "% PvE Armour Penetration</div>";
							break;
						case "armourignore":
							icOut += "<div class='itemData' style='color: #9947ad'>100% PvE Armour Penetration</div>";
							break;
					}
				}

				if(typeof itemData["unique_parameters"] !== "undefined")
				{
					if(typeof itemData["unique_parameters"]["MeleeHitCountAmount"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>" + parseInt(itemData["unique_parameters"]["MeleeHitCountAmount"]) + " Enemies Hit</div>";
					}

					if(typeof itemData["unique_parameters"]["MeleeAttackRangeX"] !== "undefined" || typeof itemData["unique_parameters"]["MeleeAttackRangeY"] !== "undefined" || typeof itemData["unique_parameters"]["MeleeAttackRangeZ"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>Enhanced Melee Damage Radius</div>";
					}

					if(typeof itemData["unique_parameters"]["KnockbackMultiplier"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>Enhanced Knockback</div>";
					}

					if(typeof itemData["unique_parameters"]["ReducedNoiseRadius"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>Reduces Noise by " + (parseFloat(itemData["unique_parameters"]["ReducedNoiseRadius"]) * 100) + "%</div>";
					}
				}

				if(itemData["no_ammo"] > 0)
					icOut += "<div class='itemData'>Unlimited Ammo</div>";
				if(itemData["no_df2"] > 0)
					icOut += "<div class='itemData' style='color: #AA0000;'>DF2 Reward Claimed</div>";
				if(target.dataset.type.indexOf("_stats") >= 0)
				{
					var n = target.dataset.type.indexOf("_stats") + 6;
					n = target.dataset.type.substring(n, n + 3);
					if(mcData[n] && mcData[n][0] !== "")
					{
						colorMod = mcData[n][0];
					}
					n = n.split('');
					for(var i in n)
						n[i] = parseInt(n[i]);
					if(n[0] > 0)
						icOut += "<div class='itemData' style='color: #aba000;'>+" + n[0] + " Accuracy</div>";
					if(n[1] > 0)
						icOut += "<div class='itemData' style='color: #aba000;'>+" + n[1] + " Reloading</div>";
					if(n[2] > 0)
						icOut += "<div class='itemData' style='color: #aba000;'>+" + n[2] + " Critical Hit</div>";
					icOut += calcMCTag(target.dataset.type, true, "div", "itemData");

				}
			} else if(itemData["itemcat"] === "armour")
			{
				icOut += "<div class='itemData' style='color: #" + damageColor(target.dataset.quantity, itemData["hp"]) + "'>" + target.dataset.quantity + " / " + itemData["hp"] + "</div>";
				icOut += "<div class='itemData'>" + itemData["str"] + "% Damage Absorption</div>";
				if(typeof itemData["str_req"] !== "undefined" && itemData["str_req"] > 0)
				{
					icOut += "<div class='itemData'";
					if(parseInt(userVars["DFSTATS_df_strength"]) < parseInt(itemData["str_req"]))
					{
						icOut += " style='color: #B20108;'";
					}
					icOut += ">" + itemData["str_req"] + " Strength Required</div>";
				}

				icOut += "<div class='itemData'";
				if(userVars["DFSTATS_df_profession"].toLowerCase() === "engineer" && userVars["df_level"] < itemData["shop_level"] - 5)
				{
					icOut += " style='color: #B20108;'";
				}
				icOut += ">Repair by Engineer Level " + (itemData["shop_level"] - 5) + "</div>";

				if(target.dataset.type.indexOf("_stats") >= 0)
				{
					var n = target.dataset.type.indexOf("_stats") + 6;
					n = target.dataset.type.substring(n, n + 4);
					if(mcData[n] && mcData[n][0] !== "")
					{
						colorMod = mcData[n][0];
					}
					n = n.match(/[\s\S]{1,2}/g) || [];
					for(var i in n)
						n[i] = parseInt(n[i]);
					if(n[0] > 0)
						icOut += "<div class='itemData' style='color: #aba000;'>+" + n[0] + " Agility</div>";
					if(n[1] > 0)
						icOut += "<div class='itemData' style='color: #aba000;'>+" + n[1] + " Endurance</div>";
					icOut += calcMCTag(target.dataset.type, true, "div", "itemData");
				}
				if(itemData["str_req"] === "0")
				{
					icOut += "<div class='itemData' style='color: #12FF00'>Light Armour +5% Speed</div>";
				}

				if(typeof itemData["unique_parameters"] !== "undefined")
				{
					if(typeof itemData["unique_parameters"]["deathGrace"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>" + (parseFloat(itemData["unique_parameters"]["deathGrace"]) * 100) + "% Chance to Survive Fatal Blow</div>";
					}

					if(typeof itemData["unique_parameters"]["breakReduction"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>" + (parseFloat(itemData["unique_parameters"]["breakReduction"]) * 100) + "% Extra Damage Reduction On Breaking Hit</div>";
					}

					if(typeof itemData["unique_parameters"]["dRadMod"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>Reduces Enemy Detection Radius by " + (parseFloat(itemData["unique_parameters"]["dRadMod"]) * 100) + "%</div>";
					}

					if(typeof itemData["unique_parameters"]["lRadMod"] !== "undefined")
					{
						icOut += "<div class='itemData' style='color: #FFA500;'>Reduces Enemy Sight by " + (parseFloat(itemData["unique_parameters"]["lRadMod"]) * 100) + "%</div>";
					}
				}

			} else if(itemData["itemcat"] === "item")
			{
				if(itemData["implant"] === "1")
				{
					if(itemData["implant_expboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_expboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_expboostmod"] * 1000) / 10 + "% Exp Gain</div>";
					}
					if(itemData["implant_pvppointsboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_pvppointsboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_pvppointsboostmod"] * 1000) / 10 + "% Pvp Points Gain</div>";
					}
					if(itemData["implant_damageboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_damageboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_damageboostmod"] * 1000) / 10 + "% Damage Inflicted</div>";
					}
					if(itemData["implant_damagereductionboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_damagereductionboostmod"] < 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_damagereductionboostmod"] * 1000 * -1) / 10 + "% Incoming Damage Reduction</div>";
					}
					if(itemData["implant_speedboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_speedboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_speedboostmod"] * 1000) / 10 + "% Movement Speed</div>";
					}

					if(itemData["implant_ammolootboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_ammolootboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_ammolootboostmod"] * 1000) / 10 + "% Ammo Looted</div>";
					}
					if(itemData["implant_cashlootboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_cashlootboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_cashlootboostmod"] * 1000) / 10 + "% Cash Looted</div>";
					}
					if(itemData["implant_armourlootboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_armourlootboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_armourlootboostmod"] * 1000) / 10 + "% Chance to Find Armour</div>";
					}
					if(itemData["implant_weaponlootboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_weaponlootboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_weaponlootboostmod"] * 1000) / 10 + "% Chance to Find Weapons</div>";
					}

					if(itemData["implant_lootspotboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_lootspotboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_lootspotboostmod"] * 1000) / 10 + "% More Loot Spots</div>";
					}
					if(itemData["implant_searchspeedboostmod"])
					{
						icOut += "<div class='itemData' style='color: ";
						if(itemData["implant_searchspeedboostmod"] > 0)
						{
							icOut += "#12FF00;'>+";
						} else
						{
							icOut += "#D20303;'>";
						}
						icOut += Math.round(itemData["implant_searchspeedboostmod"] * 1000) / 10 + "% Search Speed</div>";
					}

					if(itemData["implant_unique"] === "1")
					{
						icOut += "<div class='itemData'>Unique Implant (may only equip one)</div>";
					}
					if(itemData["implant_block"] && itemData["implant_block"] !== "")
					{
						icOut += "<div class='itemData' style='color: #D20303;'>Cannot be used with:</div>";
						icOut += "<div class='itemData' style='color: #D20303;'>" + itemData["implant_block_names"] + "</div>";
					}
				} else
				{
					if(itemData["foodrestore"] && parseInt(itemData["foodrestore"]) > 0)
					{
						var foodRestore = parseInt(itemData["foodrestore"]);
						var foodCooked = foodRestore * 3;
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) && parseInt(itemData["level"]) < 50 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 50)
						{
							foodRestore = 3;
							foodCooked = 9;
						}
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) + 10 && parseInt(itemData["level"]) < 40 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 40)
						{
							foodRestore = 0;
							foodCooked = 1;
						}
						if(!cooked && itemData["needcook"] === "1")
						{
							icOut += "<div class='itemData'>Restores " + foodRestore + "% hunger</div>";
							icOut += "<div class='itemData'>Restores " + foodCooked + "% hunger if cooked</div>";
						} else
						{
							if(cooked)
							{
								icOut += "<div class='itemData'>Restores " + foodCooked + "% hunger</div>";
							} else
							{
								icOut += "<div class='itemData'>Restores " + foodRestore + "% hunger</div>";
							}
						}

						icOut += "<div class='itemData'";
						var nutritionFactorColor = "";
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) && parseInt(itemData["level"]) < 50 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 50)
						{
							nutritionFactorColor = " style='color: #DD9203;'";
						}
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) + 10 && parseInt(itemData["level"]) < 40 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 40)
						{
							nutritionFactorColor = " style='color: #B20108;'";
						}
						icOut += nutritionFactorColor + ">Nutrition Level " + itemData["level"] + "</div>";
						if(!cooked && itemData["needcook"] === "1")
						{
							if(userVars["DFSTATS_df_profession"] === "Chef" && parseInt(userVars["DFSTATS_df_level"]) < parseInt(itemData["level"]) - 5)
							{
								icOut += "<div class='itemData' style='color: #B20108;'>Can be cooked by Chef Level " + (itemData["level"] - 5) + "+</div>";
							} else
							{
								icOut += "<div class='itemData'>Can be cooked by Chef Level " + (itemData["level"] - 5) + "+</div>";
							}
						}
					}
					if(itemData["healthrestore"] && itemData["healthrestore"] > 0)
					{
						var healthRestore = parseInt(itemData["healthrestore"]);
						var healthDoctor = healthRestore * 3;
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) && parseInt(itemData["level"]) < 50 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 50)
						{
							healthRestore = 3;
							healthDoctor = 9;
						}
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) + 10 && parseInt(itemData["level"]) < 40 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 40)
						{
							healthRestore = 0;
							healthDoctor = 1;
						}
						icOut += "<div class='itemData'>Restores " + healthRestore + "% health</div>";
						if(itemData["needdoctor"] === "1")
						{
							icOut += "<div class='itemData'>Restores " + healthDoctor + "% health if administered</div>";
						}

						icOut += "<div class='itemData'";
						var healingFactorColor = "";
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) && parseInt(itemData["level"]) < 50 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 50)
						{
							healingFactorColor = " style='color: #DD9203;'";
						}
						if(parseInt(userVars["DFSTATS_df_level"]) > parseInt(itemData["level"]) + 10 && parseInt(itemData["level"]) < 40 || parseInt(userVars["DFSTATS_df_level"]) > 70 && parseInt(itemData["level"]) === 40)
						{
							healingFactorColor = " style='color: #B20108;'";
						}
						icOut += healingFactorColor + ">Healing Level " + itemData["level"] + "</div>";

						if(itemData["needdoctor"] === "1")
						{
							if(userVars["DFSTATS_df_profession"] === "Doctor" && userVars["DFSTATS_df_level"] < itemData["level"] - 5)
							{
								icOut += "<div class='itemData' style='color: #B20108;'>Can be administered by Doctor Level " + (itemData["level"] - 5) + "+</div>";
							} else
							{
								icOut += "<div class='itemData'>Can be administered by Doctor Level " + (itemData["level"] - 5) + "+</div>";
							}
						}
					}
					if(itemData["canread"] === "1")
					{
						icOut += "<div class='itemData'>Can be read</div>";
					}
					if(itemData["opencontents"] && itemData["opencontents"] > 0)
					{
						icOut += "<div class='itemData'>Can be opened</div>";
					}
					if(itemData["barricade"] === "1")
					{
						icOut += "<div class='itemData'>Can be used for Barricading</div>";
					}
					if(itemData["clothingtype"])
					{
						icOut += "<div class='itemData'>Can be worn</div>";
					}
					if(itemData["cashprotect"])
					{
						icOut += "<div class='itemData'>Will preserve up to $" + nf.format(itemData["cashprotect"]) + " on death</div>";
						icOut += "<div class='itemData'>Only your best box will work</div>";
					}

					if(itemData["boostexphours"] > 0)
					{
						var hours = Math.floor(itemData["boostexphours"]);
						var minutes = (itemData["boostexphours"] % 1).toFixed(2) * 60;
						icOut += "<div class='itemData'>Boosts exp gain by +50% for ";
						if(hours > 0)
						{
							icOut += hours + " hour";
							if(hours > 1)
							{
								icOut += "s"
							}
							if(minutes > 0)
							{
								icOut += " and " + minutes + " minute";
								if(minutes > 1)
								{
									icOut += "s";
								}
							}
						} else
						{
							icOut += minutes + " minute";
							if(minutes > 1)
							{
								icOut += "s";
							}
						}
						icOut += "</div>";
					}
					if(itemData["boostdamagehours"] > 0)
					{
						var hours = Math.floor(itemData["boostdamagehours"]);
						var minutes = (itemData["boostdamagehours"] % 1).toFixed(2) * 60;
						icOut += "<div class='itemData'>Boosts damage by +35% for ";
						if(hours > 0)
						{
							icOut += hours + " hour";
							if(hours > 1)
							{
								icOut += "s"
							}
							if(minutes > 0)
							{
								icOut += " and " + minutes + " minute";
								if(minutes > 1)
								{
									icOut += "s";
								}
							}
						} else
						{
							icOut += minutes + " minute";
							if(minutes > 1)
							{
								icOut += "s";
							}
						}
						icOut += "</div>";
					}
					if(itemData["boostspeedhours"] > 0)
					{
						var hours = Math.floor(itemData["boostspeedhours"]);
						var minutes = (itemData["boostspeedhours"] % 1).toFixed(2) * 60;
						icOut += "<div class='itemData'>Boosts run/walk speed by +35% for ";
						if(hours > 0)
						{
							icOut += hours + " hour";
							if(hours > 1)
							{
								icOut += "s"
							}
							if(minutes > 0)
							{
								icOut += " and " + minutes + " minute";
								if(minutes > 1)
								{
									icOut += "s";
								}
							}
						} else
						{
							icOut += minutes + " minute";
							if(minutes > 1)
							{
								icOut += "s";
							}
						}
						icOut += "</div>";
					}

					if(itemData["opencontents"] && itemData["opencontents"].length > 0)
					{
						icOut += "<div class='itemData'>Contents:</div>";
						var itemContents = itemData["opencontents"].split(',');
						var chances = {};
						var totalItems = 0;

						for(var j in itemContents)
						{
							if(!chances[itemContents[j]])
							{
								chances[itemContents[j]] = 0;
							}
							chances[itemContents[j]]++;
							totalItems++;
						}
						for(var j in chances)
						{
							var chanceCalc = Math.floor((chances[j] / totalItems) * 1000) / 10 + "";
							if(chanceCalc.indexOf('.') === -1)
							{
								chanceCalc += '.0';
							}
							icOut += "<div class='itemData' style='color: #12FF00;'> - " + chanceCalc + "% " + globalData[j]["name"] + "</div>";
						}

						/*for(var j in itemContents)
						 {
						 if($.inArray(itemContents[j], addedItems) >= 0)
						 {
						 continue;
						 } else {
						 icOut += "<div class='itemData' style='color: #12FF00;'> - " + globalData[itemContents[j]]["name"] + "</div>";
						 addedItems.push(itemContents[j]);
						 }
						 }*/

						icOut += "<div class='itemData'>Can be opened</div>";
					}

					if(itemData["gm_days"] && itemData["gm_days"] !== "0")
					{
						//icOut += "<div class='itemData' style='color: #897129; width: 250px;'>Grants " + itemData["gm_days"] + " days of Gold Membership on use (excluding monthly credits)</div>";
						icOut += "<div class='itemData' style='color: #897129;'>Grants " + itemData["gm_days"] + " days of Gold Membership</div>";
						icOut += "<div class='itemData' style='color: #12FF00;'>+ 2x exp</div>";
						icOut += "<div class='itemData' style='color: #12FF00;'>+ 2x mission rewards</div>";
						icOut += "<div class='itemData' style='color: #12FF00;'>+ Improved loot</div>";
						icOut += "<div class='itemData' style='color: #12FF00;'>+ Credit shop discount</div>";
						icOut += "<div class='itemData' style='color: #12FF00;'>+ F***ing Fast revive</div>";
						icOut += "<div class='itemData' style='color: #B20108;'>- Excludes monthly credits</div>";
					}

					var whereBloodFrom = "";
					switch(slotData[0])
					{
						case "crowsample":
							whereBloodFrom = "an infected crow";
							break;
						case "childsample":
							whereBloodFrom = "an infected child</div>";
							break;
						case "malesample":
							whereBloodFrom = "an infected male";
							break;
						case "femalesimple":
							whereBloodFrom = "an infected female";
							break;
						case "charredmalesample":
							whereBloodFrom = "an infected charred male";
							break;
						case "charredfemalesample":
							whereBloodFrom = "an infected charred female";
							break;
						case "mutantsample":
							whereBloodFrom = "a mutant";
							break;
						case "advancedmutantsample":
							whereBloodFrom = "an advanced mutant";
							break;
						case "behemothsample":
							whereBloodFrom = "a behemoth";
							break;
						case "radiatedsample":
							whereBloodFrom = "a radiated infected";
							break;
						case "radiatedcharredsample":
							whereBloodFrom = "a radiated charred infected";
							break;
						case "radiatedmutantsample":
							whereBloodFrom = "a radiated mutant";
							break;
						case "radiatedadvancedmutantsample":
							whereBloodFrom = "a radiated advanced mutant";
							break;
					}
					if(whereBloodFrom !== "")
					{
						icOut += "<div class='itemData'>Blood sample from " + whereBloodFrom + "</div>";
					}
				}
			} else
			{
				if(itemData["itemcat"] === "ammo")
				{
					if(slotData[0] === "fuelammo")
					{
						icOut += "<div class='itemData'>" + target.dataset.quantity + " mL</div>";
					} else
					{
						icOut += "<div class='itemData'>" + target.dataset.quantity + " Rounds</div>";
					}
				} else if(itemData["itemcat"] === "broken")
				{
					icOut += "<div class='itemData'>This item is broken. Please report this to support.</div>";
					icOut += "<div class='itemData'>Item Code: " + target.dataset.broken + "</div>";
					icOut += "<div class='itemData'>Container: " + target.parentNode.parentNode.parentNode.id + "</div>";
					icOut += "<div class='itemData'>Item Slot: " + target.parentNode.dataset.slot + "</div>";
				}
			}

			if(/_colour(\d*)\^(\d*)\^(\d*)/.test(target.dataset.type))
			{
				var rgbVal = target.dataset.type.match(/(\d*)\^(\d*)\^(\d*)/);
				rgbVal[0] = rgbVal[0].replace(/\^/g, ',');

				var rgbSep = rgbVal[1].split("^");
				for(var i = 0; i < rgbSep.length; i++)
				{
					rgbSep[i] = rgbSep[i] / 255;
				}
				var cMin = Math.min(rgbSep[0], rgbSep[1], rgbSep[2]);
				var cMax = Math.max(rgbSep[0], rgbSep[1], rgbSep[2]);
				var light = (cMax + cMin) / 2;
				light = +(light * 100).toFixed(1);

				if(light >= 50)
				{
					icOut += "<div class='itemData' style='background-color: rgb(" + rgbVal[0] + "); width: 50%; color: black;'>Colour: " + rgbVal[0] + "</div>";
				} else
				{
					icOut += "<div class='itemData' style='background-color: rgb(" + rgbVal[0] + "); width: 50%; color: white;'>Colour: " + rgbVal[0] + "</div>";
				}

			}

			if(itemData["no_transfer"] === "1")
			{
				icOut += "<div class='itemData'>Non-Transferable</div>";
			}

			if(itemData["description"] && itemData["description"] !== "")
			{
				icOut += "<br /><div class='itemData' style='color: ";
				if(itemData["description_colour"] && itemData["description_colour"] !== "")
				{
					icOut += "#" + itemData["description_colour"];
				} else
				{
					icOut += "#897129";
				}
				icOut += ";'>" + itemData["description"] + "</div>";
			}

			if(target.classList.contains("fakeItem") && target.parentNode.id === "recipes")
			{
				icOut += "<div class='itemData'>Required For Crafting:</div>";
				icOut += "<div class='itemData' style='max-width: 240px; color: #ff6600;'>" + itemData["requiredItemsDesc"] + "</div>";
			}
			infoBox.innerHTML = icOut;
			infoBox.querySelector(".itemName").style.color = colorMod;
			infoBox.style.borderColor = colorMod;

			infoBox.style.backgroundImage = "url('https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + slotData[0] + ".png')";
			infoBox.dispatchEvent(hoverEvent);
			infoBox.style.visibility = "visible";
		}

		var invHoldOffsets = inventoryHolder.getBoundingClientRect();
		if(mousePos[1] - 30 - infoBox.offsetHeight < invHoldOffsets.top)
		{
			infoBox.style.top = (mousePos[1] + 30 - invHoldOffsets.top) + "px";
		} else
		{
			infoBox.style.top = (mousePos[1] - 30 - infoBox.offsetHeight - invHoldOffsets.top) + "px";
		}

		if(mousePos[0] + 20 + infoBox.offsetWidth > invHoldOffsets.right)
		{
			infoBox.style.left = (inventoryHolder.offsetWidth - infoBox.offsetWidth) + "px";
		} else
		{
			infoBox.style.left = (mousePos[0] + 20 - invHoldOffsets.left) + "px";
		}


	} else
	{
		if(infoBox.style.visibility !== "hidden")
		{
			if(document.elementFromPoint(mousePos[0], mousePos[1]) !== infoBox)
			{
				infoBox.style.borderColor = colorMod;
				infoBox.style.visibility = "hidden";
			}
		}
	}
}

function clearCard(e)
{
	infoBox.style.visibility = "hidden";
	var underElem = document.elementFromPoint(mousePos[0], mousePos[1]);
	infoBox.style.visibility = "visible";
	if(!allowedInfoCard(underElem) || active)
	{
		if(infoBox.style.visibility !== "hidden")
		{
			infoBox.style.visibility = "hidden";
			infoBox.style.borderColor = "";
		}
	}
}

var colourArray = {};
colourArray["Black"] = ["000000", "ffffff"];
colourArray["White"] = ["ffffff", "000000"];
colourArray["Yellow"] = ["ffff00", "000000"];
colourArray["Grey"] = ["808080", "ffffff"];
colourArray["Brown"] = ["8b4513", "ffffff"];
colourArray["Red"] = ["ff0000", "000000"];
colourArray["Green"] = ["00ff00", "000000"];
colourArray["Blue"] = ["0000ff", "ffffff"];
colourArray["Forest Camo"] = ["78866b", "000000"];
colourArray["Desert Camo"] = ["f2cb8a", "000000"];
colourArray["Pink"] = ["FFC0CB", "000000"];
colourArray["Purple"] = ["800080", "FFFFFF"];
colourArray["Cyan"] = ["00FFFF", "000000"];
colourArray["Orange"] = ["FFA500", "000000"];

var moddedVars = userVars;

function dragDropAction(e)
{
	var itemType = currentItem.dataset.type.split('_');
	fakeGrabbedItem.style.visibility = "hidden";
	var nSlot = document.elementFromPoint(mousePos[0], mousePos[1]);
	fakeGrabbedItem.style.visibility = "visible";

	if((nSlot.classList.contains("fakeItem") || nSlot.classList.contains("profitList")) && nSlot.parentNode.classList.contains("fakeSlot"))
	{
		nSlot = nSlot.parentNode;
	} else if((nSlot.parentNode.classList.contains("fakeItem") || nSlot.parentNode.classList.contains("profitList")) && nSlot.parentNode.parentNode.classList.contains("fakeSlot"))
	{
		nSlot = nSlot.parentNode.parentNode;
	}

	var question = false;
	var action, itemData;
	var extraData = {};
	switch(nSlot.dataset.action)
	{
		default:
			console.log(nSlot);
			return;
			break;
		case "discard":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			//var servData = [itemData, [0, "", "discard"]];
			extraData = [itemData, [0, "", "discard"]];
			prompt.innerHTML = "Are you sure you want to discard the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += "?";
			prompt.classList.add("warning");
			prompt.classList.add("redhighlight");
			action = updateInventory;
			question = true;
			break;
		case "simpleStore":
			shiftItem(currentItem);
			break;
		case "sendItemPrivate":
			extraData["sendto"] = userVars["member_to"];
		case "sellitem":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id, currentItem.dataset.quantity];
			extraData["itemData"] = itemData;
			question = true;
			var priceHolder = document.createElement("div");
			priceHolder.style.position = "absolute";
			priceHolder.style.width = "100%";
			priceHolder.style.textAlign = "center";
			priceHolder.style.bottom = "30px";

			if(itemData[1] === "credits")
			{
				prompt.innerHTML = "How many <span style='color: red;'>Credits</span> would you like to sell and for how much?";
				var creditInput = document.createElement("input");
				creditInput.dataset.type = "credit";
				creditInput.style.color = "#cccccc";
				creditInput.style.backgroundColor = "#555555";
				creditInput.type = "number";
				creditInput.min = 0;
				creditInput.value = 100;
				if(parseInt(userVars["DFSTATS_df_credits"]) > 4000)
				{
					creditInput.max = 4000;
				} else
				{
					creditInput.max = userVars["DFSTATS_df_credits"];
				}
				var creditLabel = document.createElement("label");
				creditLabel.textContent = "C";
				creditLabel.style.color = "#cccccc";
				priceHolder.appendChild(creditLabel);
				priceHolder.appendChild(creditInput);
				priceHolder.appendChild(document.createElement("br"));
			} else
			{
				prompt.innerHTML = "How much would you like to sell the ";
				if(itemData[1].indexOf("_name") >= 0)
				{
					prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
				} else
				{
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

			if(marketLastMoney !== false && lastItemSold === itemType[0])
			{
				priceInput.value = marketLastMoney;
			} else
			{
				priceInput.value = '';
				marketLastMoney = false;
				lastItemSold = itemType[0];
			}

			priceHolder.appendChild(priceLabel);
			priceHolder.appendChild(priceInput);

			prompt.appendChild(priceHolder);
			action = sellpriceConfirm;
			break;
		case "tradeitem":
			if(tradeTimer !== undefined)
			{
				stopQueryUpdate();
			}
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id, currentItem.dataset.quantity];
			extraData["itemData"] = itemData;
			// nSlot
			extraData["itemnum"] = currentItem.parentNode.dataset.slot;
			extraData["target"] = nSlot.dataset.target;
			extraData["credits"] = nSlot.dataset.credits;
			extraData["update"] = nSlot.dataset.update;
			extraData["trade"] = nSlot.dataset.trade;
			extraData["type"] = currentItem.dataset.type;
			extraData["cash"] = currentItem.dataset.quantity;
			extraData["action"] = "additem";
			question = true;

			prompt.innerHTML = "Are you sure you want to trade ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += "?";

			action = doTradeAction;
			break;
		case "scrap":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			//var servData = [itemData, [0, "", "discard"]];
			var scrapPrice = scrapValue(currentItem.dataset.type, currentItem.dataset.quantity);
			extraData = [itemData, scrapPrice];
			extraData["action"] = "scrap";
			prompt.innerHTML = "Are you sure you want to scrap the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += " for $" + nf.format(scrapPrice) + "?";
			prompt.classList.add("warning");
			question = true;
			action = scrapItem;
			break;
		case "dismantle":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			//var servData = [itemData, [0, "", "discard"]];
			var scrapPrice = scrapValue(currentItem.dataset.type, currentItem.dataset.quantity);
			extraData = [itemData, scrapPrice];
			extraData["action"] = "dismantle";
			prompt.innerHTML = "Are you sure you want to dismantle the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += " for <span style='color: #12FF00;'>1 Rare Metal Scrap</span>?";
			prompt.classList.add("warning");
			question = true;
			action = scrapItem;
			break;
		case "enhance":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			//var servData = [itemData, [0, "", "discard"]];
			var enhancePrice = enhanceValue(itemType[0]);
			extraData = [itemData, enhancePrice];
			prompt.innerHTML = "";
			if(itemData[1].indexOf("_stats") >= 0)
			{
				prompt.innerHTML += "There is a chance this item will receive worse stats. ";
			}
			prompt.innerHTML += "Are you sure you want to enhance the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += " for $" + nf.format(enhancePrice) + "?";
			action = function(data)
			{
				var dataArr = {};
				dataArr["pagetime"] = userVars["pagetime"];
				dataArr["templateID"] = userVars["template_ID"];
				dataArr["sc"] = userVars["sc"];
				dataArr["creditsnum"] = 0;
				dataArr["buynum"] = 0;
				dataArr["renameto"] = "";
				dataArr["expected_itemprice"] = "-1";
				dataArr["expected_itemtype2"] = "";
				dataArr["expected_itemtype"] = data[0][1];
				dataArr["itemnum2"] = "0";
				dataArr["itemnum"] = data[0][0];
				dataArr["price"] = data[1];
				dataArr["action"] = "enhance";
				dataArr["gv"] = 42;
				dataArr["userID"] = userVars["userID"];
				dataArr["password"] = userVars["password"];

				prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
				webCall("inventory_new", dataArr, function(webData)
				{
					updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
					populateInventory();
					populateCharacterInventory();
					updateAllFields();
				}, true);
			};
			question = true;
			break;
		case "reinforce":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			//var servData = [itemData, [0, "", "discard"]];
			var enhancePrice = enhanceValue(itemType[0]);
			extraData = [itemData, enhancePrice];
			prompt.innerHTML = "";
			prompt.innerHTML += "Are you sure you want to reinforce the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += " for <span style='color: #12FF00;'>1 Rare Metal Scrap</span>? This cannot be reversed.";
			action = function(data)
			{
				var dataArr = {};
				dataArr["pagetime"] = userVars["pagetime"];
				dataArr["templateID"] = userVars["template_ID"];
				dataArr["sc"] = userVars["sc"];
				dataArr["creditsnum"] = 0;
				dataArr["buynum"] = 0;
				dataArr["renameto"] = "";
				dataArr["expected_itemprice"] = "-1";
				dataArr["expected_itemtype2"] = "";
				dataArr["expected_itemtype"] = data[0][1];
				dataArr["itemnum2"] = "0";
				dataArr["itemnum"] = data[0][0];
				dataArr["price"] = data[1];
				dataArr["action"] = "reinforce";
				dataArr["gv"] = 42;
				dataArr["userID"] = userVars["userID"];
				dataArr["password"] = userVars["password"];

				prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
				webCall("inventory_new", dataArr, function(webData)
				{
					updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
					populateInventory();
					populateCharacterInventory();
					updateAllFields();
				}, true);
			};
			question = true;
			break;
		case "adye":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			//var servData = [itemData, [0, "", "discard"]];
			var dyePrice = dyeValue(itemType[0]);
			extraData = [itemData, dyePrice];
			prompt.innerHTML = "This will give the item a random colour. Are you sure you want to re-colour the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += " for $" + nf.format(dyePrice) + "?";
			action = function(data)
			{
				var dataArr = {};
				dataArr["pagetime"] = userVars["pagetime"];
				dataArr["templateID"] = userVars["template_ID"];
				dataArr["sc"] = userVars["sc"];
				dataArr["creditsnum"] = 0;
				dataArr["buynum"] = 0;
				dataArr["renameto"] = "";
				dataArr["expected_itemprice"] = "-1";
				dataArr["expected_itemtype2"] = "";
				dataArr["expected_itemtype"] = data[0][1];
				dataArr["itemnum2"] = "0";
				dataArr["itemnum"] = data[0][0];
				dataArr["price"] = data[1];
				dataArr["action"] = "apprendye";
				dataArr["gv"] = 42;
				dataArr["userID"] = userVars["userID"];
				dataArr["password"] = userVars["password"];

				prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
				webCall("inventory_new", dataArr, function(webData)
				{
					updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
					populateInventory();
					populateCharacterInventory();
					updateAllFields();
					renderAvatarUpdate();
				}, true);
			};
			question = true;
			break;
		case "mdye":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];

			var clothingImg = document.createElement("div");
			clothingImg.classList.add("opElem");
			clothingImg.style.width = "160px";
			clothingImg.style.height = "350px";
			clothingImg.style.left = "-150px";
			clothingImg.style.top = "-150px";
			clothingImg.classList.add("characterRender");
			clothingImg.style.opacity = "1";


			//var servData = [itemData, [0, "", "discard"]];
			prompt.innerHTML = "Please choose a colour below for the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += ". This will cost ";
			switch(globalData[itemType[0]]["itemcat"])
			{
				case "armour":
					prompt.innerHTML += 250;
					extraData = [itemData, 250];
					break;
				case "item":
					prompt.innerHTML += 100;
					extraData = [itemData, 100];
					break;
			}
			prompt.innerHTML += " credits.";

			var colourInput = document.createElement("select");
			colourInput.style.position = "absolute";
			colourInput.style.left = "78px";
			colourInput.style.top = "50px";
			colourInput.style.width = "100px";
			var colourOptions = globalData[itemType[0]]["othercolours"].split(",");
			colourInput.value = colourOptions[0];

			colourInput.style.backgroundColor = "#" + colourArray[colourOptions[0]][0];
			colourInput.style.color = "#" + colourArray[colourOptions[0]][1];
			for(var i in colourOptions)
			{
				var colourSelection = document.createElement("option");
				colourSelection.style.backgroundColor = "#" + colourArray[colourOptions[i]][0];
				colourSelection.style.color = "#" + colourArray[colourOptions[i]][1];
				colourSelection.value = colourOptions[i];
				colourSelection.textContent = colourOptions[i];

				colourInput.appendChild(colourSelection);
			}

			moddedVars = JSON.parse(JSON.stringify(userVars));

			var typeToChange = "";
			if(globalData[itemType[0]]["itemcat"] === "armour")
			{
				typeToChange = "DFSTATS_df_armourtype"; //

			} else if(globalData[itemType[0]]["itemcat"] === "item" && globalData[itemType[0]]["clothingtype"])
			{
				typeToChange = "DFSTATS_df_avatar_" + globalData[itemType[0]]["clothingtype"];
			}

			moddedVars[typeToChange] = itemType[0] + "_colour" + colourOptions[0];
			if(!unblockedSlot(itemType[0]))
			{
				moddedVars["DFSTATS_df_avatar_" + blockingItem] = "";
			}

			colourInput.addEventListener("change", function()
			{
				colourInput.style.backgroundColor = "#" + colourArray[colourInput.value][0];
				colourInput.style.color = "#" + colourArray[colourInput.value][1];

				moddedVars[typeToChange] = itemType[0] + "_colour" + colourInput.value;

				renderAvatarUpdate(clothingImg, moddedVars);
			});
			prompt.appendChild(colourInput);
			prompt.appendChild(clothingImg);
			renderAvatarUpdate(clothingImg, moddedVars);
			action = function(data)
			{
				var dataArr = {};
				dataArr["pagetime"] = userVars["pagetime"];
				dataArr["templateID"] = userVars["template_ID"];
				dataArr["sc"] = userVars["sc"];
				dataArr["creditsnum"] = 0;
				dataArr["buynum"] = 0;
				dataArr["renameto"] = prompt.querySelector("select").value;
				dataArr["expected_itemprice"] = "-1";
				dataArr["expected_itemtype2"] = "";
				dataArr["expected_itemtype"] = data[0][1];
				dataArr["itemnum2"] = "0";
				dataArr["itemnum"] = data[0][0];
				dataArr["price"] = data[1];
				dataArr["action"] = "masterdye";
				dataArr["gv"] = 42;
				dataArr["userID"] = userVars["userID"];
				dataArr["password"] = userVars["password"];

				prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
				webCall("inventory_new", dataArr, function(webData)
				{
					updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
					populateInventory();
					populateCharacterInventory();
					updateAllFields();
					renderAvatarUpdate();
				}, true);
			};
			question = true;
			break;
		case "godcraft":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			//var servData = [itemData, [0, "", "discard"]];
			var enhancePrice = enhanceValue(itemType[0]);
			prompt.innerHTML = "Are you sure you want to godcraft the ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += " for ";
			switch(globalData[itemType[0]]["itemcat"])
			{
				case "weapon":
					prompt.innerHTML += 250;
					extraData = [itemData, 250];
					break;
				case "armour":
					prompt.innerHTML += 500;
					extraData = [itemData, 250];
					break;
			}
			prompt.innerHTML += " credits?";
			action = function(data)
			{
				var dataArr = {};
				dataArr["pagetime"] = userVars["pagetime"];
				dataArr["templateID"] = userVars["template_ID"];
				dataArr["sc"] = userVars["sc"];
				dataArr["creditsnum"] = 0;
				dataArr["buynum"] = 0;
				dataArr["renameto"] = "";
				dataArr["expected_itemprice"] = "-1";
				dataArr["expected_itemtype2"] = "";
				dataArr["expected_itemtype"] = data[0][1];
				dataArr["itemnum2"] = "0";
				dataArr["itemnum"] = data[0][0];
				dataArr["price"] = data[1];
				dataArr["action"] = "godcraft";
				dataArr["gv"] = 42;
				dataArr["userID"] = userVars["userID"];
				dataArr["password"] = userVars["password"];

				prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
				webCall("inventory_new", dataArr, function(webData)
				{
					updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
					populateInventory();
					populateCharacterInventory();
					updateAllFields();
				}, true);
			};
			question = true;
			break;
		case "rename":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			extraData = [itemData, 500];

			//prompt.textContent = "We ask that you only use names that fit with the setting of Dead Frontier. Staff reserve the right to remove names which they consider inconsisten with the style of the game. In this event, your credits will be refunded.";
			prompt.innerHTML = "Pick an appropriate name for your ";
			if(itemData[1].indexOf("_name") >= 0)
			{
				prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			} else
			{
				prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
			}
			prompt.innerHTML += ".";

			var priceHolder = document.createElement("div");
			priceHolder.style.position = "relative";
			priceHolder.style.height = "43px";
			var priceLabel = document.createElement("label");
			priceLabel.textContent = "Custom Name: ";
			priceLabel.style.color = "#ffff00";
			var priceInput = document.createElement("input");
			priceInput.dataset.type = "newname";
			priceInput.style.backgroundColor = "rgba(160,160,160,0.3)";
			priceInput.style.width = "162px";
			priceInput.style.color = "red";
			priceInput.type = "text";
			priceInput.value = '';

			priceLabel.appendChild(priceInput);
			priceHolder.appendChild(priceLabel);
			prompt.appendChild(priceHolder);
			action = function(data)
			{
				var nickname = prompt.querySelector("input").value;

				prompt.innerHTML = "Are you sure you want to rename your ";
				if(data[0][1].indexOf("_name") >= 0)
				{
					prompt.innerHTML += "<span style='color: red;'>" + data[0][1].substring(data[0][1].indexOf("_name") + 5) + "</span>";
				} else
				{
					prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
				}
				prompt.innerHTML += " to <i>" + nickname + "</i> for 500 credits?";

				var noButton = document.createElement("button");

				noButton.style.position = "absolute";
				noButton.style.top = "72px";
				noButton.addEventListener("click", function()
				{
					prompt.parentNode.style.display = "none";
					prompt.innerHTML = "";
					pageLock = false;
				});
				noButton.textContent = "No";
				noButton.style.right = "86px";
				var yesButton = document.createElement("button");
				yesButton.textContent = "Yes";
				yesButton.style.position = "absolute";
				yesButton.style.left = "86px";
				yesButton.style.top = "72px";
				yesButton.addEventListener("click", function()
				{
					data[2] = nickname;
					var dataArr = {};
					dataArr["pagetime"] = userVars["pagetime"];
					dataArr["templateID"] = userVars["template_ID"];
					dataArr["sc"] = userVars["sc"];
					dataArr["creditsnum"] = 0;
					dataArr["buynum"] = 0;
					dataArr["renameto"] = data[2];
					dataArr["expected_itemprice"] = "-1";
					dataArr["expected_itemtype2"] = "";
					dataArr["expected_itemtype"] = data[0][1];
					dataArr["itemnum2"] = "0";
					dataArr["itemnum"] = data[0][0];
					dataArr["price"] = data[1];
					dataArr["action"] = "rename";
					dataArr["gv"] = 42;
					dataArr["userID"] = userVars["userID"];
					dataArr["password"] = userVars["password"];

					prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
					webCall("inventory_new", dataArr, function(webData)
					{
						updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
						populateInventory();
						populateCharacterInventory();
						updateAllFields();
					}, true);
				});
				prompt.appendChild(yesButton);
				prompt.appendChild(noButton);
				prompt.onkeydown = function(e)
				{
					if(e.keyCode === 13)
					{
						prompt.onkeydown = null;
						yesButton.click();
					}
				};
				prompt.focus();
			};
			question = true;
			break;
		case "removerename":
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			extraData = [itemData, 50];

			prompt.innerHTML = "Are you sure you want to remove the rename from your ";
			prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
			prompt.innerHTML += ". This will cost 50 credits.";

			action = function(data)
			{
				var dataArr = {};
				dataArr["pagetime"] = userVars["pagetime"];
				dataArr["templateID"] = userVars["template_ID"];
				dataArr["sc"] = userVars["sc"];
				dataArr["creditsnum"] = 0;
				dataArr["buynum"] = 0;
				dataArr["renameto"] = "";
				dataArr["expected_itemprice"] = "-1";
				dataArr["expected_itemtype2"] = "";
				dataArr["expected_itemtype"] = data[0][1];
				dataArr["itemnum2"] = "0";
				dataArr["itemnum"] = data[0][0];
				dataArr["price"] = data[1];
				dataArr["action"] = "removerename";
				dataArr["gv"] = 42;
				dataArr["userID"] = userVars["userID"];
				dataArr["password"] = userVars["password"];

				prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
				webCall("inventory_new", dataArr, function(webData)
				{
					updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
					populateInventory();
					populateCharacterInventory();
					updateAllFields();
				}, true);
			};
			question = true;
			break;
		case "buyservice":
			// buyadminister
			// buyrepair
			// buycook
			prompt.textContent = "Are you sure you want to hire " + nSlot.parentNode.querySelector(".seller").textContent + " for $" + nSlot.dataset.price;
			itemData = [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id];
			extraData[0] = itemData;
			extraData[1] = scrapAmount(currentItem.dataset.type, currentItem.dataset.quantity);
			extraData["buynum"] = nSlot.dataset.buynum;
			extraData["price"] = nSlot.dataset.price;
			switch(nSlot.dataset.profession)
			{
				case "Engineer":
					extraData["action"] = "buyrepair";
					break;
				case "Chef":
					extraData["action"] = "buycook";
					break;
				case "Doctor":
					extraData["action"] = "buyadminister";
					break;
			}
			action = function(data)
			{
				switch(data["action"])
				{
					case "buyrepair":
						playSound("repair");
						break;
					case "buyadminister":
						playSound("heal");
						break;
					case "buycook":
						playSound("cook");
						break;
				}

				var dataArr = {};
				dataArr["pagetime"] = userVars["pagetime"];
				dataArr["templateID"] = userVars["template_ID"];
				dataArr["sc"] = userVars["sc"];
				dataArr["creditsnum"] = 0;
				dataArr["buynum"] = data["buynum"];
				dataArr["renameto"] = "undefined`undefined";
				dataArr["expected_itemprice"] = data["price"];
				dataArr["expected_itemtype2"] = "";
				dataArr["expected_itemtype"] = "";
				dataArr["itemnum2"] = "0";
				dataArr["itemnum"] = data[0][0];
				dataArr["price"] = data[1];
				dataArr["action"] = data["action"];
				dataArr["gv"] = 42;
				dataArr["userID"] = userVars["userID"];
				dataArr["password"] = userVars["password"];

				prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
				webCall("inventory_new", dataArr, function(webData)
				{
					updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
					populateCharacterInventory();
					search();
				}, true);
			};
			question = true;
			break;
		case "giveToChar":
			prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
			prompt.parentNode.style.display = "block";
			if(globalData[itemType[0]]["canread"] === "1")
			{
				window.location.href = "index.php?page=39&book=" + itemType[0];
				return;
			}
			var dataArr = {};
			dataArr["pagetime"] = userVars["pagetime"];
			dataArr["templateID"] = userVars["template_ID"];
			dataArr["sc"] = userVars["sc"];
			dataArr["creditsnum"] = 0;
			dataArr["buynum"] = 0;
			dataArr["renameto"] = "undefined`undefined";
			dataArr["expected_itemprice"] = "-1";
			dataArr["expected_itemtype2"] = "";
			dataArr["expected_itemtype"] = currentItem.dataset.type;
			dataArr["itemnum2"] = "0";
			dataArr["itemnum"] = currentItem.parentNode.dataset.slot;
			dataArr["price"] = 0;
			dataArr["gv"] = 42;
			var doPageRefresh = false;
			if(parseInt(globalData[itemType[0]]["healthrestore"]) > 0)
			{
				if(globalData[itemType[0]]["consume_sound"])
				{
					playSound(globalData[itemType[0]]["consume_sound"]);
				} else
				{
					playSound("heal");
				}
				dataArr["action"] = "newuse";
			} else if(parseInt(globalData[itemType[0]]["foodrestore"]) > 0)
			{
				if(globalData[itemType[0]]["consume_sound"])
				{
					playSound(globalData[itemType[0]]["consume_sound"]);
				} else
				{
					playSound("eat");
				}
				dataArr["action"] = "newconsume";
			} else if(globalData[itemType[0]]["boostdamagehours"] > 0 || globalData[itemType[0]]["boostexphours"] > 0 || globalData[itemType[0]]["boostspeedhours"] > 0)
			{
				if(globalData[itemType[0]]["consume_sound"])
				{
					playSound(globalData[itemType[0]]["consume_sound"]);
				} else
				{
					playSound("heal");
				}
				dataArr["action"] = "newboost";
			} else if(globalData[itemType[0]]["opencontents"] && globalData[itemType[0]]["opencontents"].length > 0)
			{
				if(globalData[itemType[0]]["consume_sound"])
				{
					playSound(globalData[itemType[0]]["consume_sound"]);
				} else
				{
					playSound("read");
				}
				dataArr["action"] = "newopen";
			} else if(globalData[itemType[0]]["gm_days"] && globalData[itemType[0]]["gm_days"] !== "0")
			{
				if(globalData[itemType[0]]["consume_sound"])
				{
					playSound(globalData[itemType[0]]["consume_sound"]);
				} else
				{
					playSound("eat");
				}
				dataArr["action"] = "newuse";
				doPageRefresh = true;
			}
			dataArr["userID"] = userVars["userID"];
			dataArr["password"] = userVars["password"];
			webCall("inventory_new", dataArr, function(webData)
			{
				if(doPageRefresh)
				{
					location.reload(true);
					return;
				}
				updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
				populateInventory();
				populateCharacterInventory();
				updateAllFields();
			}, true);
			return;
			break;
		case "newcook":
		case "newadminister":
		case "newrepair":
			prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
			prompt.parentNode.style.display = "block";

			switch(nSlot.dataset.action)
			{
				case "newcook":
					playSound("cook");
					break;
				case "newadminister":
					playSound("heal");
					break;
				case "newrepair":
					playSound("repair");
					break;
			}

			var dataArr = {};
			dataArr["pagetime"] = userVars["pagetime"];
			dataArr["templateID"] = userVars["template_ID"];
			dataArr["sc"] = userVars["sc"];
			dataArr["creditsnum"] = 0;
			dataArr["buynum"] = 0;
			dataArr["renameto"] = "undefined`undefined";
			dataArr["expected_itemprice"] = "-1";
			dataArr["expected_itemtype2"] = "";
			dataArr["expected_itemtype"] = currentItem.dataset.type;
			dataArr["itemnum2"] = "0";
			dataArr["itemnum"] = currentItem.parentNode.dataset.slot;
			dataArr["action"] = nSlot.dataset.action;
			dataArr["gv"] = 42;
			dataArr["price"] = scrapAmount(itemType[0]);
			dataArr["userID"] = userVars["userID"];
			dataArr["password"] = userVars["password"];


			webCall("inventory_new", dataArr, function(webData)
			{
				updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
				populateInventory();
				populateCharacterInventory();
				updateAllFields();
			}, true);
			return;
			break;
	}
	var noButton = document.createElement("button");

	noButton.style.position = "absolute";
	noButton.style.top = "72px";
	noButton.addEventListener("click", function()
	{
		cleanPlacementMessage();
		prompt.parentNode.style.display = "none";
		prompt.innerHTML = "";
		prompt.classList.remove("warning");
		prompt.classList.remove("redhighlight");
		pageLock = false;
	});
	if(question)
	{
		noButton.textContent = "No";
		noButton.style.right = "86px";
		var yesButton = document.createElement("button");
		yesButton.textContent = "Yes";
		yesButton.style.position = "absolute";
		yesButton.style.left = "86px";
		yesButton.style.top = "72px";
		yesButton.addEventListener("click", function()
		{
			yesButton.disabled = true;
			cleanPlacementMessage();
			prompt.classList.remove("warning");
			prompt.classList.remove("redhighlight");
			action(extraData);
		});
		var dataInput = prompt.querySelectorAll("input");
		if(dataInput.length)
		{
			if(marketLastMoney === false)
			{
				yesButton.disabled = true;
			}

			for(var h in dataInput)
			{
				dataInput[h].oninput = function(dE)
				{
					var keepDisabled = false;
					for(var g in dataInput)
					{
						if(dataInput[g].value === '')
						{
							keepDisabled = true;
						}
					}
					if(keepDisabled)
					{
						yesButton.disabled = true;
					} else
					{
						yesButton.disabled = false;
					}
					if(dE.target.type === "number")
					{
						if(dE.target.value < 0)
						{
							dE.target.value = 0;
						} else if(parseInt(dE.target.value) > parseInt(dE.target.max))
						{
							dE.target.value = dE.target.max;
						}
						if(dE.target.classList.contains("moneyField"))
						{
							if(itemData[1] === "credits")
							{
								if(dE.target.value < scrapValue(itemData[1], dataInput[0].value))
								{
									var msgX = (prompt.getBoundingClientRect().left - 20) + prompt.offsetWidth / 2 - 165 / 2;
									var msgY = (prompt.getBoundingClientRect().top) + 90;
									displayPlacementMessage("This is less than scrap value for this item ($" + scrapValue(itemData[1], dataInput[0].value) + ")", msgX, msgY, "ERROR");
								} else
								{
									cleanPlacementMessage();
								}
							} else
							{
								if(dE.target.value < scrapValue(itemData[1], itemData[3]))
								{
									var msgX = (prompt.getBoundingClientRect().left - 20) + prompt.offsetWidth / 2 - 165 / 2;
									var msgY = (prompt.getBoundingClientRect().top) + 90;
									displayPlacementMessage("This is less than scrap value for this item ($" + scrapValue(itemData[1], itemData[3]) + ")", msgX, msgY, "ERROR");
								} else
								{
									cleanPlacementMessage();
								}
							}
						}
					}
					if(dE.target.type === "text")
					{
						if(dE.target.value.length >= 24)
						{
							dE.preventDefault();
							dE.target.value = dE.target.value.substr(0, 24);
						}
						dE.target.value = dE.target.value.replace(/[^A-Z a-z 0-9\'\`\-	 ]/g, "");
					}
				};
				dataInput[h].onkeydown = function(dE)
				{
					/*if(dE.target.type === "number")
					 {
					 if(dE.key.length === 1 && isNaN(dE.key) && !dE.ctrlKey || dE.key === "v")
					 {
					 dE.preventDefault();
					 }
					 }*/
					if(dE.target.type === "text")
					{
						/*if(!dE.key.match(/[A-Z a-z 0-9\'\`\-	 ]/g))
						 {
						 dE.preventDefault();
						 }*/
						if(dE.key === "'" || dE.key === '"')
						{
							dE.preventDefault();
							if(dE.target.value.length < 24)
							{
								dE.target.value += "`";
								if(dE.target.value === '')
								{
									yesButton.disabled = true;
								} else
								{
									yesButton.disabled = false;
								}
							}
						}
					}
				};
			}
		}
		prompt.appendChild(yesButton);
		prompt.onkeydown = function(e)
		{
			if(e.keyCode === 13)
			{
				prompt.onkeydown = null;
				yesButton.click();
			}
		};
	} else
	{
		noButton.textContent = "ok";
		noButton.style.left = "125px";
		prompt.onkeydown = function(e)
		{
			if(e.keyCode === 13)
			{
				prompt.onkeydown = null;
				noButton.click();
			}
		};
	}
	prompt.appendChild(noButton);
	prompt.parentNode.style.display = "block";
	if(dataInput && dataInput.length)
	{
		dataInput[0].focus();
	} else
	{
		prompt.focus();
	}
}

function doSellFromScript(itemElem, marketElem)
{
	itemType = itemElem.dataset.type.split('_');
	var extraData = {};
	if(tradeTimer !== undefined)
	{
		stopQueryUpdate();
	}
	itemData = [parseInt(itemElem.parentNode.dataset.slot), itemElem.dataset.type, itemElem.parentNode.parentNode.parentNode.id, itemElem.dataset.quantity];
	extraData["itemData"] = itemData;
	// nSlot
	extraData["itemnum"] = itemElem.parentNode.dataset.slot;
	extraData["target"] = marketElem.dataset.target;
	extraData["credits"] = marketElem.dataset.credits;
	extraData["update"] = marketElem.dataset.update;
	extraData["trade"] = marketElem.dataset.trade;
	extraData["type"] = itemElem.dataset.type;
	extraData["cash"] = itemElem.dataset.quantity;
	extraData["action"] = "additem";

	prompt.innerHTML = "Are you sure you want to trade ";
	if(itemData[1].indexOf("_name") >= 0)
	{
		prompt.innerHTML += "<span style='color: red;'>" + itemData[1].substring(itemData[1].indexOf("_name") + 5) + "</span>";
	} else
	{
		prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0]]["name"] + "</span>";
	}
	prompt.innerHTML += "?";

	action = doTradeAction;

	var noButton = document.createElement("button");

	noButton.style.position = "absolute";
	noButton.style.top = "72px";
	noButton.addEventListener("click", function()
	{
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
	yesButton.addEventListener("click", function()
	{
		yesButton.disabled = true;
		cleanPlacementMessage();
		prompt.classList.remove("warning");
		prompt.classList.remove("redhighlight");
		action(extraData);
	});
	var dataInput = prompt.querySelectorAll("input");
	if(dataInput.length)
	{
		yesButton.disabled = true;
		for(var h in dataInput)
		{
			dataInput[h].oninput = function(dE)
			{
				var keepDisabled = false;
				for(var g in dataInput)
				{
					if(dataInput[g].value === '')
					{
						keepDisabled = true;
					}
				}
				if(keepDisabled)
				{
					yesButton.disabled = true;
				} else
				{
					yesButton.disabled = false;
				}
				if(dE.target.type === "number")
				{
					if(dE.target.value < 0)
					{
						dE.target.value = 0;
					} else if(parseInt(dE.target.value) > parseInt(dE.target.max))
					{
						dE.target.value = dE.target.max;
					}
					if(dE.target.classList.contains("moneyField"))
					{
						if(itemData[1] === "credits")
						{
							if(dE.target.value < scrapValue(itemData[1], dataInput[0].value))
							{
								var msgX = (prompt.getBoundingClientRect().left - 20) + prompt.offsetWidth / 2 - 165 / 2;
								var msgY = (prompt.getBoundingClientRect().top) + 90;
								displayPlacementMessage("This is less than scrap value for this item ($" + scrapValue(itemData[1], dataInput[0].value) + ")", msgX, msgY, "ERROR");
							} else
							{
								cleanPlacementMessage();
							}
						} else
						{
							if(dE.target.value < scrapValue(itemData[1], itemData[3]))
							{
								var msgX = (prompt.getBoundingClientRect().left - 20) + prompt.offsetWidth / 2 - 165 / 2;
								var msgY = (prompt.getBoundingClientRect().top) + 90;
								displayPlacementMessage("This is less than scrap value for this item ($" + scrapValue(itemData[1], itemData[3]) + ")", msgX, msgY, "ERROR");
							} else
							{
								cleanPlacementMessage();
							}
						}
					}
				}
				if(dE.target.type === "text")
				{
					if(dE.target.value.length >= 24)
					{
						dE.preventDefault();
						dE.target.value = dE.target.value.substr(0, 24);
					}
					dE.target.value = dE.target.value.replace(/[^A-Z a-z 0-9\'\`\-	 ]/g, "");
				}
			};
			dataInput[h].onkeydown = function(dE)
			{
				/*if(dE.target.type === "number")
				 {
				 if(dE.key.length === 1 && isNaN(dE.key) && !dE.ctrlKey || dE.key === "v")
				 {
				 dE.preventDefault();
				 }
				 }*/
				if(dE.target.type === "text")
				{
					/*if(!dE.key.match(/[A-Z a-z 0-9\'\`\-	 ]/g))
					 {
					 dE.preventDefault();
					 }*/
					if(dE.key === "'" || dE.key === '"')
					{
						dE.preventDefault();
						if(dE.target.value.length < 24)
						{
							dE.target.value += "`";
							if(dE.target.value === '')
							{
								yesButton.disabled = true;
							} else
							{
								yesButton.disabled = false;
							}
						}
					}
				}
			};
		}
	}
	prompt.appendChild(yesButton);
	prompt.onkeydown = function(e)
	{
		if(e.keyCode === 13)
		{
			prompt.onkeydown = null;
			yesButton.click();
		}
	};
	prompt.appendChild(noButton);
	prompt.parentNode.style.display = "block";
	if(dataInput && dataInput.length)
	{
		dataInput[0].focus();
	} else
	{
		prompt.focus();
	}
}

function itemNamer(itemStr, quantity)
{
	var slotData = itemStr.trim().split("_");
	var prename = "";
	var itemName = "";
	for(var x in slotData)
	{
		if(slotData[x].indexOf("colour") >= 0)
		{
			if(slotData[x].indexOf("^") !== -1)
			{
				prename += "Custom Colour ";
			} else
			{
				prename += slotData[x].substring(6) + " ";
			}
		} else
			if(slotData[x].indexOf("name") >= 0)
			{
				itemName += slotData[x].substring(4) + " ";
			} else
				if(slotData[x].indexOf("cooked") >= 0)
				{
					prename += "Cooked ";
				}
	}
	if(itemName === "")
	{
		itemName += globalData[slotData[0]]["name"];
	}
	if(itemName === "Credits")
	{
		itemName = quantity + " " + itemName;
	}
	return (prename + itemName).trim();
}

function scrapItem(data)
{
	var page = window.location.search.substring(1).split('&')[0];
	if(page !== "page=24")
	{
		prompt.innerHTML = "<div style='text-align: center'>You cannot scrap outside of The Yard...</div>";
		setTimeout(function()
		{
			populateInventory();
			populateCharacterInventory();
			updateAllFields();
			renderAvatarUpdate();
		}, 5000);
		return;
	}
	playSound("shop_buysell");
	var dataArr = {};
	dataArr["pagetime"] = userVars["pagetime"];
	dataArr["templateID"] = userVars["template_ID"];
	dataArr["sc"] = userVars["sc"];
	dataArr["creditsnum"] = 0;
	dataArr["buynum"] = 0;
	dataArr["renameto"] = "";
	dataArr["expected_itemprice"] = "-1";
	dataArr["expected_itemtype2"] = "";
	dataArr["expected_itemtype"] = data[0][1];
	dataArr["itemnum2"] = "0";
	dataArr["itemnum"] = data[0][0];
	dataArr["price"] = data[1];
	dataArr["action"] = data["action"];
	dataArr["gv"] = 42;
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];
	prompt.classList.remove("warning");
	prompt.classList.remove("redhighlight");
	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArr, function(webData)
	{
		updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
		populateInventory();
		populateCharacterInventory();
		updateAllFields();
		renderAvatarUpdate();
	}, true);
}

function sellpriceConfirm(data)
{
	var salePrice = 0;
	var quantity = false;
	var priceInput = prompt.querySelector("input[data-type='price']");
	if(priceInput.value !== "")
	{
		salePrice = parseInt(priceInput.value);
	}
	if(data["itemData"][1] === "credits")
	{
		var creditInput = prompt.querySelector("input[data-type='credit']");
		data[3] = creditInput.value;
		quantity = creditInput.value;
	}
	var itemType = data["itemData"][1].split('_');
	if(getItemType(globalData[itemType[0].trim()]) === "ammo")
	{
		quantity = data["itemData"][3];
	}

	prompt.innerHTML = "Are you sure you want to sell " + (quantity ? quantity + " " : " ");
	if(data["itemData"][1].indexOf("_name") >= 0)
	{
		prompt.innerHTML += "<span style='color: red;'>" + data["itemData"][1].substring(data["itemData"][1].indexOf("_name") + 5) + "</span>";
	} else
	{
		var itemType = data["itemData"][1].split('_');
		prompt.innerHTML += "<span style='color: red;'>" + globalData[itemType[0].trim()]["name"] + "</span>";
	}
	prompt.innerHTML += " for " + (salePrice ? "$" + nf.format(salePrice) : "free") + "?";
	prompt.classList.add("warning");

	var noButton = document.createElement("button");

	noButton.style.position = "absolute";
	noButton.style.top = "72px";
	noButton.addEventListener("click", function()
	{
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
	yesButton.addEventListener("click", function()
	{
		data[2] = salePrice;
		prompt.classList.remove("warning");
		prompt.classList.remove("redhighlight");
		sellItem(data);
	});
	prompt.appendChild(yesButton);
	prompt.appendChild(noButton);
	prompt.onkeydown = function(e)
	{
		if(e.keyCode === 13)
		{
			prompt.onkeydown = null;
			yesButton.click();
		}
	};
	prompt.focus();
}

function sellItem(data)
{
	marketLastMoney = data[2];

	var dataArr = {};
	dataArr["pagetime"] = userVars["pagetime"];
	dataArr["templateID"] = userVars["template_ID"];
	dataArr["sc"] = userVars["sc"];
	if(data["sendto"])
	{
		dataArr["memberto"] = data["sendto"];
	}
	dataArr["buynum"] = 0;
	dataArr["renameto"] = "";
	dataArr["expected_itemprice"] = "-1"; // same on all sales
	dataArr["expected_itemtype2"] = "";
	dataArr["expected_itemtype"] = "";
	dataArr["itemnum2"] = "0";
	dataArr["itemnum"] = "0"; // slot number
	dataArr["price"] = data[2]; // actual item price they are selling for
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];
	dataArr["gv"] = 42;

	if(data["itemData"][1] === "credits")
	{
		dataArr["creditsnum"] = data[3];
		dataArr["action"] = "newsellcredits";
	} else
	{
		dataArr["expected_itemtype"] = data["itemData"][1];
		dataArr["itemnum"] = data["itemData"][0];
		dataArr["action"] = "newsell";
	}

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArr, function(webData)
	{
		updateIntoArr(flshToArr(webData, "DFSTATS_"), userVars);
		if(data["sendto"])
		{
			getPrivateTrading(data["sendto"]);
		} else
		{
			getSellingList();
		}
	}, true);
}

function inventoryAction(e)
{
	var question = false;
	var action;
	var extraData = {};
	switch(e.target.dataset.action)
	{
		case "craft":
			var itemType = e.target.parentNode.dataset.type.split('_');
			extraData["type"] = e.target.parentNode.dataset.type;
			prompt.textContent = "Are you sure you want to craft the ";
			prompt.textContent += globalData[itemType[0]]["name"];
			prompt.textContent += " for " + (globalData[itemType[0]]["craftPrice"]) + "?";
			action = craftItem;
			question = true;
			break;
		case "storageUpgrade":
			var neededCash = getUpgradePrice();
			if(neededCash <= userVars["DFSTATS_df_cash"])
			{
				prompt.textContent = "Are you sure you would like to buy 5 more slots of storage space for $" + nf.format(neededCash) + "?";
				action = upgradeStorage;
				question = true;
			} else
			{
				prompt.textContent = "You do not have enough cash to expand your storage locker. It will cost $" + nf.format(neededCash) + " to buy 5 more slots.";
			}
			break;
		case "takeFromStorage":
			shiftItem(e.target);
			break;
		default:
			console.log(e.target.dataset.action);
			return;
			break;
	}
	var noButton = document.createElement("button");

	noButton.style.position = "absolute";
	noButton.style.top = "72px";
	noButton.addEventListener("click", function()
	{
		prompt.parentNode.style.display = "none";
		prompt.innerHTML = "";
		pageLock = false;
	});
	if(question)
	{
		noButton.textContent = "No";
		noButton.style.right = "86px";
		var yesButton = document.createElement("button");
		yesButton.textContent = "Yes";
		yesButton.style.position = "absolute";
		yesButton.style.left = "86px";
		yesButton.style.top = "72px";
		yesButton.addEventListener("click", function()
		{
			yesButton.disabled = true;
			action(extraData);
		});
		prompt.appendChild(yesButton);
		prompt.onkeydown = function(e)
		{
			if(e.keyCode === 13)
			{
				prompt.onkeydown = null;
				yesButton.click();
			}
		};
	} else
	{
		noButton.textContent = "ok";
		noButton.style.left = "125px";
		prompt.onkeydown = function(e)
		{
			if(e.keyCode === 13)
			{
				prompt.onkeydown = null;
				noButton.click();
			}
		};
	}
	prompt.appendChild(noButton);
	prompt.parentNode.style.display = "block";
	prompt.focus();
}

function craftItem(data)
{
	playSound("repair");
	var dataArr = {
		'craftItem': data["type"],
		'action': "craft",
		'userID': userVars["userID"],
		'password': userVars["password"]
	};

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("DF3D/DF3D_Crafting", dataArr, function(data)
	{
		updateIntoArr(flshToArr(data, "DFSTATS_"), userVars);
		initiateCrafting();
		populateInventory();
		updateAllFields();
	}, true);
}

function upgradeStorage()
{
	playSound("buysell");
	var dataArr = {};
	dataArr["pagetime"] = userVars["pagetime"];
	dataArr["templateID"] = userVars["template_ID"];
	dataArr["sc"] = userVars["sc"];
	dataArr["creditsnum"] = "";
	dataArr["buynum"] = "";
	dataArr["renameto"] = "undefined`undefined";
	dataArr["expected_itemprice"] = "-1";
	dataArr["expected_itemtype2"] = "";
	dataArr["expected_itemtype"] = "";
	dataArr["itemnum2"] = "0";
	dataArr["itemnum"] = "0";
	dataArr["price"] = getUpgradePrice();
	dataArr["action"] = "buystorage";
	dataArr["gv"] = 42;
	dataArr["userID"] = userVars["userID"];
	dataArr["password"] = userVars["password"];

	prompt.innerHTML = "<div style='text-align: center'>Loading, please wait...</div>";
	webCall("inventory_new", dataArr, function(data)
	{
		reloadStorageData(data);
	}, true);
}

function unhoverAction(e)
{
	if(!active && !pageLock)
	{
		cleanPlacementMessage();
	}
}

function hoverAction(e)
{
	if(!active && !pageLock)
	{
		if(e.shiftKey)
		{
			var realTarget = document.elementFromPoint(mousePos[0], mousePos[1]);
			if(realTarget.classList.contains("item"))
			{
				var itemType = realTarget.dataset.type.split("_")[0].trim();
				var canShift = false;
				if(document.getElementById("storage"))
				{
					if(realTarget.parentNode.parentNode.parentNode.id === "storage")
					{
						canShift = findFirstEmptyGenericSlot("inv");
						if(canShift !== false)
						{
							canShift = "Take";
						}
					} else
					{
						canShift = findFirstEmptyStorageSlot();
						if(canShift !== false)
						{
							canShift = "Store";
						}
					}
				} else if(document.getElementById("implants") && realTarget.dataset.itemtype && realTarget.dataset.itemtype === "implant")
				{
					console.log("wot");
					if(realTarget.parentNode.parentNode.parentNode.id === "implants")
					{
						canShift = findFirstEmptyGenericSlot("inv");
						if(canShift)
						{
							canShift = "Unequip";
						}
					} else
					{
						canShift = findFirstEmptyGenericSlot("implant");
						if(canShift !== false)
						{
							canShift = isImplantAvailable(itemType);
						}
						if(canShift !== false)
						{
							canShift = "Equip";
						}
					}
				} else if(document.getElementById("character") && realTarget.dataset.itemtype)
				{
					if(realTarget.dataset.itemtype === "weapon")
					{
						if(realTarget.parentNode.dataset.slottype === "weapon")
						{
							canShift = findFirstEmptyGenericSlot("inv");
							if(canShift !== false)
							{
								canShift = "Equip";
							}
						} else
						{
							var canPassProReq = parseInt(globalData[itemType]["pro_req"]) <= parseInt(userVars["DFSTATS_df_pro" + (globalData[itemType]["wepPro"])]);
							var canPassStrReq = parseInt(globalData[itemType]["str_req"]) <= parseInt(userVars["DFSTATS_df_strength"]);
							if(canPassProReq && canPassStrReq)
							{
								for(var i = 1; i <= 3; i++)
								{
									if(userVars["DFSTATS_df_weapon" + i + "type"] === "")
									{
										canShift = "Equip";
										break;
									}
								}
							}
						}
					} else if(realTarget.dataset.itemtype === "armour")
					{
						if(realTarget.parentNode.dataset.slottype === "armour")
						{
							canShift = findFirstEmptyGenericSlot("inv");
							if(canShift !== false)
							{
								canShift = "Unequip";
							}
						} else
						{
							var canPassStrReq = parseInt(globalData[itemType]["str_req"]) <= parseInt(userVars["DFSTATS_df_strength"]);
							if(canPassStrReq)
							{
								canShift = "Equip";
							}
						}
					} else
					{
						if(globalData[itemType]["clothingtype"] && globalData[itemType]["clothingtype"] !== "" && unblockedSlot(itemType))
						{
							canShift = "Equip";
						}
					}
				} else if(document.getElementById("marketplace") && (/*marketScreen === "sell" ||*/ marketScreen === "itemforitem" && inTradeWindow))
				{
					if(globalData[itemType]["no_transfer"] !== "1" && parseInt(tradeListSize) < parseInt(userVars["DFSTATS_df_invslots"]))
					{
						canShift = "Trade";
					}
				}
				if(canShift !== false)
				{
					displayPlacementMessage(canShift, mousePos[0] + 10, mousePos[1] + 10, "ACTION");
				}
			} else
			{
				cleanPlacementMessage();
			}
		} else if(e.ctrlKey)
		{
			// lockedSlots
			var realTarget = document.elementFromPoint(mousePos[0], mousePos[1]);
			if(realTarget.classList.contains("item"))
			{
				realTarget = realTarget.parentNode;
			}
			if(realTarget.classList.contains("validSlot") && realTarget.dataset.slot)
			{
				var item_slot = parseInt(realTarget.dataset.slot);

				switch(realTarget.parentNode.parentNode.id)
				{
					case "implants":
						item_slot += 1000;
						break;
					case "storage":
						return;
				}
				item_slot += "";
				if($.inArray(item_slot, lockedSlots) === -1)
				{
					displayPlacementMessage("Lock", mousePos[0] + 10, mousePos[1] + 10, "ACTION");
				} else
				{
					displayPlacementMessage("Unlock", mousePos[0] + 10, mousePos[1] + 10, "ACTION");
				}
			} else
			{
				cleanPlacementMessage();
			}
		} else
		{
			//cleanPlacementMessage();
		}
	}
}


function isImplantAvailable(itemType)
{
	var isNotBlocked = true;
	for(var i = 1; i <= userVars["DFSTATS_df_implantslots"]; i++)
	{
		if(userVars["DFSTATS_df_implant" + i + "_type"] !== "")
		{
			if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"])
			{
				var checkType = globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"].split(',');
				for(var k in checkType)
				{
					if(itemType === checkType[k])
					{
						i = userVars["DFSTATS_df_implantslots"] + 1;
						isNotBlocked = false;
						break;
					}
				}
			}
			if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] && globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] === "1")
			{
				if(itemType === userVars["DFSTATS_df_implant" + i + "_type"])
				{
					i = userVars["DFSTATS_df_implantslots"] + 1;
					isNotBlocked = false;
					break;
				}
			}
		}
	}
	return isNotBlocked;
}

function dragStart(e)
{
	if(!active && !pageLock)
	{
		var realTarget = e.target;
		if(realTarget === infoBox)
		{
			infoBox.style.visibility = "hidden";
			realTarget = document.elementFromPoint(mousePos[0], mousePos[1]);
			infoBox.style.visibility = "visible";
		}

		if(e.ctrlKey)
		{
			if(realTarget.classList.contains("validSlot") || realTarget.classList.contains("item"))
			{
				var ctrlTarget = realTarget;
				if(ctrlTarget.classList.contains("item"))
				{
					ctrlTarget = ctrlTarget.parentNode;
				}
				if(ctrlTarget.classList.contains("validSlot") && ctrlTarget.dataset.slot && ctrlTarget.parentNode.parentNode.id !== "storage")
				{
					promptLoading();

					var item_slot = parseInt(ctrlTarget.dataset.slot);

					switch(ctrlTarget.parentNode.parentNode.id)
					{
						case "implants":
							item_slot += 1000;
							break;
						case "storage":
							return;
					}

					item_slot += "";

					var dataArr = [];
					dataArr["itemnum"] = item_slot;
					dataArr["userID"] = userVars["userID"];
					dataArr["password"] = userVars["password"];
					dataArr["sc"] = userVars["sc"];
					dataArr["gv"] = 42;

					if($.inArray(item_slot, lockedSlots) === -1)
					{
						dataArr["action"] = "addSlot";
					} else
					{
						dataArr["action"] = "removeSlot";
					}

					webCall("hotrods/item_lock", dataArr, function(data)
					{
						if(dataArr["action"] === "removeSlot")
						{
							$(ctrlTarget).removeClass("locked");
						}
						lockedSlots = data.split(',');
						doLockedElems();
						pageLock = false;
						prompt.parentNode.style.display = "none";
						prompt.innerHTML = "";
					}, true);
					return;
				}
			}
		}

		if(realTarget.classList.contains("item"))
		{
			e.preventDefault();
			var itemType = realTarget.dataset.type.split("_")[0].trim();
			e.preventDefault();
			if(e.shiftKey)
			{
				var canShift = false;
				if(document.getElementById("storage"))
				{
					if(realTarget.parentNode.parentNode.parentNode.id === "storage")
					{
						canShift = findFirstEmptyGenericSlot("inv");
					} else
					{
						canShift = findFirstEmptyStorageSlot();
					}
				} else if(document.getElementById("implants") && realTarget.dataset.itemtype && realTarget.dataset.itemtype === "implant")
				{
					if(realTarget.parentNode.parentNode.parentNode.id === "implants")
					{
						canShift = findFirstEmptyGenericSlot("inv");
					} else
					{
						canShift = findFirstEmptyGenericSlot("implant");
						if(canShift)
						{
							canShift = isImplantAvailable(itemType);
						}
					}
				} else if(document.getElementById("character") && realTarget.dataset.itemtype)
				{
					if(realTarget.dataset.itemtype === "weapon")
					{
						if(realTarget.parentNode.dataset.slottype === "weapon")
						{
							canShift = findFirstEmptyGenericSlot("inv");
						} else
						{
							var canPassProReq = parseInt(globalData[itemType]["pro_req"]) <= parseInt(userVars["DFSTATS_df_pro" + (globalData[itemType]["wepPro"])]);
							var canPassStrReq = parseInt(globalData[itemType]["str_req"]) <= parseInt(userVars["DFSTATS_df_strength"]);
							if(canPassProReq && canPassStrReq)
							{
								for(var i = 1; i <= 3; i++)
								{
									if(userVars["DFSTATS_df_weapon" + i + "type"] === "")
									{
										canShift = i + 30;
										break;
									}
								}
							}
						}
					} else if(realTarget.dataset.itemtype === "armour")
					{
						if(realTarget.parentNode.dataset.slottype === "armour")
						{
							canShift = findFirstEmptyGenericSlot("inv");
						} else
						{
							var canPassStrReq = parseInt(globalData[itemType]["str_req"]) <= parseInt(userVars["DFSTATS_df_strength"]);
							if(canPassStrReq)
							{
								canShift = true;
							}
						}
					} else
					{
						if(globalData[itemType]["clothingtype"] && globalData[itemType]["clothingtype"] !== "" && unblockedSlot(itemType))
						{
							canShift = true;
						}
					}
				} else if(document.getElementById("marketplace") && (/*marketScreen === "sell" ||*/ marketScreen === "itemforitem" && inTradeWindow))
				{
					if(globalData[itemType]["no_transfer"] !== "1" && parseInt(tradeListSize) < parseInt(userVars["DFSTATS_df_invslots"]))
					{
						clearCard(e);
						cleanPlacementMessage();
						doSellFromScript(realTarget, document.getElementById("marketplace").querySelector("[data-action='tradeitem']"));
						return;
					}
				}

				if(canShift !== false)
				{
					clearCard(e);
					cleanPlacementMessage();
					shiftItem(realTarget);
					return;
				}
			}

			startX = realTarget.getBoundingClientRect().left;
			startY = realTarget.getBoundingClientRect().top;
			active = true;
			canMove = false;
			currentItem = realTarget;
			currentItem.classList.add("colorShift");
			if(currentItem.dataset.quantity && currentItem.dataset.quantity.match(/[0-9]/g))
			{
				currentQuantity = parseInt(currentItem.dataset.quantity);
			} else
			{
				currentQuantity = false;
			}

			var page = window.location.search.substring(1).split('&')[0];
			if(page === "page=24")
			{
				if(currentItem.dataset.type.indexOf("_name") !== -1)
				{
					inventoryHolder.querySelector("div[data-action=removerename]").style.display = "block";
				}
				if(currentItem.parentNode.parentNode.parentNode.id === "inventory")
					if(globalData[itemType]["itemcat"] === "weapon" && globalData[itemType]["pro_req"] >= 120 || globalData[itemType]["itemcat"] === "armour" && globalData[itemType]["shop_level"] - 5 >= 75 || globalData[itemType]["implant"] === "1" && globalData[itemType]["holidayitem"] !== "1")
					{
						inventoryHolder.querySelector("div[data-action=dismantle]").style.display = "block";
					}
			}

			fakeGrabbedItem.src = currentItem.style.backgroundImage.slice(4, -1).replace(/"/g, "");
			setTimeout(function()
			{
				var invHoldOffsets = inventoryHolder.getBoundingClientRect();
				fakeGrabbedItem.style.left = mousePos[0] - invHoldOffsets.left - fakeGrabbedItem.offsetWidth / 2;
				fakeGrabbedItem.style.top = mousePos[1] - invHoldOffsets.top - fakeGrabbedItem.offsetHeight / 2;
				fakeGrabbedItem.classList.add("held");
				fakeGrabbedItem.style.visibility = "visible";
				document.body.style.cursor = "grabbing";
			}, 10);
			clearCard(e);
		}
	}
}

function dragEnd(e)
{
	if(active && !pageLock)
	{
		e.preventDefault();
		if(canMove)
		{
			if(replacee)
			{
				var temp = currentItem.parentNode;
				if((replacee.parentNode.dataset.slottype === currentItem.dataset.itemtype || typeof replacee.parentNode.dataset.slottype === "undefined") && (currentItem.parentNode.dataset.slottype === replacee.dataset.itemtype || typeof currentItem.parentNode.dataset.slottype === "undefined"))
				{
					var itemArray = {
						0: [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id],
						1: [parseInt(replacee.parentNode.dataset.slot), replacee.dataset.type, replacee.parentNode.parentNode.parentNode.id]
					};
					replacee.parentNode.appendChild(currentItem);
					temp.appendChild(replacee);
					pageLock = true;
					updateInventory(itemArray);
				}
				setTranslate(0, 0, replacee);
				replacee.classList.remove("colorShift");
				if(replaceeQuantity)
				{
					replacee.dataset.quantity = replaceeQuantity;
				}
			} else
			{
				fakeGrabbedItem.style.visibility = "hidden";
				currentItem.style.visibility = "hidden";
				var nSlot = document.elementFromPoint(mousePos[0], mousePos[1]);
				fakeGrabbedItem.style.visibility = "visible";
				currentItem.style.visibility = "visible";
				if((nSlot.classList.contains("fakeItem") || nSlot.classList.contains("profitList")) && nSlot.parentNode.classList.contains("fakeSlot"))
				{
					nSlot = nSlot.parentNode;
				} else if((nSlot.parentNode.classList.contains("fakeItem") || nSlot.parentNode.classList.contains("profitList")) && nSlot.parentNode.parentNode.classList.contains("fakeSlot"))
				{
					nSlot = nSlot.parentNode.parentNode;
				}
				if(nSlot.classList.contains("validSlot") && !nSlot.hasChildNodes() && (nSlot.dataset.slottype === currentItem.dataset.itemtype || typeof nSlot.dataset.slottype === "undefined"))
				{
					var itemArray = {
						0: [parseInt(currentItem.parentNode.dataset.slot), currentItem.dataset.type, currentItem.parentNode.parentNode.parentNode.id],
						1: [parseInt(nSlot.dataset.slot), "", nSlot.parentNode.parentNode.id]
					};
					nSlot.appendChild(currentItem);
					pageLock = true;
					updateInventory(itemArray);

				} else if(nSlot.classList.contains("fakeSlot"))
				{
					if(canComplete)
					{
						pageLock = true;
						dragDropAction(e);
					}
				}
			}
		} else
		{
			pageLock = false;
		}
		setTranslate(0, 0, currentItem);
		cleanPlacementMessage();
		if(hoverItem)
		{
			hoverItem.classList.remove("hover");
			hoverItem = null;
		}
		currentItem.classList.remove("colorShift");
		currentItem.classList.remove("held");
		fakeGrabbedItem.style.visibility = "hidden";
		var page = window.location.search.substring(1).split('&')[0];
		if(page === "page=24")
		{
			inventoryHolder.querySelector("div[data-action=removerename]").style.display = "none";
			inventoryHolder.querySelector("div[data-action=dismantle]").style.display = "none";
		}
		replacee = null;
		replaceeQuantity = null;
		currentItem = null;
		startX = null;
		startY = null;
		active = false;
		canMove = false;
		canComplete = false;
		document.body.style.cursor = "default";
		$(".highlight").removeClass("highlight");
		infoCard(e);
	}
}

function displayPlacementMessage(msg, x, y, type)
{
	var floatingText = document.getElementById("textAddon");
	floatingText.textContent = msg;
	floatingText.style.width = "165px";
	var invHoldOffsets = inventoryHolder.getBoundingClientRect();
	//floatingText.style.left = x - invHoldOffsets.left + "px";
	//floatingText.style.top = y - invHoldOffsets.top + "px";

	floatingText.style.visibility = "hidden";
	floatingText.style.display = "block";

	if(y + floatingText.offsetHeight > invHoldOffsets.bottom)
	{
		floatingText.style.top = (y - floatingText.offsetHeight - 40 - invHoldOffsets.top) + "px";
	} else
	{
		floatingText.style.top = (y - invHoldOffsets.top) + "px";
	}

	if(x + floatingText.offsetWidth > invHoldOffsets.right)
	{
		floatingText.style.left = (inventoryHolder.offsetWidth - floatingText.offsetWidth) + "px";
	} else
	{
		floatingText.style.left = (x + 20 - invHoldOffsets.left) + "px";
	}

	switch(type)
	{
		case "ERROR":
			floatingText.style.color = "red";
			break;
		case "ACTION":
			floatingText.style.color = "#E6CC4D";
			//floatingText.classList.add("cashhack");
			//floatingText.dataset.cash = msg;
			break;
	}

	floatingText.style.visibility = "visible";
}

function cleanPlacementMessage()
{
	var floatingText = document.getElementById("textAddon");
	floatingText.style.display = "none";
	floatingText.removeAttribute("class");
}

function unblockedSlot(item)
{
	blockingItems = "";
	var output = true;
	item = item.trim();
	if(globalData[item]["clothingblockslot"])
	{
		if(document.querySelector("[data-slottype='" + globalData[item]["clothingblockslot"] + "']") && document.querySelector("[data-slottype='" + globalData[item]["clothingblockslot"] + "']").hasChildNodes())
		{
			blockingItem = globalData[item]["clothingblockslot"];
			output = false;
		}
	}
	var slots = ["hat", "mask", "coat", "armour", "shirt", "trousers"];
	for(var i in slots)
	{
		if(document.querySelector("[data-slottype='" + slots[i] + "']") && document.querySelector("[data-slottype='" + slots[i] + "']").hasChildNodes())
		{
			var iSlotItem = document.querySelector("[data-slottype='" + slots[i] + "']").childNodes[0].dataset.type.split('_')[0];
			if(globalData[iSlotItem]["clothingblockslot"] && globalData[item]["clothingtype"] && globalData[iSlotItem]["clothingblockslot"] === globalData[item]["clothingtype"])
			{
				blockingItem = globalData[iSlotItem]["clothingtype"];
				output = false;
				break;
			}
		}
	}
	return output;
}

function drag(e)
{
	e.preventDefault();
	$(".highlight").removeClass("highlight");
	if(ieVersion)
	{
		if(dragIteration >= 2)
		{
			dragIteration = 0;
		} else
		{
			dragIteration++;
		}
	}
	if(active && !pageLock && (!ieVersion || dragIteration === 0))
	{
		var slot;
		var displayText = false, valid = false;
		canMove = false;
		hovering = false;
		canComplete = false;
		var itemType = currentItem.dataset.type.split("_")[0].trim();
		currentX = mousePos[0];
		currentY = mousePos[1];

		currentX -= startX - 20;
		currentY -= startY - 20;
		if(currentQuantity !== false)
		{
			currentItem.dataset.quantity = currentQuantity;
		} else
		{
			currentItem.dataset.quantity = "";
		}
		if(replacee)
		{
			replacee.classList.remove("colorShift");
			setTranslate(0, 0, replacee);
			replacee.style.visibility = "visible";
			if(replaceeQuantity !== false)
			{
				replacee.dataset.quantity = replaceeQuantity;
			} else
			{
				replacee.dataset.quantity = "";
			}
			replacee = null;
			replaceeQuantity = false;
		}
		if(inventoryHolder.getBoundingClientRect().left < mousePos[0] && inventoryHolder.getBoundingClientRect().right > mousePos[0] && inventoryHolder.getBoundingClientRect().top < mousePos[1] && inventoryHolder.getBoundingClientRect().bottom > mousePos[1])
		{
			valid = true;
			fakeGrabbedItem.style.display = "none";
			currentItem.style.visibility = "hidden";
			slot = document.elementFromPoint(mousePos[0], mousePos[1]);
			if(slot.classList.contains("validSlot") && !slot.hasChildNodes())
			{
				// Empty slot code
				if(slot.dataset.slottype === currentItem.dataset.itemtype || typeof slot.dataset.slottype === "undefined" && currentItem.dataset.itemtype !== "credits")
				{
					if(slot.dataset.slottype === "armour")
					{
						canMove = true;
						if(parseInt(globalData[itemType]["str_req"]) > parseInt(userVars["DFSTATS_df_strength"]))
						{
							displayPlacementMessage("You don't have enough strength", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
							displayText = true;
							canMove = false;
						}
						if(canMove)
						{
							currentX = slot.getBoundingClientRect().left - startX;
							currentY = slot.getBoundingClientRect().top - startY;
							setTranslate(currentX, currentY, currentItem);
							fakeGrabbedItem.style.visibility = "hidden";
						}
					} else if(slot.dataset.slottype === "weapon")
					{
						canMove = true;
						if(parseInt(globalData[itemType]["pro_req"]) > parseInt(userVars["DFSTATS_df_pro" + (globalData[itemType]["wepPro"])]))
						{
							displayPlacementMessage("You don't have enough " + globalData[itemType]["weptype"].toLowerCase() + " proficiency", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
							displayText = true;
							canMove = false;
						}
						if(canMove && parseInt(globalData[itemType]["str_req"]) > parseInt(userVars["DFSTATS_df_strength"]))
						{
							displayPlacementMessage("You don't have enough strength", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
							displayText = true;
							canMove = false;
						}
						if(canMove)
						{
							currentX = slot.getBoundingClientRect().left - startX;
							currentY = slot.getBoundingClientRect().top - startY;
							setTranslate(currentX, currentY, currentItem);
							fakeGrabbedItem.style.visibility = "hidden";
						}
					} else if(slot.dataset.slottype === "implant")
					{
						canMove = true;
						if(currentItem.parentNode.dataset.slottype !== "implant")
						{
							for(var i = 1; i <= userVars["DFSTATS_df_implantslots"]; i++)
							{
								if(userVars["DFSTATS_df_implant" + i + "_type"] !== "")
								{
									if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"])
									{
										var checkType = globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"].split(',');
										for(var k in checkType)
										{
											if(itemType === checkType[k])
											{
												displayPlacementMessage("This implant is not compatible with " + globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["name"], mousePos[0] + 10, mousePos[1] + 10, "ERROR");
												displayText = true;
												$("[data-slottype=implant][data-slot=" + i + "]").addClass("highlight");
												i = userVars["DFSTATS_df_implantslots"] + 1;
												canMove = false;
												break;
											}
										}
									}
									if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] && globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] === "1")
									{
										if(itemType === userVars["DFSTATS_df_implant" + i + "_type"])
										{
											displayPlacementMessage("You can only equip one of these at a time", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
											displayText = true;
											$("[data-slottype=implant][data-slot=" + i + "]").addClass("highlight");
											i = userVars["DFSTATS_df_implantslots"] + 1;
											canMove = false;
											break;
										}
									}
								}
							}
						}
						if(canMove)
						{
							currentX = slot.getBoundingClientRect().left - startX;
							currentY = slot.getBoundingClientRect().top - startY;
							setTranslate(currentX, currentY, currentItem);
							fakeGrabbedItem.style.visibility = "hidden";
						}
					} else if(unblockedSlot(itemType) || typeof slot.dataset.slottype === "undefined")
					{
						canMove = true;
						currentX = slot.getBoundingClientRect().left - startX;
						currentY = slot.getBoundingClientRect().top - startY;
						setTranslate(currentX, currentY, currentItem);
						fakeGrabbedItem.style.visibility = "hidden";
					} else
					{
						displayPlacementMessage("Something is blocking this item", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
						displayText = true;
					}

				} else
				{
					if(currentItem.dataset.itemtype === "credits")
					{
						displayPlacementMessage("You cannot place credits here", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
						displayText = true;
					} else
					{
						displayPlacementMessage("You cannot place this item here", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
						displayText = true;
					}
				}
			} else if(slot.classList.contains("item") || slot.classList.contains("validSlot"))
			{
				// Switch items
				if(slot.classList.contains("validSlot"))
				{
					slot = slot.childNodes[0];
				}
				if(slot !== currentItem)
				{
					var slotType = slot.dataset.type.trim().split('_')[0];
					var slotMatchCheck = false;
					if(slot.dataset.itemtype === currentItem.dataset.itemtype)
					{
						slotMatchCheck = true;
					}
					var neitherCredits = false;
					if(currentItem.dataset.itemtype !== "credits" && slot.dataset.itemtype !== "credits")
					{
						neitherCredits = true;
					}
					var curSlotClear = false;
					if(typeof currentItem.parentNode.dataset.slottype === "undefined")
					{
						curSlotClear = true;
					}
					var nuSlotClear = false;
					if(typeof slot.parentNode.dataset.slottype === "undefined")
					{
						nuSlotClear = true;
					}
					var parentTypeMatch = false;
					if(currentItem.parentNode.dataset.slottype && slot.parentNode.dataset.slottype && currentItem.parentNode.dataset.slottype === slot.parentNode.dataset.slottype)
					{
						parentTypeMatch = true;
					}
					var aggressorClear = false;
					if(unblockedSlot(itemType))
					{
						aggressorClear = true;
					}
					if(unblockedSlot(slotType))
					{
						aggressorClear = true;
					}
					if(parentTypeMatch && aggressorClear || slotMatchCheck && nuSlotClear && unblockedSlot(itemType) && unblockedSlot(slotType) || slotMatchCheck && curSlotClear && unblockedSlot(slotType) && unblockedSlot(itemType) || curSlotClear && nuSlotClear && neitherCredits)
					{
						replacee = slot;
						if(slot.dataset.quantity && slot.dataset.quantity.match(/[0-9]/g))
						{
							replaceeQuantity = parseInt(slot.dataset.quantity);
						} else
						{
							replaceeQuantity = false;
						}
						if(slot.parentNode.dataset.slottype === "armour")
						{
							canMove = true;
							if(parseInt(globalData[itemType]["str_req"]) > parseInt(userVars["DFSTATS_df_strength"]))
							{
								displayPlacementMessage("You don't have enough strength", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
								displayText = true;
								canMove = false;
							}
						} else if(currentItem.parentNode.dataset.slottype === "armour")
						{
							canMove = true;
							if(parseInt(globalData[slotType]["str_req"]) > parseInt(userVars["DFSTATS_df_strength"]))
							{
								displayPlacementMessage("You don't have enough strength", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
								displayText = true;
								canMove = false;
							}
						} else if(slot.parentNode.dataset.slottype === "weapon")
						{
							canMove = true;
							if(parseInt(globalData[itemType]["pro_req"]) > parseInt(userVars["DFSTATS_df_pro" + (globalData[itemType]["wepPro"])]))
							{
								displayPlacementMessage("You don't have enough " + globalData[itemType]["weptype"].toLowerCase() + " proficiency", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
								displayText = true;
								canMove = false;
							}
							if(canMove && parseInt(globalData[itemType]["str_req"]) > parseInt(userVars["DFSTATS_df_strength"]))
							{
								displayPlacementMessage("You don't have enough strength", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
								displayText = true;
								canMove = false;
							}
						} else if(currentItem.parentNode.dataset.slottype === "weapon")
						{
							canMove = true;
							if(parseInt(globalData[slotType]["pro_req"]) > parseInt(userVars["DFSTATS_df_pro" + (globalData[slotType]["wepPro"])]))
							{
								displayPlacementMessage("You don't have enough " + globalData[slotType]["weptype"].toLowerCase() + " proficiency", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
								displayText = true;
								canMove = false;
							}
							if(canMove && parseInt(globalData[slotType]["str_req"]) > parseInt(userVars["DFSTATS_df_strength"]))
							{
								displayPlacementMessage("You don't have enough strength", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
								displayText = true;
								canMove = false;
							}
						} else if(slot.parentNode.dataset.slottype === "implant")
						{
							canMove = true;
							if(currentItem.parentNode.dataset.slottype !== "implant")
							{
								for(var i = 1; i <= userVars["DFSTATS_df_implantslots"]; i++)
								{
									if(userVars["DFSTATS_df_implant" + i + "_type"] !== "")
									{
										if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"])
										{
											var checkType = globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"].split(',');
											for(var k in checkType)
											{
												if(parseInt(slot.parentNode.dataset.slot) === i)
												{
													if(itemType === checkType[k])
													{
														canMove = true;
														break;
													}
												}
												if(itemType === checkType[k])
												{
													displayPlacementMessage("This implant is not compatible with " + globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["name"], mousePos[0] + 10, mousePos[1] + 10, "ERROR");
													displayText = true;
													$("[data-slottype=implant][data-slot=" + i + "]").addClass("highlight");
													i = userVars["DFSTATS_df_implantslots"] + 1;
													canMove = false;
													break;
												}
											}
										}
										if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] && globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] === "1")
										{
											if(itemType === userVars["DFSTATS_df_implant" + i + "_type"])
											{
												displayPlacementMessage("You can only equip one of these at a time", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
												displayText = true;
												$("[data-slottype=implant][data-slot=" + i + "]").addClass("highlight");
												i = userVars["DFSTATS_df_implantslots"] + 1;
												canMove = false;
												break;
											}
										}
									}
								}
							}
						} else if(currentItem.parentNode.dataset.slottype === "implant")
						{
							canMove = true;
							for(var i = 1; i <= userVars["DFSTATS_df_implantslots"]; i++)
							{

								if(userVars["DFSTATS_df_implant" + i + "_type"] !== "")
								{
									if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"])
									{
										var checkType = globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_block"].split(',');
										for(var k in checkType)
										{
											if(parseInt(currentItem.parentNode.dataset.slot) === i)
											{
												if(slotType === checkType[k])
												{
													canMove = true;
													break;
												}
											}
											if(slotType === checkType[k])
											{
												displayPlacementMessage("This implant is not compatible with " + globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["name"], mousePos[0] + 10, mousePos[1] + 10, "ERROR");
												displayText = true;
												$("[data-slottype=implant][data-slot=" + i + "]").addClass("highlight");
												i = userVars["DFSTATS_df_implantslots"] + 1;
												canMove = false;
												break;
											}
										}
									}
									if(globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] && globalData[userVars["DFSTATS_df_implant" + i + "_type"]]["implant_unique"] === "1")
									{
										if(slotType === userVars["DFSTATS_df_implant" + i + "_type"])
										{
											displayPlacementMessage("You can only equip one of these at a time", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
											displayText = true;
											$("[data-slottype=implant][data-slot=" + i + "]").addClass("highlight");
											i = userVars["DFSTATS_df_implantslots"] + 1;
											canMove = false;
											break;
										}
									}
								}
							}

						} else if(slotMatchCheck && slot.dataset.itemtype === "ammo" && currentItem.dataset.type === slot.dataset.type)
						{
							if(currentQuantity !== false && replaceeQuantity !== false)
							{
								if(replaceeQuantity < parseInt(globalData[currentItem.dataset.type]["max_quantity"]))
								{
									var combinedQuantity = currentQuantity + replaceeQuantity;
									if(combinedQuantity > parseInt(globalData[currentItem.dataset.type]["max_quantity"]))
									{
										currentItem.dataset.quantity = globalData[currentItem.dataset.type]["max_quantity"];
										replacee.dataset.quantity = combinedQuantity - parseInt(globalData[currentItem.dataset.type]["max_quantity"]);
									} else
									{
										currentItem.dataset.quantity = combinedQuantity;
										replacee.dataset.quantity = "";
										replacee.style.visibility = "hidden";
									}
								}
								canMove = true;
							}
						} else if(slot.dataset.type === currentItem.dataset.type)
						{
							canMove = false;
						} else
						{
							canMove = true;
						}
						if(canMove)
						{
							currentX = slot.getBoundingClientRect().left - startX;
							currentY = slot.getBoundingClientRect().top - startY;
							setTranslate(-currentX, -currentY, replacee);
							replacee.classList.add("colorShift");
							setTranslate(currentX, currentY, currentItem);
							fakeGrabbedItem.style.visibility = "hidden";
						}
					} else
					{
						if(currentItem.dataset.itemtype === "credits")
						{
							displayPlacementMessage("You cannot place credits here", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
							displayText = true;
						} else if(slot.parentNode.dataset.slottype !== currentItem.dataset.itemtype && typeof slot.parentNode.dataset.slottype !== "undefined")
						{
							displayPlacementMessage("You cannot switch these items", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
							displayText = true;
						} else if(!unblockedSlot(itemType) || !unblockedSlot(slotType))
						{
							displayPlacementMessage("Something is blocking this move", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
							displayText = true;
						} else
						{
							displayPlacementMessage("You cannot place this item here", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
					}
				}

			} else if(slot.classList.contains("blockedSlot"))
			{
				if(slot.dataset.slottype === currentItem.dataset.itemtype || typeof slot.dataset.slottype === "undefined")
				{
					displayPlacementMessage("Something is blocking this slot", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
					displayText = true;
				} else
				{
					displayPlacementMessage("You cannot place this item here", mousePos[0] + 10, mousePos[1] + 10, "ERROR");
					displayText = true;
				}
			} else if(slot.classList.contains("fakeSlot") || (slot.classList.contains("fakeItem") || slot.classList.contains("profitList")) && slot.parentNode.classList.contains("fakeSlot") || (slot.parentNode.classList.contains("fakeItem") || slot.parentNode.classList.contains("profitList")) && slot.parentNode.parentNode.classList.contains("fakeSlot"))
			{
				// do fake things
				if((slot.classList.contains("fakeItem") || slot.classList.contains("profitList")) && slot.parentNode.classList.contains("fakeSlot"))
				{
					slot = slot.parentNode;
				} else if((slot.parentNode.classList.contains("fakeItem") || slot.parentNode.classList.contains("profitList")) && slot.parentNode.parentNode.classList.contains("fakeSlot"))
				{
					slot = slot.parentNode.parentNode;
				}
				hoverItem = slot;
				hovering = true;
				switch(slot.dataset.action)
				{
					case "discard":

						var item_slot = parseInt(currentItem.parentNode.dataset.slot);

						if(currentItem.parentNode.dataset.slottype === "implant")
						{
							item_slot += 1000;
						}
						item_slot += "";
						console.log(item_slot);

						if($.inArray(item_slot, lockedSlots) === -1)
						{
							displayPlacementMessage("Discard this", slot.getBoundingClientRect().left - 95, mousePos[1] + 20, "ACTION");
							displayText = true;
							hoverItem.classList.add("hover");
							canComplete = true;
						} else
						{
							displayPlacementMessage("Locked slot", slot.getBoundingClientRect().left - 95, mousePos[1] + 20, "ERROR");
							displayText = true;
						}
						break;
					case "simpleStore":
						if(findFirstEmptyStorageSlot())
						{
							displayPlacementMessage("Store item", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
							canComplete = true;
						} else
						{
							displayPlacementMessage("Storage full", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
						}
						displayText = true;
						break;
					case "tradeitem":
					case "sellitem":
						if(parseInt(tradeListSize) >= parseInt(userVars["DFSTATS_df_invslots"]))
						{
							displayPlacementMessage("Your selling list is full", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						} else if(globalData[itemType]["no_transfer"] && globalData[itemType]["no_transfer"] !== "0")
						{
							displayPlacementMessage("This item is non-transferable", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						} else
						{
							displayPlacementMessage("Sell this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
							displayText = true;
							canComplete = true;
						}
						break;
					case "buyservice":
						var allowedToUse = false;
						if(currentItem.dataset.itemtype === "armour" && slot.dataset.profession === "Engineer")
						{
							if(parseInt(slot.dataset.level) < parseInt(globalData[itemType]["shop_level"]) - 5)
							{
								displayPlacementMessage(slot.parentNode.querySelector(".seller").textContent + " is too low level to repair this", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							} else if(parseInt(currentItem.dataset.quantity) >= parseInt(globalData[itemType]["hp"]))
							{
								displayPlacementMessage("This doesn't need to be repaired", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							} else
							{
								allowedToUse = true;
							}
						} else if(globalData[itemType])
						{
							if(globalData[itemType]["needdoctor"] === "1" && slot.dataset.profession === "Doctor" || globalData[itemType]["needcook"] === "1" && slot.dataset.profession === "Chef")
							{
								var serviceType = "";
								var cannotBeServiced = false;
								switch(slot.dataset.profession)
								{
									case "Doctor":
										if(parseInt(userVars["DFSTATS_df_hpcurrent"]) >= parseInt(userVars["DFSTATS_df_hpmax"]))
										{
											cannotBeServiced = "You are not wounded";
										}
										serviceType = "administer";
										break;
									case "Chef":
										serviceType = "cook";
										break;
								}
								if(slot.dataset.level < globalData[itemType]["level"] - 5)
								{
									displayPlacementMessage(slot.parentNode.querySelector(".seller").textContent + " is too low level to " + serviceType + " this", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								} else if(cannotBeServiced)
								{
									displayPlacementMessage(cannotBeServiced, mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								} else
								{
									allowedToUse = true;
								}
							}
						}
						if(allowedToUse)
						{
							if(slot.dataset.disabled)
							{
								displayPlacementMessage("Cannot afford this service", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							} else if(currentItem.dataset.type.indexOf("_cooked") >= 0)
							{
								displayPlacementMessage("This is already cooked", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							} else
							{
								displayPlacementMessage("Buy service", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
								canComplete = true;
							}
						}
						displayText = true;
						break;
					case "sendItemPrivate":
						if(parseInt(tradeListSize) >= parseInt(userVars["DFSTATS_df_invslots"]))
						{
							displayPlacementMessage("Your selling list is full", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						} else if(globalData[itemType]["no_transfer"] && globalData[itemType]["no_transfer"] !== "0")
						{
							displayPlacementMessage("This item is non-transferable", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						} else
						{
							displayPlacementMessage("Sell this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
							displayText = true;
							canComplete = true;
						}
						break;
					case "scrap":
						var value = scrapValue(currentItem.dataset.type, currentItem.dataset.quantity);
						if(value)
						{
							var item_slot = parseInt(currentItem.parentNode.dataset.slot);

							if(currentItem.parentNode.dataset.slottype === "implant")
							{
								item_slot += 1000;
							}
							item_slot += "";

							if($.inArray(item_slot, lockedSlots) === -1)
							{
								displayPlacementMessage("Value: $" + nf.format(value), mousePos[0] - 40, mousePos[1] + 10, "ACTION");
								displayText = true;
								hoverItem.classList.add("hover");
								canComplete = true;
							} else
							{
								displayPlacementMessage("Locked slot", slot.getBoundingClientRect().left - 95, mousePos[1] + 20, "ERROR");
								displayText = true;
							}
						}
						break;
					case "enhance":
						var value = enhanceValue(currentItem.dataset.type);
						if(value)
						{
							if(currentItem.dataset.type.indexOf("_stats888") >= 0 || currentItem.dataset.type.indexOf("_stats2424") >= 0)
							{
								displayPlacementMessage("This item already has perfect stats", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else
							{
								if(userVars["DFSTATS_df_cash"] >= value)
								{
									displayPlacementMessage("Cost: $" + nf.format(value), mousePos[0] - 40, mousePos[1] + 10, "ACTION");
									displayText = true;
									hoverItem.classList.add("hover");
									canComplete = true;
								} else
								{
									displayPlacementMessage("You need $" + nf.format(value) + " to enhance this", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								}
							}
						} else
						{
							displayPlacementMessage("This item cannot be enhanced", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
						break;
					case "reinforce":
						if(globalData[itemType]["itemcat"] === "armour")
						{
							if(currentItem.dataset.type.indexOf("_re9") >= 0)
							{
								displayPlacementMessage("This item already has max reinforcement", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else
							{
								if(findInInventory("raremetalscrap") !== false)
								{
									displayPlacementMessage("Cost: 1 Rare Metal Scrap", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
									displayText = true;
									hoverItem.classList.add("hover");
									canComplete = true;
								} else
								{
									displayPlacementMessage("You need 1 Rare Metal Scrap to reinforce this", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								}
							}
						} else
						{
							displayPlacementMessage("This item cannot be reinforced", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
						break;
					case "adye":
						var value = dyeValue(currentItem.dataset.type);
						if(value)
						{
							if(userVars["DFSTATS_df_cash"] >= value)
							{
								displayPlacementMessage("Cost: $" + nf.format(value), mousePos[0] - 40, mousePos[1] + 10, "ACTION");
								displayText = true;
								hoverItem.classList.add("hover");
								canComplete = true;
							} else
							{
								displayPlacementMessage("You need $" + nf.format(value) + " to dye this", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							}
						} else
						{
							displayPlacementMessage("This item cannot be dyed", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
						break;
					case "rename":
						var value = false;
						switch(globalData[itemType]["itemcat"])
						{
							case "weapon":
								value = true;
								break;
							case "armour":
								value = true;
								break;
						}
						if(value)
						{
							if(userVars["DFSTATS_df_credits"] >= 500)
							{
								displayPlacementMessage("Cost: 500 Credits", slot.getBoundingClientRect().left - slot.offsetWidth, mousePos[1] + 10, "ACTION");
								displayText = true;
								hoverItem.classList.add("hover");
								canComplete = true;
							} else
							{
								displayPlacementMessage("You need 500 credits to rename this", slot.getBoundingClientRect().left - slot.offsetWidth, mousePos[1] + 10, "ERROR");
								displayText = true;
							}
						} else
						{
							displayPlacementMessage("This item cannot be renamed", slot.getBoundingClientRect().left - slot.offsetWidth, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
						break;
					case "removerename":
						var value = false;
						switch(globalData[itemType]["itemcat"])
						{
							case "weapon":
								value = true;
								break;
							case "armour":
								value = true;
								break;
						}
						if(value)
						{
							if(userVars["DFSTATS_df_credits"] >= 50)
							{
								displayPlacementMessage("Cost: 50 Credits", slot.getBoundingClientRect().left - slot.offsetWidth, mousePos[1] + 10, "ACTION");
								displayText = true;
								hoverItem.classList.add("hover");
								canComplete = true;
							} else
							{
								displayPlacementMessage("You need 50 credits to remove the rename on this", slot.getBoundingClientRect().left - slot.offsetWidth, mousePos[1] + 10, "ERROR");
								displayText = true;
							}
						} else
						{
							displayPlacementMessage("This item's name cannot be removed", slot.getBoundingClientRect().left - slot.offsetWidth, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
						break;
					case "dismantle":
						if(currentItem.parentNode.parentNode.parentNode.id === "inventory")
							if(globalData[itemType]["itemcat"] === "weapon" && globalData[itemType]["pro_req"] >= 120 || globalData[itemType]["itemcat"] === "armour" && globalData[itemType]["shop_level"] - 5 >= 75 || globalData[itemType]["implant"] === "1" && globalData[itemType]["holidayitem"] !== "1")
							{
								var item_slot = parseInt(currentItem.parentNode.dataset.slot);

								if(currentItem.parentNode.dataset.slottype === "implant")
								{
									item_slot += 1000;
								}
								item_slot += "";

								if($.inArray(item_slot, lockedSlots) === -1)
								{
									displayPlacementMessage("Dismantle: 1 Rare Metal Scrap", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
									displayText = true;
									hoverItem.classList.add("hover");
									canComplete = true;
								} else
								{
									displayPlacementMessage("Locked slot", slot.getBoundingClientRect().left - 95, mousePos[1] + 20, "ERROR");
									displayText = true;
								}
							}
						break;
					case "godcraft":
						var value = false;
						switch(globalData[itemType]["itemcat"])
						{
							case "weapon":
								value = 250;
								break;
							case "armour":
								value = 500;
								break;
						}
						if(value)
						{
							if(currentItem.dataset.type.indexOf("_stats888") >= 0 || currentItem.dataset.type.indexOf("_stats2424") >= 0)
							{
								displayPlacementMessage("This already has perfect stats!", slot.getBoundingClientRect().left - 20, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else
							{
								if(parseInt(userVars["DFSTATS_df_credits"]) >= value)
								{
									displayPlacementMessage("Cost: " + nf.format(value) + " Credits", slot.getBoundingClientRect().left - 20, mousePos[1] + 10, "ACTION");
									displayText = true;
									hoverItem.classList.add("hover");
									canComplete = true;
								} else
								{
									displayPlacementMessage("You need " + nf.format(value) + " credits to godcraft this", slot.getBoundingClientRect().left - 20, mousePos[1] + 10, "ERROR");
									displayText = true;
								}
							}

						} else
						{
							displayPlacementMessage("This item cannot be enhanced", slot.getBoundingClientRect().left - 20, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
						break;
					case "mdye":
						var value = false;
						switch(globalData[itemType]["itemcat"])
						{
							case "armour":
								if(globalData[itemType]["othercolours"] && globalData[itemType]["othercolours"] !== "")
								{
									value = 250;
								}
								break;
							case "item":
								if(globalData[itemType]["othercolours"] && globalData[itemType]["othercolours"] !== "" && globalData[itemType]["clothingtype"] && globalData[itemType]["clothtype"] !== "")
								{
									value = 100;
								}
								break;
						}
						if(value)
						{
							if(parseInt(userVars["DFSTATS_df_credits"]) >= value)
							{
								displayPlacementMessage("Cost: " + nf.format(value) + " Credits", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
								displayText = true;
								hoverItem.classList.add("hover");
								canComplete = true;
							} else
							{
								displayPlacementMessage("You need " + nf.format(value) + " credits to dye this", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							}
						} else
						{
							displayPlacementMessage("This item cannot be dyed", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
							displayText = true;
						}
						break;
					case "giveToChar":
						var value = true;
						if(globalData[itemType]["healthrestore"] > 0)
						{
							if(parseInt(userVars["DFSTATS_df_hpcurrent"]) >= parseInt(userVars["DFSTATS_df_hpmax"]))
							{
								displayPlacementMessage("You aren't wounded", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
								value = false;
							} else
							{
								displayPlacementMessage("Use this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
							}
						} else if(parseInt(globalData[itemType]["foodrestore"]) > 0)
						{
							if(parseInt(userVars["DFSTATS_df_hungerhp"]) >= 100)
							{
								displayPlacementMessage("You aren't hungry", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
								value = false;
							} else
							{
								displayPlacementMessage("Consume this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
							}
						} else if(globalData[itemType]["canread"] === "1")
						{
							displayPlacementMessage("Read this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
						} else if(globalData[itemType]["boostdamagehours"] > 0 || globalData[itemType]["boostexphours"] > 0 || globalData[itemType]["boostspeedhours"] > 0)
						{
							displayPlacementMessage("Apply this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
						} else if(globalData[itemType]["opencontents"] && globalData[itemType]["opencontents"].length > 0)
						{
							displayPlacementMessage("Open this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
						} else if(globalData[itemType]["gm_days"] && globalData[itemType]["gm_days"] !== "0")
						{
							displayPlacementMessage("Use this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
						} else
						{
							value = false;
						}
						if(value)
						{
							displayText = true;
							canComplete = true;
						}
						break;
					case "newadminister":
						if(parseInt(globalData[itemType]["healthrestore"]) > 0)
						{
							if(parseInt(userVars["DFSTATS_df_hpcurrent"]) < parseInt(userVars["DFSTATS_df_hpmax"]) * 0.25)
							{
								displayPlacementMessage("You are too badly wounded to do that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else if(parseInt(userVars["DFSTATS_df_hungerhp"]) < 25)
							{
								displayPlacementMessage("You are too hungry to do that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else
							{
								if(globalData[itemType]["needdoctor"] !== "1")
								{
									displayPlacementMessage("This doesn't need to be administered", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								} else if(parseInt(userVars["DFSTATS_df_level"]) < parseInt(globalData[itemType]["level"]) - 5)
								{
									displayPlacementMessage("You're too low level to adminster that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								} else
								{
									displayPlacementMessage("Administer this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
									displayText = true;
									canComplete = true;
								}
							}
						}
						break;
					case "newcook":
						if(parseInt(globalData[itemType]["foodrestore"]) > 0)
						{
							if(parseInt(userVars["DFSTATS_df_hpcurrent"]) < parseInt(userVars["DFSTATS_df_hpmax"]) * 0.25)
							{
								displayPlacementMessage("You are too badly wounded to do that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else if(parseInt(userVars["DFSTATS_df_hungerhp"]) < 25)
							{
								displayPlacementMessage("You are too hungry to do that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else
							{
								if(globalData[itemType]["needcook"] !== "1" || currentItem.dataset.type.indexOf("_cooked") >= 0)
								{
									displayPlacementMessage("This doesn't need to be cooked", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								} else if(parseInt(userVars["DFSTATS_df_level"]) < parseInt(globalData[itemType]["level"]) - 5)
								{
									displayPlacementMessage("You're too low level to adminster that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								} else
								{
									displayPlacementMessage("Cook this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
									displayText = true;
									canComplete = true;
								}
							}
						}
						break;
					case "newrepair":
						if(globalData[itemType]["itemcat"] === "armour")
						{
							if(parseInt(userVars["DFSTATS_df_hpcurrent"]) < parseInt(userVars["DFSTATS_df_hpmax"]) * 0.25)
							{
								displayPlacementMessage("You are too badly wounded to do that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else if(parseInt(userVars["DFSTATS_df_hungerhp"]) < 25)
							{
								displayPlacementMessage("You are too hungry to do that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
								displayText = true;
							} else
							{
								if(parseInt(currentItem.dataset.quantity) >= parseInt(globalData[itemType]["hp"]))
								{
									displayPlacementMessage("This doesn't need to be repaired", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								} else if(parseInt(userVars["DFSTATS_df_level"]) < parseInt(globalData[itemType]["shop_level"]) - 5)
								{
									displayPlacementMessage("You're too low level to repair that", mousePos[0] - 40, mousePos[1] + 10, "ERROR");
									displayText = true;
								} else
								{
									displayPlacementMessage("Repair this", mousePos[0] - 40, mousePos[1] + 10, "ACTION");
									displayText = true;
									canComplete = true;
								}
							}
						}
						break;
				}
				canMove = canComplete;

			}
			fakeGrabbedItem.style.display = "block";
			currentItem.style.visibility = "visible";
		}
		if(!displayText)
		{
			cleanPlacementMessage();
		}
		if(!hovering && hoverItem)
		{
			hoverItem.classList.remove("hover");
			hoverItem = null;
		}

		if(!valid)
		{
			return;
		}

		if(!canMove || hovering)
		{
			//currentX = mousePos[0] - startX - 20;
			//currentY = mousePos[1] - startY - 20;
			var invHoldOffsets = inventoryHolder.getBoundingClientRect();
			currentX = mousePos[0] - invHoldOffsets.left - fakeGrabbedItem.offsetWidth / 2;
			currentY = mousePos[1] - invHoldOffsets.top - fakeGrabbedItem.offsetHeight / 2;
			setTranslate(0, 0, currentItem);
			fakeGrabbedItem.style.visibility = "visible";
		}

		setTranslate(currentX, currentY, fakeGrabbedItem);
	}
}

function setTranslate(xPos, yPos, el)
{
	el.style.left = xPos + "px";
	el.style.top = yPos + "px";
}