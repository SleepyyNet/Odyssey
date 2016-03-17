/*global Odyssey, OdysseyView, OdysseyModel, OdysseyMinimap, OdysseyWorldMap, OdysseyTileMap, OdysseyWorld, OdysseyGeography, OdysseyWorldSpawns, OdysseyController, OdysseyControlManager, Dat, OdysseyTileInfo, OdysseyOverlay, ResourceManager, document, OdysseySpriteIndex, OdysseyMapIndex, OdysseyInitializedEvent*/
/** Main.js.
 *
 * Main entry point for the TibiaOdyssey web application.
 * Creates an Odyssey instance, which represents the state
 * of the web application.
 */
var o = (function () {
    "use strict";
    var odyssey = new Odyssey(),
        /** The number of dependencies before we can start the core features. */
        dependencies = 2,// dat, sprite index,
        /** The number of dependencies that have already loaded. */
        dependenciesLoaded = 0,
        /** The minimum allowed value for the position x component. @const */
        POS_MIN_X = 31744,
        /** The maximum allowed value for the position x component. @const */
        POS_MAX_X = 33791,//33536;
        /** The minimum allowed value for the position y component. @const */
        POS_MIN_Y = 30976,
        /** The maximum allowed value for the position y component. @const */
        POS_MAX_Y = 33279,//33024;
        /** The minimum allowed value for the position z component. @const */
        POS_MIN_Z = 0,//0;
        /** The maximum allowed value for the position z component. @const */
        POS_MAX_Z = 15;//15;

    /**
     * Left-pads a string until it is of a given length.
     * @param {string} str the string to pad.
     * @param {string} padding the string to use as padding.
     * @param {number} length the length of the output string.
     */
    function padLeft(str, padding, length) {
        while (str.length < length) {
            str += padding;
        }
        return str;
    }

    /**
     * Declares that a dependency has loaded.
     */
    function dependencyLoaded() {
        dependenciesLoaded += 1;
        if (dependenciesLoaded >= dependencies) {
            odyssey.dispatchEvent(new OdysseyInitializedEvent());
        }
    }

    odyssey.setModel((function () {
        var model = new OdysseyModel();

        // Dat.
        model.setDat((function () {
            var dat = Dat.load("Odyssey/Data/dat.json");
            dat.addEventListener("OdysseyDatLoaded", dependencyLoaded);
            // Dat does not implement OdysseyEventDispatchInterface,
            // i.e. it cannot dispatch events.
            return dat;
        }()));

        // Resource Manager (maps)
        model.setResourceManager((function () {
            var resourceManager = new ResourceManager();
            resourceManager.setFilepathPrefix("Odyssey/Maps/");
            return resourceManager;
        }()));

        // Map Index.
        model.setMapIndex((function () {
            var mapIndex = new OdysseyMapIndex();
            mapIndex.setStartPosition(POS_MIN_X, POS_MIN_Y, POS_MIN_Z);
            mapIndex.setEndPosition(POS_MAX_X, POS_MAX_Y, POS_MAX_Z);
            mapIndex.addToResourceManager(model.getResourceManager());
            return mapIndex;
        }()));

        // World.
        model.setWorld((function () {
            var world = new OdysseyWorld();
            world.setParentEventHandler(model.eventDispatcher);
            return world;
        }()));

        // Geography.
        model.setGeography((function () {
            var geo = new OdysseyGeography();
            geo.setParentEventHandler(model.eventDispatcher);
            return geo;
        }()));

        // World Spawns.
        model.setWorldSpawns((function () {
            var spawns = new OdysseyWorldSpawns();
            spawns.setParentEventHandler(model.eventDispatcher);
            return spawns;
        }()));

        return model;
    }()));

    // View.
    odyssey.setView((function () {
        var view = new OdysseyView();
        // View needs a reference to the model.
        view.setModel(odyssey.getModel());
        // Start the rendering process when dependencies are loaded.
        odyssey.addEventListener("OdysseyInitialized", OdysseyView.updateProxy(view));

        // Resource Manager (sprites).
        view.setResourceManager((function () {
            var resourceManager = new ResourceManager();
            resourceManager.setFilepathPrefix("Odyssey/Sprites/");
            return resourceManager;
        }()));

        // Sprite Index.
        view.setSpriteIndex((function () {
            var spriteIndex = OdysseySpriteIndex.load("Odyssey/Data/SpriteSheetIndex.json");

            // Populates the resource manager.
            function populate() {
                OdysseySpriteIndex.populateResourceManager(spriteIndex, view.getResourceManager());
            }

            // Attach the event listeners.
            spriteIndex.addEventListener('OdysseySpriteIndexLoaded', dependencyLoaded);
            spriteIndex.addEventListener("OdysseySpriteIndexLoaded", populate);

            // If by chance the file already loaded.
            if (spriteIndex.isLoaded) {
                populate();
                dependencyLoaded();
            }
            return spriteIndex;
        }()));

        // Minimap.
        view.setMinimap((function () {
            var minimap = new OdysseyMinimap();
            minimap.setParentEventHandler(view.eventDispatcher);
            minimap.setCanvas(document.getElementById("OdysseyMinimapCanvas"));

            return minimap;
        }()));

        // World Map.
        view.setWorldMap((function () {
            var wm = new OdysseyWorldMap(), z, maxZ;
            wm.setParentEventHandler(view.eventDispatcher);
            // Set the WorldMap's DOM structure.
            wm.setWrapperElement(document.getElementById("OdysseyLargeMinimap"));
            wm.setMapViewportElement(document.getElementById("OdysseyMinimapViewport"));
            wm.setMapContainerElement(document.getElementById("OdysseyMinimapContainer"));
            for (z = 0, maxZ = 16; z < maxZ; z += 1) {
                wm.setMapImageElement(z, document.getElementById("MinimapFloor" + padLeft(String(z), "0", 2)));
            }
            return wm;
        }()));

        // Tile Map.
        view.setTileMap((function () {
            var tileMap = new OdysseyTileMap();
            tileMap.setParentEventHandler(view.eventDispatcher);
            // tile map needs a reference to the view.
            tileMap.setView(view);

            tileMap.setViewport(document.getElementById("map-viewport-translator"));
            tileMap.setSize(23, 23);
            // Canvases.
            tileMap.setCanvas(OdysseyTileMap.CANVAS_NORTHWEST_ID, document.getElementById("OdysseyMapCanvas-NW"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_NORTH_ID, document.getElementById("OdysseyMapCanvas-N"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_NORTHEAST_ID, document.getElementById("OdysseyMapCanvas-NE"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_WEST_ID, document.getElementById("OdysseyMapCanvas-W"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_PIVOT_ID, document.getElementById("OdysseyMapCanvas-P"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_EAST_ID, document.getElementById("OdysseyMapCanvas-E"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_SOUTHWEST_ID, document.getElementById("OdysseyMapCanvas-SW"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_SOUTH_ID, document.getElementById("OdysseyMapCanvas-S"));
            tileMap.setCanvas(OdysseyTileMap.CANVAS_SOUTHEAST_ID, document.getElementById("OdysseyMapCanvas-SE"));
            // Overlay Canvas.
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_NORTHWEST_ID, document.getElementById("OdysseyMapCanvasOverlay-NW"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_NORTH_ID, document.getElementById("OdysseyMapCanvasOverlay-N"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_NORTHEAST_ID, document.getElementById("OdysseyMapCanvasOverlay-NE"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_WEST_ID, document.getElementById("OdysseyMapCanvasOverlay-W"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_PIVOT_ID, document.getElementById("OdysseyMapCanvasOverlay-P"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_EAST_ID, document.getElementById("OdysseyMapCanvasOverlay-E"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_SOUTHWEST_ID, document.getElementById("OdysseyMapCanvasOverlay-SW"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_SOUTH_ID, document.getElementById("OdysseyMapCanvasOverlay-S"));
            tileMap.setOverlayCanvas(OdysseyTileMap.CANVAS_SOUTHEAST_ID, document.getElementById("OdysseyMapCanvasOverlay-SE"));

            odyssey.addEventListener('OdysseyMapFileLoaded', OdysseyView.updateProxy(view));
            odyssey.addEventListener('OdysseyMapZoomChange', OdysseyView.updateProxy(view));
            odyssey.addEventListener('OdysseyMapPositionChange', OdysseyView.updateProxy(view));

            //tileMap.setPosition(32255, 32648, 13);
            tileMap.setPosition(32366, 32239, 7);

            return tileMap;
        }()));

        // Tile Info.
        view.setTileInfo((function () {
            var tileInfo = new OdysseyTileInfo();

            /**
             * Responds to the map click event to update the TileInfo object.
             * @param {OdysseyMapClickEvent} e the map click event being triggered.
             */
            function handleTileSelect(e) {
                tileInfo.showInfo(e.position.x, e.position.y, e.position.z);
            }

            odyssey.addEventListener('OdysseyMapClick', handleTileSelect);
            tileInfo.setParentEventHandler(view.eventDispatcher);
            return tileInfo;
        }()));

        // Overlay.
        view.setOverlay((function () {
            var overlay = new OdysseyOverlay();

            /**
             * Handles selection (i.e. mouse clicks) of the overlay.
             * @param {OdysseyMapClickEvent} e the event to use.
             */
            function handleOverlaySelect(e) {
                overlay.select(e.position);
            }

            odyssey.addEventListener('OdysseyMapClick', handleOverlaySelect);
            overlay.setParentEventHandler(view.eventDispatcher);
            return overlay;
        }()));

        return view;
    }()));

    // Controller.
    odyssey.setController((function () {
        var controller = new OdysseyController();
        // Controller needs access to the Model and View.
        // TODO.

        controller.setControlManager((function () {
            var m = new OdysseyControlManager();
            m.setParentEventHandler(controller.eventDispatcher);

            return m;
        }()));

        return controller;
    }()));

    // Expose the Odyssey API.
    return odyssey;
}());