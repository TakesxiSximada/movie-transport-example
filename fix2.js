// -*- coding: utf-8 -*-

// pollyfill
navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || window.navigator.mozGetUserMedia;
window.URL = window.URL || window.webkitURL;


var sender = {
    _core: null,
    connect: function (){
        if (sender._core == null){
            // sender._core = new BinaryClient('ws://' + location.host + '/api/movies/recoding');
            sender._core = new WebSocket('ws://' + location.host + '/api/movies/recoding');
        }
    },
    send: function (blobs){
        sender.connect();
        // var stream = sender._core.send(blobs.video);
        var stream = sender._core.send(blobs.audio);
        // var stream = sender._core.send(blobs.video, {
        //     name: 'test',
        //     size: blobs.video.size,
        // });
        // stream.on('data', function (data){
        //     console.log('sending...')
        // });
    }
};

var Observer = {
    handlers: [],
    install: function (handler){
        Observer.handlers.push(handler);
    },
    go: function (args){
        this.handlers.forEach(function (handler){
            handler(args)
        }, sender);
    },
};

Observer.install(sender.send);


navigator.getUserMedia(
    {audio: true, video: true},
    function (stream){ // on media success
        var video_tag = document.querySelector('video');

        // setup video
        var video = mergeProps(video_tag, {
            controls: true,
            muted: false,
            src: URL.createObjectURL(stream)
        });

        // meta data
        video.addEventListener('loadedmetadata', function (){
            recorder = new MultiStreamRecorder(stream);
            recorder.mimeType = 'video/mp4';
            recorder.stream = stream;
            recorder.video = video

            // set recorder canvas size
            recorder.canvas = {
                width: video.width,
                height: video.height
            };

            recorder.ondataavailable = function (blobs){
                Observer.go(blobs);
                console.log('OK');
            };
            recorder.start(5000);  // msec
        }, false);

        video.play();
    },
    function (){ // error
        console.log('error');
    })
