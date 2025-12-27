# 📦 Installation Guide - Instagram Video Recorder Extension

Quick guide to install and use the Instagram Video Recorder Chrome extension.

## 🚀 Installation (5 minutes)

### Step 1: Open Chrome Extensions

1. Open **Google Chrome**
2. Navigate to `chrome://extensions/`
3. Or: Menu (⋮) → Extensions → Manage Extensions

### Step 2: Enable Developer Mode

1. Find **Developer mode** toggle (top-right corner)
2. **Turn it ON** (should show green/blue when enabled)

### Step 3: Load Extension

1. Click **Load unpacked** button (top-left)
2. Navigate to:
   ```
   ~/Documents/GitHub/mathemagie.github.io/hack/life/chrome-extension
   ```
3. Click **Select** or **Open**

### Step 4: Pin Extension (Optional but Recommended)

1. Click the **puzzle piece icon** 🧩 in Chrome toolbar
2. Find **Instagram Video Recorder**
3. Click the **pin icon** 📌 to keep it visible

## ✅ Verify Installation

You should now see:
- 🎬 Extension icon in your toolbar
- Extension listed in `chrome://extensions/`
- Status shows "Enabled"

## 🎬 First Recording

### 1. Open Cellular Life Animation

Navigate to:
```
file:///Users/aurelienfache/Documents/GitHub/mathemagie.github.io/hack/life/index.html
```

Or use a local server:
```bash
cd ~/Documents/GitHub/mathemagie.github.io/hack/life
python3 -m http.server 8000
# Then visit: http://localhost:8000
```

### 2. Start Recording

1. **Wait** for animation to load (1-2 seconds)
2. **Click** the extension icon 🎬
3. **Choose format**: Square or Story
4. **Click** "● Start Recording"
5. Let animation run (click to move cell!)
6. **Click** "■ Stop Recording"
7. **Click** "⬇ Download MP4"

### 3. Convert to MP4

The extension downloads as `.webm` - convert to MP4 for Instagram:

**Option A - Auto-convert:**
```bash
cd ~/Documents/GitHub/mathemagie.github.io/hack/life
./auto-convert-watcher.sh
# Leave running, records auto-convert!
```

**Option B - Manual:**
```bash
cd ~/Documents/GitHub/mathemagie.github.io/hack/life
./convert-videos.sh
```

### 4. Upload to Instagram! 📱

Your MP4 is in Downloads folder, ready to upload!

## ⚙️ Extension Settings

### Format Options
- **Square (1080×1080)** - Instagram feed posts
- **Story (1080×1920)** - Stories & Reels

### Quality Settings
- **Frame Rate**: 30 or 60 FPS (recommend 60)
- **Bitrate**: 5, 10, or 15 Mbps (recommend 10)
- **Max Duration**: 15, 30, or 60 seconds (recommend 30)

## 🎨 What Can I Record?

The extension works with **any HTML5 canvas**:
- ✅ p5.js sketches
- ✅ Three.js 3D scenes
- ✅ Game canvases
- ✅ Data visualizations
- ✅ WebGL animations
- ✅ Processing sketches
- ✅ Custom canvas drawings

## 🐛 Troubleshooting

### Extension icon doesn't appear
- Check if extension is enabled in `chrome://extensions/`
- Try reloading Chrome
- Pin the extension to toolbar

### "No canvas found on page"
- Wait for page to fully load
- Refresh the page
- Check if canvas element exists (F12 → Elements tab)

### Recording is choppy
- Lower frame rate to 30 FPS
- Reduce bitrate to 5 Mbps
- Close other tabs
- Disable hardware acceleration

### No audio in recording
- Grant microphone permission when prompted
- Check page has audio enabled
- Try enabling sound before recording

### Can't install extension
- Make sure Developer mode is ON
- Try restarting Chrome
- Check folder path is correct

## 🔄 Update Extension

When you make changes:

1. Go to `chrome://extensions/`
2. Find **Instagram Video Recorder**
3. Click the **refresh icon** 🔄
4. Extension reloads with changes

## 🗑️ Uninstall Extension

1. Go to `chrome://extensions/`
2. Find **Instagram Video Recorder**
3. Click **Remove**
4. Confirm removal

## 📚 Additional Resources

- **Extension README**: Full documentation in `/chrome-extension/README.md`
- **Video Guide**: See `/VIDEO-RECORDING.md`
- **Conversion Scripts**: In `/chrome-extension/` folder

## 💡 Pro Tips

1. **Batch recording**: Start auto-watcher, record multiple videos, all auto-convert!
2. **Test settings**: Try different FPS/bitrate combos to find your sweet spot
3. **Audio**: Enable sound in animation before recording for ambient audio
4. **Timing**: Record 2-3 extra seconds, trim in Instagram editor
5. **Quality**: 60 FPS @ 10 Mbps = professional quality

## 🎯 Next Steps

1. ✅ **Install extension**
2. 🎬 **Record first video**
3. 🔄 **Convert to MP4**
4. 📱 **Upload to Instagram**
5. ⭐ **Share your creation!**

---

**Happy recording!** 🎥✨

Need help? Check the main README or open an issue on GitHub.
