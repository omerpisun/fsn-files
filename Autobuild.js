var Autobuild = {
    settings: {
        autostart: false,
        enable_building: true,
        enable_units: true,
        enable_ships: true,
        timeinterval: 120,
        instant_buy: false
    },

    town_queues: [],
    town: null,
    iTown: null,
    interval: null,

    // =========================
    // 🟢 SAFE CHECK
    // =========================

    checkEnabled: function () {
        return ModuleManager?.modules?.Autobuild?.isOn;
    },

    // =========================
    // 🟢 INIT
    // =========================

    init: function () {
        ConsoleLog.Log('Initialize Autobuild', 3);
        this.loadSettings();
        this.loadQueue();
    },

    loadSettings: function () {
        let s = localStorage.getItem("Autobuild.Settings");
        if (s) {
            $.extend(this.settings, JSON.parse(s));
        }
    },

    loadQueue: function () {
        let q = localStorage.getItem("Autobuild.Queue");
        if (q) {
            this.town_queues = JSON.parse(q);
        }
    },

    // =========================
    // 🟢 START
    // =========================

    startBuild: function (town) {
        if (!this.checkEnabled()) return;

        this.town = town;
        this.iTown = ITowns.towns[town.id];

        this.startQueueing();
    },

    // =========================
    // 🟢 QUEUE LOGIC
    // =========================

    startQueueing: function () {
        if (!this.checkEnabled()) return;

        let queues = this.town_queues.find(e => e.town_id === this.town.id);

        if (!queues) return this.finished();

        // BUILDING
        if (queues.building_queue.length > 0) {
            return this.startBuildBuilding();
        }

        // UNIT
        if (queues.unit_queue.length > 0) {
            return this.startBuildUnits("unit");
        }

        // SHIP
        if (queues.ship_queue.length > 0) {
            return this.startBuildUnits("ship");
        }

        this.finished();
    },

    // =========================
    // 🏗 BUILD BUILDING
    // =========================

    startBuildBuilding: function () {
        let queues = this.town_queues.find(e => e.town_id === this.town.id);
        if (!queues || queues.building_queue.length === 0) {
            return this.finished();
        }

        let item = queues.building_queue[0];

        this.interval = setTimeout(() => {

            DataExchanger.building_main(this.town.id, (res) => {

                if (!res || !res.html) return this.finished();

                let buildings = this.getBuildings(res);

                if (!buildings || !buildings[item.item_name]) {
                    return this.finished();
                }

                let b = buildings[item.item_name];

                if (b && b.can_upgrade) {

                    DataExchanger.frontend_bridge(this.town.id, {
                        model_url: 'BuildingOrder',
                        action_name: 'buildUp',
                        arguments: {
                            building_id: item.item_name
                        },
                        town_id: this.town.id, // ✅ FIXED
                        nl_init: true
                    }, (response) => {

                        if (response.success) {
                            ConsoleLog.Log(item.item_name + " build success", 3);

                            this.removeBuilding(item.id);
                        }

                        this.finished();
                    });

                } else {
                    this.finished();
                }

            });

        }, this.randomDelay());
    },

    // =========================
    // ⚔ UNIT / SHIP
    // =========================

    startBuildUnits: function (type) {
        let queues = this.town_queues.find(e => e.town_id === this.town.id);
        if (!queues) return this.finished();

        let queue = queues[type + "_queue"];
        if (!queue || queue.length === 0) return this.finished();

        let item = queue[0];

        this.interval = setTimeout(() => {

            DataExchanger.building_barracks(this.town.id, {
                unit_id: item.item_name,
                amount: item.count,
                town_id: this.town.id,
                nl_init: true
            }, (res) => {

                if (res.success) {
                    ConsoleLog.Log("Unit built: " + item.item_name, 3);
                    this.removeUnit(item.id, type);
                }

                this.finished();
            });

        }, this.randomDelay());
    },

    // =========================
    // 🧠 HELPERS
    // =========================

    getBuildings: function (res) {
        try {
            let match = res.html.match(/BuildingMain\.buildings = (.*);/);
            if (!match || !match[1]) return null;
            return JSON.parse(match[1]);
        } catch (e) {
            console.log("Parse error", e);
            return null;
        }
    },

    removeBuilding: function (id) {
        let queues = this.town_queues.find(e => e.town_id === this.town.id);
        if (!queues) return;

        let i = queues.building_queue.findIndex(e => e.id === id);
        if (i > -1) queues.building_queue.splice(i, 1);
    },

    removeUnit: function (id, type) {
        let queues = this.town_queues.find(e => e.town_id === this.town.id);
        if (!queues) return;

        let q = queues[type + "_queue"];
        let i = q.findIndex(e => e.id === id);
        if (i > -1) q.splice(i, 1);
    },

    randomDelay: function () {
        return 1000 + Math.floor(Math.random() * 1500);
    },

    // =========================
    // 🏁 FINISH
    // =========================

    finished: function () {
        if (!this.checkEnabled()) return;

        this.town.modules.Autobuild.isReadyTime =
            Timestamp.now() + this.settings.timeinterval;

        ModuleManager.Queue.next();
    },

    stop: function () {
        clearTimeout(this.interval); // ✅ FIXED
    }
};
