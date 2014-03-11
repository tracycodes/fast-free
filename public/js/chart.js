define(["backbone", "jquery", "underscore"], function(Backbone, $, _) {
    return Backbone.View.extend({
        el: '#chart',

        initialize: function(loans) {
            this.loans = loans;
            this.loans.on('add', this.updateChart, this);
        },

        updateChart: function() {
            var data = this.loans.getChartData();
            debugger;
            //render it.
        }
    });
});