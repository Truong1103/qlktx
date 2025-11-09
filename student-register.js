// Student Registration Logic
document.addEventListener('DOMContentLoaded', () => {
    loadRegistrationPage();
});

function loadRegistrationPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    // Load registration period
    const config = storage.systemConfig;
    const startDate = new Date(config.registrationPeriod.start);
    const endDate = new Date(config.registrationPeriod.end);
    document.getElementById('regPeriod').textContent = 
        `${formatDate(startDate)} - ${formatDate(endDate)}`;

    // Check if registration period is open (for demo, always allow)
    const now = new Date();
    // Set time to 00:00:00 for accurate date comparison
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    if (nowDate < startDateOnly || nowDate > endDateOnly) {
        // For demo purposes, show warning but still allow registration
        const warningDiv = document.createElement('div');
        warningDiv.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6';
        warningDiv.innerHTML = `
            <p class="text-sm text-yellow-700">
                <strong>Lưu ý:</strong> Hiện tại ngoài thời gian nhận hồ sơ quy định. 
                Tuy nhiên, bạn vẫn có thể đăng ký trong chế độ demo.
            </p>
        `;
        const form = document.getElementById('registrationForm');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(warningDiv, form);
        }
    }

    // Auto-fill user info
    document.getElementById('mssv').value = user.mssv || '';
    document.getElementById('fullName').value = user.name || '';

    // Check if already registered (only block if pending or approved, allow if rejected)
    const existingReg = storage.registrations.find(r => 
        r.mssv === user.mssv && (r.status === 'pending' || r.status === 'approved' || r.status === 'completed')
    );
    if (existingReg) {
        // Show warning but still allow viewing the form for demo purposes
        if (existingReg.status === 'pending' || existingReg.status === 'approved' || existingReg.status === 'completed') {
            document.getElementById('alreadyRegistered').classList.remove('hidden');
            // Don't hide the form - allow viewing for demo
            document.getElementById('viewRegistration').onclick = () => {
                showRegistrationDetails(existingReg);
            };
        }
    }

    // Setup form submission
    document.getElementById('registrationForm').addEventListener('submit', handleRegistrationSubmit);
    
    // File upload preview
    const fileInput = document.getElementById('priorityDocs');
    const fileList = document.getElementById('fileList');
    
    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                let fileListHTML = '<div class="mt-2"><p class="text-sm font-medium text-gray-700">File đã chọn:</p><ul class="list-disc list-inside text-sm text-gray-600 mt-1">';
                for (let i = 0; i < files.length; i++) {
                    fileListHTML += `<li>${files[i].name} (${(files[i].size / 1024 / 1024).toFixed(2)} MB)</li>`;
                }
                fileListHTML += '</ul></div>';
                fileList.innerHTML = fileListHTML;
            } else {
                fileList.innerHTML = '';
            }
        });
    }
}

function handleRegistrationSubmit(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const formData = new FormData(e.target);
    
    // Check if already has pending/approved registration
    const existingReg = storage.registrations.find(r => 
        r.mssv === user.mssv && (r.status === 'pending' || r.status === 'approved' || r.status === 'completed')
    );
    
    if (existingReg) {
        showNotification('Bạn đã có đơn đăng ký đang xử lý. Vui lòng chờ kết quả hoặc liên hệ admin để hủy đơn cũ.', 'error');
        return;
    }
    
    // Validate student status (BR1)
    // In real app, this would check with student database
    if (!user.mssv) {
        showNotification('Mã số sinh viên không hợp lệ!', 'error');
        return;
    }

    // Check registration period (BR2) - For demo, allow registration
    const config = storage.systemConfig;
    const now = new Date();
    const startDate = new Date(config.registrationPeriod.start);
    const endDate = new Date(config.registrationPeriod.end);
    
    // Set time to 00:00:00 for accurate date comparison
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    if (nowDate < startDateOnly || nowDate > endDateOnly) {
        // For demo, show warning but allow
        console.log('Registration outside period, but allowing for demo');
    }

    // Create registration
    const registration = {
        id: 'REG' + Date.now(),
        mssv: user.mssv,
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        idCard: formData.get('idCard'),
        dob: formData.get('dob'),
        roomType: formData.get('roomType'),
        duration: formData.get('duration'),
        priorityDocs: formData.get('priorityDocs') ? formData.get('priorityDocs').name : null,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    // Validate required fields (BR3)
    if (!registration.fullName || !registration.phone || !registration.email || !registration.idCard) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    storage.registrations.push(registration);
    
    showNotification('Đơn đăng ký đã được gửi thành công!', 'success');
    
    setTimeout(() => {
        window.location.href = 'student-dashboard.html';
    }, 2000);
}

function showRegistrationDetails(registration) {
    alert(`Chi tiết đơn đăng ký:\n\n` +
          `Mã đơn: ${registration.id}\n` +
          `Trạng thái: ${getStatusText(registration.status)}\n` +
          `Loại phòng: ${registration.roomType} người\n` +
          `Thời hạn: ${registration.duration} học kỳ\n` +
          `Ngày tạo: ${formatDate(registration.createdAt)}`);
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

