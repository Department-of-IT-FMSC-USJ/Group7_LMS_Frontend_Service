$(function () {
    if (!requireAuth(['STUDENT'])) return;
    var attemptId = new URLSearchParams(window.location.search).get('attemptId');
    var cached = sessionStorage.getItem('examResult');

    if (cached) {
        sessionStorage.removeItem('examResult');
        showResult(JSON.parse(cached));
    } else if (attemptId) {
        showLoading();
        api('GET', '/student/attempts/' + attemptId).done(function (r) { hideLoading(); showResult(r); })
            .fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
    } else {
        window.location.href = 'dashboard.html';
    }
});

function showResult(r) {
    var pct = r.percentage;
    $('#result-summary').html(
        '<div class="text-center bg-white rounded-none p-10 shadow-sm border border-gray-100">' +
        '<div class="text-2xl font-bold text-emerald-700">' + r.score + ' / ' + r.totalQuestions + '</div>' +
        '<div class="text-gray-500 mt-2">Correct Answers</div>' +
        '<div class="text-2xl font-bold mt-2 ' + (pct >= 50 ? 'text-green-500' : 'text-red-500') + '">' + pct + '%</div></div>');

    $('#result-details').html((r.answers || []).map(function (a, i) {
        return '<div class="bg-white rounded-none p-5 border border-gray-100 shadow-sm mb-4">' +
            '<div class="text-sm font-bold mb-2 ' + (a.correct ? 'text-green-600' : 'text-red-600') + '">Question ' + (i + 1) + ' ' + (a.correct ? '<i class="fa-solid fa-circle-check"></i>' : '<i class="fa-solid fa-circle-xmark"></i>') + '</div>' +
            '<div class="text-base mb-3 leading-relaxed">' + linkify(esc(a.questionText)) + '</div>' +
            '<ul class="space-y-1.5 mb-3">' + (a.options || []).map(function (opt) {
                var cls = 'border-gray-200';
                if (opt === a.correctAnswer) cls = 'border-green-500 bg-green-50';
                else if (opt === a.selectedAnswer && !a.correct) cls = 'border-red-500 bg-red-50';
                return '<li class="px-3 py-2.5 rounded-none border ' + cls + ' text-sm">' + linkify(esc(opt)) +
                    (opt === a.correctAnswer ? ' ✓' : '') + (opt === a.selectedAnswer && !a.correct ? ' ✗' : '') + '</li>';
            }).join('') + '</ul>' +
            (!a.correct ? '<div class="text-green-600 font-semibold text-sm"><i class="fa-solid fa-circle-check mr-1"></i>Correct: ' + esc(a.correctAnswer) + '</div>' : '') +
            (a.explanation ? '<div class="bg-emerald-50 p-3 rounded-none border-l-[3px] border-emerald-600 text-sm text-gray-600 mt-2"><i class="fa-solid fa-lightbulb mr-1 text-emerald-700"></i>' + linkify(esc(a.explanation)) + '</div>' : '') +
            (a.lessonName ? '<span class="' + badgeCls('blue') + ' px-2.5 py-0.5 rounded text-xs font-semibold mt-2 inline-block">' + esc(a.lessonName) + '</span>' : '') +
            '</div>';
    }).join(''));
}
