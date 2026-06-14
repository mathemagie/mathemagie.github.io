// HeadBridge — reads AirPods head orientation (CMHeadphoneMotionManager)
// and broadcasts it as JSON over a local WebSocket (ws://localhost:8765).
// Menu-bar agent (no dock icon). Build with ./build.sh

import Foundation
import CoreMotion
import Network
import AppKit

// MARK: - Minimal WebSocket server (Network.framework handles framing)

final class WSServer {
    private var listener: NWListener?
    private var conns = [ObjectIdentifier: NWConnection]()
    private let q = DispatchQueue(label: "headbridge.ws")

    func start(port: UInt16) {
        let params = NWParameters.tcp
        let ws = NWProtocolWebSocket.Options()
        ws.autoReplyPing = true
        params.defaultProtocolStack.applicationProtocols.insert(ws, at: 0)
        do {
            listener = try NWListener(using: params, on: NWEndpoint.Port(rawValue: port)!)
        } catch {
            print("[ws] listener error:", error); return
        }
        listener?.newConnectionHandler = { [weak self] c in self?.add(c) }
        listener?.start(queue: q)
        print("[ws] listening on ws://localhost:\(port)")
    }

    private func add(_ c: NWConnection) {
        let id = ObjectIdentifier(c)
        c.stateUpdateHandler = { [weak self] state in
            switch state {
            case .ready:
                self?.conns[id] = c
                self?.receive(c)
                print("[ws] client connected (\(self?.conns.count ?? 0))")
            case .failed, .cancelled:
                self?.conns[id] = nil
            default:
                break
            }
        }
        c.start(queue: q)
    }

    // Keep the receive pump alive so the socket stays open.
    private func receive(_ c: NWConnection) {
        c.receiveMessage { [weak self] _, _, _, err in
            if err == nil { self?.receive(c) }
        }
    }

    func broadcast(_ text: String) {
        guard let data = text.data(using: .utf8) else { return }
        let meta = NWProtocolWebSocket.Metadata(opcode: .text)
        let ctx = NWConnection.ContentContext(identifier: "msg", metadata: [meta])
        q.async {
            for c in self.conns.values {
                c.send(content: data, contentContext: ctx, isComplete: true,
                       completion: .contentProcessed { _ in })
            }
        }
    }
}

// MARK: - App

final class AppDelegate: NSObject, NSApplicationDelegate {
    let server = WSServer()
    let motion = CMHeadphoneMotionManager()
    var statusItem: NSStatusItem!

    func applicationDidFinishLaunching(_ notification: Notification) {
        statusItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        statusItem.button?.title = "🎧"

        let menu = NSMenu()
        menu.addItem(withTitle: "HeadBridge", action: nil, keyEquivalent: "")
        menu.addItem(withTitle: "ws://localhost:8766", action: nil, keyEquivalent: "")
        menu.addItem(.separator())
        menu.addItem(withTitle: "Quit", action: #selector(quit), keyEquivalent: "q")
        statusItem.menu = menu

        server.start(port: 8766)
        startMotion()
    }

    func startMotion() {
        guard motion.isDeviceMotionAvailable else {
            statusItem.button?.title = "🎧⚠️"
            print("[motion] headphone motion unavailable — need AirPods Pro / 3rd gen / Max, paired and worn.")
            return
        }
        motion.startDeviceMotionUpdates(to: .main) { [weak self] dm, err in
            guard let self = self else { return }
            if let err = err { print("[motion] error:", err); return }
            guard let a = dm?.attitude else { return }
            let qt = a.quaternion
            let json = String(
                format: "{\"yaw\":%.5f,\"pitch\":%.5f,\"roll\":%.5f,\"qw\":%.6f,\"qx\":%.6f,\"qy\":%.6f,\"qz\":%.6f}",
                a.yaw, a.pitch, a.roll, qt.w, qt.x, qt.y, qt.z)
            self.server.broadcast(json)
            self.statusItem.button?.title = "🎧●"
        }
        print("[motion] started — turn your head; data streams when AirPods are worn.")
    }

    @objc func quit() {
        motion.stopDeviceMotionUpdates()
        NSApp.terminate(nil)
    }
}

let app = NSApplication.shared
let delegate = AppDelegate()
app.delegate = delegate
app.setActivationPolicy(.accessory)   // menu-bar only, no dock icon
app.run()
