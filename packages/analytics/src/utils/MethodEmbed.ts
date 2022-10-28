// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

const lists: MethodEmbed[] = [];

export class MethodEmbed {
	public context;
	public methodName;
	private _originalMethod;
	private _bindedMethod;

	static add(context, methodName, methodOverride) {
		getInstance(context, methodName).set(methodOverride);
	}

	static remove(context, methodName) {
		getInstance(context, methodName).remove();
	}

	constructor(context, methodName) {
		this.context = context;
		this.methodName = methodName;

		this._originalMethod = context[methodName].bind(context);
	}

	public set(methodOverride) {
		this.context[this.methodName] = (...args) => {
			return methodOverride(this._originalMethod(...args));
		};
	}

	public remove() {
		this.context[this.methodName] = this._originalMethod;
	}
}

function getInstance(context, methodName): MethodEmbed {
	let instance = lists.filter(
		h => h.context === context && h.methodName === methodName
	)[0];

	if (!instance) {
		instance = new MethodEmbed(context, methodName);
		lists.push(instance);
	}

	return instance;
}
