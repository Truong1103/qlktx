// Admin Dashboard Logic
document.addEventListener('DOMContentLoaded', () => {
    loadAdminDashboard();
});

function loadAdminDashboard() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    document.getElementById('adminName').textContent = user.name || user.username;

    // Load statistics
    const pendingRegs = storage.registrations.filter(r => r.status === 'pending');
    document.getElementById('pendingRegistrations').textContent = pendingRegs.length;

    const pendingFeeReqs = storage.feeRequests.filter(r => r.status === 'pending');
    document.getElementById('pendingFeeRequests').textContent = pendingFeeReqs.length;

    // Count today's appointments
    const today = new Date().toISOString().split('T')[0];
    const todayApps = storage.registrations.filter(r => 
        r.appointmentDate === today && r.appointmentScheduled
    );
    document.getElementById('todayAppointments').textContent = todayApps.length;

    // Count available rooms
    const availableRooms = storage.rooms.filter(r => r.status === 'available');
    document.getElementById('availableRooms').textContent = availableRooms.length;

    // Load recent activity
    loadRecentActivity();
}

function loadRecentActivity() {
    const activityDiv = document.getElementById('recentActivity');
    const activities = [];

    // Get recent registrations
    const recentRegs = storage.registrations.slice(-5).reverse();
    recentRegs.forEach(reg => {
        activities.push({
            type: 'Đơn đăng ký',
            message: `Đơn ${reg.id} - ${reg.fullName} - ${getStatusText(reg.status)}`,
            date: reg.updatedAt || reg.createdAt
        });
    });

    // Get recent fee requests
    const recentFeeReqs = storage.feeRequests.slice(-3).reverse();
    recentFeeReqs.forEach(req => {
        activities.push({
            type: 'Yêu cầu phí',
            message: `Yêu cầu ${req.id} - ${req.fullName} - ${getStatusText(req.status)}`,
            date: req.updatedAt || req.createdAt
        });
    });

    if (activities.length === 0) {
        activityDiv.innerHTML = '<p class="text-gray-500">Chưa có hoạt động nào</p>';
        return;
    }

    activities.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    activityDiv.innerHTML = activities.slice(0, 10).map(activity => `
        <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
                <p class="font-medium text-gray-900">${activity.message}</p>
                <p class="text-sm text-gray-500">${activity.type} - ${formatDate(activity.date)}</p>
            </div>
        </div>
    `).join('');
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

