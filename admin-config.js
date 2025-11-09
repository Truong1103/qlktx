// Admin Config Logic
document.addEventListener('DOMContentLoaded', () => {
    loadConfigPage();
});

function loadConfigPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    // Load current config
    const config = storage.systemConfig;
    document.getElementById('regStart').value = config.registrationPeriod.start;
    document.getElementById('regEnd').value = config.registrationPeriod.end;
    document.getElementById('feeStart').value = config.feeExemptionPeriod.start;
    document.getElementById('feeEnd').value = config.feeExemptionPeriod.end;

    // Setup form submission
    document.getElementById('configForm').addEventListener('submit', handleConfigSubmit);
    document.getElementById('addRoomForm').addEventListener('submit', handleAddRoom);

    // Initialize room search
    document.getElementById('roomSearch').addEventListener('input', filterRooms);
    
    // Load rooms
    loadRooms();
}

function handleConfigSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    // Validate dates
    const regStart = new Date(formData.get('regStart'));
    const regEnd = new Date(formData.get('regEnd'));
    const feeStart = new Date(formData.get('feeStart'));
    const feeEnd = new Date(formData.get('feeEnd'));

    if (regStart >= regEnd) {
        showNotification('Thời gian đăng ký không hợp lệ!', 'error');
        return;
    }

    if (feeStart >= feeEnd) {
        showNotification('Thời gian xin miễn/giảm phí không hợp lệ!', 'error');
        return;
    }

    // Update config
    storage.systemConfig = {
        registrationPeriod: {
            start: formData.get('regStart'),
            end: formData.get('regEnd')
        },
        feeExemptionPeriod: {
            start: formData.get('feeStart'),
            end: formData.get('feeEnd')
        }
    };

    // Log the change (BR2)
    console.log('Config updated by:', JSON.parse(localStorage.getItem('currentUser')).username);
    
    showNotification('Cấu hình đã được cập nhật thành công!', 'success');
}

function resetConfig() {
    document.getElementById('regStart').value = storage.systemConfig.registrationPeriod.start;
    document.getElementById('regEnd').value = storage.systemConfig.registrationPeriod.end;
    document.getElementById('feeStart').value = storage.systemConfig.feeExemptionPeriod.start;
    document.getElementById('feeEnd').value = storage.systemConfig.feeExemptionPeriod.end;
}

let allRooms = [];
let filteredRooms = [];

function loadRooms() {
    allRooms = storage.rooms || [];
    filteredRooms = [...allRooms];
    updateRoomStatistics();
    renderRooms();
}

function updateRoomStatistics() {
    const total = allRooms.length;
    const available = allRooms.filter(r => r.status === 'available').length;
    const reserved = allRooms.filter(r => r.status === 'reserved').length;
    const occupied = allRooms.filter(r => r.status === 'occupied').length;
    
    document.getElementById('totalRooms').textContent = total;
    document.getElementById('availableRooms').textContent = available;
    document.getElementById('reservedRooms').textContent = reserved;
    document.getElementById('occupiedRooms').textContent = occupied;
}

function filterRooms() {
    const searchTerm = document.getElementById('roomSearch').value.toLowerCase();
    const statusFilter = document.getElementById('roomStatusFilter').value;
    const typeFilter = document.getElementById('roomTypeFilter').value;
    
    filteredRooms = allRooms.filter(room => {
        const matchSearch = room.id.toLowerCase().includes(searchTerm) || 
                           room.type.toLowerCase().includes(searchTerm);
        const matchStatus = statusFilter === 'all' || room.status === statusFilter;
        const matchType = typeFilter === 'all' || room.type === typeFilter;
        
        return matchSearch && matchStatus && matchType;
    });
    
    renderRooms();
}

function renderRooms() {
    const roomsTable = document.getElementById('roomsTable');
    
    if (filteredRooms.length === 0) {
        roomsTable.innerHTML = '<tr><td colspan="6" class="px-6 py-4 text-center text-gray-500">Không tìm thấy phòng nào</td></tr>';
        return;
    }

    roomsTable.innerHTML = filteredRooms.map(room => {
        const statusInfo = getRoomStatusInfo(room.status);
        const students = getStudentsInRoom(room.id);
        const studentCount = students.length;
        const maxCapacity = parseInt(room.type.split(' ')[0]);
        
        return `
            <tr class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap">
                    <div class="flex items-center">
                        <span class="text-sm font-medium text-gray-900">${room.id}</span>
                    </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${room.type}</td>
                <td class="px-6 py-4 whitespace-nowrap">
                    <span class="px-2 py-1 text-xs font-semibold rounded-full ${statusInfo.color}">
                        ${statusInfo.text}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <span class="${studentCount >= maxCapacity ? 'text-red-600 font-semibold' : ''}">
                        ${studentCount}/${maxCapacity}
                    </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${formatCurrency(room.price)}</td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div class="flex space-x-2">
                        <button onclick="viewRoomDetail('${room.id}')" 
                            class="text-blue-600 hover:text-blue-900">Chi tiết</button>
                        <button onclick="editRoom('${room.id}')" 
                            class="text-indigo-600 hover:text-indigo-900">Sửa</button>
                        <button onclick="deleteRoom('${room.id}')" 
                            class="text-red-600 hover:text-red-900">Xóa</button>
                    </div>
                </td>
            </tr>
        `;
    }).join('');
}

function getRoomStatusInfo(status) {
    const statusMap = {
        'available': { text: 'Trống', color: 'bg-green-100 text-green-800' },
        'reserved': { text: 'Đã đặt', color: 'bg-yellow-100 text-yellow-800' },
        'occupied': { text: 'Đã ở', color: 'bg-red-100 text-red-800' }
    };
    return statusMap[status] || { text: status, color: 'bg-gray-100 text-gray-800' };
}

function getStudentsInRoom(roomId) {
    return storage.registrations.filter(r => r.roomId === roomId && r.status === 'approved');
}

function viewRoomDetail(roomId) {
    const room = storage.rooms.find(r => r.id === roomId);
    if (!room) return;
    
    const students = getStudentsInRoom(roomId);
    const maxCapacity = parseInt(room.type.split(' ')[0]);
    
    const detailHtml = `
        <div class="space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <p class="text-sm text-gray-500">Mã phòng:</p>
                    <p class="font-semibold">${room.id}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Loại phòng:</p>
                    <p class="font-semibold">${room.type}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Trạng thái:</p>
                    <p class="font-semibold">${getRoomStatusInfo(room.status).text}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Giá phòng:</p>
                    <p class="font-semibold">${formatCurrency(room.price)}</p>
                </div>
                <div>
                    <p class="text-sm text-gray-500">Số lượng:</p>
                    <p class="font-semibold">${students.length}/${maxCapacity}</p>
                </div>
            </div>
            
            <div class="border-t pt-4">
                <h3 class="font-semibold text-gray-900 mb-2">Danh sách sinh viên trong phòng</h3>
                ${students.length > 0 ? `
                    <div class="space-y-2">
                        ${students.map((student, index) => `
                            <div class="bg-gray-50 p-3 rounded">
                                <p class="font-medium">${index + 1}. ${student.fullName}</p>
                                <p class="text-sm text-gray-500">MSSV: ${student.mssv}</p>
                                <p class="text-sm text-gray-500">SĐT: ${student.phone}</p>
                            </div>
                        `).join('')}
                    </div>
                ` : '<p class="text-gray-500">Chưa có sinh viên nào</p>'}
            </div>
        </div>
    `;
    
    // Show in modal or alert
    const modal = document.createElement('div');
    modal.className = 'fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50';
    modal.innerHTML = `
        <div class="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
            <div class="flex justify-between items-center mb-4">
                <h3 class="text-lg font-medium text-gray-900">Chi tiết phòng ${room.id}</h3>
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

function loadRoomStatistics() {
    const stats = {
        total: allRooms.length,
        available: allRooms.filter(r => r.status === 'available').length,
        reserved: allRooms.filter(r => r.status === 'reserved').length,
        occupied: allRooms.filter(r => r.status === 'occupied').length,
        totalStudents: storage.registrations.filter(r => r.status === 'approved' && r.roomId).length,
        totalRevenue: allRooms.filter(r => r.status === 'occupied' || r.status === 'reserved')
            .reduce((sum, r) => sum + r.price, 0)
    };
    
    alert(`Thống kê phòng:\n\n` +
          `Tổng số phòng: ${stats.total}\n` +
          `Phòng trống: ${stats.available}\n` +
          `Phòng đã đặt: ${stats.reserved}\n` +
          `Phòng đã ở: ${stats.occupied}\n` +
          `Tổng số sinh viên: ${stats.totalStudents}\n` +
          `Tổng doanh thu: ${formatCurrency(stats.totalRevenue)}`);
}

function showAddRoomModal() {
    document.getElementById('addRoomModal').classList.remove('hidden');
}

function closeAddRoomModal() {
    document.getElementById('addRoomModal').classList.add('hidden');
    document.getElementById('addRoomForm').reset();
}

function handleAddRoom(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const roomId = formData.get('roomId');
    
    // Check if room already exists (BR3)
    if (storage.rooms.find(r => r.id === roomId)) {
        showNotification('Phòng đã tồn tại!', 'error');
        return;
    }

    // Validate price (BR3)
    const price = parseFloat(formData.get('roomPrice'));
    if (isNaN(price) || price <= 0) {
        showNotification('Giá phòng không hợp lệ!', 'error');
        return;
    }

    // Add room
    const room = {
        id: roomId,
        type: formData.get('roomType'),
        status: 'available',
        price: price,
        capacity: parseInt(formData.get('roomType').split(' ')[0]),
        createdAt: new Date().toISOString()
    };

    storage.rooms.push(room);
    
    showNotification('Phòng đã được thêm thành công!', 'success');
    
    closeAddRoomModal();
    loadRooms();
}

function editRoom(roomId) {
    const room = storage.rooms.find(r => r.id === roomId);
    if (!room) return;

    const newPrice = prompt('Nhập giá mới:', room.price);
    if (newPrice && !isNaN(newPrice) && parseFloat(newPrice) > 0) {
        room.price = parseFloat(newPrice);
        showNotification('Đã cập nhật giá phòng!', 'success');
        loadRooms();
    }
}

function deleteRoom(roomId) {
    if (confirm('Bạn có chắc muốn xóa phòng này?')) {
        const index = storage.rooms.findIndex(r => r.id === roomId);
        if (index > -1) {
            storage.rooms.splice(index, 1);
            showNotification('Đã xóa phòng!', 'success');
            loadRooms();
        }
    }
}

