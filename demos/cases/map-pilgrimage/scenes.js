/*
 * 程序化“照片”：在没有真实素材时为卡片、全屏、回忆与对比生成原创画面。
 * paintScene(kind, style, w, h, seed) → canvas
 *   kind:  lake（湖与塔·清晨）| canal（水巷与石桥·白天）| skyline（江岸天际线·夜）| rail（车窗·运动模糊）
 *   style: photo（实拍感）| postcard（旧明信片）| illustration（动画回忆感）
 * 换成真实照片：在 config.js 的 stop.media / card.media 填图片路径即可，不需要本文件。
 */
(function (global) {
  'use strict';

  const lerp = (a, b, t) => a + (b - a) * t;

  function rng(seed) {
    let a = seed >>> 0;
    return () => {
      a = (a + 0x6d2b79f5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  // 一维值噪声 + 分形叠加，用于山脊线
  function ridge(r, octaves = 4) {
    const tables = Array.from({ length: octaves }, () => Array.from({ length: 64 }, r));
    return (x) => {
      let v = 0, amp = 1, freq = 1, norm = 0;
      for (let o = 0; o < octaves; o++) {
        const xx = x * freq * 8;
        const i = Math.floor(xx), f = xx - i;
        const s = f * f * (3 - 2 * f);
        const tb = tables[o];
        v += amp * (tb[i & 63] * (1 - s) + tb[(i + 1) & 63] * s);
        norm += amp;
        amp *= 0.5;
        freq *= 2;
      }
      return v / norm;
    };
  }

  const grad = (ctx, x0, y0, x1, y1, stops) => {
    const g = ctx.createLinearGradient(x0, y0, x1, y1);
    stops.forEach(([o, c]) => g.addColorStop(o, c));
    return g;
  };

  function hills(ctx, w, h, r, base, amp, color, rough = 4) {
    const n = ridge(r, rough);
    ctx.beginPath();
    ctx.moveTo(0, h);
    for (let x = 0; x <= w; x += 4) ctx.lineTo(x, base - n(x / w) * amp);
    ctx.lineTo(w, h);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  function pagoda(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    const tiers = 5;
    for (let i = 0; i < tiers; i++) {
      const tw = s * (1 - i * 0.13), th = s * 0.2;
      const ty = y - i * th * 1.25;
      ctx.fillRect(x - tw * 0.32, ty - th, tw * 0.64, th);
      ctx.beginPath();
      ctx.moveTo(x - tw * 0.55, ty - th);
      ctx.quadraticCurveTo(x, ty - th * 1.45, x + tw * 0.55, ty - th);
      ctx.lineTo(x + tw * 0.4, ty - th * 1.1);
      ctx.lineTo(x - tw * 0.4, ty - th * 1.1);
      ctx.fill();
    }
    ctx.fillRect(x - s * 0.02, y - tiers * s * 0.25 - s * 0.35, s * 0.04, s * 0.35);
  }

  function willow(ctx, x, y, s, color, r) {
    ctx.fillStyle = color;
    ctx.fillRect(x - s * 0.03, y - s, s * 0.06, s);
    for (let i = 0; i < 26; i++) {
      const a = r() * Math.PI * 2, d = r() * s * 0.45;
      ctx.beginPath();
      ctx.ellipse(x + Math.cos(a) * d, y - s + Math.sin(a) * d * 0.6, s * 0.18, s * 0.28, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function reflect(ctx, w, h, top, alpha = 0.55) {
    // 将水平线以上的画面翻转到水面，叠加横向波纹
    const src = ctx.getImageData(0, Math.max(0, top - (h - top)), w, h - top);
    const tmp = document.createElement('canvas');
    tmp.width = w; tmp.height = h - top;
    tmp.getContext('2d').putImageData(src, 0, 0);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(0, h);
    ctx.scale(1, -1);
    const bands = 40, bh = (h - top) / bands;
    for (let i = 0; i < bands; i++) {
      const off = Math.sin(i * 1.7) * 6 * (i / bands);
      ctx.drawImage(tmp, 0, i * bh, w, bh, off, i * bh, w, bh + 1);
    }
    ctx.restore();
  }

  const SCENES = {
    lake(ctx, w, h, r) {
      const horizon = h * 0.58;
      ctx.fillStyle = grad(ctx, 0, 0, 0, horizon, [[0, '#8ea9bf'], [0.55, '#d7d3cc'], [1, '#f2d4b6']]);
      ctx.fillRect(0, 0, w, horizon);
      const sun = ctx.createRadialGradient(w * 0.68, horizon * 0.82, 0, w * 0.68, horizon * 0.82, w * 0.35);
      sun.addColorStop(0, 'rgba(255,236,206,.95)');
      sun.addColorStop(1, 'rgba(255,236,206,0)');
      ctx.fillStyle = sun;
      ctx.fillRect(0, 0, w, horizon);
      hills(ctx, w, horizon + 2, r, horizon - h * 0.08, h * 0.16, '#a6b2bb', 3);
      hills(ctx, w, horizon + 2, r, horizon - h * 0.02, h * 0.12, '#8b98a1', 4);
      pagoda(ctx, w * 0.27, horizon - h * 0.115, h * 0.16, '#5f6a72');
      hills(ctx, w, horizon + 2, r, horizon + h * 0.01, h * 0.05, '#6f7b80', 5);
      // 苏堤：一条低平的堤与柳树
      ctx.fillStyle = '#5b6662';
      ctx.fillRect(w * 0.45, horizon - 3, w * 0.55, 6);
      for (let i = 0; i < 9; i++) willow(ctx, w * (0.5 + i * 0.06), horizon, h * (0.07 + r() * 0.03), '#55625a', r);
      ctx.fillStyle = grad(ctx, 0, horizon, 0, h, [[0, '#cdbfae'], [1, '#6f8090']]);
      ctx.fillRect(0, horizon, w, h - horizon);
      reflect(ctx, w, h, horizon, 0.45);
      ctx.strokeStyle = 'rgba(255,240,220,.35)';
      for (let i = 0; i < 70; i++) {
        const y = horizon + r() * (h - horizon), x = r() * w, l = 20 + r() * 80;
        ctx.lineWidth = 1 + r() * 1.5;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke();
      }
      // 小船
      ctx.fillStyle = '#2c3438';
      ctx.beginPath();
      ctx.moveTo(w * 0.36, h * 0.74); ctx.quadraticCurveTo(w * 0.4, h * 0.77, w * 0.46, h * 0.74);
      ctx.lineTo(w * 0.44, h * 0.755); ctx.lineTo(w * 0.38, h * 0.755); ctx.fill();
      ctx.fillRect(w * 0.41, h * 0.7, 3, h * 0.04);
    },
    canal(ctx, w, h, r) {
      // 一点透视的水巷：两岸白墙黛瓦收向消失点，中景一座石拱桥
      const vx = w * 0.5, horizon = h * 0.47;
      ctx.fillStyle = grad(ctx, 0, 0, 0, horizon, [[0, '#86afcf'], [0.7, '#d6e3ea'], [1, '#eef1ec']]);
      ctx.fillRect(0, 0, w, horizon + 2);
      // 远处树冠
      ctx.fillStyle = '#7f9488';
      for (let i = 0; i < 40; i++) {
        ctx.beginPath();
        ctx.ellipse(w * (0.36 + r() * 0.28), horizon - r() * h * 0.03, 14 + r() * 26, 8 + r() * 12, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      // 水面
      ctx.fillStyle = grad(ctx, 0, horizon, 0, h, [[0, '#a9c0b8'], [0.5, '#6f8e86'], [1, '#3f5a56']]);
      ctx.fillRect(0, horizon, w, h - horizon);
      const P = (z) => Math.pow(z, 0.62); // 深度压缩
      const bank = (dir) => {
        const X = (z) => vx + dir * lerp(w * 0.62, w * 0.075, P(z)); // 岸线 x
        const B = (z) => lerp(h * 0.86, horizon + h * 0.012, P(z)); // 墙脚 y
        const Hh = (z) => lerp(h * 0.62, h * 0.05, P(z)); // 墙高
        const cuts = [0, 0.13, 0.25, 0.36, 0.46, 0.55, 0.63, 0.7, 0.77, 0.83, 0.88, 0.93, 0.97, 1];
        for (let i = cuts.length - 2; i >= 0; i--) {
          const z0 = cuts[i], z1 = cuts[i + 1];
          const x0 = X(z0), x1 = X(z1), b0 = B(z0), b1 = B(z1), t0 = b0 - Hh(z0), t1 = b1 - Hh(z1);
          const lift = (i % 3 === 0 ? 0.1 : i % 3 === 1 ? 0.04 : 0.07);
          // 倒影
          ctx.fillStyle = 'rgba(235,236,230,.28)';
          ctx.beginPath(); ctx.moveTo(x0, b0); ctx.lineTo(x1, b1); ctx.lineTo(x1, b1 + (b1 - t1) * 0.55); ctx.lineTo(x0, b0 + (b0 - t0) * 0.55); ctx.fill();
          // 白墙
          ctx.fillStyle = `hsl(40, 16%, ${92 - (1 - z0) * 6}%)`;
          ctx.beginPath(); ctx.moveTo(x0, b0); ctx.lineTo(x0, t0 - Hh(z0) * lift); ctx.lineTo(x1, t1 - Hh(z1) * lift); ctx.lineTo(x1, b1); ctx.fill();
          // 墙脚水渍
          ctx.fillStyle = 'rgba(90,96,90,.35)';
          ctx.beginPath(); ctx.moveTo(x0, b0); ctx.lineTo(x0, b0 - Hh(z0) * 0.12); ctx.lineTo(x1, b1 - Hh(z1) * 0.12); ctx.lineTo(x1, b1); ctx.fill();
          // 黛瓦屋檐
          const ry0 = t0 - Hh(z0) * lift, ry1 = t1 - Hh(z1) * lift, th0 = Hh(z0) * 0.07 + 2, th1 = Hh(z1) * 0.07 + 2;
          ctx.fillStyle = '#2b3034';
          ctx.beginPath(); ctx.moveTo(x0 + dir * th0 * 0.6, ry0 + th0 * 0.2); ctx.lineTo(x0 - dir * th0 * 0.2, ry0 - th0); ctx.lineTo(x1 - dir * th1 * 0.2, ry1 - th1); ctx.lineTo(x1 + dir * th1 * 0.6, ry1 + th1 * 0.2); ctx.fill();
          // 马头墙：近端竖起的阶梯山墙
          if (i % 2 === 0) {
            const gw = Math.abs(x1 - x0) * 0.16 + 3, gh = Hh(z0) * 0.16;
            ctx.fillStyle = `hsl(40, 16%, ${94 - (1 - z0) * 5}%)`;
            ctx.fillRect(Math.min(x0, x0 - dir * gw), ry0 - gh, gw, gh + 2);
            ctx.fillStyle = '#2b3034';
            ctx.fillRect(Math.min(x0, x0 - dir * gw) - 2, ry0 - gh - th0 * 0.6, gw + 4, th0 * 0.6);
          }
          // 窗与灯笼
          const mx = lerp(x0, x1, 0.45), my = lerp(b0, b1, 0.45) - Hh(lerp(z0, z1, 0.45)) * 0.52, ww = Math.abs(x1 - x0) * 0.18, wh = Hh(lerp(z0, z1, 0.45)) * 0.2;
          ctx.fillStyle = '#3a4146';
          ctx.fillRect(mx - ww / 2, my - wh / 2, ww, wh);
          if (r() > 0.45) {
            const lx = lerp(x0, x1, 0.82), ly = lerp(t0, t1, 0.82) + Hh(lerp(z0, z1, 0.82)) * 0.18, lr = Hh(lerp(z0, z1, 0.82)) * 0.045 + 1.5;
            ctx.fillStyle = '#c9452e';
            ctx.beginPath(); ctx.ellipse(lx, ly, lr, lr * 1.35, 0, 0, Math.PI * 2); ctx.fill();
          }
        }
      };
      bank(-1); bank(1);
      // 石拱桥（中景）
      const bz = 0.62, by = lerp(h * 0.86, horizon + h * 0.012, Math.pow(bz, 0.62)), half = lerp(w * 0.62, w * 0.075, Math.pow(bz, 0.62));
      ctx.fillStyle = '#9a978e';
      ctx.beginPath();
      ctx.moveTo(vx - half - 20, by - h * 0.012);
      ctx.quadraticCurveTo(vx, by - h * 0.085, vx + half + 20, by - h * 0.012);
      ctx.lineTo(vx + half + 20, by + h * 0.004);
      ctx.lineTo(vx + half * 0.72, by + h * 0.004);
      ctx.quadraticCurveTo(vx, by - h * 0.07, vx - half * 0.72, by + h * 0.004);
      ctx.lineTo(vx - half - 20, by + h * 0.004);
      ctx.fill();
      ctx.strokeStyle = 'rgba(154,151,142,.35)'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(vx - half * 0.72, by + 8); ctx.quadraticCurveTo(vx, by + h * 0.06, vx + half * 0.72, by + 8); ctx.stroke();
      // 水面高光
      ctx.strokeStyle = 'rgba(255,255,250,.28)';
      for (let i = 0; i < 60; i++) {
        const y = horizon + h * 0.04 + r() * (h * 0.55), x = vx + (r() - 0.5) * w * 0.7 * ((y - horizon) / (h - horizon)), l = 10 + r() * 50;
        ctx.lineWidth = 1 + r() * 2;
        ctx.beginPath(); ctx.moveTo(x, y); ctx.lineTo(x + l, y); ctx.stroke();
      }
      // 乌篷船
      ctx.fillStyle = '#232a2c';
      ctx.beginPath(); ctx.moveTo(w * 0.42, h * 0.8); ctx.quadraticCurveTo(w * 0.5, h * 0.84, w * 0.6, h * 0.79); ctx.lineTo(w * 0.57, h * 0.815); ctx.lineTo(w * 0.45, h * 0.82); ctx.fill();
      ctx.beginPath(); ctx.ellipse(w * 0.51, h * 0.795, w * 0.045, h * 0.03, 0, Math.PI, 0); ctx.fill();
    },
    skyline(ctx, w, h, r) {
      const horizon = h * 0.64;
      ctx.fillStyle = grad(ctx, 0, 0, 0, horizon, [[0, '#070b16'], [0.7, '#1b2238'], [1, '#3a3346']]);
      ctx.fillRect(0, 0, w, horizon);
      for (let i = 0; i < 90; i++) {
        ctx.fillStyle = `rgba(255,255,255,${r() * 0.5})`;
        ctx.fillRect(r() * w, r() * horizon * 0.6, 1.5, 1.5);
      }
      let x = 0;
      while (x < w) {
        const bw = 30 + r() * 90, bh = h * (0.08 + r() * 0.32);
        ctx.fillStyle = '#0c1020';
        ctx.fillRect(x, horizon - bh, bw, bh);
        for (let wy = horizon - bh + 8; wy < horizon - 6; wy += 10) {
          for (let wx = x + 5; wx < x + bw - 6; wx += 9) {
            if (r() > 0.62) { ctx.fillStyle = r() > 0.8 ? '#ffd28a' : '#9fc4ff'; ctx.fillRect(wx, wy, 4, 5); }
          }
        }
        x += bw + 2;
      }
      // 抽象电视塔：塔身与两颗球
      const tx = w * 0.62;
      ctx.strokeStyle = '#d9406a'; ctx.lineWidth = 6;
      ctx.beginPath(); ctx.moveTo(tx, horizon); ctx.lineTo(tx, horizon - h * 0.56); ctx.stroke();
      [[0.24, 34], [0.42, 22]].forEach(([k, rad]) => {
        const g = ctx.createRadialGradient(tx, horizon - h * k, 2, tx, horizon - h * k, rad * 2.4);
        g.addColorStop(0, '#ff8ab0'); g.addColorStop(0.4, '#d9406a'); g.addColorStop(1, 'rgba(217,64,106,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(tx, horizon - h * k, rad * 2.4, 0, Math.PI * 2); ctx.fill();
      });
      ctx.fillStyle = grad(ctx, 0, horizon, 0, h, [[0, '#141a2c'], [1, '#05070d']]);
      ctx.fillRect(0, horizon, w, h - horizon);
      reflect(ctx, w, h, horizon, 0.5);
      for (let i = 0; i < 40; i++) {
        const bx = r() * w, by = h * (0.7 + r() * 0.3), br = 8 + r() * 30;
        const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
        g.addColorStop(0, `rgba(255,${180 + r() * 60},${120 + r() * 100},.35)`);
        g.addColorStop(1, 'rgba(255,200,150,0)');
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(bx, by, br, 0, Math.PI * 2); ctx.fill();
      }
    },
    rail(ctx, w, h, r) {
      ctx.fillStyle = grad(ctx, 0, 0, 0, h, [[0, '#cfe0ea'], [0.45, '#eef0e6'], [0.5, '#9fb27a'], [1, '#5f7444']]);
      ctx.fillRect(0, 0, w, h);
      for (let i = 0; i < 160; i++) {
        const y = h * (0.45 + r() * 0.55), l = 80 + r() * 400;
        ctx.strokeStyle = `rgba(${60 + r() * 60},${80 + r() * 60},${40 + r() * 30},${0.2 + r() * 0.3})`;
        ctx.lineWidth = 1 + r() * 6;
        ctx.beginPath(); ctx.moveTo(r() * w, y); ctx.lineTo(r() * w + l, y); ctx.stroke();
      }
      ctx.fillStyle = '#1d2226';
      ctx.fillRect(0, 0, w, h * 0.08); ctx.fillRect(0, h * 0.92, w, h * 0.08);
    },
  };

  function grain(ctx, w, h, r, amount) {
    const img = ctx.getImageData(0, 0, w, h), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const n = (r() - 0.5) * amount;
      d[i] += n; d[i + 1] += n; d[i + 2] += n;
    }
    ctx.putImageData(img, 0, 0);
  }

  function vignette(ctx, w, h, strength) {
    const g = ctx.createRadialGradient(w / 2, h / 2, Math.min(w, h) * 0.35, w / 2, h / 2, Math.max(w, h) * 0.75);
    g.addColorStop(0, 'rgba(0,0,0,0)');
    g.addColorStop(1, `rgba(0,0,0,${strength})`);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);
  }

  function paintScene(kind, style = 'photo', w = 1600, h = 1000, seed = 7) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const r = rng(seed);
    (SCENES[kind] || SCENES.lake)(ctx, w, h, r);

    if (style === 'postcard') {
      const tmp = document.createElement('canvas');
      tmp.width = w; tmp.height = h;
      const t = tmp.getContext('2d');
      t.filter = 'sepia(0.85) contrast(0.82) brightness(1.08) saturate(0.9)';
      t.drawImage(c, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#efe4cf';
      ctx.fillRect(0, 0, w, h);
      const m = w * 0.035;
      ctx.drawImage(tmp, m, m, w - 2 * m, h - 2 * m);
      grain(ctx, w, h, r, 34);
      vignette(ctx, w, h, 0.38);
      ctx.strokeStyle = 'rgba(80,60,40,.35)';
      ctx.lineWidth = 2;
      ctx.strokeRect(m, m, w - 2 * m, h - 2 * m);
    } else if (style === 'illustration') {
      // 动画回忆感：高饱和、柔光溢出、偏冷的高光，不做色阶分离（避免色带）
      const base = document.createElement('canvas');
      base.width = w; base.height = h;
      const b = base.getContext('2d');
      b.filter = 'saturate(1.55) contrast(1.1) brightness(1.04)';
      b.drawImage(c, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.drawImage(base, 0, 0);
      const glow = document.createElement('canvas');
      glow.width = w; glow.height = h;
      const g = glow.getContext('2d');
      g.filter = 'blur(26px) brightness(1.2)';
      g.drawImage(base, 0, 0);
      ctx.globalCompositeOperation = 'screen';
      ctx.globalAlpha = 0.42;
      ctx.drawImage(glow, 0, 0);
      ctx.globalAlpha = 1;
      const leak = ctx.createRadialGradient(w * 0.82, h * 0.2, 0, w * 0.82, h * 0.2, w * 0.55);
      leak.addColorStop(0, 'rgba(255,214,170,.42)');
      leak.addColorStop(1, 'rgba(255,214,170,0)');
      ctx.fillStyle = leak;
      ctx.fillRect(0, 0, w, h);
      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(40,80,200,.06)';
      ctx.fillRect(0, 0, w, h);
      grain(ctx, w, h, r, 6);
      vignette(ctx, w, h, 0.3);
    } else {
      grain(ctx, w, h, r, 14);
      vignette(ctx, w, h, 0.22);
    }
    return c;
  }

  global.paintScene = paintScene;
})(window);
