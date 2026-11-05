import { useEffect, useRef, useState } from 'react';
import {
  CircleDot,
  Hand,
  Play,
  RotateCcw,
  Square,
  Volume2,
  VolumeX,
  Waves,
} from 'lucide-react';
import {
  Button,
  CodeBlock,
  CopyButton,
  NumberField,
  SegmentedControl,
  Slider,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Textarea,
} from './ui';
import { Choice } from './actions';
const signed = (value) =>
  (value > 0 ? '+' : value < 0 ? '−' : '±') + Math.abs(value) + 'ms';
const groups = {
  meter: ['拍号', 'meter', (snapshot) => snapshot.meterOptions],
  div: ['细分 / 吸附网格', 'div', (snapshot) => snapshot.divisionOptions],
  kit: ['节拍器音色', 'kit', (snapshot) => snapshot.kitOptions],
  bars: [
    '循环长度',
    'bars',
    () =>
      [1, 2, 4].map((value) => ({
        value: String(value),
        label: value + ' 小节',
      })),
  ],
  mode: ['事件播放方式', 'mode', (snapshot) => snapshot.modeOptions],
  examples: ['示例事件', 'example', (snapshot) => snapshot.exampleOptions],
  presets: [
    '缓动预设',
    'preset',
    (snapshot) => snapshot.presets.map((value) => ({ value, label: value })),
  ],
  align: [
    '对齐方式',
    'align',
    () => [
      { value: 'start', label: '起点上拍' },
      { value: 'land', label: '落点上拍' },
    ],
  ],
  wavCycles: [
    '导出圈数',
    'wavCycles',
    () =>
      [1, 2, 4].map((value) => ({
        value: String(value),
        label: value + ' 圈',
      })),
  ],
};
const numbers = { x1: [0, 1], y1: [-1, 2], x2: [0, 1], y2: [-1, 2] };
const ranges = {
  bpm: ['速度 BPM', 40, 240, 1, 'bpm', (value) => value + ' BPM'],
  vol: ['音量', 0, 100, 1, 'vol', (value) => value + '%'],
  swing: ['摇摆', 0, 100, 1, 'swing', (value) => value + '%'],
  vBar: ['小节重拍音量', 0, 100, 1, 'bar', (value) => value + '%'],
  vBeat: ['拍音量', 0, 100, 1, 'beat', (value) => value + '%'],
  vSub: ['细分音量', 0, 100, 1, 'sub', (value) => value + '%'],
  offset: ['首拍偏移', 0, 1e3, 5, 'offset', (value) => value + 'ms'],
  strength: ['量化强度', 0, 100, 1, 'strength', (value) => value + '%'],
  lat: ['输入延迟补偿', -150, 150, 1, 'lat', signed],
  dur: ['时长', 80, 2e3, 10, 'dur', (value) => value + 'ms'],
  stag: ['错峰', 0, 300, 5, 'stag', (value) => value + 'ms'],
  dist: ['位移', 20, 100, 1, 'dist', (value) => value + '%'],
  count: ['数量', 1, 12, 1, 'count', (value) => String(value)],
};
const switches = {
  startCue: '开头提示音',
  sync: '跟随节拍',
  cue: '动作提示音',
  trail: '轨迹',
  ghost: '线性对照',
};
export function RhythmControl({ id, snapshot, engine, ui }) {
  const state = snapshot.state;
  if (groups[id]) {
    let change = function (value) {
      if (id === 'kit') engine.chooseKit(value);
      else if (id === 'presets') engine.preset(value);
      else
        engine.update({
          [key]: ['div', 'bars', 'wavCycles'].includes(key)
            ? Number(value)
            : value,
        });
    };
    const [label, key, values] = groups[id];
    const control = (
      <SegmentedControl
        label={label}
        value={String(state[key])}
        options={values(snapshot)}
        onValueChange={change}
      />
    );
    return (
      <div className="rhythm-control rhythm-group">
        <span className="rhythm-group-label">{label}</span>
        {id === 'align' ? (
          <fieldset disabled={!state.sync} className="rhythm-control-fieldset">
            {control}
          </fieldset>
        ) : (
          control
        )}
      </div>
    );
  }
  if (ranges[id]) {
    const [label, min, max, step, key, format] = ranges[id];
    const level = ['vBar', 'vBeat', 'vSub'].includes(id);
    return (
      <div className="rhythm-control">
        <Slider
          label={label}
          min={min}
          max={max}
          step={step}
          value={level ? state.lv[key] : state[key]}
          disabled={id === 'swing' && !snapshot.swingEnabled}
          format={format}
          onValueChange={(value) =>
            engine.update(level ? { lv: { [key]: value } } : { [key]: value })
          }
        />
      </div>
    );
  }
  if (numbers[id]) {
    const index = ['x1', 'y1', 'x2', 'y2'].indexOf(id);
    return (
      <div className="rhythm-control">
        <NumberField
          label={id}
          value={state.curve[index]}
          min={numbers[id][0]}
          max={numbers[id][1]}
          step={0.01}
          onValueChange={(value) => {
            const curve = [...state.curve];
            curve[index] = value;
            engine.setCurve(curve);
          }}
        />
      </div>
    );
  }
  if (switches[id])
    return (
      <div className="rhythm-control">
        <Switch
          label={switches[id]}
          checked={state[id]}
          onCheckedChange={(value) => engine.update({ [id]: value })}
        />
      </div>
    );
  if (id === 'bpmNum')
    return (
      <div className="rhythm-control tp-bpm">
        <NumberField
          label="速度（BPM）"
          value={state.bpm}
          min={40}
          max={240}
          step={1}
          onValueChange={(value) => engine.update({ bpm: value })}
        />
      </div>
    );
  if (id === 'evVoice')
    return (
      <div className="rhythm-control">
        <Choice
          label="事件音色"
          value={state.evVoice}
          options={snapshot.voiceOptions}
          onValueChange={(value) => engine.update({ evVoice: value })}
        />
      </div>
    );
  if (id === 'play')
    return (
      <Button
        className="tp-play"
        aria-pressed={snapshot.running}
        aria-label={snapshot.running ? '停止（空格）' : '播放（空格）'}
        data-playing={snapshot.running}
        onClick={engine.togglePlay}
      >
        {snapshot.running ? <Square size={18} /> : <Play size={18} />}
        {snapshot.running ? '停止' : '播放'}
      </Button>
    );
  if (id === 'snd')
    return (
      <Button
        variant="secondary"
        aria-pressed={snapshot.soundEnabled}
        onClick={engine.toggleSound}
      >
        {snapshot.soundState === 'on' || snapshot.soundState === 'blocked' ? (
          <Volume2 size={17} />
        ) : (
          <VolumeX size={17} />
        )}
        {snapshot.soundState === 'on'
          ? '声音 开'
          : snapshot.soundState === 'blocked'
            ? '声音 待启用'
            : '声音 关'}
      </Button>
    );
  if (id === 'tap' || id === 'pad') {
    const action = id === 'tap' ? engine.tapTempo : engine.padTap;
    return (
      <Button
        variant="secondary"
        className={id === 'pad' ? 'pad' : 'tp-tap'}
        aria-label={id === 'tap' ? '打拍测速（T）' : '跟着节拍敲击（J）'}
        onPointerDown={(event) => {
          if (event.button === 0) {
            event.preventDefault();
            action(event.timeStamp);
          }
        }}
        onClick={(event) => {
          if (event.detail === 0) action(event.timeStamp);
        }}
      >
        <Hand size={22} />
        {id === 'tap' ? (
          <>
            打拍测速 <kbd>T</kbd>
          </>
        ) : (
          <>
            跟着节拍敲击 <kbd>J</kbd>
          </>
        )}
      </Button>
    );
  }
  if (id === 'rec')
    return (
      <Button
        variant="secondary"
        aria-pressed={snapshot.recording !== 'idle'}
        data-state={snapshot.recording}
        onClick={engine.record}
      >
        <CircleDot size={17} />
        {snapshot.recordingLabel}
      </Button>
    );
  if (id === 'latCal')
    return (
      <Button
        variant="secondary"
        size="sm"
        disabled={!snapshot.canCalibrate}
        onClick={engine.calibrate}
      >
        用平均偏差补偿
      </Button>
    );
  if (id === 'applySnap')
    return (
      <Button variant="secondary" size="sm" onClick={engine.applySnap}>
        应用吸附
      </Button>
    );
  if (id === 'clearEv')
    return (
      <Button variant="ghost" size="sm" onClick={engine.clearEvents}>
        清空事件
      </Button>
    );
  if (id === 'replay')
    return (
      <Button
        variant="secondary"
        disabled={snapshot.replayDisabled}
        onClick={engine.replay}
      >
        <RotateCcw size={17} />
        重播
      </Button>
    );
  if (id === 'wavBtn')
    return (
      <Button loading={ui.wavBusy} onClick={ui.downloadWav}>
        <Waves size={17} />
        导出 WAV
      </Button>
    );
  return null;
}
export function EventEditor({ snapshot, engine }) {
  const [text, setText] = useState(() =>
    snapshot.state.ev.map((value) => value.toFixed(3)).join(', '),
  );
  const editing = useRef(false);
  useEffect(() => {
    if (!editing.current)
      setText(snapshot.state.ev.map((value) => value.toFixed(3)).join(', '));
  }, [snapshot.state.ev]);
  return (
    <Textarea
      id="events"
      label="事件时刻（秒）"
      value={text}
      rows={2}
      spellCheck={false}
      onFocus={() => {
        editing.current = true;
      }}
      onChange={(event) => {
        setText(event.target.value);
        engine.setEvents(event.target.value);
      }}
      onBlur={() => {
        editing.current = false;
        setText(snapshot.state.ev.map((value) => value.toFixed(3)).join(', '));
      }}
    />
  );
}
export function RhythmExport({ snapshot, engine }) {
  return (
    <Tabs
      value={snapshot.state.tab}
      onValueChange={(value) => engine.update({ tab: value })}
    >
      <TabsList aria-label="导出格式">
        <TabsTrigger value="css">CSS</TabsTrigger>
        <TabsTrigger value="js">MotionKit</TabsTrigger>
        <TabsTrigger value="prompt">Prompt</TabsTrigger>
      </TabsList>
      <TabsContent value={snapshot.state.tab}>
        <CodeBlock
          code={snapshot.code}
          language={
            snapshot.state.tab === 'css'
              ? 'css'
              : snapshot.state.tab === 'js'
                ? 'js'
                : 'text'
          }
          maxLines={20}
        />
        <CopyButton value={snapshot.code} label="复制" />
      </TabsContent>
    </Tabs>
  );
}
export function QuantizationTable({ snapshot }) {
  return (
    <table id="qtable" className="qtable">
      <thead>
        <tr>
          <th>#</th>
          <th>原始</th>
          <th>吸附到</th>
          <th>吸附后</th>
          <th>移动</th>
          <th>落点</th>
        </tr>
      </thead>
      <tbody>
        {snapshot.quantRows.map((row) => (
          <tr key={row.index}>
            <td>{row.index}</td>
            <td>{row.original}</td>
            <td>{row.target}</td>
            <td>{row.snapped}</td>
            <td className={row.className}>{row.move}</td>
            <td>{row.kind}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
export function ExampleHint({ snapshot, engine }) {
  const example = snapshot.example;
  return example ? (
    <>
      <p>
        <strong>{example.name}</strong>：{example.description}
        {example.tip}
      </p>
      <div className="tries">
        {example.tries.map((label, index) => (
          <Button
            variant="secondary"
            size="sm"
            key={label}
            onClick={() => engine.tryExample(index)}
          >
            {label}
          </Button>
        ))}
      </div>
    </>
  ) : (
    <p>
      {snapshot.state.ev.length
        ? '自定义事件（通过拖动、键盘操作或打拍录入创建）。'
        : '还没有事件。选择上方示例、点击 A 道空白处，或使用打拍录入来添加事件。'}
    </p>
  );
}
export function TapHistory({ snapshot }) {
  return (
    <>
      {snapshot.taps.map((tap, index) => (
        <i
          key={index}
          className={tap.cls}
          style={{ '--d': Math.max(-1, Math.min(1, tap.dev / 80)) }}
        />
      ))}
      {snapshot.taps.length > 0 && (
        <span>
          {snapshot.taps.length} 下 · 平均 {signed(snapshot.tapMean)}
        </span>
      )}
    </>
  );
}
export function TotalTiming({ snapshot }) {
  const ratio = (value) => Math.round(value * 100) / 100;
  return (
    <>
      总时长 <strong>{snapshot.totalMilliseconds}ms</strong> ≈{' '}
      {ratio(snapshot.totalMilliseconds / snapshot.beatMilliseconds)} 拍 · 时长{' '}
      {snapshot.state.dur}ms ≈{' '}
      {ratio(snapshot.state.dur / snapshot.beatMilliseconds)} 拍 · 1 小节{' '}
      {Math.round(snapshot.barMilliseconds)}ms
      {snapshot.totalMilliseconds > snapshot.barMilliseconds && (
        <span className="warn">
          {' '}
          · 总时长超过 1 小节，跟随节拍时动画会被下一小节打断
        </span>
      )}
    </>
  );
}
