$(function () {
    if (!requireAuth(['TEACHER'])) return;
    renderHeader('Teacher Dashboard', '<i class="fa-solid fa-book"></i>');
    initSubTabs();
    loadData();

    $('#create-paper-form').on('submit', function (e) {
        e.preventDefault();
        api('POST', '/teacher/question-sets', {
            name: $('#paper-name').val(),
            subject: $('#paper-subject').val() || null
        }).done(function () {
            $('#create-paper-modal').addClass('hidden');
            $('#paper-name, #paper-subject').val('');
            toast('Paper created!');
            loadData();
        }).fail(function (x) { toast(ajaxErr(x), 'error'); });
    });

    $('#extract-pdf-form').on('submit', function (e) {
        e.preventDefault();
        var fd = new FormData();
        fd.append('file', $('#extract-pdf-file')[0].files[0]);
        var key = $('#extract-gemini-key').val();
        if (key) fd.append('geminiApiKey', key);
        $('#extract-pdf-modal').addClass('hidden');
        showLoading('Extracting questions from PDF...');
        apiUpload('/teacher/question-sets/extract-pdf', fd).done(function (data) {
            hideLoading();
            sessionStorage.setItem('extractedData', JSON.stringify(data));
            window.location.href = 'extract-pdf.html';
        }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
    });

    $('#import-json-form').on('submit', function (e) {
        e.preventDefault();
        try {
            var data = JSON.parse($('#json-data').val());
            showLoading('Importing questions...');
            $('#import-json-modal').addClass('hidden');
            api('POST', '/teacher/question-sets/import-json', {
                setName: $('#json-set-name').val(), data: data
            }).done(function () {
                hideLoading(); toast('Questions imported!');
                $('#json-set-name, #json-data').val('');
                loadData();
            }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
        } catch (err) { toast('Invalid JSON: ' + err.message, 'error'); }
    });

    $('#import-pdf-form').on('submit', function (e) {
        e.preventDefault();
        var fd = new FormData();
        fd.append('file', $('#pdf-file')[0].files[0]);
        fd.append('setName', $('#pdf-set-name').val());
        var key = $('#gemini-key').val();
        if (key) fd.append('geminiApiKey', key);
        $('#import-pdf-modal').addClass('hidden');
        showLoading('Processing PDF...');
        apiUpload('/teacher/question-sets/import-pdf', fd).done(function () {
            hideLoading(); toast('PDF imported!');
            $('#pdf-set-name').val('');
            loadData();
        }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
    });
});

function loadData() {
    $.when(api('GET', '/teacher/question-sets'), api('GET', '/teacher/exams'))
        .done(function (sr, er) { renderSets(sr[0]); renderExams(er[0]); })
        .fail(function (x) { toast(ajaxErr(x), 'error'); });
}

function renderSets(sets) {
    var $el = $('#sets-list');
    if (!sets.length) { $el.html('<div class="text-center py-16 text-gray-400 col-span-full"><div class="text-3xl mb-3"><i class="fa-solid fa-box"></i></div><p>No question sets yet.</p></div>'); return; }
    $el.html(sets.map(function (s) {
        return '<div class="bg-white rounded-none p-5 shadow-sm border border-gray-100 hover:shadow-md transition">' +
            '<div class="text-lg font-semibold text-gray-800 mb-2">' + esc(s.name) + '</div>' +
            '<div class="flex gap-4 text-gray-500 text-sm mb-3 flex-wrap">' +
            (s.subject ? '<span><i class="fa-solid fa-book-open mr-1"></i>' + esc(s.subject) + '</span>' : '') +
            '<span><i class="fa-solid fa-pen-to-square mr-1"></i>' + s.questionCount + ' questions</span><span><i class="fa-solid fa-calendar mr-1"></i>' + fmtDate(s.createdAt) + '</span></div>' +
            '<div class="flex gap-2 pt-3 border-t border-gray-100">' +
            '<button onclick="window.location.href=\'set-detail.html?id=' + s.id + '\'" class="px-4 py-1.5 text-sm border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition">View</button>' +
            '<button onclick="deleteSet(' + s.id + ')" class="px-4 py-1.5 text-sm bg-red-500 text-white rounded-none hover:bg-red-600 transition">Delete</button></div></div>';
    }).join(''));
}

function renderExams(exams) {
    var $el = $('#exams-list');
    if (!exams.length) { $el.html('<div class="text-center py-16 text-gray-400 col-span-full"><div class="text-3xl mb-3"><i class="fa-solid fa-clipboard-list"></i></div><p>No exams yet.</p></div>'); return; }
    $el.html(exams.map(function (e) {
        return '<div class="bg-white rounded-none p-5 shadow-sm border border-gray-100 hover:shadow-md transition">' +
            '<div class="text-lg font-semibold text-gray-800 mb-2">' + esc(e.title) +
            ' <span class="' + badgeCls(statusColor(e.status)) + ' px-2.5 py-0.5 rounded text-xs font-semibold">' + e.status + '</span></div>' +
            '<div class="flex gap-4 text-gray-500 text-sm mb-3 flex-wrap">' +
            '<span><i class="fa-solid fa-pen-to-square mr-1"></i>' + (e.questionCount || e.totalPoolQuestions) + ' Qs/student</span>' +
            '<span><i class="fa-solid fa-box mr-1"></i>' + e.totalPoolQuestions + ' in pool</span><span><i class="fa-solid fa-clock mr-1"></i>' + e.durationMinutes + ' min</span></div>' +
            '<div class="flex gap-2 pt-3 border-t border-gray-100">' +
            '<button onclick="window.location.href=\'exam-detail.html?id=' + e.id + '\'" class="px-4 py-1.5 text-sm border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition">Details</button>' +
            '<button onclick="window.location.href=\'../analytics/exam-analytics.html?id=' + e.id + '\'" class="px-4 py-1.5 text-sm border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition"><i class="fa-solid fa-chart-bar mr-1"></i>Analytics</button>' +
            '<button onclick="deleteExam(' + e.id + ')" class="px-4 py-1.5 text-sm bg-red-500 text-white rounded-none hover:bg-red-600 transition">Delete</button></div></div>';
    }).join(''));
}

function deleteSet(id) {
    if (!confirm('Delete this question set?')) return;
    api('DELETE', '/teacher/question-sets/' + id).done(function () { toast('Set deleted'); loadData(); }).fail(function (x) { toast(ajaxErr(x), 'error'); });
}

function deleteExam(id) {
    if (!confirm('Delete this exam?')) return;
    api('DELETE', '/teacher/exams/' + id).done(function () { toast('Exam deleted'); loadData(); }).fail(function (x) { toast(ajaxErr(x), 'error'); });
}
