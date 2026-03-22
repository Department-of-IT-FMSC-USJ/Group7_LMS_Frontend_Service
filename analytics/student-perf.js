var examId = new URLSearchParams(window.location.search).get('examId');
var studentId = new URLSearchParams(window.location.search).get('studentId');

$(function () {
    if (!requireAuth(['TEACHER'])) return;
    if (!examId || !studentId) { window.location.href = '../teacher/dashboard.html'; return; }
    $('#back-btn').on('click', function () { window.location.href = 'exam-analytics.html?id=' + examId; });

    showLoading();
    api('GET', '/teacher/exams/' + examId + '/students/' + studentId).done(function (data) {
        hideLoading();
        $('#title').text((data.studentName || 'Student') + "'s Performance");

        var lessonHtml = (data.lessonBreakdown || []).map(function (l) {
            var pct = l.total > 0 ? (l.correct / l.total * 100) : 0;
            return '<div class="flex items-center gap-3 py-3 border-b border-gray-100">' +
                '<span class="w-48 text-sm text-gray-700 flex-shrink-0">' + esc(l.lessonName) + '</span>' +
                '<div class="flex-1 bg-green-100 rounded-full h-3 overflow-hidden"><div class="h-full bg-green-500 rounded-full" style="width:' + pct + '%"></div></div>' +
                '<span class="text-sm text-gray-500 w-24 text-right flex-shrink-0">' + l.correct + '/' + l.total + '</span></div>';
        }).join('');

        var html =
            '<div class="text-center bg-white rounded-none p-10 shadow-sm border border-gray-100 mb-6">' +
            '<div class="text-2xl font-bold text-emerald-700">' + data.score + ' / ' + data.totalQuestions + '</div>' +
            '<div class="text-gray-500 mt-2">' + data.percentage + '%</div></div>' +
            (lessonHtml ? '<h3 class="text-sm font-semibold mb-3">Per-Lesson Breakdown</h3><div class="bg-white rounded-none p-5 shadow-sm border border-gray-100 mb-6">' + lessonHtml + '</div>' : '') +
            '<h3 class="text-sm font-semibold mb-3">Per-Question Detail</h3>' +
            (data.answers || []).map(function (a, i) {
                return '<div class="bg-white rounded-none p-5 border border-gray-100 shadow-sm mb-4">' +
                    '<div class="text-sm font-bold mb-2 ' + (a.correct ? 'text-green-600' : 'text-red-600') + '">Question ' + (i + 1) + ' ' + (a.correct ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>') + '</div>' +
                    '<div class="text-base mb-2">' + esc(a.questionText) + '</div>' +
                    '<p class="text-sm text-gray-600"><strong>Selected:</strong> ' + esc(a.selectedAnswer) + ' | <strong>Correct:</strong> ' + esc(a.correctAnswer) + '</p>' +
                    (a.lessonName ? '<span class="' + badgeCls('blue') + ' px-2.5 py-0.5 rounded text-xs font-semibold mt-2 inline-block">' + esc(a.lessonName) + '</span>' : '') +
                    '</div>';
            }).join('');

        $('#content').html(html);
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
});
