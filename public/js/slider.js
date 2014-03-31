define(["backbone", "jquery", "underscore", "jquery.bootstrap"], function(Backbone, $, _) {
    return Backbone.View.extend({
        el: '#slider',

        events: {
            'change input': 'changePayment',
            'input input': 'dragPayment'
        },

        initialize: function(loans, vent) {
            this.vent = vent;
            loans.on('add', this.updateConstraints, this);
        },

        updateConstraints: function(loan, loans) {
            var min = loans.getMinimumPayment(),
                input = this.$el.find('input');

            //The range control only handles whole numbers, so round these values up to the nearest integer.
            input.attr('min', min);
            input.attr('max', min * 20); //Is anyone paying more than 20x min?
            input.val(min);

            this.$el.removeClass('hidden');
        },

        changePayment: function(e) {
            //could change on drop if too slow.
        },

        dragPayment: function(e) {
            var paymentAmount = $(e.currentTarget).val();

            this.vent.trigger('update-payment', parseInt(paymentAmount, 10));
        },
    });
});