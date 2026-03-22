var extractedData = null;

$(function () {
    if (!requireAuth(['TEACHER'])) return;
    var raw = sessionStorage.getItem('extractedData');
    if (!raw) { window.location.href = 'dashboard.html'; return; }
    extractedData = JSON.parse(raw);
    renderQuestions();
});

function renderQuestions() {
    if (!extractedData || !extractedData.questions || !extractedData.questions.length) {
        $('#questions-list').html('<div class="text-center py-16 text-gray-400"><div class="text-3xl mb-3"><i class="fa-solid fa-file-pdf"></i></div><p>No questions extracted.</p></div>');
        return;
    }
    $('#questions-list').html(extractedData.questions.map(function (q, i) {
        return '<div class="bg-white rounded-none p-5 border border-gray-100 shadow-sm mb-4" data-index="' + i + '">' +
            '<div class="flex justify-between items-center mb-3">' +
            '<span class="text-emerald-700 font-bold">Question ' + (i + 1) + '</span>' +
            '<button onclick="removeQ(' + i + ')" class="px-3 py-1 text-xs bg-red-500 text-white rounded-none hover:bg-red-600 transition">Remove</button></div>' +
            '<div class="mb-2"><label class="block text-sm font-semibold text-gray-500 mb-1">Question Text</label>' +
            '<textarea class="eq-text w-full px-3 py-2 border border-gray-200 rounded-none focus:border-emerald-600 focus:outline-none" rows="2">' + esc(q.questionText || q.question_text || '') + '</textarea></div>' +
            '<div class="flex gap-3">' + (q.options || []).map(function (opt, oi) {
                return '<div class="flex-1 mb-2"><label class="block text-sm font-semibold text-gray-500 mb-1">Option ' + String.fromCharCode(65 + oi) + '</label>' +
                    '<input type="text" class="eq-opt w-full px-3 py-2 border border-gray-200 rounded-none focus:border-emerald-600 focus:outline-none" value="' + esc(opt) + '"></div>';
            }).join('') + '</div>' +
            '<div class="flex gap-3">' +
            '<div class="flex-1 mb-2"><label class="block text-sm font-semibold text-gray-500 mb-1">Correct Answer</label>' +
            '<input type="text" class="eq-correct w-full px-3 py-2 border border-gray-200 rounded-none focus:border-emerald-600 focus:outline-none" value="' + esc(q.correctAnswer || q.correct_answer || '') + '"></div>' +
            '<div class="flex-1 mb-2"><label class="block text-sm font-semibold text-gray-500 mb-1">Explanation</label>' +
            '<input type="text" class="eq-expl w-full px-3 py-2 border border-gray-200 rounded-none focus:border-emerald-600 focus:outline-none" value="' + esc(q.answerExplanation || q.answer_explanation || '') + '"></div>' +
            '</div></div>';
    }).join(''));
}

function removeQ(i) {
    extractedData.questions.splice(i, 1);
    renderQuestions();
}

function saveQuestions() {
    var name = $('#set-name').val().trim();
    if (!name) { toast('Enter a paper name', 'error'); return; }
    if (!extractedData || !extractedData.questions || !extractedData.questions.length) { toast('No questions to save', 'error'); return; }

    var cards = $('#questions-list > div');
    var edited = [];
    cards.each(function (i) {
        var $c = $(this), oq = extractedData.questions[i], opts = [];
        $c.find('.eq-opt').each(function () { opts.push($(this).val()); });
        edited.push({
            questionNumber: oq.questionNumber || oq.question_number || String(i + 1),
            pageNumber: oq.pageNumber || oq.page_number || null,
            questionText: $c.find('.eq-text').val(),
            options: opts,
            correctAnswer: $c.find('.eq-correct').val(),
            answerExplanation: $c.find('.eq-expl').val(),
            hasSharedReference: oq.hasSharedReference || false,
            sharedReferenceId: oq.sharedReferenceId || null,
            imageUrl: oq.imageUrl || oq.image_url || null,
            hasVisualOptions: oq.hasVisualOptions || false
        });
    });

    showLoading('Saving questions...');
    api('POST', '/teacher/question-sets/import-json', {
        setName: name,
        data: { success: true, totalQuestions: edited.length, questions: edited }
    }).done(function () {
        hideLoading(); toast('Paper saved with ' + edited.length + ' questions!');
        sessionStorage.removeItem('extractedData');
        window.location.href = 'dashboard.html';
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}
