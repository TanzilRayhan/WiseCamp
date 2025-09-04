@echo off
set "JAVA_HOME=C:\tools\jdk24"
set "PATH=C:\tools\jdk24\bin;%PATH%"
cd /d "G:\Javafest\WiseCamp\api"

REM Try using the Maven wrapper with escaped paths
call "%~dp0mvnw.cmd" spring-boot:run

REM If that fails, try compiling and running directly
if %ERRORLEVEL% neq 0 (
    echo Maven wrapper failed, trying direct compilation...
    call "%~dp0mvnw.cmd" compile
    if %ERRORLEVEL% equ 0 (
        java -cp "target\classes;%HOME%\.m2\repository\*" com.wisecamp.api.ApiApplication
    )
)
