@echo off
setlocal

REM Set JAVA_HOME with proper quotes
set "JAVA_HOME=c:\Users\Tanzil Rayhan\AppData\Local\oracleJdk-24"

REM Add Java to PATH
set "PATH=%JAVA_HOME%\bin;%PATH%"

REM Show Java version
echo Using Java version:
java -version

REM Run the Spring Boot application
echo.
echo Starting WiseCamp Spring Boot Application...
mvnw.cmd spring-boot:run

pause
