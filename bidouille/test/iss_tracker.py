#!/usr/bin/env python3
"""Script pour tracker la position de l'ISS via l'API Open Notify."""

import requests
from datetime import datetime


def get_iss_position():
    """Récupère la position actuelle de l'ISS."""
    url = "http://api.open-notify.org/iss-now.json"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data["message"] == "success":
            position = data["iss_position"]
            timestamp = datetime.fromtimestamp(data["timestamp"])

            return {
                "latitude": float(position["latitude"]),
                "longitude": float(position["longitude"]),
                "timestamp": timestamp
            }
    except requests.RequestException as e:
        print(f"Erreur lors de la requête: {e}")
        return None


def get_astronauts_in_space():
    """Récupère la liste des astronautes actuellement dans l'espace."""
    url = "http://api.open-notify.org/astros.json"

    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()

        if data["message"] == "success":
            return {
                "number": data["number"],
                "people": data["people"]
            }
    except requests.RequestException as e:
        print(f"Erreur lors de la requête: {e}")
        return None


def main():
    print("=== ISS Tracker ===\n")

    # Position de l'ISS
    position = get_iss_position()
    if position:
        print(f"Position actuelle de l'ISS:")
        print(f"  Latitude:  {position['latitude']:.4f}°")
        print(f"  Longitude: {position['longitude']:.4f}°")
        print(f"  Timestamp: {position['timestamp']}")
        print(f"  Google Maps: https://www.google.com/maps?q={position['latitude']},{position['longitude']}")

    print()

    # Astronautes dans l'espace
    astronauts = get_astronauts_in_space()
    if astronauts:
        print(f"Astronautes dans l'espace: {astronauts['number']}")
        for person in astronauts["people"]:
            print(f"  - {person['name']} ({person['craft']})")


if __name__ == "__main__":
    main()
