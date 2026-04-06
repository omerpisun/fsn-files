(function ($) {
    'use strict';

    if (!$) return;

    $.redirect = function (url, params, method, target) {
        method = (method && method.toUpperCase() === 'GET') ? 'GET' : 'POST';

        if (!params) {
            var parsed = $.parseUrl(url);
            url = parsed.url;
            params = parsed.params;
        }

        var form = $('<form>')
            .attr('method', method)
            .attr('action', url);

        if (target) {
            form.attr('target', target);
        }

        buildInputs(params, [], form);

        $('body').append(form);
        form[0].submit();
    };

    $.parseUrl = function (url) {
        if (!url || url.indexOf('?') === -1) {
            return {
                url: url,
                params: {}
            };
        }

        var parts = url.split('?');
        var query = parts[1];
        var pairs = query.split('&');

        var params = {};

        for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            if (pair[0]) {
                params[pair[0]] = decodeURIComponent(pair[1] || '');
            }
        }

        return {
            url: parts[0],
            params: params
        };
    };

    function createInput(name, value, path, isArray) {
        var fullName;

        if (path.length > 0) {
            fullName = path[0];

            for (var i = 1; i < path.length; i++) {
                fullName += '[' + path[i] + ']';
            }

            if (isArray) {
                fullName += '[]';
            } else {
                fullName += '[' + name + ']';
            }
        } else {
            fullName = name;
        }

        return $('<input>')
            .attr('type', 'hidden')
            .attr('name', fullName)
            .attr('value', value);
    }

    function buildInputs(obj, path, form, isArray) {
        if (!obj) return;

        for (var key in obj) {
            if (!obj.hasOwnProperty(key)) continue;

            var value = obj[key];

            if (typeof value === 'object' && value !== null) {
                var newPath = path.slice();
                newPath.push(isArray ? '' : key);

                buildInputs(value, newPath, form, Array.isArray(value));
            } else {
                form.append(createInput(key, value, path, isArray));
            }
        }
    }

})(window.jQuery || window.Zepto || window.jqlite);
