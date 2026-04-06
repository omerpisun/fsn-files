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
            this.loadAttackQueue && this.loadAttackQueue();
        }
    },

    setSettings: function (settings) {
        if (settings) {
            try {
                $.extend(this.settings, JSON.parse(settings));
            } catch (e) {}
        }
    },

    initButton: function () {
        ModuleManager.initButtons('Autoattack');
    },

    start: function () {
        this.attacks_timers = [];
        this.checked_count = 0;

        if (!this.attacks.length) return;

        let promises = this.attacks.map((attack, index) => {
            return this.checkAttack(attack, index);
        });

        $.when.apply($, promises).done(() => {
            let running = this.countRunningAttacks();

            if (running === 0) {
                let msg = DM.getl10n('COMMON').no_results + '.';
                HumanMessage.error(msg);
                ConsoleLog.Log(`<span style="color:#ff4f23;">${msg}</span>`, 4);
                this.disableStart();
            } else {
                let incoming = DM.getl10n('layout').toolbar_activities.incomming_attacks;
                let msg = `${DM.getl10n('alliance').index.button_send}: ${running} ${incoming.toLowerCase()}.`;

                HumanMessage.success(msg);
                ConsoleLog.Log(`<span style="color:#ff4f23;">${msg}</span>`, 4);
            }
        });
    },

    checkAttack: function (attack, index) {
        let def = $.Deferred();

        if (!attack) return def.resolve();

        if (attack.send_at >= Timestamp.now()) {
            this.checked_count++;

            setTimeout(() => {

                DataExchanger.town_info_attack(attack.town_id, attack, (res) => {
                    if (!res || !res.json) return def.resolve();

                    this.addAttack(index);
                    def.resolve();
                });

            }, this.checked_count * 400);

        } else {
            this.addAttack(index, 'Expired');
            def.resolve();
        }

        return def;
    },

    // 🔥 FULL FIX BURADA
    addAttack: function (index, messageText) {
        let attack = this.attacks[index];
        if (!attack) return;

        let timerObj = {
            is_running: false,
            attack_id: attack.id,
            interval: null,
            message: null
        };

        if (!messageText) {
            timerObj.is_running = true;

            if (timerObj.interval) clearInterval(timerObj.interval);

            timerObj.interval = setInterval(() => {

                if (!this.attacks[index]) {
                    return this.stopTimer(timerObj);
                }

                let remaining = this.attacks[index].send_at - Timestamp.now();

                timerObj.message = $(`#attack_order_id_${timerObj.attack_id} .attack_bot_timer`);

                if (timerObj.message && timerObj.message.length) {
                    timerObj.message.html(Autobot.toHHMMSS(remaining));
                }

                if (remaining <= 0) {
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
            clearInterval(timer.interval);
        });

        this.attacks_timers = [];
    },

    disableStart: function () {
        ModuleManager.modules.Autoattack.isOn = false;

        $('#Autoattack_onoff')
            .removeClass('on')
            .find('span')
            .mousePopup(new MousePopup('Start Autoattack'));
    },

    sendAttack: function (attack) {
        if (!attack) return;

        DataExchanger.send_units(
            attack.town_id,
            attack.type,
            attack.target_town_id,
            this.unitsToSend(attack.units),
            (res) => {

                let timer = this.attacks_timers.find(t => t.attack_id === attack.id);
                if (!timer) return;

                if (res.success) {
                    timer.message?.addClass('success').html('Success');
                } else {
                    timer.message?.html('Error');
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
