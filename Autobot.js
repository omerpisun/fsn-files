var Autobot = {
    title: 'Autobot',
    version: '0.45',
    domain: window.location.protocol + "//cdn.jsdelivr.net/gh/omerpisun/fsn-files/",
    botWnd: null,
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
        this.loadModules();
        this.initAjax();
        this.initMapTownFeature();
        this.fixMessage();
        if (typeof Assistant !== "undefined") Assistant.init();
    },

    loadModules: function () {
        if (typeof ModuleManager !== "undefined") {
            ModuleManager.loadModules();
        }
    },

    initWnd: function () {
        if (!this.isLogged) return;

        if (this.botWnd) {
            try { this.botWnd.close(); } catch (e) {}
            this.botWnd = null;
        }

        this.botWnd = Layout.dialogWindow.open(
            '',
            this.title + ' v<span style="font-size:10px;">' + this.version + '</span>',
            500,
            350,
            '',
            false
        );

        this.botWnd.setHeight([350]);
        this.botWnd.setPosition(['center', 'center']);

        var el = this.botWnd.getJQElement();

        var menu = $('<ul/>', { class: 'menu_inner' })
            .append(this.addMenuItem('ACCOUNT', 'Account', 'Account'))
            .append(this.addMenuItem('CONSOLE', 'Console', 'Console'))
            .append(this.addMenuItem('ASSISTANT', 'Assistant', 'Assistant'));

        if (typeof Autoattack !== 'undefined') {
            menu.append(this.addMenuItem('ATTACK', 'Attack', 'Autoattack'));
        }
        if (typeof Autobuild !== 'undefined') {
            menu.append(this.addMenuItem('BUILD', 'Build', 'Autobuild'));
        }
        if (typeof Autoculture !== 'undefined') {
            menu.append(this.addMenuItem('CULTURE', 'Culture', 'Autoculture'));
        }
        if (typeof Autofarm !== 'undefined') {
            menu.append(this.addMenuItem('FARM', 'Farm', 'Autofarm'));
        }

        el.append($('<div/>', {
            class: 'menu_wrapper',
            style: 'left:78px; right:14px'
        }).append(menu));

        $('#Autobot-ACCOUNT').trigger('click');
    },

    addMenuItem: function (id, label, module) {
        return $('<li/>').append(
            $('<a/>', {
                class: 'submenu_link',
                href: '#',
                id: 'Autobot-' + id,
                rel: module
            }).on('click', function () {
                Autobot.botWnd.getJQElement()
                    .find('a.submenu_link')
                    .removeClass('active');

                $(this).addClass('active');

                Autobot.botWnd.setContent2(
                    Autobot.getContent($(this).attr('rel'))
                );

                if ($(this).attr('rel') === 'Console') {
                    var t = $('.terminal');
                    var h = $('.terminal-output')[0]?.scrollHeight || 0;
                    t.scrollTop(h);
                }
            }).append(
                $('<span/>', { class: 'left' }).append(
                    $('<span/>', { class: 'right' }).append(
                        $('<span/>', { class: 'middle' }).html(label)
                    )
                )
            )
        );
    },

    getContent: function (module) {
        if (module === 'Console') return ConsoleLog.contentConsole();
        if (module === 'Account') return this.contentAccount();

        if (typeof window[module] !== 'undefined') {
            return window[module].contentSettings();
        }

        return '';
    },

    contentAccount: function () {
        var rows = {
            "Name:": Game.player_name,
            "World:": Game.world_id,
            "Rank:": Game.player_rank,
            "Towns:": Game.player_villages,
            "Language:": Game.locale_lang
        };

        var tbody = $('<tbody/>');

        $.each(rows, function (k, v) {
            tbody.append(
                $('<tr/>').append(
                    $('<td/>').html(k),
                    $('<td/>').html(v)
                )
            );
        });

        return $('<table/>', {
            class: 'game_table',
            width: '100%'
        }).append(tbody)[0].outerHTML;
    },

    fixMessage: function () {
        if (!HumanMessage || !HumanMessage._initialize) return;

        var orig = HumanMessage._initialize;

        HumanMessage._initialize = function () {
            orig.apply(this, arguments);
            $(window).off('click');
        };
    },

    initAjax: function () {
        $(document).ajaxComplete(function (e, xhr, settings) {
            if (!settings || !settings.url) return;

            if (settings.url.indexOf('/game/') === -1) return;
            if (settings.url.indexOf(Autobot.domain) !== -1) return;

            if (xhr.readyState !== 4 || xhr.status !== 200) return;

            var parts = settings.url.split('?');
            if (!parts[1]) return;

            var action = parts[0].replace('/game/', '') + '/' + parts[1];

            if (typeof Autobuild !== 'undefined' && Autobuild.calls) {
                Autobuild.calls(action);
            }

            if (typeof Autoattack !== 'undefined' && Autoattack.calls) {
                Autoattack.calls(action, xhr.responseText);
            }
        });
    },

    randomize: function (min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    },

    toHHMMSS: function (sec) {
        sec = Math.max(0, sec || 0);

        var h = Math.floor(sec / 3600);
        var m = Math.floor((sec % 3600) / 60);
        var s = sec % 60;

        return (h ? h + ':' : '') +
            (m < 10 ? '0' : '') + m + ':' +
            (s < 10 ? '0' : '') + s;
    },

    checkPremium: function (type) {
        return $('.advisor_frame.' + type + ' div').hasClass(type + '_active');
    },

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

    initMapTownFeature: function () {
        if (!MapTiles || !MapTiles.createTownDiv) return;

        var original = MapTiles.createTownDiv;

        MapTiles.createTownDiv = function () {
            var result = original.apply(this, arguments);
            return Autobot.town_map_info(result, arguments[0]);
        };
    },

    town_map_info: function (nodes, data) {
        if (!nodes || !data) return nodes;

        nodes.forEach(function (el) {
            if (el.className === 'flag town') {
                if (typeof Assistant !== 'undefined') {
                    if (Assistant.settings.town_names) $(el).addClass('active_town');
                    if (Assistant.settings.player_name) $(el).addClass('active_player');
                    if (Assistant.settings.alliance_name) $(el).addClass('active_alliance');
                }

                $(el).append('<div class="player_name">' + (data.player_name || '') + '</div>');
                $(el).append('<div class="town_name">' + (data.name || '') + '</div>');
                $(el).append('<div class="alliance_name">' + (data.alliance_name || '') + '</div>');
            }
        });

        return nodes;
    }
};

(function () {

    String.prototype.capitalize = function () {
        return this.charAt(0).toUpperCase() + this.slice(1);
    };

    String.prototype.replaceAll = function (search, replacement) {
        return this.replace(new RegExp(search, 'g'), replacement);
    };

    $.fn.serializeObject = function () {
        var obj = {};

        $.each(this.serializeArray(), function () {
            if (obj[this.name]) {
                if (!Array.isArray(obj[this.name])) {
                    obj[this.name] = [obj[this.name]];
                }
                obj[this.name].push(this.value || '');
            } else {
                obj[this.name] = this.value || '';
            }
        });

        return obj;
    };

    var wait = setInterval(function () {

        if ($('.nui_main_menu').length && !$.isEmptyObject(ITowns.towns)) {

            clearInterval(wait);

            Autobot.initWindow();
            Autobot.initMapTownFeature();

            $.when(
                $.getScript(Autobot.domain + 'DataExchanger.js'),
                $.getScript(Autobot.domain + 'ConsoleLog.js'),
                $.getScript(Autobot.domain + 'FormBuilder.js'),
                $.getScript(Autobot.domain + 'ModuleManager.js'),
                $.getScript(Autobot.domain + 'Assistant.js')
            ).done(function () {
                Autobot.init();
            });

        } else if (/grepolis\.com\/start\?nosession/.test(window.location.href)) {

            clearInterval(wait);

            $.when(
                $.getScript(Autobot.domain + 'DataExchanger.js'),
                $.getScript(Autobot.domain + 'Redirect.js')
            ).done(function () {
                Autobot.checkAutoRelogin?.();
            });
        }

    }, 100);

})();
