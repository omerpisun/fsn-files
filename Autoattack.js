var Autoattack = {
    settings: {
        autostart: false
    },
    attacks: [],
    attacks_timers: [],
    view: null,
    checked_count: 0,

    init: function () {
        ConsoleLog.Log('Initialize Autoattack', 4);
        this.initButton();

        if (Autobot.checkPremium('captain')) {
            this.loadAttackQueue();
        }
    },

    setSettings: function (settings) {
        if (settings) {
            $.extend(this.settings, JSON.parse(settings));
        }
    },

    initButton: function () {
        ModuleManager.initButtons('Autoattack');
    },

    start: function () {
        this.attacks_timers = [];

        let promises = $.map(this.attacks, (attack, index) => {
            let def = $.Deferred();

            this.checkAttack(attack, index).then(() => {
                def.resolve();
            });

            return def;
        });

        $.when.apply($, promises).done(() => {
            this.checked_count = 0;

            let message;

            if (this.countRunningAttacks() === 0) {
                message = DM.getl10n('COMMON').no_results + '.';
                HumanMessage.error(message);
                ConsoleLog.Log(`<span style="color:#ff4f23;">${message}</span>`, 4);
                this.disableStart();
            } else {
                const incoming = DM.getl10n('layout').toolbar_activities.incomming_attacks;

                message = `${DM.getl10n('alliance').index.button_send}: ${this.countRunningAttacks()} ${incoming.toLowerCase()}.`;

                HumanMessage.success(message);
                ConsoleLog.Log(`<span style="color:#ff4f23;">${message}</span>`, 4);
            }
        });
    },

    checkAttack: function (attack, index) {
        let def = $.Deferred();

        if (attack.send_at >= Timestamp.now()) {
            this.checked_count++;

            setTimeout(() => {
                DataExchanger.town_info_attack(attack.town_id, attack, (res) => {
                    if (!res.json) return def.resolve();

                    if (!res.json.same_island || GameDataUnits.hasNavalUnits(attack.units)) {
                        let cap = GameDataUnits.calculateCapacity(attack.town_id, attack.units);

                        if (cap.needed_capacity > cap.total_capacity) {
                            let msg = DM.getl10n('place').support_overview.slow_transport_ship;

                            $(`#attack_order_id_${attack.id} .attack_bot_timer`)
                                .removeClass('success')
                                .html(msg);

                            this.addAttack(index, msg);
                            return def.resolve();
                        }
                    }

                    this.addAttack(index);
                    def.resolve();
                });
            }, (this.checked_count * 500));
        } else {
            let msg = 'Expired';

            this.addAttack(index, msg);

            $(`#attack_order_id_${attack.id} .attack_bot_timer`)
                .removeClass('success')
                .html(msg);

            def.resolve();
        }

        return def;
    },

    addAttack: function (index, messageText) {
        let attack = this.attacks[index];

        let timerObj = {
            is_running: false,
            attack_id: attack.id,
            interval: null,
            message: null,
            message_text: messageText || ''
        };

        if (!messageText) {
            timerObj.is_running = true;

            timerObj.interval = setInterval(() => {
                if (!this.attacks[index]) {
                    timerObj.is_running = false;
                    if (timerObj.message) timerObj.message.html('Stopped');
                    return this.stopTimer(timerObj);
                }

                let remaining = this.attacks[index].send_at - Timestamp.now();

                timerObj.message = $(`#attack_order_id_${timerObj.attack_id} .attack_bot_timer`);
                timerObj.message.html(Autobot.toHHMMSS(remaining));

                // daha stabil kontrol
                if (remaining <= 300 && remaining > 295 ||
                    remaining <= 120 && remaining > 115 ||
                    remaining <= 60 && remaining > 55) {

                    ConsoleLog.Log(
                        `<span style="color:#ff4f23;">[${attack.origin_town_name} > ${attack.target_town_name}] ${
                            DM.getl10n('heroes').common.departure.toLowerCase().replace(':', '')
                        } ${DM.getl10n('place').support_overview.just_in} ${formatTime(remaining)}</span>`,
                        4
                    );
                }

                if (this.attacks[index].send_at <= Timestamp.now()) {
                    timerObj.is_running = false;
                    this.sendAttack(this.attacks[index]);
                    this.stopTimer(timerObj);
                }

            }, 1000);
        }

        this.attacks_timers.push(timerObj);
    },

    countRunningAttacks: function () {
        return this.attacks_timers.filter(t => t.is_running).length;
    },

    stopTimer: function (timerObj) {
        clearInterval(timerObj.interval);

        if (this.countRunningAttacks() === 0) {
            ConsoleLog.Log('<span style="color:#ff4f23;">All finished.</span>', 4);
            this.stop();
        }
    },

    stop: function () {
        this.disableStart();

        this.attacks_timers.forEach(timer => {
            if (timer.is_running) {
                $(`#attack_order_id_${timer.attack_id} .attack_bot_timer`).html('');
            }
            clearInterval(timer.interval);
        });
    },

    disableStart: function () {
        ModuleManager.modules.Autoattack.isOn = false;

        $('#Autoattack_onoff')
            .removeClass('on')
            .find('span')
            .mousePopup(new MousePopup('Start Autoattack'));
    },

    sendAttack: function (attack) {
        DataExchanger.send_units(
            attack.town_id,
            attack.type,
            attack.target_town_id,
            this.unitsToSend(attack.units),
            (res) => {
                let timer = this.attacks_timers.find(t => t.attack_id === attack.id);

                if (!timer) return;

                if (res.success) {
                    timer.message_text = 'Success';
                    timer.message.addClass('success').html('Success');
                } else if (res.error) {
                    timer.message_text = 'Invalid';
                    timer.message.html('Invalid');
                }
            }
        );
    },

    unitsToSend: function (units) {
        let result = {};

        $.each(units, (unit, count) => {
            if (count > 0) result[unit] = count;
        });

        return result;
    }
};

// helper
function formatTime(sec) {
    let h = Math.floor(sec / 3600);
    let m = Math.floor((sec % 3600) / 60);
    let s = sec % 60;
    return `${h}h ${m}m ${s}s`;
}
