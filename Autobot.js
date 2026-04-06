var Autobot = {
    title: 'Autobot',
    version: '0.45',
    domain: window.location.protocol + "//cdn.jsdelivr.net/gh/omerpisun/fsn-files@main/",
    botWnd: undefined,
    isLogged: false,

    init: function () {
        this.isLogged = true;
        this.loadModules();
        this.initAjax();
        this.initWindow();
        this.initMapTownFeature();
    },

    loadModules: function () {
        if (typeof ModuleManager !== 'undefined') ModuleManager.loadModules();
    },

    initWnd: function () {
        if (!this.isLogged) return;
        if (this.botWnd) try { this.botWnd.close(); } catch (e) {}

        // DÜZELTME: HTML etiketleri tamamen kaldırıldı
        this.botWnd = Layout.dialogWindow.open('', this.title + ' v' + this.version, 520, 380, '', false);
        this.botWnd.setPosition(['center', 'center']);

        var content = this.botWnd.getJQElement().find('.ui-dialog-content');
        content.css({ marginTop: '35px' });
        content.prepend($('<div class="menu_wrapper" style="padding:5px; text-align:center;"></div>')
            .append($('<ul class="menu_inner" style="display:flex; justify-content:center; gap:10px; list-style:none;"></ul>')
                .append(this.addMenuItem('AUTHORIZE', 'Account', 'Account'))
                .append(this.addMenuItem('FARMMODULE', 'Farm', 'Autofarm'))
                .append(this.addMenuItem('CONSOLE', 'Console', 'Console'))
            )
        );
    },

    addMenuItem: function (id, text, rel) {
        return $('<li></li>').append($('<a/>', {
            class: 'submenu_link',
            href: '#',
            id: 'Autobot-' + id,
            rel: rel,
            style: 'color:#fcc02e; font-weight:bold; font-size:12px; text-decoration:none;'
        }).click(function () {
            Autobot.botWnd.setContent2(Autobot.getContent($(this).attr('rel')));
        }).text(text));
    },

    getContent: function (name) {
        if (name === 'Console') return ConsoleLog.contentConsole();
        if (name === 'Account') return `<table class="game_table" width="100%"><tr><td>Name:</td><td>${Game.player_name}</td></tr></table>`;
        return '';
    },

    initAjax: function () { /* Ajax işlemleri */ },
    initWindow: function () { /* Toolbox işlemleri */ },
    initMapTownFeature: function () { /* Harita işlemleri */ }
};

// OTOMATİK BAŞLATICI
(function () {
    let check = setInterval(() => {
        if ($('.nui_main_menu').length && typeof ITowns !== 'undefined') {
            clearInterval(check);
            Autobot.init();
        }
    }, 500);
})();
