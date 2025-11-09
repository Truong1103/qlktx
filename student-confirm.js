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
    } else if (registration.confirmed && !registration.paid) {
        showStep2(registration);
    } else if (registration.paid && !registration.appointmentScheduled) {
        showStep3(registration);
    } else if (registration.appointmentScheduled && !registration.contractSigned) {
        showStep4(registration);
    } else if (registration.contractSigned) {
        document.getElementById('completed').classList.remove('hidden');
    }
}

function showStep1(registration) {
    document.getElementById('step1').classList.remove('hidden');
    document.getElementById('assignedRoom').value = registration.roomId || 'Chưa phân phòng';
    
    const deadline = new Date(registration.createdAt);
    deadline.setDate(deadline.getDate() + 7); // 7 days to confirm
    document.getElementById('confirmDeadline').value = formatDate(deadline);
}

function showStep2(registration) {
    document.getElementById('step2').classList.remove('hidden');
    document.getElementById('paymentAmount').value = formatCurrency(500000); // Deposit fee
    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 5); // 5 days to pay
    document.getElementById('paymentDeadline').value = formatDate(deadline);
}

function showStep3(registration) {
    document.getElementById('step3').classList.remove('hidden');
}

function showStep4(registration) {
    document.getElementById('step4').classList.remove('hidden');
    const user = JSON.parse(localStorage.getItem('currentUser'));
    document.getElementById('contractStudentName').textContent = user.name || registration.fullName;
    document.getElementById('contractRoom').textContent = registration.roomId || 'N/A';
    document.getElementById('contractDate').textContent = formatDate(new Date());
}

function confirmReservation() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (registration) {
        registration.confirmed = true;
        registration.confirmedAt = new Date().toISOString();
        showNotification('Đã xác nhận giữ chỗ thành công!', 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

function goToPayment() {
    window.location.href = 'student-payment.html';
}

function scheduleAppointment() {
    const date = document.getElementById('appointmentDate').value;
    const time = document.getElementById('appointmentTime').value;
    
    if (!date || !time) {
        showNotification('Vui lòng chọn đầy đủ ngày và giờ hẹn!', 'error');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (registration) {
        registration.appointmentScheduled = true;
        registration.appointmentDate = date;
        registration.appointmentTime = time;
        registration.appointmentCode = 'AP' + Date.now();
        showNotification('Đã đăng ký lịch hẹn thành công! Mã hẹn: ' + registration.appointmentCode, 'success');
        setTimeout(() => location.reload(), 1500);
    }
}

function signContract() {
    if (!document.getElementById('agreeContract').checked) {
        showNotification('Vui lòng đồng ý với các điều khoản!', 'error');
        return;
    }

    const user = JSON.parse(localStorage.getItem('currentUser'));
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    
    if (registration) {
        registration.contractSigned = true;
        registration.contractSignedAt = new Date().toISOString();
        registration.status = 'completed';
        showNotification('Đã ký biên bản thành công!', 'success');
        setTimeout(() => location.reload(), 1500);
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

