function esc(s) { return $('<div>').text(s || '').html(); }

function linkify(text) {
    if (!text) return '';
    return esc(text).replace(/(https?:\/\/[^\s<>"']+)/gi,
        '<a href="$1" target="_blank" rel="noopener" class="text-emerald-700 hover:underline break-all">$1</a>');
}

function fmtDate(d) {
    if (!d) return '';
    return new Date(d).toLocaleDateString('en-US', {
        month: 'short', day: 'numeric', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

function pctCalc(s, t) { return t > 0 ? Math.round(s / t * 100) : 0; }

function badgeCls(color) {
    var m = { green: 'bg-green-100 text-green-800', red: 'bg-red-100 text-red-800', blue: 'bg-blue-100 text-blue-800' };
    return m[color] || m.blue;
}

function statusColor(st) { return st === 'PUBLISHED' ? 'green' : st === 'CLOSED' ? 'red' : 'blue'; }

function renderQuestionCard(q, showAnswer, showActions) {
    var hasImg = q.imageUrl && q.imageUrl.trim();
    var hasRef = q.hasSharedReference && q.sharedReferenceId && q.sharedReferenceId !== 'None';
    return `
        <div class="bg-white rounded-none p-4 border border-gray-200 shadow mb-3">
            <div class="flex items-center gap-2 flex-wrap mb-2">
                <span class="text-emerald-700 font-semibold text-xs">Q${q.questionNumber || ''}</span>
                ${q.pageNumber ? `<span class="text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded">Page ${q.pageNumber}</span>` : ''}
                ${hasRef ? '<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded"><i class="fa-solid fa-paperclip"></i> Shared Ref</span>' : ''}
                ${q.lessonName ? `<span class="${badgeCls('blue')} px-2 py-0.5 rounded text-xs font-medium">${esc(q.lessonName)}</span>` : ''}
                ${q.marks && q.marks !== 1 ? `<span class="bg-gray-100 text-gray-600 px-2 py-0.5 rounded text-xs">${q.marks} marks</span>` : ''}
                ${showActions ? `<div class="ml-auto flex gap-1">
                    <button onclick='editQuestionUI(${JSON.stringify({id:q.id,questionText:q.questionText,options:q.options,correctAnswer:q.correctAnswer,lessonName:q.lessonName,marks:q.marks})})' class="px-3 py-1 text-xs border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition">Edit</button>
                    <button onclick="deleteQuestion(${q.id})" class="px-3 py-1 text-xs bg-red-500 text-white rounded-none hover:bg-red-600 transition">Delete</button>
                </div>` : ''}
            </div>
            <div class="text-sm mb-3 leading-relaxed whitespace-pre-wrap">${linkify(esc(q.questionText))}</div>
            ${hasImg ? `<div class="mb-3"><a href="${q.imageUrl}" target="_blank" rel="noopener"><img class="max-w-full max-h-72 rounded-none border border-gray-200 hover:scale-[1.02] transition cursor-pointer" src="${q.imageUrl}"></a></div>` : ''}
            ${hasRef ? `<div class="bg-blue-50 px-3 py-2 rounded-none text-xs text-blue-800 mb-3 border-l-[3px] border-blue-400"><i class="fa-solid fa-paperclip mr-1"></i>Shared Reference: <strong>${esc(q.sharedReferenceId)}</strong></div>` : ''}
            <ul class="space-y-1 mb-3">
                ${(q.options || []).map(function(opt) {
                    var cls = showAnswer && opt === q.correctAnswer ? 'border-green-500 bg-green-50' : 'border-gray-200';
                    return '<li class="px-3 py-2 rounded-none border ' + cls + ' text-xs">' + linkify(esc(opt)) + (showAnswer && opt === q.correctAnswer ? ' <i class="fa-solid fa-check text-green-600"></i>' : '') + '</li>';
                }).join('')}
            </ul>
            ${showAnswer && q.correctAnswer ? `<div class="text-green-600 font-semibold text-xs"><i class="fa-solid fa-circle-check mr-1"></i>Answer: ${esc(q.correctAnswer)}</div>` : ''}
            ${showAnswer && q.answerExplanation ? `<div class="bg-emerald-50 p-3 rounded-none border-l-[3px] border-emerald-600 text-xs text-gray-600 mt-2"><i class="fa-solid fa-lightbulb mr-1 text-emerald-700"></i>${linkify(esc(q.answerExplanation))}</div>` : ''}
        </div>`;
}
