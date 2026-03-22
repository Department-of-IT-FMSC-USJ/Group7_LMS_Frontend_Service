var examId = new URLSearchParams(window.location.search).get('id');

$(function () {
    if (!requireAuth(['TEACHER'])) return;
    if (!examId) { window.location.href = 'dashboard.html'; return; }
    loadExam();
});

function loadExam() {
    showLoading();
    api('GET', '/teacher/exams/' + examId).done(function (exam) {
        hideLoading();
        $('#exam-title').text(exam.title);
        $('#exam-status').text('Status: ' + exam.status);
        if (exam.status === 'DRAFT') $('#publish-btn').removeClass('hidden'); else $('#publish-btn').addClass('hidden');
        if (exam.status === 'PUBLISHED') $('#close-btn').removeClass('hidden'); else $('#close-btn').addClass('hidden');

        $('#exam-info').html(
            '<div class="bg-white rounded-none p-5 shadow-sm border border-gray-100 mb-4">' +
            '<div class="flex gap-4 text-gray-500 text-sm flex-wrap">' +
            '<span><i class="fa-solid fa-pen-to-square mr-1"></i>' + (exam.questionCount || '—') + ' per student</span>' +
            '<span><i class="fa-solid fa-box mr-1"></i>' + exam.totalPoolQuestions + ' total pool</span>' +
            '<span><i class="fa-solid fa-clock mr-1"></i>' + exam.durationMinutes + ' min</span>' +
            '<span><i class="fa-solid fa-users mr-1"></i>' + (exam.totalAttempts || 0) + ' attempts</span></div>' +
            (exam.description ? '<p class="text-gray-600 mt-2">' + esc(exam.description) + '</p>' : '') +
            (exam.startDatetime ? '<p class="text-gray-400 text-sm mt-1"><i class="fa-solid fa-calendar mr-1"></i>' + fmtDate(exam.startDatetime) + ' — ' + fmtDate(exam.endDatetime) + '</p>' : '') +
            '</div>');

        $('#exam-questions').html(
            (exam.questions || []).map(function (q) { return renderQuestionCard(q, true, false); }).join('') ||
            '<div class="text-center py-10 text-gray-400"><p>No questions.</p></div>');

        var attempts = exam.attempts || [];
        if (attempts.length) {
            if ($.fn.DataTable.isDataTable('#attempts-table')) $('#attempts-table').DataTable().destroy();
            $('#exam-attempts').html(
                '<table id="attempts-table" class="display w-full"><thead><tr>' +
                '<th>Student</th><th>Score</th><th>Percentage</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>' +
                attempts.map(function (a) {
                    var pct = pctCalc(a.score, a.totalQuestions);
                    return '<tr><td>' + esc(a.studentName) + '</td><td>' + a.score + '/' + a.totalQuestions + '</td>' +
                        '<td><span class="' + badgeCls(pct >= 50 ? 'green' : 'red') + ' px-2.5 py-0.5 rounded text-xs font-semibold">' + pct + '%</span></td>' +
                        '<td>' + fmtDate(a.submittedAt) + '</td>' +
                        '<td><button onclick="window.location.href=\'../analytics/student-perf.html?examId=' + examId + '&studentId=' + a.studentId + '\'" class="px-3 py-1 text-xs border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition">View</button></td></tr>';
                }).join('') + '</tbody></table>');
            $('#attempts-table').DataTable({ order: [[2, 'desc']], pageLength: 25 });
        } else {
            $('#exam-attempts').html('<div class="text-center py-10 text-gray-400"><p>No attempts yet.</p></div>');
        }
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

function publishExam() {
    api('PUT', '/teacher/exams/' + examId + '/publish').done(function () { toast('Exam published!'); loadExam(); })
        .fail(function (x) { toast(ajaxErr(x), 'error'); });
}

function closeExam() {
    if (!confirm('Close? Students won\'t be able to take it.')) return;
    api('PUT', '/teacher/exams/' + examId + '/close').done(function () { toast('Exam closed'); loadExam(); })
        .fail(function (x) { toast(ajaxErr(x), 'error'); });
}
