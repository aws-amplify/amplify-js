import camelcaseKeys from 'camelcase-keys';
import pascalcaseKeys from 'pascalcase-keys';

export function convertPlaceCamelToPascal(place) {
	const PascalPlace = pascalcaseKeys(place);
	PascalPlace.IndexName = PascalPlace.PlaceIndex;
	delete PascalPlace.PlaceIndex;
	return PascalPlace;
}

export function convertPlaceArrayPascalToCamel(placeArray) {
	const camelPlace = camelcaseKeys(placeArray, { deep: true });
	delete camelPlace.indexName;
	return camelPlace;
}
