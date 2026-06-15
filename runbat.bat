@echo off
echo Processing image with libvips...

vips dzsave map.png my_tiles --suffix .png

echo Done!
pause