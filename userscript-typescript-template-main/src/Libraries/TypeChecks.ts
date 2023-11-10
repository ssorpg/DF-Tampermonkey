"use strict";

import { IBankJS, IInventoryJS, IMarketJS } from "../Interfaces/Window";

declare const window: Window;

export function windowHasBaseJS() {
	return Boolean(window.userVars);
}

export function windowHasBankJS() {
	return Boolean((window as Window & IBankJS).pData);
}

export function windowHasInventoryJS() {
	return Boolean((window as Window & IInventoryJS).globalData);
}

export function windowHasMarketJS() {
	return Boolean((window as Window & IMarketJS).marketScreen);
}