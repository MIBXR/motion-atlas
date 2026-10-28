window.PATTERN_CONFIG = {
  "title": "可复现的胶片颗粒与暗角",
  "orients": [
    "landscape",
    "portrait"
  ],
  "segments": [
    {
      "caseId": "map-pilgrimage",
      "label": "地图巡礼",
      "source": "original.html",
      "from": 0,
      "to": 7.5,
      "legacy": true
    },
    {
      "caseId": "mg-bauhaus",
      "label": "几何包豪斯",
      "source": "sources/mg-bauhaus/index.html",
      "audio": "sources/mg-bauhaus/audio/film.m4a",
      "from": 0,
      "to": 10
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
    },
    {
      "t": 7.5,
      "label": "几何包豪斯"
    }
  ],
  "reduced": 1.2
};
