document.addEventListener('DOMContentLoaded', function () {
    const calculator = {
        init() {
            this.calculateButton = document.getElementById('calculate');
            this.amountInput = document.getElementById('amount');
            this.amountError = document.getElementById('amount-error');
            this.toggleTableButton = document.getElementById('toggle-table');
            this.chargesTable = document.getElementById('charges-table');
            this.loader = document.getElementById('loader');
            this.bindEvents();
            this.addInputValidation();
            this.chargeRanges = {
                mpesaTransfer: [
                    { min: 1, max: 100, charge: "Free" },
                    { min: 101, max: 500, charge: 7 },
                    { min: 501, max: 1000, charge: 13 },
                    { min: 1001, max: 1500, charge: 23 },
                    { min: 1501, max: 2500, charge: 33 },
                    { min: 2501, max: 3500, charge: 53 },
                    { min: 3501, max: 5000, charge: 57 },
                    { min: 5001, max: 7500, charge: 78 },
                    { min: 7501, max: 10000, charge: 90 },
                    { min: 10001, max: 15000, charge: 100 },
                    { min: 15001, max: 20000, charge: 105 },
                    { min: 20001, max: 35000, charge: 108 },
                    { min: 35001, max: 50000, charge: 108 },
                    { min: 50001, max: 250000, charge: 108 }
                ],
                unregisteredTransfer: [
                    { min: 50, max: 100, charge: "Free" },
                    { min: 101, max: 250000, charge: 29 }
                ],
                agentWithdrawal: [
                    { min: 50, max: 100, charge: 11 },
                    { min: 101, max: 2500, charge: 29 },
                    { min: 2501, max: 3500, charge: 52 },
                    { min: 3501, max: 5000, charge: 69 },
                    { min: 5001, max: 7500, charge: 87 },
                    { min: 7501, max: 10000, charge: 115 },
                    { min: 10001, max: 15000, charge: 167 },
                    { min: 15001, max: 20000, charge: 185 },
                    { min: 20001, max: 35000, charge: 197 },
                    { min: 35001, max: 50000, charge: 278 },
                    { min: 50001, max: 250000, charge: 309 }
                ],
                atmWithdrawal: [
                    { min: 200, max: 2500, charge: 35 },
                    { min: 2501, max: 5000, charge: 69 },
                    { min: 5001, max: 10000, charge: 115 },
                    { min: 10001, max: 35000, charge: 203 }
                ],
                otherTransfer: [
                    { min: 1, max: 100, charge: "Free" },
                    { min: 101, max: 500, charge: 7 },
                    { min: 501, max: 1000, charge: 13 },
                    { min: 1001, max: 1500, charge: 23 },
                    { min: 1501, max: 2500, charge: 33 },
                    { min: 2501, max: 3500, charge: 53 },
                    { min: 3501, max: 5000, charge: 57 },
                    { min: 5001, max: 7500, charge: 78 },
                    { min: 7501, max: 10000, charge: 90 },
                    { min: 10001, max: 15000, charge: 100 },
                    { min: 15001, max: 20000, charge: 105 },
                    { min: 20001, max: 35000, charge: 108 },
                    { min: 35001, max: 50000, charge: 108 },
                    { min: 50001, max: 250000, charge: 108 }
                ],
                paybillMgao: [
                    { min: 1, max: 49, businessFee: 0, customerFee: 0 },
                    { min: 50, max: 100, businessFee: 0, customerFee: 0 },
                    { min: 101, max: 500, businessFee: 5, customerFee: 5 },
                    { min: 501, max: 1000, businessFee: 10, customerFee: 10 },
                    { min: 1001, max: 1500, businessFee: 5, customerFee: 10 },
                    { min: 1501, max: 2500, businessFee: 7, customerFee: 13 },
                    { min: 2501, max: 3500, businessFee: 9, customerFee: 16 },
                    { min: 3501, max: 5000, businessFee: 18, customerFee: 16 },
                    { min: 5001, max: 7500, businessFee: 25, customerFee: 17 },
                    { min: 7501, max: 10000, businessFee: 30, customerFee: 18 },
                    { min: 10001, max: 15000, businessFee: 39, customerFee: 18 },
                    { min: 15001, max: 20000, businessFee: 43, customerFee: 19 },
                    { min: 20001, max: 25000, businessFee: 47, customerFee: 20 },
                    { min: 25001, max: 30000, businessFee: 52, customerFee: 20 },
                    { min: 30001, max: 35000, businessFee: 62, customerFee: 21 },
                    { min: 35001, max: 40000, businessFee: 76, customerFee: 23 },
                    { min: 40001, max: 45000, businessFee: 80, customerFee: 23 },
                    { min: 45001, max: 50000, businessFee: 84, customerFee: 24 },
                    { min: 50001, max: 70000, businessFee: 84, customerFee: 24 },
                    { min: 70001, max: 250000, businessFee: 84, customerFee: 24 }
                ]
            };
        },

        bindEvents() {
            this.calculateButton.addEventListener('click', () => this.handleCalculation());
            this.toggleTableButton.addEventListener('click', () => this.toggleChargesTable());
            this.amountInput.addEventListener('input', (e) => this.validateInput(e));
        },

        addInputValidation() {
            this.amountInput.setAttribute('type', 'number');
            this.amountInput.setAttribute('min', '1');
            this.amountInput.setAttribute('max', '250000');
            this.amountInput.setAttribute('step', 'any');
        },

        validateInput(e) {
            const input = e.target;
            let value = input.value;

            if (isNaN(value)) {
                this.showError("Please enter a valid number.", input);
                input.value = '';
                return;
            }

            const parts = value.split('.');
            if (parts.length > 2) {
                value = parts[0] + '.' + parts[1].slice(0, 2);
            }

            if (value === "") {
                this.showError("Please enter an amount.", input);
            } else if (value > 250000) {
                value = '250000';
                this.showError("The maximum amount is 250,000 KES.", input);
            } else if (value < 1) {
                value = '1';
                this.showError("The minimum amount is 1 KES.", input);
            } else {
                this.clearError(input);
            }

            input.value = value;
        },

        showError(message, input) {
            this.amountError.textContent = message;
            input.classList.add('error');
            input.setAttribute('aria-invalid', 'true');
            this.amountError.setAttribute('role', 'alert');
        },

        clearError(input) {
            this.amountError.textContent = '';
            input.classList.remove('error');
            input.removeAttribute('aria-invalid');
            this.amountError.removeAttribute('role');
        },

        handleCalculation() {
            const amount = parseFloat(this.amountInput.value);

            if (!this.isValidAmount(amount)) {
                return;
            }

            this.showLoader();

            setTimeout(() => {
                this.calculateCharges(amount);
                this.hideLoader();
            }, 500);
        },

        isValidAmount(amount) {
            if (isNaN(amount) || amount < 1 || amount > 250000) {
                this.showError('Amount should be between 1 and 250,000 KES.', this.amountInput);
                return false;
            }
            return true;
        },

        calculateCharges(amount) {
            const charges = {
                mpesaTransfer: this.findCharge(amount, this.chargeRanges.mpesaTransfer),
                unregisteredTransfer: this.findCharge(amount, this.chargeRanges.unregisteredTransfer),
                agentWithdrawal: this.findCharge(amount, this.chargeRanges.agentWithdrawal),
                otherTransfer: this.findCharge(amount, this.chargeRanges.otherTransfer),
                atmWithdrawal: this.findCharge(amount, this.chargeRanges.atmWithdrawal),
                paybillBusinessFee: this.findPaybillCharge(amount, this.chargeRanges.paybillMgao, 'businessFee'),
                paybillCustomerFee: this.findPaybillCharge(amount, this.chargeRanges.paybillMgao, 'customerFee')
            };

            this.updateUI(charges);
        },

        findCharge(amount, ranges) {
            for (const range of ranges) {
                if (amount >= range.min && amount <= range.max) {
                    return range.charge;
                }
            }
            return "Range not supported";
        },

        findPaybillCharge(amount, ranges, feeType) {
            for (const range of ranges) {
                if (amount >= range.min && amount <= range.max) {
                    return range[feeType];
                }
            }
            return "Range not supported";
        },

        formatCharge(charge) {
            if (typeof charge === 'number') {
                return `KShs. ${charge.toLocaleString()}`;
            }
            return charge;
        },

        updateUI(charges) {
            Object.keys(charges).forEach(chargeType => {
                const element = document.getElementById(chargeType.replace(/([A-Z])/g, '-$1').toLowerCase());
                if (element) {
                    element.textContent = this.formatCharge(charges[chargeType]);
                }
            });

            // Calculate and update total Paybill fee
            const businessFee = parseFloat(charges.paybillBusinessFee);
            const customerFee = parseFloat(charges.paybillCustomerFee);
            const totalPaybillFee = isNaN(businessFee) || isNaN(customerFee) ? "N/A" : businessFee + customerFee;
            document.getElementById('paybill-total-fee').textContent = this.formatCharge(totalPaybillFee);
        },

        toggleChargesTable() {
            const isHidden = this.chargesTable.classList.contains('hidden');
            this.chargesTable.classList.toggle('hidden');
            this.toggleTableButton.textContent = isHidden ?
                'Hide M-Pesa Charges Table' :
                'Show M-Pesa Charges Table';
            if (isHidden) {
                this.populateChargesTable();
                this.chargesTable.scrollIntoView({ behavior: 'smooth' });
            }
        },
        populateChargesTable() {
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const tbody = document.createElement('tbody');

            // Create table header rows (two rows for your format)
            const headerRow1 = document.createElement('tr');
            ['TRANSACTION RANGE (KSHS)', 'TRANSACTION TYPE AND CUSTOMER CHARGES (KSHS)'].forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                th.colSpan = 2; // Span two columns
                headerRow1.appendChild(th);
            });
            thead.appendChild(headerRow1);

            const headerRow2 = document.createElement('tr');
            ['MIN', 'MAX', 'TRANSFER TO M-PESA USERS, POCHI LA BIASHARA AND BUSINESS TILL TO CUSTOMER', 'TRANSFER TO OTHER REGISTERED MOBILE MONEY USERS', 'WITHDRAWAL FROM M-PESA AGENT'].forEach(headerText => {
                const th = document.createElement('th');
                th.textContent = headerText;
                headerRow2.appendChild(th);
            });
            thead.appendChild(headerRow2);

            // Create table data rows (matching your provided data)
            const tableData = [
                { min: 1, max: 49, mpesaTransfer: 'Free', otherTransfer: 'Free', agentWithdrawal: 'N/A' },
                { min: 50, max: 100, mpesaTransfer: 'Free', otherTransfer: 'Free', agentWithdrawal: 11 },
                { min: 101, max: 500, mpesaTransfer: 7, otherTransfer: 7, agentWithdrawal: 29 },
                { min: 501, max: 1000, mpesaTransfer: 13, otherTransfer: 13, agentWithdrawal: 29 },
                { min: 1001, max: 1500, mpesaTransfer: 23, otherTransfer: 23, agentWithdrawal: 29 },
                { min: 1501, max: 2500, mpesaTransfer: 33, otherTransfer: 33, agentWithdrawal: 29 },
                { min: 2501, max: 3500, mpesaTransfer: 53, otherTransfer: 53, agentWithdrawal: 52 },
                { min: 3501, max: 5000, mpesaTransfer: 57, otherTransfer: 57, agentWithdrawal: 69 },
                { min: 5001, max: 7500, mpesaTransfer: 78, otherTransfer: 78, agentWithdrawal: 87 },
                { min: 7501, max: 10000, mpesaTransfer: 90, otherTransfer: 90, agentWithdrawal: 115 },
                { min: 10001, max: 15000, mpesaTransfer: 100, otherTransfer: 100, agentWithdrawal: 167 },
                { min: 15001, max: 20000, mpesaTransfer: 105, otherTransfer: 105, agentWithdrawal: 185 },
                { min: 20001, max: 35000, mpesaTransfer: 108, otherTransfer: 108, agentWithdrawal: 197 },
                { min: 35001, max: 50000, mpesaTransfer: 108, otherTransfer: 108, agentWithdrawal: 278 },
                { min: 50001, max: 250000, mpesaTransfer: 108, otherTransfer: 108, agentWithdrawal: 309 }
            ];

            tableData.forEach(data => {
                const row = document.createElement('tr');
                [data.min, data.max, data.mpesaTransfer, data.otherTransfer, data.agentWithdrawal].forEach(value => {
                    const cell = document.createElement('td');
                    // Only add "KShs." if the value is a number
                    cell.textContent = typeof value === 'number' ? value.toLocaleString() : value; 
                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            });

            // Add ATM withdrawal section 
            const atmWithdrawalData = [
                { min: 200, max: 2500, charge: 35 },
                { min: 2501, max: 5000, charge: 69 },
                { min: 5001, max: 10000, charge: 115 },
                { min: 10001, max: 35000, charge: 203 }
            ];

            // Add a separator row
            const separatorRow = document.createElement('tr');
            const separatorCell = document.createElement('td');
            separatorCell.colSpan = 5; 
            separatorCell.textContent = 'ATM Withdrawal Tariff';
            separatorCell.style.textAlign = 'center'; 
            separatorRow.appendChild(separatorCell);
            tbody.appendChild(separatorRow); 

            atmWithdrawalData.forEach(data => {
                const row = document.createElement('tr');
                [data.min, data.max, "", "", data.charge].forEach(value => { // Add empty cells for alignment
                    const cell = document.createElement('td');
                    cell.textContent = typeof value === 'number' ? value.toLocaleString() : value;
                    row.appendChild(cell);
                });
                tbody.appendChild(row);
            });

            table.appendChild(thead);
            table.appendChild(tbody);
            this.chargesTable.appendChild(table);
        },

        showLoader() {
            this.loader.style.display = 'block';
        },

        hideLoader() {
            this.loader.style.display = 'none';
        }
    };

    calculator.init();
});