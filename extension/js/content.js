chrome.extension.onRequest.addListener(function (request, sender) {
    'use strict';

    var characterRegex = new RegExp(
        '(?:(character|letter).*)?' + // prefix, e.g "Character N"
        '(\\d)(?:nd|rd|st|th)?'     + // actual number with optional ordinal suffix
        '(.*(?:character|letter))?',  // suffix, e.g "Nth character"
    'i');


    function searchUp(el, fn) {
        return fn(el) ? el : (el === document ? el : searchUp(el.parentNode, fn));
    }

    function injectPasswordChar(el) {
        if (el === formEl) {
            return true;
        }
        var match = el.textContent.match(characterRegex);
        if (match && Number(match[2])) {
            match = Number(match[2]) - 1;
            inputEl.value = password.substr(match, 1);
            return true;
        }
    }

    // Ensure no other extensions can talk to this script, and the only way to
    // talk to this script is to set a password.
    if (sender.id !== chrome.runtime.id || request.type !== 'set' || !request.value) {
        return;
    }

    var el = document.activeElement,
        password = request.value;

    if (el.tagName === 'INPUT' && el.maxLength === 1) {
        el = searchUp(el, function (el) { return el.tagName === 'FORM'; });
        var inputs = el.querySelectorAll('input[type="password"],input[type="text"]'),
            formEl = el;
        if (el.tagName === 'FORM' && inputs.length > 1) {
            for (var i = 0; i < inputs.length; i += 1) {
                var inputEl = inputs[i];
                searchUp(inputEl, injectPasswordChar);
            }
        }
    } else if (el.tagName === 'INPUT' && el.type === 'password') {
        el.value = password.substr(0, el.maxLength || password.length);
    }
});
