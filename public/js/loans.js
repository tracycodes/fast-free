define(["loan", "backbone", "jquery", "underscore"], function(Loan, Backbone, $, _) {
    return Backbone.Collection.extend({
        initialize: function() {
            this.months = [
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
        },

        interestSort: function(a, b) {
            if ( a.rate > b.rate) {
                return 1;
            }
            else if (b.rate > a.rate) {
                return -1;
            }
            return 0;
        },

        getMonthString: function(value) {
            return this.months[value];
        },

        getNextMonthIndex: function(index) {
            if(index === months.length - 1) {
                return 0;
            }
            return index + 1;
        },

        getNextMonthLoanBalance: function(balance, rate, payment) {
            return balance + getMonthlyInterest(balance, rate) - payment;
        },

        getChartData: function(loans, expectedPayment) {
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
        }
    });
});