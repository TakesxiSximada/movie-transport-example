#! /usr/bin/env python
# -*- coding: utf-8 -*-
import sys
import argparse


def main(argv=sys.argv[1:]):
    parser = argparse.ArgumentParser()
    parser.add_argument('datfile')
    args = parser.parse_args(argv)

    audio_count = 0
    video_count = 0

    import ipdb; ipdb.set_trace()
    with open(args.datfile, 'rb') as fp:
        buf = fp.read()
        idx = buf.find(b'\n\n')
        buf = buf[idx+2:]

        while buf:
            if not buf.startswith(b'MNU_'):  # illigal alignment
                start = buf.find(b'\n\n')
                buf = buf[start+len(b'\n\n'):]  # seek
                continue
            else:  # Exist MNU header
                ext = None
                prefix = None
                count = None
                if buf.startswith(b'MNU_VIDEO'):  # video
                    buf = buf[10:]
                    ext = '.webm'
                    prefix = 'video-'
                    video_count += 1
                    count = video_count
                elif buf.startswith(b'MNU_AUDIO'):  # audio
                    buf = buf[10:]
                    ext = '.wav'
                    prefix = 'audio-'
                    audio_count += 1
                    count = audio_count
                else:
                    print('illigal hedaer')

                end = buf.find(b'\n\n')

                filename = (prefix + '{0:3>0}' + ext).format(count)
                with open(filename, 'w+b') as fp:
                    fp.write(buf[:end])


if __name__ == '__main__':
    sys.exit(main())
