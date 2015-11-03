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

    with open(args.datfile, 'rb') as fp:
        buf = fp.read()
        idx = buf.find(b'\n\n')
        buf = buf[idx+2:]
        import ipdb; ipdb.set_trace()

        while buf:
            if not buf.startswith(b'MNU_'):  # illigal alignment
                print('illigal alignment')
                start = buf.find(b'MNU_')
                buf = buf[start+len(b'MNU_'):]  # seek
                continue
            else:  # Exist MNU header
                print('Exist MNU header')
                ext = None
                prefix = None
                count = None
                if buf.startswith(b'MNU_VIDEO'):  # video
                    print('VIDEO')
                    buf = buf[10:]
                    ext = '.webm'
                    prefix = 'video-'
                    video_count += 1
                    count = video_count
                elif buf.startswith(b'MNU_AUDIO'):  # audio
                    print('AUDIO')
                    buf = buf[10:]
                    ext = '.wav'
                    prefix = 'audio-'
                    audio_count += 1
                    count = audio_count
                else:
                    print('illigal hedaer')

                end = buf.find(b'MNU_')

                filename = (prefix + '{0:3>0}' + ext).format(count)
                with open(filename, 'w+b') as fp:
                    fp.write(buf[:end])
                    print('WROTE')


if __name__ == '__main__':
    sys.exit(main())
