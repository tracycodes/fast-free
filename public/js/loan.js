define(["backbone", "jquery", "underscore"], function(Backbone, $, _) {
    return Backbone.Model.extend({
        getDaysInMonth: function(month, year) {
            return new Date(year, month, 0).getDate();
        },

        getMonthlyInterest: function(year, month, balance, rate) {
            return (balance * rate / 365.25) * this.getDaysInMonth(year, month);
        },

        getMonthlyLoanBalance: function(year, month, balance, rate, payment) {
            return balance + this.getMonthlyInterest(year, month, balance, rate) - payment;
        },

        validate: function(attrs) {
            if(attrs.rate > 100) {
                 //They could technically have an interest rate > 100%... sad
                return "The rate must be between 0 and 100";
            }

            if(attrs.rate <= 0) {
                return "A rate less than or equal to zero is invalid";
            }

            var balance = parseInt(attrs.balance, 10);
            if(balance <= 0) {
                return "A balance less than or equal to zero is invalid";
            }

            var payment = parseInt(attrs.minPayment, 10);
            if(payment <= 0) {
                return "A minimum payment less than or equal to zero is invalid";
            }

            //Technically the rate could be less than 1%...
            var rate = attrs.rate >= 1 ? attrs.rate / 100 : attrs.rate;

            //The minimum payment must be > than any one month increase from interest. Otherwise the loan will never pay off.
            if(this.getMonthlyInterest(new Date().getFullYear(), new Date().getMonth() + 1, balance, rate) > payment) {
                return "The minimum payment is too low on this loan.";
            }

            this.set('rate', rate, {silent: true});
            this.set('balance', balance, {silent: true});
            this.set('minPayment', payment, {silent: true});
        }
    });
});