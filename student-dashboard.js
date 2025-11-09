// Student Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    loadStudentDashboard();
});

function loadStudentDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'student') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('userName').textContent = user.name || user.username;

    // Load registration status
    const registration = storage.registrations.find(r => r.mssv === user.mssv);
    if (registration) {
        document.getElementById('regStatus').textContent = getStatusText(registration.status);
        document.getElementById('regStatus').className = 'mt-2 text-2xl font-semibold ' + getStatusColor(registration.status);
        
        if (registration.roomId) {
            document.getElementById('assignedRoom').textContent = registration.roomId;
        }
    }

    // Load pending fees
    const pendingPayments = storage.payments.filter(p => p.mssv === user.mssv && p.status === 'pending');
    const totalPending = pendingPayments.reduce((sum, p) => sum + p.amount, 0);
    document.getElementById('pendingFee').textContent = formatCurrency(totalPending);

    // Load pending requests
    const pendingRequests = storage.feeRequests.filter(r => r.mssv === user.mssv && r.status === 'pending');
    document.getElementById('pendingRequests').textContent = pendingRequests.length;

    // Load recent activity
    loadRecentActivity(user.mssv);
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

function loadRecentActivity(mssv) {
    const activityDiv = document.getElementById('recentActivity');
    const activities = [];

    // Get registration activities
    const reg = storage.registrations.find(r => r.mssv === mssv);
    if (reg) {
        activities.push({
            type: 'Đăng ký KTX',
            status: reg.status,
            date: reg.createdAt,
            message: `Đơn đăng ký KTX - ${getStatusText(reg.status)}`
        });
    }

    // Get payment activities
    const payments = storage.payments.filter(p => p.mssv === mssv).slice(0, 3);
    payments.forEach(p => {
        activities.push({
            type: 'Thanh toán',
            status: p.status,
            date: p.createdAt,
            message: `Thanh toán ${formatCurrency(p.amount)} - ${getStatusText(p.status)}`
        });
    });

    // Get fee request activities
    const feeRequests = storage.feeRequests.filter(r => r.mssv === mssv).slice(0, 2);
    feeRequests.forEach(r => {
        activities.push({
            type: 'Yêu cầu miễn/giảm phí',
            status: r.status,
            date: r.createdAt,
            message: `Yêu cầu miễn/giảm phí - ${getStatusText(r.status)}`
        });
    });

    if (activities.length === 0) {
        activityDiv.innerHTML = '<p class="text-gray-500">Chưa có hoạt động nào</p>';
        return;
    }

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    activityDiv.innerHTML = activities.map(activity => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
                <p class="font-medium text-gray-900">${activity.message}</p>
                <p class="text-sm text-gray-500">${formatDate(activity.date)}</p>
            </div>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(activity.status)} bg-opacity-20">
                ${getStatusText(activity.status)}
            </span>
        </div>
    `).join('');
}

