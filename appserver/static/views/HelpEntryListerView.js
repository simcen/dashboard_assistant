require.config({
    paths: {
        datatables: "../app/dashboard_assistant/contrib/DataTables/js/jquery.dataTables",
        bootstrapDataTables: "../app/dashboard_assistant/contrib/DataTables/js/dataTables.bootstrap",
        text: "../app/dashboard_assistant/contrib/text",
    },
    shim: {
        'bootstrapDataTables': {
            deps: ['datatables']
        }
    }
});

define(['underscore',
        'splunkjs/mvc',
        'jquery',
        'splunkjs/mvc/simplesplunkview',
        'text!../app/dashboard_assistant/templates/HelpEntryList.html',
        "datatables",
        "bootstrapDataTables",
        'bootstrap.modal',
        'bootstrap.tab',
        "css!../app/dashboard_assistant/contrib/DataTables/css/jquery.dataTables.css",
        "css!../app/dashboard_assistant/contrib/DataTables/css/dataTables.bootstrap.css",
        "css!../app/alert_manager/SplunkDataTables.css"],
function(_, mvc, $, SimpleSplunkView, HelpEntryListTemplate, dataTables) {
    
    // Define the custom view class
    var HelpEntryListerView = SimpleSplunkView.extend({
        className: "HelpEntryListerView",

        events: {
            "click .edit_help_entry": "editHelpEntry",
            "click .add_help_entry": "addHelpEntry",
            "click .save_help_entry": "doEditHelpEntry",
            "click .enable_help_entry": "toggleHelpEntry",
            "click .disable_help_entry": "toggleHelpEntry",
            "click .remove_help_entry": "removeHelpEntry",
            "shown .help_entry-edit-modal" : "focusView"
        },

        defaults: {
            collection_owner: "nobody",
            include_filter: null,
            allow_editing_collection: true
        },

        initialize: function() {
            this.options = _.extend({}, this.defaults, this.options);

            this.include_filter = this.options.include_filter;
            this.allow_editing_collection = this.options.allow_editing_collection;

            this.collection_owner = this.options.collection_owner;
            this.app = this.options.app;
            this.collection = this.options.collection;

            this.help_entries = null;
            this.unfiltered_help_entries = null;

        },

        /**
         * Fixes an issue where clicking an input loses focus instantly due to a problem in Bootstrap.
         * 
         * http://stackoverflow.com/questions/11634809/twitter-bootstrap-focus-on-textarea-inside-a-modal-on-click
         */
        focusView: function(){
            $('#help_entry-text', this.$el).focus();
        },


        showEditHelpEntryModal: function(key){
            
            // Get the managed lookup info
            var help_entry = this.getHelpEntry(key);
            
            // Populate the form
            this.populateFormWithManagedLookup(help_entry);
            
            // Show the modal
            $('.help_entry-edit-modal', this.$el).modal();
        },

        editHelpEntry: function(event){
            var key = $(event.target).data('key');
            
            this.showEditHelpEntryModal(key);
        },

        populateFormWithManagedLookup: function(help_entry, only_if_blank){
            
            if( typeof only_if_blank === 'undefined' ){
                only_if_blank = false;
            }
                        
            if( $('#help_entry-app', this.$el).val().length === 0 || !only_if_blank){
                $('#help_entry-app', this.$el).val(help_entry.app);
            }

            if( $('#help_entry-view', this.$el).val().length === 0 || !only_if_blank){
                $('#help_entry-view', this.$el).val(help_entry.view);
            }

            if( $('#help_entry-panel', this.$el).val().length === 0 || !only_if_blank){
                $('#help_entry-panel', this.$el).val(help_entry.panel);
            }                        
            
            if( help_entry.classification !== null && $('#help_entry-classification', this.$el).val() !== help_entry.classification){
                $('#help_entry-classification', this.$el).val(help_entry.classification);
            }

            if( $('#help_entry-text', this.$el).val().length === 0 || !only_if_blank){
                $('#help_entry-text', this.$el).val(help_entry.text);
            }

            if( $('#help_entry-app_version', this.$el).val().length === 0 || !only_if_blank){
                $('#help_entry-app_version', this.$el).val(help_entry.app_version);
            } 

                        
            $('#help_entry-key', this.$el).val(help_entry._key);
            
            this.populated_form_automatically = true;
        },

        addHelpEntry: function(event){
            
            // Clear the form
            this.clearForm();
            
            // Show the modal
            $('.help_entry-edit-modal', this.$el).modal();
        },

        clearForm: function(){
            $('#help_entry-app', this.$el).val("");
            $('#help_entry-view', this.$el).val("");
            $('#help_entry-panel', this.$el).val("");
            $('#help_entry-classification', this.$el).val("none");
            $('#help_entry-text', this.$el).val("");
            $('#help_entry-app_version', this.$el).val("");
            $('#help_entry-key', this.$el).val("");
        },

        doEditHelpEntry: function(){
            
            // See if the input is valid
            /*if( !this.validate() ){
                return false;
            }*/
            
            // Get the key of the item being edited
            var key = $('#help_entry-key', this.$el).val(); // This will be empty for new items
            
            // Determine if this is a new entry
            var is_new = false;
            
            if(key === ""){
                is_new = true;
            }
            
           
            // Get the managed lookup info (if not new)
            var help_entry = {};
            
            if(!is_new){
                help_entry = this.getHelpEntry(key);
            }
            
            // Update the attributes
            help_entry.app = $('#help_entry-app', this.$el).val();
            help_entry.view = $('#help_entry-view', this.$el).val();
            help_entry.panel = $('#help_entry-panel', this.$el).val();
            help_entry.classification = $('#help_entry-classification', this.$el).val();
            help_entry.text = $('#help_entry-text', this.$el).val();
            help_entry.app_version = $('#help_entry-app_version', this.$el).val();
            
            if(is_new){
                help_entry.disabled = false;
            }
            
            this.doUpdateToHelpEntry(help_entry, key);
            return true;
        },

        toggleHelpEntry: function(event){
            var key = $(event.target).data('key');
            var disabled = $(event.target).data('disabled');
            
            help_entry = this.getHelpEntry(key);
            help_entry.disabled = disabled;
            this.doUpdateToHelpEntry(help_entry, key);
        },

        removeHelpEntry: function (event) {           
            var key = $(event.target).data('key');
            help_entry = this.getHelpEntry(key);

            if (confirm('Are you sure you want to delete help entry for panel "'+ help_entry.panel +'" of view "'+ help_entry.view +'" in app "' + help_entry.app + '"?')) {

                var uri = null;
                
                // If a key was provided, filter down to it
                if(key === undefined || key === "" || key === null){
                    alert("Unknown error. Please try again.");
                    return false;
                }
                else{
                    uri = Splunk.util.make_url("/splunkd/__raw/servicesNS/" + this.collection_owner + "/" + this.app + "/storage/collections/data/" + this.collection + "/" + key + "?output_mode=json");
                }

                jQuery.ajax({
                    url: uri,
                    type: 'DELETE',
                    async: false,
                    contentType: "application/json",
                    error: function(jqXHR, textStatus, errorThrown ){
                        if( jqXHR.status === 403 ){
                            alert("You do not have permission to update help entries.");
                        }
                        else{
                            alert("The help entry could not be modified: \n\n" + errorThrown);
                        }
                    },
                    success: function() {
                        this.renderHelpEntryList();
                    }.bind(this)
                });
                
                return true;         
            } else {
                return false;
            }
        },

        doUpdateToHelpEntry: function(help_entry, key){
            
            var uri = null;
            
            // If a key was provided, filter down to it
            if(key === undefined || key === "" || key === null){
                uri = Splunk.util.make_url("/splunkd/__raw/servicesNS/" + this.collection_owner + "/" + this.app + "/storage/collections/data/" + this.collection + "?output_mode=json");
            }
            else{
                uri = Splunk.util.make_url("/splunkd/__raw/servicesNS/" + this.collection_owner + "/" + this.app + "/storage/collections/data/" + this.collection + "/" + key + "?output_mode=json");
            }
            
            jQuery.ajax({
                url: uri,
                type: 'POST',
                async: false,
                contentType: "application/json",
                data: JSON.stringify(help_entry),
                error: function(jqXHR, textStatus, errorThrown ){
                    if( jqXHR.status === 403 ){
                        alert("You do not have permission to update help entries.");
                    }
                    else{
                        alert("The help entry could not be modified: \n\n" + errorThrown);
                    }
                },
                success: function() {
                    this.renderHelpEntryList();
                    $('.help_entry-edit-modal', this.$el).modal('hide');
                }.bind(this)
            });
            
            return true;
        },

        getHelpEntries: function(force_reload){

            // Default the arguments
            if(typeof force_reload === "undefined"){
                force_reload = false;
            }
            
            // Return the existing list if we can
            if(this.help_entry !== null && !force_reload){
                return this.help_entry;
            }
            
            this.help_entry = this.getHelpEntry("");
            console.log("help_entry", this.help_entry);
            return this.help_entry;

        },

        getHelpEntry: function(key){
            
            var uri = Splunk.util.make_url("/splunkd/__raw/servicesNS/" + this.collection_owner + "/" + this.app + "/storage/collections/data/" + this.collection + "/" + key + "?output_mode=json");
            var help_entry = null;
            
            jQuery.ajax({
                url:     uri,
                type:    'GET',
                async:   false,
                success: function(results) {
                    
                    // Use the include filter function to prune items that should not be included (if necessary)
                    if( key === "" && this.include_filter !== null ){
                        help_entry = [];
                        
                        // Store the unfiltered list of lookups
                        this.unfiltered_help_entry = results;
                        
                        for( var c = 0; c < results.length; c++){
                            if( this.include_filter(results[c]) ){
                                help_entry.push(results[c]);
                            }
                        }
                    }
                    
                    // Just pass the lookups if no filter is necessary.
                    else{
                        help_entry = results;
                    }
                }.bind(this)
            });
            
            return help_entry;
        },

        renderHelpEntryList: function(){
            var help_entries = this.getHelpEntries(true);

            //var insufficient_permissions = !this.hasCapability('edit_lookups');
            var insufficient_permissions = false;

            // Template from el
            var lookup_list_template = $('#help_entry-list-template', this.$el).text();

            $('#table-container', this.$el).html( _.template(lookup_list_template,{ 
                help_entries: help_entries,
                insufficient_permissions: insufficient_permissions,
                allow_editing_collection: this.allow_editing_collection
            }));


            var columnMetaData = [
                                  null,                   // App
                                  null,                   // View
                                  null,                   // Panel
                                  null,                   // Classification
                                  null,                   // App Version
                                  { "bSortable": false }  // Actions
                                ];
            
            if(insufficient_permissions){
                columnMetaData = [
                                  null,                   // App
                                  null,                   // View
                                  null,                   // Panel
                                  null,                   // Classification
                                  null,                   // App Version
                                    ];
            }

            $('#table', this.$el).dataTable( {
                "iDisplayLength": 25,
                "bLengthChange": false,
                "bStateSave": true,
                "aaSorting": [[ 0, "asc" ]],
                "aoColumns": columnMetaData
              } );
            
            // Make the tabs into tabs
            $('#tabs', this.$el).tab();

        },

        render: function() {
            this.$el.html(HelpEntryListTemplate);
            this.renderHelpEntryList();
        },

    });
    return HelpEntryListerView;
});        