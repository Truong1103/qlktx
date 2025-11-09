// Admin Process Registration Logic
let currentFilter = 'pending';

document.addEventListener('DOMContentLoaded', () => {
    loadProcessRegistrationPage();
});

let allRegistrations = [];
let filteredRegistrations = [];

function loadProcessRegistrationPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    allRegistrations = storage.registrations || [];
    filteredRegistrations = [...allRegistrations];
    
    loadRegistrations();
    updateCounts();
    updateStatistics();
}

function updateStatistics() {
    const total = allRegistrations.length;
    const pending = allRegistrations.filter(r => r.status === 'pending').length;
    const approved = allRegistrations.filter(r => r.status === 'approved').length;
    const rejected = allRegistrations.filter(r => r.status === 'rejected').length;
    
    document.getElementById('totalRegistrations').textContent = total;
    document.getElementById('pendingRegistrations').textContent = pending;
    document.getElementById('approvedRegistrations').textContent = approved;
    document.getElementById('rejectedRegistrations').textContent = rejected;
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const roomTypeFilter = document.getElementById('roomTypeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredRegistrations = allRegistrations.filter(reg => {
        const matchSearch = !searchTerm || 
            reg.mssv.toLowerCase().includes(searchTerm) ||
            reg.fullName.toLowerCase().includes(searchTerm) ||
            reg.id.toLowerCase().includes(searchTerm);
        
        const matchRoomType = roomTypeFilter === 'all' || reg.roomType === roomTypeFilter;
        
        let matchDate = true;
        if (dateFilter !== 'all') {
            const regDate = new Date(reg.createdAt);
            const now = new Date();
            switch(dateFilter) {
                case 'today':
                    matchDate = regDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchDate = regDate >= weekAgo;
                    break;
                case 'month':
                    matchDate = regDate.getMonth() === now.getMonth() && 
                               regDate.getFullYear() === now.getFullYear();
                    break;
            }
        }
        
        return matchSearch && matchRoomType && matchDate;
    });
    
    loadRegistrations();
}

function exportRegistrations() {
    const csv = [
        ['Mã đơn', 'MSSV', 'Họ tên', 'SĐT', 'Email', 'Loại phòng', 'Thời hạn', 'Trạng thái', 'Ngày đăng ký'].join(','),
        ...filteredRegistrations.map(r => [
            r.id,
            r.mssv,
            r.fullName,
            r.phone,
            r.email,
            r.roomType + ' người',
            r.duration + ' học kỳ',
            getStatusText(r.status),
            formatDate(r.createdAt)
        ].join(','))
    ].join('\n');
    
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `DanhSachDangKy_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    showNotification('Đã xuất danh sách thành công!', 'success');
}

function updateCounts() {
    const pending = filteredRegistrations.filter(r => r.status === 'pending').length;
    const approved = filteredRegistrations.filter(r => r.status === 'approved').length;
    const rejected = filteredRegistrations.filter(r => r.status === 'rejected').length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('rejectedCount').textContent = rejected;
}

function filterRegistrations(status) {
    currentFilter = status;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    event.target.classList.add('active', 'border-indigo-500', 'text-indigo-600');
    event.target.classList.remove('border-transparent', 'text-gray-500');
    
    loadRegistrations();
}

function loadRegistrations() {
    let filtered = [...filteredRegistrations];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.status === currentFilter);
    }

    const listDiv = document.getElementById('registrationsList');

    if (filtered.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-500 text-center py-8">Không có đơn đăng ký nào</p>';
        return;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    // Update counts for current filter
    updateCounts();

    listDiv.innerHTML = filtered.map(reg => {
        const statusText = getStatusText(reg.status);
        const statusColor = getStatusColor(reg.status);
        const daysSince = Math.floor((new Date() - new Date(reg.createdAt)) / (1000 * 60 * 60 * 24));
        const hasRoom = reg.roomId ? true : false;
        
        return `
            <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">${reg.fullName}</h3>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor} bg-opacity-20">
                                ${statusText}
                            </span>
                            ${hasRoom ? `<span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">Phòng: ${reg.roomId}</span>` : ''}
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                            <div>
                                <p class="text-gray-500">MSSV:</p>
                                <p class="font-medium">${reg.mssv}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Mã đơn:</p>
                                <p class="font-medium">${reg.id}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Ngày đăng ký:</p>
                                <p class="font-medium">${formatDate(reg.createdAt)}</p>
                                <p class="text-xs text-gray-400">${daysSince} ngày trước</p>
                            </div>
                            <div>
                                <p class="text-gray-500">SĐT:</p>
                                <p class="font-medium">${reg.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4 p-4 bg-gray-50 rounded-lg">
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Loại phòng:</p>
                        <p class="font-semibold text-gray-900">${reg.roomType} người</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Thời hạn:</p>
                        <p class="font-semibold text-gray-900">${reg.duration} học kỳ</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 mb-1">Email:</p>
                        <p class="font-semibold text-gray-900 text-sm truncate">${reg.email}</p>
                    </div>
                    <div>
                        <p class="text-xs text-gray-500 mb-1">CMND/CCCD:</p>
                        <p class="font-semibold text-gray-900">${reg.idCard}</p>
                    </div>
                </div>

                ${reg.status === 'approved' && reg.approvedAt ? `
                    <div class="mb-4 p-3 bg-green-50 rounded-lg">
                        <p class="text-sm text-green-700">
                            <strong>Đã duyệt:</strong> ${formatDate(reg.approvedAt)}
                            ${reg.roomId ? ` | <strong>Phòng:</strong> ${reg.roomId}` : ''}
                        </p>
                    </div>
                ` : ''}
                
                ${reg.status === 'rejected' && reg.rejectionReason ? `
                    <div class="mb-4 p-3 bg-red-50 rounded-lg">
                        <p class="text-sm text-red-700">
                            <strong>Lý do từ chối:</strong> ${reg.rejectionReason}
                        </p>
                    </div>
                ` : ''}

                <div class="flex justify-end space-x-2 flex-wrap gap-2">
                    <button onclick="viewDetail('${reg.id}')" 
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Chi tiết
                    </button>
                    ${reg.status === 'pending' ? `
                        <button onclick="approveRegistration('${reg.id}')" 
                            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Duyệt
                        </button>
                        <button onclick="rejectRegistration('${reg.id}')" 
                            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Từ chối
                        </button>
                    ` : ''}
                    ${reg.status === 'approved' && !reg.roomId ? `
                        <button onclick="assignRoom('${reg.id}')" 
                            class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm">
                            Phân phòng
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function viewDetail(regId) {
    const reg = storage.registrations.find(r => r.id === regId);
    if (!reg) return;

    const detailDiv = document.getElementById('registrationDetail');
    const daysSince = Math.floor((new Date() - new Date(reg.createdAt)) / (1000 * 60 * 60 * 24));
    
    detailDiv.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b">
                <div>
                    <h4 class="text-lg font-semibold text-gray-900">${reg.fullName}</h4>
                    <p class="text-sm text-gray-500">Mã đơn: ${reg.id}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(reg.status)} bg-opacity-20">
                    ${getStatusText(reg.status)}
                </span>
            </div>
            
            <!-- Personal Info -->
            <div>
                <h5 class="font-semibold text-gray-900 mb-3">Thông tin cá nhân</h5>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Họ tên:</p>
                        <p class="font-medium">${reg.fullName}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">MSSV:</p>
                        <p class="font-medium">${reg.mssv}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">SĐT:</p>
                        <p class="font-medium">${reg.phone}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Email:</p>
                        <p class="font-medium">${reg.email}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">CMND/CCCD:</p>
                        <p class="font-medium">${reg.idCard}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Ngày sinh:</p>
                        <p class="font-medium">${formatDate(reg.dob)}</p>
                    </div>
                </div>
            </div>
            
            <!-- Registration Info -->
            <div>
                <h5 class="font-semibold text-gray-900 mb-3">Thông tin đăng ký</h5>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Loại phòng:</p>
                        <p class="font-medium">${reg.roomType} người</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Thời hạn:</p>
                        <p class="font-medium">${reg.duration} học kỳ</p>
                    </div>
                    ${reg.roomId ? `
                        <div>
                            <p class="text-sm text-gray-500">Phòng được phân:</p>
                            <p class="font-medium text-blue-600">${reg.roomId}</p>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            <!-- Timeline -->
            <div>
                <h5 class="font-semibold text-gray-900 mb-3">Lịch sử xử lý</h5>
                <div class="space-y-2">
                    <div class="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium">Đơn được tạo</p>
                            <p class="text-xs text-gray-500">${formatDate(reg.createdAt)} (${daysSince} ngày trước)</p>
                        </div>
                    </div>
                    ${reg.approvedAt ? `
                        <div class="flex items-center space-x-3 p-2 bg-green-50 rounded">
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Đơn được duyệt</p>
                                <p class="text-xs text-gray-500">${formatDate(reg.approvedAt)}</p>
                            </div>
                        </div>
                    ` : ''}
                    ${reg.rejectedAt ? `
                        <div class="flex items-center space-x-3 p-2 bg-red-50 rounded">
                            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Đơn bị từ chối</p>
                                <p class="text-xs text-gray-500">${formatDate(reg.rejectedAt)}</p>
                                ${reg.rejectionReason ? `<p class="text-xs text-red-600 mt-1">Lý do: ${reg.rejectionReason}</p>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${reg.status === 'pending' ? `
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button onclick="closeDetailModal(); approveRegistration('${reg.id}')" 
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Duyệt
                    </button>
                    <button onclick="closeDetailModal(); rejectRegistration('${reg.id}')" 
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Từ chối
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('detailModal').classList.remove('hidden');
}

function assignRoom(regId) {
    const reg = storage.registrations.find(r => r.id === regId);
    if (!reg) return;
    
    const availableRooms = storage.rooms.filter(r => 
        r.status === 'available' && r.type.includes(reg.roomType)
    );
    
    if (availableRooms.length === 0) {
        showNotification('Không còn phòng trống phù hợp!', 'error');
        return;
    }
    
    const roomOptions = availableRooms.map(r => `${r.id} (${r.type})`).join('\n');
    const selected = prompt(`Chọn phòng:\n${roomOptions}\n\nNhập mã phòng:`, availableRooms[0].id);
    
    if (selected) {
        const room = availableRooms.find(r => r.id === selected);
        if (room) {
            reg.roomId = room.id;
            room.status = 'reserved';
            reg.updatedAt = new Date().toISOString();
            showNotification('Đã phân phòng thành công!', 'success');
            loadRegistrations();
        } else {
            showNotification('Phòng không hợp lệ!', 'error');
        }
    }
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function approveRegistration(regId) {
    const reg = storage.registrations.find(r => r.id === regId);
    if (!reg) return;

    // Check if there are available rooms (BR1)
    const availableRooms = storage.rooms.filter(r => 
        r.status === 'available' && r.type.includes(reg.roomType)
    );

    if (availableRooms.length === 0) {
        const assignAnyway = confirm('Không còn phòng trống phù hợp! Bạn có muốn duyệt đơn mà không phân phòng ngay?');
        if (!assignAnyway) return;
    }

    // Assign room if available (BR2)
    if (availableRooms.length > 0) {
        const assignedRoom = availableRooms[0];
        reg.roomId = assignedRoom.id;
        assignedRoom.status = 'reserved';
    }
    
    reg.status = 'approved';
    reg.approvedAt = new Date().toISOString();
    reg.updatedAt = new Date().toISOString();

    // Create payment notification (BR2)
    const payment = {
        id: 'PAY' + Date.now(),
        mssv: reg.mssv,
        type: 'deposit',
        amount: 500000, // Deposit fee
        status: 'pending',
        createdAt: new Date().toISOString()
    };
    storage.payments.push(payment);

    showNotification('Đơn đăng ký đã được duyệt!' + (reg.roomId ? ' Phòng: ' + reg.roomId : ''), 'success');
    
    closeDetailModal();
    allRegistrations = storage.registrations || [];
    filteredRegistrations = [...allRegistrations];
    loadRegistrations();
    updateCounts();
    updateStatistics();
}

function rejectRegistration(regId) {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason || reason.trim() === '') {
        showNotification('Vui lòng nhập lý do từ chối!', 'error');
        return;
    }

    const reg = storage.registrations.find(r => r.id === regId);
    if (!reg) return;

    reg.status = 'rejected';
    reg.rejectionReason = reason.trim();
    reg.rejectedAt = new Date().toISOString();
    reg.updatedAt = new Date().toISOString();

    showNotification('Đơn đăng ký đã bị từ chối!', 'info');
    
    closeDetailModal();
    allRegistrations = storage.registrations || [];
    filteredRegistrations = [...allRegistrations];
    loadRegistrations();
    updateCounts();
    updateStatistics();
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


