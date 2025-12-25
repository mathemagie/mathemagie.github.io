# GitHub Repository Setup Guide

This guide explains how to update the GitHub repository settings that require manual configuration through the GitHub web interface.

## Repository: https://github.com/mathemagie/nabaztag_ISS

## ✅ Files Created (Ready to Upload)

The following files have been created and are ready to be added to your repository:

1. **`README.md`** → `REPOSITORY_README.md` (rename when uploading)
2. **`requirements.txt`** → `REPOSITORY_REQUIREMENTS.txt` (rename when uploading)
3. **`LICENSE`** → `REPOSITORY_LICENSE` (rename when uploading)
4. **`.gitignore`** → `REPOSITORY_GITIGNORE` (rename when uploading)

## 📋 Manual GitHub Settings Updates

### 1. Update Repository Description

**Location**: Repository Settings → General → Repository details

**Current**: Generic Python networking project description

**New**: 
```
A whimsical IoT project: My Nabaztag robot's ears wiggle every time the ISS flies over France. Live tracking + open source code.
```

**Steps**:
1. Go to your repository on GitHub
2. Click "Settings" (top menu)
3. Scroll to "Repository details"
4. Update the "Description" field
5. Click "Save changes"

---

### 2. Add Repository Topics/Tags

**Location**: Repository main page → Click the gear icon next to "About"

**Topics to Add**:
- `iot`
- `nabaztag`
- `iss-tracker`
- `international-space-station`
- `python`
- `raspberry-pi`
- `space`
- `smart-home`

**Steps**:
1. Go to your repository main page
2. Find the "About" section (right sidebar)
3. Click the gear icon (⚙️) next to "About"
4. In the "Topics" field, add each topic separated by commas
5. Click "Save changes"

---

### 3. Add Website Link

**Location**: Repository main page → Click the gear icon next to "About"

**Website URL**: `https://mathemagie.github.io/hack/nabaztag_iss/`

**Steps**:
1. Go to your repository main page
2. Find the "About" section (right sidebar)
3. Click the gear icon (⚙️) next to "About"
4. In the "Website" field, enter: `https://mathemagie.github.io/hack/nabaztag_iss/`
5. Click "Save changes"

---

### 4. Enable Issues

**Location**: Repository Settings → General → Features

**Steps**:
1. Go to your repository on GitHub
2. Click "Settings" (top menu)
3. Scroll to "Features" section
4. Check the box next to "Issues"
5. Click "Save changes"

---

### 5. Upload New Files

**Option A: Using GitHub Web Interface**

1. Go to your repository
2. Click "Add file" → "Upload files"
3. Drag and drop or select:
   - `REPOSITORY_README.md` → rename to `README.md` (this will replace the existing one)
   - `REPOSITORY_REQUIREMENTS.txt` → rename to `requirements.txt`
   - `REPOSITORY_LICENSE` → rename to `LICENSE`
   - `REPOSITORY_GITIGNORE` → rename to `.gitignore`
4. Add commit message: "docs: add comprehensive documentation and project files"
5. Click "Commit changes"

**Option B: Using Git Command Line**

```bash
cd /path/to/nabaztag_ISS
git add REPOSITORY_README.md REPOSITORY_REQUIREMENTS.txt REPOSITORY_LICENSE REPOSITORY_GITIGNORE
git mv REPOSITORY_README.md README.md
git mv REPOSITORY_REQUIREMENTS.txt requirements.txt
git mv REPOSITORY_LICENSE LICENSE
git mv REPOSITORY_GITIGNORE .gitignore
git commit -m "docs: add comprehensive documentation and project files

- Add user-friendly README with project overview and setup instructions
- Add requirements.txt for Python dependencies
- Add MIT LICENSE
- Add .gitignore for Python projects"
git push origin main
```

---

## 📸 Optional: Add Visual Content

### Add Video/GIF to README

The README includes a reference to the demo video. You can:

1. **Upload video to repository** (if under 100MB):
   - Add `nabaztag_ISS_scaled_x2.mp4` to a `media/` or `docs/` folder
   - Update README video link to point to the repository file

2. **Use GitHub Releases**:
   - Create a release and attach the video
   - Link to the release in the README

3. **Use external hosting**:
   - Upload to YouTube, Vimeo, or similar
   - Embed or link in README

### Add Screenshots

1. Take screenshots of:
   - The live tracking map
   - The Nabaztag in action
   - The Python script running

2. Create a `docs/` or `screenshots/` folder
3. Upload images
4. Update README to reference the images

---

## ✅ Checklist

- [ ] Update repository description
- [ ] Add repository topics/tags (8 topics)
- [ ] Add website link
- [ ] Enable Issues
- [ ] Upload README.md (replace existing)
- [ ] Upload requirements.txt
- [ ] Upload LICENSE
- [ ] Upload .gitignore
- [ ] (Optional) Add video/GIF to repository
- [ ] (Optional) Add screenshots

---

## 🎯 Expected Impact

After completing these updates:

✅ **More Discoverable**: Topics and description help GitHub's search algorithm  
✅ **Better Understanding**: Clear documentation helps others replicate the project  
✅ **Friendly Tone**: Matches the whimsical nature of the web interface  
✅ **Professional Setup**: Proper files (LICENSE, requirements.txt) show project maturity  
✅ **Community Ready**: Issues enabled allows for questions and contributions  

---

## 📝 Notes

- The README.md is written in a friendly, accessible tone that matches the whimsical nature of the project
- All technical details are included but presented in an approachable way
- The documentation includes examples for customizing to different countries/regions
- The setup guide is step-by-step and beginner-friendly

