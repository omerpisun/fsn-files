var Autobot = {
    title: 'Autobot',
    version: '0.45',
    domain: window.location.protocol + "//cdn.jsdelivr.net/gh/omerpisun/fsn-files/",
    botWnd: undefined,
    isLogged: false,

    Account: {
        player_id: Game.player_id,
        player_name: Game.player_name,
        world_id: Game.world_id,
        locale_lang: Game.locale_lang,
        premium_grepolis: Game.premium_user,
        csrfToken: Game.csrfToken
    },

    init: function () {
        this.isLogged = true; // Pencerenin açılması için bu şart
        ConsoleLog.Log('Initialize Autobot', 0);
        this.loadModules();
        this.initAjax();
        this.initMapTownFeature();
        this.fixMessage();

        if (typeof Assistant !== 'undefined') {
            Assistant.init();
        }
    },

    loadModules: function () {
        if (typeof ModuleManager !== 'undefined') {
            ModuleManager.loadModules();
        }
    },

    initWnd: function () {
        if (!this.isLogged) return;

        if (typeof this.botWnd !== 'undefined') {
            try { this.botWnd.close(); } catch (e) {}
            this.botWnd = undefined;
        }

        // HTML etiket hatası burada düzeltildi
        this.botWnd = Layout.dialogWindow.open(
            '',
            this.title + ' v' + this.version, 
            500,
            350,
            '',
            false
        );

        this.botWnd.setHeight([350]);
        this.botWnd.setPosition(['center', 'center']);

        var el = this.botWnd.getJQElement();

        el.append($('<div/>', { class: 'menu_wrapper', style: 'left:78px; right:14px' })
            .append($('<ul/>', { class: 'menu_inner' })
                .prepend(this.addMenuItem('AUTHORIZE', 'Account', 'Account'))
                .prepend(this.addMenuItem('ASSISTANT', 'Assistant', 'Assistant'))
                .prepend(this.addMenuItem('CONSOLE', 'Console', 'Console'))
            )
        );

        if (typeof Autoattack !== 'undefined')
            el.find('.menu_inner li:last-child').before(this.addMenuItem('ATTACKMODULE','Attack','Autoattack'));

        if (typeof Autobuild !== 'undefined')
            el.find('.menu_inner li:last-child').before(this.addMenuItem('CONSTRUCTMODULE','Build','Autobuild'));

        if (typeof Autoculture !== 'undefined')
            el.find('.menu_inner li:last-child').before(this.addMenuItem('CULTUREMODULE','Culture','Autoculture'));

        if (typeof Autofarm !== 'undefined')
            el.find('.menu_inner li:last-child').before(this.addMenuItem('FARMMODULE','Farm','Autofarm'));

        $('#Autobot-AUTHORIZE').click();
    },

    addMenuItem: function (id, text, rel) {
        return $('<li/>').append(
            $('<a/>', {
                class: 'submenu_link',
                href: '#',
                id: 'Autobot-' + id,
                rel: rel
            }).click(function () {
                Autobot.botWnd.getJQElement().find('a').removeClass('active');
                $(this).addClass('active');
                Autobot.botWnd.setContent2(Autobot.getContent($(this).attr('rel')));
            }).append($('<span/>').text(text))
        );
    },

    getContent: function (name) {
        if (name === 'Console') return ConsoleLog.contentConsole();
        if (name === 'Account') return this.contentAccount();

        if (typeof window[name] !== 'undefined') {
            return window[name].contentSettings();
        }
        return '';
    },

    contentAccount: function () {
        return `
            <table class="game_table" width="100%">
                <tr><td>Name:</td><td>${Game.player_name}</td></tr>
                <tr><td>World:</td><td>${Game.world_id}</td></tr>
                <tr><td>Rank:</td><td>${Game.player_rank}</td></tr>
                <tr><td>Towns:</td><td>${Game.player_villages}</td></tr>
                <tr><td>Language:</td><td>${Game.locale_lang}</td></tr>
            </table>
        `;
    },

    fixMessage: function () {
        if (typeof HumanMessage !== 'undefined' && HumanMessage._initialize) {
            const old = HumanMessage._initialize;
            HumanMessage._initialize = function () {
                old.apply(this, arguments);
                $(window).unbind('click');
            };
        }
    },

    initAjax: function () {
        $(document).off('ajaxComplete.autobot')
        .on('ajaxComplete.autobot', function (_event, _xhr, _settings) {
            if (_settings.url.indexOf(Autobot.domain) === -1 &&
                _settings.url.indexOf('/game/') !== -1 &&
                _xhr.readyState === 4 && _xhr.status === 200) {

                let url = _settings.url.split('?');
                let action = url[0].substr(6);

                if (typeof Autobuild !== 'undefined') Autobuild.calls(action);
                if (typeof Autoattack !== 'undefined') Autoattack.calls(action, _xhr.responseText);
            }
        });
    },

    // Eksik olan Toolbox (araç kutusu) fonksiyonu
    initWindow: function () {
        $('.nui_main_menu').css('top', '282px');
        $('<div/>', { class: 'nui_bot_toolbox' })
            .append($('<div/>', { class: 'bot_menu layout_main_sprite' })
                .append($('<ul/>')
                    .append($('<li/>', { id: 'Autofarm_onoff', class: 'disabled' }).append($('<span/>', { class: 'autofarm' })))
                    .append($('<li/>', { id: 'Autoculture_onoff', class: 'disabled' }).append($('<span/>', { class: 'autoculture' })))
                    .append($('<li/>', { id: 'Autobuild_onoff', class: 'disabled' }).append($('<span/>', { class: 'autobuild' })))
                    .append($('<li/>', { id: 'Autoattack_onoff', class: 'disabled' }).append($('<span/>', { class: 'autoattack' })))
                    .append($('<li/>').append(
                        $('<span/>', { class: 'botsettings' }).on('click', function () {
                            if (Autobot.isLogged) Autobot.initWnd();
                        })
                    ))
                )
            )
            .append($('<div/>', { id: 'time_autobot', class: 'time_row' }))
            .insertAfter('.nui_left_box');
    },

    // Eksik olan Harita özelliği fonksiyonu
    initMapTownFeature: function () {
        if (typeof MapTiles === 'undefined' || !MapTiles.createTownDiv) return;
        var original = MapTiles.createTownDiv;
        MapTiles.createTownDiv = function () {
            var result = original.apply(this, arguments);
            var data = arguments[0];
            if (result && data) {
                result.forEach(function (el) {
                    if (el.className === 'flag town') {
                        $(el).append('<div class="player_name">' + (data.player_name || '') + '</div>');
                        $(el).append('<div class="town_name">' + (data.name || '') + '</div>');
                        $(el).append('<div class="alliance_name">' + (data.alliance_name || '') + '</div>');
                    }
                });
            }
            return result;
        };
    }
};

// Modül yükleyici tetikleyici
(function () {
    let interval = setInterval(function () {
        if ($('.nui_main_menu').length && !$.isEmptyObject(ITowns.towns)) {
            clearInterval(interval);
            Autobot.initWindow();
            Autobot.initMapTownFeature();

            Promise.all([
                $.getScript(Autobot.domain + 'DataExchanger.js'),
                $.getScript(Autobot.domain + 'ConsoleLog.js'),
                $.getScript(Autobot.domain + 'FormBuilder.js'),
                $.getScript(Autobot.domain + 'ModuleManager.js'),
                $.getScript(Autobot.domain + 'Assistant.js')
            ])
            .then(() => {
                console.log("Autobot modules loaded ✅");
                Autobot.init();
            })
            .catch(err => console.error("Module load error ❌", err));
        }
    }, 100);
})();
