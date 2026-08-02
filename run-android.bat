@echo off
set "JAVA_HOME=C:\Program Files\Android\Android Studio\jbr"
set "ANDROID_HOME=C:\Users\Dooddles07\AppData\Local\Android\Sdk"
set "ANDROID_SDK_ROOT=C:\Users\Dooddles07\AppData\Local\Android\Sdk"
set "Path=%JAVA_HOME%\bin;%ANDROID_HOME%\platform-tools;%ANDROID_HOME%\emulator;%Path%"
cd /d "C:\Users\Dooddles07\Desktop\Life Budget Simulator"
echo JAVA_HOME=%JAVA_HOME%
echo ANDROID_HOME=%ANDROID_HOME%
call npx expo run:android
