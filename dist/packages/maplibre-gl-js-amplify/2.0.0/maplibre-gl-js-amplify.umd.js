(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aws-amplify/core'), require('@aws-amplify/geo'), require('maplibre-gl'), require('@maplibre/maplibre-gl-geocoder'), require('@turf/along'), require('@turf/circle'), require('@turf/length'), require('@turf/helpers'), require('debounce'), require('@mapbox/mapbox-gl-draw'), require('maplibre-gl-draw-circle')) :
    typeof define === 'function' && define.amd ? define(['exports', '@aws-amplify/core', '@aws-amplify/geo', 'maplibre-gl', '@maplibre/maplibre-gl-geocoder', '@turf/along', '@turf/circle', '@turf/length', '@turf/helpers', 'debounce', '@mapbox/mapbox-gl-draw', 'maplibre-gl-draw-circle'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.AmplifyMapLibre = {}, global.aws_amplify_core, global.aws_amplify_geo, global.maplibregl, global.MaplibreGeocoder, global.along, global.circle, global.length, global.helpers, global.debounce, global.MapboxDraw, global.maplibreGlDrawCircle));
})(this, (function (exports, core, geo, maplibregl, MaplibreGeocoder, along, circle, length, helpers, debounce, MapboxDraw, maplibreGlDrawCircle) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var maplibregl__default = /*#__PURE__*/_interopDefaultLegacy(maplibregl);
    var MaplibreGeocoder__default = /*#__PURE__*/_interopDefaultLegacy(MaplibreGeocoder);
    var along__default = /*#__PURE__*/_interopDefaultLegacy(along);
    var circle__default = /*#__PURE__*/_interopDefaultLegacy(circle);
    var length__default = /*#__PURE__*/_interopDefaultLegacy(length);
    var MapboxDraw__default = /*#__PURE__*/_interopDefaultLegacy(MapboxDraw);

    function isCoordinates(array) {
        return (Array.isArray(array) &&
            typeof array[0] === "number" &&
            typeof array[1] === "number");
    }
    function isCoordinatesArray(array) {
        return isCoordinates(array[0]);
    }
    function isNamedLocation(object) {
        return (object &&
            Array.isArray(object.coordinates) &&
            typeof object.coordinates[0] === "number" &&
            typeof object.coordinates[1] === "number");
    }
    function isNamedLocationArray(array) {
        return isNamedLocation(array[0]);
    }
    function isGeofence(object) {
        return (object &&
            typeof object.geofenceId === "string" &&
            typeof object.geometry === "object");
    }
    function isGeofenceArray(array) {
        return Array.isArray(array) && isGeofence(array[0]);
    }
    function isPolygon(object) {
        return Array.isArray(object) && isCoordinatesArray(object[0]);
    }
    function isPolygonArray(array) {
        return Array.isArray(array) && isPolygon(array[0]);
    }
    function isGeoJsonSource(source) {
        return source.type === "geojson";
    }
    const strHasLength = (str) => typeof str === "string" && str.length > 0;
    const getFeaturesFromData = (data) => {
        let features;
        if (isCoordinatesArray(data)) {
            features = data.map((point) => {
                return {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: point },
                    properties: { place_name: `Coordinates,${point}` },
                };
            });
        }
        else if (isNamedLocationArray(data)) {
            features = data.map((location) => {
                return {
                    type: "Feature",
                    geometry: { type: "Point", coordinates: location.coordinates },
                    properties: { title: location.title, address: location.address },
                };
            });
        }
        else {
            features = data;
        }
        return features;
    };
    const urlEncodePeriods = (str) => {
        return str.replace(/\./g, "%2E");
    };
    function validateCoordinates(coordinates) {
        const [lng, lat] = coordinates;
        if (!Number.isFinite(lng) || !Number.isFinite(lat)) {
            throw new Error(`Invalid coordinates: [${lng},${lat}]`);
        }
        if (lat < -90 || lat > 90) {
            const errorString = "Latitude must be between -90 and 90 degrees inclusive.";
            console.warn(errorString);
            throw new Error(errorString);
        }
        else if (lng < -180 || lng > 180) {
            const errorString = "Longitude must be between -180 and 180 degrees inclusive.";
            console.warn(errorString);
            throw new Error(errorString);
        }
    }
    function createElement(tagName, className, container) {
        const el = window.document.createElement(tagName);
        if (className !== undefined)
            el.className = className;
        if (container)
            container.appendChild(el);
        return el;
    }
    function removeElement(node) {
        if (node.parentNode) {
            node.parentNode.removeChild(node);
        }
    }

    var __awaiter$3 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __rest$2 = (undefined && undefined.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    /**
     * An object for encapsulating an Amplify Geo transform request and Amplify credentials
     * @class AmplifyMapLibreRequest
     * @param {ICredentials} currentCredentials Amplify credentials used for signing transformRequests
     * @param {String} region AWS region
     * @return {AmplifyMapLibreRequest} `this`
     *
     */
    class AmplifyMapLibreRequest {
        constructor(currentCredentials, region) {
            this.refreshCredentials = () => __awaiter$3(this, void 0, void 0, function* () {
                try {
                    this.credentials = yield core.Amplify.Auth.currentCredentials();
                }
                catch (e) {
                    console.error(`Failed to refresh credentials: ${e}`);
                    throw e;
                }
            });
            this.refreshCredentialsWithRetry = () => __awaiter$3(this, void 0, void 0, function* () {
                try {
                    const MAX_DELAY_MS = 5 * 60 * 1000; // 5 minutes
                    yield core.jitteredExponentialRetry(this.refreshCredentials, [], MAX_DELAY_MS);
                    // Refresh credentials on a timer because HubEvents do not trigger on credential refresh currently
                    this.activeTimeout && clearTimeout(this.activeTimeout);
                    const expiration = new Date(this.credentials.expiration);
                    const timeout = expiration.getTime() - new Date().getTime() - 10000; // Adds a 10 second buffer time before the next refresh
                    this.activeTimeout = window.setTimeout(this.refreshCredentialsWithRetry, timeout);
                }
                catch (e) {
                    console.error(`Failed to refresh credentials: ${e}`);
                }
            });
            /**
             * A callback function that can be passed to a maplibre map object that is run before the map makes a request for an external URL. This transform request is used to sign the request with AWS Sigv4 Auth. [https://maplibre.org/maplibre-gl-js-docs/api/map/](https://maplibre.org/maplibre-gl-js-docs/api/map/)
             * @param {string} url The function to use as a render function. This function accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and returns a string.
             * @param {string} resourceType The function to use as a render function. This function accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and returns a string.
             * @returns {RequestParameters} [https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters](https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters)
             */
            this.transformRequest = (url, resourceType) => {
                if (resourceType === "Style" && !url.includes("://")) {
                    if (this.region == undefined) {
                        throw new Error("AWS region for map is undefined. Please verify that the region is set in aws-exports.js or that you are providing an AWS region parameter to createMap");
                    }
                    url = `https://maps.geo.${this.region}.amazonaws.com/maps/v0/maps/${url}/style-descriptor`;
                }
                if (url.includes("amazonaws.com")) {
                    // only sign AWS requests (with the signature as part of the query string)
                    const urlWithUserAgent = url +
                        `?x-amz-user-agent=${encodeURIComponent(urlEncodePeriods(core.getAmplifyUserAgent()))}`;
                    return {
                        url: core.Signer.signUrl(urlWithUserAgent, {
                            access_key: this.credentials.accessKeyId,
                            secret_key: this.credentials.secretAccessKey,
                            session_token: this.credentials.sessionToken,
                        }),
                    };
                }
            };
            this.credentials = currentCredentials;
            this.region = region;
            this.activeTimeout = null;
            this.refreshCredentialsWithRetry();
            core.Hub.listen("auth", (data) => {
                switch (data.payload.event) {
                    case "signIn":
                    case "signOut":
                    case "tokenRefresh":
                        this.refreshCredentialsWithRetry();
                        break;
                }
            });
        }
    }
    AmplifyMapLibreRequest.createMapLibreMap = (options) => __awaiter$3(void 0, void 0, void 0, function* () {
        const { region, mapConstructor = maplibregl.Map } = options, maplibreOption = __rest$2(options, ["region", "mapConstructor"]);
        const defaultMap = geo.Geo.getDefaultMap();
        const amplifyRequest = new AmplifyMapLibreRequest(yield core.Amplify.Auth.currentCredentials(), region || defaultMap.region);
        const transformRequest = amplifyRequest.transformRequest;
        const map = new mapConstructor(Object.assign(Object.assign({}, maplibreOption), { style: options.style || defaultMap.mapName, // Amplify uses the name of the map in the maplibre style field,
            transformRequest }));
        return map;
    });
    const createMap = (options) => __awaiter$3(void 0, void 0, void 0, function* () {
        return AmplifyMapLibreRequest.createMapLibreMap(options);
    });

    const COLOR_WHITE = "#fff";
    const COLOR_BLACK = "#000";
    const MARKER_COLOR = "#5d8aff";
    const ACTIVE_MARKER_COLOR = "#ff9900";
    const POPUP_BORDER_COLOR = "#0000001f";
    const GEOFENCE_COLOR = "#2194f3";
    const GEOFENCE_BORDER_COLOR = "#003560";
    const GEOFENCE_VERTEX_COLOR = "#FF9900";
    const LOCATION_MARKER = "M24.8133 38.533C18.76 31.493 13 28.8264 13 20.8264C13.4827 14.9864 16.552 9.67169 21.368 6.33302C33.768 -2.26165 50.824 5.78902 52.0667 20.8264C52.0667 28.613 46.5733 31.6797 40.6533 38.373C32.4933 47.5464 35.4 63.093 32.4933 63.093C29.72 63.093 32.4933 47.5464 24.8133 38.533ZM32.4933 8.23969C26.5573 8.23969 21.7467 13.0504 21.7467 18.9864C21.7467 24.9224 26.5573 29.733 32.4933 29.733C38.4293 29.733 43.24 24.9224 43.24 18.9864C43.24 13.0504 38.4293 8.23969 32.4933 8.23969Z";
    // Map styles exist due to an issue with Amazon Location Service not supporting the default set of maplibre fonts
    var MAP_STYLES;
    (function (MAP_STYLES) {
        MAP_STYLES["ESRI_TOPOGRAPHIC"] = "VectorEsriTopographic";
        MAP_STYLES["ESRI_STREETS"] = "VectorEsriStreets";
        MAP_STYLES["ESRI_LIGHT_GRAY"] = "VectorEsriLightGrayCanvas";
        MAP_STYLES["ESRI_DARK_GRAY"] = "VectorEsriDarkGrayCanvas";
        MAP_STYLES["ESRI_NAVIGATION"] = "VectorEsriNavigation";
        MAP_STYLES["HERE_BERLIN"] = "VectorHereBerlin";
    })(MAP_STYLES || (MAP_STYLES = {}));
    const FONT_DEFAULT_BY_STYLE = {
        [MAP_STYLES.ESRI_TOPOGRAPHIC]: "Noto Sans Regular",
        [MAP_STYLES.ESRI_STREETS]: "Arial Regular",
        [MAP_STYLES.ESRI_LIGHT_GRAY]: "Ubuntu Regular",
        [MAP_STYLES.ESRI_DARK_GRAY]: "Ubuntu Regular",
        [MAP_STYLES.ESRI_NAVIGATION]: "Arial Regular",
        [MAP_STYLES.HERE_BERLIN]: "Fira GO Regular",
    };

    function drawClusterLayer(sourceName, map, { fillColor: markerColor = MARKER_COLOR, smCircleSize: smallSize = 60, smThreshold: smallThreshold = 50, mdCircleSize: mediumSize = 100, mdThreshold: mediumThreshold = 100, lgCircleSize: largeSize = 140, lgThreshold: largeThreshold = 500, xlCircleSize: extraLargeSize = 180, borderWidth = 4, borderColor = COLOR_WHITE, clusterPaint, onClick, showCount, clusterCountLayout, fontColor = COLOR_WHITE, }, mapStyle) {
        const clusterLayerId = `${sourceName}-layer-clusters`;
        const clusterSymbolLayerId = `${sourceName}-layer-cluster-count`;
        // Use step expressions for clusters (https://docs.mapbox.com/mapbox-gl-js/style-spec/#expressions-step)
        const paintOptions = Object.assign({ "circle-color": [
                "step",
                ["get", "point_count"],
                markerColor,
                smallThreshold,
                markerColor,
                mediumThreshold,
                markerColor,
                largeThreshold,
                markerColor,
            ], "circle-radius": [
                "step",
                ["get", "point_count"],
                smallSize,
                smallThreshold,
                mediumSize,
                mediumThreshold,
                largeSize,
                largeThreshold,
                extraLargeSize,
            ], "circle-stroke-width": borderWidth, "circle-stroke-color": borderColor }, clusterPaint);
        const defaultClusterLayer = {
            id: clusterLayerId,
            type: "circle",
            source: sourceName,
            filter: ["has", "point_count"],
            paint: paintOptions,
        };
        map.addLayer(Object.assign({}, defaultClusterLayer));
        /*
         * Inspect cluster on click
         */
        map.on("click", clusterLayerId, function (e) {
            if (typeof onClick === "function")
                onClick(e);
            const features = map.queryRenderedFeatures(e.point, {
                layers: [clusterLayerId],
            });
            const clusterId = features[0].properties.cluster_id;
            const source = map.getSource(sourceName);
            if (isGeoJsonSource(source)) {
                source.getClusterExpansionZoom(clusterId, function (err, zoom) {
                    if (err)
                        return;
                    map.easeTo({
                        center: features[0].geometry.coordinates,
                        zoom: zoom,
                    });
                });
            }
        });
        /*
         * Symbol Layer for cluster point count
         */
        if (showCount) {
            const defaultLayoutOptions = {
                "text-field": "{point_count_abbreviated}",
                "text-size": 24,
            };
            const locationServiceStyle = mapStyle || geo.Geo.getDefaultMap().style;
            if (locationServiceStyle) {
                defaultLayoutOptions["text-font"] = [
                    FONT_DEFAULT_BY_STYLE[locationServiceStyle],
                ];
            }
            const layoutOptions = Object.assign(Object.assign({}, defaultLayoutOptions), clusterCountLayout);
            const paintOptions = {
                "text-color": fontColor,
            };
            const defaultClusterCount = {
                id: clusterSymbolLayerId,
                type: "symbol",
                source: sourceName,
                filter: ["has", "point_count"],
                layout: layoutOptions,
                paint: paintOptions,
            };
            map.addLayer(Object.assign({}, defaultClusterCount));
        }
        return { clusterLayerId, clusterSymbolLayerId };
    }

    function createMarker(options) {
        const fillColor = (options === null || options === void 0 ? void 0 : options.fillColor) ? options.fillColor : MARKER_COLOR;
        const strokeColor = (options === null || options === void 0 ? void 0 : options.strokeColor) ? options.strokeColor : COLOR_WHITE;
        const lineWidth = (options === null || options === void 0 ? void 0 : options.lineWidth) ? options.lineWidth : 4;
        return {
            width: 64,
            height: 64,
            data: new Uint8Array(64 * 64 * 4),
            onAdd: function () {
                const canvas = document.createElement("canvas");
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext("2d");
            },
            render: function () {
                const context = this.context;
                const markerShape = new Path2D(LOCATION_MARKER);
                context.stroke(markerShape);
                context.fillStyle = fillColor;
                context.strokeStyle = strokeColor;
                context.lineWidth = lineWidth;
                context.fill(markerShape);
                this.data = context.getImageData(0, 0, this.width, this.height).data;
                return true;
            },
        };
    }

    function getPopupRenderFunction(unclusteredLayerId, { popupBackgroundColor: background = COLOR_WHITE, popupBorderColor: borderColor = POPUP_BORDER_COLOR, popupBorderWidth: borderWidth = 2, popupFontColor: fontColor = COLOR_BLACK, popupPadding: padding = 20, popupBorderRadius: radius = 4, popupTitleFontWeight: fontWeight = "bold", }) {
        return (selectedFeature) => {
            let title, address;
            // Try to get Title and address from existing feature properties
            if (strHasLength(selectedFeature.properties.place_name)) {
                const placeName = selectedFeature.properties.place_name.split(",");
                title = placeName[0];
                address = placeName.splice(1, placeName.length).join(",");
            }
            else if (strHasLength(selectedFeature.properties.title) ||
                strHasLength(selectedFeature.properties.address)) {
                title = selectedFeature.properties.title;
                address = selectedFeature.properties.address;
            }
            else {
                title = "Coordinates";
                address = selectedFeature.geometry.coordinates;
            }
            const titleHtml = `<div class="${unclusteredLayerId}-popup-title" style="font-weight: ${fontWeight};">${title}</div>`;
            const addressHtml = `<div class="${unclusteredLayerId}-popup-address">${address}</div>`;
            const popupHtmlStyle = `background: ${background}; border: ${borderWidth}px solid ${borderColor}; color: ${fontColor}; border-radius: ${radius}px; padding: ${padding}px; word-wrap: break-word; margin: -10px -10px -15px;`;
            let popupHtml = `<div class="${unclusteredLayerId}-popup" style="${popupHtmlStyle}">`;
            if (title)
                popupHtml += titleHtml;
            if (address)
                popupHtml += addressHtml;
            popupHtml += "</div>";
            return popupHtml;
        };
    }

    var __rest$1 = (undefined && undefined.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    const HIDE_TIP = "amplify-tip";
    function drawUnclusteredLayer(sourceName, map, _a) {
        var { showMarkerPopup = false } = _a, options = __rest$1(_a, ["showMarkerPopup"]);
        const unclusteredLayerId = `${sourceName}-layer-unclustered-point`;
        let selectedId = null;
        function deselectPoint() {
            if (selectedId !== null) {
                map.setLayoutProperty(unclusteredLayerId, "icon-image", "inactive-marker");
                selectedId = null;
            }
        }
        const popupRender = options.popupRender
            ? options.popupRender
            : getPopupRenderFunction(unclusteredLayerId, options);
        addUnclusteredMarkerImages(map, options);
        const defaultUnclusteredPoint = {
            id: unclusteredLayerId,
            type: "symbol",
            source: sourceName,
            filter: ["!", ["has", "point_count"]],
            layout: {
                "icon-image": "inactive-marker",
            },
        };
        map.addLayer(Object.assign({}, defaultUnclusteredPoint));
        /*
         * Add css to header to hide default popup tip
         */
        if (showMarkerPopup) {
            const element = document.getElementById(HIDE_TIP);
            if (!element) {
                const style = document.createElement("style");
                style.setAttribute("id", HIDE_TIP);
                document.head.append(style);
                style.textContent = ".mapboxgl-popup-tip { display: none; }";
            }
        }
        map.on("click", function () {
            deselectPoint();
        });
        /*
         * Set active state on markers when clicked
         */
        map.on("click", unclusteredLayerId, function (e) {
            if (typeof options.onClick === "function")
                options.onClick(e);
            selectedId = e.features[0].id;
            map.setLayoutProperty(unclusteredLayerId, "icon-image", [
                "match",
                ["id"],
                selectedId,
                "active-marker",
                "inactive-marker", // default
            ]);
            // If popup option is set show a popup on click
            if (showMarkerPopup) {
                const selectedFeature = e.features[0];
                const coordinates = selectedFeature.geometry.coordinates;
                if (isCoordinates(coordinates)) {
                    const popup = new maplibregl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(popupRender(selectedFeature))
                        .setOffset(15)
                        .addTo(map);
                    popup.on("close", function () {
                        if (selectedId === selectedFeature.id)
                            deselectPoint();
                    });
                }
            }
        });
        /*
         * Set cursor style to pointer when mousing over point layer
         */
        map.on("mouseover", unclusteredLayerId, function () {
            map.getCanvas().style.cursor = "pointer";
        });
        /*
         * Reset cursor style when the point layer
         */
        map.on("mouseleave", unclusteredLayerId, () => {
            map.getCanvas().style.cursor = "";
        });
        return { unclusteredLayerId };
    }
    /*
     * Adds marker images to the maplibre canvas to be used for rendering unclustered points
     */
    function addUnclusteredMarkerImages(map, { selectedColor = ACTIVE_MARKER_COLOR, selectedBorderColor = COLOR_WHITE, selectedBorderWidth = 4, defaultBorderColor = COLOR_WHITE, defaultBorderWidth = 4, defaultColor: fillColor = MARKER_COLOR, markerImageElement, activeMarkerImageElement, }) {
        const inactiveMarker = markerImageElement ||
            createMarker({
                fillColor: fillColor,
                strokeColor: defaultBorderColor,
                lineWidth: defaultBorderWidth,
            });
        const activeMarker = activeMarkerImageElement ||
            markerImageElement ||
            createMarker({
                fillColor: selectedColor,
                strokeColor: selectedBorderColor,
                lineWidth: selectedBorderWidth,
            });
        map.addImage("inactive-marker", inactiveMarker, { pixelRatio: 2 });
        map.addImage("active-marker", activeMarker, { pixelRatio: 2 });
    }

    /**
     * DrawPoints utility function for adding points to a map based on coordinate data or a FeatureCollection. Will add clustered points and styled markers by default with options for popups and other styles
     * @param {String} sourceName A user defined name used for determining the maplibre data source and the maplibre layers
     * @param {Coordinate[] | Feature[]} data An array of coordinate data or GeoJSON Features used as the data source for maplibre
     * @param {maplibre-gl-js-Map} map A maplibre-gl-js [map](https://maplibre.org/maplibre-gl-js-docs/api/map/) on which the points will be drawn
     * @param {Object} options An object containing options for changing the styles and features of the points rendered to the map, see the options for more details on available settings
     * @param {String} options.showCluster Determines whether or not points close together should be clustered into a single point
     * @param {String} options.clusterOptions Object for determining cluster options, see [ClusterOptions](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/types.ts#L43) for more details
     * @param {String} options.unclusteredOptions Object for determining unclustered point options, see [UnclusteredOptions](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/types.ts#L8) for more details
     * @param {MAP_STYLE} mapStyle A required parameter that indicates the map style returned from Amazon Location Service. This is used to determine the default fonts to be used with maplibre-gl-js. View existing styles [here](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/constants.ts#L8)
     * @returns {DrawPointsOutput} output An object containing the string id's of the sources and layers used to draw the points to the map. This includes the sourceId, clusterLayerId, clusterSymbolLayerId, unclusteredLayerId.
     * @property {String} sourceId The [source](https://maplibre.org/maplibre-gl-js-docs/api/sources/) used to contain all of the coordinate/feature data
     * @property {String} clusterLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/) used for creating and styling the points that are clustered together
     * @property {String} clusterSymbolLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#symbol) used for creating styling the number that shows the count of points in a cluster
     * @property {String} unclusteredLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers) used for creating and styling the individual points on the map and the popup when clicking on a point
     */
    function drawPoints(sourceName, data, map, { showCluster = true, clusterOptions = {}, unclusteredOptions: unclusteredMarkerOptions = {}, autoFit = true, } = {}, mapStyle) {
        var _a, _b;
        if (!map ||
            typeof map.addSource !== "function" ||
            typeof map.addLayer !== "function") {
            throw new Error("Please use a maplibre map");
        }
        /*
         * Convert data passed in as coordinates into features
         */
        const features = getFeaturesFromData(data);
        /*
         * Data source for features
         */
        const sourceId = sourceName;
        map.addSource(sourceId, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features,
            },
            cluster: showCluster,
            clusterMaxZoom: (_a = clusterOptions.clusterMaxZoom) !== null && _a !== void 0 ? _a : 14,
            clusterRadius: (_b = clusterOptions.smCircleSize) !== null && _b !== void 0 ? _b : 60,
            generateId: true,
        });
        /*
         * Draw ui layers for source data
         */
        let clusterLayerId, clusterSymbolLayerId;
        if (showCluster) {
            ({ clusterLayerId, clusterSymbolLayerId } = drawClusterLayer(sourceId, map, clusterOptions, mapStyle));
        }
        const { unclusteredLayerId } = drawUnclusteredLayer(sourceId, map, unclusteredMarkerOptions || {});
        if (autoFit) {
            const mapBounds = map.getBounds();
            features.forEach(function (feature) {
                mapBounds.extend(feature.geometry.coordinates);
            });
            map.fitBounds(mapBounds);
        }
        // utility function for setting layer visibility to none
        const hide = () => {
            map.setLayoutProperty(unclusteredLayerId, "visibility", "none");
            if (clusterLayerId)
                map.setLayoutProperty(clusterLayerId, "visibility", "none");
            if (clusterSymbolLayerId)
                map.setLayoutProperty(clusterSymbolLayerId, "visibility", "none");
        };
        // utility function for setting layer visibility to visible
        const show = () => {
            map.setLayoutProperty(unclusteredLayerId, "visibility", "visible");
            if (clusterLayerId)
                map.setLayoutProperty(clusterLayerId, "visibility", "visible");
            if (clusterSymbolLayerId)
                map.setLayoutProperty(clusterSymbolLayerId, "visibility", "visible");
        };
        // utility function updating the data source
        const setData = (data) => {
            const features = getFeaturesFromData(data);
            map.getSource(sourceId).setData({
                type: "FeatureCollection",
                features,
            });
        };
        return {
            sourceId,
            unclusteredLayerId,
            clusterLayerId,
            clusterSymbolLayerId,
            setData,
            show,
            hide,
        };
    }

    function createDefaultIcon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        const iconCircle = document.createElement("circle");
        customIcon.setAttribute("viewBox", "0 0 64 64");
        customIcon.setAttribute("width", "32");
        customIcon.setAttribute("height", "32");
        iconPath.setAttribute("d", LOCATION_MARKER);
        iconPath.setAttribute("fill", "#5d8aff");
        iconCircle.setAttribute("fill", "white");
        iconCircle.setAttribute("cx", "50%");
        iconCircle.setAttribute("cy", "50%");
        iconCircle.setAttribute("r", "5");
        customIcon.appendChild(iconCircle);
        customIcon.appendChild(iconPath);
        return customIcon;
    }

    var __awaiter$2 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    var __rest = (undefined && undefined.__rest) || function (s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    };
    const AmplifyGeocoderAPI = {
        forwardGeocode: (config) => __awaiter$2(void 0, void 0, void 0, function* () {
            const features = [];
            try {
                const data = yield geo.Geo.searchByText(config.query, {
                    biasPosition: config.bbox ? undefined : config.proximity,
                    searchAreaConstraints: config.bbox,
                    countries: config.countries,
                    maxResults: config.limit,
                });
                if (data) {
                    data.forEach((result) => {
                        const { geometry } = result, otherResults = __rest(result, ["geometry"]);
                        features.push({
                            type: "Feature",
                            geometry: { type: "Point", coordinates: geometry.point },
                            properties: Object.assign({}, otherResults),
                            place_name: otherResults.label,
                            text: otherResults.label,
                            center: geometry.point,
                        });
                    });
                }
            }
            catch (e) {
                console.error(`Failed to forwardGeocode with error: ${e}`);
            }
            return { features };
        }),
        reverseGeocode: (config) => __awaiter$2(void 0, void 0, void 0, function* () {
            const features = [];
            try {
                const data = yield geo.Geo.searchByCoordinates(config.query, {
                    maxResults: config.limit,
                });
                if (data && data.geometry) {
                    const { geometry } = data, otherResults = __rest(data, ["geometry"]);
                    features.push({
                        type: "Feature",
                        geometry: { type: "Point", coordinates: geometry.point },
                        properties: Object.assign({}, otherResults),
                        place_name: otherResults.label,
                        text: otherResults.label,
                        center: geometry.point,
                    });
                }
            }
            catch (e) {
                console.error(`Failed to reverseGeocode with error: ${e}`);
            }
            return { features };
        }),
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function createAmplifyGeocoder(options) {
        return new MaplibreGeocoder__default["default"](AmplifyGeocoderAPI, Object.assign({ maplibregl: maplibregl__default["default"], showResultMarkers: { element: createDefaultIcon() }, marker: { element: createDefaultIcon() }, 
            // autocomplete temporarily disabled by default until CLI is updated
            showResultsWhileTyping: options === null || options === void 0 ? void 0 : options.autocomplete }, options));
    }

    const GEOFENCE_ID_REGEX = /^[-._\p{L}\p{N}]+$/iu;
    const getGeofenceFeatureArray = (data) => {
        const coordinates = isGeofenceArray(data)
            ? data.map((geofence) => geofence.geometry.polygon)
            : data;
        return {
            type: "Feature",
            geometry: {
                type: "MultiPolygon",
                coordinates,
            },
            properties: {},
        };
    };
    const getGeofenceFeatureFromPolygon = (polygon) => {
        return {
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: polygon,
            },
            properties: {},
        };
    };
    // Measures distance between the coordinate bounds and takes two points 1/4 from each coordinate to create a polygon
    const getPolygonFeatureFromBounds = (id, bounds) => {
        const swCoordinate = bounds.getSouthWest().toArray();
        const neCoordinate = bounds.getNorthEast().toArray();
        const center = bounds.getCenter().toArray();
        const line = helpers.lineString([swCoordinate, center, neCoordinate]);
        const distanceInMiles = length__default["default"](line, { units: "miles" });
        // Gets coordinates 1/4 along the line from each coordinate
        const southWestCoordinate = along__default["default"](line, distanceInMiles / 4, {
            units: "miles",
        }).geometry.coordinates;
        const northeastCoordinate = along__default["default"](line, distanceInMiles * (3 / 4), {
            units: "miles",
        }).geometry.coordinates;
        // Creates a polygon from the coordinates found along the line between the bounding coordinates in counter clockwise order starting from northeast most coordinate
        const polygon = [
            [
                northeastCoordinate,
                [southWestCoordinate[0], northeastCoordinate[1]],
                southWestCoordinate,
                [northeastCoordinate[0], southWestCoordinate[1]],
                northeastCoordinate,
            ],
        ];
        return {
            id,
            type: "Feature",
            geometry: {
                type: "Polygon",
                coordinates: polygon,
            },
            properties: {},
        };
    };
    const getCircleFeatureFromCoords = (id, center, { bounds, radius }) => {
        if (!bounds && !radius) {
            throw new Error("Circle requires a bounds or a radius");
        }
        validateCoordinates(center);
        const circleRadius = radius !== null && radius !== void 0 ? radius : getDistanceFromBounds(bounds) / 8;
        const circleFeature = circle__default["default"](center, circleRadius, { units: "miles" });
        return {
            id,
            type: "Feature",
            properties: {
                isCircle: true,
                center,
                radius: circleRadius,
            },
            geometry: {
                type: "Polygon",
                coordinates: circleFeature.geometry.coordinates,
            },
        };
    };
    const getDistanceFromBounds = (bounds) => {
        const swCoordinate = bounds.getSouthWest().toArray();
        const neCoordinate = bounds.getNorthEast().toArray();
        const center = bounds.getCenter().toArray();
        const line = helpers.lineString([swCoordinate, center, neCoordinate]);
        return length__default["default"](line, { units: "miles" });
    };
    const doesGeofenceExist = (id, loadedGeofences) => {
        return !!loadedGeofences[id];
    };
    const isValidGeofenceId = (id) => {
        return !!id.match(GEOFENCE_ID_REGEX);
    };
    const isExistingGeofenceId = (id, loadedGeofences) => {
        return doesGeofenceExist(id, loadedGeofences);
    };
    const getDistanceBetweenCoordinates = (startCoord, endCoord) => {
        const line = helpers.lineString([startCoord, endCoord]);
        const distanceInMiles = length__default["default"](line, { units: "miles" });
        return distanceInMiles;
    };

    const FILL_OPACITY = 0.3;
    const BORDER_OPACITY = 0.5;
    const BORDER_WIDTH = 4;
    /**
     * DrawPoints utility function for adding points to a map based on coordinate data or a FeatureCollection. Will add clustered points and styled markers by default with options for popups and other styles
     */
    function drawGeofences(sourceName, data, map, options = {}) {
        var _a, _b, _c, _d, _e, _f, _g, _h;
        if (!map ||
            typeof map.addSource !== "function" ||
            typeof map.addLayer !== "function") {
            throw new Error("Please use a maplibre map");
        }
        if (data.length > 0 && !isGeofenceArray(data) && !isPolygonArray(data)) {
            throw new Error("Please pass in an array of Geofences or an array of Polygons");
        }
        /*
         * Data source for features
         * Convert data passed in as coordinates into feature data
         */
        const sourceId = `${sourceName}`;
        map.addSource(sourceId, {
            type: "geojson",
            data: getGeofenceFeatureArray(data),
            generateId: true,
        });
        const initialVisiblity = ((_a = options.visible) !== null && _a !== void 0 ? _a : true) ? "visible" : "none";
        /*
         * Draw ui layers for source data
         */
        const fillLayerId = `${sourceName}-fill-layer`;
        map.addLayer({
            id: fillLayerId,
            type: "fill",
            source: sourceId,
            layout: {
                visibility: initialVisiblity,
            },
            paint: {
                "fill-color": (_b = options.fillColor) !== null && _b !== void 0 ? _b : COLOR_BLACK,
                "fill-opacity": (_c = options.fillOpacity) !== null && _c !== void 0 ? _c : FILL_OPACITY,
            },
        });
        // Add a black outline around the polygon.
        const outlineLayerId = `${sourceName}-outline-layer`;
        map.addLayer({
            id: outlineLayerId,
            type: "line",
            source: sourceId,
            layout: {
                visibility: initialVisiblity,
            },
            paint: {
                "line-color": (_d = options.borderColor) !== null && _d !== void 0 ? _d : COLOR_BLACK,
                "line-opacity": (_e = options.borderOpacity) !== null && _e !== void 0 ? _e : BORDER_OPACITY,
                "line-width": (_f = options.borderWidth) !== null && _f !== void 0 ? _f : BORDER_WIDTH,
                "line-offset": (_g = options.borderOffset) !== null && _g !== void 0 ? _g : (((_h = options.borderWidth) !== null && _h !== void 0 ? _h : BORDER_WIDTH) / 2) * -1,
            },
        });
        // utility function for setting layer visibility to none
        const hide = () => {
            map.setLayoutProperty(fillLayerId, "visibility", "none");
            map.setLayoutProperty(outlineLayerId, "visibility", "none");
        };
        // utility function for setting layer visibility to visible
        const show = () => {
            map.setLayoutProperty(fillLayerId, "visibility", "visible");
            map.setLayoutProperty(outlineLayerId, "visibility", "visible");
        };
        // utility function for checking layer visibility
        const isVisible = () => {
            const visibility = map.getLayoutProperty(fillLayerId, "visibility");
            return visibility === "visible";
        };
        // utility function for setting layer visibility to visible
        const setData = (data) => {
            map.getSource(sourceId).setData(data);
        };
        return {
            sourceId,
            outlineLayerId,
            fillLayerId,
            show,
            hide,
            isVisible,
            setData,
        };
    }

    const EDIT_ICON_PATH = "M0.5 12.375V15.5H3.625L12.8417 6.28333L9.71667 3.15833L0.5 12.375ZM2.93333 13.8333H2.16667V13.0667L9.71667 5.51667L10.4833 6.28333L2.93333 13.8333ZM15.2583 2.69167L13.3083 0.741667C13.1417 0.575 12.9333 0.5 12.7167 0.5C12.5 0.5 12.2917 0.583333 12.1333 0.741667L10.6083 2.26667L13.7333 5.39167L15.2583 3.86667C15.5833 3.54167 15.5833 3.01667 15.2583 2.69167Z";
    function createEditIcon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        customIcon.setAttribute("viewBox", "0 0 16 16");
        customIcon.setAttribute("width", "16");
        customIcon.setAttribute("height", "16");
        customIcon.setAttribute("fill", "none");
        iconPath.setAttribute("d", EDIT_ICON_PATH);
        iconPath.setAttribute("fill", "white");
        customIcon.appendChild(iconPath);
        return customIcon;
    }
    const TRASH_ICON_PATH = "M9.33317 5.5V13.8333H2.6665V5.5H9.33317ZM8.08317 0.5H3.9165L3.08317 1.33333H0.166504V3H11.8332V1.33333H8.9165L8.08317 0.5ZM10.9998 3.83333H0.999837V13.8333C0.999837 14.75 1.74984 15.5 2.6665 15.5H9.33317C10.2498 15.5 10.9998 14.75 10.9998 13.8333V3.83333Z";
    function createTrashIcon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        const iconPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        customIcon.setAttribute("viewBox", "0 0 12 16");
        customIcon.setAttribute("width", "12");
        customIcon.setAttribute("height", "16");
        customIcon.setAttribute("fill", "none");
        iconPath.setAttribute("d", TRASH_ICON_PATH);
        iconPath.setAttribute("fill", "white");
        customIcon.appendChild(iconPath);
        return customIcon;
    }
    function createPopupStep1Icon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        customIcon.setAttribute("viewBox", "0 0 38 38");
        customIcon.setAttribute("width", "38");
        customIcon.setAttribute("height", "38");
        customIcon.setAttribute("fill", "none");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "19");
        circle.setAttribute("cy", "18");
        circle.setAttribute("r", "8");
        circle.setAttribute("fill", "#FF9900");
        const path1 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path1.setAttribute("d", "M19 0L23.3302 7.5H14.6699L19 0Z");
        path1.setAttribute("fill", "#003560");
        const path2 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path2.setAttribute("d", "M19 36.5L14.6698 29H23.3301L19 36.5Z");
        path2.setAttribute("fill", "#003560");
        const path3 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path3.setAttribute("d", "M0 18.33L7.5 13.9999L7.5 22.6602L0 18.33Z");
        path3.setAttribute("fill", "#003560");
        const path4 = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path4.setAttribute("d", "M37.5 18.3301L30 22.6603V14L37.5 18.3301Z");
        path4.setAttribute("fill", "#003560");
        customIcon.appendChild(circle);
        customIcon.appendChild(path1);
        customIcon.appendChild(path2);
        customIcon.appendChild(path3);
        customIcon.appendChild(path4);
        return customIcon;
    }
    function createPopupStep2Icon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        customIcon.setAttribute("viewBox", "0 0 42 27");
        customIcon.setAttribute("width", "42");
        customIcon.setAttribute("height", "27");
        customIcon.setAttribute("fill", "none");
        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("y1", "8");
        line.setAttribute("x2", "42");
        line.setAttribute("y2", "8");
        line.setAttribute("stroke", "black");
        line.setAttribute("stroke-width", "2");
        const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
        circle.setAttribute("cx", "21");
        circle.setAttribute("cy", "8");
        circle.setAttribute("r", "8");
        circle.setAttribute("fill", "#FF9900");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M21 6.17822V22.488L24.6951 19.4356L27.172 26.1782L29.0399 25.3582L26.6035 18.57L31.4762 17.9322L21 6.17822Z");
        path.setAttribute("fill", "#003560");
        customIcon.appendChild(line);
        customIcon.appendChild(circle);
        customIcon.appendChild(path);
        return customIcon;
    }
    function createPopupStep3Icon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        customIcon.setAttribute("viewBox", "0 0 32 32");
        customIcon.setAttribute("width", "32");
        customIcon.setAttribute("height", "32");
        customIcon.setAttribute("fill", "none");
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("y", "1");
        rect.setAttribute("x", "1");
        rect.setAttribute("width", "30");
        rect.setAttribute("height", "30");
        rect.setAttribute("fill", "#2196F3");
        rect.setAttribute("fill-opacity", "0.4");
        rect.setAttribute("stroke", "#003560");
        rect.setAttribute("stroke-width", "2");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M11 6V22.3098L14.6951 19.2574L17.172 26L19.0399 25.18L16.6035 18.3918L21.4762 17.754L11 6Z");
        path.setAttribute("fill", "#003560");
        customIcon.appendChild(rect);
        customIcon.appendChild(path);
        return customIcon;
    }
    function createPopupStep4Icon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        customIcon.setAttribute("viewBox", "0 0 64 20");
        customIcon.setAttribute("width", "64");
        customIcon.setAttribute("height", "20");
        customIcon.setAttribute("fill", "none");
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("y", "0.5");
        rect.setAttribute("x", "0.5");
        rect.setAttribute("width", "63");
        rect.setAttribute("height", "19");
        rect.setAttribute("rx", "3.5");
        rect.setAttribute("stroke", "#014478");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M14.4148 15C17.517 15 19.3118 13.076 19.3118 9.89418C19.3118 6.72727 17.517 4.81818 14.5192 4.81818H11.1186V15H14.4148ZM12.6548 13.6577V6.16051H14.4247C16.652 6.16051 17.8004 7.4929 17.8004 9.89418C17.8004 12.3054 16.652 13.6577 14.3303 13.6577H12.6548ZM24.394 15.1541C26.0595 15.1541 27.2377 14.3338 27.5758 13.0909L26.1689 12.8374C25.9004 13.5582 25.2541 13.9261 24.4089 13.9261C23.1362 13.9261 22.2811 13.1009 22.2413 11.6293H27.6703V11.1023C27.6703 8.34304 26.0197 7.2642 24.2896 7.2642C22.1618 7.2642 20.7598 8.88494 20.7598 11.2315C20.7598 13.603 22.1419 15.1541 24.394 15.1541ZM22.2463 10.5156C22.3059 9.43182 23.0914 8.49219 24.2995 8.49219C25.4529 8.49219 26.2086 9.3473 26.2136 10.5156H22.2463ZM30.8061 4.81818H29.3196V15H30.8061V4.81818ZM36.0971 15.1541C37.7626 15.1541 38.9409 14.3338 39.2789 13.0909L37.872 12.8374C37.6035 13.5582 36.9572 13.9261 36.112 13.9261C34.8393 13.9261 33.9842 13.1009 33.9444 11.6293H39.3734V11.1023C39.3734 8.34304 37.7228 7.2642 35.9927 7.2642C33.8649 7.2642 32.4629 8.88494 32.4629 11.2315C32.4629 13.603 33.845 15.1541 36.0971 15.1541ZM33.9494 10.5156C34.0091 9.43182 34.7946 8.49219 36.0027 8.49219C37.1561 8.49219 37.9118 9.3473 37.9167 10.5156H33.9494ZM44.5874 7.36364H43.0213V5.53409H41.5348V7.36364H40.4162V8.55682H41.5348V13.0661C41.5298 14.4531 42.5888 15.1243 43.7621 15.0994C44.2344 15.0945 44.5526 15.005 44.7266 14.9403L44.4581 13.7124C44.3587 13.7322 44.1747 13.777 43.9361 13.777C43.4538 13.777 43.0213 13.6179 43.0213 12.7578V8.55682H44.5874V7.36364ZM49.4409 15.1541C51.1064 15.1541 52.2846 14.3338 52.6227 13.0909L51.2157 12.8374C50.9473 13.5582 50.301 13.9261 49.4558 13.9261C48.1831 13.9261 47.3279 13.1009 47.2882 11.6293H52.7172V11.1023C52.7172 8.34304 51.0666 7.2642 49.3365 7.2642C47.2086 7.2642 45.8066 8.88494 45.8066 11.2315C45.8066 13.603 47.1887 15.1541 49.4409 15.1541ZM47.2931 10.5156C47.3528 9.43182 48.1383 8.49219 49.3464 8.49219C50.4998 8.49219 51.2555 9.3473 51.2605 10.5156H47.2931Z");
        path.setAttribute("fill", "black");
        customIcon.appendChild(rect);
        customIcon.appendChild(path);
        return customIcon;
    }
    function createDeleteSuccessIcon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        customIcon.setAttribute("viewBox", "0 0 12 12");
        customIcon.setAttribute("width", "12");
        customIcon.setAttribute("height", "12");
        customIcon.setAttribute("fill", "none");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M6 0C2.688 0 0 2.688 0 6C0 9.312 2.688 12 6 12C9.312 12 12 9.312 12 6C12 2.688 9.312 0 6 0ZM6 10.8C3.354 10.8 1.2 8.646 1.2 6C1.2 3.354 3.354 1.2 6 1.2C8.646 1.2 10.8 3.354 10.8 6C10.8 8.646 8.646 10.8 6 10.8ZM8.754 3.348L4.8 7.302L3.246 5.754L2.4 6.6L4.8 9L9.6 4.2L8.754 3.348Z");
        path.setAttribute("fill", "white");
        customIcon.appendChild(path);
        return customIcon;
    }
    function createCloseIcon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        customIcon.setAttribute("viewBox", "0 0 12 12");
        customIcon.setAttribute("width", "12");
        customIcon.setAttribute("height", "12");
        customIcon.setAttribute("fill", "none");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M10.773 2.28762L9.71231 1.22696L6 4.93927L2.28769 1.22696L1.22703 2.28762L4.93934 5.99993L1.22703 9.71224L2.28769 10.7729L6 7.06059L9.71231 10.7729L10.773 9.71224L7.06066 5.99993L10.773 2.28762Z");
        path.setAttribute("fill", "white");
        path.setAttribute("fill-rule", "evenodd");
        path.setAttribute("clip-rule", "evenodd");
        customIcon.appendChild(path);
        return customIcon;
    }
    function createErrorIcon() {
        const customIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
        customIcon.setAttribute("viewBox", "0 0 12 10");
        customIcon.setAttribute("width", "12");
        customIcon.setAttribute("height", "10");
        customIcon.setAttribute("fill", "none");
        const path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        path.setAttribute("d", "M0 10H11.5789L5.78947 0L0 10ZM6.31579 8.42105H5.26316V7.36842H6.31579V8.42105ZM6.31579 6.31579H5.26316V4.21053H6.31579V6.31579Z");
        path.setAttribute("fill", "#FF5050");
        customIcon.appendChild(path);
        return customIcon;
    }

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    function AmplifyGeofenceControlUI(geofenceControl, geofenceControlContainer) {
        let _addGeofenceContainer;
        let _deleteGeofenceContainer;
        let _addGeofencebutton;
        let _checkboxAll;
        let _geofenceList;
        let _createContainer;
        let _geofenceTitle;
        let _checkBoxAllAndCreateContainer;
        let _checkBoxAllContainer;
        let _circleModeContainer;
        let _polygonModeContainer;
        let _deletePopdownContainer;
        let _errorDiv;
        let _geofenceCreateRadiusInput;
        function registerControlPosition(map, positionName) {
            if (map._controlPositions[positionName]) {
                return;
            }
            const positionContainer = document.createElement("div");
            positionContainer.className = `maplibregl-ctrl-${positionName}`;
            map._controlContainer.appendChild(positionContainer);
            map._controlPositions[positionName] = positionContainer;
        }
        /************************************************************
         * Create Geofence Controls
         *************************************************************/
        function createGeofenceCreateContainer(isCircle) {
            const container = createElement("div", "geofence-ctrl-create-prompt-container", geofenceControlContainer);
            _createContainer = createElement("div", "geofence-ctrl-create-prompt", container);
            if (isCircle) {
                /* Create buttons to switch between different modes */
                const buttonContainer = createElement("div", "geofence-ctrl-create-prompt-buttons", _createContainer);
                const circleModeButton = createElement("div", "geofence-ctrl-create-prompt-button-circle geofence-ctrl-create-prompt-button", buttonContainer);
                circleModeButton.addEventListener("click", () => {
                    // Change button selected style
                    circleModeButton.classList.add("geofence-ctrl-create-prompt-selected");
                    polygonModeButton.classList.remove("geofence-ctrl-create-prompt-selected");
                    // Switch info box mode
                    if (_polygonModeContainer) {
                        removeElement(_polygonModeContainer);
                        _polygonModeContainer = undefined;
                    }
                    if (!_circleModeContainer)
                        createCircleModeCreateContainer(_createContainer);
                    geofenceControl.changeMode("draw_circle");
                });
                circleModeButton.innerHTML = "Circle";
                const polygonModeButton = createElement("div", "geofence-ctrl-create-prompt-button-polygon geofence-ctrl-create-prompt-button", buttonContainer);
                polygonModeButton.addEventListener("click", () => {
                    geofenceControl.changeMode("draw_polygon");
                    // Change button selected style
                    polygonModeButton.classList.add("geofence-ctrl-create-prompt-selected");
                    circleModeButton.classList.remove("geofence-ctrl-create-prompt-selected");
                    // Switch info box mode
                    if (_circleModeContainer) {
                        removeElement(_circleModeContainer);
                        _circleModeContainer = undefined;
                    }
                    if (!_polygonModeContainer)
                        createPolygonModeCreateContainer(_createContainer);
                });
                polygonModeButton.innerHTML = "Custom";
                circleModeButton.classList.add("geofence-ctrl-create-prompt-selected");
                createCircleModeCreateContainer(_createContainer);
            }
            else {
                createPolygonModeCreateContainer(_createContainer);
            }
        }
        function createCircleModeCreateContainer(container) {
            _circleModeContainer = createElement("div", "geofence-ctrl-create-circle-mode-container", container);
            const radiusTitle = createElement("div", "geofence-ctrl-create-circle-mode-title", _circleModeContainer);
            radiusTitle.innerHTML = "Radius";
            _geofenceCreateRadiusInput = createElement("input", "geofence-ctrl-create-circle-mode-input", _circleModeContainer);
            _geofenceCreateRadiusInput.addEventListener("keydown", debounce.debounce(geofenceControl.updateInputRadius, 200));
        }
        function createPolygonModeCreateContainer(container) {
            _polygonModeContainer = createElement("div", "geofence-ctrl-create-polygon-mode-container", container);
            const moreInfoContainer = createElement("div", "geofence-ctrl-create-polygon-mode-info-container", _polygonModeContainer);
            const moreInfoIcon = createElement("div", "geofence-ctrl-create-polygon-mode-icon", moreInfoContainer);
            const letterI = createElement("div", "geofence-ctrl-create-polygon-mode-info-icon", moreInfoIcon);
            letterI.innerHTML = "i";
            const moreInfo = createElement("div", "geofence-ctrl-create-polygon-mode-title", moreInfoContainer);
            moreInfo.innerHTML = "How it works?";
            const resetButton = createElement("div", "geofence-ctrl-create-polygon-mode-reset-button geofence-ctrl-button", _polygonModeContainer);
            resetButton.innerHTML = "Reset";
            resetButton.addEventListener("click", () => {
                geofenceControl.resetGeofence();
            });
            // Add popup onClick
            const popup = createPolygonModeInfoPopup(moreInfoIcon);
            moreInfoContainer.addEventListener("click", () => {
                popup.classList.toggle("show");
            });
        }
        function createPolygonModeInfoPopup(container) {
            const popupContainer = createElement("div", "geofence-ctrl-create-polygon-mode-popup-container", container);
            const popup = createElement("div", "geofence-ctrl-create-polygon-mode-popup", popupContainer);
            createPopupStep(popup, "Move dots to desired position", createPopupStep1Icon());
            createPopupStep(popup, "Click on a border to create a dot", createPopupStep2Icon());
            createPopupStep(popup, "Click into shape to move", createPopupStep3Icon());
            createPopupStep(popup, "Press delete to remove a dot", createPopupStep4Icon());
            return popup;
        }
        function createPopupStep(container, text, image) {
            const popupStep = createElement("div", "geofence-ctrl-create-polygon-mode-popup-step", container);
            const popupStepImage = createElement("div", "geofence-ctrl-create-polygon-mode-popup-step-image", popupStep);
            popupStepImage.appendChild(image);
            const popupStepText = createElement("div", "geofence-ctrl-create-polygon-mode-popup-step-text", popupStep);
            popupStepText.innerHTML = text;
        }
        function removeGeofenceCreateContainer() {
            removeElement(_createContainer);
            _createContainer = undefined;
            _circleModeContainer = undefined;
            _polygonModeContainer = undefined;
        }
        /************************************************************
         * Geofence List
         *************************************************************/
        function createGeofenceListContainer() {
            const geofenceListContainer = createElement("div", "geofence-ctrl-list-container", geofenceControlContainer);
            createGeofenceListHeader(geofenceListContainer);
            _geofenceList = createElement("div", "geofence-ctrl-list", geofenceListContainer);
            _geofenceList.addEventListener("scroll", () => {
                const { scrollHeight, scrollTop, clientHeight } = _geofenceList;
                if (scrollTop + clientHeight >= scrollHeight - 20) {
                    geofenceControl.loadMoreGeofences();
                }
            });
        }
        function createGeofenceListHeader(geofenceListContainer) {
            const header = createElement("div", "geofence-ctrl-list-header", geofenceListContainer);
            _geofenceTitle = createElement("div", "geofence-ctrl-list-header-title", header);
            _geofenceTitle.innerHTML = "Geofences (0)";
            _checkBoxAllAndCreateContainer = createElement("div", "geofence-ctrl-list-header-checkbox-create-container", header);
            createCheckboxAllContainer(_checkBoxAllAndCreateContainer);
        }
        function createCheckboxAllContainer(geofenceListContainer) {
            _checkBoxAllContainer = createElement("div", "geofence-ctrl-list-checkbox-all-container", geofenceListContainer);
            _checkboxAll = createElement("input", "geofence-ctrl-list-checkbox-all", _checkBoxAllContainer);
            _checkboxAll.type = "checkbox";
            _checkboxAll.addEventListener("click", function () {
                if (_checkboxAll.checked) {
                    geofenceControl.displayAllGeofences();
                    checkboxAllText.innerHTML = "Deselect All";
                }
                else {
                    geofenceControl.hideAllGeofences();
                    checkboxAllText.innerHTML = "Select All";
                }
            });
            const checkboxAllText = createElement("div", "geofence-ctrl-list-checkbox-all-title", _checkBoxAllContainer);
            checkboxAllText.innerHTML = "Select all";
            _addGeofencebutton = createElement("div", "geofence-ctrl-list-header-add-button", _checkBoxAllContainer);
            _addGeofencebutton.innerHTML = "+ Add";
            _addGeofencebutton.addEventListener("click", () => {
                createAddGeofenceContainer();
            });
        }
        function renderListItem(geofence) {
            const container = createElement("li", "geofence-ctrl-list-item-container", _geofenceList);
            container.id = `list-item-${geofence.geofenceId}`;
            const listItem = createElement("li", "geofence-ctrl-list-item", container);
            const leftContainer = createElement("div", "geofence-ctrl-list-item-left-container", listItem);
            const checkbox = createElement("input", "geofence-ctrl-list-item-checkbox", leftContainer);
            checkbox.id = `list-item-checkbox-${geofence.geofenceId}`;
            checkbox.type = "checkbox";
            checkbox.addEventListener("click", function () {
                if (checkbox.checked) {
                    geofenceControl.displayGeofence(geofence.geofenceId);
                    geofenceControl.fitGeofence(geofence.geofenceId);
                }
                else {
                    geofenceControl.hideGeofence(geofence.geofenceId);
                }
            });
            const rightContainer = createElement("div", "geofence-ctrl-list-item-right-container", listItem);
            const geofenceTitleContainer = createElement("div", "geofence-ctrl-list-item-title-container", rightContainer);
            geofenceTitleContainer.addEventListener("mouseover", function () {
                geofenceControl.displayHighlightedGeofence(geofence.geofenceId);
            });
            geofenceTitleContainer.addEventListener("mouseout", function () {
                geofenceControl.hideHighlightedGeofence();
            });
            const geofenceTitle = createElement("div", "geofence-ctrl-list-item-title", geofenceTitleContainer);
            geofenceTitle.innerHTML = geofence.geofenceId;
            const editButton = createElement("div", "geofence-ctrl-edit-button", geofenceTitleContainer);
            editButton.addEventListener("click", function () {
                geofenceControl.editGeofence(geofence.geofenceId);
                createEditControls(listItem, rightContainer, leftContainer, geofence.geofenceId);
                listItem.classList.remove("geofence-ctrl-list-item");
                listItem.classList.add("geofence-ctrl-list-selected-item");
            });
            editButton.appendChild(createEditIcon());
        }
        function createEditControls(item, rightContainer, leftContainer, id) {
            const editContainer = createElement("div", "geofence-ctrl-list-item-controls", rightContainer);
            const deleteButton = renderDeleteButton(leftContainer, id);
            const removeEditContainer = () => {
                item.classList.remove("geofence-ctrl-list-selected-item");
                item.classList.add("geofence-ctrl-list-item");
                removeElement(editContainer);
                removeElement(deleteButton);
            };
            const cancelButton = createElement("div", "geofence-ctrl-cancel-button", editContainer);
            cancelButton.classList.add("geofence-ctrl-button");
            cancelButton.innerHTML = "Cancel";
            cancelButton.addEventListener("click", () => {
                geofenceControl.setEditingModeEnabled(false);
                removeEditContainer();
            });
            const saveGeofenceButton = createElement("div", "geofence-ctrl-save-button geofence-ctrl-button", editContainer);
            saveGeofenceButton.addEventListener("click", () => __awaiter$1(this, void 0, void 0, function* () {
                yield geofenceControl.saveGeofence();
                removeEditContainer();
            }));
            saveGeofenceButton.title = "Save";
            saveGeofenceButton.innerHTML = "Save";
        }
        /************************************************************
         * Add Geofence Controls
         *************************************************************/
        function removeAddGeofenceContainer() {
            removeElement(_addGeofenceContainer);
            clearAddGeofenceError();
            showCheckboxAllContainer();
        }
        function clearAddGeofenceError() {
            if (_errorDiv) {
                removeElement(_errorDiv);
                _errorDiv = undefined;
            }
        }
        function createAddGeofenceContainer() {
            hideCheckboxAllContainer();
            _addGeofenceContainer = createElement("div", "geofence-ctrl-add-geofence-container", _checkBoxAllAndCreateContainer);
            const addGeofencePrompt = createElement("div", "geofence-ctrl-add-geofence", _addGeofenceContainer);
            const nameInput = createElement("input", "geofence-ctrl-add-geofence-input", addGeofencePrompt);
            nameInput.placeholder = "Enter name";
            const buttonContainer = createElement("div", "geofence-ctrl-add-geofence-buttons", addGeofencePrompt);
            const cancelButton = createElement("div", "geofence-ctrl-add-geofence-cancel-button geofence-ctrl-button ", buttonContainer);
            cancelButton.innerHTML = "Cancel";
            cancelButton.addEventListener("click", () => {
                removeAddGeofenceContainer();
                geofenceControl.setEditingModeEnabled(false);
            });
            const saveButton = createElement("div", "geofence-ctrl-button geofence-ctrl-save-button", buttonContainer);
            saveButton.innerHTML = "Save";
            saveButton.addEventListener("click", function () {
                return __awaiter$1(this, void 0, void 0, function* () {
                    clearAddGeofenceError();
                    const output = yield geofenceControl.createGeofence(escape(nameInput.value));
                    if (output)
                        removeAddGeofenceContainer();
                });
            });
            geofenceControl.addEditableGeofence();
        }
        function createAddGeofencePromptError(error) {
            if (_errorDiv) {
                return;
            }
            _errorDiv = createElement("div", "geofence-ctrl-add-geofence-error", _addGeofenceContainer);
            const errorIconContainer = createElement("div", "geofence-ctrl-add-geofence-error-icon", _errorDiv);
            errorIconContainer.appendChild(createErrorIcon());
            const errorText = createElement("div", "geofence-ctrl-add-geofence-error-text", _errorDiv);
            errorText.innerHTML = error;
        }
        /************************************************************
         * Delete Controls
         *************************************************************/
        function renderDeleteButton(container, id) {
            const deleteButton = createElement("div", "geofence-ctrl-delete-button", container);
            deleteButton.classList.add("geofence-ctrl-button");
            deleteButton.addEventListener("click", function () {
                createConfirmDeleteContainer(id);
            });
            deleteButton.appendChild(createTrashIcon());
            return deleteButton;
        }
        function createConfirmDeleteContainer(geofenceId) {
            _deleteGeofenceContainer = createElement("div", "geofence-ctrl-delete-prompt-container", geofenceControlContainer);
            const deleteGeofencePrompt = createElement("div", "geofence-ctrl-delete-prompt", _deleteGeofenceContainer);
            const title = createElement("div", "geofence-ctrl-delete-geofence-title", deleteGeofencePrompt);
            title.innerHTML = `Are you sure you want to delete <strong>${geofenceId}</strong>?`;
            createDeleteButtonsContainer(deleteGeofencePrompt, geofenceId);
        }
        function createDeleteButtonsContainer(container, geofenceId) {
            const deleteButtonsContainer = createElement("div", "geofence-ctrl-delete-geofence-buttons", container);
            const cancelButton = createElement("div", "geofence-ctrl-delete-geofence-cancel-button", deleteButtonsContainer);
            cancelButton.innerHTML = "Cancel";
            cancelButton.addEventListener("click", () => {
                removeElement(_deleteGeofenceContainer);
            });
            const confirmDeleteButton = createElement("div", "geofence-ctrl-delete-geofence-confirm-button", deleteButtonsContainer);
            confirmDeleteButton.innerHTML = "Delete";
            confirmDeleteButton.addEventListener("click", function () {
                return __awaiter$1(this, void 0, void 0, function* () {
                    const id = yield geofenceControl.deleteGeofence(geofenceId);
                    if (id) {
                        createDeleteResultContainer(true);
                        removeElement(_deleteGeofenceContainer);
                        geofenceControl.setEditingModeEnabled(false);
                    }
                });
            });
        }
        function createDeleteResultContainer(success) {
            _deletePopdownContainer = createElement("div", "geofence-ctrl-delete-popdown-container", geofenceControlContainer);
            const deletePopdown = createElement("div", "geofence-ctrl-delete-popdown", _deletePopdownContainer);
            const deletePopdownCloseButton = createElement("div", "geofence-ctrl-delete-popdown-close-button", _deletePopdownContainer);
            deletePopdownCloseButton.appendChild(createCloseIcon());
            deletePopdownCloseButton.addEventListener("click", () => {
                removeElement(_deletePopdownContainer);
            });
            const deleteSuccessIcon = createElement("div", "geofence-ctrl-delete-popdown-icon", deletePopdown);
            deleteSuccessIcon.appendChild(createDeleteSuccessIcon());
            const deletePopdownText = createElement("div", "geofence-ctrl-delete-popdown-text", deletePopdown);
            deletePopdownText.innerHTML = success
                ? "Geofence was deleted successfully"
                : "Geofence failed to delete";
        }
        /************************************************************
         * Utility Methods
         *************************************************************/
        function updateCheckbox(geofenceId, checked) {
            const checkbox = document.getElementById(`list-item-checkbox-${geofenceId}`);
            if (checkbox)
                checkbox.checked = checked;
        }
        function removeGeofenceListItem(geofenceId) {
            const listItem = document.getElementById(`list-item-${geofenceId}`);
            removeElement(listItem);
        }
        function setGeofenceListEnabled(enabled) {
            _checkboxAll.disabled = !enabled;
            enabled
                ? _addGeofencebutton.classList.remove("geofence-ctrl-noHover")
                : _addGeofencebutton.classList.add("geofence-ctrl-noHover");
            const inputs = document.getElementsByClassName("geofence-ctrl-list-item-checkbox");
            for (let i = 0; i < inputs.length; i++) {
                inputs.item(i).disabled = !enabled;
            }
            const items = document.getElementsByClassName("geofence-ctrl-list-item-container");
            for (let i = 0; i < items.length; i++) {
                enabled
                    ? items.item(i).classList.remove("geofence-ctrl-noHover")
                    : items.item(i).classList.add("geofence-ctrl-noHover");
            }
        }
        function getCheckboxAllValue() {
            return _checkboxAll.checked;
        }
        function updateGeofenceCount(count) {
            _geofenceTitle.innerHTML = `Geofences (${count})`;
        }
        function updateGeofenceRadius(radius) {
            if (_geofenceCreateRadiusInput)
                _geofenceCreateRadiusInput.value = `${radius}`;
        }
        function hideCheckboxAllContainer() {
            _checkBoxAllContainer.style.display = "none";
        }
        function showCheckboxAllContainer() {
            _checkBoxAllContainer.style.display = "flex";
        }
        return {
            registerControlPosition,
            createElement,
            removeElement,
            createGeofenceCreateContainer,
            createGeofenceListContainer,
            removeAddGeofenceContainer,
            createAddGeofencePromptError,
            renderListItem,
            updateCheckbox,
            removeGeofenceListItem,
            setGeofenceListEnabled,
            getCheckboxAllValue,
            removeGeofenceCreateContainer,
            updateGeofenceCount,
            updateGeofenceRadius,
        };
    }

    class AmplifyMapDraw {
        constructor(map, ui) {
            this._mapBoxDraw = new MapboxDraw__default["default"]({
                displayControlsDefault: false,
                defaultMode: "simple_select",
                userProperties: true,
                controls: {
                    trash: true,
                },
                modes: Object.assign(Object.assign({}, MapboxDraw__default["default"].modes), { draw_circle: maplibreGlDrawCircle.CircleMode, direct_select: maplibreGlDrawCircle.DirectMode, simple_select: maplibreGlDrawCircle.SimpleSelectMode }),
                styles: [
                    // ACTIVE (being drawn)
                    // polygon fill
                    {
                        id: "gl-draw-polygon-fill",
                        type: "fill",
                        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                        paint: {
                            "fill-color": GEOFENCE_COLOR,
                            "fill-outline-color": GEOFENCE_COLOR,
                            "fill-opacity": 0.3,
                        },
                    },
                    // polygon mid points
                    {
                        id: "gl-draw-polygon-midpoint",
                        type: "circle",
                        filter: ["all", ["==", "$type", "Point"], ["==", "meta", "midpoint"]],
                        paint: {
                            "circle-radius": 5,
                            "circle-color": GEOFENCE_VERTEX_COLOR,
                        },
                    },
                    // polygon border
                    {
                        id: "gl-draw-polygon-stroke-active",
                        type: "line",
                        filter: ["all", ["==", "$type", "Polygon"], ["!=", "mode", "static"]],
                        layout: {
                            "line-cap": "round",
                            "line-join": "round",
                        },
                        paint: {
                            "line-color": GEOFENCE_BORDER_COLOR,
                            "line-width": 4,
                        },
                    },
                    // vertex circle
                    {
                        id: "gl-draw-polygon-and-line-vertex-active",
                        type: "circle",
                        filter: [
                            "all",
                            ["==", "meta", "vertex"],
                            ["==", "$type", "Point"],
                            ["!=", "mode", "static"],
                        ],
                        paint: {
                            "circle-radius": 8,
                            "circle-color": GEOFENCE_VERTEX_COLOR,
                            "circle-stroke-color": GEOFENCE_BORDER_COLOR,
                            "circle-stroke-width": 1,
                        },
                    },
                ],
            });
            this._map = map;
            this._ui = ui;
            this.enable = this.enable.bind(this);
            this.disable = this.disable.bind(this);
            this.drawPolygonGeofence = this.drawPolygonGeofence.bind(this);
        }
        get(id) {
            return this._mapBoxDraw.get(id);
        }
        add(data) {
            const isCircle = data.properties.isCircle;
            this.enable(isCircle);
            this._mapBoxDraw.add(data);
            this._mapBoxDraw.changeMode("direct_select", {
                featureId: data.id,
            });
        }
        delete(id) {
            this._mapBoxDraw.delete(id);
        }
        disable() {
            if (this._map.hasControl(this._mapBoxDraw)) {
                this._map.removeControl(this._mapBoxDraw);
            }
            this._ui.removeGeofenceCreateContainer();
        }
        enable(isCircle) {
            if (this._map.hasControl(this._mapBoxDraw)) {
                return;
            }
            this._map.addControl(this._mapBoxDraw, "bottom-right");
            this._ui.createGeofenceCreateContainer(isCircle);
        }
        /**
         * Draws a polygonal geofence around the center of the current map view. The polygon defaults to 3/4 the size of the current map bounds
         * @param id the geofence geojson id
         */
        drawPolygonGeofence(id) {
            const mapBounds = this._map.getBounds();
            const feature = getPolygonFeatureFromBounds(id, mapBounds);
            this.add(feature);
        }
        /**
         * Draws a cicular geofence around the center of the current map view
         * @param id the geofence geojson id
         * @param radius optional parameter for setting the radius of the cicular geofence, default to 1/8th of the current map bounds length
         */
        drawCircularGeofence(id, radius) {
            const mapBounds = this._map.getBounds();
            const circleFeature = getCircleFeatureFromCoords(id, this._map.getCenter().toArray(), { bounds: mapBounds, radius });
            this.add(circleFeature);
            this._ui.updateGeofenceRadius(radius || circleFeature.properties.radius.toFixed(2));
        }
    }

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
        function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
        return new (P || (P = Promise))(function (resolve, reject) {
            function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
            function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
            function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
    const FIT_BOUNDS_PADDING = { left: 240 }; // Default to 240px right now because of the left nav
    class AmplifyGeofenceControl {
        constructor(options) {
            this._geofenceCollectionId = options === null || options === void 0 ? void 0 : options.geofenceCollectionId;
            this._loadedGeofences = {};
            this._displayedGeofences = [];
            this.changeMode = this.changeMode.bind(this);
            this.loadInitialGeofences = this.loadInitialGeofences.bind(this);
            this.loadMoreGeofences = this.loadMoreGeofences.bind(this);
            this._loadGeofence = this._loadGeofence.bind(this);
            this.updateInputRadius = this.updateInputRadius.bind(this);
            this.saveGeofence = this.saveGeofence.bind(this);
            this.editGeofence = this.editGeofence.bind(this);
            this.deleteGeofence = this.deleteGeofence.bind(this);
            this.displayAllGeofences = this.displayAllGeofences.bind(this);
            this.hideAllGeofences = this.hideAllGeofences.bind(this);
            this.addEditableGeofence = this.addEditableGeofence.bind(this);
            this.setEditingModeEnabled = this.setEditingModeEnabled.bind(this);
            this.displayHighlightedGeofence =
                this.displayHighlightedGeofence.bind(this);
            this.hideHighlightedGeofence = this.hideHighlightedGeofence.bind(this);
            this.displayGeofence = this.displayGeofence.bind(this);
            this.hideGeofence = this.hideGeofence.bind(this);
            this.fitGeofence = this.fitGeofence.bind(this);
            this.fitAllGeofences = this.fitAllGeofences.bind(this);
        }
        /**********************************************************************
         Public Methods for AmplifyGeofenceControl
         **********************************************************************/
        getDefaultPosition() {
            return "full-screen";
        }
        onRemove() {
            this._ui.removeElement(this._container);
        }
        // Reorders MapLibre canvas class names to fix a mapbox draw bug - https://github.com/mapbox/mapbox-gl-draw/pull/1079
        reorderMapLibreClassNames() {
            const mapCanvas = document
                .getElementsByClassName("maplibregl-canvas")
                .item(0);
            if (mapCanvas) {
                mapCanvas.className = "mapboxgl-canvas maplibregl-canvas";
            }
        }
        onAdd(map) {
            this._map = map;
            this.reorderMapLibreClassNames();
            this._container = createElement("div", "geofence-ctrl maplibregl-ctrl");
            this._ui = AmplifyGeofenceControlUI(this, this._container);
            this._amplifyDraw = new AmplifyMapDraw(map, this._ui);
            this._ui.registerControlPosition(map, "full-screen");
            this._ui.createGeofenceListContainer();
            // Draw the geofences source to the map so we can update it on geofences load/creation
            this._map.once("load", function () {
                // Prevents warnings on multiple re-renders, especially when rendered in react
                if (this._map.getSource("displayedGeofences")) {
                    return;
                }
                this._drawGeofencesOutput = drawGeofences("displayedGeofences", [], this._map, {
                    fillColor: GEOFENCE_COLOR,
                    borderColor: GEOFENCE_BORDER_COLOR,
                    borderOpacity: 1,
                });
                this._highlightedGeofenceOutput = drawGeofences("highlightedGeofence", [], this._map, {
                    fillColor: GEOFENCE_COLOR,
                    borderColor: GEOFENCE_BORDER_COLOR,
                    borderOpacity: 1,
                    borderWidth: 6,
                });
                this.loadInitialGeofences();
                map.addControl(new maplibregl__default["default"].NavigationControl({ showCompass: false }), "bottom-right");
            }.bind(this));
            this._map.on("draw.update", () => {
                const coordinates = this._amplifyDraw._mapBoxDraw.getAll().features[0].geometry.coordinates[0];
                const radius = getDistanceBetweenCoordinates(coordinates[0], coordinates[Math.floor(coordinates.length / 2)]) / 2;
                this._ui.updateGeofenceRadius(radius.toFixed(2));
            });
            return this._container;
        }
        createGeofence(geofenceId) {
            return __awaiter(this, void 0, void 0, function* () {
                if (!geofenceId || geofenceId.length === 0) {
                    this._ui.createAddGeofencePromptError("Geofence ID is empty.");
                    return;
                }
                if (!isValidGeofenceId(geofenceId)) {
                    this._ui.createAddGeofencePromptError("Geofence ID contains special characters.");
                    return;
                }
                if (isExistingGeofenceId(geofenceId, this._loadedGeofences)) {
                    this._ui.createAddGeofencePromptError("Geofence ID already exists.");
                    return;
                }
                return this.saveGeofence(geofenceId);
            });
        }
        saveGeofence(geofenceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const feature = this._amplifyDraw.get(this._editingGeofenceId);
                const idToSave = geofenceId || this._editingGeofenceId;
                const response = yield geo.Geo.saveGeofences({
                    geofenceId: idToSave,
                    geometry: { polygon: feature.geometry["coordinates"] },
                });
                if (response.errors[0]) {
                    const err = response.errors[0];
                    throw new Error(`There was an error saving geofence with id ${idToSave}: ${err.error.code} - ${err.error.message}`);
                }
                const success = response.successes[0];
                const savedGeofence = {
                    geofenceId: success.geofenceId,
                    geometry: { polygon: feature.geometry["coordinates"] },
                };
                // render geofence to the map and add it to the list
                this._loadGeofence(savedGeofence);
                this.displayGeofence(savedGeofence.geofenceId);
                this.setEditingModeEnabled(false);
                return savedGeofence.geofenceId;
            });
        }
        // Each page loads 100 geofences
        loadInitialGeofences() {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    const { entries, nextToken } = yield geo.Geo.listGeofences();
                    this._listGeofencesNextToken = nextToken;
                    const loadGeofence = this._loadGeofence;
                    entries.forEach((geofence) => loadGeofence(geofence));
                    this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);
                }
                catch (e) {
                    throw new Error(`Error calling listGeofences: ${e}`);
                }
            });
        }
        loadMoreGeofences() {
            return __awaiter(this, void 0, void 0, function* () {
                if (this._listGeofencesNextToken) {
                    try {
                        const { entries, nextToken } = yield geo.Geo.listGeofences({
                            nextToken: this._listGeofencesNextToken,
                        });
                        this._listGeofencesNextToken = nextToken;
                        const loadGeofence = this._loadGeofence;
                        entries.forEach((geofence) => loadGeofence(geofence));
                        this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);
                    }
                    catch (e) {
                        throw new Error(`Error calling listGeofences: ${e}`);
                    }
                }
            });
        }
        editGeofence(geofenceId) {
            this.setEditingModeEnabled(true);
            const geofence = this._loadedGeofences[geofenceId];
            if (!geofence) {
                throw new Error(`Geofence with id ${geofenceId} does not exist`);
            }
            // render in mapboxdraw
            const feature = getGeofenceFeatureFromPolygon(geofence.geometry.polygon);
            const data = Object.assign({ id: geofence.geofenceId }, feature);
            this._amplifyDraw.add(data);
            this._editingGeofenceId = geofence.geofenceId;
        }
        deleteGeofence(geofenceId) {
            return __awaiter(this, void 0, void 0, function* () {
                const response = yield geo.Geo.deleteGeofences(geofenceId);
                if (response.errors[0]) {
                    const err = response.errors[0].error;
                    throw new Error(`There was an error deleting geofence with id ${geofenceId}: ${err.code} - ${err.message}`);
                }
                this._ui.removeGeofenceListItem(geofenceId);
                delete this._loadedGeofences[geofenceId];
                this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);
                this._displayedGeofences = this._displayedGeofences.filter((geofence) => geofence.geofenceId !== geofenceId);
                this._updateDisplayedGeofences();
                return geofenceId;
            });
        }
        deleteSelectedGeofences() {
            const idsToDelete = this._displayedGeofences.map((fence) => fence.geofenceId);
            // FIXME: delete geofence api call here
            idsToDelete.forEach((id) => {
                this._ui.removeGeofenceListItem(id);
                delete this._loadedGeofences[id];
            });
            this._displayedGeofences = [];
            this._updateDisplayedGeofences();
        }
        /**********************************************************************
         Private methods for CRUD Geofences
         **********************************************************************/
        _loadGeofence(geofence) {
            // If geofence exists remove it from displayed geofences
            if (this._loadedGeofences[geofence.geofenceId]) {
                this._displayedGeofences = this._displayedGeofences.filter((fence) => fence.geofenceId !== geofence.geofenceId);
            }
            else {
                // If geofence doesn't exist render a new list item for it
                this._ui.renderListItem(geofence);
            }
            this._loadedGeofences[geofence.geofenceId] = geofence;
            this._ui.updateGeofenceCount(Object.keys(this._loadedGeofences).length);
        }
        displayGeofence(geofenceId) {
            this._displayedGeofences.push(this._loadedGeofences[geofenceId]);
            this._updateDisplayedGeofences();
            this._ui.updateCheckbox(geofenceId, true);
            this.fitAllGeofences();
        }
        displayAllGeofences() {
            this._displayedGeofences.push(...Object.values(this._loadedGeofences));
            this._updateDisplayedGeofences();
            const checkboxes = document.getElementsByClassName("geofence-ctrl-list-item-checkbox");
            Array.from(checkboxes).forEach((checkbox) => (checkbox.checked = this._ui.getCheckboxAllValue()));
            this.fitAllGeofences();
        }
        fitGeofence(geofenceId) {
            const mapBounds = this._map.getBounds();
            const geofence = this._loadedGeofences[geofenceId];
            geofence.geometry.polygon[0].forEach((coord) => {
                mapBounds.extend(coord);
            });
            this._map.fitBounds(mapBounds, { padding: FIT_BOUNDS_PADDING });
        }
        fitAllGeofences() {
            let shouldFitBounds = false;
            const mapBounds = this._map.getBounds();
            this._displayedGeofences.forEach((geofence) => {
                geofence.geometry.polygon[0].forEach((coord) => {
                    if (!mapBounds.contains(coord)) {
                        mapBounds.extend(coord);
                        shouldFitBounds = true;
                    }
                });
            });
            if (shouldFitBounds)
                this._map.fitBounds(mapBounds, { padding: FIT_BOUNDS_PADDING });
        }
        hideGeofence(geofenceId) {
            this._displayedGeofences = this._displayedGeofences.filter((geofence) => geofence.geofenceId !== geofenceId);
            this._updateDisplayedGeofences();
            this._ui.updateCheckbox(geofenceId, false);
        }
        hideAllGeofences() {
            this._displayedGeofences = [];
            this._updateDisplayedGeofences();
            const checkboxes = document.getElementsByClassName("geofence-ctrl-list-item-checkbox");
            Array.from(checkboxes).forEach((checkbox) => (checkbox.checked = this._ui.getCheckboxAllValue()));
        }
        _updateDisplayedGeofences() {
            const feature = getGeofenceFeatureArray(this._displayedGeofences);
            this._drawGeofencesOutput.setData(feature);
        }
        displayHighlightedGeofence(geofenceId) {
            const geofence = this._loadedGeofences[geofenceId];
            if (!geofence) {
                console.warn(`Geofence with id ${geofenceId} does not exist`);
                return;
            }
            const feature = getGeofenceFeatureFromPolygon(geofence.geometry.polygon);
            this._highlightedGeofenceOutput.setData(feature);
            this._highlightedGeofenceOutput.show();
        }
        hideHighlightedGeofence() {
            this._highlightedGeofenceOutput.hide();
        }
        /**********************************************************************
         Methods for controlling amplify mapbox draw
         **********************************************************************/
        changeMode(mode) {
            // erase existing mapbox draw content
            this._amplifyDraw.delete(this._editingGeofenceId);
            if (mode === "draw_circle") {
                this._amplifyDraw.drawCircularGeofence(this._editingGeofenceId);
            }
            else {
                this._amplifyDraw.drawPolygonGeofence(this._editingGeofenceId);
            }
        }
        resetGeofence() {
            // erase existing mapbox draw content
            this._amplifyDraw.delete(this._editingGeofenceId);
            if (isExistingGeofenceId(this._editingGeofenceId, this._loadedGeofences)) {
                this.editGeofence(this._editingGeofenceId);
            }
            else {
                this._amplifyDraw.drawPolygonGeofence(this._editingGeofenceId);
            }
        }
        // Disables add button and selecting items from geofence list
        setEditingModeEnabled(enabled) {
            enabled ? this._amplifyDraw.enable() : this._amplifyDraw.disable();
            enabled
                ? this._drawGeofencesOutput.hide()
                : this._drawGeofencesOutput.show();
            this._ui.setGeofenceListEnabled(!enabled);
        }
        updateInputRadius(event) {
            const radiusString = event.target.value;
            const radius = parseInt(radiusString);
            if (isNaN(radius)) {
                return;
            }
            this._amplifyDraw.drawCircularGeofence(this._editingGeofenceId, radius);
        }
        addEditableGeofence() {
            this._editingGeofenceId = "tempGeofence";
            this._amplifyDraw.drawCircularGeofence("tempGeofence");
            this.setEditingModeEnabled(true);
        }
    }

    exports.AmplifyGeocoderAPI = AmplifyGeocoderAPI;
    exports.AmplifyGeofenceControl = AmplifyGeofenceControl;
    exports.AmplifyMapLibreRequest = AmplifyMapLibreRequest;
    exports.createAmplifyGeocoder = createAmplifyGeocoder;
    exports.createDefaultIcon = createDefaultIcon;
    exports.createMap = createMap;
    exports.drawGeofences = drawGeofences;
    exports.drawPoints = drawPoints;

    Object.defineProperty(exports, '__esModule', { value: true });

}));
