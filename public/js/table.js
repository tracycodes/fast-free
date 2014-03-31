define(["backbone", "jquery", "underscore", "jquery.bootstrap"], function(Backbone, $, _) {
    return Backbone.View.extend({
        el: '#loan-list',

        loanTemplate: _.template("<tr><td><%= balance %></td><td><%= rate %></td><td><%= minPayment %></td></tr>"),

        initialize: function(loans) {
            loans.on('add', this.addLoan, this);
        },

        addLoan: function(loan) {
            this.$el.removeClass('hidden');
            this.$el.find('tbody').append(this.loanTemplate(loan.attributes));
        },
    });
});