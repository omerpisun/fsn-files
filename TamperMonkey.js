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
        "Autobot.js" // Bu en sonda olmalı çünkü ana obje burada tanımlı
    ];

    function load(i) {
        if (i >= scripts.length) {
            // --- KRİTİK NOKTA BURASI ---
            console.log("Tüm modüller yüklendi, Autobot başlatılıyor...");
            if (typeof Autobot !== "undefined") {
                Autobot.init(); // Botu burada tetikliyoruz
            } else {
                console.error("Hata: Autobot objesi bulunamadı!");
            }
            return;
        }
        
        // Dosyaları sırayla çekiyoruz
        $.getScript(base + scripts[i])
            .done(() => {
                console.log(scripts[i] + " yüklendi.");
                load(i + 1);
            })
            .fail(() => {
                console.error(scripts[i] + " yüklenirken hata oluştu!");
            });
    }

    // Grepolis'in JQuery'sinin hazır olduğundan emin olalım
    const checkJQuery = setInterval(() => {
        if (typeof $ !== "undefined" && typeof $.getScript !== "undefined") {
            clearInterval(checkJQuery);
            load(0);
        }
    }, 100);

    // CSS dosyasını ekle
    $('<link/>', {
        rel: 'stylesheet',
        href: base + 'Autobot.css'
    }).appendTo('head');

})();
