// ==UserScript==
// @name            Grepobot - Bot for Grepolis
// @namespace       Grepobot
// @description     Automated script for Grepolis
// @author          Robinatus
// @version         0.416
// @match           *://*.grepolis.*/*
// @grant           none
// @run-at          document-end
// ==/UserScript==

(function () {
    'use strict';

    function inject() {
        if (document.head.getAttribute('xhttps')) return;

        var script = document.createElement('script');
        script.type = 'text/javascript';
        script.src = location.protocol + '//cdn.jsdelivr.net/gh/omerpisun/fsn-files/Autobot.js';

        var link = document.createElement('link');
        link.rel = 'stylesheet';
        link.type = 'text/css';
        link.href = location.protocol + '//cdn.jsdelivr.net/gh/omerpisun/fsn-files/Autobot.css';

        document.head.appendChild(script);
        document.head.appendChild(link);
        document.head.setAttribute('xhttps', '1');
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', inject);
    } else {
        inject();
    }
})();
