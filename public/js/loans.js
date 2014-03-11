define(["loan", "backbone", "jquery", "underscore"], function(Loan, Backbone, $, _) {
    return Backbone.Collection.extend({
        comparator: 'rate',

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

        getBalance: function() {
            return this.reduce(function(sum, loan) { return  sum + loan.get('balance'); }, 0);
        },

        getMinimumPayment: function() {
            return this.reduce(function(sum, loan) { return sum + loan.get('minPayment'); }, 0);
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

        getChartData: function() {
            var loansOverTime = {},
                clonedCollection = new Backbone.Collection(this.toJSON()),
                minimumPayment = this.getMinimumPayment(),
                currentBalance = this.getBalance(),
                currentPayment = minimumPayment,
                currentYear = new Date().year,
                currentMonth = new Date().month;

            //This loop needs to run while the loan balance is still greater than zero, but we
            //don't want to alter the stored loans. Instead, we should keep a running total of the balance, subtracting off the altered
            //amount until we arrive and zero.
            while(currentBalance > 0) {
                //Store off the new loan value and step forward in time
                if(!loansOverTime[currentYear]) {
                    loansOverTime[currentYear] = {};
                }

                loansOverTime[currentYear][getMonthString(currentMonth)] = currentBalance;
                currentMonth = getNextMonthIndex(currentMonth);
                if(currentMonth === 0) {
                    currentYear++;
                }

                //Reduce the loan values by min payment amount
                currentPayment = minimumPayment;
                currentBalance -= currentPayment;
                clonedCollection.forEach(function(loan) {
                    if(loan.get('balance') === 0) return;

                    var paymentAmount = loan.get('minPayment'),
                        newBalance = getNextMonthLoanBalance(loan.get('balance'), loan.get('rate'), paymentAmount);

                    if(newBalance < 0) {
                        paymentAmount += newBalance;
                        newBalance = 0;
                    }

                    currentPayment -= paymentAmount;
                    loan.set('balance', newBalance);
                });

                //Pay any extra money towards the next available loans
                if(currentPayment > 0) {
                    clonedCollection.some(function(loan) {
                        if(currentPayment <= 0) return false;

                        //TSL - Interest calc is incorrect.
                        newBalance = getNextMonthLoanBalance(loan.get('balance'), loan.get('rate'), currentPayments);

                        if(newBalance < 0) {
                            currentPayment += newBalance;
                            newBalance = 0;
                            currentPayment -= loan.get('balance');
                        }
                        else {
                            currentPayment = 0;
                        }

                        loan.set('balance', newBalance);
                    });
                }
            }

            return loansOverTime;
        }
    });
});