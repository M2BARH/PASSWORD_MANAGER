Set WshShell = CreateObject("WScript.Shell")
WshShell.Run "cmd /c cd /d D:\my-projects\PASSWORD_MANAGER && start /min /b node index.js", 0, False
