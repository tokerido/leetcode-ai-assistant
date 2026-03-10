ICON FILES REQUIRED
===================

This directory needs the following PNG icon files before the extension can be loaded:

  - icon16.png   (16x16 pixels)
  - icon48.png   (48x48 pixels)
  - icon128.png  (128x128 pixels)

HOW TO CREATE ICONS
-------------------

Option 1 - Use an online tool:
  Visit https://favicon.io or https://www.canva.com and create a simple icon,
  then export/resize to 16x16, 48x48, and 128x128 PNG files.

Option 2 - Use ImageMagick (if installed):
  Run these commands from the project root:
    magick -size 16x16 xc:#3B82F6 -fill white -draw "roundrectangle 2,2 13,13 3,3" public/icons/icon16.png
    magick -size 48x48 xc:#3B82F6 -fill white -draw "roundrectangle 6,6 41,41 8,8" public/icons/icon48.png
    magick -size 128x128 xc:#3B82F6 -fill white -draw "roundrectangle 16,16 111,111 20,20" public/icons/icon128.png

Option 3 - Copy any PNG files:
  Copy any PNG images of the correct dimensions and rename them accordingly.

NOTE: Until these icon files exist, Chrome will show a default puzzle-piece icon
for the extension. The extension will still function correctly without them.
