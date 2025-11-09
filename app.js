// Application state
const appState = {
    currentUser: null,
    currentRole: null,
    currentPage: 'login'
};

// Sample data storage (in real app, this would be a backend)
const storage = {
    users: [
        { username: '2374802010283', password: '123', role: 'student', mssv: '2374802010283', name: 'Phan Văn Hoàng Long' },
        { username: '2374802010445', password: '123', role: 'student', mssv: '2374802010445', name: 'Phạm Công Tài' },
        { username: 'admin', password: '123', role: 'admin', name: 'Admin KTX' }
    ],
    registrations: [
        // Demo data cho student-confirm (MSSV: 2374802010283) - Step 1: Xác nhận giữ chỗ
        {
            id: 'REG001',
            mssv: '2374802010283',
            fullName: 'Phan Văn Hoàng Long',
            phone: '0901234567',
            email: 'long@example.com',
            idCard: '001234567890',
            dob: '2005-01-15',
            roomType: '4',
            duration: '2',
            status: 'approved',
            roomId: 'P103',
            approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            confirmed: false,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Demo data cho student-confirm (MSSV: 2374802010445) - Step 4: Ký biên bản
        {
            id: 'REG002',
            mssv: '2374802010445',
            fullName: 'Phạm Công Tài',
            phone: '0907654321',
            email: 'tai@example.com',
            idCard: '001234567891',
            dob: '2005-03-20',
            roomType: '6',
            duration: '1',
            status: 'approved',
            roomId: 'P101',
            approvedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            confirmed: true,
            confirmedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            paid: true,
            appointmentScheduled: true,
            appointmentDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            appointmentTime: '14:00',
            appointmentCode: 'AP' + (Date.now() - 1000000),
            contractSigned: false,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Demo data cho admin - Đơn chờ duyệt
        {
            id: 'REG003',
            mssv: '2374802010101',
            fullName: 'Nguyễn Văn A',
            phone: '0901111111',
            email: 'nguyenvana@example.com',
            idCard: '001111111111',
            dob: '2005-05-10',
            roomType: '4',
            duration: '2',
            status: 'pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'REG004',
            mssv: '2374802010102',
            fullName: 'Trần Thị B',
            phone: '0902222222',
            email: 'tranthib@example.com',
            idCard: '002222222222',
            dob: '2005-06-15',
            roomType: '6',
            duration: '1',
            status: 'pending',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'REG005',
            mssv: '2374802010103',
            fullName: 'Lê Văn C',
            phone: '0903333333',
            email: 'levanc@example.com',
            idCard: '003333333333',
            dob: '2005-07-20',
            roomType: '8',
            duration: '2',
            status: 'pending',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Demo data cho admin - Đơn đã duyệt
        {
            id: 'REG006',
            mssv: '2374802010104',
            fullName: 'Phạm Thị D',
            phone: '0904444444',
            email: 'phamthid@example.com',
            idCard: '004444444444',
            dob: '2005-08-25',
            roomType: '4',
            duration: '1',
            status: 'approved',
            roomId: 'P102',
            approvedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'REG007',
            mssv: '2374802010105',
            fullName: 'Hoàng Văn E',
            phone: '0905555555',
            email: 'hoangvane@example.com',
            idCard: '005555555555',
            dob: '2005-09-30',
            roomType: '6',
            duration: '2',
            status: 'approved',
            roomId: 'P202',
            approvedAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            confirmed: true,
            confirmedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        },
        // Demo data cho admin - Đơn bị từ chối
        {
            id: 'REG008',
            mssv: '2374802010106',
            fullName: 'Vũ Thị F',
            phone: '0906666666',
            email: 'vuthif@example.com',
            idCard: '006666666666',
            dob: '2005-10-05',
            roomType: '4',
            duration: '1',
            status: 'rejected',
            rejectionReason: 'Thiếu giấy tờ xác minh danh tính',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'REG009',
            mssv: '2374802010107',
            fullName: 'Đỗ Văn G',
            phone: '0907777777',
            email: 'dovang@example.com',
            idCard: '007777777777',
            dob: '2005-11-10',
            roomType: '6',
            duration: '2',
            status: 'rejected',
            rejectionReason: 'Không đủ điều kiện đăng ký KTX',
            createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    feeRequests: [
        {
            id: 'FR001',
            mssv: '2374802010283',
            fullName: 'Phan Văn Hoàng Long',
            phone: '0901234567',
            email: 'long@example.com',
            requestType: 'reduction',
            reason: 'Gia đình có hoàn cảnh khó khăn, thu nhập thấp',
            supportingDocs: ['CMND.pdf', 'GiayXacNhan.pdf'],
            status: 'pending',
            createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
        },
        {
            id: 'FR002',
            mssv: '2374802010445',
            fullName: 'Phạm Công Tài',
            phone: '0907654321',
            email: 'tai@example.com',
            requestType: 'exemption',
            reason: 'Sinh viên thuộc diện chính sách, có giấy xác nhận',
            supportingDocs: ['GiayXacNhanChinhSach.pdf'],
            status: 'approved',
            approvedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString()
        }
    ],
    payments: [
        // Demo payment cho MSSV 2374802010445 (đã thanh toán phí giữ chỗ)
        {
            id: 'PAY001',
            mssv: '2374802010445',
            type: 'deposit',
            amount: 500000,
            status: 'completed',
            createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            description: 'Phí giữ chỗ KTX'
        }
    ],
    rooms: [
        { id: 'P101', type: '6 người', status: 'reserved', price: 400000, capacity: 6, createdAt: new Date().toISOString() },
        { id: 'P102', type: '4 người', status: 'available', price: 500000, capacity: 4, createdAt: new Date().toISOString() },
        { id: 'P201', type: '4 người', status: 'occupied', price: 500000, capacity: 4, createdAt: new Date().toISOString() },
        { id: 'P103', type: '4 người', status: 'available', price: 500000, capacity: 4, createdAt: new Date().toISOString() },
        { id: 'P202', type: '6 người', status: 'available', price: 400000, capacity: 6, createdAt: new Date().toISOString() },
        { id: 'P301', type: '8 người', status: 'available', price: 300000, capacity: 8, createdAt: new Date().toISOString() }
    ],
    systemConfig: {
        registrationPeriod: { 
            start: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0], // 1/1 năm trước
            end: new Date(new Date().getFullYear() + 2, 11, 31).toISOString().split('T')[0] // 31/12 năm sau nữa
        },
        feeExemptionPeriod: { 
            start: new Date(new Date().getFullYear() - 1, 0, 1).toISOString().split('T')[0], // 1/1 năm trước
            end: new Date(new Date().getFullYear() + 2, 11, 31).toISOString().split('T')[0] // 31/12 năm sau nữa
        }
    }
};

// Initialize app
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initApp();
    });
} else {
    // DOM already loaded
    initApp();
}

function initApp() {
    // Only check auth if not on login page
    const currentPage = window.location.pathname.toLowerCase();
    const isLoginPage = currentPage.includes('index.html') || 
                        currentPage.endsWith('/') ||
                        currentPage === '' ||
                        currentPage.endsWith('index.html');
    
    if (!isLoginPage) {
        checkAuth();
    }
    
    setupEventListeners();
}

function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (!savedUser) {
        // No saved user, redirect to login
        window.location.href = 'index.html';
        return;
    }
    
    try {
        appState.currentUser = JSON.parse(savedUser);
        appState.currentRole = appState.currentUser.role;
    } catch (e) {
        // Invalid saved user, clear it and redirect to login
        localStorage.removeItem('currentUser');
        window.location.href = 'index.html';
    }
}

function setupEventListeners() {
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        // Remove existing listener if any
        loginForm.removeEventListener('submit', handleLogin);
        loginForm.addEventListener('submit', handleLogin);
    }
}

function handleLogin(e) {
    e.preventDefault();
    e.stopPropagation();
    
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    
    if (!usernameInput || !passwordInput) {
        console.error('Login form elements not found');
        showNotification('Lỗi: Không tìm thấy form đăng nhập!', 'error');
        return;
    }
    
    const username = usernameInput.value.trim();
    const password = passwordInput.value.trim();

    if (!username || !password) {
        showNotification('Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu!', 'error');
        return;
    }

    const user = storage.users.find(u => u.username === username && u.password === password);
    
    if (user) {
        appState.currentUser = user;
        appState.currentRole = user.role;
        localStorage.setItem('currentUser', JSON.stringify(user));
        showNotification('Đăng nhập thành công! Đang chuyển hướng...', 'success');
        setTimeout(() => {
            navigateToDashboard();
        }, 800);
    } else {
        showNotification('Sai tên đăng nhập hoặc mật khẩu!', 'error');
    }
    
    return false;
}

function logout() {
    appState.currentUser = null;
    appState.currentRole = null;
    localStorage.removeItem('currentUser');
    window.location.href = 'index.html';
}

function navigateToDashboard() {
    if (appState.currentRole === 'student') {
        window.location.href = 'student-dashboard.html';
    } else if (appState.currentRole === 'admin') {
        window.location.href = 'admin-dashboard.html';
    }
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `fixed top-4 right-4 z-50 notification px-6 py-4 rounded-lg shadow-lg ${
        type === 'error' ? 'bg-red-500 text-white' : 
        type === 'success' ? 'bg-green-500 text-white' : 
        'bg-blue-500 text-white'
    }`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// Utility functions
function formatDate(date) {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('vi-VN');
}

function formatCurrency(amount) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount);
}

// Export for use in other files
window.appState = appState;
window.storage = storage;
window.showNotification = showNotification;
window.formatDate = formatDate;
window.formatCurrency = formatCurrency;
window.logout = logout;

