// Student Fee Request Logic
document.addEventListener('DOMContentLoaded', () => {
    loadFeeRequestPage();
});

function loadFeeRequestPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    // Load request period
    const config = storage.systemConfig;
    const startDate = new Date(config.feeExemptionPeriod.start);
    const endDate = new Date(config.feeExemptionPeriod.end);
    document.getElementById('requestPeriod').textContent = 
        `${formatDate(startDate)} - ${formatDate(endDate)}`;

    // Check if request period is open (for demo, always allow)
    const now = new Date();
    // Set time to 00:00:00 for accurate date comparison
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    if (nowDate < startDateOnly || nowDate > endDateOnly) {
        // For demo purposes, show warning but still allow request
        const warningDiv = document.createElement('div');
        warningDiv.className = 'bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6';
        warningDiv.innerHTML = `
            <p class="text-sm text-yellow-700">
                <strong>Lưu ý:</strong> Hiện tại ngoài thời gian nhận đơn quy định. 
                Tuy nhiên, bạn vẫn có thể gửi yêu cầu trong chế độ demo.
            </p>
        `;
        const form = document.getElementById('feeRequestForm');
        if (form && form.parentNode) {
            form.parentNode.insertBefore(warningDiv, form);
        }
    }

    // Auto-fill user info
    document.getElementById('mssv').value = user.mssv || '';
    document.getElementById('fullName').value = user.name || '';

    // Setup form submission
    document.getElementById('feeRequestForm').addEventListener('submit', handleFeeRequestSubmit);

    // Load request history
    loadRequestHistory(user.mssv);
}

function handleFeeRequestSubmit(e) {
    e.preventDefault();
    
    const user = JSON.parse(localStorage.getItem('currentUser'));
    const formData = new FormData(e.target);
    
    // Check request period (BR1) - For demo, allow request
    const config = storage.systemConfig;
    const now = new Date();
    const startDate = new Date(config.feeExemptionPeriod.start);
    const endDate = new Date(config.feeExemptionPeriod.end);
    
    // Set time to 00:00:00 for accurate date comparison
    const nowDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const startDateOnly = new Date(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
    const endDateOnly = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
    
    if (nowDate < startDateOnly || nowDate > endDateOnly) {
        // For demo, show warning but allow
        console.log('Request outside period, but allowing for demo');
    }

    // Check if has outstanding debt (BR3)
    const outstandingPayments = storage.payments.filter(p => 
        p.mssv === user.mssv && p.status === 'pending' && p.amount > 0
    );
    
    if (outstandingPayments.length > 0) {
        showNotification('Bạn còn nợ phí kỳ trước. Vui lòng thanh toán trước khi nộp đơn!', 'error');
        return;
    }

    // Validate required fields (BR2)
    if (!formData.get('requestType') || !formData.get('reason')) {
        showNotification('Vui lòng điền đầy đủ thông tin!', 'error');
        return;
    }

    // Create fee request
    const feeRequest = {
        id: 'FR' + Date.now(),
        mssv: user.mssv,
        fullName: formData.get('fullName'),
        phone: formData.get('phone'),
        email: formData.get('email'),
        requestType: formData.get('requestType'),
        reason: formData.get('reason'),
        supportingDocs: formData.get('supportingDocs') ? Array.from(formData.getAll('supportingDocs')).map(f => f.name) : [],
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };

    storage.feeRequests.push(feeRequest);
    
    showNotification('Đơn xin miễn/giảm phí đã được gửi thành công! Mã đơn: ' + feeRequest.id, 'success');
    
    // Reset form
    e.target.reset();
    document.getElementById('mssv').value = user.mssv || '';
    document.getElementById('fullName').value = user.name || '';
    
    // Reload history
    loadRequestHistory(user.mssv);
}

function loadRequestHistory(mssv) {
    const requests = storage.feeRequests.filter(r => r.mssv === mssv);
    const historyDiv = document.getElementById('requestHistory');
    
    if (requests.length === 0) {
        historyDiv.innerHTML = '<p class="text-gray-500">Chưa có yêu cầu nào</p>';
        return;
    }

    requests.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    historyDiv.innerHTML = requests.map(request => {
        const statusText = getStatusText(request.status);
        const statusColor = getStatusColor(request.status);
        const typeText = getRequestTypeText(request.requestType);
        
        return `
            <div class="border rounded-lg p-4">
                <div class="flex items-center justify-between mb-2">
                    <div>
                        <p class="font-semibold text-gray-900">${typeText}</p>
                        <p class="text-sm text-gray-500">Mã đơn: ${request.id}</p>
                    </div>
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor} bg-opacity-20">
                        ${statusText}
                    </span>
                </div>
                <p class="text-sm text-gray-700 mb-2">${request.reason}</p>
                <p class="text-xs text-gray-500">Ngày gửi: ${formatDate(request.createdAt)}</p>
            </div>
        `;
    }).join('');
}

function getStatusText(status) {
    const statusMap = {
        'pending': 'Chờ xử lý',
        'approved': 'Đã duyệt',
        'rejected': 'Bị từ chối'
    };
    return statusMap[status] || status;
}

function getStatusColor(status) {
    const colorMap = {
        'pending': 'text-yellow-600',
        'approved': 'text-green-600',
        'rejected': 'text-red-600'
    };
    return colorMap[status] || 'text-gray-600';
}

function getRequestTypeText(type) {
    const typeMap = {
        'exemption': 'Xin miễn phí',
        'reduction': 'Xin giảm phí',
        'refund': 'Xin hoàn phí'
    };
    return typeMap[type] || type;
}

