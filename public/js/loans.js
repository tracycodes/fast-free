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

        getDaysInMonth: function(month, year) {
            return new Date(year, month, 0).getDate();
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
            if(index === this.months.length - 1) {
                return 0;
            }
            return index + 1;
        },

        getMonthlyInterest: function(year, month, balance, rate) {
            return (balance * rate / 365.25) * this.getDaysInMonth(year, month);
        },

        getMonthLoanBalance: function(year, month, balance, rate, payment) {
            return balance + this.getMonthlyInterest(year, month, balance, rate) - payment;
        },

        getChartData: function() {
            var loansOverTime = {},
                clonedCollection = new Backbone.Collection(this.toJSON()),
                minimumPayment = this.getMinimumPayment(),
                fullBalance = this.getBalance(),
                currentPayment = minimumPayment,
                currentYear = new Date().getFullYear(),
                currentMonth = new Date().getMonth();

            //This loop needs to run while the loan balance is still greater than zero, but we
            //don't want to alter the stored loans. Instead, we should keep a running total of the balance, subtracting off the altered
            //amount until we arrive and zero.
            while(fullBalance > 0) {
                //Store off the new loan value and step forward in time
                if(!loansOverTime[currentYear]) {
                    loansOverTime[currentYear] = {};
                }

                loansOverTime[currentYear][this.getMonthString(currentMonth)] = fullBalance;
                currentMonth = this.getNextMonthIndex(currentMonth);
                if(currentMonth === 0) {
                    currentYear++;
                }

                //Reduce the loan values by min payment amount
                currentPayment = minimumPayment;
                clonedCollection.forEach(function(loan) {
                    if(loan.get('balance') === 0) return;

                    //TSL - This assumes that the minimum payment is enough to cover the interest cost
                    var paymentAmount = loan.get('minPayment');
                    var newBalance = this.getMonthLoanBalance(currentYear, currentMonth, loan.get('balance'), loan.get('rate'), paymentAmount);

                    if(newBalance < 0) {
                        paymentAmount += newBalance;
                        newBalance = 0;
                    }

                    currentPayment -= paymentAmount;
                    fullBalance -= (loan.get('balance') - newBalance);
                    loan.set('balance', newBalance);
                }, this);

                //Pay any extra money towards the next available loans
                clonedCollection.some(function(loan) {
                    if(currentPayment <= 0) return true;

                    var loanBalance = loan.get('balance');

                    if(loanBalance > currentPayment) {
                        loan.set('balance', loanBalance - currentPayment);
                        fullBalance -= currentPayment;
                        return true;
                    }
                    else {
                        loan.set('balance', 0);
                        currentPayment -= loanBalance;
                        fullBalance -= loanBalance;
                    }
                });

                //Handle all loans paid off and extra current payment.
                //Add money to a "savings" account
            }

            return loansOverTime;
        }
    });
});