#!/usr/bin/env python3
"""
Script to fetch audio URLs from RSS feeds and add them to tracks.json
Usage: python fetch_rss_tracks.py <rss_url>
Example: python fetch_rss_tracks.py https://radiofrance-podcast.net/podcast09/rss_19721.xml
"""

import argparse
import json
import sys
import xml.etree.ElementTree as ET
from urllib.request import urlopen


def fetch_rss_audio_tracks(rss_url):
    """
    Fetch RSS feed and extract audio tracks with URLs and titles from enclosure elements
    """
    try:
        # Fetch the RSS feed
        with urlopen(rss_url) as response:
            rss_content = response.read()

        # Parse the XML
        root = ET.fromstring(rss_content)

        # Find all item elements and extract their audio enclosures with titles
        audio_tracks = []
        for item in root.iter('item'):
            # Find enclosure elements within this item
            for enclosure in item.iter('enclosure'):
                enclosure_type = enclosure.get('type')
                enclosure_url = enclosure.get('url')

                # Check if it's an audio file
                if enclosure_type == 'audio/mpeg' and enclosure_url:
                    audio_tracks.append({
                        'url': enclosure_url,
                        'title': 'Oli'
                    })

        return audio_tracks

    except Exception as e:
        print(f"Error fetching or parsing RSS feed: {e}")
        return []


def load_existing_tracks(tracks_file='tracks.json'):
    """
    Load existing tracks from tracks.json
    """
    try:
        with open(tracks_file, 'r', encoding='utf-8') as f:
            data = json.load(f)
            return data.get('tracks', [])
    except FileNotFoundError:
        print(f"Warning: {tracks_file} not found. Creating new file.")
        return []
    except Exception as e:
        print(f"Error loading {tracks_file}: {e}")
        return []


def save_tracks(tracks, tracks_file='tracks.json'):
    """
    Save tracks to tracks.json
    """
    try:
        data = {'tracks': tracks}
        with open(tracks_file, 'w', encoding='utf-8') as f:
            json.dump(data, f, indent=4, ensure_ascii=False)
        print(f"Successfully saved {len(tracks)} tracks to {tracks_file}")
    except Exception as e:
        print(f"Error saving to {tracks_file}: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Fetch audio URLs from RSS feed and add to tracks.json'
    )
    parser.add_argument('rss_url', help='URL of the RSS feed to parse')
    parser.add_argument('--tracks-file', default='tracks.json',
                       help='Path to tracks.json file (default: tracks.json)')
    parser.add_argument('--dry-run', action='store_true',
                       help='Show what would be added without modifying tracks.json')

    args = parser.parse_args()

    print(f"Fetching audio tracks from: {args.rss_url}")

    # Fetch audio tracks from RSS
    audio_tracks = fetch_rss_audio_tracks(args.rss_url)

    if not audio_tracks:
        print("No audio tracks found in RSS feed.")
        return

    print(f"Found {len(audio_tracks)} audio tracks in RSS feed.")

    # Load existing tracks
    existing_tracks = load_existing_tracks(args.tracks_file)
    print(f"Existing tracks in {args.tracks_file}: {len(existing_tracks)}")

    # Get existing URLs for duplicate checking
    existing_urls = [track['url'] if isinstance(track, dict) else track for track in existing_tracks]

    # Check for duplicates and add new tracks
    new_tracks = []
    for track in audio_tracks:
        if track['url'] not in existing_urls:
            new_tracks.append(track)
        else:
            print(f"Skipping duplicate track: {track['title']}")

    if not new_tracks:
        print("No new tracks to add.")
        return

    print(f"Adding {len(new_tracks)} new tracks.")

    if args.dry_run:
        print("DRY RUN - Would add the following tracks:")
        for track in new_tracks:
            print(f"  {track['title']}")
        return

    # Add new tracks to existing tracks
    updated_tracks = existing_tracks + new_tracks

    # Save updated tracks
    save_tracks(updated_tracks, args.tracks_file)

    print(f"Added {len(new_tracks)} new tracks. Total tracks: {len(updated_tracks)}")


if __name__ == '__main__':
    main()
