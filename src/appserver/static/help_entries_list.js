require.config({
    paths: {
        HelpEntryListerView: "../app/dashboard_assistant/views/HelpEntryListerView"
    }
});

require([
         "jquery",
         "underscore",
         "backbone",
         "HelpEntryListerView",
         "splunkjs/mvc/simplexml/ready!"
     ], function($, _, Backbone, HelpEntryListerView)
     {
         var HelpEntryListerView = new HelpEntryListerView({
        	 'el': $("#help_entries"),
        	 'app': 'dashboard_assistant',
        	 'collection' : 'help_entries',
        	 //'editor' : 'suppression_rules_edit',
        	 'allow_editing_collection': true
         });
         
         HelpEntryListerView.render();
     }
);