// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// Shim for Jest 24 compatibility: re-exports Node.js built-in `stream` module.
// Jest 24 cannot resolve `node:stream` imports used by @smithy packages.
module.exports = require('stream');
