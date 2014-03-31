define(["loan", "backbone", "jquery", "underscore"], function(Loan, Backbone, $, _) {
    return Backbone.Collection.extend({
        comparator: 'rate',

        initialize: function(models, vent) {
            this.vent = vent;

            vent.on('update-payment', this.setActualPayment, this);

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

        setActualPayment: function(actualPayment) {
            this.actualPayment = actualPayment;
        },

        getActualPayment: function() {
            return this.actualPayment || this.getMinimumPayment();
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

        getDaysInMonth: function(month, year) {
            return new Date(year, month, 0).getDate();
        },

        getMonthlyInterest: function(year, month, balance, rate) {
            return (balance * rate / 365.25) * this.getDaysInMonth(year, month);
        },

        getMonthLoanBalance: function(year, month, balance, rate, payment) {
            return balance + this.getMonthlyInterest(year, month, balance, rate) - payment;
        },

        getMinimumChartData: function() {
            return this.getChartData(this.getMinimumPayment());
        },

        getActualChartData: function() {
            return this.getChartData(this.getActualPayment());
        },

        getChartData: function(paymentAmount) {
            var loansOverTime = {},
                maxBalance = this.getBalance(),
                clonedCollection = new Backbone.Collection(this.toJSON()),
                fullBalance = maxBalance,
                currentPayment = paymentAmount,
                currentYear = new Date().getFullYear(),
                currentMonth = new Date().getMonth();

            //This loop needs to run while the loan balance is still greater than zero, but we
            //don't want to alter the stored loans. Instead, we should keep a running total of the balance, subtracting off the altered
            //amount until we arrive and zero.
            while(parseFloat(fullBalance.toFixed(2), 10) > 0) { // Handle floating point insanity
                if(clonedCollection.reduce(function(sum, loan) { return  sum + loan.get('balance'); }, 0) > maxBalance) {
                    throw Error("Whoa there. It looks like your loan balance is getting higher over time. You likely need to pay a higher minimum");
                }

                //Store off the new loan value and step forward in time
                if(!loansOverTime[currentYear]) {
                    loansOverTime[currentYear] = {};
                }

                loansOverTime[currentYear][this.getMonthString(currentMonth)] = fullBalance;
                currentMonth = this.getNextMonthIndex(currentMonth);
                if(currentMonth === 0) {
                    currentYear++;
                }

                //Reduce the loan values by payment amount
                currentPayment = paymentAmount;
                clonedCollection.forEach(function(loan) {
                    if(loan.get('balance') === 0) return;

                    var paymentAmount = loan.get('minPayment');

                    //Balance could be negative if the payment amount is too high.
                    var newBalance = this.getMonthLoanBalance(currentYear, currentMonth, loan.get('balance'), loan.get('rate'), paymentAmount);
                    if(newBalance < 0) {
                        paymentAmount = loan.get('balance');
                        fullBalance -= loan.get('balance');
                        newBalance = 0;
                    }
                    else {
                        fullBalance -= (loan.get('balance') - newBalance);
                    }

                    currentPayment -= paymentAmount;
                    loan.set('balance', newBalance);
                }, this);

                //Pay any extra money towards the next available loans
                if(currentPayment > 0) {
                    clonedCollection.some(function(loan) {
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
                }

                //Handle all loans paid off and extra current payment.
                //Add money to a "savings" account
            }

            return loansOverTime;
        }
    });
});