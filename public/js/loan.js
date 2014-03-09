define(["backbone", "jquery", "underscore"], function(Backbone, $, _) {
    return Backbone.Model.extend({
        //TSL - convert to validate method
        validateRate: function(rate) {
            if(rate > 1) {
                //assume they've entered it as a percentage e.g. 5.5
                return rate / 100;
            }
            else {
                //assume they've entered it as a decimal (e.g. .055)
                return rate;
            }
        }
    });
});