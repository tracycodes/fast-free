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
        var months = [
            'January',
            'February',
            'March',
            'April',
            'May',
            'June',
            'July',
            'August',
            'September',
            'October',
            'November',
            'December'
        ];

        function getMonthString(value) {
            return months[value];
        }

        function getNextMonthIndex(index) {
            if(index === months.length - 1) {
                return 0;
            }
            return index + 1;
        }

        function getMonthlyInterest(balance, rate) {
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

            //Given a set of loans (with a balance, rate and minimum payment) determine
            //the chart data for those loans.
            //
            //TSL - need to add logic to handle multiple loans
            //(wisely choose to pay towards the highest interest rate loan for any money over minimum)
            crunchLoanData: function(loans, expectedPayment) {
                var localLoans = [];

                _.each(loans, function(loan) {
                    localLoans.push({
                        balance: loan.balance,
                        rate: loan.rate,
                        minPayment: loan.minPayment
                    });
                });

                localLoans.sort(interestSort);

                var minimumPayment = _.reduce(localLoans, function(loan, sum) { return sum + loan.minPayment; }, 0);
                expectedPayment = expectedPayment || minimumPayment;
                if(expectedPayment < minimumPayment) {
                    throw new Error("The expected payment cannot be less than the minimum payment");
                }

                var remainingLoanBalance = _.reduce(localLoans, function(loan, sum) { return sum + loan.balance; }, 0);
                if(remainingLoanBalance === 0) {
                    throw new Error("The loan balance is zero");
                }

                var loansOverTime = {},
                    currentPayment = expectedPayment,
                    currentYear = new Date().year,
                    currentMonth = new Date().month;

                while(localLoans.length > 0) {
                    //Store off the new loan value and step forward in time
                    if(!loansOverTime[currentYear]) {
                        loansOverTime[currentYear] = {};
                    }

                    loansOverTime[currentYear][getMonthString(currentMonth)] = _.reduce(localLoans, function(loan) { return  sum + loan.balance; }, 0);
                    currentMonth = getNextMonthIndex(currentMonth);
                    if(currentMonth === 0) {
                        currentYear++;
                    }

                    //Reduce the loan values by min payment amount
                    currentPayment = expectedPayment;
                    _.each(localLoans, function(loan, index) {
                        loan.balance = getNextMonthLoanBalance(loan.balance, loan.rate, loan.minPayment);

                        currentPayment -= loan.minPayment;
                        if(loan.balance < 0) {
                            currentPayment += (-loan.balance);
                            loan.balance = 0;
                        }
                    });

                    //Remove any completed loans
                    localLoans = _.filter(localLoans, function(loan) { return loan.balance === 0;});

                    //Pay any extra money towards the next available loans
                    if(currentPayment > 0) {
                        _.each(localLoans, function(loan) {
                            loan.balance -= currentPayment;
                            if(loan.balance < 0) {
                                currentPayment += (-loan.balance);
                                loan.balance = 0;
                            }
                        });
                    }
                }

                return loansOverTime;

            },
            updateChart: function(loans) {
                var chartData = helpers.crunchLoanData(loans);
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
