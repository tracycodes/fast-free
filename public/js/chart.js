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


            //Plot the data.
            var balances = [];
            _.each(data, function(months, year) {
                _.each(months, function(balance, month) {
                    balances.push(balance);
                });
            });

            var maxBalance = balances[0],
                columnWidth = totalWidth / balances.length,
                lastHeight = 0;

            _.each(balances, function(balance, index) {
                var height = totalHeight - ((balance / maxBalance) * totalHeight),
                    width = (index + 1) * columnWidth;

                d3.select(this.el)
                    .append('line')
                        .attr('x1', index * columnWidth)
                        .attr('y1', lastHeight)
                        .attr('x2', width)
                        .attr('y2', height)
                        .attr('class', 'plot');

                if(index % 12 === 0 || index === balances.length - 1) {
                    d3.select(this.el)
                        .append('circle')
                        .attr('cx', width)
                        .attr('cy', height)
                        .attr('r', 3)
                        .attr('class', 'axis');

                    d3.select(this.el)
                        .append('text')
                        .attr('x', width + 2)
                        .attr('y', height - 2)
                        .text(balance.toFixed(2));
                }

                lastHeight = height;
            }, this);
            }

    });
});