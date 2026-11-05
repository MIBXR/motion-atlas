import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from 'react';
import { Shell } from '../components/Shell';
import { useToastStack } from '../components/ui';
import { createRhythmLab } from '../domain/rhythm';
import { RhythmMarkup } from './RhythmMarkup';
import '../styles/lab.css';
const sections = [
  ['s-beat', '感受节拍'],
  ['s-quant', '理解吸附'],
  ['s-ease', '曲线 × 时长 × 拍子'],
  ['s-export', '导出'],
];
export default function LabPage() {
  const { toast } = useToastStack();
  const message = useRef(toast);
  message.current = toast;
  const [engine] = useState(() =>
    createRhythmLab((title) => message.current({ title })),
  );
  const snapshot = useSyncExternalStore(engine.subscribe, engine.getSnapshot);
  const host = useRef(null);
  const [active, setActive] = useState('s-beat');
  const [wavBusy, setWavBusy] = useState(false);
  const [wavResult, setWavResult] = useState('');
  useLayoutEffect(() => {
    engine.mount(host.current);
    return () => engine.destroy();
  }, [engine]);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries)
          if (entry.isIntersecting) setActive(entry.target.id);
      },
      { rootMargin: '-30% 0px -60% 0px' },
    );
    sections.forEach(([id]) => observer.observe(document.getElementById(id)));
    if (location.hash)
      requestAnimationFrame(() =>
        document
          .getElementById(decodeURIComponent(location.hash.slice(1)))
          ?.scrollIntoView(),
      );
    return () => observer.disconnect();
  }, []);
  async function downloadWav() {
    const settings = snapshot.state;
    setWavBusy(true);
    setWavResult('正在离线渲染…');
    try {
      const result = await engine.renderWav();
      const blob = new Blob([result.wav()], { type: 'audio/wav' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = `motion-atlas-rhythm-${settings.bpm}bpm-${settings.meter.replace('/', '-')}-${settings.wavCycles}x.wav`;
      link.click();
      setTimeout(() => URL.revokeObjectURL(link.href), 2e3);
      setWavResult(
        `已导出 ${link.download} · ${result.duration.toFixed(2)}s · ${result.events} 个声音事件 · 峰值 ${result.peakDb.toFixed(1)} dBFS · RMS ${result.rmsDb.toFixed(1)} dBFS${result.clipped ? ' · 削波 ' + result.clipped : ' · 无削波'}`,
      );
    } catch (error) {
      setWavResult('导出失败：' + error.message);
    } finally {
      setWavBusy(false);
    }
  }
  const directory = (
    <nav className="lab-section-links" aria-label="实验室目录">
      {sections.map(([id, label]) => (
        <a
          href={'#' + id}
          key={id}
          aria-current={active === id ? 'location' : void 0}
          data-close-directory
          onClick={() => setActive(id)}
        >
          {label}
        </a>
      ))}
    </nav>
  );
  return (
    <Shell
      page="lab"
      directory={directory}
      className="rhythm-lab"
      mainClassName="lab-main"
    >
      <div ref={host}>
        <RhythmMarkup
          snapshot={snapshot}
          engine={engine}
          ui={{ wavBusy, wavResult, downloadWav }}
        />
      </div>
    </Shell>
  );
}
