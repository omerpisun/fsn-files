var Autofarm = {
    settings: {
        autostart: false,
        method: 600, // 🔥 10 dakika
        timebetween: 1,
        skipwhenfull: true,
        lowresfirst: true,
        stoplootbelow: true,

        smart: true,
        randomDelay: true,
        humanize: true,

        captainMode: true // 🔥 EN ÖNEMLİ
    },

    town: null,
    interval: null,
    shouldFarm: [],
    iTown: null,

    // =========================
    // 🧠 SMART METHOD
    // =========================
    autoSelectMethod: function (townId) {
        let res = ITowns.towns[townId].resources();
        let total = res.wood + res.stone + res.iron;

        if (total < 8000) return 300;
        if (total < 15000) return 600;   // 🔥 10 dk
        if (total < 30000) return 1200;
        return 5400;
    },

    getMethodTime: function (townId) {
        if (!this.settings.smart) return this.settings.method;

        return this.autoSelectMethod(townId);
    },

    getDelay: function () {
        let base = this.settings.timebetween * 1000;

        if (!this.settings.randomDelay) return base;

        return base + Math.floor(Math.random() * 2000);
    },

    shouldSkip: function () {
        if (!this.settings.humanize) return false;
        return Math.random() < 0.08;
    },

    // =========================
    // 🔍 READY CHECK
    // =========================
    checkReady: function (town) {
        let t = ITowns.towns[town.id];

        if (!t || t.hasConqueror()) return false;
        if (!ModuleManager.modules.Autofarm.isOn) return false;

        if (town.modules.Autofarm.isReadyTime >= Timestamp.now()) {
            return town.modules.Autofarm.isReadyTime;
        }

        let res = t.resources();

        if (
            res.wood === res.storage &&
            res.stone === res.storage &&
            res.iron === res.storage &&
            this.settings.skipwhenfull
        ) {
            return false;
        }

        return true;
    },

    // =========================
    // 🚀 START
    // =========================
    startFarming: function (town) {
        if (!town) return;
        if (!ModuleManager.modules.Autofarm.isOn) return;

        this.town = town;
        this.iTown = ITowns.towns[town.id];
        this.shouldFarm = [];

        if (!this.iTown) return;

        setTimeout(() => {

            this.initFarmTowns(() => {

                if (this.settings.captainMode) {
                    this.claimAll(); // 🔥 TOPLU
                } else {
                    this.claimSingle();
                }

            });

        }, this.getDelay());
    },

    // =========================
    // 🏘 FARM DATA
    // =========================
    initFarmTowns: function (callback) {
        DataExchanger.game_data(this.town.id, (res) => {

            let farmIds = [];

            try {
                $.each(res.map.data.data.data, (_, island) => {
                    $.each(island.towns, (_, farm) => {
                        if (
                            farm.x == this.iTown.getIslandCoordinateX() &&
                            farm.y == this.iTown.getIslandCoordinateY() &&
                            farm.relation_status == 1
                        ) {
                            if (farm.loot - Timestamp.now() <= 0) {
                                farmIds.push(farm.id);
                            }
                        }
                    });
                });
            } catch (e) {}

            this.shouldFarm = farmIds;
            callback(true);
        });
    },

    // =========================
    // 💰 CAPTAIN MODE (TOPLU)
    // =========================
    claimAll: function () {
        if (!this.shouldFarm.length) {
            return this.finished(600);
        }

        if (this.shouldSkip()) {
            ConsoleLog.Log("Skip (human sim)", 1);
            return this.finished(600);
        }

        let methodTime = this.getMethodTime(this.town.id);

        DataExchanger.claim_loads(
            this.town.id,
            this.shouldFarm,
            "normal",
            methodTime,
            (res) => {

                if (res && res.success) {
                    ConsoleLog.Log("Captain farm OK", 1);
                }

                this.finished(methodTime);
            }
        );
    },

    // =========================
    // 💰 TEK TEK (fallback)
    // =========================
    claimSingle: function () {
        if (!this.shouldFarm.length) {
            return this.finished(600);
        }

        let farmId = this.shouldFarm.shift();
        let methodTime = this.getMethodTime(this.town.id);

        DataExchanger.claim_load(
            this.town.id,
            "normal",
            methodTime,
            farmId,
            () => {
                this.claimSingle();
            }
        );
    },

    // =========================
    // 🏁 FINISH
    // =========================
    finished: function (time) {
        this.town.modules.Autofarm.isReadyTime = Timestamp.now() + time;
        ModuleManager.Queue.next();
    },

    stop: function () {
        clearTimeout(this.interval);
    }
};
