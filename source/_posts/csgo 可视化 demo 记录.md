---
title: csgo 可视化 demo 记录
date: 2026-01-12 15:32:08
tags:
  - 方法
  - 游戏
---
用来防止自己忘记使用方法
1：用vscode打开桌面文件夹
2：下载视频demo ".dem"文件放进文件夹右键复制地址
3：粘贴至main.py 中src.config.DEMO_PATH = r"C:\\Users\\mengyiheqiao\\Desktop\\cs demo\\donk1.dem"   注意两个反斜杆不可缺少 r不可缺少
4:按 `Ctrl + S` 保存
5：启动游戏，调出控制台，输入playdemo xxxx 自动跳转播放demo
6：打开vscode终端 输入
.\venv\Scripts\Activate
python main.py
7：解析完毕调出键盘即可

暂时遇到的问题：
游戏界面无法显示键盘
解决办法：游戏界面调成窗口全屏
按f9不能同时播放demo和键盘，换言之无法协同
解决办法：暂时还没找到完全处理办法，有种说法是无法确认是游戏界面导致游戏里指令没有读取建议播放前鼠标左键一下，但是我测试了一下一会好一会不好，建议多试一下过了就跳回去等解析完按f9。

