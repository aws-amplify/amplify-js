import {
	Coordinates,
	BoundingBox,
	MapStyle,
	SearchByTextOptions,
	SearchByCoordinatesOptions,
	Place,
} from './Geo';

export interface AmazonLocationServiceProviderConfig {
	region?: string;
	maps?: {
		items: {};
		default: string;
	};
	place_indexes?: {};
}

export interface AmazonLocationServiceMapStyle extends MapStyle {
	region: string;
}

export interface AmazonLocationServiceSearchByTextOptionsBase
	extends SearchByTextOptions {
	countries?: string[];
	maxResults?: number;
	searchIndexName?: string;
}

// SearchByText options with a bias position
export interface AmazonLocationServiceSearchByTextOptionsWithBiasPosition
	extends AmazonLocationServiceSearchByTextOptionsBase {
	biasPosition?: Coordinates;
}

// SearchByText options with search area constraints (such as a bounding box)
export interface AmazonLocationServiceSearchByTextOptionsWithSearchAreaConstraints
	extends AmazonLocationServiceSearchByTextOptionsBase {
	searchAreaConstraints?: BoundingBox;
}

// Union type for searchByText options
export type AmazonLocationServiceSearchByTextOptions =
	| AmazonLocationServiceSearchByTextOptionsWithBiasPosition
	| AmazonLocationServiceSearchByTextOptionsWithSearchAreaConstraints;

export interface AmazonLocationServiceSearchByCoordinatesOptions
	extends SearchByCoordinatesOptions {
	maxResults?: number;
	searchIndexName?: string;
}

export interface AmazonLocationServicePlace extends Place {
	addressNumber?: string;
	country?: string;
	label?: string;
	municipality?: string;
	neighborhood?: string;
	postalCode?: string;
	region?: string;
	street?: string;
	subRegion?: string;
}
