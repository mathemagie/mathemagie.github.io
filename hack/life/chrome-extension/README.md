# 🎬 Instagram Video Recorder - Chrome Extension

Professional canvas recording extension optimized for Instagram! Record any HTML5 canvas animation in perfect Instagram formats.

## ✨ Features

- **📐 Instagram Formats**
  - Square (1080×1080) - Perfect for feed posts
  - Story (1080×1920) - Perfect for stories/reels

- **🎥 High Quality**
  - 60 FPS recording
  - 10 Mbps bitrate (customizable)
  - VP9/VP8 codecs
  - Audio capture support

- **⚙️ Customizable Settings**
  - Frame rate: 30/60 FPS
  - Bitrate: 5/10/15 Mbps
  - Max duration: 15/30/60 seconds

- **🚀 Easy to Use**
  - One-click recording
  - Auto-detects canvas elements
  - Direct download
  - Clean, modern UI

## 📦 Installation

### Method 1: Load Unpacked (Development)

1. Open Chrome and go to `chrome://extensions/`
2. Enable **Developer mode** (toggle in top-right)
3. Click **Load unpacked**
4. Navigate to and select the `chrome-extension` folder
5. Extension is now installed! 🎉

### Method 2: From Chrome Web Store (Coming Soon)

*This extension will be published to the Chrome Web Store soon.*

## 🎯 Quick Start

1. **Open any page with a canvas** (like the Cellular Life animation)
2. **Click the extension icon** 🎬 in your toolbar
3. **Choose format**: Square or Story
4. **Click "Start Recording"**
5. **Click "Stop Recording"** when done
6. **Click "Download MP4"**
7. **Upload to Instagram!** 📱

## 🎨 Perfect For

- ✅ p5.js animations
- ✅ WebGL graphics
- ✅ Game captures
- ✅ Data visualizations
- ✅ Creative coding projects
- ✅ Any HTML5 canvas content!

## 📹 Workflow

### Recording
1. Navigate to page with canvas
2. Open extension popup
3. Select Instagram format
4. Start recording
5. Stop when ready
6. Download as WebM

### Convert to MP4 (Required for Instagram)

Instagram requires MP4 format. Use the provided conversion scripts:

**Option A - Auto-convert (Recommended):**
```bash
cd path/to/chrome-extension
./auto-convert-watcher.sh
```

**Option B - Manual convert:**
```bash
./convert-videos.sh
```

**Option C - ffmpeg command:**
```bash
ffmpeg -i input.webm \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -c:a aac \
  -b:a 192k \
  -pix_fmt yuv420p \
  -movflags +faststart \
  output.mp4
```

### Upload to Instagram
1. Open Instagram (web or mobile)
2. Click + (Create new post)
3. Upload the MP4 file
4. Add caption, tags, etc.
5. Post! 🚀

## ⚙️ Settings Explained

| Setting | Options | Recommended | Why |
|---------|---------|-------------|-----|
| **Format** | Square / Story | Square for feed, Story for reels | Instagram dimensions |
| **Frame Rate** | 30 / 60 FPS | 60 FPS | Smooth, professional quality |
| **Bitrate** | 5 / 10 / 15 Mbps | 10 Mbps | Balance quality & file size |
| **Duration** | 15 / 30 / 60 sec | 30 sec | Instagram limits |

## 🔧 Technical Details

### Architecture
- **Manifest V3** - Latest Chrome extension format
- **Content Script** - Captures canvas via `captureStream()`
- **Service Worker** - Manages extension lifecycle
- **Popup UI** - Modern, responsive controls

### Codecs
1. **VP9** - Best quality (preferred)
2. **VP8** - Fallback for older browsers
3. **Default WebM** - Final fallback

### Permissions
- `activeTab` - Access current page canvas
- `downloads` - Save recorded videos
- `storage` - Remember settings
- `tabCapture` - Audio capture support

## 💡 Tips & Tricks

### Best Quality
- Use 60 FPS for smooth animations
- Use 10-15 Mbps bitrate for high detail
- Let recording run 1-2 seconds before/after action
- Avoid browser zoom (use 100%)

### Audio Recording
- Extension will ask for microphone permission
- Grant permission for audio capture
- Or enable audio on the page itself

### Multiple Takes
- Record several versions
- Pick the best one
- Delete unused files

### File Size
- 60 FPS @ 10 Mbps = ~75 MB/min
- 30 FPS @ 5 Mbps = ~38 MB/min
- Keep recordings under 60 seconds

## 🐛 Troubleshooting

### "No canvas found on page"
- Ensure page has loaded completely
- Check if canvas element exists (inspect page)
- Some pages hide canvas - may not work

### Recording is laggy
- Lower frame rate to 30 FPS
- Reduce bitrate to 5 Mbps
- Close other tabs/apps
- Check CPU usage

### No audio in recording
- Grant microphone permission when prompted
- Check browser audio settings
- Some pages don't have audio

### Video won't upload to Instagram
- Make sure you converted to MP4
- Instagram doesn't accept WebM
- Use the conversion scripts provided

### Extension not working
- Reload the page
- Reload the extension (chrome://extensions/)
- Check console for errors (F12)
- Try in Incognito mode

## 📊 Performance

### Resource Usage
- **CPU**: Moderate (depends on canvas complexity)
- **Memory**: ~100-200 MB during recording
- **Disk**: ~75 MB per minute @ 10 Mbps

### Compatibility
- ✅ Chrome 88+
- ✅ Edge 88+
- ✅ Brave
- ❌ Firefox (different extension format)
- ❌ Safari (no WebM support)

## 🔐 Privacy

- **No data collection** - Everything runs locally
- **No external servers** - Videos stay on your device
- **No tracking** - Zero analytics
- **Open source** - Code is fully auditable

## 📝 Changelog

### v1.0.0 (2025-01-15)
- Initial release
- Instagram format presets (square, story)
- High-quality recording (up to 60 FPS, 15 Mbps)
- Audio capture support
- Customizable settings
- Modern UI with purple gradient theme
- Auto-stop after max duration
- Real-time FPS monitoring
- Recording timer

## 🚀 Future Features

- [ ] Direct MP4 conversion (without external tools)
- [ ] Video preview before download
- [ ] Trim/edit recorded clips
- [ ] Preset filters/effects
- [ ] Batch recording mode
- [ ] Keyboard shortcuts
- [ ] Firefox version
- [ ] Direct Instagram upload

## 🤝 Contributing

Contributions welcome! This is part of the Cellular Life animation project.

## 📄 License

MIT License - Free to use, modify, and distribute

## 🙏 Credits

Built with:
- Chrome Extension Manifest V3
- MediaRecorder API
- Canvas Capture Stream API
- Love for creative coding! 💙

---

**Made for creators who want to share their canvas animations on Instagram** 🎨📱

For the complete Cellular Life animation experience, check out the main project!
