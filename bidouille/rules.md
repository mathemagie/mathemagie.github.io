## Project Structure and Best Practices

1. **Organize Your JavaScript**
   - Make a folder called `js` in your project directory.
   - Move all your JavaScript code into a file named `script.js` inside the `js` folder.

2. **Organize Your CSS**
   - Make a folder called `css` in your project directory.
   - Move all your CSS code into a file named `styles.css` inside the `css` folder.

## Mobile-Safe Header Improvements

To make your website more mobile-friendly and support iOS web app features, add the following tags to your `<head>` section in `index.html`:

example : 
    <meta name="viewport" content="width=device-width, initial-scale=1.0, user-scalable=no, viewport-fit=cover" />

    <!-- iOS Web App Fullscreen Support -->
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Agent by Night" />

    <!-- Web App Manifest -->
    <link rel="manifest" href="manifest.json" />

    <!-- iOS Touch Icons -->
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="apple-touch-icon" sizes="152x152" href="/apple-touch-icon-152x152.png" />
    <link rel="apple-touch-icon" sizes="120x120" href="/apple-touch-icon-120x120.png" />

    <!-- iOS Startup Images -->
    <link rel="apple-touch-startup-image" href="/apple-touch-startup-image-750x1334.png" media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" />
    <link rel="apple-touch-startup-image" href="/apple-touch-startup-image-640x1136.png" media="(device-width: 320px) and (device-height: 568px) and (-webkit-device-pixel-ratio: 2)" />
