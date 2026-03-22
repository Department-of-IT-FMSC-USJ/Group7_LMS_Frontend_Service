var examId = new URLSearchParams(window.location.search).get('id');
var attemptId = null, timerInterval = null, duration = 0, startTime = null;

$(function () {
    if (!requireAuth(['STUDENT'])) return;
    if (!examId) { window.location.href = 'dashboard.html'; return; }
    startExam();
});

function startExam() {
    showLoading('Starting exam...');
    api('POST', '/student/exams/' + examId + '/start').done(function (data) {
        hideLoading();
        attemptId = data.attemptId;
        duration = data.durationMinutes;
        startTime = Date.now();
        $('#exam-title').text(data.examTitle || 'Exam');
        $('#exam-info').text(data.totalQuestions + ' questions · ' + duration + ' minutes');

        $('#questions').html((data.questions || []).map(function (q, i) {
            return '<div class="bg-white rounded-none p-5 border border-gray-100 shadow-sm mb-4">' +
                '<div class="text-emerald-700 font-bold text-sm mb-2">Question ' + (i + 1) + ' of ' + data.totalQuestions + '</div>' +
                '<div class="text-base mb-3 leading-relaxed">' + esc(q.questionText) + '</div>' +
                (q.imageUrl ? '<img class="max-w-full max-h-72 rounded-none border mb-3" src="' + q.imageUrl + '">' : '') +
                '<ul class="options-list space-y-2" data-eq-id="' + q.examQuestionId + '">' +
                (q.options || []).map(function (opt) {
                    return '<li class="px-4 py-3 rounded-none border-2 border-gray-200 cursor-pointer text-sm hover:border-emerald-600 hover:bg-emerald-50 transition" data-value="' + esc(opt) + '">' + esc(opt) + '</li>';
                }).join('') + '</ul></div>';
        }).join(''));

        startTimer();
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

$(document).on('click', '.options-list li', function () {
    $(this).siblings().removeClass('border-emerald-600 bg-emerald-50 font-medium').addClass('border-gray-200');
    $(this).addClass('border-emerald-600 bg-emerald-50 font-medium').removeClass('border-gray-200');
});

function startTimer() {
    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(function () {
        var elapsed = Math.floor((Date.now() - startTime) / 1000);
        var rem = (duration * 60) - elapsed;
        if (rem <= 0) { clearInterval(timerInterval); $('#timer').text('00:00'); toast('Time is up! Auto-submitting...', 'info'); submitExam(); return; }
        var m = String(Math.floor(rem / 60)).padStart(2, '0');
        var s = String(rem % 60).padStart(2, '0');
        $('#timer').text(m + ':' + s);
        if (rem <= 60) $('#timer').removeClass('text-emerald-700 bg-emerald-50').addClass('text-red-500 bg-red-50');
        else $('#timer').removeClass('text-red-500 bg-red-50').addClass('text-emerald-700 bg-emerald-50');
    }, 1000);
}

function submitExam() {
    if (timerInterval) clearInterval(timerInterval);
    var answers = [];
    $('.options-list').each(function () {
        var eqId = parseInt($(this).data('eq-id'));
        var $sel = $(this).find('li.border-emerald-600');
        if ($sel.length) answers.push({ examQuestionId: eqId, selectedAnswer: $sel.data('value') });
    });
    if (!answers.length) { toast('Answer at least one question!', 'error'); startTimer(); return; }
    showLoading('Submitting...');
    api('POST', '/student/exams/' + examId + '/submit', { answers: answers }).done(function (result) {
        hideLoading();
        sessionStorage.setItem('examResult', JSON.stringify(result));
        window.location.href = 'result.html';
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}
