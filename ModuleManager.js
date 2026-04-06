ModuleManager = {

    modules: {
        Autofarm: { isOn: false },
        Autoculture: { isOn: false },
        Autobuild: { isOn: false },
        Autoattack: { isOn: false }
    },

    Queue: {
        total: 0,
        queue: [],

        add: function (item) {
            this.total++;
            this.queue.push(item);
        },

        start: function () {
            if (!this.queue.length) return;
            this.next();
        },

        stop: function () {
            this.queue = [];
            this.total = 0;
        },

        isRunning: function () {
            return this.queue.length > 0;
        },

        next: function () {
            const item = this.queue.shift();

            if (item && item.fx) {
                item.fx();
            } else {
                this.total = 0;
                ModuleManager.finished();
            }
        }
    },

    interval: null,
    playerTowns: [],

    init: function () {
        this.loadPlayerTowns();
    },

    // 🔥 EN KRİTİK FIX
    start: function () {

        if (!this.playerTowns.length) return;

        let added = false;

        this.playerTowns.forEach(town => {

            // FARM
            if (typeof Autofarm !== "undefined" &&
                this.modules.Autofarm.isOn &&
                Autofarm.checkReady(town) === true) {

                added = true;

                this.Queue.add({
                    fx: () => Autofarm.startFarming(town)
                });
            }

            // BUILD
            if (typeof Autobuild !== "undefined" &&
                this.modules.Autobuild.isOn &&
                Autobuild.checkReady?.(town) === true) {

                added = true;

                this.Queue.add({
                    fx: () => Autobuild.startBuild(town)
                });
            }

            // CULTURE
            if (typeof Autoculture !== "undefined" &&
                this.modules.Autoculture.isOn &&
                Autoculture.checkReady?.(town) === true) {

                added = true;

                this.Queue.add({
                    fx: () => Autoculture.startCulture(town)
                });
            }

        });

        if (added) {
            this.Queue.start();
        } else {
            // 🔥 tekrar dene (loop)
            clearTimeout(this.interval);
            this.interval = setTimeout(() => this.start(), 5000);
        }
    },

    stop: function () {
        clearTimeout(this.interval);
        this.Queue.stop();
    },

    finished: function () {
        this.start();
    }
};
