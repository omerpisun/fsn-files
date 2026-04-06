// ==UserScript==
// @name         Grepobot FINAL - Taze Kurulum
// @match        *://*.grepolis.*/*
// @grant        none
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    // Önbelleği (cache) kırmak için her seferinde farklı bir sayı ekliyoruz
    const version = "?v=" + Math.random();
    const base = "https://cdn.jsdelivr.net/gh/omerpisun/fsn-files@main/";

    // Yükleme sırası çok önemlidir!
    const scripts = [
        "ConsoleLog.js",
        "FormBuilder.js",
        "DataExchanger.js",
        "ModuleManager.js",
        "Assistant.js",
        "Autobot.js"
    ];

    function loadScript(index) {
        if (index >= scripts.length) {
            console.log("✅ Tüm dosyalar indirildi. Oyunun hazır olması bekleniyor...");
            checkGameReady();
            return;
        }

        const url = base + scripts[index] + version;
        const s = document.createElement('script');
        s.src = url;
        s.onload = () => {
            console.log("📥 Başarıyla yüklendi: " + scripts[index]);
            loadScript(index + 1);
        };
        s.onerror = () => {
            console.error("❌ YÜKLENEMEDİ: " + scripts[index] + " - Link hatalı olabilir: " + url);
        };
        document.head.appendChild(s);
    }

    function checkGameReady() {
        // Oyunun temel objeleri yüklenmiş mi?
        if (typeof Game !== "undefined" && typeof ITowns !== "undefined") {
            console.log("🎮 Oyun objeleri bulundu. Bot başlatılıyor...");
            if (typeof Autobot !== "undefined") {
                Autobot.init();
                console.log("🚀 BOT AKTİF!");
            } else {
                console.error("❌ Hata: Autobot tanımlanamadı. Autobot.js dosyasını kontrol et.");
            }
        } else {
            setTimeout(checkGameReady, 1000);
        }
    }

    // CSS Yükle
    const l = document.createElement('link');
    l.rel = 'stylesheet';
    l.href = base + 'Autobot.css' + version;
    document.head.appendChild(l);

    // Başlat
    console.log("🛠️ Grepobot yükleme süreci başladı...");
    loadScript(0);

})();
