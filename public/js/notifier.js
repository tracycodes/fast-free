define(["backbone", "jquery", "underscore"], function(Backbone, $, _) {
    return Backbone.View.extend({
        el: '#message-container',
        template: '<p><%= message %></p>',

        reset: function() {
            this.$el.hide();
        },
        display: function(message) {
            this.$el.html(_.template(this.template, {message: message})).show();
        }
    });
});