class Options {
    private readonly defaultSettings: Settings = {
        everSet: false,
        disable: false,
        hide: false,
        expirationInDays: "7",
        queryStringsToIgnore: "_\n",
        websiteWhiteList: "",
        ajaxUrlBlackList: "",
        httpMethodBlackList: "PUT\nDELETE\nPATCH\n"
    }

    constructor() {
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

    private get enableDisableLink(): HTMLAnchorElement {
        return document.getElementById("enableDisableLink") as HTMLAnchorElement;
    }

    private get showHideLink(): HTMLAnchorElement {
        return document.getElementById("showHideLink") as HTMLAnchorElement;
    }

    private get expirationInDays(): HTMLInputElement {
        return document.getElementById("expirationInDays") as HTMLInputElement;
    }

    private get queryStringsToIgnore(): HTMLTextAreaElement {
        return document.getElementById("queryStringsToIgnore") as HTMLTextAreaElement;
    }

    private get websiteWhiteList(): HTMLTextAreaElement {
        return document.getElementById("websiteWhiteList") as HTMLTextAreaElement;
    }

    private get ajaxUrlBlackList(): HTMLTextAreaElement {
        return document.getElementById("ajaxUrlBlackList") as HTMLTextAreaElement;
    }

    private get httpMethodBlackList(): HTMLTextAreaElement {
        return document.getElementById("httpMethodBlackList") as HTMLTextAreaElement;
    }

    private loadSettings(): Promise<Settings> {
        let promise = new Promise<Settings>((resolve) => {
            chrome.storage.sync.get(Object.keys(this.defaultSettings), (settings: Settings) => {
                if (!settings.everSet) {
                    settings = { ... this.defaultSettings };
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

    private saveSettings(): void {
        let settings: Settings = {
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


interface Settings {
    everSet: boolean;
    disable: boolean;
    hide: boolean;
    expirationInDays: string;
    queryStringsToIgnore: string;
    websiteWhiteList: string;
    ajaxUrlBlackList: string;
    httpMethodBlackList: string;
}

var chrome = (window as any).chrome;
document.addEventListener("DOMContentLoaded", function () {
    new Options();
});
