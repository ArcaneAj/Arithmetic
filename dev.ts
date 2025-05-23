let pendingRequests: { [key: string]: boolean } = {};
let headers = {
    Etag: 1,
    'Last-Modified': 1,
    'Content-Length': 1,
    'Content-Type': 1,
};

let active = { html: 1, css: 1, js: 1 };
let currentLinkElements: { [key: string]: HTMLLinkElement } = {};
let oldLinkElements: { [key: string]: HTMLLinkElement } = {};

let resources: {
    [key: string]: {
        [key: string]: any;
    };
} = {};

export function Hello() {
    window.alert('Hello');
}

let interval = 1000;
let loaded = false;

function getHead(
    url: string,
    callback: (url: string, info: { [key: string]: any }) => void
) {
    pendingRequests[url] = true;
    var xhr = window.XMLHttpRequest
        ? new XMLHttpRequest()
        : new ActiveXObject('Microsoft.XmlHttp');
    xhr.open('HEAD', url, true);
    xhr.setRequestHeader('Cache-Control', 'no-cache, no-store, max-age=0');
    xhr.onreadystatechange = function () {
        delete pendingRequests[url];
        if (xhr.readyState == 4 && xhr.status != 304) {
            xhr.getAllResponseHeaders();
            var info: { [key: string]: any } = {};
            for (var h in headers) {
                var value = xhr.getResponseHeader(h);
                // adjust the simple Etag variant to match on its significant part
                if (h.toLowerCase() == 'etag' && value)
                    value = value.replace(/^W\//, '');
                if (h.toLowerCase() == 'content-type' && value)
                    value = value.replace(/^(.*?);.*?$/i, '$1');
                info[h] = value;
            }
            callback(url, info);
        }
    };
    xhr.send();
}

function loadresources() {
    // helper method to assert if a given url is local
    function isLocal(url: string) {
        var loc = document.location,
            reg = new RegExp(
                '^\\.|^/(?!/)|^[\\w]((?!://).)*$|' +
                    loc.protocol +
                    '//' +
                    loc.host
            );
        return url.match(reg);
    }

    // gather all resources
    var scripts = document.getElementsByTagName('script'),
        links = document.getElementsByTagName('link'),
        uris = [];

    // track local js urls
    for (var i = 0; i < scripts.length; i++) {
        var script = scripts[i],
            src = script.getAttribute('src');
        if (src && isLocal(src)) uris.push(src);
        if (src && src.match(/\blive.js#/)) {
            for (var type in active)
                active[type as keyof typeof active] =
                    src.match('[#,|]' + type) != null ? 1 : 0;
            if (src.match('notify')) alert('Live.js is loaded.');
        }
    }
    if (!active.js) uris = [];
    if (active.html) uris.push(document.location.href);

    // track local css urls
    for (var i = 0; i < links.length && active.css; i++) {
        var link = links[i],
            rel = link.getAttribute('rel'),
            href = link.getAttribute('href');
        if (
            href &&
            rel &&
            rel.match(new RegExp('stylesheet', 'i')) &&
            isLocal(href)
        ) {
            uris.push(href);
            currentLinkElements[href] = link;
        }
    }

    // initialize the resources info
    for (var i = 0; i < uris.length; i++) {
        var url = uris[i];
        getHead(url, function (url, info) {
            resources[url] = info;
        });
    }

    // yep
    loaded = true;
}

function checkForChanges() {
    for (var url in resources) {
        if (pendingRequests[url]) continue;

        getHead(url, function (url, newInfo) {
            var oldInfo = resources[url],
                hasChanged = false;
            resources[url] = newInfo;
            for (var header in oldInfo) {
                // do verification based on the header type
                const oldValue = oldInfo[header];
                const newValue = newInfo[header];
                const contentType = newInfo['Content-Type'];
                switch (header.toLowerCase()) {
                    case 'etag':
                        if (!newValue) break; //skip if no etag
                    // fall through to default
                    default:
                        hasChanged = oldValue != newValue;
                        break;
                }

                // if changed, act
                if (hasChanged) {
                    refreshResource(url, contentType);
                    break;
                }
            }
        });
    }
}

function refreshResource(url: string, type: string) {
    switch (type.toLowerCase()) {
        // css files can be reloaded dynamically by replacing the link element
        case 'text/css':
            let link = currentLinkElements[url];
            let html = document.body.parentNode as HTMLElement;
            let head = link.parentNode as HTMLElement;
            let next = link.nextSibling;
            let newLink = document.createElement('link');
            html.className =
                html.className.replace(/\s*livejs\-loading/gi, '') +
                ' livejs-loading';
            newLink.setAttribute('type', 'text/css');
            newLink.setAttribute('rel', 'stylesheet');
            newLink.setAttribute('href', url + '?now=' + Date.now());
            next ? head.insertBefore(newLink, next) : head.appendChild(newLink);
            currentLinkElements[url] = newLink;
            oldLinkElements[url] = link;
            // schedule removal of the old link
            removeoldLinkElements();
            break;
        // check if an html resource is our current url, then reload
        case 'text/html':
            if (url != document.location.href) return;
        // local javascript changes cause a reload as well
        case 'text/javascript':
        case 'application/javascript':
        case 'application/x-javascript':
            setTimeout(() => {
                document.location.reload();
            }, interval);
    }
}

function removeoldLinkElements() {
    var pending = 0;
    for (var url in oldLinkElements) {
        // if this sheet has any cssRules, delete the old link
        try {
            let link = currentLinkElements[url];
            let oldLink = oldLinkElements[url];
            let html = document.body.parentNode as HTMLElement;
            let sheet = link.sheet || (link as any).styleSheet;
            let rules = sheet.rules || sheet.cssRules;
            if (rules.length >= 0) {
                oldLink.parentNode!.removeChild(oldLink);
                delete oldLinkElements[url];
                setTimeout(function () {
                    html.className = html.className.replace(
                        /\s*livejs\-loading/gi,
                        ''
                    );
                }, 100);
            }
        } catch (e) {
            pending++;
        }
        if (pending) setTimeout(removeoldLinkElements, 50);
    }
}

export function heartbeat() {
    if (document.body) {
        // make sure all resources are loaded on first activation
        if (!loaded) loadresources();
        checkForChanges();
    }
    setTimeout(heartbeat, interval);
}
