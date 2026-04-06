// ==UserScript==
// @name Grepobot FINAL - Debug Mode
// @match *://*.grepolis.*/*
// @grant none
// @run-at document-end
// ==/UserScript==

(function () {
    'use strict';

    // Rastgele bir sayı ekleyerek jsDelivr'ın eski dosyayı vermesini engelliyoruz
    const version = "?v=" + Math.floor(Math.random() * 10000);
    const base = "https://cdn.jsdelivr.net/gh/omerpisun/fsn-files@main/";

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
            console.log("✅ Tüm modüller başarıyla indirildi.");
            waitForGame();
            return;
        }

        const scriptUrl = base + scripts[i] + version;
        
        $.getScript(scriptUrl)
            .done(() => {
                console.log("📥 Yüklendi: " + scripts[i]);
                load(i + 1);
            })
            .fail((jqxhr, settings, exception) => {
                console.error("❌ HATA: " + scripts[i] + " yüklenemedi! Linki kontrol et: " + scriptUrl);
            });
    }

    function waitForGame() {
        // Oyunun tamamen yüklendiğinden emin olalım
        if (typeof Game !== "undefined" && typeof ITowns !== "undefined" && ITowns.towns) {
            console.log("🎮 Oyun hazır. Bot başlatılıyor...");
            try {
                if (typeof Autobot !== "undefined") {
                    Autobot.init();
                    console.log("🚀 Autobot.init() çalıştırıldı.");
                } else {
                    console.error("❌ Kritik Hata: Autobot objesi bulunamadı!");
                }
            } catch (e) {
                console.error("💥 Başlatma hatası:", e);
            }
        } else {
            setTimeout(waitForGame, 1000);
        }
    }

    // jQuery hazır olana kadar bekle
    const checkJQuery = setInterval(() => {
        if (typeof $ !== "undefined" && $.getScript) {
            clearInterval(checkJQuery);
            console.log("🔗 jQuery aktif. Yükleme başlıyor...");
            load(0);
            
            // CSS Yükle
            $('<link/>', { rel: 'stylesheet', href: base + 'Autobot.css' + version }).appendTo('head');
        }
    }, 500);

})();
