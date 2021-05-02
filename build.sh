npm prune

electron-packager . camtron --platform=linux --arch=x64 --overwrite --asar
electron-packager . camtron --platform=win32 --overwrite --asar
electron-packager . camtron --platform=darwin --arch=x64 --overwrite --asar

rm -rf assets
mkdir assets

zip -rm  assets/camtron-linux-x64.zip camtron-linux-x64/
zip -rm  assets/camtron-win32-x64.zip camtron-win32-x64/
zip -rm assets/camtron-darwin-x64.zip camtron-darwin-x64/

rm -rf camtron-darwin-x64/

