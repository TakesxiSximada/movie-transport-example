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

        filename = 'data/{}-{}.{}'.format(fmt, count, ext)

        with open(filename, 'wb') as fp:
            fp.write(self.request.body)
            print('OK')


def main(argv=sys.argv[1:]):
    parser = argparse.ArgumentParser()
    parser.add_argument('-p', '--port', default=8000, type=int)
    args = parser.parse_args(argv)

    routes = [
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
