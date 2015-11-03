# -*- coding: utf-8 -*-
import sys
import argparse

from tornado.web import (
    Application,
    RequestHandler,
    )
from tornado.websocket import WebSocketHandler
from tornado.ioloop import IOLoop
from sandstorm.handlers import YAStaticFileHandler as StaticFileHandler


class PingPongHandler(RequestHandler):
    def get(self):
        import ipdb; ipdb.set_trace()
        self.write('PONG')


class RESTMediaSaveHandler(RequestHandler):
    def post(self):
        fmt = self.request.query_arguments[u'fmt'][0].decode()
        count = self.request.query_arguments[u'count'][0].decode()

        ext = None
        if fmt == 'audio':
            ext = 'wav'
        elif fmt == 'video':
            ext = 'webm'
        else:
            print(fmt)

        filename = '{}-{}.{}'.format(fmt, count, ext)

        with open(filename, 'wb') as fp:
            fp.write(self.request.body)
            print('OK')


class VideoRecordingHandler(WebSocketHandler):
    def __init__(self, *args, **kwds):
        super(VideoRecordingHandler, self).__init__(*args, **kwds)
        self._count = 0

    def open(self):
        self._fp = open('data.dat', 'wb')
        print('CONNECTION OPENED')

    def on_message(self, data):
        data = data.encode() if hasattr(data, 'encode') else data
        self._fp.write(data)
        self._fp.flush()
        print('WROTE: {}'.format(len(data)))
        self._count += 1

    def on_close(self):
        self._fp.close()
        print('CONNECTION CLOSED')


def main(argv=sys.argv[1:]):
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', default=8000, type=int)
    args = parser.parse_args(argv)

    routes = [
        (r"/api/movies/recoding", VideoRecordingHandler),
        (r"/api/movies/rest", RESTMediaSaveHandler),
        (r"/ping", PingPongHandler),
        (r'/(.*)', StaticFileHandler, {'path': './'}),
    ]
    app = Application(routes)
    app.listen(args.port)
    cur = IOLoop.current()
    cur.start()


if __name__ == '__main__':
    sys.exit(main())
