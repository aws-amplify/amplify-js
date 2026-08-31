// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

// `fetchAuthSession` now delegates to the active/global AmplifyContext (via the
// singleton) rather than a legacy server ContextSpec. The context is supplied
// by the caller as the first positional argument on the client APIs.
export { fetchAuthSession } from './singleton';
