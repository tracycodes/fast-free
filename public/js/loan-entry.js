define(["loan", "notifier", "backbone", "jquery", "underscore", "jquery.bootstrap"], function(Loan, Notifier, Backbone, $, _) {
    return Backbone.View.extend({
        el: '#loan-entry',

        events: {
            "click button": "processLoan"
        },

        initialize: function(loans) {
            this.loans = loans;
            this.notifier = new Notifier();
        },

        processLoan: function() {
            this.notifier.reset();

            var loan = new Loan({validate: true});
            loan.on('invalid', function(model, message) { this.notifier.display(message); }, this);
            loan.set({
                balance: this.$el.find('#loan-balance').val(),
                rate: this.$el.find('#loan-rate').val(),
                minPayment: this.$el.find('#loan-min-payment').val()
            });

            if(loan.isValid()) {
                this.loans.add(loan);
            }
        }
    });
});