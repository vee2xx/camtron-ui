
# TODO: add process for zipping binaries that works cross platform. 
npm prune
electron-packager . camtron --platform=linux --arch=x64 --overwrite --asar
electron-packager . camtron --platform=linux --arch=armv7l --overwrite --asar
electron-packager . camtron --platform=win32 --overwrite --asar
electron-packager . camtron --platform=darwin --arch=x64 --overwrite --asar



