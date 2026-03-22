var setId = new URLSearchParams(window.location.search).get('id');

$(function () {
    if (!requireAuth(['TEACHER'])) return;
    if (!setId) { window.location.href = 'dashboard.html'; return; }
    loadSet();

    $('#q-form').on('submit', function (e) {
        e.preventDefault();
        var qId = $('#edit-q-id').val();
        var body = {
            questionText: $('#q-text').val(),
            optionA: $('#q-optA').val(), optionB: $('#q-optB').val(),
            optionC: $('#q-optC').val(), optionD: $('#q-optD').val(),
            correctAnswer: $('#q-correct').val(),
            lessonName: $('#q-lesson').val() || null,
            marks: $('#q-marks').val() ? parseFloat($('#q-marks').val()) : null
        };
        showLoading();
        var req = qId
            ? api('PUT', '/teacher/questions/' + qId, body)
            : api('POST', '/teacher/question-sets/' + setId + '/questions', body);
        req.done(function () {
            hideLoading(); toast(qId ? 'Question updated!' : 'Question added!');
            $('#q-modal').addClass('hidden'); loadSet();
        }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
    });
});

function loadSet() {
    showLoading();
    api('GET', '/teacher/question-sets/' + setId).done(function (set) {
        hideLoading();
        $('#set-title').text(set.name);
        $('#set-subject').text(set.subject ? 'Subject: ' + set.subject : '');
        $('#questions-container').html(set.questions.length
            ? set.questions.map(function (q) { return renderQuestionCard(q, true, true); }).join('')
            : '<div class="text-center py-16 text-gray-400"><div class="text-3xl mb-3"><i class="fa-solid fa-pen-to-square"></i></div><p>No questions. Add some!</p></div>');
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

function showAddModal() {
    $('#q-modal-title').text('Add Question');
    $('#edit-q-id').val('');
    $('#q-text, #q-optA, #q-optB, #q-optC, #q-optD, #q-correct, #q-lesson').val('');
    $('#q-marks').val('');
    $('#q-modal').removeClass('hidden');
}

function editQuestionUI(q) {
    $('#q-modal-title').text('Edit Question');
    $('#edit-q-id').val(q.id);
    $('#q-text').val(q.questionText || '');
    $('#q-optA').val(q.options && q.options[0] || '');
    $('#q-optB').val(q.options && q.options[1] || '');
    $('#q-optC').val(q.options && q.options[2] || '');
    $('#q-optD').val(q.options && q.options[3] || '');
    $('#q-correct').val(q.correctAnswer || '');
    $('#q-lesson').val(q.lessonName || '');
    $('#q-marks').val(q.marks || '');
    $('#q-modal').removeClass('hidden');
}

function deleteQuestion(qId) {
    if (!confirm('Delete this question?')) return;
    api('DELETE', '/teacher/questions/' + qId).done(function () { toast('Question deleted'); loadSet(); })
        .fail(function (x) { toast(ajaxErr(x), 'error'); });
}
