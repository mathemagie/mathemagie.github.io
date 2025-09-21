livereload

youtube-dl --verbose --ignore-errors -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o '%(title)s.%(ext)s' https://www.youtube.com/watch?v=bh6DrCYgXPc

python generate_json_from_s3_push.py && git ci -m 'New tracks' tracks.json && gpo