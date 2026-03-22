$(function () {
    if (!requireAuth()) return;

    showLoading();
    api('GET', '/profile').done(function (p) {
        hideLoading();
        $('#prof-username').val(p.username || '');
        $('#prof-email').val(p.email || '');
        $('#prof-nic').val(p.nic || '');
        $('#prof-contact').val(p.contactNumber || '');
        $('#prof-dob').val(p.dateOfBirth || '');
        $('#prof-gender').val(p.gender || '');
        $('#prof-address').val(p.address || '');
    }).fail(function (x) { hideLoading(); toast(ajaxErr(x), 'error'); });

    $('#profile-form').on('submit', function (e) {
        e.preventDefault();
        api('PUT', '/profile', {
            username: $('#prof-username').val(),
            email: $('#prof-email').val(),
            nic: $('#prof-nic').val() || null,
            contactNumber: $('#prof-contact').val() || null,
            dateOfBirth: $('#prof-dob').val() || null,
            gender: $('#prof-gender').val() || null,
            address: $('#prof-address').val() || null
        }).done(function () { toast('Profile updated!'); })
            .fail(function (x) { toast(ajaxErr(x), 'error'); });
    });

    $('#password-form').on('submit', function (e) {
        e.preventDefault();
        if ($('#pwd-new').val() !== $('#pwd-confirm').val()) { toast('Passwords do not match', 'error'); return; }
        api('PUT', '/profile/password', {
            currentPassword: $('#pwd-current').val(),
            newPassword: $('#pwd-new').val(),
            confirmPassword: $('#pwd-confirm').val()
        }).done(function () { toast('Password changed!'); $('#password-form')[0].reset(); })
            .fail(function (x) { toast(ajaxErr(x), 'error'); });
    });
});
