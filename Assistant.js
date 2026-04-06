var Assistant = {
    settings: {
        town_names: false,
        player_name: false,
        alliance_name: true,
        auto_relogin: 0
    },

    init: function () {
        ConsoleLog.Log('Initialize Assistant', 0);
    },

    setSettings: function (data) {
        if (data) {
            try {
                $.extend(this.settings, JSON.parse(data));
            } catch (e) {}
        }
        this.initSettings();
    },

    initSettings: function () {
        const flags = $('#map_towns .flag');

        if (this.settings.town_names) {
            flags.addClass('active_town');
        } else {
            flags.removeClass('active_town');
        }

        if (this.settings.player_name) {
            flags.addClass('active_player');
        } else {
            flags.removeClass('active_player');
        }

        if (this.settings.alliance_name) {
            flags.addClass('active_alliance');
        } else {
            flags.removeClass('active_alliance');
        }
    },

    contentSettings: function () {
        return $('<fieldset/>', {
            id: 'Assistant_settings',
            style: 'float:left; width:472px;height:270px;'
        })
        .append($('<legend/>').html('Assistant Settings'))

        .append(FormBuilder.checkbox({
            text: 'Show town names on island view.',
            id: 'assistant_town_names',
            name: 'assistant_town_names',
            checked: this.settings.town_names
        }))

        .append(FormBuilder.checkbox({
            text: 'Show player names on island view.',
            id: 'assistant_player_names',
            name: 'assistant_player_names',
            checked: this.settings.player_name
        }))

        .append(FormBuilder.checkbox({
            text: 'Show alliance names on island view.',
            id: 'assistant_alliance_names',
            name: 'assistant_alliance_names',
            checked: this.settings.alliance_name
        }))

        .append(FormBuilder.selectBox({
            id: 'assistant_auto_relogin',
            name: 'assistant_auto_relogin',
            label: 'Auto re-login: ',
            styles: 'width: 120px;',
            value: this.settings.auto_relogin,
            options: [
                { value: '0', name: 'Disabled' },
                { value: '120', name: 'After 2 minutes' },
                { value: '300', name: 'After 5 minutes' },
                { value: '600', name: 'After 10 minutes' },
                { value: '900', name: 'After 15 minutes' }
            ]
        }))

        .append(FormBuilder.button({
            name: DM.getl10n('notes').btn_save,
            style: 'top: 120px;'
        }).on('click', function () {
            var data = $('#Assistant_settings').serializeObject();

            Assistant.settings.town_names = data.assistant_town_names !== undefined;
            Assistant.settings.player_name = data.assistant_player_names !== undefined;
            Assistant.settings.alliance_name = data.assistant_alliance_names !== undefined;
            Assistant.settings.auto_relogin = parseInt(data.assistant_auto_relogin);

            localStorage.setItem("Assistant.Settings", JSON.stringify(Assistant.settings));

            HumanMessage.success('The settings were saved!');
            Assistant.initSettings();
        }));
    }
};
