# Spatial Audio — AirPods head-tracked Web Audio demo
# Run `make` (or `make help`) to list targets.

PORT     ?= 8742          # static server for the page
WS_PORT  ?= 8766          # HeadBridge WebSocket
URL      := http://localhost:$(PORT)/index.html
BRIDGE   := headbridge/HeadBridge.app

.DEFAULT_GOAL := help
.PHONY: help serve open bridge build run-bridge stop-bridge health clean

help: ## List available targets
	@echo "Spatial Audio — make targets:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) \
	  | sort | awk 'BEGIN{FS=":.*?## "}{printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

serve: ## Serve the page (default :8742, foreground; Ctrl-C to stop)
	@echo "Serving $(URL)"
	python3 -m http.server $(PORT)

open: ## Open the page in the default browser (server must be running)
	open "$(URL)"

build: ## Compile headbridge/HeadBridge.app (needs Xcode CLT)
	cd headbridge && ./build.sh

run-bridge: build ## Build then launch the menu-bar bridge
	open "$(BRIDGE)"

bridge: run-bridge ## Alias for run-bridge (build + launch)

stop-bridge: ## Quit the running HeadBridge menu-bar agent
	@pkill -x HeadBridge && echo "HeadBridge stopped." || echo "HeadBridge not running."

health: ## Check the bridge is streaming orientation (needs AirPods worn)
	@python3 -c "import socket,base64,os; s=socket.create_connection(('127.0.0.1',$(WS_PORT)),timeout=5); s.send(('GET / HTTP/1.1\r\nHost: localhost:$(WS_PORT)\r\nUpgrade: websocket\r\nConnection: Upgrade\r\nSec-WebSocket-Key: %s\r\nSec-WebSocket-Version: 13\r\n\r\n' % base64.b64encode(os.urandom(16)).decode()).encode()); print('handshake:', b'101' in s.recv(1024)); s.settimeout(4); data=s.recv(4096); print('frame:', data[2:].split(b'}')[0] + b'}')"

clean: ## Remove the built HeadBridge.app
	rm -rf "$(BRIDGE)"
	@echo "Removed $(BRIDGE)"
