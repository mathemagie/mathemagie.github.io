#!/usr/bin/env python3
"""
Script to fetch audio URLs from RSS feeds and add them to tracks.json
Usage: python fetch_rss_tracks.py <rss_url>
Example: python fetch_rss_tracks.py https://radiofrance-podcast.net/podcast09/rss_19721.xml
"""

import argparse
import json
import sys
import re
import xml.etree.ElementTree as ET
from urllib.request import urlopen


def extract_tags_from_title(title):
    """
    Extract meaningful tags from RSS title
    """
    tags = ['oli', 'histoire', 'enfants', 'radiofrance']

    # Extract author name (after "de" or "d'")
    author_match = re.search(r'(?:de|d\')\s+([^,]+)', title)
    if author_match:
        author = author_match.group(1).strip()
        tags.append(f'auteur:{author.lower()}')

    # Extract story title (between quotes)
    story_match = re.search(r'"([^"]+)"', title)
    if story_match:
        story_title = story_match.group(1).lower()

        # Add theme-based tags based on keywords in story title
        theme_keywords = {
            'magique': ['magie', 'magique', 'sorcier', 'fée', 'enchantement'],
            'animaux': ['chat', 'chien', 'cheval', 'oiseau', 'lapin', 'renard', 'loup', 'ours', 'poisson', 'dauphin', ' baleine'],
            'aventure': ['aventure', 'voyage', 'explorateur', 'pirate', 'trésor', 'île', 'océan', 'montagne'],
            'amitié': ['ami', 'amitié', 'copain', 'ensemble', 'solidarité'],
            'famille': ['famille', 'père', 'mère', 'grand', 'parent', 'frère', 'sœur'],
            'nature': ['forêt', 'rivière', 'mer', 'océan', 'ciel', 'étoile', 'lune', 'soleil', 'fleur', 'arbre'],
            'musique': ['musique', 'chanter', 'chanson', 'instrument', 'orchestre'],
            'livre': ['livre', 'lecture', 'bibliothèque', 'histoire']
        }

        for theme, keywords in theme_keywords.items():
            if any(keyword in story_title for keyword in keywords):
                tags.append(theme)

        # Add individual words as tags (excluding common words)
        words = re.findall(r'\b\w{4,}\b', story_title)  # words with 4+ characters
        common_words = {'sans', 'avec', 'dans', 'pour', 'chez', 'tout', 'plus', 'bien', 'elle', 'mais', 'dont', 'dont', 'leur', 'comme', 'fait', 'faire', 'dire', 'dont', 'vont', 'être', 'avoir', 'peut', 'quel', 'quoi', 'leur', 'dont', 'cette', 'notre', 'toute', 'aussi', 'alors', 'quand', 'même', 'encore', 'déjà', 'ainsi', 'entre', 'deux', 'trois', 'petit', 'grand', 'gros', 'beau', 'belle', 'joli', 'drôle'}

        for word in words:
            if word not in common_words and len(word) >= 4:
                tags.append(word)

    # Remove duplicates and clean up
    tags = list(set(tags))
    tags.sort()

    return tags


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

        # Find all item elements and extract their audio enclosures with titles and tags
        audio_tracks = []
        for item in root.iter('item'):
            # Get the title from the item
            title_elem = item.find('title')
            title = title_elem.text if title_elem is not None else "Unknown Title"

            # Extract tags from the title
            tags = extract_tags_from_title(title)

            # Find enclosure elements within this item
            for enclosure in item.iter('enclosure'):
                enclosure_type = enclosure.get('type')
                enclosure_url = enclosure.get('url')

                # Check if it's an audio file
                if enclosure_type == 'audio/mpeg' and enclosure_url:
                    audio_tracks.append({
                        'url': enclosure_url,
                        'title': title,
                        'tags': tags
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

    # Get existing URLs for duplicate checking (handle backward compatibility)
    existing_urls = []
    for track in existing_tracks:
        if isinstance(track, dict):
            existing_urls.append(track['url'])
        else:
            # Handle old string format tracks
            existing_urls.append(track)

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
