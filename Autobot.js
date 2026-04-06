var Autobot = {
    title: 'Autobot',
    version: '0.44',
    domain: window.location.protocol + "//cdn.jsdelivr.net/gh/omerpisun/fsn-files/",
    botWnd: '',
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
        ConsoleLog.Log('Initialize Autobot', 0);
        Autobot.loadModules();
        Autobot.initAjax();
        Autobot.initMapTownFeature();
        Autobot.fixMessage();

        // ✅ FIX: Assistant güvenli init
        if (typeof Assistant !== 'undefined') {
            Assistant.init();
        }
    },

    loadModules: function () {
        ModuleManager.loadModules();
    },

    initWnd: function () {
        if (!Autobot.isLogged) return;

        if (typeof Autobot.botWnd !== 'undefined') {
            try { Autobot.botWnd.close(); } catch (e) {}
            Autobot.botWnd = undefined;
        }

        // ✅ FIX: HTML escape problemi kaldırıldı
        Autobot.botWnd = Layout.dialogWindow.open(
            '',
            Autobot.title + ' v' + Autobot.version,
            500,
            350,
            '',
            false
        );

        Autobot.botWnd.setHeight([350]);
        Autobot.botWnd.setPosition(['center', 'center']);

        var el = Autobot.botWnd.getJQElement();

        el.append($('<div/>', { class: 'menu_wrapper', style: 'left:78px; right:14px' })
            .append($('<ul/>', { class: 'menu_inner' })
                .prepend(Autobot.addMenuItem('AUTHORIZE', 'Account', 'Account'))
                .prepend(Autobot.addMenuItem('CONSOLE', 'Assistant', 'Assistant'))
                .prepend(Autobot.addMenuItem('ASSISTANT', 'Console', 'Console'))
            )
        );

        if (typeof Autoattack !== 'undefined')
            el.find('.menu_inner li:last-child').before(Autobot.addMenuItem('ATTACKMODULE','Attack','Autoattack'));

        if (typeof Autobuild !== 'undefined')
            el.find('.menu_inner li:last-child').before(Autobot.addMenuItem('CONSTRUCTMODULE','Build','Autobuild'));

        if (typeof Autoculture !== 'undefined')
            el.find('.menu_inner li:last-child').before(Autobot.addMenuItem('CULTUREMODULE','Culture','Autoculture'));

        if (typeof Autofarm !== 'undefined')
            el.find('.menu_inner li:last-child').before(Autobot.addMenuItem('FARMMODULE','Farm','Autofarm'));

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
        if (name === 'Account') return Autobot.contentAccount();

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
        if (typeof HumanMessage !== 'undefined') {
            const old = HumanMessage._initialize;
            HumanMessage._initialize = function () {
                old.apply(this, arguments);
                $(window).unbind('click');
            };
        }
    },

    // ✅ FIX: AJAX çakışma önlendi
    initAjax: function () {
        $(document).off('ajaxComplete.autobot')
        .on('ajaxComplete.autobot', function (_event, _xhr, _settings) {

            if (_settings.url.indexOf(Autobot.domain) === -1 &&
                _settings.url.indexOf('/game/') !== -1 &&
                _xhr.readyState === 4 && _xhr.status === 200) {

                let url = _settings.url.split('?');
                let action = url[0].substr(6);

                if (typeof Autobuild !== 'undefined')
                    Autobuild.calls(action);

                if (typeof Autoattack !== 'undefined')
                    Autoattack.calls(action, _xhr.responseText);
            }
        });
    }
};

// =======================
// INIT LOADER (KRİTİK FIX)
// =======================

(function () {

    let interval = setInterval(function () {

        if ($('.nui_main_menu').length && !$.isEmptyObject(ITowns.towns)) {

            clearInterval(interval);

            Autobot.initWindow?.();
            Autobot.initMapTownFeature?.();

            // ✅ FIX: Promise ALL (en kritik)
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
            .catch(err => {
                console.error("Module load error ❌", err);
            });

        }

    }, 100);

})();
