var userVars;
var pageLock = true;
var defUserSettings = {};
defUserSettings["general"] = {};
defUserSettings["general"]["playSound"] = true;
defUserSettings["general"]["volume"] = 50;
defUserSettings["general"]["displayAvatars"] = true;
defUserSettings["general"]["statusPercents"] = false;
defUserSettings["general"]["simpleMenus"] = false;
defUserSettings["forum"] = {};
defUserSettings["forum"]["displayAvatars"] = true;
defUserSettings["gamblingden"] = {};
defUserSettings["gamblingden"]["instant"] = false;
defUserSettings["inventory"] = {};
defUserSettings["inventory"]["sortstyle"] = 0;
defUserSettings["inventory"]["sortbyscrap"] = false;

defUserSettings["hidden"] = {};
defUserSettings["hidden"]["hidearmour"] = false;

var ieVersion = false;
if (window.document.documentMode !== undefined) {
	ieVersion = true;
}

if (localStorage.getItem("df_html5") === null || localStorage.getItem("df_html5") === "") {
	localStorage.setItem("df_html5", JSON.stringify(defUserSettings));
}
var userSettings = JSON.parse(localStorage.getItem("df_html5"));
var nf;
if (typeof Intl !== "undefined") {
	nf = new Intl.NumberFormat("en-US");
} else {
	nf = {};
	nf.format = function (numberToFormat) {
		return (numberToFormat + "").replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,");
	};
}
var prompt = false;

function unlockPage() {
	pageLock = false;
}

function checkLSBool(boolCat, boolName) {
	if (typeof userSettings !== "undefined" && typeof userSettings[boolCat] !== "undefined" && typeof userSettings[boolCat][boolName] !== "undefined") {
		return userSettings[boolCat][boolName];
	} else {
		if (typeof userSettings[boolCat] === "undefined") {
			userSettings[boolCat] = {};
		}
		userSettings[boolCat][boolName] = defUserSettings[boolCat][boolName];
		localStorage.setItem("df_html5", JSON.stringify(userSettings));
		return userSettings[boolCat][boolName];
	}
}

function checkPropertyValid(propCat, propName) {
	var uSet = [false, false];
	if (typeof userSettings !== "undefined") {
		if (typeof userSettings[propCat] !== "undefined") {
			if (typeof userSettings[propCat][propName] !== "undefined") {
				return true;
			}
			uSet[1] = true;
		}
		uSet[0] = true;
	}
	if (typeof defUserSettings !== "undefined") {
		if (typeof defUserSettings[propCat] !== "undefined") {
			if (typeof defUserSettings[propCat][propName] !== "undefined") {
				if (uSet[1]) {
					userSettings[propCat][propName] = defUserSettings[propCat][propName];
					localStorage.setItem("df_html5", JSON.stringify(userSettings));
					return true;
				} else {
					if (uSet[0]) {
						userSettings[propCat] = defUserSettings[propCat];
						localStorage.setItem("df_html5", JSON.stringify(userSettings));
						return true;
					} else {
						userSettings = defUserSettings;
						localStorage.setItem("df_html5", JSON.stringify(userSettings));
						return true;
					}
				}
			}
		}
	} else {
		location.reload(true);
	}
	return false;
}

function flshToArr(flashStr, padding, callback) {
	if (typeof padding === "undefined") {
		padding = "";
	}
	var output = {};
	var flashBlock = flashStr.split("&");
	for (var i in flashBlock) {
		var splt = flashBlock[i].explode('=', 2);
		if (typeof splt[1] !== "undefined") {
			output[padding + splt[0]] = splt[1];
		}
	}
	if (typeof (callback) !== "undefined") {
		callback(output);
	} else {
		return output;
	}
}

function updateIntoArr(flshArr, baseArr) {
	for (var i in flshArr) {
		baseArr[i] = flshArr[i];
	}
}

function setUserVars(flshArr) {
	userVars = flshArr;
}

function objectJoin(obj) {
	var output = "", p;
	for (p in obj) {
		if (output !== "") {
			output += "&";
		}
		output += p + "=" + obj[p];
	}
	return output;
}

function webCall(call, params, callback, hashed) {
	if (typeof (hashed) === "undefined") {
		hashed = false;
	}

	if (typeof (callback) === "undefined") {
		callback = false;
	}

	var actualCall = call;
	if (window.location.pathname.indexOf("/DF3D/") >= 0) {
		actualCall = "../" + actualCall;
	}

	if (!prompt && document.getElementById("gamecontent")) {
		prompt = document.getElementById("gamecontent");
	}

	params = objectJoin(params);

	if (hashed) {
		var datahash = hash(params);
		$.ajax({
			type: "POST",
			url: actualCall + ".php",
			data: "hash=" + datahash + "&" + params,
			success: function (data, status, xhr) {
				checkValidPacket(callback, call, data, status, xhr);
			},
			error: webCallError
		});
	} else {
		$.ajax({
			type: "POST",
			url: actualCall + ".php",
			data: params,
			success: function (data, status, xhr) {
				checkValidPacket(callback, call, data, status, xhr);
			},
			error: webCallError
		});
	}
}

function findTagExist(itemData, tag) {
	if (itemData.indexOf("_" + tag) !== -1) {
		return true;
	} else {
		return false;
	}
}

function findTagValue(itemData, tag) {
	var start = itemData.indexOf("_" + tag);
	if (start !== -1) {
		var end = itemData.indexOf("_", start + 1);
		if (end !== -1) {
			return itemData.substr(start + tag.length + 1, end - start - tag.length - 1);
		} else {
			return itemData.substr(start + tag.length + 1);
		}
	} else {
		return "";
	}
}

function checkValidPacket(callback, call, data, status, xhr) {
	var exceptionUrls = ["modify_values", "shop", "surgeon"];
	if ($.inArray(call, exceptionUrls) === -1 && xhr["responseURL"] && xhr["responseURL"].indexOf(call + ".php") === -1) {
		webCallError();
	} else
		if (call === "inventory_new" && data === "") {
			webCallError();
		} else {
			if (callback) {
				callback(data, status, xhr);
				checkForTime = flshToArr(data);
				if (checkForTime["HR_start_time"]) {
					console.log(checkForTime["HR_start_time"]);
				}
				if (checkForTime["HR_end_time"]) {
					console.log(checkForTime["HR_end_time"]);
				}
				if (checkForTime["HR_time"]) {
					console.log(checkForTime["HR_time"]);
				}
			}
		}
}

function webCallError() {
	if (prompt) {
		prompt.innerHTML = "<div style='text-align: center'>Connection Error</div>";
		prompt.parentNode.style.display = "block";
		setTimeout(function () {
			window.location.reload();
		}, 1000);
	} else {
		alert("Connection Error");
		window.location.reload();
	}
}

var noColor = false;
webCall("hotrods/hotrods_avatars/getColorList", "", function (colorData) {
	noColor = colorData.split("&");
});

function playSound(sound) {
	if (checkLSBool("general", "playSound") && checkPropertyValid("general", "volume") && hrV !== 0) {
		if (Audio !== undefined) {
			var audioPath = 'hotrods/hotrods_v' + hrV + '/HTML5/sounds/' + sound;
			if (window.location.pathname.indexOf("/DF3D/") >= 0) {
				audioPath = '../' + audioPath;
			}
			var audSrc = new Audio();
			if (audSrc.canPlayType("audio/mp3") !== "") {
				audioPath += '.mp3';
			} else if (audSrc.canPlayType("audio/ogg") !== "") {
				audioPath += '.ogg';
			} else {
				console.log("Audio is not playable.");
				return;
			}
			audSrc.volume = parseInt(userSettings["general"]["volume"]) / 100;
			audSrc.src = audioPath;
			audSrc.play();
		}
	}
}

function checkIfLevelUp(neededExp, currentExp, freePoints, curLevel, password, userid, sc, templateid) {
	neededExp = parseInt(neededExp);
	currentExp = parseInt(currentExp);
	freePoints = parseInt(freePoints);
	curLevel = parseInt(curLevel);
	if (currentExp >= neededExp && freePoints === 0 && curLevel < 325) {
		var dataArr = {};
		var rank = "Exterminator";
		if (curLevel + 1 < 10) {
			rank = "Survivor";
		} else if (curLevel + 1 < 20) {
			rank = "Militia";
		} else if (curLevel + 1 < 30) {
			rank = "Mercenary";
		} else if (curLevel + 1 < 40) {
			rank = "Hired Gun";
		} else if (curLevel + 1 < 50) {
			rank = "Bounty Hunter";
		}

		dataArr["default_options[df_exp]"] = currentExp - neededExp;
		dataArr["default_options[df_freepoints]"] = 1;
		dataArr["default_options[df_level]"] = curLevel + 1;
		dataArr["default_options[df_rank]"] = rank;
		dataArr["password"] = password;
		dataArr["userID"] = userid;
		dataArr["sc"] = sc;
		dataArr["templateID"] = templateid;
		dataArr["redirect_url"] = "index.php?page=14";
		webCall("modify_values", dataArr, function () {
			window.location.href = "index.php?page=14";
		});
	}
}

function baseGameUpdates(curHP, dead, outpost, serverTime, hungerTime, lastSpawn, password, userID, sc, templateID, tts) {
	var dataArr = {};
	dataArr["password"] = password;
	dataArr["userID"] = userID;
	dataArr["sc"] = sc;
	dataArr["templateID"] = templateID;
	if (parseInt(curHP) === 0 && parseInt(dead) === 0) {
		window.location.href = "index.php";
	}
	if (parseInt(outpost) === 2 && parseInt(curHP) > 0 && parseInt(dead) === 0) {
		window.location.href = "index.php?page=21";
	}
	if (parseInt(serverTime) > parseInt(hungerTime) + 3600) {
		webCall("hunger", dataArr);
	}
	if (parseInt(serverTime) > parseInt(lastSpawn) + (72000 - 72000 * tts)) {
		webCall("itemspawn", dataArr);
	}
}

function renderAvatar(elem, flashStr) {
	var sTags = document.getElementsByTagName("script");
	var mom = sTags[sTags.length - 1].parentNode;
	var renderData = flshToArr(flashStr);
	var c = document.createElement("canvas");
	c.width = "160";
	c.height = "350";
	var ctx = c.getContext("2d");
	var images = [];
	$.each(renderData, function (renKey, renVal) {
		if (renVal !== "") {
			images.push(renVal);
			/*var out = document.createElement("img");
			 out.src = renVal;
			 out.alt = "";
			 out.classList.add("opElem");
			 out.style.left = "0";
			 out.style.top = "0";
			 mom.appendChild(out);*/
		}
	});
	var i = 0;
	var compileImage = function () {
		if (i < images.length) {
			var img = new Image();
			img.onload = function () {
				ctx.drawImage(img, 0, 0, 160, 350);
				i++;
				compileImage();
			};
			img.onerror = function () {
				i++;
				compileImage();
			};
			img.src = images[i];
		}
	};
	compileImage();
	mom.appendChild(c);
	elem.removeChild(elem.firstElementChild);
}

function updateAllFieldsBase() {
	if (window.location.pathname.indexOf("/DF3D/") < 0 && window.location.search.indexOf("page=31") < 0) {
		var weapons = {};
		weapons[0] = userVars["DFSTATS_df_weapon1type"].split('_');
		weapons[1] = userVars["DFSTATS_df_weapon2type"].split('_');
		weapons[2] = userVars["DFSTATS_df_weapon3type"].split('_');

		var sidebarHolder = document.getElementById("sidebar");
		for (var i in weapons) {
			if (weapons[i][0] !== "") {
				var weapRealNum = parseInt(i) + 1;
				sidebarHolder.querySelectorAll("div.weapon")[i].innerHTML = "<img src='https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + weapons[i][0] + ".png' />";
				if (userVars["DFSTATS_df_weapon" + weapRealNum + "ammo"] && userVars["DFSTATS_df_weapon" + weapRealNum + "ammo"] !== "") {
					var wepAmmo = nf.format(userVars["DFSTATS_df_" + userVars["DFSTATS_df_weapon" + weapRealNum + "ammo"]]);
					sidebarHolder.querySelectorAll("div.weapon")[i].innerHTML += "<div>" + wepAmmo + " rounds</div>";
				}
			} else {
				sidebarHolder.querySelectorAll("div.weapon")[i].innerHTML = "";
			}
		}

		var armour = userVars["DFSTATS_df_armourtype"].split('_');


		if (armour[0] !== "") {
			var armourHealth = "Normal";
			var armourHealthColor = "12FF00";
			var armourhp = parseInt(userVars["DFSTATS_df_armourhp"]) / parseInt(userVars["DFSTATS_df_armourhpmax"]);
			if (armourhp <= 0) {
				armourHealth = "Broken";
				armourHealthColor = "D20303";
			} else if (armourhp < 0.4) {
				armourHealth = "Damaged";
				armourHealthColor = "FF4800";
			} else if (armourhp < 0.75) {
				armourHealth = "Scratched";
				armourHealthColor = "FFCC00";
			}
			armourHealth += "<br />" + userVars["DFSTATS_df_armourhp"] + " / " + userVars["DFSTATS_df_armourhpmax"];
			if (checkLSBool("general", "statusPercents")) {
				armourHealth += "<br />(" + Math.round(armourhp * 100) + "%)";
			}

			var armorData = sidebarHolder.querySelector("#sidebarArmour");
			armorData.querySelector("img").src = "https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + armour[0] + ".png";
			armorData.querySelector("div").innerHTML = armourHealth;
			armorData.querySelector("div").style.color = "#" + armourHealthColor;
		} else {
			var armorData = sidebarHolder.querySelector("#sidebarArmour");
			armorData.querySelector("img").src = "";
			armorData.querySelector("div").innerHTML = "";
		}

		var health = "Healthy";
		var healthColor = "12FF00";
		var hp = userVars["DFSTATS_df_hpcurrent"] / userVars["DFSTATS_df_hpmax"];
		if (hp <= 0) {
			health = "DEAD";
			healthColor = "D20303";
		} else if (hp < 0.25) {
			health = "Critical";
			healthColor = "D20303";
		} else if (hp < 0.5) {
			health = "Serious";
			healthColor = "FF4800";
		} else if (hp < 0.75) {
			health = "Injured";
			healthColor = "FFCC00";
		}
		health += "<br />" + userVars["DFSTATS_df_hpcurrent"] + " / " + userVars["DFSTATS_df_hpmax"];
		if (checkLSBool("general", "statusPercents")) {
			health += "<br />(" + Math.round(hp * 100) + "%)";
		}
		$(".playerHealth").each(function () {
			$(this).html(health).css("color", "#" + healthColor);
		});
		health = "Nourished";
		healthColor = "12FF00";
		hp = userVars["DFSTATS_df_hungerhp"];
		if (hp <= 0) {
			health = "Dying";
			healthColor = "D20303";
		} else if (hp < 25) {
			health = "Starving";
			healthColor = "D20303";
		} else if (hp < 50) {
			health = "Hungry";
			healthColor = "FF4800";
		} else if (hp < 75) {
			health = "Fine";
			healthColor = "FFCC00";
		}
		health += "<br />" + userVars["DFSTATS_df_hungerhp"] + " / 100";
		if (checkLSBool("general", "statusPercents")) {
			health += "<br />(" + Math.round(hp) + "%)";
		}
		$(".playerNourishment").each(function () {
			$(this).html(health).css("color", "#" + healthColor);
		});

		var boostOutput = "";
		if (parseInt(userVars["DFSTATS_df_boostexpuntil"]) >= parseInt(userVars["DFSTATS_df_servertime"]) + 1200000000) {
			boostOutput += "+50% Exp Boost";
		}
		if (parseInt(userVars["DFSTATS_df_boostdamageuntil"]) >= parseInt(userVars["DFSTATS_df_servertime"]) + 1200000000) {
			if (boostOutput !== "") {
				boostOutput += "<br />";
			}
			boostOutput += "+35% Damage Boost";
		}
		if (parseInt(userVars["DFSTATS_df_boostspeeduntil"]) >= parseInt(userVars["DFSTATS_df_servertime"]) + 1200000000) {
			if (boostOutput !== "") {
				boostOutput += "<br />";
			}
			boostOutput += "+35% Speed Boost";
		}
		$(".boostTimes").each(function () {
			$(this).html(boostOutput);
		});
		var credits = "Credits: " + nf.format(userVars["DFSTATS_df_credits"]);
		$(".heldCredits").each(function () {
			$(this).text(credits).attr("data-cash", credits);
		});
		var cash = "Cash: $" + nf.format(userVars["DFSTATS_df_cash"]);
		$(".heldCash").each(function () {
			$(this).text(cash).attr("data-cash", cash);
		});
	} else {
		sidebarHolder = document.getElementById("statusBox");
		armour = userVars["DFSTATS_df_armourtype"].split('_');

		if (armour[0] !== "") {
			var armourHealth = "Normal";
			var armourHealthColor = "12FF00";
			var armourhp = parseInt(userVars["DFSTATS_df_armourhp"]) / parseInt(userVars["DFSTATS_df_armourhpmax"]);
			if (armourhp <= 0) {
				armourHealth = "Broken";
				armourHealthColor = "D20303";
			} else if (armourhp < 0.4) {
				armourHealth = "Damaged";
				armourHealthColor = "FF4800";
			} else if (armourhp < 0.75) {
				armourHealth = "Scratched";
				armourHealthColor = "FFCC00";
			}
			armourHealth += "<br />" + userVars["DFSTATS_df_armourhp"] + " / " + userVars["DFSTATS_df_armourhpmax"];
			if (checkLSBool("general", "statusPercents")) {
				armourHealth += "<br />(" + Math.round(armourhp * 100) + "%)";
			}

			armorData = sidebarHolder.querySelector("#statusBoxArmour");
			armorData.querySelector("img").src = "https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + armour[0] + ".png";
			armorData.querySelector("div").innerHTML = armourHealth;
			armorData.querySelector("div").style.color = "#" + armourHealthColor;
		} else {
			var armorData = sidebarHolder.querySelector("#statusBoxArmour");
			armorData.querySelector("img").src = "";
			armorData.querySelector("div").innerHTML = "";
		}

		var health = "Healthy";
		var healthColor = "12FF00";
		var hp = userVars["DFSTATS_df_hpcurrent"] / userVars["DFSTATS_df_hpmax"];
		if (hp <= 0) {
			health = "DEAD";
			healthColor = "D20303";
		} else if (hp < 0.25) {
			health = "Critical";
			healthColor = "D20303";
		} else if (hp < 0.5) {
			health = "Serious";
			healthColor = "FF4800";
		} else if (hp < 0.75) {
			health = "Injured";
			healthColor = "FFCC00";
		}
		health += "<br />" + userVars["DFSTATS_df_hpcurrent"] + " / " + userVars["DFSTATS_df_hpmax"];
		if (checkLSBool("general", "statusPercents")) {
			health += "<br />(" + Math.round(hp * 100) + "%)";
		}
		$(".playerHealth").each(function () {
			$(this).html(health).css("color", "#" + healthColor);
		});
		health = "Nourished";
		healthColor = "12FF00";
		hp = userVars["DFSTATS_df_hungerhp"];
		if (hp <= 0) {
			health = "Dying";
			healthColor = "D20303";
		} else if (hp < 25) {
			health = "Starving";
			healthColor = "D20303";
		} else if (hp < 50) {
			health = "Hungry";
			healthColor = "FF4800";
		} else if (hp < 75) {
			health = "Fine";
			healthColor = "FFCC00";
		}
		health += "<br />" + userVars["DFSTATS_df_hungerhp"] + " / 100";
		if (checkLSBool("general", "statusPercents")) {
			health += "<br />(" + Math.round(hp) + "%)";
		}
		$(".playerNourishment").each(function () {
			$(this).html(health).css("color", "#" + healthColor);
		});
	}
	//renderAvatarUpdate();
	pageLock = false;
}

function updateAllFields() {
	updateAllFieldsBase();
	prompt.parentNode.style.display = "none";
	prompt.innerHTML = "";
}

function renderAvatarUpdate(elem, customVars) {
	if (checkLSBool("general", "displayAvatars")) {
		if (elem) {
			var loadingCircleOfDoom = document.createElement("img");
			loadingCircleOfDoom.width = "100";
			loadingCircleOfDoom.src = "hotrods/hotrods_v" + hrV + "/HTML5/images/loading.gif";
			if (window.location.pathname.indexOf("/DF3D/") >= 0) {
				loadingCircleOfDoom.src = "../" + loadingCircleOfDoom.src;
			}
			loadingCircleOfDoom.style.position = "absolute";
			loadingCircleOfDoom.style.left = "30px";
			loadingCircleOfDoom.style.top = "20px";

			loadingCircleOfDoom.id = "loadingcircle";
			elem.appendChild(loadingCircleOfDoom);
		}

		var waitForSetup = setInterval(function () {
			if (noColor) {
				clearInterval(waitForSetup);
				if (!customVars) {
					customVars = userVars;
				}
				var temp;
				var gender = customVars["DFSTATS_df_gender"].toLowerCase();
				customVars["DFSTATS_df_avatar_hair_colour"] = customVars["DFSTATS_df_avatar_hair_colour"].charAt(0).toUpperCase() + customVars["DFSTATS_df_avatar_hair_colour"].slice(1);
				var renderData = {
					rightshoulder: "",
					leftshoulder: "",
					body: "",
					face: "",
					beard: "",
					trousers: "",
					shirt: "",
					armour: "",
					rightstrap: "",
					leftstrap: "",
					rightammobelt: "",
					leftholster: "",
					rightholster: "",
					knifeleft: "",
					kniferight: "",
					gunbelt: "",
					mask: "",
					hair: "",
					mask2: "",
					coat: "",
					hat: ""
				};
				var special = {
					shotgun: ["streetsweeper", "usan12", "aa12", "painshot10", "biforcec7", "acebarrel", "buckblast"],
					rifle: ["2unlimitedg19", "unlimitedg19", "gau19", "m60", "fmmitrail", "fmmag", "vulcan", "xlgunner8", "hammerhead47", "scar9000", "wraithcannon", "uwraithcannon"],
					faceMasks: ["hockeymask", "insanitymask", "eyepatch", "facebandana", "flyinggoggles", "gasmask", "rebreather", "scavengermask", "shinobumask", "sunglasses", "surgicalmask", "tacticalgoggles", "slashermask", "cultistmask", "elitecultistmask", "plagueseekermask", "festiveplaguemask"]
				};
				if (gender === "female") {
					special["faceMasks"].push("corpsemask");
				}

				renderData["body"] = customVars["DFSTATS_df_avatar_skin_colour"];
				renderData["face"] = customVars["DFSTATS_df_avatar_skin_colour"] + customVars["DFSTATS_df_avatar_face"];

				if (gender === "male" && typeof (customVars["DFSTATS_df_avatar_beard"]) !== "undefined" && customVars["DFSTATS_df_avatar_beard"] !== "none") {
					renderData["beard"] = customVars["DFSTATS_df_avatar_beard"];
					if ($.inArray(customVars["DFSTATS_df_avatar_beard"], noColor) === -1) {
						renderData["beard"] += "_colour" + customVars["DFSTATS_df_avatar_hair_colour"];
					}
				}

				for (var i = 1; i <= 3; i++) {
					var beltWeapon = false;
					var shotgun = false;
					var rifle = false;
					var weaponSlot = customVars["DFSTATS_df_avatar_weapon" + i];
					var weaponType = customVars["DFSTATS_df_weapon" + i + "type"].split("_")[0];
					if ($.inArray(weaponType, special["shotgun"]) >= 0) {
						beltWeapon = true;
						shotgun = true;
					} else if ($.inArray(weaponType, special["rifle"]) >= 0) {
						beltWeapon = true;
						rifle = true;
					}
					if (beltWeapon && renderData["rightammobelt"] === "") {
						if (shotgun) {
							renderData["rightammobelt"] = "shotgun";
						} else if (rifle) {
							renderData["rightammobelt"] = "rifle";
						}
					}
					if (weaponSlot === "none" || weaponSlot === "") {
						continue;
					}
					switch (weaponSlot) {
						case "none":
						case "chainsaw":
							break;
						case "knife":
							{
								if (renderData["kniferight"] !== "") {
									renderData["knifeleft"] = "grey";
								} else {
									renderData["kniferight"] = "grey";
								}
								break;
							}
						case "pistol":
							{
								if (renderData["leftholster"] !== "") {
									renderData["rightholster"] = "grey";
								} else {
									renderData["leftholster"] = "grey";
								}
								renderData["gunbelt"] = "grey";
								break;
							}
						case "wood":
						case "sword":
						case "riflewood":
						case "metal":
							{
								if ((renderData["leftshoulder"] !== "" || beltWeapon)) {
									renderData["rightshoulder"] = weaponSlot;
									// strap
									renderData["rightstrap"] = "brown";
								} else {
									renderData["leftshoulder"] = weaponSlot;
									// strap
									renderData["leftstrap"] = "brown";
								}
								break;
							}
						default:
							{
								if ((renderData["leftshoulder"] !== "" || beltWeapon)) {
									renderData["rightshoulder"] = weaponSlot;
									// strap
									renderData["rightstrap"] = "black";
								} else {
									renderData["leftshoulder"] = weaponSlot;
									// strap
									renderData["leftstrap"] = "black";
								}
								break;
							}
					}
				}

				if (customVars["DFSTATS_df_avatar_trousers"] !== "") {
					temp = customVars["DFSTATS_df_avatar_trousers"].split("_");
					renderData["trousers"] = temp[0];
					if ($.inArray(temp[0], noColor) === -1) {
						if (temp[1]) {
							if (temp[1].indexOf("colour") >= 0) {
								renderData["trousers"] += "_" + temp[1];
							} else {
								renderData["trousers"] += "_colourGrey";
							}
						} else {
							renderData["trousers"] += "_colourGrey";
						}
					}
				}

				if (customVars["DFSTATS_df_avatar_shirt"] !== "") {
					temp = customVars["DFSTATS_df_avatar_shirt"].split("_");
					renderData["shirt"] = temp[0];
					if ($.inArray(temp[0], noColor) === -1) {
						if (temp[1]) {
							if (temp[1].indexOf("colour") >= 0) {
								renderData["shirt"] += "_" + temp[1];
							} else {
								renderData["shirt"] += "_colourGrey";
							}
						} else {
							renderData["shirt"] += "_colourGrey";
						}
					}
				}

				if (customVars["DFSTATS_df_armourtype"] !== "" && customVars["DFSTATS_df_hidearmour"] === "0") {
					temp = customVars["DFSTATS_df_armourtype"].split("_");
					renderData["armour"] = temp[0];
					if ($.inArray(temp[0], noColor) === -1) {
						if (temp[1] && temp[1].indexOf("colour") >= 0) {
							renderData["armour"] += "_" + temp[1];
						} else if (temp[2] && temp[2].indexOf("colour") >= 0) {
							renderData["armour"] += "_" + temp[2];
						} else {
							renderData["armour"] += "_colourGrey";
						}
					}
				}

				if (customVars["DFSTATS_df_avatar_mask"] !== "" && customVars["DFSTATS_df_avatar_mask"] !== "blocked_slot") {
					temp = customVars["DFSTATS_df_avatar_mask"].split("_");
					if ($.inArray(temp[0], special["faceMasks"]) >= 0) {
						renderData["mask"] = temp[0];
						if ($.inArray(temp[0], noColor) === -1) {
							if (temp[1]) {
								renderData["mask"] += "_" + temp[1];
							} else {
								renderData["mask"] += "_colourGrey";
							}
						}
					} else {
						renderData["mask2"] = temp[0];
						if ($.inArray(temp[0], noColor) === -1) {
							if (temp[1]) {
								renderData["mask2"] += "_" + temp[1];
							} else {
								renderData["mask2"] += "_colourGrey";
							}
						}
					}
				}

				if ($.inArray(customVars["DFSTATS_df_avatar_hair"], noColor) === -1) {
					renderData["hair"] = customVars["DFSTATS_df_avatar_hair"] + "_colour" + customVars["DFSTATS_df_avatar_hair_colour"];
				}

				if (customVars["DFSTATS_df_avatar_coat"] !== "") {
					temp = customVars["DFSTATS_df_avatar_coat"].split("_");
					renderData["coat"] = temp[0];
					if ($.inArray(temp[0], noColor) === -1) {
						if (temp[1]) {
							if (temp[1].indexOf("colour") >= 0) {
								renderData["coat"] += "_" + temp[1];
							} else {
								renderData["coat"] += "_colourGrey";
							}
						} else {
							renderData["coat"] += "_colourGrey";
						}
					}
				}

				if (customVars["DFSTATS_df_avatar_hat"] !== "blocked_slot") {
					if (customVars["DFSTATS_df_avatar_hat"] !== "") {
						temp = customVars["DFSTATS_df_avatar_hat"].split("_");
						renderData["hat"] = temp[0];
						if ($.inArray(temp[0], noColor) === -1) {
							if (temp[1]) {
								if (temp[1].indexOf("colour") >= 0) {
									renderData["hat"] += "_" + temp[1];
								} else {
									if (temp[0] === "militaryhelmet") {
										renderData["hat"] += "_colourDesert Camo";
									} else {
										renderData["hat"] += "_colourGrey";
									}
								}
							} else {
								if (temp[0] === "militaryhelmet") {
									renderData["hat"] += "_colourDesert Camo";
								} else {
									renderData["hat"] += "_colourGrey";
								}
							}
						}
					}
				}

				var c = document.createElement("canvas");
				c.width = "160";
				c.height = "350";
				var ctx = c.getContext("2d");
				var images = [];
				var imageLocation = "https://files.deadfrontier.com/deadfrontier/avatars/";
				var dynamicImageLocation = "hotrods/hotrods_avatars/";
				$.each(renderData, function (renKey, renVal) {
					if (renVal !== "") {
						if (renVal.indexOf("^") !== -1) {
							var rgbVal = renVal.match(/(\d*)\^(\d*)\^(\d*)/)[0];
							itemCode = renVal.match(/.+?(?=_colour)/);
							images.push(dynamicImageLocation + "hascolor.php?gender=" + gender + "&group=" + renKey + "&renderitem=" + itemCode + "&color=" + rgbVal + "&userID=" + customVars["DFSTATS_id_member"]);
						} else {
							images.push(imageLocation + gender + "/" + renKey + "/" + renVal + ".png");
						}
					}
				});
				var i = 0;
				var compileImage = function () {
					if (i < images.length) {
						if (images[i].indexOf("^") !== -1) {
							var actualCall = images[i];
							if (window.location.pathname.indexOf("/DF3D/") >= 0) {
								actualCall = "../" + actualCall;
							}
							$.ajax({
								type: "GET",
								url: actualCall,
								success: function (data, status, xhr) {
									var img = new Image();
									img.onload = function () {
										ctx.drawImage(img, 0, 0, c.width, c.height);
										i++;
										compileImage();
									};
									img.onerror = function () {
										i++;
										compileImage();
									};
									img.src = "hotrods/hotrods_avatars/" + data;
								}
							});
						} else {
							var img = new Image();
							img.onload = function () {
								ctx.drawImage(img, 0, 0, c.width, c.height);
								i++;
								compileImage();
							};
							img.onerror = function () {
								if (images[i].indexOf(imageLocation) !== -1) {
									if (window.location.host !== "fairview.deadfrontier.com") {
										images[i] = images[i].replace(imageLocation, "hotrods/hotrods_avatars/render/");
									} else {
										images[i] = images[i].replace(imageLocation, "https://files.deadfrontier.com/hotrods/hotrods_avatars/render/");
									}
								} else {
									i++;
								}
								compileImage();
							};
							img.src = images[i];
						}

					} else {
						if (elem) {
							elem.innerHTML = "";
							elem.appendChild(c);
						} else {
							$(".characterRender").each(function () {
								this.innerHTML = "";
								this.appendChild(cloneCanvas(c));
							});
						}
					}
				};
				compileImage();
				//$(".characterRender").append(c);
			}
		}, 10);
	}
}

function promptLoading(customMessage) {
	if (customMessage && customMessage !== "") {
		prompt.innerHTML = "<div style='text-align: center;'>" + customMessage + "</div>";
	} else {
		prompt.innerHTML = "<div style='text-align: center;'>Loading...</div>";
	}

	prompt.parentNode.style.display = "block";
}

function promptEnd() {
	prompt.parentNode.style.display = "none";
	prompt.innerHTML = "";
}

function loadBuyButton(elem, flshVars) {
	elem.innerHTML = "<span>" + (flshVars["shop"] === "credit" ? nf.format(flshVars["cost"]) + " Credits" : "$" + nf.format(flshVars["cost"])) + "</span>";
	elem.innerHTML += "<br />";
	var buyButton = document.createElement("button");
	buyButton.textContent = "buy now";
	var userCurrency = 0;
	if (flshVars["shop"] === "credit") {
		userCurrency = parseInt(flshVars["user_credits"]);
	} else {
		userCurrency = parseInt(flshVars["cash"]);
	}
	if (flshVars["shop"] !== "credit" && parseInt(flshVars["cost"]) > userCurrency) {
		buyButton.disabled = true;
	}
	buyButton.onclick = function () {
		buyButton.disabled = true;
		if (flshVars["shop"] === "credit" && parseInt(flshVars["cost"]) > userCurrency) {
			window.location = "https://fairview.deadfrontier.com/onlinezombiemmo/index.php?page=29;message=1";
			return;
		}
		var outputBox = document.createElement("div");
		var noButton = document.createElement("button");
		noButton.onclick = function () {
			loadBuyButton(elem, flshVars);
		};
		outputBox.dataset.type = "question";
		outputBox.textContent = "Are you sure?";
		noButton.style.float = "right";
		noButton.textContent = "no";
		var yesButton = document.createElement("button");
		yesButton.onclick = function () {
			yesButton.disabled = true;
			outputBox.textContent = "Loading...";
			var dataVars = {};
			dataVars["templateID"] = flshVars["template_ID"];
			dataVars["sc"] = flshVars["sc"];
			dataVars["itemnum"] = flshVars["itemnum"];
			dataVars["action"] = flshVars["action"];
			dataVars["userID"] = flshVars["userID"];
			dataVars["password"] = flshVars["password"];
			webCall("shop", dataVars, function (data, status, xhr) {
				if (xhr["responseURL"] && xhr["responseURL"].indexOf("page=36") !== -1) {
					outputBox.dataset.type = "message";
					outputBox.style.left = "20px";
					outputBox.style.right = "20px";
					outputBox.style.paddingLeft = "4px";
					outputBox.style.paddingRight = "4px";
					outputBox.textContent = "Please remove your armour and weapons to purchase this";
					outputBox.onclick = function () {
						loadBuyButton(elem, flshVars);
					};
				} else {
					window.location.href = "index.php?page=25";
				}
			});
		};
		yesButton.textContent = "yes";
		yesButton.style.float = "left";
		outputBox.appendChild(yesButton);
		outputBox.appendChild(noButton);

		elem.appendChild(outputBox);
	};
	elem.appendChild(buyButton);
}

function cloneCanvas(oldCanvas) {
	//create a new canvas
	var newCanvas = document.createElement('canvas');
	var context = newCanvas.getContext('2d');
	//set dimensions
	newCanvas.width = oldCanvas.width;
	newCanvas.height = oldCanvas.height;
	//apply the old canvas to the new one
	context.drawImage(oldCanvas, 0, 0);
	//return the new canvas
	return newCanvas;
}

function initData(flashVars, callback) {
	var flashBlock = flashVars.split('&');
	var outputData = {};
	for (var i = 0; i < flashBlock.length; i++) {
		var temp = flashBlock[i].split('=');
		outputData[temp[0]] = temp[1];
	}
	userVars = outputData;
	if (typeof (callback) !== "undefined") {
		callback();
	}
}

function nChangePage(e) {
	var elem = e.target;
	var sound = false;
	if (elem.dataset.sound && elem.dataset.sound != 0) {
		sound = true;
	}
	var nTab = false;
	pageNum = parseInt(elem.dataset.page);
	modify = elem.dataset.mod;
	if (sound) {
		playSound("outpost");
		setTimeout(function () {
			doPageChange(pageNum, modify);
		}, 1000);
	} else {
		doPageChange(pageNum, modify);
	}
}

function changePage(elem, event, sound) {
	var elem = event.target;
	if (typeof sound === "undefined") {
		sound = true;
	}
	var nTab = false;
	pageNum = parseInt(elem.dataset.page);
	modify = elem.dataset.mod;
	console.log("working");
	if (sound) {
		playSound("footsteps");
		setTimeout(function () {
			doPageChange(pageNum, modify);
		}, 1000);
	} else {
		doPageChange(pageNum, modify);
	}
}

function doPageChange(pageNum, modify) {
	if (typeof modify !== "undefined" && modify !== "0") {
		$.post("modify_values.php", "redirect_url=index.php?page=21&templateID=" + userVars["template_ID"] + "&sc=" + userVars["sc"] + "&userID=" + userVars["userID"] + "&password=" + userVars["password"] + "&default_options[df_positionz]=" + (modify * 1000) + "&default_options[df_positiony]=" + (modify * 1000) + "&default_options[df_positionx]=" + (modify * 1000),
			function (data) {
				if (pageNum) {
					document.location.href = "index.php?page=" + pageNum;
				} else {
					document.location.href = "index.php?action=forum";
				}
			});
	} else if (pageNum) {
		document.location.href = "index.php?page=" + pageNum;
	} else {
		document.location.href = "index.php?action=forum";
	}
	return false;
}

function loadSettings() {
	var settingsBox = document.getElementById("settingsBox");
	settingsBox.src = "hotrods/hotrods_v" + hrV + "/HTML5/pages/settings.html";
	settingsBox.style.display = "block";
}

function loadSidebar(flashErl) {
	var profileVars = flshToArr(flashErl, "");

	var armour = profileVars["DFSTATS_df_armourtype"].split('_');

	var sideOutput = "";
	sideOutput += "<div class='opElem characterRender' style='left: -24px; top: 80px;'></div>";

	sideOutput += "<div class='opElem' style='top: 0px; left: 3px; font-size: 13px; text-align: left; z-index: 1;'>";
	sideOutput += "<a href='index.php?page=25'>Inventory & Equipment</a><br />";
	sideOutput += "<a href='index.php?action=pm'>Message (" + profileVars["DFSTATS_newpms"] + " New)</a><br />";
	sideOutput += "<a href='index.php?action=profile'>My Profile</a><br />";
	sideOutput += "<a href='index.php?page=62'>Challenges</a><br />";
	sideOutput += "<a href='index.php?page=81'>Masteries</a>";
	sideOutput += "</div>";

	sideOutput += "<div class='opElem' style='top: 80px; left: 0px; width: 95%; text-align: right;'>";
	sideOutput += "<span style='color: #ff0000'>" + profileVars["DFSTATS_df_name"] + "</span><br />";
	sideOutput += "<span style='color: #0066ff'>" + profileVars["DFSTATS_df_clan_name"] + "</span><br />";
	sideOutput += "<span style='color: #cccccc'>" + profileVars["DFSTATS_df_profession"] + " Level " + profileVars["DFSTATS_df_level"] + "</span><br />";

	var expNeeded = "------";
	if (parseInt(profileVars["DFSTATS_df_level"]) < 325) {
		expNeeded = nf.format(profileVars["EXPTABLE_exp_lvl" + (parseInt(profileVars["DFSTATS_df_level"]) + 1)]);
	}
	sideOutput += "<span style='color: #cccccc'>" + nf.format(profileVars["DFSTATS_df_exp"]) + " / " + expNeeded + "</span><br />";

	var cash = "Cash: $" + nf.format(profileVars["DFSTATS_df_cash"]);
	sideOutput += "<span class='heldCash cashhack' style='position: relative;' data-cash='" + cash + "'>" + cash + "</span><br />";

	var credits = "Credits: " + nf.format(profileVars["DFSTATS_df_credits"]);
	sideOutput += "<span class='credits heldCredits cashhack' style='position: relative;' data-cash='" + credits + "'>" + credits + "</span><br />";
	sideOutput += "</div>";


	var health = "Healthy";
	var healthColor = "12FF00";
	var hp = parseInt(profileVars["DFSTATS_df_hpcurrent"]) / parseInt(profileVars["DFSTATS_df_hpmax"]);
	if (hp <= 0) {
		health = "DEAD";
		healthColor = "D20303";
	} else if (hp < 0.25) {
		health = "Critical";
		healthColor = "D20303";
	} else if (hp < 0.5) {
		health = "Serious";
		healthColor = "FF4800";
	} else if (hp < 0.75) {
		health = "Injured";
		healthColor = "FFCC00";
	}
	health += "<br />" + profileVars["DFSTATS_df_hpcurrent"] + " / " + profileVars["DFSTATS_df_hpmax"];
	if (checkLSBool("general", "statusPercents")) {
		health += "<br />(" + Math.round(hp * 100) + "%)";
	}

	sideOutput += "<div class='opElem' style='top: 210px; left: 82px;'><img class='opElem' style='text-align: right;' src='hotrods/hotrods_v" + hrV + "/HTML5/images/heart.png'>";
	sideOutput += "<div class='opElem playerHealth' style='top: 3px; left: 28px; width: 65px; text-align: center; font-weight: 100; color: #" + healthColor + ";'>" + health + "</div></div>";

	health = "Nourished";
	healthColor = "12FF00";
	hp = parseInt(profileVars["DFSTATS_df_hungerhp"]);
	if (hp <= 0) {
		health = "Dying";
		healthColor = "D20303";
	} else if (hp < 25) {
		health = "Starving";
		healthColor = "D20303";
	} else if (hp < 50) {
		health = "Hungry";
		healthColor = "FF4800";
	} else if (hp < 75) {
		health = "Fine";
		healthColor = "FFCC00";
	}
	health += "<br />" + profileVars["DFSTATS_df_hungerhp"] + " / 100";
	if (checkLSBool("general", "statusPercents")) {
		health += "<br />(" + Math.round(hp) + "%)";
	}

	sideOutput += "<div class='opElem' style='top: 165px; left: 82px;'><img class='opElem' style='text-align: right;' src='hotrods/hotrods_v" + hrV + "/HTML5/images/yummytummy.png'>";
	sideOutput += "<div class='opElem playerNourishment' style='top: 3px; left: 28px; width: 65px; text-align: center; font-weight: 100; color: #" + healthColor + ";'>" + health + "</div></div>";

	sideOutput += "<div id='sidebarArmour' class='opElem' style='top: 255px; left: 82px; text-align: right;'>";
	sideOutput += "<img src='";
	if (armour[0] !== "") {
		sideOutput += "https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + armour[0] + ".png' width='40' />";
		health = "Normal";
		healthColor = "12FF00";
		hp = parseInt(profileVars["DFSTATS_df_armourhp"]) / parseInt(profileVars["DFSTATS_df_armourhpmax"]);
		if (hp <= 0) {
			health = "Broken";
			healthColor = "D20303";
		} else if (hp < 0.4) {
			health = "Damaged";
			healthColor = "FF4800";
		} else if (hp < 0.75) {
			health = "Scratched";
			healthColor = "FFCC00";
		}
		health += "<br />" + profileVars["DFSTATS_df_armourhp"] + " / " + profileVars["DFSTATS_df_armourhpmax"];
		if (checkLSBool("general", "statusPercents")) {
			health += "<br />(" + Math.round(hp * 100) + "%)";
		}

		sideOutput += "<div class='opElem' style='top: 3px; left: 28px; width: 65px; text-align: center; font-weight: 100; color: #" + healthColor + ";'>" + health + "</div>";
	} else {
		sideOutput += "' width='40' />";
		sideOutput += "<div class='opElem' style='top: 3px; left: 28px; width: 65px; text-align: center; font-weight: 100;'></div>";
	}
	sideOutput += "</div>";

	sideOutput += "<div class='opElem boostTimes' style='top: 306px; left: 0px; width: 100%; text-align: left;  font-weight: 100; color: #00ff00;'>";

	if (parseInt(profileVars["DFSTATS_df_boostexpuntil"]) >= parseInt(profileVars["DFSTATS_df_servertime"]) + 1200000000) {
		sideOutput += "+50% Exp Boost";
	}
	if (parseInt(profileVars["DFSTATS_df_boostdamageuntil"]) >= parseInt(profileVars["DFSTATS_df_servertime"]) + 1200000000) {
		if (sideOutput !== "") {
			sideOutput += "<br />";
		}
		sideOutput += "+35% Damage Boost";
	}
	if (parseInt(profileVars["DFSTATS_df_boostspeeduntil"]) >= parseInt(profileVars["DFSTATS_df_servertime"]) + 1200000000) {
		if (sideOutput !== "") {
			sideOutput += "<br />";
		}
		sideOutput += "+35% Speed Boost";
	}

	sideOutput += "</div>";

	sideOutput += "<img class='opElem' style='left: 0px; top: 343px;' src='hotrods/hotrods_v" + hrV + "/HTML5/images/sidebar/weaponholder.png'>";

	sideOutput += "<div class='opElem weapon' style='top: 367px; left: 0px; width: 100%; text-align: center; color: #f00000; font-weight: 100;'></div>";
	sideOutput += "<div class='opElem weapon' style='top: 420px; left: 0px; width: 100%; text-align: center; color: #f00000; font-weight: 100;'></div>";
	sideOutput += "<div class='opElem weapon' style='top: 473px; left: 0px; width: 100%; text-align: center; color: #f00000; font-weight: 100;'></div>";

	var sidebarElem = document.getElementById("sidebar");
	sidebarElem.innerHTML = sideOutput;

	var weapons = [];
	weapons[0] = profileVars["DFSTATS_df_weapon1type"].split('_');
	weapons[1] = profileVars["DFSTATS_df_weapon2type"].split('_');
	weapons[2] = profileVars["DFSTATS_df_weapon3type"].split('_');

	for (var i = 0; i < weapons.length; i++) {
		if (weapons[i][0] && weapons[i][0] !== "") {
			var weapRealNum = parseInt(i) + 1;
			sidebarElem.querySelectorAll("div.weapon")[i].innerHTML = "<img src='https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + weapons[i][0] + ".png' />";
			if (profileVars["DFSTATS_df_weapon" + weapRealNum + "ammo"] && profileVars["DFSTATS_df_weapon" + weapRealNum + "ammo"] !== "") {
				var wepAmmo = nf.format(profileVars["DFSTATS_df_" + profileVars["DFSTATS_df_weapon" + weapRealNum + "ammo"]]);
				sidebarElem.querySelectorAll("div.weapon")[i].innerHTML += "<div>" + wepAmmo + " rounds</div>";
			}
		} else {
			sidebarElem.querySelectorAll("div.weapon")[i].innerHTML = "";
		}
	}

	renderAvatarUpdate(sidebarElem.querySelector(".characterRender"), profileVars);

	if (profileVars["checkstuff"] === "1") {
		checkIfLevelUp(profileVars["EXPTABLE_exp_lvl" + (parseInt(profileVars["DFSTATS_df_level"]) + 1)], profileVars["DFSTATS_df_exp"], profileVars["DFSTATS_df_freepoints"], profileVars["DFSTATS_df_level"], profileVars["password"], profileVars["userID"], profileVars["sc"], profileVars["template_ID"]);
	}
	baseGameUpdates(profileVars["DFSTATS_df_hpcurrent"], profileVars["was_dead"], profileVars["DFSTATS_df_minioutpost"], profileVars["server_time"], profileVars["DFSTATS_df_hungertime"], profileVars["DFSTATS_df_lastspawntime"], profileVars["password"], profileVars["userID"], profileVars["sc"], profileVars["template_ID"], profileVars["tts"]);
}

function loadSignature(elem, flashErl) {
	var profileVars = flshToArr(flashErl, "");
	var sigOutput = "";

	var sigWeapons = {};
	if (profileVars["DFSTATS_df_weapon1type"]) {
		sigWeapons[0] = profileVars["DFSTATS_df_weapon1type"].split('_');
	}
	if (profileVars["DFSTATS_df_weapon2type"]) {
		sigWeapons[1] = profileVars["DFSTATS_df_weapon2type"].split('_');
	}
	if (profileVars["DFSTATS_df_weapon3type"]) {
		sigWeapons[2] = profileVars["DFSTATS_df_weapon3type"].split('_');
	}
	var sigArmour;
	if (profileVars["DFSTATS_df_armourtype"]) {
		sigArmour = profileVars["DFSTATS_df_armourtype"].split('_');
	}

	sigOutput += "<div class='opElem characterRender' style='left: 30px; top: -15px;'></div>";
	sigOutput += "<div class='opElem' style='color: #fe0000; left: 4px; top: 2px;'>" + profileVars["DFSTATS_df_name"] + "</div>";
	if (profileVars["DFSTATS_df_clan_id"] !== "-1") {
		sigOutput += "<div class='opElem' style='color: #0065fe; left: 4px; top: 15px;'>" + profileVars["DFSTATS_df_clan_name"] + "</div>";
	}
	sigOutput += "<div class='opElem' style='left: 4px; top: 28px;'>" + profileVars["DFSTATS_df_profession"] + "</div>";
	sigOutput += "<div class='opElem' style='left: 4px; top: 40px;'>Level " + profileVars["DFSTATS_df_level"] + "</div>";
	var sigTradezone = tradezoneNamerShort(parseInt(profileVars["DFSTATS_df_tradezone"])) + " Zone";
	sigOutput += "<div class='opElem' style='left: 4px; top: 52px;'>" + sigTradezone + "</div>";
	sigOutput += "<div class='opElem' style='left: 4px; top: 93px;'><a href='index.php?action=profile;&u=" + profileVars["DFSTATS_id_member"] + "'>profile</a></div>";
	sigOutput += "<div class='opElem' style='left: 4px; top: 112px;'><a href='index.php?page=27&memto=" + profileVars["DFSTATS_id_member"] + "'>trade</a></div>";

	if (sigWeapons[2] && sigWeapons[2][0] && sigWeapons[2][0] !== "") {
		sigOutput += "<div class='opElem' style='left: 255px; top: 74px;'><img src='https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + sigWeapons[2][0] + ".png' alt='" + sigWeapons[2][0] + "'></div>";
		sigOutput += "<div class='opElem' style='left: 255px; top: 108px; width: 160px; text-align: center;'>" + profileVars["DFSTATS_df_weapon3name"] + "</div>";
	}

	if (sigWeapons[1] && sigWeapons[1][0] && sigWeapons[1][0] !== "") {
		sigOutput += "<div class='opElem' style='left: 255px; top: 16px;'><img src='https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + sigWeapons[1][0] + ".png' alt='" + sigWeapons[1][0] + "'></div>";
		sigOutput += "<div class='opElem' style='left: 255px; top: 52px; width: 160px; text-align: center;'>" + profileVars["DFSTATS_df_weapon2name"] + "</div>";
	}

	if (sigWeapons[0] && sigWeapons[0][0] && sigWeapons[0][0] !== "") {
		sigOutput += "<div class='opElem' style='left: 90px; top: 74px;'><img src='https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + sigWeapons[0][0] + ".png' alt='" + sigWeapons[0][0] + "'></div>";
		sigOutput += "<div class='opElem' style='left: 90px; top: 108px; width: 160px; text-align: center;'>" + profileVars["DFSTATS_df_weapon1name"] + "</div>";
	}

	if (sigArmour) {
		sigOutput += "<div class='opElem' style='left: 150px; top: 10px;'><img src='https://files.deadfrontier.com/deadfrontier/inventoryimages/large/" + sigArmour[0] + ".png' alt='" + sigArmour[0] + "'></div>";
		sigOutput += "<div class='opElem' style='left: 98px; top: 52px; width: 160px; text-align: center;'>" + profileVars["DFSTATS_df_armourname"] + "</div>";
	}

	elem.innerHTML = sigOutput;

	if (checkLSBool("forum", "displayAvatars")) {
		renderAvatarUpdate(elem.querySelector(".characterRender"), profileVars);
	}
}

function allElementsFromPoint(x, y) {
	var element, elements = [];
	var old_visibility = [];
	while (true) {
		element = document.elementFromPoint(x, y);
		if (!element || element === document.documentElement) {
			break;
		}
		elements.push(element);
		old_visibility.push(element.style.visibility);
		element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
	}
	for (var k = 0; k < elements.length; k++) {
		elements[k].style.visibility = old_visibility[k];
	}
	elements.reverse();
	return elements;
}

function specificElementFromPoint(x, y, delim, isId) {
	if (typeof isId === "undefined") {
		isId = true;
	}
	var element, elements = [];
	var old_visibility = [];
	while (true) {
		element = document.elementFromPoint(x, y);
		if (!element || element === document.documentElement) {
			break;
		}
		elements.push(element);
		old_visibility.push(element.style.visibility);
		element.style.visibility = 'hidden'; // Temporarily hide the element (without changing the layout)
		if (isId) {
			if (element.id === delim) {
				break;
			}
		} else {
			if (element.classList.contains(delim)) {
				break;
			}
		}
	}
	for (var k = 0; k < elements.length; k++) {
		elements[k].style.visibility = old_visibility[k];
	}
	return element;
}

function array_replace_recursive(arr) {
	// +   original by: Brett Zamir (http://brett-zamir.me)
	// *     example 1: array_replace_recursive({'citrus' : ["orange"], 'berries' : ["blackberry", "raspberry"]}, {'citrus' : ['pineapple'], 'berries' : ['blueberry']});
	// *     returns 1: {citrus : ['pineapple'], berries : ['blueberry', 'raspberry']}

	var retObj = {},
		i = 0,
		p = '',
		argl = arguments.length;

	if (argl < 2) {
		throw new Error('There should be at least 2 arguments passed to array_replace_recursive()');
	}

	// Although docs state that the arguments are passed in by reference, it seems they are not altered, but rather the copy that is returned (just guessing), so we make a copy here, instead of acting on arr itself
	for (p in arr) {
		retObj[p] = arr[p];
	}

	for (i = 1; i < argl; i++) {
		for (p in arguments[i]) {
			if (retObj[p] && typeof retObj[p] === 'object') {
				retObj[p] = array_replace_recursive(retObj[p], arguments[i][p]);
			} else {
				retObj[p] = arguments[i][p];
			}
		}
	}
	return retObj;
}

function tradezoneNamer(tradezone) {
	tradezone = parseInt(tradezone);
	var output = "Unknown";
	switch (tradezone) {
		case 1:
			{
				output = "North Western";
				break;
			}
		case 2:
			{
				output = "Northern";
				break;
			}
		case 3:
			{
				output = "North Eastern";
				break;
			}
		case 4:
			{
				output = "Outpost";
				break;
			}
		case 5:
			{
				output = "Central";
				break;
			}
		case 6:
			{
				output = "Eastern";
				break;
			}
		case 7:
			{
				output = "South Western";
				break;
			}
		case 8:
			{
				output = "Southern";
				break;
			}
		case 9:
			{
				output = "South Eastern";
				break;
			}
		case 10:
			{
				output = "Stockade";
				break;
			}
		case 11:
			{
				output = "Precinct 13";
				break;
			}
		case 12:
			{
				output = "Fort Pastor";
				break;
			}
		case 13:
			{
				output = "Secronom Bunker";
				break;
			}
		case 14:
			{
				output = "Wastelands";
				break;
			}
	}
	return output;
}

function tradezoneNamerShort(tradezone) {
	tradezone = parseInt(tradezone);
	var output = "Unknown";
	switch (tradezone) {
		case 1:
			{
				output = "NW";
				break;
			}
		case 2:
			{
				output = "North";
				break;
			}
		case 3:
			{
				output = "NE";
				break;
			}
		case 4:
			{
				output = "Outpost";
				break;
			}
		case 5:
			{
				output = "Central";
				break;
			}
		case 6:
			{
				output = "East";
				break;
			}
		case 7:
			{
				output = "SW";
				break;
			}
		case 8:
			{
				output = "South";
				break;
			}
		case 9:
			{
				output = "SE";
				break;
			}
		case 10:
			{
				output = "Stockade";
				break;
			}
		case 11:
			{
				output = "Precinct 13";
				break;
			}
		case 12:
			{
				output = "Fort Pastor";
				break;
			}
		case 13:
			{
				output = "Bunker";
				break;
			}
		case 14:
			{
				output = "Wastelands";
				break;
			}
	}
	return output;
}

String.prototype.explode = function (sep, n) {
	var arr = this.split(sep, n)
	if (arr[n - 1] != undefined)
		arr[n - 1] += this.substring(arr.join(' ').length);
	return arr;
};