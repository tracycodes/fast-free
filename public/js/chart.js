define(["backbone", "jquery", "underscore", "d3"], function(Backbone, $, _, d3) {
    return Backbone.View.extend({
        el: '#chart',

        initialize: function(loans) {
            this.loans = loans;
            this.loans.on('add', this.updateChart, this);
        },

        updateChart: function() {
            var data = this.loans.getChartData();

        }
    });
});