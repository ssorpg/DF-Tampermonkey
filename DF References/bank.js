var pData = {};

var lockEnterKey = false;

function initBank(flashErl) {
	flshToArr(flashErl, "", setUserVars);

	$("#deposit").keydown(function (evt) {
		if (evt.keyCode === 13 && !lockEnterKey) {
			lockEnterKey = true;
			deposit(0);
		}
	}).keyup(function (evt) {
		lockEnterKey = false;
	});

	$("#withdraw").keydown(function (evt) {
		if (evt.keyCode === 13 && !lockEnterKey) {
			lockEnterKey = true;
			withdraw(0);
		}
	}).keyup(function (evt) {
		lockEnterKey = false;
	});
	var waitForSetup = setInterval(function () {
		if (hrV !== 0) {
			clearInterval(waitForSetup);
			var params = {};
			params['sc'] = userVars["sc"];
			params['userID'] = userVars["userID"];
			params['password'] = userVars["password"];
			webCall("get_values", params, function (data) {
				flshToArr(data, "", function (bnkArr) {
					pData = bnkArr;
					var isPO = true;
					if (pData["df_tradezone"] === "4" && pData["df_minioutpostname"] === "Dogg`s Stockade" || pData["df_minioutpostname"] === "Precinct 13" || pData["df_minioutpostname"] === "Fort Pastor" || pData["df_minioutpostname"] === "Secronom Bunker") {
						isPO = false;
					}
					if (pData["df_minioutpost"] === "1" && parseInt(pData["df_tradezone"]) < 10 && isPO) {
						document.getElementById("bank").style.backgroundImage = "hotrods/hotrods_v" + hrV + "/HTML5/images/bank/po.png";
						document.getElementById("descText").textContent = "";
					}
					pData["df_cash"] = parseInt(pData["df_cash"]);
					pData["df_bankcash"] = parseInt(pData["df_bankcash"]);
					setupBank();
				});
			});
		}
	}, 10);
}

function setupBank() {
	//pData["df_cash"] = 23000000000;
	//pData["df_bankcash"] = 23000000000;
	var cash = "Cash: $" + nf.format(pData["df_cash"]);
	var bank = "Bank: $" + nf.format(pData["df_bankcash"]);
	$(".heldCash").each(function (cashKey, cashVal) {
		$(cashVal).text(cash).attr("data-cash", cash);
	});
	$("#deposit").val(0);
	$("#deposit").attr("max", pData["df_cash"]);
	$("#bankCash").text(bank).attr("data-cash", bank);
	$("#withdraw").val(0);
	$("#withdraw").attr("max", pData["df_bankcash"]);
	pageLock = false;
	lockInput(0);
	lockInput(1);
}

function lockInput(type) {
	var val = 0;
	if (type) // 1 is withdraw
	{
		var elem = $("#withdraw");
		val = parseInt(elem.val());
		if (val > 0 && val <= parseInt(pData["df_bankcash"])) {
			$("#wBtn").attr("disabled", false);
		} else {
			$("#wBtn").attr("disabled", true);
		}
	} else {
		var elem = $("#deposit");
		val = parseInt(elem.val());
		if (val > 0 && val <= parseInt(pData["df_cash"])) {
			$("#dBtn").attr("disabled", false);
		} else {
			$("#dBtn").attr("disabled", true);
		}
	}
}

function deposit(all) {
	if (!pageLock) {
		pageLock = true;
		var amt = 0;
		if (all) {
			amt = 9999999999999;
		} else {
			amt = parseInt($("#deposit").val());
		}
		playSound("bank");
		if (amt > 0) {
			var params = {};
			params['deposit'] = amt;
			params['sc'] = userVars["sc"];
			params['userID'] = userVars["userID"];
			params['password'] = userVars["password"];
			webCall("bank", params, function (data) {
				pData = $.merge(flshToArr(data, ""), pData);
				setupBank();
			});
		} else {
			pageLock = false;
		}
	}
}

function withdraw(all) {
	if (!pageLock) {
		pageLock = true;
		var amt = 0;
		if (all) {
			amt = 100000000000000000;
		} else {
			amt = parseInt($("#withdraw").val());
		}
		playSound("bank");
		if (amt > 0) {
			var params = {};
			params['withdraw'] = amt;
			params['sc'] = userVars["sc"];
			params['userID'] = userVars["userID"];
			params['password'] = userVars["password"];
			webCall("bank", params, function (data) {
				pData = $.merge(flshToArr(data, ""), pData);
				setupBank();
			});
		}
	}
}