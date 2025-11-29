import React, { useState, useEffect } from 'react';
import { Users, Search, Loader2, Ban, Unlock, User, Edit2, X, Save, Filter } from 'lucide-react';
import { apiGetUsers, apiGetUserById, apiUpdateUser, apiUpdateUserStatus } from '../../api/adminApi';
import { showError, showSuccess, showConfirm } from '../../utils/notifications';
import { getAvatarUrl } from '../../utils/avatarHelper';
import { useAuth } from '../../hooks/useAuth';

const UserManagement = () => {
    const { user: currentUser } = useAuth();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [roleFilter, setRoleFilter] = useState('all');
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [updating, setUpdating] = useState(null);
    const [selectedUser, setSelectedUser] = useState(null);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, [page, searchTerm, roleFilter]);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            const params = {
                page,
                limit: 20,
                search: searchTerm
            };
            if (roleFilter !== 'all') {
                params.role = roleFilter;
            }
            const response = await apiGetUsers(params);
            if (response.data) {
                setUsers(response.data.users || []);
                setTotalPages(response.data.pagination?.totalPages || 1);
            }
        } catch (err) {
            console.error("Error fetching users:", err);
            showError("Lỗi", "Không thể tải danh sách người dùng");
        } finally {
            setLoading(false);
        }
    };

    const handleViewUser = async (userId) => {
        try {
            const response = await apiGetUserById(userId);
            if (response.data) {
                setSelectedUser(response.data.user);
                setEditingUser({ ...response.data.user });
                setShowUserModal(true);
            }
        } catch (err) {
            console.error("Error fetching user details:", err);
            showError("Lỗi", "Không thể tải thông tin người dùng");
        }
    };

    const handleUpdateUser = async () => {
        if (!editingUser) return;

        // Validation
        if (!editingUser.full_name || editingUser.full_name.trim() === '') {
            showError("Lỗi", "Tên không được để trống");
            return;
        }
        if (!editingUser.email || editingUser.email.trim() === '') {
            showError("Lỗi", "Email không được để trống");
            return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(editingUser.email)) {
            showError("Lỗi", "Email không hợp lệ");
            return;
        }

        try {
            setSaving(true);
            await apiUpdateUser(selectedUser.user_id, {
                full_name: editingUser.full_name.trim(),
                email: editingUser.email.trim(),
                phone: editingUser.phone?.trim() || null,
                role: editingUser.role
            });
            showSuccess("Thành công", "Đã cập nhật thông tin người dùng thành công");
            setShowUserModal(false);
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error("Error updating user:", err);
            showError("Lỗi", err.response?.data?.message || "Không thể cập nhật thông tin người dùng");
        } finally {
            setSaving(false);
        }
    };

    const handleToggleStatus = async (userId, currentStatus) => {
        const newStatus = !currentStatus;
        const action = newStatus ? 'mở khóa' : 'khóa';
        const actionText = newStatus ? 'Mở khóa' : 'Khóa';

        // Không cho phép khóa chính mình
        if (userId === currentUser?.user_id) {
            showError("Lỗi", "Bạn không thể khóa chính mình");
            return;
        }

        const result = await showConfirm(
            `${actionText} tài khoản`,
            `Bạn có chắc chắn muốn ${action} tài khoản này không?`,
            actionText,
            'Hủy'
        );

        if (!result.isConfirmed) return;

        try {
            setUpdating(userId);
            await apiUpdateUserStatus(userId, newStatus);
            showSuccess("Thành công", `Đã ${action} tài khoản thành công`);
            
            // Update selectedUser và editingUser nếu đang mở modal
            if (selectedUser && selectedUser.user_id === userId) {
                setSelectedUser({...selectedUser, is_active: newStatus});
                setEditingUser({...editingUser, is_active: newStatus});
            }
            
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error("Error updating user status:", err);
            showError("Lỗi", err.response?.data?.message || `Không thể ${action} tài khoản`);
        } finally {
            setUpdating(null);
        }
    };

    const getRoleBadge = (role) => {
        const badges = {
            admin: 'bg-purple-100 text-purple-700 border-purple-200',
            vendor: 'bg-green-100 text-green-700 border-green-200',
            owner: 'bg-blue-100 text-blue-700 border-blue-200'
        };
        const labels = {
            admin: 'Admin',
            vendor: 'Vendor',
            owner: 'Owner'
        };
        return (
            <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${badges[role] || 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                {labels[role] || role}
            </span>
        );
    };

    if (loading && users.length === 0) {
        return (
            <div className="flex h-screen items-center justify-center text-gray-500 gap-2">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                <span>Đang tải danh sách người dùng...</span>
            </div>
        );
    }

    return (
        <div className="p-6 bg-gray-50 min-h-screen animate-fade-in">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                    <Users className="text-blue-600" /> Quản lý người dùng
                </h1>
                <p className="text-gray-600 text-sm mt-1">Xem và quản lý tất cả người dùng trong hệ thống</p>
            </div>

            {/* Search & Filter */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 flex items-center gap-4">
                <div className="flex-1 flex items-center transition-all focus-within:ring-2 focus-within:ring-blue-500 rounded-lg border border-gray-200 p-2">
                    <Search className="text-gray-400 ml-2" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm theo tên hoặc email..."
                        className="w-full ml-3 outline-none text-gray-700 bg-transparent"
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setPage(1); // Reset to first page when searching
                        }}
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter className="text-gray-400" size={20} />
                    <select
                        value={roleFilter}
                        onChange={(e) => {
                            setRoleFilter(e.target.value);
                            setPage(1); // Reset to first page when filtering
                        }}
                        className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 outline-none"
                    >
                        <option value="all">Tất cả vai trò</option>
                        <option value="admin">Admin</option>
                        <option value="vendor">Vendor</option>
                        <option value="owner">Owner</option>
                    </select>
                </div>
            </div>

            {/* Users Table */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-200">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-gray-50 border-b border-gray-200">
                            <tr>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Người dùng</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Vai trò</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider">Trạng thái</th>
                                <th className="p-4 text-xs font-bold text-gray-500 uppercase tracking-wider text-right">Hành động</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {users.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="p-12 text-center text-gray-500 flex flex-col items-center justify-center w-full">
                                        <User size={48} className="text-gray-300 mb-3" />
                                        <p>Không tìm thấy người dùng nào.</p>
                                    </td>
                                </tr>
                            ) : (
                                users.map(user => {
                                    const avatarUrl = getAvatarUrl(user);
                                    const displayName = user.full_name || user.email || 'N/A';
                                    const displayInitial = displayName.charAt(0).toUpperCase();

                                    return (
                                        <tr 
                                            key={user.user_id} 
                                            className="hover:bg-gray-50 transition-colors group cursor-pointer"
                                            onClick={() => handleViewUser(user.user_id)}
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border border-gray-300 shrink-0 relative">
                                                        <img 
                                                            src={avatarUrl} 
                                                            alt="Avatar" 
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.style.display = 'none';
                                                                const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                                                if (fallback) fallback.style.display = 'flex';
                                                            }}
                                                        />
                                                        <span className="avatar-fallback text-sm font-semibold text-gray-600 absolute inset-0 items-center justify-center" style={{ display: avatarUrl && avatarUrl.includes('dicebear') ? 'flex' : 'none' }}>
                                                            {displayInitial}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{displayName}</p>
                                                        {user.vendors && user.vendors.length > 0 && (
                                                            <p className="text-xs text-gray-500">Vendor: {user.vendors[0].store_name}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-gray-600 text-sm">
                                                {user.email}
                                            </td>
                                            <td className="p-4">
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${
                                                    user.is_active 
                                                        ? 'bg-green-100 text-green-700 border-green-200' 
                                                        : 'bg-red-100 text-red-700 border-red-200'
                                                }`}>
                                                    {user.is_active ? 'Hoạt động' : 'Đã khóa'}
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <div className="flex items-center gap-2 justify-end">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleViewUser(user.user_id);
                                                        }}
                                                        className="px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1 font-medium text-blue-600 bg-blue-50 hover:bg-blue-100"
                                                        title="Xem chi tiết"
                                                    >
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleToggleStatus(user.user_id, user.is_active);
                                                        }}
                                                        disabled={updating === user.user_id || user.user_id === currentUser?.user_id}
                                                        className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1 font-medium ${
                                                            user.is_active
                                                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                                                        } ${updating === user.user_id ? 'opacity-50 cursor-not-allowed' : ''} ${user.user_id === currentUser?.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                    >
                                                        {updating === user.user_id ? (
                                                            <Loader2 className="w-4 h-4 animate-spin" />
                                                        ) : user.is_active ? (
                                                            <>
                                                                <Ban size={16} /> Khóa
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Unlock size={16} /> Mở khóa
                                                            </>
                                                        )}
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-gray-50 px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Trang {page} / {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Trước
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="px-4 py-2 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Sau
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* User Detail Modal */}
            {showUserModal && selectedUser && editingUser && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                                    <User className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-800">Chi tiết người dùng</h3>
                                    <p className="text-sm text-gray-500">ID: #{selectedUser.user_id}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowUserModal(false);
                                    setSelectedUser(null);
                                    setEditingUser(null);
                                }}
                                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                                <X size={20} className="text-gray-500" />
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 space-y-6">
                            {/* Avatar & Basic Info */}
                            <div className="flex items-start gap-6">
                                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center overflow-hidden border-2 border-gray-300 shrink-0 relative">
                                    <img 
                                        src={getAvatarUrl(selectedUser)} 
                                        alt="Avatar" 
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            const fallback = e.target.parentElement.querySelector('.avatar-fallback');
                                            if (fallback) fallback.style.display = 'flex';
                                        }}
                                    />
                                    <span className="avatar-fallback text-2xl font-semibold text-gray-600 absolute inset-0 items-center justify-center" style={{ display: getAvatarUrl(selectedUser) && getAvatarUrl(selectedUser).includes('dicebear') ? 'flex' : 'none' }}>
                                        {(selectedUser.full_name || selectedUser.email || 'N').charAt(0).toUpperCase()}
                                    </span>
                                </div>
                                <div className="flex-1">
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Họ và Tên *</label>
                                        <input
                                            type="text"
                                            value={editingUser.full_name || ''}
                                            onChange={(e) => setEditingUser({...editingUser, full_name: e.target.value})}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="Nhập họ và tên"
                                        />
                                    </div>
                                    <div className="mb-4">
                                        <label className="block text-sm font-medium text-gray-700 mb-1.5">Email *</label>
                                        <input
                                            type="email"
                                            value={editingUser.email || ''}
                                            onChange={(e) => setEditingUser({...editingUser, email: e.target.value})}
                                            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            placeholder="Nhập email"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Additional Info */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Số điện thoại</label>
                                    <input
                                        type="text"
                                        value={editingUser.phone || ''}
                                        onChange={(e) => setEditingUser({...editingUser, phone: e.target.value})}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        placeholder="Nhập số điện thoại"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Vai trò *</label>
                                    <select
                                        value={editingUser.role || 'owner'}
                                        onChange={(e) => setEditingUser({...editingUser, role: e.target.value})}
                                        disabled={selectedUser.user_id === currentUser?.user_id}
                                        className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white disabled:bg-gray-50 disabled:cursor-not-allowed"
                                    >
                                        <option value="owner">Owner</option>
                                        <option value="vendor">Vendor</option>
                                        <option value="admin">Admin</option>
                                    </select>
                                    {selectedUser.user_id === currentUser?.user_id && (
                                        <p className="text-xs text-gray-500 mt-1">Bạn không thể thay đổi role của chính mình</p>
                                    )}
                                </div>
                            </div>

                            {/* Vendor Info (if applicable) */}
                            {selectedUser.vendors && selectedUser.vendors.length > 0 && (
                                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Thông tin Vendor</h4>
                                    <div className="space-y-2 text-sm">
                                        <p><span className="font-medium">Tên cửa hàng:</span> {selectedUser.vendors[0].store_name}</p>
                                        <p><span className="font-medium">Trạng thái:</span> 
                                            <span className={`ml-2 px-2 py-1 rounded text-xs font-semibold ${
                                                selectedUser.vendors[0].status === 'approved' ? 'bg-green-100 text-green-700' :
                                                selectedUser.vendors[0].status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'
                                            }`}>
                                                {selectedUser.vendors[0].status === 'approved' ? 'Đã duyệt' :
                                                 selectedUser.vendors[0].status === 'pending' ? 'Chờ duyệt' : 'Đã từ chối'}
                                            </span>
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Status */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Trạng thái tài khoản</label>
                                <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1.5 text-sm font-semibold rounded-full border ${
                                        selectedUser.is_active 
                                            ? 'bg-green-100 text-green-700 border-green-200' 
                                            : 'bg-red-100 text-red-700 border-red-200'
                                    }`}>
                                        {selectedUser.is_active ? 'Hoạt động' : 'Đã khóa'}
                                    </span>
                                    <button
                                        onClick={() => handleToggleStatus(selectedUser.user_id, selectedUser.is_active)}
                                        disabled={updating === selectedUser.user_id || selectedUser.user_id === currentUser?.user_id}
                                        className={`px-3 py-1.5 text-sm rounded-lg transition flex items-center gap-1 font-medium ${
                                            selectedUser.is_active
                                                ? 'text-red-600 bg-red-50 hover:bg-red-100'
                                                : 'text-green-600 bg-green-50 hover:bg-green-100'
                                        } ${updating === selectedUser.user_id ? 'opacity-50 cursor-not-allowed' : ''} ${selectedUser.user_id === currentUser?.user_id ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    >
                                        {updating === selectedUser.user_id ? (
                                            <Loader2 className="w-4 h-4 animate-spin" />
                                        ) : selectedUser.is_active ? (
                                            <>
                                                <Ban size={16} /> Khóa
                                            </>
                                        ) : (
                                            <>
                                                <Unlock size={16} /> Mở khóa
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-6 flex items-center justify-end gap-3">
                            <button
                                onClick={() => {
                                    setShowUserModal(false);
                                    setSelectedUser(null);
                                    setEditingUser(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                            >
                                Hủy
                            </button>
                            <button
                                onClick={handleUpdateUser}
                                disabled={saving}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 disabled:bg-blue-300 transition-colors flex items-center gap-2"
                            >
                                {saving ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Đang lưu...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Lưu thay đổi
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserManagement;

