// -*- coding: utf-8 -*-
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;


function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    navigator.getUserMedia(mediaConstraints, successCallback, errorCallback);
}

var resolution_x = 1280;
var resolution_y = 720;

var mediaConstraints = {
    audio: true,
    video: true,
};


document.querySelector('#start-recording').onclick = function() {
    this.disabled = true;
    captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);

};

document.querySelector('#stop-recording').onclick = function() {
    this.disabled = true;
    multiStreamRecorder.stop();
    multiStreamRecorder.stream.stop();

    document.querySelector('#start-recording').disabled = false;

};




var multiStreamRecorder;
var audioVideoBlobs = {};
var recordingInterval = 0;
var videoStream = null;


function onMediaSuccess(stream) {
    var video = document.querySelector('video');
    videoStream = video;

    video = mergeProps(video, {
        controls: true,
        muted: true,
        src: URL.createObjectURL(stream)

    });

    video.addEventListener('loadedmetadata', function() {
        multiStreamRecorder = new MultiStreamRecorder(stream);
        multiStreamRecorder.stream = stream;

        multiStreamRecorder.canvas = {
            width: video.width,
            height: video.height
        };

        multiStreamRecorder.video = video;
        var url = 'ws://' + location.host + '/api/movies/recoding';
        var client = new BinaryClient(url);

        multiStreamRecorder.ondataavailable = function(blobs) {
            console.log("gera");
            var stream_ = client.send(blobs.video, {
                name: 'test',
                size: blobs.video.size,
            });
            stream_.on('data', function (data){
                console.log('sending...');
            });
            // appendLink(blobs.audio);
            // appendLink(blobs.video);
        };

        // function appendLink(blob) {
        //     var a = document.createElement('a');
        //     a.target = '_blank';
        //     a.innerHTML = 'Open Recorded ' + (blob.type == 'audio/ogg' ? 'Audio' : 'Video') + ' No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') Time Length: ' + getTimeLength(timeInterval);

        //     a.href = URL.createObjectURL(blob);

        //     container.appendChild(a);
        //     container.appendChild(document.createElement('hr'));

        // }

        var timeInterval = 5000; // document.querySelector('#time-interval').value;
        // if (timeInterval) timeInterval = parseInt(timeInterval);
        // else timeInterval = 5 * 1000;

        // get blob after specific time interval
        multiStreamRecorder.start(timeInterval);

        document.querySelector('#stop-recording').disabled = false;
    }, false);

    video.play();

    // container.appendChild(video);
    // container.appendChild(document.createElement('hr'));

}

function onMediaError(e) {
    console.error('media error', e);

}

var container = document.getElementById('container');
var index = 1;

// below function via: http://goo.gl/B3ae8c
function bytesToSize(bytes) {
    var k = 1000;
    var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    var i = parseInt(Math.floor(Math.log(bytes) / Math.log(k)), 10);
    return (bytes / Math.pow(k, i)).toPrecision(3) + ' ' + sizes[i];

}

// below function via: http://goo.gl/6QNDcI
function getTimeLength(milliseconds) {
    var data = new Date(milliseconds);
    return data.getUTCHours() + " hours, " + data.getUTCMinutes() + " minutes and " + data.getUTCSeconds() + " second(s)";

}

window.onbeforeunload = function() {
    document.querySelector('#start-recording').disabled = false;

};
