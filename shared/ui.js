function getBaseUrl() {
    return /\/(teacher|student|admin|analytics|profile|notifications)\//.test(window.location.pathname) ? '../' : '';
}

function getDashboardUrl() {
    var base = getBaseUrl();
    var role = getRole();
    if (role === 'TEACHER') return base + 'teacher/dashboard.html';
    if (role === 'ADMIN') return base + 'admin/dashboard.html';
    return base + 'student/dashboard.html';
}

function requireAuth(roles) {
    if (!getToken()) {
        window.location.href = getBaseUrl() + 'index.html';
        return false;
    }
    if (roles && roles.indexOf(getRole()) === -1) {
        window.location.href = getBaseUrl() + 'index.html';
        return false;
    }
    return true;
}

function logout() {
    clearAuth();
    window.location.href = getBaseUrl() + 'index.html';
}

function toast(msg, type) {
    type = type || 'success';
    var bg = { success: 'bg-emerald-600', error: 'bg-red-600', info: 'bg-gray-700' };
    var $t = $('<div>').addClass('fixed bottom-6 right-6 px-5 py-3 rounded-none text-white text-xs font-medium z-[200] max-w-sm shadow-md ' + (bg[type] || bg.success))
        .text(msg).appendTo('body').hide().fadeIn(300);
    setTimeout(function () { $t.fadeOut(300, function () { $t.remove(); }); }, 3000);
}

function showLoading(msg) {
    if ($('#loading-overlay').length) { $('#loading-overlay .ld-msg').text(msg || 'Loading...'); return; }
    $('body').append(
        '<div id="loading-overlay" class="fixed inset-0 bg-white/85 z-[300] flex items-center justify-center flex-col gap-3">' +
        '<div class="w-8 h-8 border-3 border-gray-200 border-t-emerald-600 rounded-full animate-spin"></div>' +
        '<p class="ld-msg text-gray-500 text-xs">' + esc(msg || 'Loading...') + '</p></div>'
    );
}

function hideLoading() { $('#loading-overlay').remove(); }

function renderHeader(title, icon, opts) {
    opts = opts || {};
    var base = getBaseUrl();
    var username = getUsername();
    var role = getRole();
    var notifBtn = opts.showNotif !== false && role !== 'ADMIN'
        ? '<button onclick="window.location.href=\'' + base + 'notifications/notifications.html\'" class="relative px-3 py-1.5 text-xs border border-gray-300 rounded-none hover:bg-gray-50 transition"><i class="fa-solid fa-bell"></i> <span id="notif-count" class="hidden absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full min-w-[16px] h-[16px] leading-[16px] text-center px-0.5">0</span></button>'
        : '';
    $('body').prepend(
        '<header class="flex items-center justify-between px-6 py-3 bg-white border-b border-gray-200 sticky top-0 z-10">' +
        '<h2 class="text-sm font-semibold text-gray-800">' + icon + ' ' + esc(title) + '</h2>' +
        '<div class="flex items-center gap-2">' + notifBtn +
        '<button onclick="window.location.href=\'' + base + 'profile/profile.html\'" class="px-3 py-1.5 text-xs border border-gray-300 rounded-none hover:bg-gray-50 transition"><i class="fa-solid fa-user"></i> Profile</button>' +
        '<span class="text-gray-400 text-xs">' + esc(username) + '</span>' +
        '<button onclick="logout()" class="px-3 py-1.5 text-xs border border-gray-300 rounded-none hover:bg-gray-50 transition"><i class="fa-solid fa-right-from-bracket"></i> Logout</button>' +
        '</div></header>'
    );
    if (opts.showNotif !== false && role !== 'ADMIN') {
        api('GET', '/notifications/unread-count').done(function (d) {
            if (d.count > 0) $('#notif-count').text(d.count).removeClass('hidden');
        });
    }
}

/* Sub-tab switching */
function initSubTabs(onSwitch) {
    $(document).on('click', '.sub-tab', function () {
        var target = $(this).data('target');
        $(this).closest('nav').find('.sub-tab').removeClass('bg-emerald-600 text-white').addClass('text-gray-500');
        $(this).addClass('bg-emerald-600 text-white').removeClass('text-gray-500');
        $(this).closest('nav').nextAll('div[id]').addClass('hidden');
        $('#' + target).removeClass('hidden');
        if (onSwitch) onSwitch(target);
    });
}
