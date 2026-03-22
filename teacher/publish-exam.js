$(function () {
    if (!requireAuth(['TEACHER'])) return;
    loadQuestionBank();

    $('#publish-form').on('submit', function (e) {
        e.preventDefault();
        var checked = $('#question-sets .q-cb:checked');
        if (!checked.length) { toast('Select at least one question!', 'error'); return; }
        var count = parseInt($('#pub-count').val());
        if (count > checked.length) { toast('Questions per student (' + count + ') exceeds pool (' + checked.length + ')', 'error'); return; }

        var setMap = {}, allMap = {};
        checked.each(function () { var s = $(this).data('set-id'); setMap[s] = (setMap[s] || 0) + 1; });
        $('#question-sets .q-cb').each(function () { var s = $(this).data('set-id'); allMap[s] = (allMap[s] || 0) + 1; });

        var fullSets = [], partialIds = [];
        for (var sid in setMap) {
            if (setMap[sid] === allMap[sid]) { fullSets.push(parseInt(sid)); }
            else { $('#question-sets .q-cb[data-set-id="' + sid + '"]:checked').each(function () { partialIds.push(parseInt($(this).val())); }); }
        }

        showLoading('Publishing exam...');
        api('POST', '/teacher/exams/publish', {
            title: $('#pub-title').val(),
            description: $('#pub-desc').val() || null,
            durationMinutes: parseInt($('#pub-duration').val()),
            questionCount: count,
            questionSetIds: fullSets.length ? fullSets : null,
            questionIds: partialIds.length ? partialIds : null,
            startDatetime: $('#pub-start').val() || null,
            endDatetime: $('#pub-end').val() || null
        }).done(function () {
            hideLoading(); toast('Exam published!');
            window.location.href = 'dashboard.html';
        }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
    });
});

function loadQuestionBank() {
    showLoading('Loading question bank...');
    api('GET', '/teacher/question-sets').done(function (sets) {
        if (!sets.length) { hideLoading(); toast('Create question sets first!', 'info'); return; }
        Promise.all(sets.map(function (s) { return api('GET', '/teacher/question-sets/' + s.id); }))
            .then(function (fullSets) { hideLoading(); renderQuestionBank(fullSets); });
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

function renderQuestionBank(fullSets) {
    $('#question-sets').html(fullSets.map(function (set) {
        return '<div class="bg-white rounded-none border border-gray-100 shadow-sm mb-4 overflow-hidden">' +
            '<div class="flex items-center justify-between px-5 py-3 bg-gray-50 border-b border-gray-100">' +
            '<h4 class="font-semibold">' + esc(set.name) + (set.subject ? ' <span class="text-gray-400 font-normal">(' + esc(set.subject) + ')</span>' : '') + ' — ' + set.questions.length + ' Qs</h4>' +
            '<label class="text-sm text-emerald-700 cursor-pointer"><input type="checkbox" class="toggle-all" data-set-class="set-' + set.id + '" onchange="toggleAll(this)"> Select All</label></div>' +
            set.questions.map(function (q) {
                return '<div class="flex items-start gap-3 px-5 py-3 border-b border-gray-50">' +
                    '<input type="checkbox" class="q-cb set-' + set.id + ' mt-1 accent-emerald-600" value="' + q.id + '" data-set-id="' + set.id + '" onchange="updateCount()">' +
                    '<div class="text-sm text-gray-600"><strong>Q' + q.questionNumber + '.</strong> ' + esc((q.questionText || '').substring(0, 120)) + ((q.questionText || '').length > 120 ? '...' : '') +
                    (q.lessonName ? ' <span class="' + badgeCls('blue') + ' px-2 py-0.5 rounded text-xs">' + esc(q.lessonName) + '</span>' : '') + '</div></div>';
            }).join('') + '</div>';
    }).join(''));
    updateCount();
}

function toggleAll(el) {
    var cls = $(el).data('set-class');
    $('.' + cls).prop('checked', el.checked);
    updateCount();
}

function updateCount() {
    var n = $('#question-sets .q-cb:checked').length;
    $('#selected-count').text(n + ' question' + (n !== 1 ? 's' : '') + ' in pool');
}
