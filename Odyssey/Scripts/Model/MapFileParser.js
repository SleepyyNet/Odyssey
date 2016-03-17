/*jslint browser: true, bitwise: true, devel:true */
/*global ResourceManager, Matrix3D, OdysseyCanvasSection, Dat, jQuery, MapFile, MapFileParserResult, MapFileParser, ResourceManagerImage, ResourceManagerFile, ResourceManagerPromise, BinaryFile, OdysseyMapSearchEvent, Worker */
var MapFileParser = (function () {
    "use strict";
    /**
     * Creates a new MapFileParser. A parser to parse Odyssey MapFiles.
     * @constructor
     */
    function MapFileParser() {
        this.tilePosition = new Matrix3D(0, 0, 0);
    }

    /**
     * Gets a tile's index within the object. This refers
     * to the tile's array index inside the Explored property
     * of the JSON object.
     * @param posx The x-position of the tile, relative to the base X position.
     * @param posy The y-position of the tile, relative to the base Y position.
     * @returns The index corresponding to the number which contains the Explored flag of the tile.
     */
    MapFileParser.getTileIndex = function (posx, posy) {
        return Math.floor((posy / 32) + (posx << 3));
    };

    /**
     * Gets a tile's binary offset within the object. This refers
     * to the tile's offset inside the Explored integer corresponding
     * to the tile.
     * @param posx The x-position of the tile.
     * @param posy The y-position of the tile.
     * @returns The tile's index within an Explored bit flag set.
     */
    MapFileParser.getTileOffset = function (posx, posy) {
        return (posy % 32);
    };

    /**
     * Parses the text of a MapFile.
     * @param str The text of the MapFile.
     * @returns The parsed map.
     */
    MapFileParser.prototype.parse = function (str) {
        var map = JSON.parse(str), x, y, explored, tileMap, mapReplacement = [], i = 0, baseX, baseY;

        if (!map) {
            return null;
        }

        explored = map.Explored;
        tileMap = map.Map;
        baseX = map.BaseX;
        baseY = map.BaseY;

        // Recreate the map structure.
        for (x = 255; x >= 0; x -= 1) {
            for (y = 255; y >= 0; y -= 1) {
                if ((explored[MapFileParser.getTileIndex(x, y)] >> MapFileParser.getTileOffset(x, y)) & 0x1) {
                    i += 1;
                    mapReplacement[(x << 8) + y] = tileMap[tileMap.length - i];
                }
            }
        }
        map.Map = mapReplacement;
        return map;
    };
    return MapFileParser;
}());