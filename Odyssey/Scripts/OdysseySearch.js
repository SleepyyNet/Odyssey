/*jslint browser:true*/
/*global jQuery*/
(function ($) {
    "use strict";
    var active = false,
        $header = $("#OdysseySearchHeader"),
        $body = $(document.body),
        $linkOpenSearch = $("#OdysseyOpenSearch");
    function toggleSearch() {
        if (active) {
            $body.removeClass("state-search-active");
        } else {
            $body.addClass("state-search-active");
        }
        active = !active;
    }

    // Event listeners.
    $header.click(toggleSearch);
    $linkOpenSearch.click(toggleSearch);
}(jQuery));