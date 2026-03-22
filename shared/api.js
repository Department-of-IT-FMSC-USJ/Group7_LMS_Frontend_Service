var API_BASE = 'http://localhost:8087/api';

function getToken() { return localStorage.getItem('token'); }
function getRole() { return localStorage.getItem('role'); }
function getUsername() { return localStorage.getItem('username'); }

function saveAuth(data) {
    localStorage.setItem('token', data.token);
    localStorage.setItem('role', data.role);
    localStorage.setItem('username', data.username);
}

function clearAuth() { localStorage.clear(); }

function api(method, path, data) {
    var opts = {
        url: API_BASE + path,
        method: method,
        headers: getToken() ? { Authorization: 'Bearer ' + getToken() } : {}
    };
    if (data && method !== 'GET') {
        opts.contentType = 'application/json';
        opts.data = JSON.stringify(data);
    }
    return $.ajax(opts);
}

function apiUpload(path, formData) {
    return $.ajax({
        url: API_BASE + path,
        method: 'POST',
        headers: { Authorization: 'Bearer ' + getToken() },
        data: formData,
        processData: false,
        contentType: false
    });
}

function ajaxErr(jqXHR) {
    try {
        var d = typeof jqXHR.responseJSON === 'object' ? jqXHR.responseJSON : JSON.parse(jqXHR.responseText);
        return d.error || d.message || 'Request failed';
    } catch (e) {
        return jqXHR.responseText || 'Request failed';
    }
}
