(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports, require('@aws-amplify/core'), require('@aws-amplify/geo'), require('maplibre-gl'), require('@maplibre/maplibre-gl-geocoder')) :
    typeof define === 'function' && define.amd ? define(['exports', '@aws-amplify/core', '@aws-amplify/geo', 'maplibre-gl', '@maplibre/maplibre-gl-geocoder'], factory) :
    (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.AmplifyMapLibre = {}, global.aws_amplify_core, global.aws_amplify_geo, global.maplibregl, global.MaplibreGeocoder));
}(this, (function (exports, core, geo, maplibregl, MaplibreGeocoder) { 'use strict';

    function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

    var maplibregl__default = /*#__PURE__*/_interopDefaultLegacy(maplibregl);
    var MaplibreGeocoder__default = /*#__PURE__*/_interopDefaultLegacy(MaplibreGeocoder);

    function isCoordinates(array) {
        return (Array.isArray(array) &&
            typeof array[0] === "number" &&
            typeof array[1] === "number");
    }
    function isCoordinatesArray(array) {
        return isCoordinates(array[0]);
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
        else {
            features = data;
        }
        return features;
    };
    const urlEncodePeriods = (str) => {
        return str.replace(/\./g, "%2E");
    };

    var __awaiter$1 = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
            this.refreshCredentials = () => __awaiter$1(this, void 0, void 0, function* () {
                try {
                    this.credentials = yield core.Amplify.Auth.currentCredentials();
                }
                catch (e) {
                    console.error(`Failed to refresh credentials: ${e}`);
                    throw e;
                }
            });
            this.refreshCredentialsWithRetry = () => __awaiter$1(this, void 0, void 0, function* () {
                const MAX_DELAY_MS = 5 * 60 * 1000; // 5 minutes
                yield core.jitteredExponentialRetry(this.refreshCredentials, [], MAX_DELAY_MS);
                // Refresh credentials on a timer because HubEvents do not trigger on credential refresh currently
                this.activeTimeout && clearTimeout(this.activeTimeout);
                const expiration = new Date(this.credentials.expiration);
                const timeout = expiration.getTime() - new Date().getTime() - 10000; // Adds a 10 second buffer time before the next refresh
                this.activeTimeout = window.setTimeout(this.refreshCredentialsWithRetry, timeout);
            });
            /**
             * A callback function that can be passed to a maplibre map object that is run before the map makes a request for an external URL. This transform request is used to sign the request with AWS Sigv4 Auth. [https://maplibre.org/maplibre-gl-js-docs/api/map/](https://maplibre.org/maplibre-gl-js-docs/api/map/)
             * @param {string} url The function to use as a render function. This function accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and returns a string.
             * @param {string} resourceType The function to use as a render function. This function accepts a single [Carmen GeoJSON](https://github.com/mapbox/carmen/blob/master/carmen-geojson.md) object as input and returns a string.
             * @returns {RequestParameters} [https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters](https://maplibre.org/maplibre-gl-js-docs/api/properties/#requestparameters)
             */
            this.transformRequest = (url, resourceType) => {
                if (resourceType === "Style" && !url.includes("://")) {
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
    AmplifyMapLibreRequest.createMapLibreMap = (options) => __awaiter$1(void 0, void 0, void 0, function* () {
        const { region, mapConstructor = maplibregl.Map } = options, maplibreOption = __rest$2(options, ["region", "mapConstructor"]);
        const defaultMap = geo.Geo.getDefaultMap();
        const amplifyRequest = new AmplifyMapLibreRequest(yield core.Amplify.Auth.currentCredentials(), region || defaultMap.region);
        const transformRequest = amplifyRequest.transformRequest;
        const map = new mapConstructor(Object.assign(Object.assign({}, maplibreOption), { style: options.style || defaultMap.mapName, // Amplify uses the name of the map in the maplibre style field,
            transformRequest }));
        return map;
    });
    const createMap = (options) => __awaiter$1(void 0, void 0, void 0, function* () {
        return AmplifyMapLibreRequest.createMapLibreMap(options);
    });

    const COLOR_WHITE = "#fff";
    const COLOR_BLACK = "#000";
    const MARKER_COLOR = "#5d8aff";
    const ACTIVE_MARKER_COLOR = "#ff9900";
    const POPUP_BORDER_COLOR = "#0000001f";
    const LOCATION_MARKER = "M24.8133 38.533C18.76 31.493 13 28.8264 13 20.8264C13.4827 14.9864 16.552 9.67169 21.368 6.33302C33.768 -2.26165 50.824 5.78902 52.0667 20.8264C52.0667 28.613 46.5733 31.6797 40.6533 38.373C32.4933 47.5464 35.4 63.093 32.4933 63.093C29.72 63.093 32.4933 47.5464 24.8133 38.533ZM32.4933 8.23969C26.5573 8.23969 21.7467 13.0504 21.7467 18.9864C21.7467 24.9224 26.5573 29.733 32.4933 29.733C38.4293 29.733 43.24 24.9224 43.24 18.9864C43.24 13.0504 38.4293 8.23969 32.4933 8.23969Z";
    // Map styles exist due to an issue with AWS Location Services not supporting the default set of maplibre fonts
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
            const locationServicesStyle = mapStyle || geo.Geo.getDefaultMap().style;
            if (locationServicesStyle) {
                defaultLayoutOptions["text-font"] = [
                    FONT_DEFAULT_BY_STYLE[locationServicesStyle],
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
            else {
                title = "Coordinates";
                address = selectedFeature.geometry.coordinates;
            }
            return `
      <div class="${unclusteredLayerId}-popup" style="background: ${background}; border: ${borderWidth}px solid ${borderColor}; color: ${fontColor}; border-radius: ${radius}px; padding: ${padding}px; word-wrap: break-word; margin: -10px -10px -15px;">
        <div class="${unclusteredLayerId}-popup-title" style="font-weight: ${fontWeight};">
          ${title}
        </div>
        <div class="${unclusteredLayerId}-popup-address">
          ${address}
        </div>
      </div>`;
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
        const popupRender = getPopupRenderFunction(unclusteredLayerId, options);
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
        /*
         * Set active state on markers when clicked
         */
        map.on("click", unclusteredLayerId, function (e) {
            if (typeof options.onClick === "function")
                options.onClick(e);
            map.setLayoutProperty(unclusteredLayerId, "icon-image", [
                "match",
                ["id"],
                e.features[0].id,
                "active-marker",
                "inactive-marker", // default
            ]);
            // If popup option is set show a popup on click
            if (showMarkerPopup) {
                const selectedFeature = e.features[0];
                const coordinates = selectedFeature.geometry.coordinates;
                if (isCoordinates(coordinates)) {
                    new maplibregl.Popup()
                        .setLngLat(coordinates)
                        .setHTML(popupRender(selectedFeature))
                        .setOffset(15)
                        .addTo(map);
                }
            }
        });
        return { unclusteredLayerId };
    }
    /*
     * Adds marker images to the maplibre canvas to be used for rendering unclustered points
     */
    function addUnclusteredMarkerImages(map, { selectedColor = ACTIVE_MARKER_COLOR, selectedBorderColor = COLOR_WHITE, selectedBorderWidth = 4, defaultBorderColor = COLOR_WHITE, defaultBorderWidth = 4, defaultColor: fillColor = MARKER_COLOR, }) {
        const inactiveMarker = createMarker({
            fillColor: fillColor,
            strokeColor: defaultBorderColor,
            lineWidth: defaultBorderWidth,
        });
        const activeMarker = createMarker({
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
     * @param {MAP_STYLE} mapStyle A required parameter that indicates the map style returned from Amazon Location services. This is used to determine the default fonts to be used with maplibre-gl-js. View existing styles [here](https://github.com/aws-amplify/maplibre-gl-js-amplify/blob/main/src/constants.ts#L8)
     * @returns {DrawPointsOutput} output An object containing the string id's of the sources and layers used to draw the points to the map. This includes the sourceId, clusterLayerId, clusterSymbolLayerId, unclusteredLayerId.
     * @property {String} sourceId The [source](https://maplibre.org/maplibre-gl-js-docs/api/sources/) used to contain all of the coordinate/feature data
     * @property {String} clusterLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/) used for creating and styling the points that are clustered together
     * @property {String} clusterSymbolLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers/#symbol) used for creating styling the number that shows the count of points in a cluster
     * @property {String} unclusteredLayerId The [layer](https://maplibre.org/maplibre-gl-js-docs/style-spec/layers) used for creating and styling the individual points on the map and the popup when clicking on a point
     */
    function drawPoints(sourceName, data, map, { showCluster = true, clusterOptions = {}, unclusteredOptions: unclusteredMarkerOptions = {}, } = {}, mapStyle) {
        var _a;
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
        const sourceId = `${sourceName}-source-points`;
        map.addSource(sourceId, {
            type: "geojson",
            data: {
                type: "FeatureCollection",
                features,
            },
            cluster: showCluster,
            clusterMaxZoom: (_a = clusterOptions.clusterMaxZoom) !== null && _a !== void 0 ? _a : 14,
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
        return { sourceId, unclusteredLayerId, clusterLayerId, clusterSymbolLayerId };
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

    var __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {
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
        forwardGeocode: (config) => __awaiter(void 0, void 0, void 0, function* () {
            const features = [];
            try {
                const data = yield geo.Geo.searchByText(config.query, {
                    biasPosition: config.proximity,
                    searchAreaConstraints: config.bbox,
                    countries: config.countires,
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
        reverseGeocode: (config) => __awaiter(void 0, void 0, void 0, function* () {
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
    function createAmplifyGeocoder(options) {
        return new MaplibreGeocoder__default['default'](AmplifyGeocoderAPI, Object.assign({ maplibregl: maplibregl__default['default'], showResultMarkers: { element: createDefaultIcon() } }, options));
    }

    exports.AmplifyGeocoderAPI = AmplifyGeocoderAPI;
    exports.AmplifyMapLibreRequest = AmplifyMapLibreRequest;
    exports.createAmplifyGeocoder = createAmplifyGeocoder;
    exports.createDefaultIcon = createDefaultIcon;
    exports.createMap = createMap;
    exports.drawPoints = drawPoints;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=maplibre-gl-js-amplify.umd.js.map
