const config = {
      "title": "终端逐字开机序列",
      "segments": [
        {
          "caseId": "archive-os",
          "label": "原有演示",
          "source": "mechanism/scene.html",
          "legacy": true,
          "from": 0,
          "to": 21.92
        },
        {
          "caseId": "mg-hud",
          "label": "HUD 逐字开机日志",
          "from": 0.2,
          "to": 2.4
        },
        {
          "caseId": "mg-hud",
          "label": "HUD 坐标逐字打印",
          "from": 7.05,
          "to": 8.7
        }
      ],
      "markers": [
        {
          "t": 21.92,
          "label": "HUD 逐字开机日志"
        },
        {
          "t": 24.12,
          "label": "HUD 坐标逐字打印"
        }
      ],
      "reduced": 8.6,
      "root": "#stage",
      "orients": [
        "landscape"
      ],
      "fps": 30
    };
    await MotionKit.replay(config);
