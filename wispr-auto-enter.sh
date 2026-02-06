#!/bin/bash
# wispr-auto-enter.sh
# Detecte quand Wispr Flow colle du texte (changement clipboard)
# puis simule la touche Entree apres un court delai.
#
# Usage: ./wispr-auto-enter.sh &
#        claude
#
# Ctrl+C pour arreter

POLL_INTERVAL=0.3   # secondes entre chaque verification du clipboard
ENTER_DELAY=0.8     # secondes apres le paste avant d'appuyer Entree

prev=$(pbpaste 2>/dev/null)

echo "Wispr auto-enter actif — Ctrl+C pour arreter"

while true; do
    sleep "$POLL_INTERVAL"
    curr=$(pbpaste 2>/dev/null)

    if [[ "$curr" != "$prev" ]] && [[ -n "$curr" ]]; then
        prev="$curr"
        sleep "$ENTER_DELAY"
        osascript -e 'tell application "System Events" to key code 36'
    fi
done
