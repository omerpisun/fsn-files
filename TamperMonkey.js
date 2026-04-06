// ==UserScript==
// @name Grepobot Final
// @match *://*.grepolis.*/*
// @grant none
// @run-at document-end
// ==/UserScript==

(function () {
    const base = location.protocol + "//cdn.jsdelivr.net/gh/omerpisun/fsn-files/";

    const scripts = [
        "ConsoleLog.js",
        "FormBuilder.js",
        "DataExchanger.js",
        "ModuleManager.js",
        "Assistant.js",
        "Autofarm.js",
        "Autoculture.js",
        "Autobuild.js",
        "Autoattack.js",
        "Autobot.js"
    ];

    function load(i) {
        if (i >= scripts.length) {
            if (typeof Autobot !== "undefined") Autobot.init();
            return;
        }
        $.getScript(base + scripts[i]).done(() => load(i + 1));
    }

    load(0);

    $('<link/>', {
        rel: 'stylesheet',
        href: base + 'Autobot.css'
    }).appendTo('head');

})();
