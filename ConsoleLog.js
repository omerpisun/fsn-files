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
          })).on('scroll', function () {
              ConsoleLog.LogScrollBottom();
          }));

        var output = container.find('.terminal-output');

        $.each(this.Logs, function (_, log) {
            output.append(log);
        });

        return container;
    },

    Log: function (message, type) {
        if (this.Logs.length >= 500) {
            this.Logs.shift();
        }

        function pad(n) {
            return n < 10 ? '0' + n : n;
        }

        var now = new Date();
        var time = pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());

        var logType = this.Types[type] || 'Log';

        var entry = $('<div/>').append(
            $('<div/>', {
                style: 'width:100%;'
            }).html(time + ' - [' + logType + ']: ' + message)
        );

        this.Logs.push(entry);

        var output = $('.terminal-output');

        if (output.length) {
            output.append(entry);

            if (this.scrollUpdate) {
                var terminal = $('.terminal');
                var scrollHeight = output[0].scrollHeight;
                terminal.scrollTop(scrollHeight);
            }
        }
    },

    LogScrollBottom: function () {
        clearInterval(this.scrollInterval);

        var terminal = $('.terminal');
        var output = $('.terminal-output');

        if (!terminal.length || !output.length) return;

        if (terminal.scrollTop() + terminal.innerHeight() >= output[0].scrollHeight - 1) {
            this.scrollUpdate = true;
        } else {
            this.scrollUpdate = false;
        }

        var scrollHeight = output[0].scrollHeight;

        this.scrollInterval = setInterval(function () {
            terminal.scrollTop(scrollHeight);
        }, 7000);
    }
};
