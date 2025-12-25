# GitHub Repository Updates Needed

## Repository: https://github.com/mathemagie/nabaztag_ISS

### Current Issues

The GitHub repository README is very technical and doesn't reflect the whimsical, user-friendly nature of the project. It reads like a generic Python networking script instead of the delightful IoT art project it actually is.

### Recommended Updates

#### 1. Update Repository Description
**Current:** Generic Python networking project description
**Should be:** "A whimsical IoT project: My Nabaztag robot's ears wiggle every time the ISS flies over France. Live tracking + open source code."

#### 2. Rewrite README.md

The README should include:

- **Project Overview**
  - Explain what the project does in friendly, accessible language
  - Mention the Nabaztag rabbit wiggling its ears when ISS passes over France
  - Link to the live demo: https://mathemagie.github.io/hack/nabaztag_iss/

- **Visual Content**
  - Add the nabaztag_ISS_scaled_x2.mp4 video or a GIF preview
  - Include a screenshot of the live tracking map
  - Show the project in action

- **How It Works**
  - Explain the Python script monitors ISS location via Where The ISS At API
  - When ISS enters French airspace, sends commands to Nabaztag
  - Technical details about the SSH tunnel and JSON commands

- **Hardware Requirements**
  - Nabaztag/tag:tag rabbit (vintage smart toy from 2005-2011)
  - Raspberry Pi or similar device to run the Python script
  - Local network connection to Nabaztag

- **Software Setup**
  - Python 3.x installation
  - Dependencies needed (if any)
  - SSH tunnel configuration details
  - How to configure for different locations (not just France)

- **Files Explanation**
  - `ear.py` - Main monitoring script
  - `send.py` - Network communication helper
  - `mescommandes.json` - Ear movement command definitions

- **Usage Instructions**
  - Clear step-by-step setup guide
  - How to run the script
  - How to customize for different countries/regions

- **Credits and Links**
  - Link to the live web tracker
  - Link to Where The ISS At API
  - Information about Nabaztag hardware

#### 3. Add Topics/Tags
Add relevant GitHub topics:
- `iot`
- `nabaztag`
- `iss-tracker`
- `international-space-station`
- `python`
- `raspberry-pi`
- `space`
- `smart-home`

#### 4. Add Missing Files
Consider adding to the repository:
- `requirements.txt` - Python dependencies
- `LICENSE` - Open source license
- `.gitignore` - For Python projects
- Images/screenshots from the web demo

#### 5. Update Repository Settings
- Enable Issues (for community questions)
- Add website link: https://mathemagie.github.io/hack/nabaztag_iss/
- Consider adding a GitHub Pages site or directing to the existing one

### Impact

These updates will:
- Make the project more discoverable
- Help others understand and replicate the project
- Match the friendly, whimsical tone of the web interface
- Provide proper documentation for setup
- Attract more interest from the maker/IoT community
