  let liveCameras = [], liveCameraOrient = null, liveReady = false, liveWait = null;

  function mercatorFrame(points, inset, reference = null) {
    const projected = points.map(merc);
    const xs = projected.map(point => point[0]), ys = projected.map(point => point[1]);
    const x0 = Math.min(...xs), x1 = Math.max(...xs), y0 = Math.min(...ys), y1 = Math.max(...ys);
    const focus = reference ? reference.focus.slice() : [W / 2, H / 2];
    const width = 2 * Math.min(focus[0] - W * inset, W * (1 - inset) - focus[0]);
    const height = 2 * Math.min(focus[1] - H * inset, H * (1 - inset) - focus[1]);
    return {
      center: unmerc([(x0 + x1) / 2, (y0 + y1) / 2]),
      zoom: Math.log2(Math.min(width / ((x1 - x0) * 512), height / ((y1 - y0) * 512))),
      bearing: 0, pitch: 0, focus,
      padding: reference ? { ...reference.padding } : { left: 0, right: 0, top: 0, bottom: 0 },
    };
  }

  function insideFrame(points, inset) {
    return points.every(point => {
      const p = project(point);
      return p.x >= W * inset && p.x <= W * (1 - inset) && p.y >= H * inset && p.y <= H * (1 - inset);
    });
  }

  function projectedFrame(camera, points, inset) {
    applyCamera(camera);
    if (insideFrame(points, inset)) return camera;
    let low = 0, high = camera.zoom;
    for (let iteration = 0; iteration < 24; iteration++) {
      camera.zoom = (low + high) / 2;
      applyCamera(camera);
      if (insideFrame(points, inset)) low = camera.zoom;
      else high = camera.zoom;
    }
    camera.zoom = low;
    return camera;
  }

  function configureLiveCameras() {
    MAP.map.resize();
    if (PC.id === 'route-draw-marker') {
      const thirdPoints = [S.jrNara.lngLat, S.naraPark.lngLat];
      const third = mercatorFrame(thirdPoints, .2);
      third.center = [0, 1].map(axis => (thirdPoints[0][axis] + thirdPoints[1][axis]) / 2);
      projectedFrame(third, thirdPoints, .2);
      third.zoom = Math.max(13, third.zoom);
      liveCameras = [
        projectedFrame(mercatorFrame([S.kix.lngLat, S.kyoto.lngLat], .12), [S.kix.lngLat, S.kyoto.lngLat], .12),
        projectedFrame(mercatorFrame([S.kyoto.lngLat, S.jrNara.lngLat], .12), [S.kyoto.lngLat, S.jrNara.lngLat], .12),
        third,
      ];
    } else if (PC.id === 'alert-reroute') {
      const original = cameraAt(46.475, O);
      const points = [...R.wrong.pts, ...R.reroute.pts];
      applyCamera(original);
      if (insideFrame(points, .08)) liveCameras = [original];
      else {
        const camera = { ...original, center: mercatorFrame(points, .15, original).center };
        let low = 0, high = original.zoom;
        for (let iteration = 0; iteration < 24; iteration++) {
          camera.zoom = (low + high) / 2;
          applyCamera(camera);
          if (insideFrame(points, .15)) low = camera.zoom;
          else high = camera.zoom;
        }
        camera.zoom = low;
        liveCameras = [camera];
      }
    } else liveCameras = [cameraAt(34.5, O)];
    liveCameraOrient = O;
    G.leader.classList.add('pattern-off'); G.leaderCap.classList.add('pattern-off');
    if (PC.id === 'route-draw-marker') {
      G.heads.filter(Boolean).forEach(head => op(head, 0));
      const selected = new Set(PC.actions.filter(action => action.stop).map(action => action.stop));
      markerEls.forEach((marker, i) => {
        marker.el.classList.toggle('pattern-off', !selected.has(marker.m.stop));
        G.nodes[i].g.classList.toggle('pattern-off', !selected.has(marker.m.stop));
      });
      el.veil.classList.remove('pattern-off');
      $('.veil-tag', el.veil).classList.add('pattern-off');
      sty(el.veil, 'z-index', '14');
    }
  }

  function liveCameraAt(t) {
    return liveCameras[PC.id === 'route-draw-marker' ? t < 3.8 ? 0 : t < 7 ? 1 : 2 : 0];
  }

  function cameraNeedsApply(camera) {
    const map = MAP.map, center = map.getCenter(), padding = map.getPadding();
    const focus = [(W + padding.left - padding.right) / 2, (H + padding.top - padding.bottom) / 2];
    const current = `${center.lng.toFixed(7)},${center.lat.toFixed(7)},${map.getZoom().toFixed(4)},${map.getPitch().toFixed(3)},${map.getBearing().toFixed(3)},${focus[0].toFixed(1)},${focus[1].toFixed(1)}`;
    const target = `${camera.center[0].toFixed(7)},${camera.center[1].toFixed(7)},${camera.zoom.toFixed(4)},${camera.pitch.toFixed(3)},${camera.bearing.toFixed(3)},${camera.focus[0].toFixed(1)},${camera.focus[1].toFixed(1)}`;
    return current !== target;
  }

  function settleLiveMap() {
    if (!liveWait) liveWait = (async () => {
      const map = MAP.map;
      await nextRender(map);
      const loaded = await tilesSettled(map, 20000);
      let idle = false;
      const markIdle = () => { idle = true; };
      map.once('idle', markIdle);
      await waitIdle(map, 4000);
      map.off('idle', markIdle);
      if (!loaded || !idle || !map.areTilesLoaded() || !map.loaded()) throw new Error('Fixed map did not reach idle with visible tiles loaded');
    })().finally(() => { liveWait = null; });
    return liveWait;
  }

  function paintLiveMap(night) {
    const n2 = Math.round(night * 200) / 200;
    for (const layer of mapLayers) setPaint(layer.id, layer.prop, css(dayNight(MP[layer.key][0], MP[layer.key][1], n2)));
    setPaint('hillshade', 'hillshade-shadow-color', css(dayNight(MP.shade[0], MP.shade[1], n2), lerp(.55, .75, n2)));
    setPaint('hillshade', 'hillshade-highlight-color', css(dayNight(MP.light[0], MP.light[1], n2), lerp(.55, .12, n2)));
    setPaint('hillshade', 'hillshade-accent-color', css(dayNight(MP.shade[0], MP.shade[1], n2), .25));
    sty(el.map, 'background', css(mix(PAL.paper, PAL.nightPaper, night)));
  }

  function routeStrokeWidth(route, zoom) {
    const map = MAP.map, sid = 'rt-' + route.id;
    const ids = route.style === 'rail' || route.style === 'wrong' ? [sid + '-glow', sid + '-casing', sid] : [sid + '-casing', sid];
    return Math.max(...ids.filter(id => map.getLayoutProperty(id, 'visibility') !== 'none' && map.getPaintProperty(id, 'line-opacity') > 0).map(id => {
      const width = map.getPaintProperty(id, 'line-width');
      return typeof width === 'number' ? width : lerp(width[4], width[6], clamp((zoom - width[3]) / (width[5] - width[3])));
    }));
  }

  function routeHitsLabel(a, b, box, radius) {
    let low = 0, high = 1;
    for (const axis of ['x', 'y']) {
      const delta = b[axis] - a[axis], min = box[axis + '0'], max = box[axis + '1'];
      if (delta === 0) { if (a[axis] < min || a[axis] > max) { low = 1; high = 0; break; } }
      else {
        const u = (min - a[axis]) / delta, v = (max - a[axis]) / delta;
        low = Math.max(low, Math.min(u, v)); high = Math.min(high, Math.max(u, v));
      }
    }
    if (low <= high) return true;
    const pointBox = p => Math.hypot(p.x - clamp(p.x, box.x0, box.x1), p.y - clamp(p.y, box.y0, box.y1));
    if (Math.min(pointBox(a), pointBox(b)) <= radius) return true;
    const dx = b.x - a.x, dy = b.y - a.y, length2 = dx * dx + dy * dy;
    return [box.x0, box.x1].some(x => [box.y0, box.y1].some(y => {
      const k = length2 ? clamp(((x - a.x) * dx + (y - a.y) * dy) / length2) : 0;
      return Math.hypot(x - a.x - dx * k, y - a.y - dy * k) <= radius;
    }));
  }

  function placeRouteLabels(t, visibleRoutes) {
    const labels = markerEls.filter(me => me.box && !me.el.classList.contains('pattern-off'));
    const nodes = markerEls.map((me, i) => ({ me, nd: G.nodes[i] })).filter(({ me, nd }) => !nd.g.classList.contains('pattern-off') && Number(cache(nd.g)['s:opacity']) > .001).map(({ me, nd }) => {
      const k = seg(t, me.m.t, .45, ease.outBack), scale = .6 + .4 * clamp(k, 0, 1.25);
      const circles = [nd.ring, nd.p1, nd.p2].filter(circle => circle === nd.ring || Number(cache(circle)['s:opacity']) > .001);
      return { me, ...project(me.s.lngLat), radius: scale * Math.max(...circles.map(circle => Number(circle.getAttribute('r')) + (circle === nd.ring ? me.s.node ? 1.25 : 1.5 : 1))) };
    });
    const debug = P.render ? { referenceT: t, orient: O, width: W, height: H, candidateIndexBase: 0, routes: visibleRoutes.map((route, index) => ({ index, width: route.width, points: route.points })), labels: [] } : null;
    const collisions = (me, box) => ({
      stage: box.x0 < 16 || box.x1 > W - 16 || box.y0 < 16 || box.y1 > H - 16,
      labels: labels.filter(other => other !== me && hitRect(box, { x: other.box.x0, y: other.box.y0, w: other.box.x1 - other.box.x0, h: other.box.y1 - other.box.y0 }, 6)).map(other => other.m.stop),
      markers: nodes.filter(node => node.me !== me && Math.hypot(node.x - clamp(node.x, box.x0, box.x1), node.y - clamp(node.y, box.y0, box.y1)) <= node.radius).map(node => ({ stop: node.me.m.stop, x: node.x, y: node.y, radius: node.radius })),
      routes: visibleRoutes.map((route, index) => ({ index, width: route.width, segments: route.points.slice(1).flatMap((point, i) => routeHitsLabel(route.points[i], point, box, route.width / 2 + 4) ? [i] : []) })).filter(route => route.segments.length),
    });
    for (const me of labels) {
      const q = project(me.s.lngLat), s = me.s;
      const gap = (s.node ? 6 : por() ? 12 : 10) + 10;
      const wLab = me.fullW || me.el.offsetWidth || 200, hLab = me.el.offsetHeight || 40;
      const tryBox = (side, dy) => { const x0 = side > 0 ? q.x + gap : side < 0 ? q.x - gap - wLab : q.x - wLab / 2; return { x0, x1: x0 + wLab, y0: q.y - hLab / 2 + dy, y1: q.y + hLab / 2 + dy, side }; };
      const pf0 = por() && s.sideP !== undefined ? s.sideP : me.pref, pf = pf0 || 1, vy = hLab / 2 + gap + 4;
      const order = [[pf, 0], [-pf, 0], [0, vy + hLab / 2], [0, -vy - hLab / 2], [pf, hLab + 6], [-pf, hLab + 6], [pf, -hLab - 6], [-pf, -hLab - 6]];
      if (pf0 === 0) order.unshift(order.splice(2, 1)[0]);
      const bad = box => box.x0 < 16 || box.x1 > W - 16 || box.y0 < 16 || box.y1 > H - 16 ||
        labels.some(other => other !== me && hitRect(box, { x: other.box.x0, y: other.box.y0, w: other.box.x1 - other.box.x0, h: other.box.y1 - other.box.y0 }, 6)) ||
        nodes.some(node => node.me !== me && Math.hypot(node.x - clamp(node.x, box.x0, box.x1), node.y - clamp(node.y, box.y0, box.y1)) <= node.radius) ||
        visibleRoutes.some(route => route.points.slice(1).some((point, i) => routeHitsLabel(route.points[i], point, box, route.width / 2 + 4)));
      const candidates = order.map(([side, dy]) => tryBox(side, dy));
      const selectedIndex = candidates.findIndex(candidate => !bad(candidate));
      const box = candidates[selectedIndex];
      if (debug) {
        const sourceIndex = candidates.findIndex(candidate => candidate.x0 === me.box.x0 && candidate.y0 === me.box.y0 && candidate.side === me.box.side);
        const index = box ? selectedIndex : sourceIndex;
        debug.labels.push({ stop: me.m.stop, sourceCandidateIndex: sourceIndex, sourceRect: { ...me.box }, selectedCandidateIndex: index, fallback: !box, side: (box || me.box).side, dy: index < 0 ? null : order[index][1], rect: { ...(box || me.box) }, candidates: candidates.map((candidate, index) => ({ index, side: candidate.side, dy: order[index][1], rect: candidate, collisions: collisions(me, candidate) })) });
      }
      if (!box) continue;
      me.box = box;
      sty(me.el, 'transform', `translate(${Math.round(box.x0)}px, ${Math.round(box.y0)}px)`);
      me.el.classList.toggle('is-left', box.side < 0);
    }
    G.placed = labels.map(me => ({ x: me.box.x0, y: me.box.y0, w: me.box.x1 - me.box.x0, h: me.box.y1 - me.box.y0 }));
    if (debug) {
      debug.labels.forEach(label => { label.finalCollisions = collisions(markerEls.find(me => me.m.stop === label.stop), label.rect); });
      window.__routeLabelDiagnostics = debug;
    }
  }

  function drawRouteActions(t, camera, accent) {
    const savedRoutes = routes.slice(), savedHeads = G.heads;
    const visibleRoutes = [];
    for (const action of PC.actions.filter(action => action.route)) {
      const route = R[action.route], index = savedRoutes.indexOf(route);
      const completed = t >= action.at + action.to - action.from;
      const caseT = t < action.at ? action.from - 1 : completed && route.style === 'rail' ? route.t1 + 1 : action.from + clamp(t - action.at, 0, action.to - action.from);
      routes.splice(0, routes.length, route); G.heads = [savedHeads[index]];
      updateRoutesGL(caseT, 0, accent, 0);
      drawRoutesSVG(caseT, camera, 1, accent);
      const progress = routeP(route, caseT), width = routeStrokeWidth(route, camera.zoom);
      if (progress > 0 && width > 0) visibleRoutes.push({ points: partial(route, progress).map(project), width });
    }
    routes.splice(0, routes.length, ...savedRoutes); G.heads = savedHeads;
    const referenceT = 41.65;
    const starts = markerEls.map(marker => marker.m.t);
    markerEls.forEach(marker => {
      const action = PC.actions.find(action => action.stop === marker.m.stop);
      marker.m.t = action && t >= action.at ? referenceT - clamp(t - action.at, 0, .85) : referenceT + 1;
    });
    drawPatternMarkers(referenceT, camera, 1, null);
    placeRouteLabels(referenceT, visibleRoutes);
    markerEls.forEach((marker, i) => { marker.m.t = starts[i]; });
    const fade = Math.max(0, 1 - Math.abs(t - 3.8) / .2, 1 - Math.abs(t - 7) / .2);
    el.veil.classList.remove('pattern-off');
    op(el.veil, fade);
  }

  function renderLive(t) {
    O = stage.orient;
    if (!MAP.ok) return drawPattern(PC.id === 'day-night-flip' ? 34.5 : PC.id === 'alert-reroute' ? 44.8 : t, { geo: false });
    const reoriented = liveCameraOrient !== O;
    if (reoriented) configureLiveCameras();
    const camera = liveCameraAt(t), changed = cameraNeedsApply(camera);
    if (changed || reoriented) applyCamera(camera);
    if (PC.id === 'route-draw-marker') {
      const result = drawPattern(t, { cam: camera, night: 0, geo: false });
      paintLiveMap(0);
      drawRouteActions(t, camera, result.accent);
    } else if (PC.id === 'day-night-flip') {
      const caseT = t < 4.5 ? 31.3 + t : 36.6 + t - 4.5;
      const night = valueAt(T.night, caseT);
      drawPattern(caseT, { cam: camera, night, hudT: caseT, grainT: caseT, geo: false });
      paintLiveMap(night);
    } else {
      const caseT = 44.8 + clamp(t, 0, 5.5);
      const result = drawPattern(caseT, { cam: camera, geo: false });
      paintLiveMap(result.night);
      updateRoutesGL(caseT, result.night, result.accent, result.over);
      drawRoutesSVG(caseT, camera, 1 - result.over, result.accent);
      drawPatternMarkers(caseT, camera, 1 - result.over, null);
    }
    drawPatternAttribution(t);
    if (liveReady && (P.render || changed || reoriented)) return settleLiveMap();
    return null;
  }

  async function initPatternMap() {
    await initMap();
    routes.forEach(route => setVis(route, false));
    configureLiveCameras();
    for (const camera of liveCameras) {
      applyCamera(camera);
      await settleLiveMap();
    }
    liveReady = true;
    await renderLive(tl.time);
    await settleLiveMap();
  }
