electron-packager . camtron --platform=linux --arch=x64 --overwrite
electron-packager . camtron --platform=win32 --overwrite
# electron-packager . camtron --platform=darwin --arch=x64 --overwrite

rm -rf assets
mkdir assets

zip -mr assets/camtron-linux-x64.zip camtron-linux-x64/
zip -mr assets/camtron-win32-x64.zip camtron-win32-x64/
