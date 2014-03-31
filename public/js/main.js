require.config({
    paths: {
        "jquery": "../components/jquery/jquery.min",
        "jquery.bootstrap": "../components/bootstrap/dist/js/bootstrap.min",
        "underscore": "../components/underscore/underscore",
        "backbone": "../components/backbone/backbone",
        "d3": "../components/d3/d3.min",
    },
    shim: {
        'backbone': {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        },
        'underscore': {
            exports: '_'
        },
        'jquery.bootstrap': {
            deps: ['jquery']
        }
    }
});

require(["loan-entry", "chart", "table", "loans", "slider", "jquery", "jquery.bootstrap"], function (LoanEntry, Chart, Table, Loans, Slider, $) {
    var vent = _.extend({}, Backbone.Events),
        loans = new Loans(false, vent);

    new LoanEntry(loans);
    new Chart(loans, vent);
    new Table(loans, vent);
    new Slider(loans, vent);
});
