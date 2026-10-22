window.CASE_CONFIG = {
  "meta": {
    "titleCJK": "関西周遊",
    "titleEN": "KANSAI LOOP '26",
    "subline": "SHANGHAI → KANSAI · KYOTO · NARA · OSAKA · 10.01 – 10.03",
    "handle": "@motion_atlas",
    "tz": "JST",
    "totalDays": 3,
    "duration": 60,
    "bpm": 120
  },
  "map": {
    "style": "https://tiles.openfreemap.org/styles/positron",
    "lib": "https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.js",
    "css": "https://unpkg.com/maplibre-gl@5.6.0/dist/maplibre-gl.css",
    "dem": "https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png",
    "demMaxZoom": 10,
    "attribution": "© OpenStreetMap contributors · OpenFreeMap · OpenMapTiles · Terrain Tiles",
    "attributionShort": "© OpenStreetMap contributors · OpenFreeMap"
  },
  "palette": {
    "paper": "#f1eee7",
    "ink": "#16171a",
    "nightPaper": "#0b1019",
    "nightInk": "#e9edf3",
    "accent": "#d9562c",
    "alert": "#e23b3b",
    "space": "#05070c"
  },
  "mapPalette": {
    "bg": [
      "#efece5",
      "#111824"
    ],
    "water": [
      "#bdd0dc",
      "#0a0f17"
    ],
    "green": [
      "#e1e6d6",
      "#121b1e"
    ],
    "ice": [
      "#f6f5f1",
      "#141b25"
    ],
    "landuse": [
      "#e9e5dc",
      "#141b26"
    ],
    "building": [
      "#ddd7cb",
      "#1a2231"
    ],
    "aero": [
      "#e5e1d8",
      "#18202c"
    ],
    "casing": [
      "#dad4c9",
      "#0d131c"
    ],
    "road": [
      "#ffffff",
      "#273245"
    ],
    "motorway": [
      "#fffdf8",
      "#5b4934"
    ],
    "rail": [
      "#9d978c",
      "#40506a"
    ],
    "boundary": [
      "#b2aca1",
      "#3e495b"
    ],
    "extrusion": [
      "#efebe3",
      "#1e2839"
    ],
    "shade": [
      "#5f5644",
      "#000000"
    ],
    "light": [
      "#ffffff",
      "#3b5172"
    ]
  },
  "mascot": {
    "label": "MIKAN SPOTTED",
    "name": "MIKAN"
  },
  "music": {
    "title": "Kansai Loop",
    "artist": "Motion Atlas Original",
    "lyrics": [
      {
        "t": 8,
        "text": "Window seat, the sea turns into land",
        "sub": "靠窗的位置，海慢慢变成陆地"
      },
      {
        "t": 14,
        "text": "Haruka hums the whole way north",
        "sub": "特急一路向北，轻轻哼着"
      },
      {
        "t": 18,
        "text": "A thousand gates, one quiet climb",
        "sub": "一千座鸟居，一段安静的上坡"
      },
      {
        "t": 24,
        "text": "The river runs, the water never stays",
        "sub": "河一直在流，水却不是原来的水"
      },
      {
        "t": 33,
        "text": "Lanterns on Pontocho, rain on the stones",
        "sub": "先斗町的灯笼，石板上的雨"
      },
      {
        "t": 37,
        "text": "Morning trains and bowing deer",
        "sub": "早班车，和会鞠躬的鹿"
      },
      {
        "t": 44,
        "text": "Wrong platform, right adventure",
        "sub": "站错了站台，走对了旅途"
      },
      {
        "t": 48.6,
        "text": "Neon on the canal says hello",
        "sub": "运河上的霓虹打了个招呼"
      },
      {
        "t": 54,
        "text": "Three days, one loop, all the way home",
        "sub": "三天，一个圈，一路回家"
      }
    ]
  },
  "days": [
    {
      "n": 1,
      "date": "THU · OCT 01 2026"
    },
    {
      "n": 2,
      "date": "FRI · OCT 02 2026"
    },
    {
      "n": 3,
      "date": "SAT · OCT 03 2026"
    }
  ],
  "stops": {
    "pvg": {
      "name": "SHANGHAI · PVG",
      "ja": "上海浦東",
      "lngLat": [
        121.8052,
        31.1443
      ],
      "elev": 4,
      "side": -1
    },
    "kix": {
      "name": "KANSAI · KIX",
      "ja": "関西空港",
      "lngLat": [
        135.24433,
        34.4364
      ],
      "elev": 5,
      "sideP": 0
    },
    "kyoto": {
      "name": "KYOTO STA.",
      "ja": "京都駅",
      "lngLat": [
        135.75878,
        34.98513
      ],
      "elev": 29
    },
    "inari": {
      "name": "FUSHIMI INARI",
      "ja": "伏見稲荷",
      "lngLat": [
        135.7727,
        34.9671
      ],
      "elev": 38,
      "minZoom": 12
    },
    "kamo": {
      "name": "KAMO RIVER · SANJO",
      "ja": "鴨川",
      "lngLat": [
        135.7716,
        35.0088
      ],
      "elev": 40,
      "minZoom": 12
    },
    "jrNara": {
      "name": "JR NARA",
      "ja": "奈良駅",
      "lngLat": [
        135.81901,
        34.68079
      ],
      "elev": 64,
      "minZoom": 13,
      "node": true
    },
    "naraPark": {
      "name": "NARA PARK",
      "ja": "奈良公園",
      "lngLat": [
        135.8398,
        34.6853
      ],
      "elev": 95
    },
    "kintetsuNara": {
      "name": "KINTETSU-NARA",
      "ja": "近鉄奈良",
      "lngLat": [
        135.82849,
        34.68408
      ],
      "elev": 70,
      "minZoom": 13,
      "node": true
    },
    "saidaiji": {
      "name": "YAMATO-SAIDAIJI",
      "ja": "大和西大寺",
      "lngLat": [
        135.78265,
        34.69375
      ],
      "elev": 76,
      "minZoom": 11
    },
    "takanohara": {
      "name": "TAKANOHARA · WRONG WAY",
      "ja": "高の原",
      "lngLat": [
        135.7917,
        34.7244
      ],
      "elev": 96,
      "minZoom": 11,
      "alert": true
    },
    "namba": {
      "name": "OSAKA NAMBA",
      "ja": "大阪難波",
      "lngLat": [
        135.49778,
        34.66717
      ],
      "elev": 3,
      "minZoom": 13,
      "node": true
    },
    "dotonbori": {
      "name": "DOTONBORI",
      "ja": "道頓堀",
      "lngLat": [
        135.50125,
        34.66876
      ],
      "elev": 3
    }
  },
  "stepper": [
    {
      "id": "kix",
      "label": "KIX",
      "stamp": "関空",
      "icon": "plane"
    },
    {
      "id": "kyoto",
      "label": "KYOTO",
      "stamp": "京都",
      "icon": "torii"
    },
    {
      "id": "naraPark",
      "label": "NARA",
      "stamp": "奈良",
      "icon": "deer"
    },
    {
      "id": "dotonbori",
      "label": "OSAKA",
      "stamp": "大阪",
      "icon": "bridge"
    }
  ],
  "chapters": {
    "river": {
      "tag": "CHAPTER 01",
      "title": "方丈記 · Kamo River",
      "accent": "#2a8fae",
      "decor": "frame"
    },
    "deer": {
      "tag": "CHAPTER 02",
      "title": "鹿の国 · Nara Park",
      "accent": "#c98a2a",
      "decor": "tape"
    }
  },
  "tracks": {
    "camera": [
      {
        "t": 0,
        "c": [
          124,
          30.5
        ],
        "z": 1.55,
        "p": 0,
        "b": 0,
        "f": [
          960,
          560
        ],
        "fp": [
          540,
          820
        ],
        "zp": -0.25
      },
      {
        "t": 3,
        "c": [
          126,
          31.6
        ],
        "z": 1.75,
        "p": 0,
        "b": 0,
        "f": [
          1420,
          560
        ],
        "fp": [
          540,
          1180
        ],
        "zp": -0.25
      },
      {
        "t": 7.8,
        "c": [
          127.6,
          32.4
        ],
        "z": 1.95,
        "p": 0,
        "b": 0,
        "f": [
          1460,
          560
        ],
        "fp": [
          540,
          1300
        ],
        "zp": -0.3
      },
      {
        "t": 11.6,
        "c": [
          135.244,
          34.431
        ],
        "z": 11.1,
        "p": 42,
        "b": -16,
        "f": [
          640,
          600
        ],
        "fp": [
          540,
          700
        ],
        "e": "out"
      },
      {
        "t": 14,
        "c": [
          135.244,
          34.431
        ],
        "z": 11.35,
        "p": 46,
        "b": -22,
        "f": [
          640,
          600
        ],
        "fp": [
          540,
          700
        ]
      },
      {
        "t": 14.8,
        "c": [
          135.5,
          34.71
        ],
        "z": 9,
        "p": 18,
        "b": 0,
        "f": [
          900,
          470
        ],
        "fp": [
          540,
          760
        ],
        "zp": -0.6
      },
      {
        "t": 16.4,
        "c": [
          135.51,
          34.72
        ],
        "z": 9.1,
        "p": 20,
        "b": 0,
        "f": [
          900,
          470
        ],
        "fp": [
          540,
          760
        ],
        "zp": -0.6
      },
      {
        "t": 17.8,
        "c": [
          135.7727,
          34.9671
        ],
        "z": 14.05,
        "p": 48,
        "b": -10,
        "f": [
          720,
          680
        ],
        "fp": [
          540,
          760
        ],
        "e": "out"
      },
      {
        "t": 21.6,
        "c": [
          135.7727,
          34.9671
        ],
        "z": 14.25,
        "p": 52,
        "b": -16,
        "f": [
          720,
          680
        ],
        "fp": [
          540,
          760
        ]
      },
      {
        "t": 22.4,
        "c": [
          135.7727,
          34.9671
        ],
        "z": 14.3,
        "p": 52,
        "b": -16,
        "f": [
          720,
          680
        ],
        "fp": [
          540,
          760
        ]
      },
      {
        "t": 23.2,
        "c": [
          135.7716,
          35.0088
        ],
        "z": 15.1,
        "p": 55,
        "b": 10,
        "f": [
          700,
          580
        ],
        "fp": [
          600,
          880
        ]
      },
      {
        "t": 33,
        "c": [
          135.7714,
          35.0076
        ],
        "z": 15.45,
        "p": 57,
        "b": 18,
        "f": [
          700,
          580
        ],
        "fp": [
          600,
          880
        ]
      },
      {
        "t": 36.6,
        "c": [
          135.7714,
          35.0076
        ],
        "z": 15.55,
        "p": 57,
        "b": 20,
        "f": [
          700,
          580
        ],
        "fp": [
          600,
          880
        ]
      },
      {
        "t": 37.4,
        "c": [
          135.8,
          34.835
        ],
        "z": 10.15,
        "p": 28,
        "b": 0,
        "f": [
          800,
          560
        ],
        "fp": [
          540,
          760
        ],
        "zp": -0.75
      },
      {
        "t": 39.2,
        "c": [
          135.8,
          34.825
        ],
        "z": 10.25,
        "p": 30,
        "b": 0,
        "f": [
          800,
          560
        ],
        "fp": [
          540,
          760
        ],
        "zp": -0.75
      },
      {
        "t": 40.6,
        "c": [
          135.8372,
          34.6852
        ],
        "z": 15.15,
        "p": 54,
        "b": -12,
        "f": [
          640,
          600
        ],
        "fp": [
          540,
          700
        ],
        "e": "out"
      },
      {
        "t": 44,
        "c": [
          135.8368,
          34.6853
        ],
        "z": 15.35,
        "p": 55,
        "b": -18,
        "f": [
          640,
          600
        ],
        "fp": [
          540,
          700
        ]
      },
      {
        "t": 44.8,
        "c": [
          135.787,
          34.709
        ],
        "z": 12.35,
        "p": 34,
        "b": 0,
        "f": [
          760,
          520
        ],
        "fp": [
          540,
          760
        ]
      },
      {
        "t": 46.6,
        "c": [
          135.787,
          34.7095
        ],
        "z": 12.45,
        "p": 36,
        "b": -4,
        "f": [
          760,
          520
        ],
        "fp": [
          540,
          760
        ]
      },
      {
        "t": 47.4,
        "c": [
          135.64,
          34.69
        ],
        "z": 10.55,
        "p": 25,
        "b": 0,
        "f": [
          800,
          600
        ],
        "fp": [
          540,
          760
        ],
        "zp": -0.75
      },
      {
        "t": 48.6,
        "c": [
          135.63,
          34.69
        ],
        "z": 10.65,
        "p": 26,
        "b": 0,
        "f": [
          800,
          600
        ],
        "fp": [
          540,
          760
        ],
        "zp": -0.75
      },
      {
        "t": 50,
        "c": [
          135.50125,
          34.66876
        ],
        "z": 15.6,
        "p": 58,
        "b": 28,
        "f": [
          640,
          620
        ],
        "fp": [
          540,
          700
        ],
        "e": "out"
      },
      {
        "t": 53.8,
        "c": [
          135.50125,
          34.669
        ],
        "z": 15.9,
        "p": 60,
        "b": 38,
        "f": [
          640,
          620
        ],
        "fp": [
          540,
          700
        ]
      },
      {
        "t": 55.2,
        "c": [
          135.56,
          34.72
        ],
        "z": 8.95,
        "p": 0,
        "b": 0,
        "f": [
          1420,
          540
        ],
        "fp": [
          500,
          1408
        ],
        "zp": -0.85,
        "e": "inOut"
      },
      {
        "t": 60,
        "c": [
          135.56,
          34.72
        ],
        "z": 8.9,
        "p": 0,
        "b": 0,
        "f": [
          1420,
          540
        ],
        "fp": [
          500,
          1408
        ],
        "zp": -0.85
      }
    ],
    "night": [
      {
        "t": 0,
        "v": 1
      },
      {
        "t": 3,
        "v": 1
      },
      {
        "t": 4,
        "v": 0
      },
      {
        "t": 32.8,
        "v": 0
      },
      {
        "t": 33.8,
        "v": 1
      },
      {
        "t": 36.6,
        "v": 1
      },
      {
        "t": 37.5,
        "v": 0
      },
      {
        "t": 47.6,
        "v": 0
      },
      {
        "t": 48.6,
        "v": 1
      },
      {
        "t": 54.6,
        "v": 1
      },
      {
        "t": 55.5,
        "v": 0
      }
    ],
    "clock": [
      {
        "t": 0,
        "time": "10:35"
      },
      {
        "t": 8,
        "time": "10:50"
      },
      {
        "t": 11.6,
        "time": "13:25"
      },
      {
        "t": 14,
        "time": "13:58"
      },
      {
        "t": 17.8,
        "time": "15:20"
      },
      {
        "t": 24,
        "time": "16:40"
      },
      {
        "t": 32.8,
        "time": "18:45"
      },
      {
        "t": 36.5,
        "time": "22:10"
      },
      {
        "t": 36.6,
        "time": "08:30"
      },
      {
        "t": 40.6,
        "time": "09:40"
      },
      {
        "t": 44,
        "time": "15:05"
      },
      {
        "t": 47.4,
        "time": "16:20"
      },
      {
        "t": 50,
        "time": "19:30"
      },
      {
        "t": 54.5,
        "time": "21:40"
      },
      {
        "t": 54.6,
        "time": "07:50"
      },
      {
        "t": 60,
        "time": "07:56"
      }
    ],
    "day": [
      {
        "t": 0,
        "n": 1
      },
      {
        "t": 36.6,
        "n": 2
      },
      {
        "t": 54.6,
        "n": 3
      }
    ],
    "dayCard": [
      {
        "t": 11.6,
        "n": 1,
        "dur": 2
      },
      {
        "t": 37,
        "n": 2,
        "dur": 2
      },
      {
        "t": 54.6,
        "n": 3,
        "dur": 1.4
      }
    ],
    "progress": [
      {
        "t": 0,
        "v": 0
      },
      {
        "t": 14.6,
        "v": 0
      },
      {
        "t": 16.6,
        "v": 1
      },
      {
        "t": 37.4,
        "v": 1
      },
      {
        "t": 39.4,
        "v": 2
      },
      {
        "t": 47,
        "v": 2
      },
      {
        "t": 49.6,
        "v": 3
      },
      {
        "t": 60,
        "v": 3
      }
    ],
    "routes": [
      {
        "id": "flight",
        "from": "pvg",
        "to": "kix",
        "style": "flight",
        "bend": 0.16,
        "t0": 8,
        "t1": 11.3,
        "tag": "MU 515 · 2H 05M",
        "follow": true
      },
      {
        "id": "haruka",
        "path": "haruka",
        "from": "kix",
        "to": "kyoto",
        "style": "rail",
        "t0": 14.6,
        "t1": 16.6,
        "tag": "JR HARUKA · 75 MIN"
      },
      {
        "id": "naraLine",
        "path": "naraLine",
        "from": "kyoto",
        "to": "jrNara",
        "style": "rail",
        "t0": 37.4,
        "t1": 39.4,
        "tag": "JR NARA LINE · 45 MIN"
      },
      {
        "id": "walk1",
        "path": "jrNaraToPark",
        "from": "jrNara",
        "to": "naraPark",
        "style": "walk",
        "t0": 39.4,
        "t1": 40.8
      },
      {
        "id": "walk2",
        "path": "parkToKintetsu",
        "from": "naraPark",
        "to": "kintetsuNara",
        "style": "walk",
        "t0": 44,
        "t1": 44.6
      },
      {
        "id": "kintetsu",
        "path": "kintetsuToSaidaiji",
        "from": "kintetsuNara",
        "to": "saidaiji",
        "style": "rail",
        "t0": 44.4,
        "t1": 45
      },
      {
        "id": "wrong",
        "path": "wrong",
        "from": "saidaiji",
        "to": "takanohara",
        "style": "wrong",
        "t0": 45,
        "t1": 46.2
      },
      {
        "id": "reroute",
        "path": "reroute",
        "from": "saidaiji",
        "to": "namba",
        "style": "rail",
        "t0": 47,
        "t1": 49.6,
        "tag": "KINTETSU NARA LINE · 40 MIN"
      },
      {
        "id": "walk3",
        "path": "nambaToDotonbori",
        "from": "namba",
        "to": "dotonbori",
        "style": "walk",
        "t0": 49.6,
        "t1": 50.4
      }
    ],
    "markers": [
      {
        "stop": "pvg",
        "t": 1
      },
      {
        "stop": "kix",
        "t": 1.5
      },
      {
        "stop": "kyoto",
        "t": 16.6
      },
      {
        "stop": "inari",
        "t": 18.4
      },
      {
        "stop": "kamo",
        "t": 24.4
      },
      {
        "stop": "jrNara",
        "t": 39.4
      },
      {
        "stop": "naraPark",
        "t": 40.8
      },
      {
        "stop": "kintetsuNara",
        "t": 44.4
      },
      {
        "stop": "saidaiji",
        "t": 45
      },
      {
        "stop": "takanohara",
        "t": 46.2
      },
      {
        "stop": "namba",
        "t": 49.6
      },
      {
        "stop": "dotonbori",
        "t": 50.4
      }
    ],
    "locTitle": [
      {
        "t": 18,
        "dur": 3,
        "cjk": "京都",
        "en": "KYOTO · FUSHIMI",
        "sub": "京都駅 → 伏見稲荷"
      },
      {
        "t": 24.4,
        "dur": 1,
        "cjk": "鴨川",
        "en": "KAMO RIVER",
        "sub": "三条大橋 · SANJO"
      },
      {
        "t": 40.8,
        "dur": 2.8,
        "cjk": "奈良",
        "en": "NARA PARK",
        "sub": "奈良公園 · 東大寺"
      },
      {
        "t": 50.2,
        "dur": 3,
        "cjk": "大阪",
        "en": "OSAKA · DOTONBORI",
        "sub": "道頓堀 · 戎橋"
      }
    ],
    "cards": [
      {
        "stop": "kix",
        "t": 12,
        "until": 15,
        "scene": "window",
        "caption": "KANSAI INTL. AIRPORT",
        "time": "13:25"
      },
      {
        "stop": "inari",
        "t": 18.6,
        "until": 24.4,
        "scene": "torii",
        "caption": "FUSHIMI INARI · SENBON TORII",
        "time": "15:55",
        "expand": {
          "t": 21,
          "hold": 2.2
        }
      },
      {
        "stop": "naraPark",
        "t": 41.2,
        "until": 44,
        "scene": "deer",
        "caption": "NARA PARK · TODAI-JI",
        "time": "09:52"
      },
      {
        "stop": "dotonbori",
        "t": 50.6,
        "until": 54,
        "scene": "neon",
        "caption": "DOTONBORI · EBISU BRIDGE",
        "time": "19:42",
        "portrait": true
      }
    ],
    "counter": [
      {
        "t": 12.8,
        "n": 1
      },
      {
        "t": 19.4,
        "n": 2
      },
      {
        "t": 42,
        "n": 3
      },
      {
        "t": 51.4,
        "n": 4
      }
    ],
    "stamps": [
      {
        "t": 13.2,
        "i": 0
      },
      {
        "t": 19.8,
        "i": 1
      },
      {
        "t": 42.4,
        "i": 2
      },
      {
        "t": 51.8,
        "i": 3
      }
    ],
    "chapter": [
      {
        "key": "river",
        "t": 24.4,
        "until": 33
      },
      {
        "key": "deer",
        "t": 40.8,
        "until": 44
      }
    ],
    "flashback": [
      {
        "t": 25.6,
        "until": 29.2,
        "scene": "kamo",
        "tag": "FLASHBACK · 方丈記 1212",
        "vtext": [
          "ゆく河の流れは",
          "絶えずして"
        ],
        "en": "The flowing river never ceases — and yet the water is never the same.",
        "caption": "Kamo River — Kamo no Chōmei, Hōjōki (1212)"
      }
    ],
    "compare": [
      {
        "t": 29.2,
        "until": 32.8,
        "scene": "kamo",
        "left": "POSTCARD · 1930s",
        "right": "REAL · 2026",
        "stamp": "10.01 · 17:40 JST"
      }
    ],
    "toast": [
      {
        "t": 34,
        "until": 36.4,
        "text": "TRAVEL NOTE · 1 NEW",
        "sub": "PONTOCHO · KAMO RIVER"
      }
    ],
    "note": [
      {
        "t": 34.4,
        "until": 36.6,
        "text": "Rain stopped at Sanjō.\n川の音だけが残る。",
        "sign": "@motion_atlas · 10.01"
      }
    ],
    "alert": [
      {
        "t": 45,
        "until": 47.6,
        "title": "WRONG TRAIN",
        "detail": "KINTETSU KYOTO LINE · boarded at Yamato-Saidaiji · heading north",
        "chip": "REROUTING"
      }
    ],
    "outro": {
      "t": 56,
      "stats": [
        {
          "value": 3,
          "label": "DAYS · 4 STOPS"
        },
        {
          "value": 4,
          "label": "STATION STAMPS"
        },
        {
          "value": 4,
          "prefix": "×",
          "label": "MIKAN SIGHTINGS"
        },
        {
          "value": 1,
          "label": "WRONG TRAIN"
        },
        {
          "value": 194,
          "suffix": " km",
          "label": "ON THE RAILS · +1,307 km IN THE AIR"
        }
      ],
      "fin": "関西周遊 — fin.",
      "credits": [
        "MUSIC · “Kansai Loop” · Motion Atlas",
        "TEXT · 鴨長明《方丈記》1212 · 公有领域"
      ]
    }
  },
  "sound": {
    "chords": {
      "night": [
        "B1",
        "F#2",
        "B2",
        "D3",
        "A3",
        "C#4"
      ],
      "home": [
        "D2",
        "A2",
        "D3",
        "F#3",
        "A3",
        "E4"
      ],
      "four": [
        "G1",
        "D2",
        "G2",
        "B2",
        "D3",
        "F#3",
        "A3"
      ],
      "five": [
        "A1",
        "E2",
        "A2",
        "C#3",
        "E3",
        "G3",
        "B3"
      ],
      "six": [
        "B1",
        "F#2",
        "A2",
        "D3",
        "E3",
        "A3"
      ],
      "dream": [
        "G2",
        "D3",
        "A3",
        "B3",
        "E4",
        "F#4"
      ]
    },
    "yo": [
      "D5",
      "E5",
      "G5",
      "A5",
      "B5",
      "D6",
      "E6"
    ],
    "station": [
      "A5",
      "D6",
      "E6",
      "A6"
    ]
  },
  "layout": {
    "landscape": {
      "margin": 64,
      "rule": {
        "y": 116,
        "x0": 64,
        "x1": 1856
      },
      "stepper": {
        "y": 952,
        "xs": [
          1292,
          1468,
          1644,
          1820
        ]
      },
      "stamps": {
        "y": 866,
        "r": 50
      },
      "card": {
        "x": 1032,
        "y": 212,
        "w": 824,
        "h": 464
      },
      "cardTall": {
        "x": 1416,
        "y": 200,
        "w": 440,
        "h": 516
      },
      "tray": "stepper",
      "avoid": [
        [
          0,
          0,
          1920,
          128
        ],
        [
          0,
          812,
          780,
          268
        ],
        [
          1220,
          800,
          700,
          280
        ],
        [
          1560,
          128,
          360,
          70
        ]
      ],
      "outroZone": [
        0,
        140,
        1130,
        820
      ]
    },
    "portrait": {
      "margin": 56,
      "rule": {
        "y": 264,
        "x0": 56,
        "x1": 1024
      },
      "stepper": {
        "y": 1778,
        "xs": [
          176,
          418,
          662,
          904
        ]
      },
      "stamps": {
        "r": 44,
        "xs": [
          980,
          980,
          980,
          980
        ],
        "ys": [
          486,
          590,
          694,
          798
        ]
      },
      "card": {
        "x": 56,
        "y": 940,
        "w": 968,
        "h": 544
      },
      "cardTall": {
        "x": 300,
        "y": 820,
        "w": 480,
        "h": 640
      },
      "tray": "top",
      "avoid": [
        [
          0,
          0,
          1080,
          276
        ],
        [
          0,
          1590,
          1080,
          330
        ],
        [
          620,
          276,
          460,
          92
        ],
        [
          924,
          430,
          156,
          420
        ]
      ],
      "outroZone": [
        0,
        300,
        1080,
        940
      ]
    }
  }
};
window.CONFIG = {
  "id": "film-grain",
  "duration": 7.5,
  "hold": 0,
  "segments": [
    {
      "from": 10.4,
      "to": 12.9,
      "plate": 10.4,
      "label": "地图上的颗粒",
      "layers": "map",
      "start": 0,
      "duration": 2.5
    },
    {
      "from": 13.5,
      "to": 16,
      "plate": null,
      "label": "照片颗粒",
      "layers": "map",
      "start": 2.5,
      "duration": 2.5
    },
    {
      "from": 27.56,
      "to": 30.06,
      "plate": null,
      "label": "插画颗粒",
      "layers": "map",
      "start": 5,
      "duration": 2.5
    }
  ],
  "markers": [
    {
      "t": 0,
      "label": "地图上的颗粒"
    },
    {
      "t": 2.5,
      "label": "照片颗粒"
    },
    {
      "t": 5,
      "label": "插画颗粒"
    }
  ],
  "anchors": {}
};
