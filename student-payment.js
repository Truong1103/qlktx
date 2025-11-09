// Student Payment Logic
let selectedPaymentMethod = null;
let selectedBills = [];

document.addEventListener('DOMContentLoaded', () => {
    loadPaymentPage();
});

function loadPaymentPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    loadPaymentBills(user.mssv);
    loadPaymentHistory(user.mssv);
}

function loadPaymentBills(mssv) {
    // Get user info
    const user = JSON.parse(localStorage.getItem('currentUser'));
    
    // Get existing bills from storage or generate sample
    let bills = storage.bills || [];
    
    if (bills.length === 0 || !bills.find(b => b.mssv === mssv)) {
        // Generate sample bills
        bills = [
            {
                id: 'BILL001',
                mssv: mssv,
                type: 'Phí phòng',
                period: 'Tháng ' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear(),
                amount: 500000,
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Phí thuê phòng ký túc xá',
                roomId: 'P101',
                createdAt: new Date().toISOString()
            },
            {
                id: 'BILL002',
                mssv: mssv,
                type: 'Phí điện nước',
                period: 'Tháng ' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear(),
                amount: 150000,
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Phí điện nước sử dụng trong tháng',
                roomId: 'P101',
                createdAt: new Date().toISOString()
            },
            {
                id: 'BILL003',
                mssv: mssv,
                type: 'Phí dịch vụ',
                period: 'Tháng ' + (new Date().getMonth() + 1) + '/' + new Date().getFullYear(),
                amount: 100000,
                status: 'pending',
                dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
                description: 'Phí dịch vụ internet, vệ sinh',
                roomId: 'P101',
                createdAt: new Date().toISOString()
            }
        ];
        storage.bills = bills;
    } else {
        // Filter bills for this student
        bills = bills.filter(b => b.mssv === mssv);
    }

    const billsDiv = document.getElementById('paymentBills');
    
    if (bills.length === 0) {
        billsDiv.innerHTML = '<p class="text-gray-500">Không có khoản phí nào cần thanh toán</p>';
        return;
    }

    billsDiv.innerHTML = bills.map(bill => {
        const isPending = bill.status === 'pending';
        const daysUntilDue = Math.ceil((new Date(bill.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
        const isOverdue = daysUntilDue < 0;
        
        return `
            <div class="border rounded-lg p-6 ${isPending ? (isOverdue ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200') : 'bg-green-50 border-green-200'}">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-start space-x-4">
                            ${isPending ? `
                                <input type="checkbox" class="bill-checkbox h-5 w-5 text-indigo-600 mt-1" 
                                    data-bill-id="${bill.id}" 
                                    data-bill-type="${bill.type}"
                                    data-bill-period="${bill.period}"
                                    data-amount="${bill.amount}"
                                    onchange="updateSelectedBills()">
                            ` : ''}
                            <div class="flex-1">
                                <div class="flex items-center space-x-2 mb-2">
                                    <p class="font-semibold text-lg text-gray-900">${bill.type}</p>
                                    ${isOverdue && isPending ? `
                                        <span class="px-2 py-1 rounded text-xs font-semibold bg-red-100 text-red-800">
                                            Quá hạn
                                        </span>
                                    ` : ''}
                                </div>
                                <p class="text-sm text-gray-600 mb-1">${bill.description || 'Chi phí ký túc xá'}</p>
                                <p class="text-sm text-gray-500 mb-1">Kỳ: ${bill.period}</p>
                                ${bill.roomId ? `<p class="text-sm text-gray-500 mb-1">Phòng: ${bill.roomId}</p>` : ''}
                                <p class="text-sm ${isOverdue && isPending ? 'text-red-600 font-semibold' : 'text-gray-500'}">
                                    Hạn thanh toán: ${formatDate(bill.dueDate)}
                                    ${isPending ? (isOverdue ? ` (Quá hạn ${Math.abs(daysUntilDue)} ngày)` : ` (Còn ${daysUntilDue} ngày)`) : ''}
                                </p>
                                <p class="text-xs text-gray-400 mt-2">Mã hóa đơn: ${bill.id}</p>
                            </div>
                        </div>
                    </div>
                    <div class="text-right ml-4">
                        <p class="text-2xl font-bold ${isPending ? (isOverdue ? 'text-red-600' : 'text-gray-900') : 'text-green-600'}">
                            ${formatCurrency(bill.amount)}
                        </p>
                        <span class="px-3 py-1 rounded-full text-xs font-semibold ${
                            bill.status === 'pending' ? (isOverdue ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800') : 
                            bill.status === 'paid' ? 'bg-green-100 text-green-800' : 
                            'bg-gray-100 text-gray-800'
                        }">
                            ${bill.status === 'pending' ? (isOverdue ? 'Quá hạn' : 'Chờ thanh toán') : 'Đã thanh toán'}
                        </span>
                    </div>
                </div>
                ${isPending ? `
                    <div class="mt-4 flex justify-end space-x-2">
                        <button onclick="viewBillDetail('${bill.id}')" 
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                            Chi tiết
                        </button>
                        <button onclick="selectBill('${bill.id}')" 
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm">
                            Thanh toán
                        </button>
                    </div>
                ` : `
                    <div class="mt-4 flex justify-end">
                        <button onclick="viewBillDetail('${bill.id}')" 
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm">
                            Xem hóa đơn
                        </button>
                    </div>
                `}
            </div>
        `;
    }).join('');

    // Add payment button if there are pending bills
    const pendingBills = bills.filter(b => b.status === 'pending');
    if (pendingBills.length > 0) {
        billsDiv.innerHTML += `
            <div class="mt-4 flex justify-end">
                <button onclick="showPaymentMethod()" 
                    class="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                    Thanh toán tất cả
                </button>
            </div>
        `;
    }
}

function updateSelectedBills() {
    const checkboxes = document.querySelectorAll('.bill-checkbox:checked');
    selectedBills = Array.from(checkboxes).map(cb => ({
        id: cb.dataset.billId,
        type: cb.dataset.billType,
        period: cb.dataset.billPeriod,
        amount: parseFloat(cb.dataset.amount)
    }));
    
    if (selectedBills.length > 0) {
        const total = selectedBills.reduce((sum, b) => sum + b.amount, 0);
        const tax = Math.round(total * 0.1); // 10% VAT
        const finalTotal = total + tax;
        
        document.getElementById('totalAmount').textContent = formatCurrency(total);
        document.getElementById('taxAmount').textContent = formatCurrency(tax);
        document.getElementById('finalTotal').textContent = formatCurrency(finalTotal);
        document.getElementById('paymentMethodSection').classList.remove('hidden');
    } else {
        document.getElementById('paymentMethodSection').classList.add('hidden');
    }
}

function selectBill(billId) {
    const checkbox = document.querySelector(`.bill-checkbox[data-bill-id="${billId}"]`);
    if (checkbox) {
        checkbox.checked = true;
        updateSelectedBills();
    }
    showPaymentMethod();
}

function showPaymentMethod() {
    if (selectedBills.length === 0) {
        updateSelectedBills();
    }
    document.getElementById('paymentMethodSection').scrollIntoView({ behavior: 'smooth' });
}

function selectPaymentMethod(method) {
    selectedPaymentMethod = method;
    
    // Update UI
    document.querySelectorAll('.payment-method-btn').forEach(btn => {
        btn.classList.remove('border-indigo-500', 'bg-indigo-50');
        btn.classList.add('border-gray-300');
    });
    
    event.target.closest('.payment-method-btn').classList.add('border-indigo-500', 'bg-indigo-50');
    event.target.closest('.payment-method-btn').classList.remove('border-gray-300');
    
    const methodNames = {
        'bank': 'Ngân hàng',
        'momo': 'Ví điện tử (MoMo)',
        'vnpay': 'VNPay'
    };
    
    document.getElementById('selectedMethod').textContent = methodNames[method] || method;
    document.getElementById('paymentDetails').classList.remove('hidden');
}

function processPayment() {
    if (!selectedPaymentMethod) {
        showNotification('Vui lòng chọn phương thức thanh toán!', 'error');
        return;
    }

    if (selectedBills.length === 0) {
        showNotification('Vui lòng chọn ít nhất một khoản phí để thanh toán!', 'error');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const totalAmount = selectedBills.reduce((sum, b) => sum + b.amount, 0);
    const tax = Math.round(totalAmount * 0.1);
    const finalTotal = totalAmount + tax;

    // Simulate payment processing
    showNotification('Đang xử lý thanh toán...', 'info');
    
    setTimeout(() => {
        // Create payment record
        const payment = {
            id: 'PAY' + Date.now(),
            mssv: user.mssv,
            bills: selectedBills.map(b => b.id),
            billDetails: selectedBills,
            amount: totalAmount,
            tax: tax,
            finalAmount: finalTotal,
            method: selectedPaymentMethod,
            status: 'completed',
            createdAt: new Date().toISOString(),
            transactionCode: 'TXN' + Date.now()
        };

        storage.payments.push(payment);

        // Update bill status in storage
        if (storage.bills) {
            selectedBills.forEach(selectedBill => {
                const bill = storage.bills.find(b => b.id === selectedBill.id);
                if (bill) {
                    bill.status = 'paid';
                    bill.paidAt = new Date().toISOString();
                    bill.paymentId = payment.id;
                }
            });
        }

        showNotification('Thanh toán thành công!', 'success');
        
        // Show invoice
        setTimeout(() => {
            showInvoice(payment);
        }, 500);
        
        // Reset
        selectedPaymentMethod = null;
        selectedBills = [];
        document.getElementById('paymentMethodSection').classList.add('hidden');
        document.getElementById('paymentDetails').classList.add('hidden');
        
        // Reload
        setTimeout(() => {
            loadPaymentBills(user.mssv);
            loadPaymentHistory(user.mssv);
        }, 1000);
    }, 2000);
}

function loadPaymentHistory(mssv) {
    const payments = storage.payments.filter(p => p.mssv === mssv);
    const historyDiv = document.getElementById('paymentHistory');
    
    if (payments.length === 0) {
        historyDiv.innerHTML = '<p class="text-gray-500">Chưa có giao dịch nào</p>';
        return;
    }

    payments.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    historyDiv.innerHTML = payments.map(payment => {
        const methodNames = {
            'bank': 'Ngân hàng',
            'momo': 'Ví điện tử',
            'vnpay': 'VNPay'
        };
        
        const billCount = payment.bills ? payment.bills.length : 0;
        const finalAmount = payment.finalAmount || payment.amount;
        
        return `
            <div class="border rounded-lg p-4 hover:shadow-md transition">
                <div class="flex items-center justify-between">
                    <div class="flex-1">
                        <p class="font-semibold text-gray-900">Mã giao dịch: ${payment.id}</p>
                        ${payment.transactionCode ? `<p class="text-xs text-gray-400">Mã tham chiếu: ${payment.transactionCode}</p>` : ''}
                        <p class="text-sm text-gray-500 mt-1">Phương thức: ${methodNames[payment.method] || payment.method}</p>
                        <p class="text-sm text-gray-500">Ngày: ${formatDate(payment.createdAt)}</p>
                        <p class="text-sm text-gray-500">Số hóa đơn: ${billCount} hóa đơn</p>
                    </div>
                    <div class="text-right ml-4">
                        <p class="text-lg font-bold text-green-600">${formatCurrency(finalAmount)}</p>
                        <span class="px-3 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-800">
                            Đã thanh toán
                        </span>
                        <div class="mt-2">
                            <button onclick="showInvoice('${payment.id}')" 
                                class="px-3 py-1 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-xs">
                                Xem hóa đơn
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Invoice functions
let currentInvoice = null;

function showInvoice(paymentIdOrData) {
    let payment;
    if (typeof paymentIdOrData === 'string') {
        payment = storage.payments.find(p => p.id === paymentIdOrData);
    } else {
        payment = paymentIdOrData;
    }
    
    if (!payment) return;
    
    currentInvoice = payment;
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const methodNames = {
        'bank': 'Ngân hàng',
        'momo': 'Ví điện tử (MoMo)',
        'vnpay': 'VNPay'
    };
    
    const invoiceContent = document.getElementById('invoiceContent');
    invoiceContent.innerHTML = `
        <div class="invoice-wrapper">
            <!-- Header -->
            <div class="text-center mb-6 pb-4 border-b-2">
                <img src="Logo_van_lang.webp.png" alt="Logo" class="h-16 mx-auto mb-2">
                <h1 class="text-2xl font-bold text-gray-900">HÓA ĐƠN THANH TOÁN</h1>
                <p class="text-sm text-gray-600 mt-1">Ký túc xá - Trường Đại học Văn Lang</p>
            </div>
            
            <!-- Invoice Info -->
            <div class="grid grid-cols-2 gap-6 mb-6">
                <div>
                    <h3 class="font-semibold text-gray-900 mb-2">Thông tin khách hàng</h3>
                    <p class="text-sm text-gray-700">Họ tên: <strong>${user.name || 'N/A'}</strong></p>
                    <p class="text-sm text-gray-700">MSSV: ${user.mssv || 'N/A'}</p>
                    <p class="text-sm text-gray-700">Email: ${user.email || 'N/A'}</p>
                </div>
                <div class="text-right">
                    <h3 class="font-semibold text-gray-900 mb-2">Thông tin hóa đơn</h3>
                    <p class="text-sm text-gray-700">Mã hóa đơn: <strong>${payment.id}</strong></p>
                    <p class="text-sm text-gray-700">Mã giao dịch: ${payment.transactionCode || payment.id}</p>
                    <p class="text-sm text-gray-700">Ngày thanh toán: ${formatDate(payment.createdAt)}</p>
                    <p class="text-sm text-gray-700">Phương thức: ${methodNames[payment.method] || payment.method}</p>
                </div>
            </div>
            
            <!-- Bill Details -->
            <div class="mb-6">
                <h3 class="font-semibold text-gray-900 mb-3">Chi tiết thanh toán</h3>
                <table class="w-full border-collapse">
                    <thead>
                        <tr class="bg-gray-100">
                            <th class="border p-2 text-left text-sm font-semibold">STT</th>
                            <th class="border p-2 text-left text-sm font-semibold">Khoản phí</th>
                            <th class="border p-2 text-left text-sm font-semibold">Kỳ</th>
                            <th class="border p-2 text-right text-sm font-semibold">Số tiền</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${payment.billDetails ? payment.billDetails.map((bill, index) => `
                            <tr>
                                <td class="border p-2 text-sm">${index + 1}</td>
                                <td class="border p-2 text-sm">${bill.type}</td>
                                <td class="border p-2 text-sm">${bill.period}</td>
                                <td class="border p-2 text-sm text-right">${formatCurrency(bill.amount)}</td>
                            </tr>
                        `).join('') : `
                            <tr>
                                <td class="border p-2 text-sm" colspan="4" class="text-center">Không có chi tiết</td>
                            </tr>
                        `}
                    </tbody>
                </table>
            </div>
            
            <!-- Summary -->
            <div class="bg-gray-50 p-4 rounded-lg">
                <div class="flex justify-end">
                    <div class="w-64 space-y-2">
                        <div class="flex justify-between text-sm">
                            <span class="text-gray-600">Tổng tiền:</span>
                            <span class="font-medium">${formatCurrency(payment.amount)}</span>
                        </div>
                        ${payment.tax ? `
                            <div class="flex justify-between text-sm">
                                <span class="text-gray-600">VAT (10%):</span>
                                <span class="font-medium">${formatCurrency(payment.tax)}</span>
                            </div>
                        ` : ''}
                        <div class="border-t pt-2 flex justify-between">
                            <span class="font-bold text-lg">Tổng cộng:</span>
                            <span class="font-bold text-lg text-indigo-600">${formatCurrency(payment.finalAmount || payment.amount)}</span>
                        </div>
                    </div>
                </div>
            </div>
            
            <!-- Footer -->
            <div class="mt-8 pt-4 border-t text-center text-xs text-gray-500">
                <p>Cảm ơn bạn đã sử dụng dịch vụ!</p>
                <p class="mt-1">Hóa đơn này có giá trị pháp lý và được lưu trữ trong hệ thống</p>
            </div>
        </div>
    `;
    
    document.getElementById('invoiceModal').classList.remove('hidden');
}

function closeInvoiceModal() {
    document.getElementById('invoiceModal').classList.add('hidden');
    currentInvoice = null;
}

function exportInvoiceToPDF() {
    if (!currentInvoice) return;
    
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const methodNames = {
        'bank': 'Ngân hàng',
        'momo': 'Ví điện tử (MoMo)',
        'vnpay': 'VNPay'
    };
    
    // Add content
    doc.setFontSize(20);
    doc.text('HÓA ĐƠN THANH TOÁN', 105, 20, { align: 'center' });
    
    doc.setFontSize(12);
    doc.text('Ký túc xá - Trường Đại học Văn Lang', 105, 30, { align: 'center' });
    
    // Customer info
    doc.setFontSize(10);
    doc.text('Thông tin khách hàng:', 20, 45);
    doc.text(`Họ tên: ${user.name || 'N/A'}`, 20, 52);
    doc.text(`MSSV: ${user.mssv || 'N/A'}`, 20, 59);
    
    // Invoice info
    doc.text('Thông tin hóa đơn:', 120, 45);
    doc.text(`Mã hóa đơn: ${currentInvoice.id}`, 120, 52);
    doc.text(`Ngày: ${formatDate(currentInvoice.createdAt)}`, 120, 59);
    doc.text(`Phương thức: ${methodNames[currentInvoice.method] || currentInvoice.method}`, 120, 66);
    
    // Table header
    let yPos = 80;
    doc.setFontSize(9);
    doc.text('STT', 20, yPos);
    doc.text('Khoản phí', 40, yPos);
    doc.text('Kỳ', 120, yPos);
    doc.text('Số tiền', 160, yPos);
    
    yPos += 7;
    doc.line(20, yPos - 3, 190, yPos - 3);
    
    // Bill details
    if (currentInvoice.billDetails) {
        currentInvoice.billDetails.forEach((bill, index) => {
            doc.text((index + 1).toString(), 20, yPos);
            doc.text(bill.type, 40, yPos);
            doc.text(bill.period, 120, yPos);
            doc.text(formatCurrency(bill.amount), 160, yPos);
            yPos += 7;
        });
    }
    
    // Summary
    yPos += 5;
    doc.line(20, yPos, 190, yPos);
    yPos += 7;
    
    doc.text('Tổng tiền:', 120, yPos);
    doc.text(formatCurrency(currentInvoice.amount), 160, yPos);
    
    if (currentInvoice.tax) {
        yPos += 7;
        doc.text('VAT (10%):', 120, yPos);
        doc.text(formatCurrency(currentInvoice.tax), 160, yPos);
    }
    
    yPos += 7;
    doc.setFontSize(12);
    doc.text('Tổng cộng:', 120, yPos);
    doc.text(formatCurrency(currentInvoice.finalAmount || currentInvoice.amount), 160, yPos);
    
    // Footer
    yPos += 15;
    doc.setFontSize(8);
    doc.text('Cảm ơn bạn đã sử dụng dịch vụ!', 105, yPos, { align: 'center' });
    
    // Save PDF
    doc.save(`HoaDon_${currentInvoice.id}.pdf`);
    showNotification('Đã xuất hóa đơn PDF thành công!', 'success');
}

function exportInvoiceToImage() {
    if (!currentInvoice) return;
    
    const invoiceElement = document.getElementById('invoiceContent');
    
    html2canvas(invoiceElement, {
        scale: 2,
        useCORS: true,
        logging: false
    }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const link = document.createElement('a');
        link.download = `HoaDon_${currentInvoice.id}.png`;
        link.href = imgData;
        link.click();
        showNotification('Đã xuất hóa đơn ảnh thành công!', 'success');
    }).catch(err => {
        console.error('Error generating image:', err);
        showNotification('Có lỗi khi xuất ảnh!', 'error');
    });
}

function viewBillDetail(billId) {
    const bill = storage.bills ? storage.bills.find(b => b.id === billId) : null;
    if (!bill) {
        showNotification('Không tìm thấy hóa đơn!', 'error');
        return;
    }
    
    // Create a payment-like object for viewing
    const payment = {
        id: bill.paymentId || bill.id,
        transactionCode: bill.paymentId || bill.id,
        billDetails: [bill],
        amount: bill.amount,
        finalAmount: bill.amount,
        method: 'N/A',
        createdAt: bill.paidAt || bill.createdAt
    };
    
    showInvoice(payment);
}

