// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/**
 * @internal
 */
export type Permission = 'READ' | 'READWRITE' | 'WRITE';

/**
 * @internal
 */
export type LocationType = 'BUCKET' | 'PREFIX' | 'OBJECT';

/**
 * @internal
 */
export type Privilege = 'Default' | 'Minimal';

/**
 * @internal
 */
export type PrefixType = 'Object';

/**
 * @internal
 */
export type StorageAccess = 'read' | 'get' | 'list' | 'write' | 'delete';
