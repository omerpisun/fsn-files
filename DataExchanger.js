var DataExchanger = {

    default_handler: function (callback, full) {
        return function (response) {

            if (!response || !response.json) return;

            var json = response.json;

            if (json.redirect) {
                window.location.href = json.redirect;
                return;
            }

            if (json.maintenance) {
                return MaintenanceWindowFactory.openMaintenanceWindow(json.maintenance);
            }

            if (json.notifications && typeof NotificationLoader !== "undefined") {
                NotificationLoader.recvNotifyData(json, 'data');
                delete json.notifications;
                delete json.next_fetch_in;
            }

            if (json.bar && json.bar.gift && json.bar.gift.length) {
                try {
                    var ids = require('game/windows/ids');
                    var wnd = ids.DAILY_LOGIN;
                    var gift = HelperLayout.getGiftData(json.bar.gift, 'gift.daily_reward');

                    if (gift && !WM.isOpened(wnd)) {
                        HelperLayout.openDailyLoginGift(gift);
                    }
                } catch (e) {}
            }

            return callback ? callback(full ? response : json) : null;
        };
    },

    ajax: function (url, data, method, callback, full) {
        $.ajax({
            url: url,
            data: data,
            method: method || 'GET',
            dataType: 'json',
            success: this.default_handler(callback, full),
            error: function () {}
        });
    },

    game_data: function (town_id, cb) {
        var url = location.protocol + '//' + document.domain + '/game/data?' + $.param({
            town_id: town_id,
            action: 'get',
            h: Game.csrfToken
        });

        this.ajax(url, {
            json: JSON.stringify({
                types: [
                    { type: 'map', param: { x: 0, y: 0 } },
                    { type: 'bar' },
                    { type: 'backbone' }
                ],
                town_id: town_id,
                nl_init: false
            })
        }, 'POST', cb);
    },

    switch_town: function (town_id, cb) {
        var url = location.protocol + '//' + document.domain + '/game/index?' + $.param({
            town_id: town_id,
            action: 'switch_town',
            h: Game.csrfToken
        });

        this.ajax(url, {}, 'GET', cb);
    },

    claim_load: function (town_id, type, time, target_id, cb) {
        var url = location.protocol + '//' + document.domain + '/game/farm_town_info?' + $.param({
            town_id: town_id,
            action: 'claim_load',
            h: Game.csrfToken
        });

        this.ajax(url, {
            json: JSON.stringify({
                target_id: target_id,
                claim_type: type,
                time: time,
                town_id: town_id,
                nl_init: true
            })
        }, 'POST', cb);
    },

    claim_loads: function (town_id, ids, type, time, cb) {
        var url = location.protocol + '//' + document.domain + '/game/farm_town_overviews?' + $.param({
            town_id: Game.townId,
            action: 'claim_loads',
            h: Game.csrfToken
        });

        this.ajax(url, {
            json: JSON.stringify({
                farm_town_ids: ids,
                time_option: time,
                claim_factor: type,
                current_town_id: town_id,
                town_id: Game.townId,
                nl_init: true
            })
        }, 'POST', cb);
    },

    building_main: function (town_id, cb) {
        var url = location.protocol + '//' + document.domain + '/game/building_main';

        this.ajax(url, {
            town_id: town_id,
            action: 'index',
            h: Game.csrfToken,
            json: JSON.stringify({
                town_id: town_id,
                nl_init: true
            })
        }, 'GET', cb);
    },

    building_barracks: function (town_id, data, cb) {
        var url = location.protocol + '//' + document.domain + '/game/building_barracks?' + $.param({
            town_id: town_id,
            action: 'build',
            h: Game.csrfToken
        });

        this.ajax(url, {
            json: JSON.stringify(data)
        }, 'POST', cb);
    },

    frontend_bridge: function (town_id, data, cb) {
        var url = location.protocol + '//' + document.domain + '/game/frontend_bridge?' + $.param({
            town_id: town_id,
            action: 'execute',
            h: Game.csrfToken
        });

        this.ajax(url, {
            json: JSON.stringify(data)
        }, 'POST', cb);
    },

    town_info_attack: function (town_id, attack, cb) {
        var url = location.protocol + '//' + document.domain + '/game/town_info';

        this.ajax(url, {
            town_id: town_id,
            action: 'attack',
            h: Game.csrfToken,
            json: JSON.stringify({
                id: attack.target_id,
                origin_town_id: attack.town_id,
                preselect: true,
                preselect_units: attack.units,
                town_id: Game.townId,
                nl_init: true
            })
        }, 'GET', cb);
    },

    send_units: function (town_id, type, target_id, units, cb) {
        var url = location.protocol + '//' + document.domain + '/game/town_info?' + $.param({
            town_id: town_id,
            action: 'send_units',
            h: Game.csrfToken
        });

        this.ajax(url, {
            json: JSON.stringify($.extend({
                id: target_id,
                type: type,
                town_id: town_id,
                nl_init: true
            }, units))
        }, 'POST', cb);
    }
};
