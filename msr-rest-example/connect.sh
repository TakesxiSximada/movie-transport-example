ffmpeg -i output-1.mp4 -i output-2.mp4 -filter_complex "concat=n=2:v=1:a=1" output.mp4
