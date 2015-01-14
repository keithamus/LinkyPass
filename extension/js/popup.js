(function ($) {
    'use strict';
    var selectedPass;
    var siteProfile;

    function updateDomain() {
        var domain = $('#domain');
        var value = Password.parseUrl(domain.attr('data-originalurl'), $('#trimdomain')[0].checked);
        if (siteProfile && siteProfile.changeDomain) {
            value = siteProfile.changeDomain;
        }
        domain.val(value);
    }

    function setupPassword() {
        $('#password_list').addClass('hidden');
        $('#password_gen').removeClass('hidden');
        $('#title').text('LinkyPass: ' + selectedPass.name);
        $('#password').val(selectedPass.password).trigger('change');
        setTimeout(function () { $('#password').focus(); }, 100);
    }

    function generatePass() {
        var $password = $('#password'),
            $field = $password.parents('.fld');
        if ($password.val().length !== 0) {
            if (selectedPass && selectedPass.checkHash($password.val())) {
                $field.addClass('valid').removeClass('invalid');
                var password = selectedPass.generate(
                    $('#password').val(),
                    $('#domain').val(),
                    $('#trimdomain')[0].checked
                );
                if (siteProfile && siteProfile.append) {
                    password = password + siteProfile.append;
                }
                $('#generated_password').val(password);
                chrome.tabs.getSelected(function (currentTab) {
                    chrome.tabs.sendRequest(currentTab.id, {
                        type: 'set',
                        value: password
                    });
                });
                return;
            } else {
                $field.addClass('invalid').removeClass('valid');
            }
        }
        $('#password').focus();
    }

    $(function () {

        var $passwordList = $('#password_list');

        chrome.tabs.getSelected(function (currentTab) {
            var url = currentTab.url;
            $('#domain').attr('data-originalurl', url);
            updateDomain();
        });

        Password.retreive(null, function (passes) {
            if (passes.length < 2) {
                selectedPass = passes[0] || new Password();
                setupPassword();
            } else {
                passes.forEach(function (pass, i) {
                    var className = '' + (i === 0 ? 'class="hover" ':'');
                    $passwordList.append('<li ' + className + 'data-id="' + pass.id + '">' +
                        pass.name +
                    '</li>');
                });
            }
        });

        SiteProfile.retreive(null, function (profiles) {
            var domain = $('#domain').val();
            profiles.some(function (profile, i) {
                if (profile.domain === domain) {
                    siteProfile = profile;
                    updateDomain();
                }
            });
        });

        $passwordList.on('mouseenter', 'li', function () {
            $(this).addClass('hover').siblings().removeClass('hover');
        }).on('mouseout', 'li', function () {
            $(this).removeClass('hover');
        }).on('click', 'li', function () {
            var id = $(this).attr('data-id');
            Password.retreive(id, function (items) {
                selectedPass = items[0];
                setupPassword();
            });
        });

        $(document.body).on('keyup', function (event) {
            if ($passwordList.is(':not(.hidden)')) {
                var $hoverLi = $passwordList.find('li.hover');
                if (event.which === 40 || event.which === 38) {
                    var down = event.which === 40,
                        $nextLi = $hoverLi[down ? 'next' : 'prev']();
                    if (!$nextLi.length) {
                        $nextLi = $passwordList.find('li:' + (down ? 'first' : 'last') + '-child');
                    }
                    $nextLi.addClass('hover');
                    $hoverLi.removeClass('hover');
                } else if (event.which === 13) {
                    $hoverLi.click();
                }
            }
        });

        $('#trimdomain').on('click', updateDomain);

        $('#password').on('change keyup', function () {
            var $this = $(this),
                field = $this.parents('.fld');
            if ($this.val().length === 0) {
                return;
            } else if (selectedPass && selectedPass.checkHash($this.val())) {
                field.addClass('valid').removeClass('invalid');
                generatePass();
            } else {
                field.addClass('invalid').removeClass('valid');
            }
        });

        $('#password_gen').on('submit', function () {
            generatePass();
            return false;
        });

        $('#generated_password').on('focus', function () {
            this.type = 'text';
            setTimeout(this.select.bind(this), 1);
        }).on('blur', function () {
            this.type = 'password';
        });

    });

})(Zepto);
