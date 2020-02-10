
var hostPort;

function initHostPort() {
    /***********************************/
    hostPort = browser.runtime.connectNative("com.dwbrite.toast");
    hostPort.onMessage.addListener(contentPort.postMessage);
    if (hostPort.error) {
        console.log("error: ", hostPort.error);
    }
}


/***********************************/

var contentPort;

function sendMessage(msg) {
    if (!msg) { return; }
    if (hostPort.error) {
        console.log("error: ", hostPort.error);
        return;
    }

    try {
        hostPort.postMessage(msg);
    } catch (e) {
        try {
            initHostPort();
        } catch (e) {
            console.log("error:" + e)
        }
    }

    if (hostPort.error) {
        console.log("error: ", hostPort.error);
    }
}

function disconnect(_) {
    hostPort.disconnect();
}

function initContentPort(p) {
    contentPort = p;
    contentPort.onMessage.addListener(sendMessage);
    contentPort.onDisconnect.addListener(disconnect);
    initHostPort();
}

browser.runtime.onConnect.addListener(initContentPort);
