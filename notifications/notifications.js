$(function () {
    if (!requireAuth()) return;
    loadNotifications();
});

function loadNotifications() {
    showLoading();
    api('GET', '/notifications').done(function (notifs) {
        hideLoading();
        if (!notifs.length) {
            $('#notif-list').html('<div class="text-center py-16 text-gray-400"><div class="text-3xl mb-3"><i class="fa-solid fa-bell"></i></div><p>No notifications yet.</p></div>');
            return;
        }
        $('#notif-list').html(notifs.map(function (n) {
            return '<div class="bg-white rounded-none p-5 border border-gray-100 shadow-sm mb-3 ' + (!n.read ? 'border-l-4 border-l-emerald-600 bg-emerald-50/30' : '') + '">' +
                '<div class="flex justify-between items-center mb-1">' +
                '<strong class="text-sm">' + esc(n.title) + '</strong>' +
                '<span class="text-xs text-gray-400">' + fmtDate(n.createdAt) + '</span></div>' +
                '<p class="text-sm text-gray-600">' + esc(n.message) + '</p>' +
                (!n.read ? '<button onclick="markRead(' + n.id + ', this)" class="mt-2 px-3 py-1 text-xs border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition">Mark Read</button>' : '') +
                '</div>';
        }).join(''));
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

function markRead(id, btn) {
    api('PUT', '/notifications/' + id + '/read').done(function () {
        $(btn).closest('div.bg-white').removeClass('border-l-4 border-l-emerald-600 bg-emerald-50/30');
        $(btn).remove();
    });
}

function markAllRead() {
    api('PUT', '/notifications/read-all').done(function () {
        toast('All notifications marked as read');
        loadNotifications();
    }).fail(function (x) { toast(ajaxErr(x), 'error'); });
}
