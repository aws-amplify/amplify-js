/*
 * Copyright 2017-2021 Amazon.com, Inc. or its affiliates. All Rights Reserved.
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

// color
export const BLACK = '#000';
export const LIGHT_GREY = '#e8e8e8';
export const WHITE = '#fff';

// spacing
export const SMALL_SPACING = 4;
export const BASE_SPACING = 8;
export const LARGE_SPACING = 12;
export const EXTRA_LARGE_SPACING = 16;

// button
export const BUTTON_BORDER_RADIUS = 4;

// font
export const BASE_FONT_SIZE = 16;
export const LARGE_FONT_SIZE = 18;
export const BASE_FONT_WEIGHT = '400';

export const LINE_HEIGHT_MULTIPLIER = 1.5;

// icon
export const ICON_BUTTON_SIZE = 20;
export const ICON_BUTTON_HIT_SLOP = 10;

// component specific constants

// BannerMessage
// iOS shadow values
export const BANNER_SHADOW_HEIGHT = 2;
export const BANNER_SHADOW_WIDTH = 2;
export const BANNER_SHADOW_OPACITY = 0.1;
export const BANNER_SHADOW_RADIUS = 2;

// android shadow values
export const BANNER_ELEVATION = 3;

// TODO: delete these once they are no longer needed
// pinpoint max chars 150
export const MAX_MESSAGE =
	'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum felis eu pede mollis pretium. Integer tincidunt. Cras dapibus. Vivamus elementum semper nisi. Aenean vulputate eleifend tellus. Aenean leo ligula, porttitor eu, consequat vitae, eleifend ac, enim. Aliquam lorem ante, dapibus in, viverra quis, feugiat a, tellus. Phasellus viverra nulla ut metus varius laoreet. Quisque rutrum. Aenean imperdiet. Etiam ultricies nisi vel augue. Curabitur ullamcorper ultricies nisi. Nam eget dui. Etiam rhoncus. Maecenas tempus, tellus eget condimentum rhoncus, sem quam semper libero, sit amet adipiscing sem neque sed ipsum. Nam quam nunc, blandit vel, luctus pulvinar,';

// pinpoint max chars 64
export const MAX_HEADER =
	'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis, ultricies nec, pellentesque eu, pretium quis, sem. Nulla consequat massa quis enim. Donec pede justo, fringilla vel, aliquet nec, vulputate eget, arcu. In enim justo, rhoncus ut, imperdiet a, venenatis vitae, justo. Nullam dictum';

// pinpoint max chars 30
export const MAX_BUTTON =
	'Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Donec quam felis,';
