// Student Confirm Check-in Logic
document.addEventListener('DOMContentLoaded', () => {
    loadConfirmPage();
});

function loadConfirmPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (!registration) {
        document.getElementById('statusContent').innerHTML = `
            <p class="text-gray-500">Bạn chưa có đơn đăng ký nào.</p>
            <a href="student-register.html" class="mt-4 inline-block px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700">
                Đăng ký ngay
            </a>
        `;
        return;
    }

    // Show registration status
    const statusText = getStatusText(registration.status);
    const statusColor = getStatusColor(registration.status);
    
    document.getElementById('statusContent').innerHTML = `
        <div class="flex items-center justify-between">
            <div>
                <p class="text-lg font-semibold ${statusColor}">${statusText}</p>
                <p class="text-sm text-gray-500 mt-1">Mã đơn: ${registration.id}</p>
            </div>
            <span class="px-4 py-2 rounded-full text-sm font-semibold ${statusColor} bg-opacity-20">
                ${statusText}
            </span>
        </div>
    `;

    // Show appropriate step based on status
    if (registration.status === 'approved' && !registration.confirmed) {
        showStep1(registration);
    } else if (registration.confirmed) {
        // Check if payment is completed
        const user = JSON.parse(localStorage.getItem('currentUser'));
        const payment = storage.payments.find(p => 
            p.mssv === user.mssv && p.type === 'deposit' && p.status === 'completed'
        );
        
        if (!payment) {
            showStep2(registration);
        } else {
            registration.paid = true;
            if (!registration.appointmentScheduled) {
                showStep3(registration);
            } else if (!registration.contractSigned) {
                showStep4(registration);
            } else {
                showCompletedStatus(registration);
            }
        }
    } else if (registration.status === 'completed' || registration.contractSigned) {
        showCompletedStatus(registration);
    }
}

function showStep1(registration) {
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('assignedRoom').value = registration.roomId || 'Chưa phân phòng';
    
    // Calculate deadline from approval date (7 days)
    const approvalDate = registration.approvedAt ? new Date(registration.approvedAt) : new Date(registration.createdAt);
    const deadline = new Date(approvalDate);
    deadline.setDate(deadline.getDate() + 7); // 7 days to confirm
    document.getElementById('confirmDeadline').value = formatDate(deadline);
    
    // Check if deadline passed
    const now = new Date();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) {
        document.getElementById('confirmDeadlineWarning').textContent = `Đã quá hạn ${Math.abs(daysLeft)} ngày`;
        document.getElementById('confirmDeadlineWarning').classList.add('text-red-600', 'font-semibold');
    } else {
        document.getElementById('confirmDeadlineWarning').textContent = `Còn ${daysLeft} ngày`;
        document.getElementById('confirmDeadlineWarning').classList.add('text-green-600');
    }
    
    // Show room info
    if (registration.roomId) {
        const room = storage.rooms.find(r => r.id === registration.roomId);
        if (room) {
            document.getElementById('roomTypeInfo').textContent = room.type;
            document.getElementById('roomPriceInfo').textContent = formatCurrency(room.price);
        }
    }
}

function showStep2(registration) {
    document.getElementById('step2').classList.remove('hidden');
    
    // Calculate payment deadline from confirmation date (5 days)
    const confirmDate = registration.confirmedAt ? new Date(registration.confirmedAt) : new Date();
    const deadline = new Date(confirmDate);
    deadline.setDate(deadline.getDate() + 5); // 5 days to pay (BR4)
    document.getElementById('paymentDeadline').value = formatDate(deadline);
    
    // Check if deadline passed
    const now = new Date();
    const daysLeft = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) {
        document.getElementById('paymentDeadlineWarning').textContent = `Đã quá hạn ${Math.abs(daysLeft)} ngày - Hồ sơ sẽ bị hủy (BR4)`;
        document.getElementById('paymentDeadlineWarning').classList.add('text-red-600', 'font-semibold');
    } else {
        document.getElementById('paymentDeadlineWarning').textContent = `Còn ${daysLeft} ngày`;
        document.getElementById('paymentDeadlineWarning').classList.add('text-yellow-600');
    }
    
    // Set payment amounts
    const depositFee = 500000;
    const entranceFee = 0; // Can be configured
    const totalFee = depositFee + entranceFee;
    
    document.getElementById('depositFee').textContent = formatCurrency(depositFee);
    document.getElementById('entranceFee').textContent = formatCurrency(entranceFee);
    document.getElementById('totalPaymentFee').textContent = formatCurrency(totalFee);
    document.getElementById('paymentAmount').value = formatCurrency(totalFee);
    
    // Check if payment already exists
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const existingPayment = storage.payments.find(p => 
        p.mssv === user.mssv && p.type === 'deposit' && p.status === 'completed'
    );
    
    if (existingPayment) {
        document.getElementById('step2').innerHTML += `
            <div class="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p class="text-sm text-green-700">
                    <strong>Đã thanh toán:</strong> ${formatCurrency(existingPayment.amount)} - ${formatDate(existingPayment.createdAt)}
                </p>
            </div>
        `;
    }
}

function showStep3(registration) {
    document.getElementById('step3').classList.remove('hidden');
    
    // Set minimum date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('appointmentDate').min = today;
    
    // If already scheduled, show info
    if (registration.appointmentScheduled && registration.appointmentDate) {
        document.getElementById('appointmentDate').value = registration.appointmentDate;
        document.getElementById('appointmentTime').value = registration.appointmentTime || '';
        showAppointmentInfo(registration);
    }
}

function showAppointmentInfo(registration) {
    if (registration.appointmentCode && registration.appointmentDate) {
        document.getElementById('appointmentInfo').classList.remove('hidden');
        document.getElementById('appointmentCodeDisplay').textContent = registration.appointmentCode;
        document.getElementById('appointmentDateDisplay').textContent = formatDate(registration.appointmentDate);
        document.getElementById('appointmentTimeDisplay').textContent = registration.appointmentTime || 'N/A';
        document.getElementById('appointmentCodeForPrint').textContent = registration.appointmentCode;
    }
}

function showStep4(registration) {
    document.getElementById('step4').classList.remove('hidden');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('contractStudentName').textContent = user.name || registration.fullName;
    document.getElementById('contractMSSV').textContent = user.mssv || registration.mssv;
    document.getElementById('contractRoom').textContent = registration.roomId || 'N/A';
    document.getElementById('contractDate').textContent = formatDate(new Date());
    
    // Show appointment reminder
    if (registration.appointmentCode) {
        document.getElementById('reminderAppointmentCode').textContent = registration.appointmentCode;
    }
}

function confirmReservation() {
    if (!document.getElementById('confirmReservationCheck').checked) {
        showNotification('Vui lòng xác nhận đồng ý với các điều khoản!', 'error');
        return;
    }
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (!registration) {
        showNotification('Không tìm thấy đơn đăng ký!', 'error');
        return;
    }
    
    // Check deadline
    const approvalDate = registration.approvedAt ? new Date(registration.approvedAt) : new Date(registration.createdAt);
    const deadline = new Date(approvalDate);
    deadline.setDate(deadline.getDate() + 7);
    
    if (new Date() > deadline) {
        showNotification('Đã quá thời hạn xác nhận giữ chỗ!', 'error');
        return;
    }
    
    // Check if room is still available
    if (registration.roomId) {
        const room = storage.rooms.find(r => r.id === registration.roomId);
        if (room && room.status !== 'available' && room.status !== 'reserved') {
            showNotification('Phòng đã được phân cho người khác!', 'error');
            return;
        }
    }
    
    registration.confirmed = true;
    registration.confirmedAt = new Date().toISOString();
    registration.updatedAt = new Date().toISOString();
    
    showNotification('Đã xác nhận giữ chỗ thành công!', 'success');
    setTimeout(() => location.reload(), 1500);
}

function goToPayment() {
    // Check deadline before allowing payment
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (registration && registration.confirmedAt) {
        const confirmDate = new Date(registration.confirmedAt);
        const deadline = new Date(confirmDate);
        deadline.setDate(deadline.getDate() + 5);
        
        if (new Date() > deadline) {
            if (confirm('Đã quá hạn thanh toán. Hồ sơ sẽ bị hủy. Bạn có muốn tiếp tục? (BR4)')) {
                // Cancel registration
                registration.status = 'rejected';
                registration.rejectionReason = 'Quá hạn thanh toán phí giữ chỗ';
                showNotification('Hồ sơ đã bị hủy do quá hạn thanh toán!', 'error');
                setTimeout(() => {
                    window.location.href = 'student-dashboard.html';
                }, 2000);
                return;
            } else {
                return;
            }
        }
    }
    
    window.location.href = 'student-payment.html';
}

function scheduleAppointment() {
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    
    if (!date || !time) {
        showNotification('Vui lòng chọn đầy đủ ngày và giờ hẹn!', 'error');
        return;
    }

    // Check if date is in the future (BR1)
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
        showNotification('Vui lòng chọn ngày trong tương lai!', 'error');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (!registration) {
        showNotification('Không tìm thấy đơn đăng ký!', 'error');
        return;
    }
    
    // Check if payment is completed (BR3)
    const payment = storage.payments.find(p => 
        p.mssv === user.mssv && p.type === 'deposit' && p.status === 'completed'
    );
    
    if (!payment) {
        showNotification('Vui lòng thanh toán phí giữ chỗ trước khi đăng ký lịch hẹn! (BR3)', 'error');
        return;
    }
    
    registration.appointmentScheduled = true;
    registration.appointmentDate = date;
    registration.appointmentTime = time;
    registration.appointmentCode = 'AP' + Date.now();
    registration.updatedAt = new Date().toISOString();
    
    showNotification('Đã đăng ký lịch hẹn thành công! Mã hẹn: ' + registration.appointmentCode, 'success');
    
    // Show appointment info
    showAppointmentInfo(registration);
    
    setTimeout(() => {
        document.getElementById('step3').scrollIntoView({ behavior: 'smooth' });
    }, 500);
}

function signContract() {
    if (!document.getElementById('agreeContract').checked) {
        showNotification('Vui lòng đồng ý với các điều khoản!', 'error');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (!registration) {
        showNotification('Không tìm thấy đơn đăng ký!', 'error');
        return;
    }
    
    // Check if payment is completed (BR3)
    const payment = storage.payments.find(p => 
        p.mssv === user.mssv && p.type === 'deposit' && p.status === 'completed'
    );
    
    if (!payment) {
        showNotification('Vui lòng thanh toán phí giữ chỗ/đầu vào trước khi ký biên bản! (BR3)', 'error');
        return;
    }
    
    // Check if appointment is scheduled (BR1)
    if (!registration.appointmentScheduled || !registration.appointmentDate) {
        showNotification('Vui lòng đăng ký lịch hẹn trước khi ký biên bản! (BR1)', 'error');
        return;
    }
    
    registration.contractSigned = true;
    registration.contractSignedAt = new Date().toISOString();
    registration.status = 'completed';
    registration.updatedAt = new Date().toISOString();
    
    showNotification('Đã ký biên bản thành công! (BR4)', 'success');
    
    // Show completed status with appointment info
    setTimeout(() => {
        showCompletedStatus(registration);
    }, 500);
}

function showCompletedStatus(registration) {
    document.getElementById('step1').classList.add('hidden');
    document.getElementById('step2').classList.add('hidden');
    document.getElementById('step3').classList.add('hidden');
    document.getElementById('step4').classList.add('hidden');
    
    document.getElementById('completed').classList.remove('hidden');
    
    // Fill appointment info
    if (registration.appointmentCode) {
        document.getElementById('completedAppointmentCode').textContent = registration.appointmentCode;
    }
    if (registration.appointmentDate) {
        document.getElementById('completedAppointmentDate').textContent = formatDate(registration.appointmentDate);
    }
    if (registration.appointmentTime) {
        document.getElementById('completedAppointmentTime').textContent = registration.appointmentTime;
    }
    if (registration.roomId) {
        document.getElementById('completedRoom').textContent = registration.roomId;
    }
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ duyệt',
        'approved': 'Đã duyệt',
        'rejected': 'Từ chối',
        'completed': 'Hoàn tất'
    };
    return statusMap[status] || status;
}

function getStatusColor(status) {
    const colorMap = {
        'pending': 'text-yellow-600',
        'approved': 'text-green-600',
        'rejected': 'text-red-600',
        'completed': 'text-blue-600'
    };
    return colorMap[status] || 'text-gray-600';
}

