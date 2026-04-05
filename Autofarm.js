var Autofarm = {
    settings: {
        autostart: false,
        method: 300,
        timebetween: 1,
        skipwhenfull: true,
        lowresfirst: true,
        stoplootbelow: true,

        // SMART BOT
        smart: true,
        randomDelay: true,
        humanize: true
    },

    town: null,
    interval: null,
    isCaptain: false,
    shouldFarm: [],

    // =========================
    // 🧠 SMART SYSTEM
    // =========================

    autoSelectMethod: function (townId) {
        let town = ITowns.towns[townId];
        let res = town.resources();

        let total = res.wood + res.stone + res.iron;

        if (total < 8000) return 300;
        if (total < 20000) return 1200;
        if (total < 40000) return 5400;
        return 14400;
    },

    getMethodTime: function (townId) {
        let base;

        if (this.settings.smart) {
            base = this.autoSelectMethod(townId);
        } else {
            base = parseInt(this.settings.method);
        }

        // Booty research kontrolü
        if (Game.features.battlepoint_villages) {
            let towns = MM.getOnlyCollectionByName('Town').getTowns();

            $.each(towns, function (_, town) {
                if (town.id == townId && town.getResearches().hasResearch('booty')) {
                    base *= 2;
                    return false;
                }
            });
        }

        return base;
    },

    getDelay: function () {
        let base = this.settings.timebetween * 1000;

        if (!this.settings.randomDelay) return base;

        return base + Math.floor(Math.random() * 2000);
    },

    shouldSkip: function () {
        if (!this.settings.humanize) return false;

        return Math.random() < 0.1; // %10 skip
    },

    // =========================
    // 🔍 CHECK
    // =========================

    checkReady: function (town) {
        let t = ITowns.towns[town.id];

        if (t.hasConqueror()) return false;
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
        if (!ModuleManager.modules.Autofarm.isOn) return false;

        this.town = town;
        this.shouldFarm = [];
        this.iTown = ITowns.towns[town.id];

        setTimeout(() => {
            this.initFarmTowns(() => {
                this.town.currentFarmCount = 0;
                this.claimResources();
            });
        }, this.getDelay());
    },

    // =========================
    // 🏘 FARM DATA
    // =========================

    initFarmTowns: function (callback) {
        DataExchanger.game_data(this.town.id, (res) => {
            let farmTowns = [];

            $.each(res.map.data.data.data, (_, island) => {
                $.each(island.towns, (_, farm) => {
                    if (
                        farm.x == this.iTown.getIslandCoordinateX() &&
                        farm.y == this.iTown.getIslandCoordinateY() &&
                        farm.relation_status == 1
                    ) {
                        farmTowns.push(farm);
                    }
                });
            });

            this.town.farmTowns = farmTowns;

            $.each(farmTowns, (_, farm) => {
                if (farm.loot - Timestamp.now() <= 0) {
                    this.shouldFarm.push(farm);
                }
            });

            callback(true);
        });
    },

    // =========================
    // 💰 CLAIM
    // =========================

    claimResources: function () {
        if (!this.town.farmTowns.length) {
            ConsoleLog.Log(this.town.name + ' no farm.', 1);
            return;
        }

        if (this.town.currentFarmCount >= this.shouldFarm.length) {
            return this.finished(300);
        }

        setTimeout(() => {

            // HUMAN SIM
            if (this.shouldSkip()) {
                ConsoleLog.Log("Skip (human sim)", 1);
                this.town.currentFarmCount++;
                return this.claimResources();
            }

            let farm = this.shouldFarm[this.town.currentFarmCount];
            let methodTime = this.getMethodTime(this.town.id);

            let lootType = 'normal';

            if (!Game.features.battlepoint_villages) {
                if (this.settings.stoplootbelow) {
                    if (farm.mood >= 86) lootType = 'double';
                } else {
                    lootType = 'double';
                }
            }

            DataExchanger.claim_load(
                this.town.id,
                lootType,
                methodTime,
                farm.id,
                (res) => {
                    if (res.success) {
                        ConsoleLog.Log(res.success, 1);
                    }

                    farm.loot = Timestamp.now() + methodTime;

                    this.town.currentFarmCount++;
                    this.claimResources();
                }
            );

        }, this.getDelay());
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
