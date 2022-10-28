// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
	public isTailNode(key: string): boolean {
		const node = this.hashtable[key];
		return node.nextNode === this.tail;
	}
}
