class Options {
    constructor() {
        this.defaultSettings = {
            everSet: false,
            disable: false,
            hide: false,
            expirationInDays: "7",
            queryStringsToIgnore: "_\n",
            websiteWhiteList: "",
            ajaxUrlBlackList: "",
            httpMethodBlackList: "PUT\nDELETE\nPATCH\n"
        };
        document.getElementById("advancedSettingsLink").addEventListener("click", () => {
            document.getElementById("advancedSettingsLinkContainer").remove();
            document.getElementById("advancedSettings").className = document.getElementById("advancedSettings").className.replace("hide", "");
        });
        this.loadSettings();
        this.enableDisableLink.addEventListener("click", () => {
            this.enableDisableLink.innerText = this.enableDisableLink.innerText === "disable" ? "enable" : "disable";
            this.saveSettings();
        });
        this.showHideLink.addEventListener("click", () => {
            this.showHideLink.innerText = this.showHideLink.innerText === "hide" ? "show" : "hide";
            this.saveSettings();
        });
        this.expirationInDays.addEventListener("change", () => { this.saveSettings(); });
        this.queryStringsToIgnore.addEventListener("change", () => { this.saveSettings(); });
        this.websiteWhiteList.addEventListener("change", () => { this.saveSettings(); });
        this.ajaxUrlBlackList.addEventListener("change", () => { this.saveSettings(); });
        this.httpMethodBlackList.addEventListener("change", () => { this.saveSettings(); });
    }
    get enableDisableLink() {
        return document.getElementById("enableDisableLink");
    }
    get showHideLink() {
        return document.getElementById("showHideLink");
    }
    get expirationInDays() {
        return document.getElementById("expirationInDays");
    }
    get queryStringsToIgnore() {
        return document.getElementById("queryStringsToIgnore");
    }
    get websiteWhiteList() {
        return document.getElementById("websiteWhiteList");
    }
    get ajaxUrlBlackList() {
        return document.getElementById("ajaxUrlBlackList");
    }
    get httpMethodBlackList() {
        return document.getElementById("httpMethodBlackList");
    }
    loadSettings() {
        let promise = new Promise((resolve) => {
            chrome.storage.sync.get(Object.keys(this.defaultSettings), (settings) => {
                if (!settings.everSet) {
                    settings = Object.assign({}, this.defaultSettings);
                }
                this.enableDisableLink.innerText = settings.disable ? "enable" : "disable";
                this.showHideLink.innerText = settings.hide ? "show" : "hide";
                this.expirationInDays.value = settings.expirationInDays.toString();
                // advanced
                this.queryStringsToIgnore.value = settings.queryStringsToIgnore.toString();
                this.websiteWhiteList.value = settings.websiteWhiteList.toString();
                this.ajaxUrlBlackList.value = settings.ajaxUrlBlackList.toString();
                this.httpMethodBlackList.value = settings.httpMethodBlackList.toString();
                resolve(settings);
            });
        });
        return promise;
    }
    saveSettings() {
        let settings = {
            everSet: true,
            disable: this.enableDisableLink.innerText === "enable",
            hide: this.showHideLink.innerText === "show",
            expirationInDays: this.expirationInDays.value,
            queryStringsToIgnore: this.queryStringsToIgnore.value,
            websiteWhiteList: this.websiteWhiteList.value,
            ajaxUrlBlackList: this.ajaxUrlBlackList.value,
            httpMethodBlackList: this.httpMethodBlackList.value
        };
        chrome.storage.sync.set(settings);
    }
}
var chrome = window.chrome;
document.addEventListener("DOMContentLoaded", function () {
    new Options();
});
//# sourceMappingURL=options.js.map