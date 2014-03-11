define(["backbone", "jquery", "underscore"], function(Backbone, $, _) {
    return Backbone.Model.extend({
        validate: function(attrs) {
            if(attrs.rate > 100) {
                 //They could technically have an interest rate > 100%... sad
                return "The rate must be between 0 and 100";
            }

            if(attrs.rate <= 0) {
                return "A rate less than or equal to zero is invalid";
            }

            if(attrs.balance <= 0) {
                return "A balance less than or equal to zero is invalid";
            }

            if(attrs.minPayment <= 0) {
                return "A minimum payment less than or equal to zero is invalid";
            }

            //Reduce the rate to the correct value
            if(attrs.rate > 1) {
                //They could technically have an interest rate < 1%... jealous.
                this.set('rate', attrs.rate / 100, {silent: true});
            }
            this.set('balance', parseInt(attrs.balance, 10), {silent: true});
            this.set('minPayment', parseInt(attrs.minPayment, 10), {silent: true});
        }
    });
});