// -*- coding: utf-8 -*-

function captureUserMedia(mediaConstraints, successCallback, errorCallback) {
    navigator.mediaDevices.getUserMedia(mediaConstraints).then(successCallback).catch(errorCallback);
}

// commonly allowed resolutions:
// ['1920:1080',
// '1280:720',
// '960:720',
// '640:360',
// '640:480',
// '320:240',
// '320:180']
var resolution_x = 1280;
var resolution_y = 720;

var mediaConstraints = {
    audio: true,
    video: IsEdge ? true : {
        mandatory: {
            maxWidth: resolution_x,
            maxHeight: resolution_y,
            //minFrameRate: 3,
            //maxFrameRate: 64,
            //minAspectRatio: 1.77
        }
    }
};

document.querySelector('#start-recording').onclick = function() {
    this.disabled = true;
    captureUserMedia(mediaConstraints, onMediaSuccess, onMediaError);
};

document.querySelector('#stop-recording').onclick = function() {
    this.disabled = true;
    multiStreamRecorder.stop();
    multiStreamRecorder.stream.stop();

    document.querySelector('#pause-recording').disabled = true;
    document.querySelector('#start-recording').disabled = false;
};

document.querySelector('#pause-recording').onclick = function() {
    this.disabled = true;
    multiStreamRecorder.pause();

    document.querySelector('#resume-recording').disabled = false;
};

document.querySelector('#resume-recording').onclick = function() {
    this.disabled = true;
    multiStreamRecorder.resume();

    document.querySelector('#pause-recording').disabled = false;
};

var multiStreamRecorder;

var audioVideoBlobs = {};
var recordingInterval = 0;
var conn = new WebSocket('ws://' + location.host + '/api/movies/recoding');


function onMediaSuccess(stream) {
    var video = document.createElement('video');

    video = mergeProps(video, {
        controls: true,
        muted: true,
        src: URL.createObjectURL(stream)
    });

    //video.width = resolution_x;
    //video.height = resolution_y;

    video.addEventListener('loadedmetadata', function() {
        multiStreamRecorder = new MultiStreamRecorder(stream);
        multiStreamRecorder.stream = stream;

        // below line is optional
        // because we already set "video.width"
        // and "video.height"....5 lines above
        multiStreamRecorder.canvas = {
            width: video.width,
            height: video.height
        };

        multiStreamRecorder.video = video;

        // $.ajax({
        //     type: 'get',
        //     url: options.dataSource,
        //     dataType: 'json',
        //     success: function(json) { next(json); },
        //     error: function(xhr, text) { error("Failed to load drawing data (reason: " + text + ")"); }
        // });")")}
        // })

        var counter = 0;
        multiStreamRecorder.ondataavailable = function(blobs) {
            counter += 1;
            $.ajax({
                method: 'POST',
                url: '/api/movies/rest?fmt=audio&count=' + counter,
                data: blobs.audio,
                processData: false,
                contentType: false,
            });
            $.ajax({
                method: 'POST',
                url: '/api/movies/rest?fmt=video&count=' + counter,
                data: blobs.video,
                processData: false,
                contentType: false,
            });
            // conn.send('\n\nMNU_VIDEO');
            // conn.send(blobs.video);
            // conn.send(blobs.audio);
            // appendLink(blobs.audio);
            // appendLink(blobs.video);
        };

        function appendLink(blob) {
            var a = document.createElement('a');
            a.target = '_blank';
            a.innerHTML = 'Open Recorded ' + (blob.type == 'audio/ogg' ? 'Audio' : 'Video') + ' No. ' + (index++) + ' (Size: ' + bytesToSize(blob.size) + ') Time Length: ' + getTimeLength(timeInterval);

            a.href = URL.createObjectURL(blob);

            container.appendChild(a);
            container.appendChild(document.createElement('hr'));
        }

        var timeInterval = document.querySelector('#time-interval').value;
        if (timeInterval) timeInterval = parseInt(timeInterval);
        else timeInterval = 5 * 1000;

        // get blob after specific time interval
        multiStreamRecorder.start(timeInterval);

        document.querySelector('#stop-recording').disabled = false;
        document.querySelector('#pause-recording').disabled = false;

        document.querySelector('#save').onclick = function (){
            this.disabled = true;
            multiStreamRecorder.save();
        };
    }, false);

    video.play();

    container.appendChild(video);
    container.appendChild(document.createElement('hr'));
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
