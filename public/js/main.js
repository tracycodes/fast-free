require.config({
    paths: {
        "jquery": "../components/jquery/jquery.min",
        "jquery.bootstrap": "../components/bootstrap/dist/js/bootstrap.min",
        "underscore": "../components/underscore/underscore",
        "backbone": "../components/backbone/backbone",
        //"d3": "../components/d3/d3.min.js",
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

require(["loan-entry", "chart", "loans", "jquery", "jquery.bootstrap"], function (LoanEntry, Chart, Loans, $) {
    var loans = new Loans();

    new LoanEntry(loans);
    new Chart(loans);
});
