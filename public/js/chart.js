define(["backbone", "jquery", "underscore"], function(Backbone, $, _) {
    return Backbone.View.extend({
        el: '#chart',

        initialize: function(loans) {
            this.loans = loans;
            this.loans.on('add', this.updateChart);
        },

        updateChart: function() {
            //var data = this.loans.getChartData();
            //render it.
        }
    });
});