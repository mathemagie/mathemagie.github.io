# 🎬 Instagram Video Recording Guide

Perfect videos for Instagram from your cellular animation!

## 📱 Quick Start

1. **Record Video**
   - Open `index.html` in browser
   - Click 🎬 button (top-left)
   - Choose format: Square (1080×1080) or Story (1080×1920)
   - Click "● Start Recording"
   - Click "■ Stop" when done
   - Click "⬇ Download Video"
   - Video saves to Downloads folder as `.webm`

2. **Convert to MP4**
   - Option A (Manual): `./convert-videos.sh`
   - Option B (Auto): `./auto-convert-watcher.sh`

---

## 🛠️ Setup (One-time)

### Install ffmpeg
```bash
brew install ffmpeg
```

### Install fswatch (for auto-watcher)
```bash
brew install fswatch
```

---

## 📹 Option A: Manual Conversion

After recording, convert videos manually:

```bash
cd ~/Documents/GitHub/mathemagie.github.io/hack/life
./convert-videos.sh
```

This converts all `.webm` files in the directory to `.mp4`

**Features:**
- High quality (CRF 18)
- Instagram optimized
- Skips already converted files
- Shows progress

---

## ⚡ Option B: Auto-Convert (Recommended!)

Start the watcher before recording:

```bash
cd ~/Documents/GitHub/mathemagie.github.io/hack/life
./auto-convert-watcher.sh
```

Then record videos as normal. They'll auto-convert to MP4!

**How it works:**
- Monitors `~/Downloads` folder
- Detects new `cellular-life-*.webm` files
- Auto-converts to MP4
- Notifies when ready
- Keeps running until you press Ctrl+C

---

## 📂 Workflow Example

### Terminal 1:
```bash
./auto-convert-watcher.sh
# Leave this running
```

### Browser:
1. Record video → saves to Downloads
2. Watcher auto-converts ✅
3. Upload `.mp4` to Instagram!

---

## 🎨 Recording Tips

### For Instagram Feed (Square):
- **Duration**: 3-15 seconds
- **Format**: Square (1080×1080)
- **Content**: Let cell breathe, click to move

### For Instagram Stories/Reels (Vertical):
- **Duration**: 10-60 seconds
- **Format**: Story (1080×1920)
- **Content**: More dynamic movement

### General Tips:
- ✅ Turn on sound (🔊) for ambient audio
- ✅ Click different spots to create movement
- ✅ Let it run 2-3s before/after actions
- ✅ Record multiple takes, pick the best!

---

## 🔧 Manual ffmpeg Conversion

If you prefer manual control:

```bash
# Basic conversion
ffmpeg -i input.webm output.mp4

# Instagram optimized (same as scripts)
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

---

## 📊 Quality Settings Explained

| Setting | Value | Why |
|---------|-------|-----|
| **CRF** | 18 | High quality (0-51, lower=better) |
| **Preset** | slow | Better compression |
| **Audio** | 192k AAC | Clear audio for Instagram |
| **Pixel Format** | yuv420p | Instagram compatibility |
| **faststart** | enabled | Faster loading on mobile |

---

## ❓ Troubleshooting

### "ffmpeg: command not found"
```bash
brew install ffmpeg
```

### "fswatch: command not found"
```bash
brew install fswatch
```

### Video won't play on phone
- Make sure you used the conversion script
- Instagram needs MP4 format, not WebM

### No sound in video
- Enable sound (🔊) BEFORE recording
- Check browser audio permissions

### Video quality is poor
- Use the provided scripts (CRF 18)
- Don't use QuickTime screen recording!

---

## 🚀 Pro Tips

1. **Pre-record batches**
   - Start watcher
   - Record 5-10 videos
   - All auto-convert
   - Pick best for Instagram

2. **Move downloads**
   - Move converted MP4s to a dedicated folder
   - Keeps Downloads clean
   - Easy to find your content

3. **Add text/stickers**
   - Use Instagram's native tools
   - Add text overlay
   - Add stickers/GIFs
   - Keeps video quality high

---

## 📱 Upload to Instagram

### From Desktop:
1. Open Instagram.com
2. Click + (Create)
3. Upload MP4
4. Add caption/hashtags
5. Post!

### From Phone:
1. AirDrop or transfer MP4 to phone
2. Save to Photos
3. Instagram → + → Video
4. Post!

---

**Made with 💙 using p5.js and Web Audio API**
