npm prune

rm -rf assets
mkdir assets
armv7l
electron-packager . camtron --platform=linux --arch=x64 --overwrite --asar
zip -rm  assets/camtron-linux-x64.zip camtron-linux-x64/

electron-packager . camtron --platform=linux --arch=armv7l --overwrite --asar
zip -rm  assets/camtron-linux-x64.zip camtron-linux-armv7l/

electron-packager . camtron --platform=win32 --overwrite --asar
zip -rm  assets/camtron-win32-x64.zip camtron-win32-x64

electron-packager . camtron --platform=darwin --arch=x64 --overwrite --asar
zip -rm assets/camtron-darwin-x64.zip camtron-darwin-x64/



