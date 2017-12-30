function ScriptForLocalCacheChromeExtension() {
    class IndexedDB<T> {
        private db: IDBDatabase;
        private dbReady: Promise<void>;
        private storeName: string;

        constructor(dbName: string, storeName: string) {
            let resolve: () => void;
            this.dbReady = new Promise<any>((r) => {
                resolve = r;
            });

            this.storeName = storeName;
            let open = indexedDB.open(dbName);

            open.onupgradeneeded = () => {
                let db: IDBDatabase = open.result;
                db.createObjectStore(storeName);
            };

            open.onsuccess = (() => {
                this.db = open.result;
                resolve();
            });
        }

        public async dispose(): Promise<void> {
            await this.dbReady;
            this.db.close();
        }

        public async setItem(key: string, item: T): Promise<void> {
            await this.dbReady;
            let tx = this.db.transaction(this.storeName, "readwrite");
            let store = tx.objectStore(this.storeName);
            store.put(item, key);
        }

        public async getItem(key: string): Promise<T> {
            await this.dbReady;

            let resolve: (item: T) => void;
            let promise = new Promise<T>((r) => {
                resolve = r;
            });

            let tx = this.db.transaction(this.storeName, "readonly");
            let store = tx.objectStore(this.storeName);

            let getter = store.get(key);
            getter.onsuccess = () => {
                resolve(getter.result);
            };

            return promise;
        }

        public async clear(): Promise<void> {
            await this.dbReady;
            let tx = this.db.transaction(this.storeName, "readwrite");
            let store = tx.objectStore(this.storeName);
            store.clear();
        }
    }

    class StatusBar {
        private elem: HTMLDivElement;
        private messageElem: HTMLSpanElement;

        private initialize(): void {
            this.elem = document.createElement("div");
            this.elem.className = "ScriptForLocalCacheChromeExtension";
            this.elem.style.cssText = "font-size:12px; position:fixed;box-shadow:1px 1px 4px #999;border-radius:3px;bottom:10px;right:10px;z-index:25000;padding:7px;background-color:white;";

            // icon
            let img = document.createElement("img");
            img.style.cssText = "vertical-align:bottom; padding-right:7px; width:unset; display:inline; height:unset";
            img.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABGdBTUEAALGPC/xhBQAAAAlwSFlzAAAN1QAADdUBPdZY8QAAABl0RVh0U29mdHdhcmUAcGFpbnQubmV0IDQuMC4xOdTWsmQAAAG7SURBVDhPY8AH4jbMcQxbssExfv5+DqgQcSBnf5FGys7W7bEbZv8PX7bpf8CcE9+8p17bA8SV3tNvmoWu+s8MVYoK8s/7CxSeCu/LOpT3K2Vny38kA/77TLuOwFOvL4dqQYDiC77JJRd9XhaeCf+fdTjvPzYDvKdef+gz7VoKhguKz/vUADVfLr7gs7XgTPgnDAPmnvjkM/Vqtd+c67w+U69tBbrgnPe068ZQ7QwMQM1HgXhy/f96pvr99SwZhwstkne2VMZsmL0jfNmGGaHz90tAlTJ4TLzFDnTNeWB4rIEKgZzvcxJowP+SCz5nCs8F2EOFMYDvtGs+3tOuXQd7Z9q1DVBhJAOAGBwGh7LWJe+vV4FKM/jOPqsHdPZueCASNAAYBkAv/IzbMMUubNGOYP85J/4gaybKAFAgJmyanBK2ZHsNRjRS3YCSC94HSTfg+gqodgaG0nPeqkBDthFnwLV/QNtXAJO0NFQ7ApRe8vYCJqQbuAzwnnr1rM+UGzZQ5dhB2pk01qxDBYXAzPQ+DmhACNiAYy+8pl5Nrq//zwRVRhikbeoRSd7RKxQ6f4tE9OITfFBhNMDAAABc9ZyFtr+zcAAAAABJRU5ErkJggg==";
            this.elem.appendChild(img);

            // message
            this.messageElem = document.createElement("span");
            this.elem.appendChild(this.messageElem);

            // help
            let help = document.createElement("a");
            help.style.cssText = "padding-left: 5px";
            help.innerText = "?";
            help.href = "javascript:;"
            this.elem.appendChild(help);

            help.addEventListener("click", () => {
                let msg = "HITS\nCount of ajax calls served from the cache.\n\n";
                msg += "MISSES\nCount of ajax calls not found in the cache.\n\n";
                msg += "IGNORES\nCount of ajax calls not routed to the cache because they don't match the rules you have setup.\n\n";
                msg += "PENDING\nCount of missed ajax calls that are still waiting for response.";
                alert(msg);
            });

            document.body.appendChild(this.elem);
        }

        public update(): void {
            if (this.elem == null || this.elem.parentElement == null) {
                this.initialize();
            }

            let message = AjaxProxy.hits + " hits / " + AjaxProxy.misses + " misses / " + AjaxProxy.ignores + " ignores / " + AjaxProxy.pending + " pending";
            this.messageElem.innerText = message;
        }
    }

    class AjaxProxy {
        // from https://github.com/blueimp/JavaScript-MD5/blob/master/js/md5.min.js
        private static md5 = function () { "use strict"; function t(n, t) { var r = (65535 & n) + (65535 & t); return (n >> 16) + (t >> 16) + (r >> 16) << 16 | 65535 & r } function r(n, t) { return n << t | n >>> 32 - t } function e(n, e, o, u, c, f) { return t(r(t(t(e, n), t(u, f)), c), o) } function o(n, t, r, o, u, c, f) { return e(t & r | ~t & o, n, t, u, c, f) } function u(n, t, r, o, u, c, f) { return e(t & o | r & ~o, n, t, u, c, f) } function c(n, t, r, o, u, c, f) { return e(t ^ r ^ o, n, t, u, c, f) } function f(n, t, r, o, u, c, f) { return e(r ^ (t | ~o), n, t, u, c, f) } function i(n, r) { n[r >> 5] |= 128 << r % 32, n[14 + (r + 64 >>> 9 << 4)] = r; var e, i, a, d, h, l = 1732584193, g = -271733879, v = -1732584194, m = 271733878; for (e = 0; e < n.length; e += 16)i = l, a = g, d = v, h = m, g = f(g = f(g = f(g = f(g = c(g = c(g = c(g = c(g = u(g = u(g = u(g = u(g = o(g = o(g = o(g = o(g, v = o(v, m = o(m, l = o(l, g, v, m, n[e], 7, -680876936), g, v, n[e + 1], 12, -389564586), l, g, n[e + 2], 17, 606105819), m, l, n[e + 3], 22, -1044525330), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 4], 7, -176418897), g, v, n[e + 5], 12, 1200080426), l, g, n[e + 6], 17, -1473231341), m, l, n[e + 7], 22, -45705983), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 8], 7, 1770035416), g, v, n[e + 9], 12, -1958414417), l, g, n[e + 10], 17, -42063), m, l, n[e + 11], 22, -1990404162), v = o(v, m = o(m, l = o(l, g, v, m, n[e + 12], 7, 1804603682), g, v, n[e + 13], 12, -40341101), l, g, n[e + 14], 17, -1502002290), m, l, n[e + 15], 22, 1236535329), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 1], 5, -165796510), g, v, n[e + 6], 9, -1069501632), l, g, n[e + 11], 14, 643717713), m, l, n[e], 20, -373897302), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 5], 5, -701558691), g, v, n[e + 10], 9, 38016083), l, g, n[e + 15], 14, -660478335), m, l, n[e + 4], 20, -405537848), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 9], 5, 568446438), g, v, n[e + 14], 9, -1019803690), l, g, n[e + 3], 14, -187363961), m, l, n[e + 8], 20, 1163531501), v = u(v, m = u(m, l = u(l, g, v, m, n[e + 13], 5, -1444681467), g, v, n[e + 2], 9, -51403784), l, g, n[e + 7], 14, 1735328473), m, l, n[e + 12], 20, -1926607734), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 5], 4, -378558), g, v, n[e + 8], 11, -2022574463), l, g, n[e + 11], 16, 1839030562), m, l, n[e + 14], 23, -35309556), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 1], 4, -1530992060), g, v, n[e + 4], 11, 1272893353), l, g, n[e + 7], 16, -155497632), m, l, n[e + 10], 23, -1094730640), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 13], 4, 681279174), g, v, n[e], 11, -358537222), l, g, n[e + 3], 16, -722521979), m, l, n[e + 6], 23, 76029189), v = c(v, m = c(m, l = c(l, g, v, m, n[e + 9], 4, -640364487), g, v, n[e + 12], 11, -421815835), l, g, n[e + 15], 16, 530742520), m, l, n[e + 2], 23, -995338651), v = f(v, m = f(m, l = f(l, g, v, m, n[e], 6, -198630844), g, v, n[e + 7], 10, 1126891415), l, g, n[e + 14], 15, -1416354905), m, l, n[e + 5], 21, -57434055), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 12], 6, 1700485571), g, v, n[e + 3], 10, -1894986606), l, g, n[e + 10], 15, -1051523), m, l, n[e + 1], 21, -2054922799), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 8], 6, 1873313359), g, v, n[e + 15], 10, -30611744), l, g, n[e + 6], 15, -1560198380), m, l, n[e + 13], 21, 1309151649), v = f(v, m = f(m, l = f(l, g, v, m, n[e + 4], 6, -145523070), g, v, n[e + 11], 10, -1120210379), l, g, n[e + 2], 15, 718787259), m, l, n[e + 9], 21, -343485551), l = t(l, i), g = t(g, a), v = t(v, d), m = t(m, h); return [l, g, v, m] } function a(n) { var t, r = "", e = 32 * n.length; for (t = 0; t < e; t += 8)r += String.fromCharCode(n[t >> 5] >>> t % 32 & 255); return r } function d(n) { var t, r = []; for (r[(n.length >> 2) - 1] = void 0, t = 0; t < r.length; t += 1)r[t] = 0; var e = 8 * n.length; for (t = 0; t < e; t += 8)r[t >> 5] |= (255 & n.charCodeAt(t / 8)) << t % 32; return r } function h(n) { return a(i(d(n), 8 * n.length)) } function l(n, t) { var r, e, o = d(n), u = [], c = []; for (u[15] = c[15] = void 0, o.length > 16 && (o = i(o, 8 * n.length)), r = 0; r < 16; r += 1)u[r] = 909522486 ^ o[r], c[r] = 1549556828 ^ o[r]; return e = i(u.concat(d(t)), 512 + 8 * t.length), a(i(c.concat(e), 640)) } function g(n) { var t, r, e = ""; for (r = 0; r < n.length; r += 1)t = n.charCodeAt(r), e += "0123456789abcdef".charAt(t >>> 4 & 15) + "0123456789abcdef".charAt(15 & t); return e } function v(n) { return unescape(encodeURIComponent(n)) } function m(n) { return h(v(n)) } function p(n) { return g(m(n)) } function s(n, t) { return l(v(n), v(t)) } function C(n, t) { return g(s(n, t)) } function md5(n, t, r) { return t ? r ? s(t, n) : C(t, n) : r ? m(n) : p(n) } return md5 }();
        private static indexedDB: IndexedDB<ResponseState> = new IndexedDB<ResponseState>("LocalCacheChromeExtension", "ResponseStates");
        private static statusBar: StatusBar = new StatusBar();

        private proxyFn: any;
        private realAjax: XMLHttpRequest;
        private requestKey: RequestKey;
        private requestKeyHash: string;
        private responseState: ResponseState;
        private isCacheHit: boolean;

        public static hits: number = 0;
        public static misses: number = 0;
        public static pending: number = 0;
        public static ignores: number = 0;

        constructor(proxyFn: any) {
            this.proxyFn = proxyFn;
            this.realAjax = new actualXMLHttpRequest();

            this.requestKey = {
                url: null,
                method: null,
                data: null
            };

            this.responseState = {
                readyState: 0,
                response: "",
                responseText: "",
                responseType: "",
                responseURL: null,
                responseXML: null,
                status: 0,
                statusText: ""
            };

            this.addXmlHttpRequestProperties(proxyFn);
        }

        private getRequestKeyHash(): string {
            let a = document.createElement("a");
            a.href = this.requestKey.url;
            let search = a.search;

            if (search.startsWith("?")) {
                search = search.substr(1);
            }

            let cacheBusters = ["_", "v"];
            let qs = search.split("&").filter(s => {
                return s !== "" && cacheBusters.filter(cb => s.startsWith(cb + "=")).length === 0;
            });

            search = qs.join("&");
            a.search = search;
            return AjaxProxy.md5(`${a.href.toLocaleLowerCase()}|${(this.requestKey.method || "GET").toLocaleLowerCase()}|${JSON.stringify(this.requestKey.data || "")}`, null, null);
        }

        private open(method: string, url: string, async?: boolean, user?: string, password?: string): void {
            this.requestKey.url = url;
            this.requestKey.method = method || "GET";
            this.realAjax.open.apply(this.realAjax, arguments);
        }

        private send(data: any): void {
            this.requestKey.data = data;
            this.requestKeyHash = this.getRequestKeyHash();

            if (this.requestKey.method.toLocaleLowerCase() === "put") {
                AjaxProxy.ignores++;
                AjaxProxy.pending++;
                AjaxProxy.statusBar.update();
                this.realAjax.send.apply(this.realAjax, arguments);
            }
            else {
                AjaxProxy.indexedDB.getItem(this.requestKeyHash).then(cachedResponseState => {
                    if (cachedResponseState == null) {
                        AjaxProxy.misses++;
                        AjaxProxy.pending++;
                        AjaxProxy.statusBar.update();
                        this.realAjax.send.apply(this.realAjax, arguments);
                    }
                    else {
                        AjaxProxy.hits++;
                        AjaxProxy.statusBar.update();
                        this.isCacheHit = true;
                        this.responseState = cachedResponseState;

                        if ((this.responseState.responseType === "" || this.responseState.responseType === "text") && this.responseState.responseText == "") {
                            this.responseState.responseText = this.responseState.response;
                        }

                        let ev = new Event("readystatechange");
                        this.realAjax.dispatchEvent(ev);

                        ev = new Event("load");
                        this.realAjax.dispatchEvent(ev);
                    }
                });
            }
        }

        private getAllResponseHeaders(): string {
            if (!this.isCacheHit) {
                return this.realAjax.getAllResponseHeaders();
            }

            if (this.responseState == null) {
                return "";
            }
            return this.responseState.responseHeaders;
        }

        private getResponseHeader(header: string): string {
            if (!this.isCacheHit) {
                return this.realAjax.getResponseHeader(header);
            }

            let responseHeaders = this.getAllResponseHeaders().split("\n");
            let matches = responseHeaders.filter(h => h.startsWith(header + ":"));

            if (matches.length === 0) {
                return "";
            }

            let ret = matches[0].substr(matches[0].indexOf(":") + 1);
            return ret;
        }

        private realAjax_onreadystatechange(ev: Event): any {
            // update the cache
            if (this.realAjax.readyState === 4 &&
                !this.isCacheHit && this.realAjax.status < 400 &&
                this.requestKey.method.toLocaleLowerCase() !== "put" &&
                !((this.realAjax.responseType === "" || this.realAjax.responseType === "document") && this.realAjax.responseXML instanceof Node)) {

                this.responseState.readyState = this.realAjax.readyState;
                this.responseState.response = this.realAjax.response;
                this.responseState.responseType = this.realAjax.responseType;
                this.responseState.responseURL = this.realAjax.responseURL;
                this.responseState.status = this.realAjax.status;
                this.responseState.statusText = this.realAjax.statusText;

                if (this.realAjax.responseType === "" || this.realAjax.responseType === "document") {
                    this.responseState.responseXML = this.realAjax.responseXML;
                }

                if ((this.realAjax.responseType === "" || this.realAjax.responseType === "text") && this.realAjax.responseText !== this.realAjax.response) {
                    this.responseState.responseText = this.realAjax.responseText; // save some space
                }

                this.responseState.responseHeaders = this.realAjax.getAllResponseHeaders();
                AjaxProxy.indexedDB.setItem(this.requestKeyHash, this.responseState);
            }

            if (this.realAjax.readyState == 4) {
                AjaxProxy.pending--;
                AjaxProxy.statusBar.update();
            }

            if (this.proxyFn.onreadystatechange) {
                return this.proxyFn.onreadystatechange(ev);
            }
            else {
                return null;
            }
        }

        private addXmlHttpRequestProperties(proxyFn: any): void {
            let that = this;

            proxyFn.open = function (method: string, url: string, async?: boolean, user?: string, password?: string): void {
                that.open.apply(that, arguments);
            };

            proxyFn.send = function (data: any): void {
                that.send.apply(that, arguments);
            };

            proxyFn.getResponseHeader = function (header: string): string {
                return that.getResponseHeader(header);
            }

            proxyFn.getAllResponseHeaders = function (): string {
                return that.getAllResponseHeaders();
            }

            that.realAjax.onreadystatechange = function (ev: Event) {
                that.realAjax_onreadystatechange(ev);
            };

            // read-only properties
            Object.keys(that.responseState).filter(item => item != "responseType").forEach(function (item) {
                Object.defineProperty(proxyFn, item, {
                    get: function () {
                        if (that.isCacheHit) {
                            return that.responseState[item];
                        }
                        else {
                            return that.realAjax[item];
                        }
                    }
                });
            });

            // read/write properties
            ["ontimeout, timeout", "withCredentials", "onload", "onerror", "onprogress", "upload", "responseType"].forEach(function (item) {
                Object.defineProperty(proxyFn, item, {
                    get: function () { return that.realAjax[item]; },
                    set: function (val) { that.realAjax[item] = val; }
                });
            });

            // methods
            ["addEventListener", "removeEventListener", "abort", "dispatchEvent", "overrideMimeType", "setRequestHeader"].forEach(function (item) {
                Object.defineProperty(proxyFn, item, {
                    value: function () { return that.realAjax[item].apply(that.realAjax, arguments); }
                });
            });
        }
    }

    var unescape = (window as any).unescape; // typing
    var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) { return new (P || (P = Promise))(function (resolve, reject) { function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } } function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } } function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); } step((generator = generator.apply(thisArg, _arguments || [])).next()); }); };

    // create XMLHttpRequest proxy object
    var actualXMLHttpRequest = XMLHttpRequest;
    XMLHttpRequest = function () {
        new AjaxProxy(this);
    } as any;
}


let script = document.createElement("script");
script.innerHTML = ScriptForLocalCacheChromeExtension.toString() + ";ScriptForLocalCacheChromeExtension();";
document.documentElement.appendChild(script);

interface ResponseState {
    readyState: number;
    response: any;
    responseText: string;
    responseType: XMLHttpRequestResponseType;
    responseURL: string;
    responseXML: Document | null;
    status: number;
    statusText: string;
    responseHeaders?: string;
}

interface RequestKey {
    url: string;
    method: string;
    data: any;
}

/*
if disabled don't start db

SETTINGS
Pause/Unpause
Clear
Hide/Unhide
cache days

cache buster strings
black list methods

black list ajax paths
white list of website urls

run in iframe
*/