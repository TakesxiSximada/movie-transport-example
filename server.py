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


class VideoRecordingHandler(WebSocketHandler):
    def open(self):
        print('OPEN')
        self.i = 0
        self._counter = 0

    def on_message(self, data):
        with open('data/{0:0>3}.ogg'.format(self._counter), 'w+b') as fp:
            self._counter += 1
            fp.write(data)
            fp.flush()
        print('FLUSHED: {}'.format(len(data)))

    def on_close(self):
        print('ON CLOSE')


def main(argv=sys.argv[1:]):
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', default=8000, type=int)
    args = parser.parse_args(argv)

    routes = [
        (r"/api/movies/recoding", VideoRecordingHandler),
        (r'/(.*)', StaticFileHandler, {'path': './'}),
    ]
    app = Application(routes)
    app.listen(args.port)
    cur = IOLoop.current()
    cur.start()


if __name__ == '__main__':
    sys.exit(main())
