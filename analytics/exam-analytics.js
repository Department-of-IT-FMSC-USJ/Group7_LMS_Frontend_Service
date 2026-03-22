var examId = new URLSearchParams(window.location.search).get('id');

$(function () {
    if (!requireAuth(['TEACHER'])) return;
    if (!examId) { window.location.href = '../teacher/dashboard.html'; return; }
    loadAnalytics();
});

function loadAnalytics() {
    showLoading();
    api('GET', '/teacher/exams/' + examId + '/analytics').done(function (data) {
        hideLoading();
        $('#page-title').html('<i class="fa-solid fa-chart-bar mr-1"></i> ' + (data.examTitle || 'Exam Analytics'));
        var dist = data.scoreDistribution || {};
        var maxBar = Math.max.apply(null, Object.values(dist).concat([1]));

        var html =
            '<div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">' +
            statCard(data.totalAttempts, 'Total Attempts') +
            statCard(data.averageScore + '%', 'Average') +
            statCard(data.highestScore + '%', 'Highest') +
            statCard(data.lowestScore + '%', 'Lowest') +
            statCard(data.passRate + '%', 'Pass Rate (≥50%)') +
            '</div>';

        html += '<h3 class="text-sm font-semibold mb-3">Score Distribution</h3>' +
            '<div class="bg-white rounded-none p-5 shadow-sm border border-gray-100 mb-6">' +
            Object.entries(dist).map(function (e) {
                return '<div class="flex items-center gap-3 mb-2">' +
                    '<span class="w-16 text-sm text-gray-500 text-right">' + e[0] + '%</span>' +
                    '<div class="flex-1 bg-gray-100 rounded-full h-7 overflow-hidden">' +
                    '<div class="h-full bg-emerald-600 rounded-full flex items-center pl-2 text-white text-xs font-semibold" style="width:' + (e[1] / maxBar * 100) + '%">' + e[1] + '</div></div></div>';
            }).join('') + '</div>';

        if (data.students && data.students.length) {
            html += '<h3 class="text-sm font-semibold mb-3">Student Rankings</h3>' +
                '<table id="rankings-table" class="display w-full"><thead><tr>' +
                '<th>Rank</th><th>Student</th><th>Score</th><th>Percentage</th><th>Submitted</th><th>Actions</th></tr></thead><tbody>' +
                data.students.map(function (s) {
                    return '<tr><td>#' + s.rank + '</td><td>' + esc(s.studentName) + '</td><td>' + s.score + '/' + s.totalQuestions + '</td>' +
                        '<td><span class="' + badgeCls(s.percentage >= 50 ? 'green' : 'red') + ' px-2.5 py-0.5 rounded text-xs font-semibold">' + s.percentage + '%</span></td>' +
                        '<td>' + fmtDate(s.submittedAt) + '</td>' +
                        '<td><button onclick="window.location.href=\'student-perf.html?examId=' + examId + '&studentId=' + s.studentId + '\'" class="px-3 py-1 text-xs border border-emerald-600 text-emerald-700 rounded-none hover:bg-emerald-600 hover:text-white transition">Details</button></td></tr>';
                }).join('') + '</tbody></table>';
        }

        $('#content').html(html);
        if (data.students && data.students.length) {
            $('#rankings-table').DataTable({ order: [[0, 'asc']], pageLength: 25 });
        }
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });
}

function statCard(val, label) {
    return '<div class="bg-white rounded-none p-5 text-center shadow-sm border border-gray-100">' +
        '<div class="text-base font-semibold text-emerald-700">' + val + '</div>' +
        '<div class="text-gray-500 text-sm mt-1">' + label + '</div></div>';
}
