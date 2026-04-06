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
        this.initButtons('Autofarm');
        this.initButtons('Autobuild');
        this.initButtons('Autoculture');
        this.initButtons('Autoattack');
    },

    stop: function () {
        clearInterval(this.interval);
        this.Queue.stop();
    },

    finished: function () {
        this.start();
    },

    start: function () {
        if (!this.playerTowns.length) return;

        this.Queue.start();
    }
};
