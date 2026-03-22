$(function () {
    if (!requireAuth(['STUDENT'])) return;
    renderHeader('Student Dashboard', '<i class="fa-solid fa-graduation-cap"></i>');
    initSubTabs(function (target) {
        if (target === 'weak-section') loadWeakLessons();
    });
    loadData();
});

function loadData() {
    $.when(api('GET', '/student/exams'), api('GET', '/student/attempts'))
        .done(function (er, ar) { renderExams(er[0]); renderAttempts(ar[0]); })
        .fail(function (x) { toast(ajaxErr(x), 'error'); });
}

function renderExams(exams) {
    var $el = $('#exams-list');
    if (!exams.length) { $el.html('<div class="text-center py-16 text-gray-400 col-span-full"><div class="text-3xl mb-3"><i class="fa-solid fa-clipboard-list"></i></div><p>No exams available right now.</p></div>'); return; }
    $el.html(exams.map(function (e) {
        return '<div class="bg-white rounded-none p-5 shadow-sm border border-gray-100 hover:shadow-md transition">' +
            '<div class="text-lg font-semibold text-gray-800 mb-2">' + esc(e.title) + '</div>' +
            '<div class="flex gap-4 text-gray-500 text-sm mb-3 flex-wrap">' +
            '<span><i class="fa-solid fa-chalkboard-user mr-1"></i>' + esc(e.teacherName) + '</span><span><i class="fa-solid fa-pen-to-square mr-1"></i>' + e.questionCount + ' questions</span><span><i class="fa-solid fa-clock mr-1"></i>' + e.durationMinutes + ' min</span></div>' +
            (e.description ? '<p class="text-gray-600 text-sm mb-2">' + esc(e.description) + '</p>' : '') +
            (e.startDatetime ? '<p class="text-gray-400 text-xs mb-2"><i class="fa-solid fa-calendar mr-1"></i>' + fmtDate(e.startDatetime) + ' \u2192 ' + fmtDate(e.endDatetime) + '</p>' : '') +
            '<div class="pt-3 border-t border-gray-100"><button onclick="window.location.href=\'take-exam.html?id=' + e.id + '\'" class="px-4 py-2 text-sm bg-emerald-600 text-white rounded-none hover:bg-emerald-700 transition">Take Exam</button></div></div>';
    }).join(''));
}

function renderAttempts(attempts) {
    var $el = $('#attempts-list');
    if (!attempts.length) { $el.html('<div class="text-center py-16 text-gray-400 col-span-full"><div class="text-3xl mb-3"><i class="fa-solid fa-chart-bar"></i></div><p>No attempts yet. Take an exam!</p></div>'); return; }
    $el.html(attempts.map(function (a) {
        return '<div class="bg-white rounded-none p-5 shadow-sm border border-gray-100 hover:shadow-md transition">' +
            '<div class="text-lg font-semibold text-gray-800 mb-2">' + esc(a.examTitle) + '</div>' +
            '<div class="flex gap-4 text-gray-500 text-sm mb-3 flex-wrap"><span><i class="fa-solid fa-trophy mr-1"></i>' + a.score + '/' + a.totalQuestions + '</span>' +
            '<span class="' + badgeCls(a.percentage >= 50 ? 'green' : 'red') + ' px-2.5 py-0.5 rounded text-xs font-semibold">' + a.percentage + '%</span>' +
            '<span><i class="fa-solid fa-calendar mr-1"></i>' + fmtDate(a.submittedAt) + '</span></div>' +
            '<div class="pt-3 border-t border-gray-100"><button onclick="window.location.href=\'result.html?attemptId=' + a.id + '\'" class="px-4 py-1.5 text-sm border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition">View Details</button></div></div>';
    }).join(''));
}

function loadWeakLessons() {
    showLoading();
    api('GET', '/student/weak-lessons').done(function (data) {
        hideLoading();
        var weakHtml = (data.weakLessons || []).map(function (l) {
            return '<div class="flex items-center gap-3 py-3 border-b border-gray-100">' +
                '<span class="w-48 text-sm text-gray-700 flex-shrink-0"><i class="fa-solid fa-triangle-exclamation mr-1 text-red-500"></i>' + esc(l.lessonName) + '</span>' +
                '<div class="flex-1 bg-red-100 rounded-full h-3 overflow-hidden"><div class="h-full bg-red-500 rounded-full" style="width:' + Math.min(l.badScore * 10, 100) + '%"></div></div>' +
                '<span class="text-sm text-gray-500 w-36 text-right flex-shrink-0">Score: ' + l.badScore + ' | Wrong: ' + l.totalWrongCount + '</span></div>';
        }).join('');
        var masteredHtml = (data.masteredLessons || []).map(function (l) {
            return '<div class="flex items-center gap-3 py-3 border-b border-gray-100">' +
                '<span class="w-48 text-sm text-gray-700 flex-shrink-0"><i class="fa-solid fa-circle-check mr-1 text-green-600"></i>' + esc(l.lessonName) + '</span>' +
                '<div class="flex-1 bg-green-100 rounded-full h-3 overflow-hidden"><div class="h-full bg-green-500 rounded-full w-full"></div></div>' +
                '<span class="text-sm text-gray-500 w-36 text-right flex-shrink-0">Mastered</span></div>';
        }).join('');
        $('#weak-content').html(
            (weakHtml ? '<h4 class="font-semibold mb-2">Weak Areas (Focus on these)</h4><div class="bg-white rounded-none p-5 border border-gray-100 shadow-sm mb-4">' + weakHtml + '</div>' : '') +
            (masteredHtml ? '<h4 class="font-semibold mb-2 mt-4">Mastered Lessons</h4><div class="bg-white rounded-none p-5 border border-gray-100 shadow-sm">' + masteredHtml + '</div>' : '') +
            (!weakHtml && !masteredHtml ? '<div class="text-center py-16 text-gray-400"><div class="text-3xl mb-3"><i class="fa-solid fa-book"></i></div><p>No lesson data yet. Take some exams!</p></div>' : '')
        );
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}
