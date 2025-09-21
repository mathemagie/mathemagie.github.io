# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository Structure

This is a Progressive Web App (PWA) for playing children's audio stories, part of the larger mathemagie.github.io repository. The app features a French interface designed for kids with filtering, search capabilities, and random playback.

## Commands

### Track Management
- Generate tracks from S3: `python generate_json_from_s3_push.py`
- Fetch tracks from RSS feed: `python fetch_rss_tracks.py <rss_url>`
- Update track tags: Run `fetch_rss_tracks.py` with the update function
- Commit and push: `git ci -m 'New tracks' tracks.json && git push origin`

### Development
- Live reload server: `livereload`
- Download audio from YouTube: `youtube-dl --verbose --ignore-errors -f bestaudio --extract-audio --audio-format mp3 --audio-quality 0 -o '%(title)s.%(ext)s' <youtube_url>`

## Architecture

### Frontend Components
- **index.html**: Main PWA entry point with Bootstrap 4, Font Awesome icons, and Fredoka font. Implements service worker registration and dynamic script/style loading with cache-busting
- **app.js**: Core JavaScript handling audio playback, track filtering by tags, search functionality, and Fisher-Yates shuffle for random playback. Manages both S3-hosted and direct URL tracks
- **styles.css**: Mobile-app-inspired dark theme with animation effects

### Data Management
- **tracks.json**: JSON database containing track objects with:
  - `url`: Either relative path for S3 (`audiod.s3.eu-west-3.amazonaws.com`) or full URL
  - `title`: Display name
  - `tags`: Array for filtering (e.g., "magique", "animaux", "aventure")

### Python Scripts
- **generate_json_from_s3_push.py**: Uses AWS CLI to list S3 bucket contents and generate tracks.json
- **fetch_rss_tracks.py**: Fetches audio from RSS feeds, extracts metadata, manages tags, and can update existing tracks

### PWA Features
- **manifest.json**: PWA configuration for standalone app mode
- **service-worker.js**: Enables offline functionality

## Key Implementation Details

### Track URL Handling
The app intelligently handles two types of URLs:
- Relative paths are prefixed with the S3 URL: `https://audiod.s3.eu-west-3.amazonaws.com/`
- Absolute URLs (starting with http) are used directly

### Filter System
Supports tag-based filtering with predefined categories:
- all, magique (✨), animaux (🐾), aventure (🗺️), amitié (🤝), famille (👨‍👩‍👧), nature (🌿)

### UI Behavior
- Previous button hidden on first track
- Tracks shuffled on load and after filtering for random playback
- Real-time track count updates
- Search works on both titles and tags

## Git Configuration
- Remote: `https://github.com/mathemagie/mathemagie.github.io.git`
- This is a subdirectory (`stories_audio`) within the main repository