/**
 * jQuery Alert Dialogs Plugin
 *
 * Usage:
 *      jAlert( message, [title, callback] )
 *      jConfirm( message, [title, callback] )
 *      jPrompt( message, [value, title, callback] )
 *      jOptions( message, [title, options, callback] )
 *
 * History:
 *      2.0.0   - New version with new options by Vector, now this plugin is SemVer(http://semver.org) like
 *      1.1     -
 *      1.01    - Fixed bug where unbinding would destroy all resize events
 *      1.00    - Released (29 December 2008)
 *
 * @author Cory S.N. LaViska
 * @author Joubert <eu+github@redrat.com.br>
 * @copyright Copyright (c) 2008-2016 A Beautiful Site
 * @copyright Copyright (c) 2016 Vector Internet Business and jQuery Alert Dialogs contributors
 * @license: MIT
 * @require: jQuery 1.6 or later
 * http://abeautifulsite.net/
 * http://www.vectornet.com.br
 * https://github.com/vectornet/jquery-alerts
 */
(function ($) {
    $.alerts = {
        /**
         * These properties can be read/written by accessing $.alerts.propertyName from your scripts at any time
         */

        verticalOffset: -75,                // vertical offset of the dialog from center screen, in pixels
        horizontalOffset: 0,                // horizontal offset of the dialog from center screen, in pixels/
        repositionOnResize: true,           // re-centers the dialog on window resize
        overlayOpacity: 0.7,                // transparency level of overlay
        overlayColor: '#000',               // base color of overlay
        draggable: true,                    // make the dialogs draggable (requires UI Draggables plugin)
        okButton: '&nbsp;OK&nbsp;',         // text for the OK button
        cancelButton: '&nbsp;Cancel&nbsp;', // text for the Cancel button
        dialogClass: null,                  // if specified, this class will be applied to all dialogs
        alertDefaultTitle: 'Alert',         // Default alert title
        confirmDefaultTitle: 'Confirm',     // Default confirm title
        questionDefaultTitle: 'Question',   // Default question title
        promptDefaultTitle: 'Prompt',       // Default prompt title
        optionsDefaultTitle: 'Options',     // Default options title

        /**
         * Public methods
         */

        /**
         * Define a Dialog as alert
         *
         * @param {string} message Dialog message
         * @param {string} title Dialog title
         * @param {function} callback Function to receive dialog response
         * @returns {void}
         */
        alert: function (message, title, callback) {
            if (title == null) {
                title = $.alerts.alertDefaultTitle;
            }
            $.alerts._show(title, message, null, 'alert', null, function (result) {
                if (callback) {
                    callback(result);
                }
            });
        },

        /**
         * Define a Dialog as confirm
         *
         * @param {string} message Dialog message
         * @param {string} title Dialog title
         * @param {function} callback Function to receive dialog response
         * @returns {void}
         */
        confirm: function (message, title, callback) {
            if (title == null) {
                title = $.alerts.confirmDefaultTitle;
            }
            $.alerts._show(title, message, null, 'confirm', null, function (result) {
                if (callback) {
                    callback(result);
                }
            });
        },

        /**
         * Define a Dialog as custom question
         *
         * @param {string} message Dialog message
         * @param {string} value Default input value
         * @param {string} text_ok Custom Ok button text
         * @param {string} text_cancel Custom Cancel button text
         * @param {function} callback Function to receive dialog response
         * @returns {void}
         */
        question: function (message, title, text_ok, text_cancel, callback) {
            $.alerts.okButton = (text_ok == null ? $.alerts.okButton : text_ok);
            $.alerts.cancelButton = (text_cancel == null ? $.alerts.cancelButton : text_cancel);
            if(title == null) {
                title = $.alerts.questionDefaultTitle;
            }
            $.alerts._show(title, message, null, 'confirm', null, function(result) {
                if (callback) {
                    callback(result);
                }
            });
        },

        /**
         * Define a Dialog as prompt
         *
         * @param {string} message Dialog message
         * @param {string} value Default input value
         * @param {string} title Dialog title
         * @param {function} callback Function to receive dialog response
         * @returns {void}
         */
        prompt: function (message, value, title, callback) {
            if (title == null) {
                title = $.alerts.promptDefaultTitle;
            }
            $.alerts._show(title, message, value, 'prompt', null, function (result) {
                if (callback) {
                    callback(result);
                }
            });
        },

        /**
         * Define a Dialog as custom options
         *
         * @param {string} message Dialog message
         * @param {string} title Dialog title
         * @param {Object} options Custom options, as describle below:
         * [
         *      {'value': 'Your custom value'},
         *      {'value': 'Your custom value', 'text': 'Custom text to display on button'},
         * ]
         * @param {function} callback Function to receive dialog response
         * @returns {void}
         */
        options: function (message, title, options, callback) {
            if (title == null) {
                title = $.alerts.optionsDefaultTitle;
            }
            $.alerts._show(title, message, null, 'confirm', options, function (result) {
                if (callback) {
                    callback(result);
                }
            });
        },

        /**
         * Private methods
         */

         /**
          * Build html dialog with specific options
          *
          * @param {string} title Dialog title
          * @param {string} msg Dialog message
          * @param {string} value Default input value
          * @param {string} type Dialog type
          * @param {Object} options Custom options, as describle below:
          * [
          *      {'value': 'Your custom value'},
          *      {'value': 'Your custom value', 'text': 'Custom text to display on button'},
          * ]
          * @param {function} callback Function to receive dialog response
          * @returns {void}
          */
        _show: function (title, msg, value, type, options, callback) {
            $.alerts._hide();
            $.alerts._overlay('show');

            $("body").append(
                '<div id="popup_container">' +
                    '<h1 id="popup_title"></h1>' +
                    '<div id="popup_content">' +
                        '<div id="popup_message"></div>' +
                    '</div>' +
                '</div>'
            );

            if ($.alerts.dialogClass) {
                $("#popup_container").addClass($.alerts.dialogClass);
            }

            $("#popup_container").css({
                position: 'fixed',
                zIndex: 99999,
                padding: 0,
                margin: 0
            });

            $("#popup_title").text(title);
            $("#popup_content").addClass(type);
            $("#popup_message").text(msg);
            $("#popup_message").html(
                $("#popup_message").text().replace(/\n/g, '<br />')
            );

            $("#popup_container").css({
                minWidth: $("#popup_container").outerWidth(),
                maxWidth: $("#popup_container").outerWidth()
            });

            $.alerts._reposition();
            $.alerts._maintainPosition(true);

            switch (type) {
                case 'alert':
                    $("#popup_message").after(
                        '<div id="popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /></div>'
                    );
                    $("#popup_ok").click(function () {
                        $.alerts._hide();
                        callback(true);
                    });
                    $("#popup_ok").focus().keypress( function (e) {
                        if ( e.keyCode == 13 || e.keyCode == 27 ) {
                            $("#popup_ok").trigger('click');
                        }
                    });
                    break;
                case 'confirm':
                    if (options instanceof Object && options.length > 0) {
                        var buttons = '';
                        for (i = 0; i < options.length; i++) {
                            buttons += '<input type="button" class="popup_options_custom" value="'
                                + (options[i].text ? options[i].text : options[i].value) +
                                '" id="popup_option_' + i + '" data-value="' + options[i].value + '" />'
                            ;
                        }
                        $("#popup_message").after(
                            '<div id="popup_panel">' + buttons + '</div>'
                        );

                        $('.popup_options_custom').bind('click', function () {
                            $.alerts._hide();
                            if (callback) {
                                callback($(this).data('value'));
                            }
                        });
                    } else {
                        $("#popup_message").after(
                            '<div id="popup_panel"><input type="button" value="' + $.alerts.okButton + '" id="popup_ok" /> <input type="button" value="' + $.alerts.cancelButton + '" id="popup_cancel" /></div>'
                        );
                        $("#popup_ok").bind('click', function () {
                            $.alerts._hide();
                            if (callback) {
                                callback(true);
                            }
                        });
                        $("#popup_cancel").bind('click', function () {
                            $.alerts._hide();
                            if (callback) {
                                callback(false);
                            }
                        });
                        $("#popup_ok").focus();
                        $("#popup_ok, #popup_cancel").keypress(function (e) {
                            if (e.keyCode == 13) {
                                $("#popup_ok").trigger('click');
                            }
                            if (e.keyCode == 27) {
                                $("#popup_cancel").trigger('click');
                            }
                        });
                    }
                    break;
                case 'prompt':
                    $("#popup_message")
                        .append('<br /><input type="text" size="30" id="popup_prompt" />')
                        .after(
                            '<div id="popup_panel"><input type="button" value="' +
                            $.alerts.okButton +
                            '" id="popup_ok" /> <input type="button" value="' +
                            $.alerts.cancelButton + '" id="popup_cancel" /></div>'
                        )
                    ;
                    $("#popup_prompt").width($("#popup_message").width());
                    $("#popup_ok").click(function () {
                        var val = $("#popup_prompt").val();
                        $.alerts._hide();
                        if (callback) {
                            callback(val);
                        }
                    });
                    $("#popup_cancel").click(function () {
                        $.alerts._hide();
                        if (callback) {
                            callback(null);
                        }
                    });
                    $("#popup_prompt, #popup_ok, #popup_cancel").keypress(function (e) {
                        if (e.keyCode == 13) {
                            $("#popup_ok").trigger('click');
                        }
                        if (e.keyCode == 27) {
                            $("#popup_cancel").trigger('click');
                        }
                    });
                    if (value) {
                        $("#popup_prompt").val(value);
                    }
                    $("#popup_prompt").focus().select();
                    break;
            }

            // Make draggable
            if ($.alerts.draggable) {
                try {
                    $("#popup_container").draggable({ handle: $("#popup_title") });
                    $("#popup_title").css({ cursor: 'move' });
                } catch(e) {
                    /* requires jQuery UI draggables */
                }
            }
        },//_show

        /**
         * Hide dialog
         *
         * @returns {void}
         */
        _hide: function () {
            $("#popup_container").remove();
            $.alerts._overlay('hide');
            $.alerts._maintainPosition(false);
        },//_hide

        _overlay: function (status) {
            switch (status) {
                case 'show':
                    $.alerts._overlay('hide');
                    $("body").append('<div id="popup_overlay"></div>');
                    $("#popup_overlay").css({
                        position: 'absolute',
                        zIndex: 99998,
                        top: '0px',
                        left: '0px',
                        width: '100%',
                        height: $(document).height(),
                        background: $.alerts.overlayColor,
                        opacity: $.alerts.overlayOpacity
                    });
                    break;
                case 'hide':
                    $("#popup_overlay").remove();
                    break;
            }
        },//_overlay

        /**
         * Reposition dialog on screen
         *
         * @returns {void}
         */
        _reposition: function () {
            var top = (($(window).height() / 2) - ($("#popup_container").outerHeight() / 2)) + $.alerts.verticalOffset;
            var left = (($(window).width() / 2) - ($("#popup_container").outerWidth() / 2)) + $.alerts.horizontalOffset;
            if (top < 0) {
                top = 0;
            }
            if (left < 0) {
                left = 0;
            }

            $("#popup_container").css({
                top: top + 'px',
                left: left + 'px'
            });
            $("#popup_overlay").height($(document).height());
        },//_reposition

        /**
         * Fixes dialog on screen
         *
         * @returns {void}
         */
        _maintainPosition: function (status) {
            if ($.alerts.repositionOnResize) {
                switch (status) {
                    case true:
                        $(window).bind('resize', $.alerts._reposition);
                        break;
                    case false:
                        $(window).unbind('resize', $.alerts._reposition);
                        break;
                }
            }
        }//_maintainPosition
    }//$.alerts

    /**
     * Shortuct functions
     */

    /**
     * @see $.alerts.alert
     */
    jAlert = function (message, title, callback) {
        $.alerts.alert(message, title, callback);
    }

    /**
     * @see $.alerts.confirm
     */
    jConfirm = function (message, title, callback) {
        $.alerts.confirm(message, title, callback);
    };

    /**
     * @see $.alerts.question
     */
    jQuestion = function(message, title, yesbtn, nobtn, callback) {
        $.alerts.question(message, title, yesbtn, nobtn, callback);
    };

    /**
     * @see $.alerts.prompt
     */
    jPrompt = function (message, value, title, callback) {
        $.alerts.prompt(message, value, title, callback);
    };

    /**
     * @see $.alerts.options
     */
    jOptions = function (message, title, options, callback) {
        $.alerts.options(message, title, options, callback);
    };
})(jQuery);
