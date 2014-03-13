define(["backbone", "jquery", "underscore", "d3"], function(Backbone, $, _, d3) {
    return Backbone.View.extend({
        el: '#chart',

        initialize: function(loans) {
            this.loans = loans;
            this.loans.on('add', this.updateChart, this);
        },

        updateChart: function() {
            var data = this.loans.getChartData();

            var totalWidth = this.$el.width(),
                totalHeight = this.$el.height();

            //Need actual coordinates to calculate this data. Use underscore for transformations.
            var years = _.keys(data),
                yearWidth = totalWidth / years.length;

            //Draw the axes (need to rewrite to use d3 new axis feature)
            d3.select(this.el)
                .append('line')
                .attr('x1', 0)
                .attr('y1', totalHeight)
                .attr('x2', totalWidth)
                .attr('y2', totalHeight)
                .attr('class', 'axis');

            d3.select(this.el)
                .append('line')
                .attr('x1', 0)
                .attr('y1', totalHeight)
                .attr('x2', 0)
                .attr('y2', 0)
                .attr('class', 'axis');

        }
    });
});