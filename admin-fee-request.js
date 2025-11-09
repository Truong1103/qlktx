// Admin Fee Request Processing Logic
let currentFilter = 'pending';
let allRequests = [];
let filteredRequests = [];

document.addEventListener('DOMContentLoaded', () => {
    loadFeeRequestPage();
});

function loadFeeRequestPage() {
    const user = JSON.parse(localStorage.getItem('currentUser'));
    if (!user || user.role !== 'admin') {
        window.location.href = 'index.html';
        return;
    }

    allRequests = storage.feeRequests || [];
    filteredRequests = [...allRequests];
    
    loadRequests();
    updateCounts();
    updateStatistics();
}

function updateStatistics() {
    const total = allRequests.length;
    const pending = allRequests.filter(r => r.status === 'pending').length;
    const approved = allRequests.filter(r => r.status === 'approved').length;
    const rejected = allRequests.filter(r => r.status === 'rejected').length;
    
    document.getElementById('totalRequests').textContent = total;
    document.getElementById('pendingRequests').textContent = pending;
    document.getElementById('approvedRequests').textContent = approved;
    document.getElementById('rejectedRequests').textContent = rejected;
}

function handleSearch() {
    const searchTerm = document.getElementById('searchInput').value.toLowerCase();
    const typeFilter = document.getElementById('typeFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    
    filteredRequests = allRequests.filter(req => {
        const matchSearch = !searchTerm || 
            req.mssv.toLowerCase().includes(searchTerm) ||
            req.fullName.toLowerCase().includes(searchTerm) ||
            req.id.toLowerCase().includes(searchTerm);
        
        const matchType = typeFilter === 'all' || req.requestType === typeFilter;
        
        let matchDate = true;
        if (dateFilter !== 'all') {
            const reqDate = new Date(req.createdAt);
            const now = new Date();
            switch(dateFilter) {
                case 'today':
                    matchDate = reqDate.toDateString() === now.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                    matchDate = reqDate >= weekAgo;
                    break;
                case 'month':
                    matchDate = reqDate.getMonth() === now.getMonth() && 
                               reqDate.getFullYear() === now.getFullYear();
                    break;
            }
        }
        
        return matchSearch && matchType && matchDate;
    });
    
    loadRequests();
}

function updateCounts() {
    const pending = filteredRequests.filter(r => r.status === 'pending').length;
    const approved = filteredRequests.filter(r => r.status === 'approved').length;
    const rejected = filteredRequests.filter(r => r.status === 'rejected').length;

    document.getElementById('pendingCount').textContent = pending;
    document.getElementById('approvedCount').textContent = approved;
    document.getElementById('rejectedCount').textContent = rejected;
}

function filterRequests(status) {
    currentFilter = status;
    
    // Update active tab
    document.querySelectorAll('.filter-tab').forEach(tab => {
        tab.classList.remove('active', 'border-indigo-500', 'text-indigo-600');
        tab.classList.add('border-transparent', 'text-gray-500');
    });
    
    event.target.classList.add('active', 'border-indigo-500', 'text-indigo-600');
    event.target.classList.remove('border-transparent', 'text-gray-500');
    
    loadRequests();
}

function loadRequests() {
    let filtered = [...filteredRequests];
    
    if (currentFilter !== 'all') {
        filtered = filtered.filter(r => r.status === currentFilter);
    }

    const listDiv = document.getElementById('requestsList');

    if (filtered.length === 0) {
        listDiv.innerHTML = '<p class="text-gray-500">Không có yêu cầu nào</p>';
        return;
    }

    // Sort by date (newest first)
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    listDiv.innerHTML = filtered.map(req => {
        const statusText = getStatusText(req.status);
        const statusColor = getStatusColor(req.status);
        const typeText = getRequestTypeText(req.requestType);
        const daysSince = Math.floor((new Date() - new Date(req.createdAt)) / (1000 * 60 * 60 * 24));
        
        return `
            <div class="bg-white rounded-lg shadow-lg p-6 hover:shadow-xl transition">
                <div class="flex items-start justify-between mb-4">
                    <div class="flex-1">
                        <div class="flex items-center space-x-3 mb-2">
                            <h3 class="text-lg font-semibold text-gray-900">${req.fullName}</h3>
                            <span class="px-3 py-1 rounded-full text-xs font-semibold ${statusColor} bg-opacity-20">
                                ${statusText}
                            </span>
                            <span class="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">
                                ${typeText}
                            </span>
                        </div>
                        <div class="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-3">
                            <div>
                                <p class="text-gray-500">MSSV:</p>
                                <p class="font-medium">${req.mssv}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Mã yêu cầu:</p>
                                <p class="font-medium">${req.id}</p>
                            </div>
                            <div>
                                <p class="text-gray-500">Ngày gửi:</p>
                                <p class="font-medium">${formatDate(req.createdAt)}</p>
                                <p class="text-xs text-gray-400">${daysSince} ngày trước</p>
                            </div>
                            <div>
                                <p class="text-gray-500">SĐT:</p>
                                <p class="font-medium">${req.phone}</p>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="mb-4 p-4 bg-gray-50 rounded-lg">
                    <p class="text-sm text-gray-500 mb-2 font-semibold">Lý do:</p>
                    <p class="text-gray-700">${req.reason}</p>
                    ${req.supportingDocs && req.supportingDocs.length > 0 ? `
                        <div class="mt-3">
                            <p class="text-xs text-gray-500 mb-1">Giấy tờ minh chứng:</p>
                            <div class="flex flex-wrap gap-2">
                                ${req.supportingDocs.map(doc => `
                                    <span class="px-2 py-1 rounded text-xs bg-blue-100 text-blue-800">${doc}</span>
                                `).join('')}
                            </div>
                        </div>
                    ` : ''}
                </div>

                ${req.status === 'approved' && req.approvedAt ? `
                    <div class="mb-4 p-3 bg-green-50 rounded-lg">
                        <p class="text-sm text-green-700">
                            <strong>Đã duyệt:</strong> ${formatDate(req.approvedAt)}
                        </p>
                    </div>
                ` : ''}
                
                ${req.status === 'rejected' && req.rejectionReason ? `
                    <div class="mb-4 p-3 bg-red-50 rounded-lg">
                        <p class="text-sm text-red-700">
                            <strong>Lý do từ chối:</strong> ${req.rejectionReason}
                        </p>
                    </div>
                ` : ''}

                <div class="flex justify-end space-x-2 flex-wrap gap-2">
                    <button onclick="viewDetail('${req.id}')" 
                        class="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 text-sm">
                        <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
                        </svg>
                        Chi tiết
                    </button>
                    ${req.status === 'pending' ? `
                        <button onclick="approveRequest('${req.id}')" 
                            class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                            </svg>
                            Duyệt
                        </button>
                        <button onclick="rejectRequest('${req.id}')" 
                            class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">
                            <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                            </svg>
                            Từ chối
                        </button>
                    ` : ''}
                </div>
            </div>
        `;
    }).join('');
}

function viewDetail(reqId) {
    const req = storage.feeRequests.find(r => r.id === reqId);
    if (!req) return;

    const detailDiv = document.getElementById('requestDetail');
    const typeText = getRequestTypeText(req.requestType);
    const daysSince = Math.floor((new Date() - new Date(req.createdAt)) / (1000 * 60 * 60 * 24));
    
    detailDiv.innerHTML = `
        <div class="space-y-6">
            <!-- Header -->
            <div class="flex items-center justify-between pb-4 border-b">
                <div>
                    <h4 class="text-lg font-semibold text-gray-900">${req.fullName}</h4>
                    <p class="text-sm text-gray-500">Mã yêu cầu: ${req.id}</p>
                </div>
                <div class="flex flex-col items-end space-y-1">
                    <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(req.status)} bg-opacity-20">
                        ${getStatusText(req.status)}
                    </span>
                    <span class="px-2 py-1 rounded text-xs bg-indigo-100 text-indigo-800">
                        ${typeText}
                    </span>
                </div>
            </div>
            
            <!-- Personal Info -->
            <div>
                <h5 class="font-semibold text-gray-900 mb-3">Thông tin sinh viên</h5>
                <div class="grid grid-cols-2 gap-4">
                    <div>
                        <p class="text-sm text-gray-500">Họ tên:</p>
                        <p class="font-medium">${req.fullName}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">MSSV:</p>
                        <p class="font-medium">${req.mssv}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">SĐT:</p>
                        <p class="font-medium">${req.phone}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Email:</p>
                        <p class="font-medium">${req.email}</p>
                    </div>
                </div>
            </div>
            
            <!-- Request Info -->
            <div>
                <h5 class="font-semibold text-gray-900 mb-3">Thông tin yêu cầu</h5>
                <div class="grid grid-cols-2 gap-4 mb-4">
                    <div>
                        <p class="text-sm text-gray-500">Loại yêu cầu:</p>
                        <p class="font-medium">${typeText}</p>
                    </div>
                    <div>
                        <p class="text-sm text-gray-500">Ngày gửi:</p>
                        <p class="font-medium">${formatDate(req.createdAt)}</p>
                        <p class="text-xs text-gray-400">${daysSince} ngày trước</p>
                    </div>
                </div>
                <div class="bg-gray-50 p-4 rounded-lg">
                    <p class="text-sm text-gray-500 mb-2 font-semibold">Lý do:</p>
                    <p class="text-gray-700">${req.reason}</p>
                </div>
            </div>
            
            ${req.supportingDocs && req.supportingDocs.length > 0 ? `
                <div>
                    <h5 class="font-semibold text-gray-900 mb-3">Giấy tờ minh chứng</h5>
                    <div class="flex flex-wrap gap-2">
                        ${req.supportingDocs.map(doc => `
                            <span class="px-3 py-2 rounded-lg bg-blue-50 border border-blue-200 text-blue-800 text-sm">
                                <svg class="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"></path>
                                </svg>
                                ${doc}
                            </span>
                        `).join('')}
                    </div>
                </div>
            ` : ''}
            
            <!-- Timeline -->
            <div>
                <h5 class="font-semibold text-gray-900 mb-3">Lịch sử xử lý</h5>
                <div class="space-y-2">
                    <div class="flex items-center space-x-3 p-2 bg-gray-50 rounded">
                        <div class="w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div class="flex-1">
                            <p class="text-sm font-medium">Yêu cầu được gửi</p>
                            <p class="text-xs text-gray-500">${formatDate(req.createdAt)} (${daysSince} ngày trước)</p>
                        </div>
                    </div>
                    ${req.approvedAt ? `
                        <div class="flex items-center space-x-3 p-2 bg-green-50 rounded">
                            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Yêu cầu được duyệt</p>
                                <p class="text-xs text-gray-500">${formatDate(req.approvedAt)}</p>
                            </div>
                        </div>
                    ` : ''}
                    ${req.rejectedAt ? `
                        <div class="flex items-center space-x-3 p-2 bg-red-50 rounded">
                            <div class="w-2 h-2 bg-red-500 rounded-full"></div>
                            <div class="flex-1">
                                <p class="text-sm font-medium">Yêu cầu bị từ chối</p>
                                <p class="text-xs text-gray-500">${formatDate(req.rejectedAt)}</p>
                                ${req.rejectionReason ? `<p class="text-xs text-red-600 mt-1">Lý do: ${req.rejectionReason}</p>` : ''}
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
            
            ${req.status === 'pending' ? `
                <div class="flex justify-end space-x-3 pt-4 border-t">
                    <button onclick="closeDetailModal(); approveRequest('${req.id}')" 
                        class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700">
                        Duyệt
                    </button>
                    <button onclick="closeDetailModal(); rejectRequest('${req.id}')" 
                        class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                        Từ chối
                    </button>
                </div>
            ` : ''}
        </div>
    `;

    document.getElementById('detailModal').classList.remove('hidden');
}

function closeDetailModal() {
    document.getElementById('detailModal').classList.add('hidden');
}

function approveRequest(reqId) {
    const req = storage.feeRequests.find(r => r.id === reqId);
    if (!req) return;

    // Check request period (BR1)
    const config = storage.systemConfig;
    const now = new Date();
    const startDate = new Date(config.feeExemptionPeriod.start);
    const endDate = new Date(config.feeExemptionPeriod.end);
    
    if (now < startDate || now > endDate) {
        showNotification('Không trong thời gian xử lý yêu cầu!', 'error');
        return;
    }

    // Check time limit (BR2) - 15 days from payment notification
    // This would need to be calculated based on actual payment date
    // For demo, we'll just approve

    req.status = 'approved';
    req.approvedAt = new Date().toISOString();
    req.updatedAt = new Date().toISOString();

    showNotification('Yêu cầu đã được duyệt!', 'success');
    
    closeDetailModal();
    allRequests = storage.feeRequests || [];
    filteredRequests = [...allRequests];
    loadRequests();
    updateCounts();
    updateStatistics();
}

function rejectRequest(reqId) {
    const reason = prompt('Nhập lý do từ chối:');
    if (!reason) return;

    const req = storage.feeRequests.find(r => r.id === reqId);
    if (!req) return;

    req.status = 'rejected';
    req.rejectionReason = reason;
    req.rejectedAt = new Date().toISOString();
    req.updatedAt = new Date().toISOString();

    showNotification('Yêu cầu đã bị từ chối!', 'info');
    
    closeDetailModal();
    allRequests = storage.feeRequests || [];
    filteredRequests = [...allRequests];
    loadRequests();
    updateCounts();
    updateStatistics();
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

