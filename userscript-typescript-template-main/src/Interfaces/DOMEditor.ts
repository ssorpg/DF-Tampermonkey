"use strict";

export interface IReplaceFunctionParams {
	functionName: string,
	functionBefore?: Function,
	functionAfter?: Function
}

export interface IReplaceEventListenerParams extends IReplaceFunctionParams {
	element: HTMLElement,
	event: string
}