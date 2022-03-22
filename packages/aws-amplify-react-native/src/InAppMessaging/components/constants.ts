/*
 * Copyright 2017-2022 Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License"). You may not use this file except in compliance with
 * the License. A copy of the License is located at
 *
 *     http://aws.amazon.com/apache2.0/
 *
 * or in the "license" file accompanying this file. This file is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR
 * CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions
 * and limitations under the License.
 */

/**
 * Style constants either match or approximate the values used in the Pinpoint console preview.
 * Some values, such as spacing, are slightly different to allow for a more mobile friendly UX
 */

import { getLineHeight } from './utils';

// color
export const COLOR_BLACK = '#000';
export const COLOR_LIGHT_GREY = '#e8e8e8';
export const COLOR_WHITE = '#fff';

// spacing
export const SPACING_SMALL = 4;
export const SPACING_MEDIUM = 8;
export const SPACING_LARGE = 12;
export const SPACING_EXTRA_LARGE = 16;

// border radius
export const BORDER_RADIUS_BASE = 4;

// font
export const FONT_SIZE_BASE = 16;
export const FONT_SIZE_LARGE = 18;

export const LINE_HEIGHT_BASE = getLineHeight(FONT_SIZE_BASE);
export const LINE_HEIGHT_LARGE = getLineHeight(FONT_SIZE_LARGE);

export const FONT_WEIGHT_BASE = '400';

// icon
export const ICON_BUTTON_SIZE = 20;
export const ICON_BUTTON_HIT_SLOP = 10;

// component specific constants

// Message UI Buttons

// default value applied in React Native TouchableOpacity
export const BUTTON_PRESSED_OPACITY = 0.2;

// Message properties

// Modal box values
export const MESSAGE_RADIUS = 2;

// iOS shadow values
export const MESSAGE_SHADOW_HEIGHT = 2;
export const MESSAGE_SHADOW_WIDTH = 2;
export const MESSAGE_SHADOW_OPACITY = 0.1;
export const MESSAGE_SHADOW_RADIUS = 2;

// android shadow values
export const MESSAGE_ELEVATION = 3;
