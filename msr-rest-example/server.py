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
        self._fp = open('data.dat', 'w+b')
        print('CONNECTION OPENED')

    def on_message(self, data):
        data = data.encode() if hasattr(data, 'encode') else data
        self._fp.write(data)
        self._fp.flush()
        print('WROTE: {}'.format(len(data)))

    def on_close(self):
        self._fp.close()
        print('CONNECTION CLOSED')


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
