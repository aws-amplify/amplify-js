// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
const anyGlobal = global as any;

anyGlobal.navigator = anyGlobal.navigator || {};

// @ts-ignore
anyGlobal.navigator.sendBeacon = anyGlobal.navigator.sendBeacon || jest.fn();
