// -*- coding: utf-8 -*-
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;


document.querySelector('#start').onclick = function (){
    this.disabled = true;
    captureUserMedia(
        mediaConstraints, onMediaSuccess, onMediaError);
};

document.querySelector('#end').onclick = function (){
    document.querySelector('#start').disabled = false;
    if (mediaRecorder){
        mediaRecorder.stop();
        mediaRecorder.stream.stop();
    }
};

function captureUserMedia(mediaConstraints, successCallback, errorCallback){
    navigator.getUserMedia(
        mediaConstraints, successCallback, errorCallback);
}

var mediaConstraints = {
    video: true,
    audio: true
};

function onMediaSuccess(stream){
    var video = document.querySelector('video');
    video = mergeProps(video, {
        controls: true,
        width: '400px',
        height: '300px',
        src: URL.createObjectURL(stream)
    });
    video.play();

    mediaRecorder = new MultiStreamRecorder(stream);
    mediaRecorder.stream = stream;
    mediaRecorder.mimeType = 'video/webm';
    mediaRecorder.ondataavailable = function (blobs){
        console.log(blobs.audio);
        var reader = new FileReader();
        // var buf = reader.readAsArrayBuffer(blob);
        // console.log(buf);
    };
    mediaRecorder.start(3000);
}

function onMediaError(data){
    console.log(data);
}
