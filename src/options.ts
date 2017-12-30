class Options {
    constructor() {
        document.getElementById("advancedSettingsLink").addEventListener("click", () => {
            document.getElementById("advancedSettingsLinkContainer").remove();
            document.getElementById("advancedSettings").className = document.getElementById("advancedSettings").className.replace("hide", "");
            console.log(document.getElementById("advancedSettings").className)
        });
    }
}

document.addEventListener("DOMContentLoaded", function () {
    new Options();
});

/*
// Saves options to chrome.storage.sync.
function save_options() {
    var color = document.getElementById('color').value;
    var likesColor = document.getElementById('like').checked;
    chrome.storage.sync.set({
        favoriteColor: color,
        likesColor: likesColor
    }, function () {
        var status = document.getElementById('status');
        status.textContent = 'Options saved.';
        setTimeout(function () {
            status.textContent = '';
        }, 750);
    });
}

// Restores select box and checkbox state using the preferences
function restore_options() {
    chrome.storage.sync.get({
        favoriteColor: 'red',
        likesColor: true
    }, function (items) {
        document.getElementById('color').value = items.favoriteColor;
        document.getElementById('like').checked = items.likesColor;
    });
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
*/