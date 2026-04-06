var ConsoleLog = {
    Logs: [],
    Types: ['Autobot', 'Farming', 'Culture', 'Builder', 'Attack'],
    scrollInterval: null,
    scrollUpdate: true,

    contentConsole: function () {
        var container = $('<fieldset/>', {
            style: 'float:left; width:472px;'
        }).append($('<legend/>').html('Autobot Console'))
          .append($('<div/>', {
              class: 'terminal'
          }).append($('<div/>', {
              class: 'terminal-output'
          })).on('scroll', () => this.LogScrollBottom()));

        var output = container.find('.terminal-output');

        this.Logs.forEach(log => output.append(log));

        return container;
    },

    Log: function (message, type) {
        if (this.Logs.length >= 500) this.Logs.shift();

        const now = new Date();
        const time = now.toLocaleTimeString();

        const logType = this.Types[type] || 'Log';

        const entry = $('<div/>').append(
            $('<div/>', { style: 'width:100%;' })
            .html(`${time} - [${logType}]: ${message}`)
        );

        this.Logs.push(entry);

        const output = $('.terminal-output');
        if (!output.length) return;

        output.append(entry);

        if (this.scrollUpdate) {
            $('.terminal').scrollTop(output[0].scrollHeight);
        }
    },

    LogScrollBottom: function () {
        clearInterval(this.scrollInterval);

        const terminal = $('.terminal');
        const output = $('.terminal-output');

        if (!terminal.length || !output.length) return;

        this.scrollUpdate =
            terminal.scrollTop() + terminal.innerHeight() >= output[0].scrollHeight - 1;

        const scrollHeight = output[0].scrollHeight;

        this.scrollInterval = setInterval(() => {
            terminal.scrollTop(scrollHeight);
        }, 5000);
    }
};
