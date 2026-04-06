var DataExchanger = {

    // =========================
    // 🔥 SAFE HANDLER (EN KRİTİK)
    // =========================
    default_handler: function (callback, full) {
        return function (response) {

            try {

                if (!response || !response.json) return;

                var json = response.json;
                if (!json) return;

                // redirect
                if (json.redirect) {
                    window.location.href = json.redirect;
                    return;
                }

                // maintenance
                if (json.maintenance && typeof MaintenanceWindowFactory !== "undefined") {
                    return MaintenanceWindowFactory.openMaintenanceWindow(json.maintenance);
                }

                // notifications
                if (json.notifications && typeof NotificationLoader !== "undefined") {
                    NotificationLoader.recvNotifyData(json, 'data');
                    delete json.notifications;
                    delete json.next_fetch_in;
                }

                // daily gift (safe)
                if (json.bar && json.bar.gift && json.bar.gift.length) {
                    try {
                        if (typeof require !== "undefined") {
                            var ids = require('game/windows/ids');
                            var wnd = ids.DAILY_LOGIN;

                            if (!WM.isOpened(wnd)) {
                                HelperLayout.openDailyLoginGift(
                                    HelperLayout.getGiftData(json.bar.gift, 'gift.daily_reward')
                                );
                            }
                        }
                    } catch (e) {}
                }

                return callback ? callback(full ? response : json) : null;

            } catch (e) {
                console.error("DataExchanger handler error:", e);
            }
        };
    },

    // =========================
    // 🔥 AJAX WRAPPER
    // =========================
    ajax: function (url, data, method, callback, full) {

        try {
            $.ajax({
                url: url,
                data: data,
                method: method || 'GET',
                dataType: 'json',
                success: this.default_handler(callback, full),
                error: function (xhr) {
                    console.error("AJAX error:", xhr?.status);
                }
            });
        } catch (e) {
            console.error("AJAX crash:", e);
        }
    },

    // =========================
    // 📦 GAME DATA
    // =========================
    game_data: function (town_id, cb) {

        if (!town_id) return;

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

    // =========================
    // 🔄 SWITCH
    // =========================
    switch_town: function (town_id, cb) {

        if (!town_id) return;

        var url = location.protocol + '//' + document.domain + '/game/index?' + $.param({
            town_id: town_id,
            action: 'switch_town',
            h: Game.csrfToken
        });

        this.ajax(url, {}, 'GET', cb);
    },

    // =========================
    // 💰 SINGLE FARM
    // =========================
    claim_load: function (town_id, type, time, target_id, cb) {

        if (!town_id || !target_id) return;

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

    // =========================
    // 💣 CAPTAIN FARM (TOPLU)
    // =========================
    claim_loads: function (town_id, ids, type, time, cb) {

        if (!ids || !ids.length) return;

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

    // =========================
    // 🏗 BUILD
    // =========================
    building_main: function (town_id, cb) {

        if (!town_id) return;

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

        if (!town_id) return;

        var url = location.protocol + '//' + document.domain + '/game/building_barracks?' + $.param({
            town_id: town_id,
            action: 'build',
            h: Game.csrfToken
        });

        this.ajax(url, {
            json: JSON.stringify(data)
        }, 'POST', cb);
    },

    // =========================
    // 🔧 GENERIC
    // =========================
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

    // =========================
    // ⚔ ATTACK
    // =========================
    town_info_attack: function (town_id, attack, cb) {

        if (!attack) return;

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

        if (!town_id || !target_id) return;

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
