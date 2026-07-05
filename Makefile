PORT ?= 8000

.PHONY: serve start open help

## Serve the site locally on http://localhost:$(PORT)
serve start:
	@echo "Serving on http://localhost:$(PORT) (Ctrl-C to stop)"
	@python3 -m http.server $(PORT)

## Serve and open the site in the default browser
open:
	@python3 -m http.server $(PORT) & \
	sleep 1 && open http://localhost:$(PORT) && wait

## Show available targets
help:
	@grep -B1 '^[a-z].*:' Makefile | grep '^##' | sed 's/## //'
