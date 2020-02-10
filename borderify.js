function docReady(fn) {
    // see if DOM is already available
    if (document.readyState === "complete" || document.readyState === "interactive") {
        // call on next available tick
        setTimeout(fn, 1000);
    } else {
        document.addEventListener("DOMContentLoaded", fn);
    }
}

docReady(function() {
    watchPlayCtrl();
    watchSoundbadge();
    //watchTime();
    SendPlayCtrl();
});

var SendMetadata;
var SendPlayCtrl;
var SendTime;

function watchSoundbadge() {
    let soundbadge = document.getElementsByClassName("playControls__soundBadge")[0];

    SendMetadata = (_) => {
        // send new song data
        let artist = soundbadge.getElementsByClassName("playbackSoundBadge__lightLink")[0].title;
        let song = soundbadge.getElementsByClassName("playbackSoundBadge__titleLink")[0].title;
        let icon_span = soundbadge.querySelector('span.sc-artwork');
        let icon_url = icon_span.style.backgroundImage.slice(4, -1).replace(/"/g, "");
        let time_data = getTimeData();
        let song_href = soundbadge.querySelector("a.playbackSoundBadge__avatar").getAttribute("href");

        let metadata = {
            artist: artist,
            song: song,
            icon_url: icon_url,
            time: time_data.time + "000000",
            length: time_data.length + "000000",
            song_href: song_href,
        };

        sendMessage("soundbadge", metadata);
    };

    observer = new MutationObserver(SendMetadata);

    let config = { /*attributes: true, characterData: true,*/ subtree: true, childList: true };
    observer.observe(soundbadge, config);
}


function watchPlayCtrl() {
    let target = document.getElementsByClassName('playControl')[0];

    SendPlayCtrl = (_) => {
        if (target.classList.contains("playing")) {
            sendMessage("playctrl", {
                status: "Playing"
            });
        } else {
            sendMessage("playctrl", {
                status: "Paused"
            });
        }

        SendMetadata();
    };

    let observer = new MutationObserver(SendPlayCtrl);
    let config = { attributes: true, childList: true, characterData: true, subtree: true };
    observer.observe(target, config);
}


function watchTime() {
    let timeline = document.getElementsByClassName("playControls__timeline")[0];

    let observer = new MutationObserver((_) => {
        let timeData = getTimeData();
        // TODO: decide on if this is necessary
    });
    let config = { attributes: true, childList: true, characterData: true, subtree: true };
    observer.observe(timeline, config);
}


function getTimeData() {
    let timeline = document.getElementsByClassName("playControls__timeline")[0];
    let progressBar = timeline.querySelector(".playbackTimeline__progressWrapper[role='progressbar']");
    let time = progressBar.getAttribute("aria-valuenow");
    let length = progressBar.getAttribute("aria-valuemax");
    return {
        time: time,
        length: length,
    };
}


let bgPort = browser.runtime.connect({name: "contentPort"});
bgPort.onMessage.addListener((m) => {
    switch (m.type) {
        case "playpause":
            document.querySelector('.playControl').click();
            break;
        case "prev":
            document.querySelector('.skipControl__previous').click();
            break;
        case "next":
            document.querySelector('.skipControl__next').click();
            break;
        case "raise":
            window.focus();
        default:
            console.log("unknown format", m);
            break;
    }
});

function sendMessage(type, data) {
    if (bgPort.error) {
        console.log(bgPort.error)
    } else {
        bgPort.postMessage({
            type: type,
            data: data,
        })
    }
}
