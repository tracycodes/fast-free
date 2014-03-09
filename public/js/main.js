require.config({
    paths: {
        "jquery": "../components/jquery/jquery.min",
        "jquery.bootstrap": "../components/bootstrap/dist/js/bootstrap.min",
        "underscore": "../components/underscore/underscore",
    },
    shim: {
        "underscore": {
            exports: "_"
        },
        "jquery": {
            exports: "jQuery"
        },
        "jquery.bootstrap": {
            deps: ["jquery"]
        }
    }
});

require(["jquery", "underscore"], function ($, _) {
    var loans = [];

    var Helpers = (function() {

        function getMonthlyInterest: function(balance, rate) {
            return ((balance * rate) / 365) * 30;
        }

        function getNextMonthLoanBalance(balance, rate, payment) {
            return balance + getMonthlyInterest(balance, rate) - payment;
        }

        function interestSort(a, b) {
            if ( a.rate > b.rate) {
                return 1;
            }
            else if (b.rate > a.rate) {
                return -1;
            }
            return 0;
        }

        return {
            validateRate: function(rate) {
                if(rate > 1) {
                    //assume they've entered it as a percentage e.g. 5.5
                    return rate / 100;
                }
                else {
                    //assume they've entered it as a decimal (e.g. .055)
                    return rate;
                }
            },
            //TSL - need to add logic to handle multiple loans
            //(wisely choose to pay towards the highest interest rate loan for any money over minimum)
            crunchLoanData: function(loans, expectedPayment, interval) {
                var localLoans = [];

                _.each(loans, function(loan) {
                    localLoans.push({
                        balance: loan.balance,
                        rate: loan.rate,
                        minPayment: loa.minPayment
                    });
                });

                localLoans.sort(interestSort);

                expectedPayment = expectedPayment || _.reduce(loans, function(loan, sum) { return sum + loan.minPayment }, 0);
                interval = interval || 3;

                //If a specific loan reaches zero, then re-allocate the money from that loan to another loan.
                var remainingLoanBalance = _.reduce(loans, function(loan, sum) { return sum + loan.balance }, 0);

                //Iterate through the loans paying off their balance and removing until a data set is found
                //in which all loans are at 0.
                var loanValuesPerMonth = [];
                while(localLoans.length > 0) {

                    //Work from the lowest interest to the highest interest
                    //Reduce the monthly payment by minimum payment for each loan
                    //On the last loan, pay any extra money towards the balance.
                    //
                    //After each step through the algorithm, save off the current totals for all loans
                    //Chart that information
                    _.each(localLoans, function(loan) {
                        //TSL - handle edge case where minPayment is greater than remaining balance
                        var nextBalance = getNextMonthLoanBalance(loan.balance, loan.rate, loan.minPayment);
                        loan.balance = nextBalance;
                        if(loan.balance <= 0) {

                        }
                    });
                }

            },
            updateChart: function(loans) {
                //Produce a chart based on the loans
            }
        };
    }());

    //Need a slider widget
    //$('#minimum-payment-dial')

    $('#loan-entry button').on('click', function(e) {
        var messageContainer = $('#message-container'),
            balance = $('#loan-balance').val(),
            rate = $('#loan-rate').val(),
            minPayment = $('#loan-min-payment').val();

        messageContainer.removeClass().html('').hide();

        if(balance && rate && minPayment) {
            loans.push({
                balance: balance,
                rate: rate,
                minPayment: minPayment
            });

            //messageContainer.addClass('success-message').html('<p>Loan Added</p>').show();
            Helpers.updateChart(loans);
        }
        else {
            messageContainer.addClass('error-message').html('<p>All fields are required!</p>').show();
        }
    });

});
