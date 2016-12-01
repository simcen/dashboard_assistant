function getStaticURL() {
    var scripts = document.getElementsByTagName('script');
    var thisScript = scripts[scripts.length - 1];
    var path = thisScript.src;
    var last = path.split('/');
    var static_path = last.slice(0, last.length - 2).join('/');
    return static_path;
}

require.config({
    paths: {
        "dashboard_app": getStaticURL() + '/dashboard_assistant'
    }
});
require([
    "splunkjs/mvc",
    "splunkjs/mvc/utils",
    "underscore",
    "jquery",
    "splunkjs/mvc/simplexml/ready!",
    "dashboard_app/contrib/jbox0.3.2/jBox",
    "css!dashboard_app/contrib/jbox0.3.2/jBox"
], function (mvc,
             utils,
             _,
             $,
             ready) {


    var DashboardPanel = require('splunkjs/mvc/simplexml/dashboard/panel');
    var jBox = require("dashboard_app/contrib/jbox0.3.2/jBox");

    // Generate description entry
    descEl = $(".description");
    if (descEl.html() != "") {
        descEl.append("<br />");
    }
    descEl.css('display', 'block');

    // Properties
    var app = utils.getCurrentApp();
    var view = utils.getPageInfo().page;

    var owner = 'unknown';

    // Get owner details
    uri = Splunk.util.make_url("/splunkd/__raw/servicesNS/-/" + app + "/data/ui/views/" + view + "?output_mode=json");
    $.get(uri, function (data) {
        owner = data["entry"][0]["acl"]["owner"];

        // Get user list
        var url = Splunk.util.make_url('/splunkd/__raw//services/admin/users/' + owner + '?output_mode=json');
        $.get(url, function (data) {
            realname = data["entry"][0]["content"]["realname"];
            email = data["entry"][0]["content"]["email"];
            if (realname != "" && email != "") {
                descEl.append('<div style="width: 50%"><div style="width: 30%; float: left"><b>Owner:</b></div><div><a href="mailto:' + email + '?subject=Splunk%20Dashboard%3A%20' + view + '%20in%20app%20' + app + '">' + realname + ' (' + owner + ')</a></div></div>');
            } else if (realname != "" && email == "") {
                descEl.append('<div style="width: 50%"><div style="width: 30%; float: left"><b>Owner:</b></div><div>' + realname + ' (' + owner + ')</div></div>');
            } else if (email != "" && realname == "") {
                descEl.append('<div style="width: 50%"><div style="width: 30%; float: left"><b>Owner:</b></div><div><a href="mailto:' + email + '?subject=Splunk%20Dashboard%3A%20' + view + '%20in%20app%20' + app + '">' + owner + '</a></div></div>');
            } else {
                descEl.append('<div style="width: 50%"><div style="width: 30%; float: left"><b>Owner:</b></div><div>' + owner + '</div></div>');
            }
        }).fail(function () {
            descEl.append('<div style="width: 50%"><div style="width: 30%; float: left"><b>Owner:</b></div><div>' + owner + '</div></div>');
        });


    });


    // Modal helper
    function createModal(panel, title, message) {
        var edit_panel = '' +
            '<div class="custom-modal modal modal-wide hide fade" id="' + panel + '">' +
            '    <div class="modal-content">' +
            '      <div class="modal-header">' +
            '        <button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
            '        <h4 class="modal-title" id="exampleModalLabel">' + title + '</h4>' +
            '      </div>' +
            '      <div class="modal-body modal-body-scrolling">' +
            '        ' + message +
            '      </div>' +
            '      <div class="modal-footer">' +
            '        <button class="btn" data-dismiss="modal">Close</button>' +
            '      </div>' +
            '    </div>' +
            '</div>';
        $('body').prepend(edit_panel);
        return true;
    }

    // Get help entries
    uri = Splunk.util.make_url("/splunkd/__raw/servicesNS/-/system/apps/local/" + app + "?output_mode=json");
    $.get(uri, function (data) {
        var app_version = data["entry"][0]["content"]["version"];
        var help_entries = false;
        var query = '{"app": "' + app + '", "view": "' + view + '", "disabled": false, "$or": [{ "app_version": "any"}, { "app_version": "' + app_version + '" }] }';
        query = '{"app": "' + app + '", "view": "' + view + '", "disabled": false}';
        var encoded_query = encodeURIComponent(query);
        var uri = Splunk.util.make_url("/splunkd/__raw/servicesNS/nobody/dashboard_assistant/storage/collections/data/help_entries?query=" + encoded_query + "&output_mode=json");

        jQuery.ajax({
            url: uri,
            type: 'GET',
            error: function (jqXHR, textStatus, errorThrown) {
                if (jqXHR.status === 403) {
                    alert("You do not have permission to read help entries.");
                }
                else {
                    alert("Unknown error: \n\n" + errorThrown);
                }
            },
            success: function (results) {
                help_entries = results;


                // Add modal to each panel in current view
                _(mvc.Components.toJSON()).chain().filter(function (el) {
                    return el instanceof DashboardPanel;
                }).each(function (panel) {

                    var headerEl = $(panel.el).find(".panel-title");
                    headerEl.css('padding-right', '9px');

                    var panel_help_entry = _.filter(help_entries, function (item) {
                        return item.panel == panel.id
                    });
                    var editorUrl = Splunk.util.make_url('/app/dashboard_assistant/help_entry_editor');
                    var message = '<i>For this panel (ID: ' + panel.id + ') doesn\'t exist any active help entry matching the app version ' + app_version + '.</i><br /><a href="' + editorUrl + '">Manage Help Entries</a></i>';
                    if (panel_help_entry.length > 0) {
                        message = panel_help_entry[0].text;


                        var title = headerEl.html();
                        createModal(panel.id, title, message);

                        var helper_id = 'helper-' + panel.id;

                        var helper_icon =  $('<span style="padding-left: 10px;"><a href="#' + panel.id + '" class="icon-info" style="text-decoration: none" id="' + helper_id + '"> </a></span>');

                        if (panel_help_entry.length > 0 && panel_help_entry[0].classification != "none" && panel_help_entry[0].classification != "") {
                            var helper_icon =  $('<span style="padding-left: 10px;"><a href="#' + panel.id + '" class="icon-info" style="text-decoration: none" id="' + helper_id + '"> <span class="classification-'+ panel_help_entry[0].classification +'" style="margin-right: 6px">'+ panel_help_entry[0].classification + '</span> </a></span>');

                            //var helper_icon =  $('<div style="float: right"><span class="classification-'+ panel_help_entry[0].classification +'" style="margin-right: 6px">'+ panel_help_entry[0].classification + '</span> <a data-toggle="modal" href="#'+ panel.id +'" class="icon-info" style="text-decoration: none"> </a></div>');
                        }
                        //var helper_icon = headerEl.append('<span style="padding-left: 10px;"><a href="#' + panel.id + '" class="icon-info" style="text-decoration: none" id="' + helper_id + '"> </a></span>');

                        headerEl.append(helper_icon);
                        var tooltip = $('#' + helper_id).jBox('Tooltip', {
                            target: $(headerEl),
                            content: message,
                            delayClose: 400
                        });
                    }


                });

                // Update view description
                var view_help_entry = _.filter(help_entries, function (item) {
                    return item.panel == view
                });
                if (view_help_entry.length > 0) {
                    descEl.append('<div style="width: 50%"><div style="width: 30%; float: left"><b>Classification:</b></div><div><span class="classification-' + view_help_entry[0].classification + '">' + view_help_entry[0].classification + '</span></div></div>');
                    if (view_help_entry[0].text != "") {
                        descEl.append('<div style="width: 50%"><div style="width: 30%; float: left"><b>Info:</b></div><div style="display: table-cell;">' + view_help_entry[0].text + '</div></div>');
                    }
                }


            }.bind(this)
        });
    });

});    
