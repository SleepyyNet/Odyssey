/*global jQuery, OdysseyEventDispatcher, OdysseyEventDispatchInterface, OdysseySpriteIndexLoadedEvent*/
var OdysseySpriteIndex = (function ($) {
    "use strict";
    /**
     * Creates an OdysseySpriteIndex context containing spritesheet data.
     * @constructor
     */
    function OdysseySpriteIndex() {
        this.eventDispatcher = new OdysseyEventDispatcher();
        this.data = [];
    }
    OdysseySpriteIndex.prototype = new OdysseyEventDispatchInterface();

    /**
     * Populates a resource manager with the sprite index data.
     * @param {OdysseySpriteIndex} spriteIndex the sprite index containing data.
     * @param {ResourceManager} resourceManager the resource manager to add to.
     */
    OdysseySpriteIndex.populateResourceManager = function (spriteIndex, resourceManager) {
        var spritesheets = spriteIndex.data, i, len;
        for (i = 0, len = spritesheets.length; i < len; i += 1) {
            resourceManager.addImage(spritesheets[i].src);
        }
    };

    /** Whether or not the sprite index is loaded. */
    OdysseySpriteIndex.prototype.isLoaded = false;

    /** Whether or not the sprite index is loading. */
    OdysseySpriteIndex.prototype.isLoading = false;

    /**
     * Sets the sprite index's loading state.
     * @param {boolean} val the loading state of the sprite index.
     */
    OdysseySpriteIndex.prototype.setLoading = function (val) {
        this.isLoading = val;
    };

    /**
     * Sets the sprite index's loaded state.
     * @param {boolean} val the loaded state of the sprite index.
     */
    OdysseySpriteIndex.prototype.setLoaded = function (val) {
        this.isLoaded = val;
    };

    /**
     * Sets the data of the sprite index.
     * @param {Array} arr the array of data.
     */
    OdysseySpriteIndex.prototype.setData = function (arr) {
        if (this.data.length !== 0) {
            this.data.length = 0;
        }
        Array.prototype.push.apply(this.data, arr);
    };

    /**
     * Loads the source sprite index file. The loading is asynchronous
     * and thus unreliable. Use the isLoaded field to determine if it
     * is loaded and safe to use, or the SpriteIndexLoaded event.
     * @param {string} the source file loation.
     * @returns {OdysseySpriteIndex} the loaded sprite index object.
     */
    OdysseySpriteIndex.load = function (src) {
        var spriteIndex = new OdysseySpriteIndex();
        spriteIndex.setLoading(true);
        $.ajax({
            url: src,
            dataType: 'json',
            success: function (data) {
                spriteIndex.setData(data);
                spriteIndex.setLoading(false);
                spriteIndex.setLoaded(true);
                spriteIndex.dispatchEvent(new OdysseySpriteIndexLoadedEvent());
            }
        });
        return spriteIndex;
    };

    return OdysseySpriteIndex;
}(jQuery));