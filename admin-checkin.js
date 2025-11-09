// Admin Check-in Logic
let currentStudent = null;

document.addEventListener('DOMContentLoaded', () => {
    loadCheckinPage();
});

function loadCheckinPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    loadTodayAppointments();
    updateCheckinStatistics();
    
    document.getElementById('checkinForm').addEventListener('submit', handleSearch);
}

function updateCheckinStatistics() {
    const today = new Date().toISOString().split('T')[0];
    const todayApps = storage.registrations.filter(r => 
        r.appointmentDate === today && r.appointmentScheduled && r.paid
    );
    const checkedIn = storage.registrations.filter(r => r.checkedIn);
    const pendingCheckin = storage.registrations.filter(r => 
        r.status === 'approved' && r.paid && !r.checkedIn
    );
    
    document.getElementById('todayCount').textContent = todayApps.length;
    document.getElementById('checkedInCount').textContent = checkedIn.length;
    document.getElementById('pendingCheckinCount').textContent = pendingCheckin.length;
    document.getElementById('totalCheckedIn').textContent = checkedIn.length;
}

function loadTodayAppointments() {
    const today = new Date().toISOString().split('T')[0];
    let appointments = storage.registrations.filter(r => 
        r.appointmentDate === today && r.appointmentScheduled && r.paid
    );
    
    // If no appointments today, show upcoming appointments for demo
    if (appointments.length === 0) {
        appointments = storage.registrations.filter(r => 
            r.appointmentScheduled && r.paid && r.status === 'approved' && !r.checkedIn
        ).slice(0, 3);
    }

    const appointmentsDiv = document.getElementById('todayAppointments');

    if (appointments.length === 0) {
        appointmentsDiv.innerHTML = '<p class="text-gray-500">Không có lịch hẹn nào</p>';
        return;
    }

    appointmentsDiv.innerHTML = appointments.map(reg => {
        const timeUntil = reg.appointmentTime ? 
            `Giờ hẹn: ${reg.appointmentTime}` : 
            'Chưa có giờ hẹn';
        
        return `
            <div class="border rounded-lg p-4 hover:shadow-md transition bg-white">
                <div class="flex items-start justify-between">
                    <div class="flex-1">
                        <div class="flex items-center space-x-2 mb-2">
                            <p class="font-semibold text-lg text-gray-900">${reg.fullName}</p>
                            <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">
                                ${reg.appointmentCode || 'N/A'}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mb-3">
                            <div>
                                <p class="text-gray-500">MSSV:</p>
                                <p class="font-medium">${reg.mssv}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Phòng:</p>
                                <p class="font-medium text-blue-600">${reg.roomId || 'Chưa phân'}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">${timeUntil}</p>
                                <p class="text-xs text-gray-400">Ngày: ${formatDate(reg.appointmentDate || reg.createdAt)}</p>
                            </div>
                        </div>
                        <div class="flex items-center space-x-4 text-xs text-gray-500">
                            <span>SĐT: ${reg.phone}</span>
                            <span>Email: ${reg.email}</span>
                        </div>
                    </div>
                    <div class="ml-4 flex flex-col space-y-2">
                        <button onclick="selectAppointment('${reg.id}')" 
                            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm whitespace-nowrap">
                            Tiếp nhận
                        </button>
                        <button onclick="viewStudentDetail('${reg.id}')" 
                            class="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm whitespace-nowrap">
                            Chi tiết
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function viewStudentDetail(regId) {
    const reg = storage.registrations.find(r => r.id === regId);
    if (!reg) return;
    
    const detailHtml = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Họ tên:</p>
                    <p class="font-semibold">${reg.fullName}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">MSSV:</p>
                    <p class="font-semibold">${reg.mssv}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Phòng:</p>
                    <p class="font-semibold text-blue-600">${reg.roomId || 'Chưa phân'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Mã hẹn:</p>
                    <p class="font-semibold">${reg.appointmentCode || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Ngày hẹn:</p>
                    <p class="font-semibold">${formatDate(reg.appointmentDate || reg.createdAt)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Giờ hẹn:</p>
                    <p class="font-semibold">${reg.appointmentTime || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">SĐT:</p>
                    <p class="font-semibold">${reg.phone}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Email:</p>
                    <p class="font-semibold">${reg.email}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">CMND/CCCD:</p>
                    <p class="font-semibold">${reg.idCard}</p>
                </div>
            </div>
        </div>
    `;
    
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Chi tiết sinh viên</h3>
                <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-gray-600">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </button>
            </div>
            ${detailHtml}
        </div>
    `;
    document.body.appendChild(modal);
}

function selectAppointment(regId) {
    const reg = storage.registrations.find(r => r.id === regId);
    if (reg) {
        loadStudentInfo(reg);
    }
}

function handleSearch(e) {
    e.preventDefault();
    
    const code = document.getElementById('appointmentCode').value.trim();
    if (!code) {
        showNotification('Vui lòng nhập mã hẹn hoặc MSSV!', 'error');
        return;
    }

    // Search by appointment code or MSSV
    const reg = storage.registrations.find(r => 
        r.appointmentCode === code || r.mssv === code
    );

    if (!reg) {
        showNotification('Không tìm thấy thông tin!', 'error');
        return;
    }

    loadStudentInfo(reg);
}

function loadStudentInfo(reg) {
    currentStudent = reg;
    
    // Check if student is eligible (BR1)
    if (reg.status !== 'approved' && reg.status !== 'completed') {
        showNotification('Sinh viên chưa được duyệt đăng ký!', 'error');
        return;
    }

    // Check payment status (BR1)
    const payment = storage.payments.find(p => 
        p.mssv === reg.mssv && p.type === 'deposit' && p.status === 'completed'
    );

    if (!payment) {
        showNotification('Sinh viên chưa thanh toán phí giữ chỗ!', 'error');
        return;
    }

    // Check if contract is signed (BR4)
    if (!reg.contractSigned) {
        showNotification('Sinh viên chưa ký biên bản bàn giao phòng!', 'error');
        return;
    }

    document.getElementById('studentInfo').classList.remove('hidden');
    document.getElementById('studentInfoContent').innerHTML = `
        <div class="space-y-4">
            <div class="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
                <p class="text-sm text-blue-700">
                    <strong>Thông báo:</strong> Sinh viên đã đủ điều kiện vào ở. Vui lòng xác thực thông tin và hoàn tất thủ tục.
                </p>
            </div>
            
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500 mb-1">Họ tên:</p>
                    <p class="font-semibold text-lg">${reg.fullName}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">MSSV:</p>
                    <p class="font-semibold text-lg">${reg.mssv}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Phòng:</p>
                    <p class="font-semibold text-lg text-blue-600">${reg.roomId || 'Chưa phân'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Mã hẹn:</p>
                    <p class="font-semibold text-lg">${reg.appointmentCode || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Ngày hẹn:</p>
                    <p class="font-semibold">${formatDate(reg.appointmentDate || reg.createdAt)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Giờ hẹn:</p>
                    <p class="font-semibold">${reg.appointmentTime || 'N/A'}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">SĐT:</p>
                    <p class="font-medium">${reg.phone}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Email:</p>
                    <p class="font-medium">${reg.email}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">CMND/CCCD:</p>
                    <p class="font-medium">${reg.idCard}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500 mb-1">Ngày sinh:</p>
                    <p class="font-medium">${formatDate(reg.dob)}</p>
                </div>
            </div>
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <h4 class="font-semibold text-gray-900 mb-2">Trạng thái thanh toán</h4>
                <p class="text-sm text-gray-700">
                    <span class="px-2 py-1 rounded bg-green-100 text-green-800 font-semibold">Đã thanh toán</span>
                    ${payment ? ` - ${formatCurrency(payment.amount)}` : ''}
                </p>
            </div>
        </div>
    `;

    document.getElementById('verificationSection').classList.remove('hidden');
}

function completeCheckin() {
    if (!currentStudent) {
        showNotification('Vui lòng tìm kiếm sinh viên trước!', 'error');
        return;
    }

    // Verify all checks (BR3)
    if (!document.getElementById('verifyId').checked) {
        showNotification('Vui lòng xác nhận đã đối chiếu giấy tờ!', 'error');
        return;
    }

    if (!document.getElementById('verifyPayment').checked) {
        showNotification('Vui lòng xác nhận đã kiểm tra thanh toán!', 'error');
        return;
    }

    if (!document.getElementById('verifyContract').checked) {
        showNotification('Vui lòng xác nhận đã ký biên bản!', 'error');
        return;
    }

    // Update registration status (BR3)
    currentStudent.status = 'completed';
    currentStudent.checkedIn = true;
    currentStudent.checkedInAt = new Date().toISOString();
    currentStudent.updatedAt = new Date().toISOString();

    // Update room status
    const room = storage.rooms.find(r => r.id === currentStudent.roomId);
    if (room) {
        room.status = 'occupied';
    }

    showNotification('Đã hoàn tất thủ tục vào ở!', 'success');

    // Reset form
    document.getElementById('checkinForm').reset();
    document.getElementById('studentInfo').classList.add('hidden');
    document.getElementById('verificationSection').classList.add('hidden');
    document.getElementById('verifyId').checked = false;
    document.getElementById('verifyPayment').checked = false;
    document.getElementById('verifyContract').checked = false;
    currentStudent = null;

    // Reload appointments and statistics
    loadTodayAppointments();
    updateCheckinStatistics();
}

