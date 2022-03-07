/*!
 * Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 * SPDX-License-Identifier: Apache-2.0
 */

/** @class */
export default class CognitoUserAttribute {
	/**
	 * Constructs a new CognitoUserAttribute object
	 * @param {string=} Name The record's name
	 * @param {string=} Value The record's value
	 */
	constructor({ Name, Value } = {}) {
		this.Name = Name || '';
		this.Value = Value || '';
	}

	/**
	 * @returns {string} the record's value.
	 */
	getValue() {
		return this.Value;
	}

	/**
	 * Sets the record's value.
	 * @param {string} value The new value.
	 * @returns {CognitoUserAttribute} The record for method chaining.
	 */
	setValue(value) {
		this.Value = value;
		return this;
	}

	/**
	 * @returns {string} the record's name.
	 */
	getName() {
		return this.Name;
	}

	/**
	 * Sets the record's name
	 * @param {string} name The new name.
	 * @returns {CognitoUserAttribute} The record for method chaining.
	 */
	setName(name) {
		this.Name = name;
		return this;
	}

	/**
	 * @returns {string} a string representation of the record.
	 */
	toString() {
		return JSON.stringify(this);
	}

	/**
	 * @returns {object} a flat object representing the record.
	 */
	toJSON() {
		return {
			Name: this.Name,
			Value: this.Value,
		};
	}
}
