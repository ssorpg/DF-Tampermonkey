"use strict";

export interface IitemData {
	name: string,
	itemcat: string,
	othercolours?: string[],
	no_transfer: string,
	requiredItemsDesc?: string,
	hp?: string,
	shop_level?: string,
	level?: string,
	needdoctor?: string,
	needcook?: string
}

export interface IuserVars {
	pagetime: string,
	DFSTATS_df_tradezone: string,
	userID: string
}

declare global {
    interface Window {
		globalData: { [key: string]: IitemData },
		userVars: IuserVars,
		scrapValue: (itemSelector: string, quantity: number) => number,
		webCall: (call: string, params: { [key: string]: any }, callback: (data: string) => void, hashed: boolean) => void,
		ssorpg1: any
	}
}