var allUsers = [];

$(function () {
    if (!requireAuth(['ADMIN'])) return;
    renderHeader('Admin Dashboard', '<i class="fa-solid fa-shield-halved"></i>', { showNotif: false });
    initSubTabs(function (target) {
        if (target === 'stats-section') loadStats();
        if (target === 'settings-section') loadSettings();
    });
    $('#role-filter').on('change', function () { renderUsers(); });
    loadUsers();
});

function loadUsers() {
    showLoading();
    api('GET', '/admin/users').done(function (users) {
        hideLoading(); allUsers = users; renderUsers();
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

function renderUsers() {
    var role = $('#role-filter').val();
    var filtered = role ? allUsers.filter(function (u) { return u.role === role; }) : allUsers;
    if (!filtered.length) { $('#users-container').html('<div class="text-center py-16 text-gray-400"><div class="text-3xl mb-3"><i class="fa-solid fa-users"></i></div><p>No users found.</p></div>'); return; }
    if ($.fn.DataTable.isDataTable('#users-table')) $('#users-table').DataTable().destroy();
    $('#users-container').html(
        '<table id="users-table" class="display w-full"><thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th></tr></thead><tbody>' +
        filtered.map(function (u) {
            return '<tr><td>' + u.id + '</td><td>' + esc(u.username) + '</td><td>' + esc(u.email || '') + '</td>' +
                '<td><span class="' + badgeCls(u.role === 'TEACHER' ? 'green' : 'blue') + ' px-2.5 py-0.5 rounded text-xs font-semibold">' + u.role + '</span></td>' +
                '<td>' + (u.active !== false
                    ? '<span class="' + badgeCls('green') + ' px-2.5 py-0.5 rounded text-xs font-semibold">Active</span>'
                    : '<span class="' + badgeCls('red') + ' px-2.5 py-0.5 rounded text-xs font-semibold">Inactive</span>') + '</td>' +
                '<td>' + (u.active !== false
                    ? '<button onclick="deactivateUser(' + u.id + ')" class="px-3 py-1 text-xs bg-red-500 text-white rounded-none hover:bg-red-600 transition">Deactivate</button>'
                    : '<button onclick="activateUser(' + u.id + ')" class="px-3 py-1 text-xs bg-emerald-600 text-white rounded-none hover:bg-emerald-700 transition">Activate</button>') + '</td></tr>';
        }).join('') + '</tbody></table>');
    $('#users-table').DataTable({ order: [[0, 'asc']], pageLength: 25 });
}

function deactivateUser(id) {
    if (!confirm('Deactivate this user?')) return;
    api('PUT', '/admin/users/' + id + '/deactivate').done(function () { toast('User deactivated'); loadUsers(); }).fail(function (x) { toast(ajaxErr(x), 'error'); });
}

function activateUser(id) {
    api('PUT', '/admin/users/' + id + '/activate').done(function () { toast('User activated'); loadUsers(); }).fail(function (x) { toast(ajaxErr(x), 'error'); });
}

function loadStats() {
    showLoading();
    api('GET', '/admin/stats').done(function (stats) {
        hideLoading();
        $('#stats-content').html('<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">' +
            Object.entries(stats).map(function (e) {
                return '<div class="bg-white rounded-none p-5 text-center shadow-sm border border-gray-100">' +
                    '<div class="text-xl font-bold text-emerald-700">' + e[1] + '</div>' +
                    '<div class="text-gray-500 text-sm mt-1">' + e[0].replace(/([A-Z])/g, ' $1').replace(/^./, function (s) { return s.toUpperCase(); }) + '</div></div>';
            }).join('') + '</div>');
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

function loadSettings() {
    showLoading();
    api('GET', '/admin/settings').done(function (settings) {
        hideLoading();
        if (!settings.length) { $('#settings-content').html('<div class="text-center py-16 text-gray-400"><div class="text-3xl mb-3"><i class="fa-solid fa-gear"></i></div><p>No settings configured.</p></div>'); return; }
        $('#settings-content').html(
            '<table class="w-full bg-white rounded-none overflow-hidden shadow-sm border border-gray-100"><thead>' +
            '<tr class="bg-gray-50"><th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Key</th><th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Value</th><th class="px-4 py-3 text-left text-sm font-semibold text-gray-600">Category</th></tr></thead><tbody>' +
            settings.map(function (s) {
                return '<tr class="border-t border-gray-100"><td class="px-4 py-3 text-sm font-medium">' + esc(s.settingKey) + '</td>' +
                    '<td class="px-4 py-3 text-sm">' + esc(s.settingValue) + '</td>' +
                    '<td class="px-4 py-3 text-sm"><span class="' + badgeCls('blue') + ' px-2 py-0.5 rounded text-xs font-semibold">' + esc(s.category) + '</span></td></tr>';
            }).join('') + '</tbody></table>');
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}
