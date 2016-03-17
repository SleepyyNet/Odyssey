/*global OdysseyEvent*/
var OdysseyBinaryFileLoadedEvent = (function () {
    "use strict";
    function OdysseyBinaryFileLoadedEvent(context) {
        this.file = context;
    }
    OdysseyBinaryFileLoadedEvent.prototype = new OdysseyEvent("OdysseyBinaryFileLoaded");

    return OdysseyBinaryFileLoadedEvent;
}());
