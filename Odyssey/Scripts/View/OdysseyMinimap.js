/*jslint bitwise: true */
/*global Matrix3D, Odyssey, OdysseyEventDispatchInterface, OdysseyEventDispatcher, OdysseyMinimapRenderedEvent*/
var OdysseyMinimap = (function () {
    "use strict";
    /**
     * Creates a new OdysseyMinimap. This is used to
     * render the minimap.
     * @constructor
     */
    function OdysseyMinimap() {
        /**
         * The canvas to draw to.
         */
        this.canvas = null;

        /**
         * The 2D draw context of the canvas.
         */
        this.drawContext = null;

        /**
         * The minimap's current map position.
         */
        this.position = new Matrix3D(0, 0, 0);

        /**
         * Event dispatcher.
         */
        this.eventDispatcher = new OdysseyEventDispatcher();
    }
    extend(OdysseyMinimap.prototype, new OdysseyEventDispatchInterface());

    /**
     * Draws a pixel of a color at position on the canvas.
     * @param rgba the color as an RGBA integer (0xRRGGBBAA).
     * @param x the X coordinate on the canvas.
     * @param y the Y coordinate on the canvas.
     */
    OdysseyMinimap.prototype.drawPixel = function (rgba, x, y) {
        var r = ((rgba >> 24) & 0xFF),
            g = ((rgba >> 16) & 0xFF),
            b = ((rgba >> 8) & 0xFF),
            a = ((rgba >> 0) & 0xFF);

        this.drawContext.fillStyle = "rgba(" + r + "," + g + "," + b + ", " + a + ")";
        this.drawContext.fillRect(x, y, 1, 1);
    };

    /**
     * Sets the minimap canvas.
     * @param canvas the canvas to use for the minimap.
     */
    OdysseyMinimap.prototype.setCanvas = function (canvas) {
        this.canvas = canvas;
        this.drawContext = canvas.getContext("2d");
    };

    /**
     * Re-renders the minimap.
     */
    OdysseyMinimap.prototype.update = function (model) {
        var xs, ys, zs, items, i, itemCount, itemMapColor, dx, dy;
        xs = this.position.x - 63;
        ys = this.position.y - 63;
        zs = this.position.z;

        for (dx = 0; dx < 127; dx += 1) {
            for (dy = 0; dy < 127; dy += 1) {
                itemMapColor = null;

                items = model.getWorld().getTile(xs + dx, ys + dy, zs);
                itemCount = ((items === undefined || items === null) ? 0 : items.length);

                // Search the tile items from top to bottom until we find a map color.
                for (i = itemCount - 1; i >= 0 && itemMapColor === null; i -= 1) {
                    itemMapColor = model.getDat().getMapColor(items[i].ID);
                }

                // Use black (0, 0, 0, 255) if there is no (null) map color.
                this.drawPixel((itemMapColor || 0x000000FF), dx, dy);
            }
        }
        // Fire the OdysseyMiniMapRendered event.
        this.dispatchEvent(new OdysseyMinimapRenderedEvent());
    };

    return OdysseyMinimap;
}());
