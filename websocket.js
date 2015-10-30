// -*- coding: utf-8 -*-
var url = 'ws://' + location.host + '/api/movies/recoding';
var sock = null;

client = BinaryClient(url);
client.on('open', function (stream){
    sock = client.createStream();
});
