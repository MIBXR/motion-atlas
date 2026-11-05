import {
  forwardRef,
  useCallback,
  useEffect,
  useEffectEvent,
  useMemo,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  ExternalLink,
  Maximize,
  Minimize,
  Pause,
  Play,
  RotateCcw,
  Volume2,
  VolumeX,
} from 'lucide-react';
import {
  Button,
  Progress,
  SegmentedControl,
  Slider,
  useToastStack,
} from './ui';
import { ActionLink, IconAction } from './actions';
import { EnergyCurve } from './EntryCard';
import { formatTime } from '../domain/motion-data';
import '../styles/player.css';
const soundNames = {
  off: '关',
  on: '开',
  blocked: '待启用',
  pending: '开启中',
  none: '无',
};
const orientation = (value) =>
  value === 'portrait' || value === 'p'
    ? 'portrait'
    : value === 'landscape' || value === 'l'
      ? 'landscape'
      : null;
function stored(key, fallback) {
  try {
    const value = localStorage.getItem(key);
    return value === null ? fallback : JSON.parse(value);
  } catch {
    return fallback;
  }
}
function hashParameters() {
  return new URLSearchParams(location.hash.split('?')[1] || '');
}
function replaceParameter(key, value) {
  const route = location.hash.slice(1).split('?')[0];
  const params = hashParameters();
  if (value === null) params.delete(key);
  else params.set(key, value);
  history.replaceState(
    history.state,
    '',
    location.pathname +
      location.search +
      '#' +
      route +
      (params.size ? '?' + params : ''),
  );
}
export const MotionPlayer = forwardRef(function MotionPlayer2(
  { entry, actionsRef },
  ref,
) {
  const { toast } = useToastStack();
  const initialOrient = useRef(
    orientation(hashParameters().get('orient')) ||
      orientation(new URLSearchParams(location.search).get('orient')) ||
      orientation(stored('ma-orient', null)) ||
      'landscape',
  );
  const soundPreference = useRef(stored('ma-sound', false) === true);
  const api = useRef(null);
  const frame = useRef(null);
  const root = useRef(null);
  const toolbar = useRef(null);
  const scrubber = useRef(null);
  const beatStrip = useRef(null);
  const sideBeats = useRef(null);
  const pendingSeek = useRef(Number(hashParameters().get('t')) || 0);
  const beforeDrag = useRef(false);
  const lastPointer = useRef(false);
  const idleTimer = useRef(null);
  const soundTimer = useRef(null);
  const [revision, setRevision] = useState(0);
  const [playback, setPlayback] = useState({
    time: 0,
    playing: false,
    duration: entry.rhythm?.duration || 0,
  });
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(null);
  const [loadingVisible, setLoadingVisible] = useState(false);
  const [error, setError] = useState(null);
  const [markers, setMarkers] = useState([]);
  const [orient, setOrient] = useState(
    entry.previewPortrait && initialOrient.current === 'portrait'
      ? 'portrait'
      : 'landscape',
  );
  const [orients, setOrients] = useState([]);
  const [sound, setSound] = useState('off');
  const [fullscreen, setFullscreen] = useState(false);
  const [pseudo, setPseudo] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [size, setSize] = useState({ width: 720, height: 405, side: 0 });
  const full = fullscreen || pseudo;
  const beats = useMemo(
    () =>
      (entry.rhythm?.beats?.length ? entry.rhythm.beats : markers)
        .map((beat) => ({ ...beat, t: Number(beat.t) }))
        .filter(
          (beat) =>
            Number.isFinite(beat.t) &&
            beat.t >= 0 &&
            (!playback.duration || beat.t <= playback.duration + 1e-3),
        )
        .toSorted((a, b) => a.t - b.t),
    [entry, markers, playback.duration],
  );
  const currentBeat = beats.findLastIndex(
    (beat) => beat.t <= playback.time + 1e-3,
  );
  const demoURL = useRef(
    (() => {
      const url = new URL(entry.demo, location.href);
      url.searchParams.set('embed', '1');
      url.searchParams.set('orient', initialOrient.current);
      if (pendingSeek.current > 0)
        url.searchParams.set('t', pendingSeek.current);
      if (
        (hashParameters().get('autoplay') ||
          new URLSearchParams(location.search).get('autoplay')) === '0'
      )
        url.searchParams.set('autoplay', '0');
      return url.href;
    })(),
  );
  function post(message) {
    frame.current?.contentWindow?.postMessage(message, location.origin);
  }
  const showControls = useCallback(() => {
    setControlsVisible(true);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setControlsVisible(false), 2500);
  }, []);
  const seek = useCallback(
    (time) => {
      const value = Math.max(0, Math.min(playback.duration || time, time));
      pendingSeek.current = value;
      api.current?.seek(value);
      replaceParameter('t', Number(value.toFixed(3)));
      showControls();
    },
    [playback.duration, showControls],
  );
  function togglePlay() {
    if (!loaded || !api.current) return;
    api.current.playing ? api.current.pause() : api.current.play();
    showControls();
  }
  function toggleSound() {
    if (sound === 'none') return;
    const next = sound === 'pending' ? false : sound !== 'on';
    soundPreference.current = next;
    try {
      localStorage.setItem('ma-sound', JSON.stringify(next));
    } catch {
      toast({ title: '声音偏好未能保存。', type: 'warning' });
    }
    post({ type: 'motion:sound', on: next });
    setSound(next ? 'pending' : 'off');
    clearTimeout(soundTimer.current);
    soundTimer.current = setTimeout(() => {
      try {
        setSound(
          frame.current.contentWindow.MotionKit?.audio?.state ||
            (next ? 'blocked' : 'off'),
        );
      } catch {
        setSound(next ? 'blocked' : 'off');
      }
    }, 2500);
    showControls();
  }
  function chooseOrient(value) {
    if (!orients.includes(value) || value === orient) return;
    try {
      localStorage.setItem('ma-orient', JSON.stringify(value));
    } catch {
      toast({ title: '画幅偏好未能保存。', type: 'warning' });
    }
    replaceParameter('orient', value);
    post({ type: 'motion:orient', orient: value });
    showControls();
  }
  async function toggleFullscreen() {
    if (full) {
      if (document.fullscreenElement) await document.exitFullscreen();
      setPseudo(false);
    } else {
      try {
        if (!root.current.requestFullscreen) {
          setPseudo(true);
          return;
        }
        await root.current.requestFullscreen();
      } catch {
        setPseudo(true);
      }
    }
    showControls();
  }
  function stepBeat(direction) {
    const beat =
      direction > 0
        ? beats.find((beat2) => beat2.t > playback.time + 0.05)
        : beats.findLast((beat2) => beat2.t < playback.time - 0.05);
    seek(beat ? beat.t : direction > 0 ? playback.duration : 0);
  }
  useImperativeHandle(ref, () => ({ seek }), [seek]);
  useEffect(() => {
    let current = true;
    let connected;
    let interval;
    let unsubscribe;
    let removeFrameListeners = () => {};
    setLoaded(false);
    setError(null);
    setProgress(null);
    setLoadingVisible(false);
    const delayed = setTimeout(() => {
      if (current) setLoadingVisible(true);
    }, 200);
    function syncFrame(time, playing) {
      if (!current) return;
      setPlayback({
        time: Number(time) || 0,
        playing: Boolean(playing),
        duration: connected.duration,
      });
    }
    function hookFrame() {
      removeFrameListeners();
      try {
        const child = frame.current.contentWindow;
        const escape = (event) => {
          if (event.key === 'Escape') setPseudo(false);
        };
        child.addEventListener('pointermove', showControls, { passive: true });
        child.addEventListener('pointerdown', showControls, { passive: true });
        child.addEventListener('keydown', escape, true);
        removeFrameListeners = () => {
          child.removeEventListener('pointermove', showControls);
          child.removeEventListener('pointerdown', showControls);
          child.removeEventListener('keydown', escape, true);
        };
      } catch {
        removeFrameListeners = () => {};
      }
    }
    function connect() {
      let motion;
      try {
        motion = frame.current?.contentWindow?.__motion;
      } catch {
        return;
      }
      if (!motion?.duration || motion === connected) return;
      unsubscribe?.();
      connected = motion;
      clearInterval(interval);
      api.current = motion;
      unsubscribe = motion.on(syncFrame);
      if (motion.markers?.length) setMarkers(motion.markers);
      setOrients(motion.orients || []);
      if (orientation(motion.orient)) setOrient(orientation(motion.orient));
      syncFrame(motion.time, motion.playing);
      hookFrame();
      Promise.resolve(motion.ready).then(
        () => {
          if (!current || connected !== motion) return;
          setLoaded(true);
          setLoadingVisible(false);
          if (
            pendingSeek.current > 0 &&
            Math.abs(motion.time - pendingSeek.current) > 1e-6
          )
            motion.seek(pendingSeek.current);
        },
        (error2) => {
          if (current) {
            setError(error2.message);
            setLoadingVisible(true);
          }
        },
      );
    }
    function message(event) {
      if (event.source !== frame.current?.contentWindow) return;
      const data = event.data;
      if (data?.type === 'motion:loading') {
        setProgress(data);
        if (data.error) {
          setError(data.error);
          setLoadingVisible(true);
        }
      } else if (data?.type === 'motion:ready') {
        if (data.markers?.length) setMarkers(data.markers);
        if (data.duration)
          setPlayback((previous) => ({ ...previous, duration: data.duration }));
        setOrients(data.orients || []);
        if (orientation(data.orient)) setOrient(orientation(data.orient));
        if (data.sound === false) setSound('none');
        else if (soundPreference.current) {
          setSound('pending');
          post({ type: 'motion:sound', on: true });
        }
        connect();
      } else if (data?.type === 'motion:orient') {
        if (orientation(data.orient)) setOrient(orientation(data.orient));
        if (data.rejected)
          toast({
            title: `这个 Demo 只有${data.orient === 'portrait' ? '竖屏' : '横屏'}画幅`,
          });
      } else if (data?.type === 'motion:sound') {
        clearTimeout(soundTimer.current);
        setSound(data.state || (data.on ? 'on' : 'off'));
      }
    }
    const iframe = frame.current;
    const load = () => {
      hookFrame();
      connect();
    };
    iframe.addEventListener('load', load);
    window.addEventListener('message', message);
    interval = setInterval(connect, 100);
    connect();
    return () => {
      current = false;
      clearTimeout(delayed);
      clearTimeout(soundTimer.current);
      clearInterval(interval);
      unsubscribe?.();
      removeFrameListeners();
      iframe.removeEventListener('load', load);
      window.removeEventListener('message', message);
      iframe.contentWindow?.postMessage(
        { type: 'motion:sound', on: false },
        location.origin,
      );
      connected?.pause();
      api.current = null;
    };
  }, [entry, revision]);
  useLayoutEffect(() => {
    const measure = () => {
      const availableWidth = root.current.clientWidth;
      const top = full
        ? 0
        : document.querySelector('.site-header').offsetHeight +
          (actionsRef.current?.offsetHeight || 0) +
          24;
      const availableHeight = full
        ? innerHeight
        : Math.max(
            200,
            innerHeight -
              top -
              toolbar.current.offsetHeight -
              scrubber.current.offsetHeight -
              40,
          );
      const ratio = orient === 'portrait' ? 9 / 16 : 16 / 9;
      const width = Math.min(availableWidth, availableHeight * ratio);
      const side =
        orient === 'portrait' && availableWidth - width >= 236
          ? Math.min(360, availableWidth - width - 16)
          : 0;
      setSize({ width, height: width / ratio, side });
    };
    const observer = new ResizeObserver(measure);
    [root.current, toolbar.current, scrubber.current, actionsRef.current]
      .filter(Boolean)
      .forEach((node) => observer.observe(node));
    window.addEventListener('resize', measure);
    measure();
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', measure);
    };
  }, [orient, full, actionsRef]);
  useEffect(() => {
    const change = () => {
      setFullscreen(document.fullscreenElement === root.current);
      showControls();
    };
    document.addEventListener('fullscreenchange', change);
    return () => {
      document.removeEventListener('fullscreenchange', change);
      clearTimeout(idleTimer.current);
    };
  }, []);
  const keyboard = useEffectEvent((event) => {
    if (
      event.ctrlKey ||
      event.metaKey ||
      event.altKey ||
      event.target.closest('input,textarea,select,[contenteditable]') ||
      document.querySelector('[role="dialog"]')
    )
      return;
    if (
      !(
        full ||
        root.current.contains(event.target) ||
        ((event.target === document.body ||
          event.target === document.documentElement) &&
          lastPointer.current)
      )
    )
      return;
    if (
      (event.key === ' ' || event.key === 'Enter') &&
      event.target.closest('button,a,summary,[role="slider"]')
    )
      return;
    if (event.key === ' ') {
      event.preventDefault();
      togglePlay();
    } else if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      const direction = event.key === 'ArrowRight' ? 1 : -1;
      event.shiftKey ? stepBeat(direction) : seek(playback.time + direction);
    } else if (event.key === 'Home') {
      event.preventDefault();
      seek(0);
    } else if (event.key === 'End') {
      event.preventDefault();
      seek(playback.duration);
    } else if (event.key.toLowerCase() === 'm') {
      event.preventDefault();
      toggleSound();
    } else if (event.key.toLowerCase() === 'f') {
      event.preventDefault();
      toggleFullscreen();
    } else if (event.key === 'Escape') setPseudo(false);
  });
  useEffect(() => {
    window.addEventListener('keydown', keyboard);
    return () => window.removeEventListener('keydown', keyboard);
  }, []);
  useLayoutEffect(() => {
    for (const box of [beatStrip.current, sideBeats.current]) {
      const active = box?.querySelector('[aria-current="true"]');
      if (!active) continue;
      if (box === beatStrip.current)
        box.scrollTo({
          left: Math.max(
            0,
            active.offsetLeft - box.clientWidth / 2 + active.offsetWidth / 2,
          ),
          behavior: 'auto',
        });
      else
        box.scrollTo({
          top: Math.max(
            0,
            active.offsetTop - box.clientHeight / 2 + active.offsetHeight / 2,
          ),
          behavior: 'auto',
        });
    }
  }, [currentBeat]);
  useEffect(() => {
    if (!pseudo) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [pseudo]);
  const beatButtons = (compact) =>
    beats.length ? (
      beats.map((beat, index) => (
        <Button
          key={beat.t + ':' + index}
          variant="ghost"
          disabled={!loaded}
          aria-current={index === currentBeat ? 'true' : void 0}
          onClick={() => seek(beat.t)}
        >
          <b>{formatTime(beat.t).replace(/^00:/, '')}</b>
          <span>{beat.label}</span>
          {!compact && beat.note && <small>{beat.note}</small>}
        </Button>
      ))
    ) : (
      <span className="support-text">
        {loaded
          ? '这个 Demo 没有节拍标记，可拖动时间轴逐帧查看。'
          : '正在读取节拍点…'}
      </span>
    );
  const mb = (value) => ((value || 0) / 1e6).toFixed(1);
  const loadingText = progress
    ? `已下载 ${mb(progress.loadedBytes)} / ${progress.unknownTotal ? '未知总量' : mb(progress.totalBytes) + ' MB'} · ${mb(progress.bytesPerSecond)} MB/s · 文件 ${progress.filesDone || 0} / ${progress.filesTotal || 0} · ${{ download: '下载中', decode: '解码中', frame: '准备首帧', error: '加载失败', ready: '就绪' }[progress.phase] || '准备中'}`
    : '正在载入…';
  return (
    <section
      className={`motion-stage ${pseudo ? 'pseudo-fullscreen' : ''}`}
      ref={root}
      data-fullscreen={full}
      data-controls={controlsVisible || !playback.playing}
      onPointerEnter={() => {
        lastPointer.current = true;
        showControls();
      }}
      onPointerLeave={() => {
        lastPointer.current = false;
      }}
      onPointerMove={showControls}
      onFocusCapture={showControls}
      aria-label={`${entry.title} Demo`}
    >
      <div className="motion-stage-toolbar" ref={toolbar}>
        {orients.length > 1 ? (
          <SegmentedControl
            label="画幅"
            value={orient}
            options={[
              { value: 'landscape', label: '横屏 16:9' },
              { value: 'portrait', label: '竖屏 9:16' },
            ].filter((option) => orients.includes(option.value))}
            onValueChange={chooseOrient}
          />
        ) : (
          <span className="stage-orient-badge">
            {orient === 'portrait'
              ? '竖屏 9:16'
              : orients.length
                ? '横屏 16:9'
                : '自适应'}
          </span>
        )}
        <div className="motion-stage-actions">
          <Button
            variant="secondary"
            disabled={sound === 'none'}
            aria-pressed={sound !== 'off' && sound !== 'none'}
            aria-label={'声音：' + soundNames[sound]}
            onClick={toggleSound}
          >
            {sound === 'on' || sound === 'pending' || sound === 'blocked' ? (
              <Volume2 size={17} />
            ) : (
              <VolumeX size={17} />
            )}
            <span>{soundNames[sound]}</span>
          </Button>
          <IconAction label="全屏查看" onClick={toggleFullscreen}>
            {full ? <Minimize size={17} /> : <Maximize size={17} />}
          </IconAction>
          <IconAction
            label="重播"
            disabled={!loaded}
            onClick={() => {
              api.current.seek(0);
              api.current.play();
              showControls();
            }}
          >
            <RotateCcw size={17} />
          </IconAction>
          <ActionLink
            href={entry.demo + (orients.length > 1 ? '?orient=' + orient : '')}
            target="_blank"
            rel="noreferrer"
          >
            <ExternalLink size={16} />
            独立打开
          </ActionLink>
        </div>
      </div>
      <div className="motion-stage-content">
        <div
          className="motion-stage-frame"
          style={{ width: size.width, height: size.height }}
          aria-busy={!loaded}
        >
          <iframe
            key={revision}
            ref={frame}
            src={demoURL.current}
            title={`${entry.title}交互 Demo`}
            allow="autoplay; fullscreen"
          />
          {!loaded && loadingVisible && (
            <div className="stage-loading">
              <Progress
                label={loadingText}
                value={Math.min(0.99, progress?.progress || 0) * 100}
              />
              <p role={error ? 'alert' : 'status'}>
                {error ? '加载失败：' + error : loadingText}
              </p>
              {error && (
                <Button
                  variant="secondary"
                  onClick={() => setRevision((value) => value + 1)}
                >
                  重试
                </Button>
              )}
            </div>
          )}
          {sound === 'blocked' && (
            <Button
              className="stage-sound-hint"
              variant="secondary"
              onClick={toggleSound}
            >
              <Volume2 size={17} />
              点击启用声音
            </Button>
          )}
        </div>
        {size.side > 0 && (
          <aside
            className="stage-side-beats"
            ref={sideBeats}
            style={{ width: size.side, height: size.height }}
          >
            <p>节拍点</p>
            {beatButtons(false)}
          </aside>
        )}
      </div>
      <div className="motion-scrubber" ref={scrubber}>
        <div className="motion-scrub-row">
          <IconAction
            label={playback.playing ? '暂停' : '播放'}
            disabled={!loaded}
            onClick={togglePlay}
          >
            {playback.playing ? <Pause size={18} /> : <Play size={18} />}
          </IconAction>
          <div
            className="motion-scrub-control"
            onPointerDownCapture={() => {
              beforeDrag.current = Boolean(api.current?.playing);
              api.current?.pause();
            }}
            onKeyDownCapture={(event) => {
              if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                event.preventDefault();
                event.stopPropagation();
                const direction = event.key === 'ArrowRight' ? 1 : -1;
                event.shiftKey
                  ? stepBeat(direction)
                  : seek(playback.time + direction);
              }
            }}
          >
            <EnergyCurve entry={entry} />
            <Slider
              label="时间轴"
              min={0}
              max={playback.duration || 1}
              step={1 / 30}
              value={playback.time}
              onValueChange={seek}
              onValueCommit={() => {
                if (beforeDrag.current) api.current?.play();
                beforeDrag.current = false;
              }}
              disabled={!loaded}
              showValue={false}
            />
          </div>
          <span className="motion-time" aria-live="off">
            {formatTime(playback.time)}
            <small> / {formatTime(playback.duration)}</small>
          </span>
        </div>
        <div className="stage-beat-strip" ref={beatStrip}>
          {beatButtons(true)}
        </div>
      </div>
    </section>
  );
});
