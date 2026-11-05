import { Accordion, Button } from '../components/ui';
import {
  RhythmControl,
  EventEditor,
  RhythmExport,
  QuantizationTable,
  ExampleHint,
  TapHistory,
  TotalTiming,
} from '../components/RhythmControls';
export function RhythmMarkup({ snapshot, engine, ui }) {
  return (
    <>
      <header className="lab-head">
        <p className="eyebrow">
          {'RHYTHM LAB · BEAT / QUANTIZE / EASE / EXPORT'}
        </p>
        <h1>
          {'把“手感”调成'}
          <em>{'数字'}</em>
          {'。'}
        </h1>
        <p>
          {
            '先用节拍器感受速度、拍号与细分，再比较事件吸附前后的差别。把曲线、时长和错峰对齐拍子，导出代码、Prompt 或 WAV。'
          }
        </p>
      </header>

      <div
        className="transport"
        id="transport"
        role="group"
        aria-label="走带：播放、速度与声音"
      >
        <RhythmControl id="play" snapshot={snapshot} engine={engine} ui={ui} />
        <RhythmControl
          id="bpmNum"
          snapshot={snapshot}
          engine={engine}
          ui={ui}
        />
        <RhythmControl id="tap" snapshot={snapshot} engine={engine} ui={ui} />
        <span className="tp-tapinfo" id="tapInfo" aria-live="polite">
          {snapshot.tapInfo}
        </span>
        <div className="tp-lights" id="lights" aria-hidden="true" />
        <output
          className="tp-pos"
          id="pos"
          aria-label="当前位置（小节.拍.细分）"
        >
          {'—'}
        </output>
        <div className="tp-sound">
          <RhythmControl id="snd" snapshot={snapshot} engine={engine} ui={ui} />
          <RhythmControl id="vol" snapshot={snapshot} engine={engine} ui={ui} />
        </div>
      </div>

      <p className="keys" id="keys">
        {'快捷键：'}
        <span>
          <kbd className="kbd">{'空格'}</kbd>
          {' 播放 / 停止'}
        </span>
        <span>
          <kbd className="kbd">{'T'}</kbd>
          {' 打拍测速'}
        </span>
        <span>
          <kbd className="kbd">{'J'}</kbd>
          {' 打拍板'}
        </span>
        <span>
          <kbd className="kbd">{'R'}</kbd>
          {' 录入一遍'}
        </span>
        <span>
          <kbd className="kbd">{'A'}</kbd>
          {' / '}
          <kbd className="kbd">{'B'}</kbd>
          {' 原始 / 吸附'}
        </span>
        <span>
          <kbd className="kbd">{'X'}</kbd>
          {' A/B 交替'}
        </span>
      </p>

      <section className="step" id="s-beat" aria-labelledby="h-beat">
        <header className="step-head">
          <span className="step-no">{'01'}</span>
          <div>
            <h2 id="h-beat">
              {'感受节拍 '}
              <small>{'METRONOME'}</small>
            </h2>
            <p>
              {
                '节拍器把时间切成等长的格子：小节重拍最重，拍次之，细分最轻。调整速度、拍号、细分或摇摆，都会在下一个格子生效，相位保持连续，节拍器不会重启。先在这里选定速度。'
              }
            </p>
          </div>
        </header>
        <div className="beat-grid">
          <div className="pane metro-pane">
            <div className="metro-top">
              <div className="metro-count" id="mCount" aria-hidden="true" />
              <div className="metro-read" id="mRead" />
            </div>
            <div className="metro-bar" id="mBar" aria-hidden="true">
              <div className="metro-cells" id="mCells" />
              <i className="metro-ball" id="mBall" />
            </div>
            <p className="metro-legend">
              <span className="lg lg-bar" />
              {'小节重拍 '}
              <span className="lg lg-acc" />
              {'次强拍 '}
              <span className="lg lg-beat" />
              {'拍 '}
              <span className="lg lg-sub" />
              {'细分'}
            </p>
            <p className="hint" id="meterHint">
              {snapshot.meterHint}
            </p>
          </div>
          <div className="pane ctrl-pane">
            <div className="field-row">
              <RhythmControl
                id="bpm"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="meter"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="div"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="swing"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <p className="hint" data-hint="swing">
              {snapshot.swingHint}
            </p>
            <div className="field-row">
              <RhythmControl
                id="kit"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="levels" role="group" aria-label="三级音量">
              <RhythmControl
                id="vBar"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <RhythmControl
                id="vBeat"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <RhythmControl
                id="vSub"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
          </div>
        </div>
      </section>

      <section className="step" id="s-quant" aria-labelledby="h-quant">
        <header className="step-head">
          <span className="step-no">{'02'}</span>
          <div>
            <h2 id="h-quant">
              {'理解吸附 '}
              <small>{'QUANTIZE'}</small>
            </h2>
            <p>
              {
                '剪辑点、动作落点这些事件很少正好落在拍上。吸附会把它们移到最近的网格点：网格越细，保留的节奏越多；网格太粗会把切分抹平。选择 A/B 交替播放，听事件吸附前后的差别。'
              }
            </p>
          </div>
        </header>
        <div className="pane q-pane">
          <div className="q-ctrls">
            <div className="field-row">
              <RhythmControl
                id="div"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="swing"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="offset"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="strength"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="bars"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <span className="loop-len" id="loopLen">
                {'= ' + snapshot.clipLength.toFixed(2) + ' 秒'}
              </span>
            </div>
          </div>
          <div className="examples">
            <RhythmControl
              id="examples"
              snapshot={snapshot}
              engine={engine}
              ui={ui}
            />
          </div>
          <div className="ex-hint">
            <ExampleHint snapshot={snapshot} engine={engine} />
          </div>
          <div className="tl-legend" aria-hidden="true">
            <span>
              <i className="lg-a" />
              {'A 原始'}
            </span>
            <span>
              <i className="lg-b" />
              {'B 吸附后'}
            </span>
            <span>
              <i className="lg-early" />
              {'偏早 → 往后挪'}
            </span>
            <span>
              <i className="lg-late" />
              {'偏晚 → 往前挪'}
            </span>
            <span className="tl-tip">
              {
                '拖动 A 点调整时刻 · 点击 A 道空白处添加事件 · 选中后按 Delete 删除'
              }
            </span>
          </div>
          <div className="timeline" id="tlBox">
            <svg id="tl" role="group" aria-label="吸附时间线" />
          </div>
          <div className="play-row">
            <div className="field-row">
              <RhythmControl
                id="mode"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <div className="field-row">
              <RhythmControl
                id="evVoice"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <RhythmControl
              id="startCue"
              snapshot={snapshot}
              engine={engine}
              ui={ui}
            />
            <span className="ab-now" id="abNow" aria-live="polite" />
          </div>
          <div className="demo-row">
            <figure className="bounce" id="bounce">
              <svg id="bnc" aria-hidden="true" />
              <figcaption>
                {'小球每落地一次 = 一个事件；圆灯在拍上闪。和圆灯同时落地是'}
                <b>{'在拍上'}</b>
                {'，落在两灯之间是'}
                <b>{'反拍（切分）'}</b>
                {'，差一点点则像“没踩准”的卡顿。'}
              </figcaption>
            </figure>
            <div className="rec-box">
              <h3>
                {'打拍录入 '}
                <small>{'TAP & RECORD'}</small>
              </h3>
              <p>
                {'跟着节拍器点击打拍板（或按 '}
                <kbd className="kbd">{'J'}</kbd>
                {
                  '），实时查看敲击早 / 晚多少毫秒。点击“录入一遍”会从下一圈开头录入一整圈，录完后自动 A/B 交替播放：先听原始敲击，再听吸附后的事件。'
                }
              </p>
              <div className="rec-btns">
                <RhythmControl
                  id="rec"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
                <RhythmControl
                  id="pad"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
              </div>
              <div className="rec-prog" id="recProg" aria-hidden="true">
                <i />
              </div>
              <p
                className="pad-fb"
                id="padFb"
                aria-live="polite"
                data-cls={snapshot.feedback.cls}
              >
                {snapshot.feedback.text}
              </p>
              <div className="tap-hist">
                <TapHistory snapshot={snapshot} />
              </div>
              <div className="lat-row">
                <RhythmControl
                  id="lat"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
                <RhythmControl
                  id="latCal"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
              </div>
            </div>
          </div>
          <Accordion
            defaultOpen={-1}
            items={[
              {
                title: '编辑事件时刻（秒）· 吸附明细',
                content: (
                  <div className="ev-edit-body">
                    <EventEditor snapshot={snapshot} engine={engine} />
                    <div className="ev-actions">
                      <RhythmControl
                        id="applySnap"
                        snapshot={snapshot}
                        engine={engine}
                        ui={ui}
                      />
                      <RhythmControl
                        id="clearEv"
                        snapshot={snapshot}
                        engine={engine}
                        ui={ui}
                      />
                      <span className="q-stats" id="qStats">
                        {snapshot.quantStats}
                      </span>
                    </div>
                    <div className="q-scroll">
                      <QuantizationTable snapshot={snapshot} />
                    </div>
                  </div>
                ),
              },
            ]}
          />
        </div>
      </section>

      <section className="step" id="s-ease" aria-labelledby="h-ease">
        <header className="step-head">
          <span className="step-no">{'03'}</span>
          <div>
            <h2 id="h-ease">
              {'曲线 × 时长 × 拍子 '}
              <small>{'EASE / DURATION / STAGGER'}</small>
            </h2>
            <p>
              {
                '曲线决定动作的速度变化，时长决定轻重感，错峰通过控制元素起步的间隔形成视觉层次。开启“跟随节拍”后，预览每小节重播。选择“落点踩重拍”，最后一个元素在重拍落定。起步时有呼啸音，每次落定时有提示音。'
              }
            </p>
          </div>
        </header>
        <div className="ease-grid">
          <article className="pane">
            <h3 className="pane-h">
              {'缓动曲线 '}
              <small>{'CUBIC-BEZIER'}</small>
            </h3>
            <RhythmControl
              id="presets"
              snapshot={snapshot}
              engine={engine}
              ui={ui}
            />
            <div className="curve-wrap">
              <svg
                id="curve"
                viewBox="-20 -60 340 420"
                aria-label="缓动曲线编辑器（可拖动两个控制点，方向键微调，Shift 加大步长）"
              >
                <rect x="0" y="0" width="300" height="300" className="cv-box" />
                <path id="cvGrid" className="cv-grid" />
                <line x1="0" y1="300" x2="300" y2="0" className="cv-lin" />
                <line id="h1" className="cv-handle-line" />
                <line id="h2" className="cv-handle-line" />
                <path id="cvPath" className="cv-path" />
                <line id="cvT" className="cv-t" y1="-60" y2="360" />
                <circle
                  id="p1"
                  r="11"
                  className="cv-pt"
                  tabIndex="0"
                  role="slider"
                  aria-label="控制点 1（x1, y1）"
                />
                <circle
                  id="p2"
                  r="11"
                  className="cv-pt"
                  tabIndex="0"
                  role="slider"
                  aria-label="控制点 2（x2, y2）"
                />
                <circle id="cvDot" r="6" className="cv-dot" />
              </svg>
              <div className="cv-vals">
                <RhythmControl
                  id="x1"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
                <RhythmControl
                  id="y1"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
                <RhythmControl
                  id="x2"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
                <RhythmControl
                  id="y2"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
                <p className="cv-css" id="cvCss">
                  {snapshot.curveCSS}
                </p>
              </div>
            </div>
          </article>
          <article className="pane">
            <h3 className="pane-h">
              {'时长与错峰 '}
              <small>{'DURATION / STAGGER'}</small>
            </h3>
            <div className="sliders">
              <div className="field-row">
                <RhythmControl
                  id="dur"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
              </div>
              <div className="field-row">
                <RhythmControl
                  id="stag"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
              </div>
              <div className="field-row">
                <RhythmControl
                  id="dist"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
              </div>
              <div className="field-row">
                <RhythmControl
                  id="count"
                  snapshot={snapshot}
                  engine={engine}
                  ui={ui}
                />
              </div>
            </div>
            <div
              className="chips snap-chips"
              role="group"
              aria-label="按拍设置时长与错峰"
            >
              <span className="fl">{'对到拍'}</span>
              <Button
                type="button"
                className="chip-btn"
                data-dur="0.25"
                variant="secondary"
                onClick={() => engine.snapTiming('dur', 0.25)}
              >
                {'时长 ¼ 拍'}
              </Button>
              <Button
                type="button"
                className="chip-btn"
                data-dur="0.5"
                variant="secondary"
                onClick={() => engine.snapTiming('dur', 0.5)}
              >
                {'时长 ½ 拍'}
              </Button>
              <Button
                type="button"
                className="chip-btn"
                data-dur="1"
                variant="secondary"
                onClick={() => engine.snapTiming('dur', 1)}
              >
                {'时长 1 拍'}
              </Button>
              <Button
                type="button"
                className="chip-btn"
                data-stag="grid"
                variant="secondary"
                onClick={() => engine.snapTiming('stag')}
              >
                {'错峰 = 网格步长'}
              </Button>
            </div>
            <div className="preview" id="preview" aria-hidden="true" />
            <div className="pv-tools">
              <RhythmControl
                id="sync"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <RhythmControl
                id="align"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <RhythmControl
                id="cue"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <RhythmControl
                id="trail"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <RhythmControl
                id="ghost"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
              <RhythmControl
                id="replay"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <p className="total" id="total">
              <TotalTiming snapshot={snapshot} />
            </p>
          </article>
        </div>
      </section>

      <section className="step" id="s-export" aria-labelledby="h-export">
        <header className="step-head">
          <span className="step-no">{'04'}</span>
          <div>
            <h2 id="h-export">
              {'导出 '}
              <small>{'CSS · JS · PROMPT · WAV'}</small>
            </h2>
            <p>
              {
                '导出内容包含当前节拍、事件、曲线、时长与错峰参数。WAV 使用同一套音色，可拖入剪辑软件对拍。'
              }
            </p>
          </div>
        </header>
        <div className="export-grid">
          <article className="pane export">
            <RhythmExport snapshot={snapshot} engine={engine} />
          </article>
          <article className="pane wav-pane">
            <h3 className="pane-h">
              {'导出 WAV '}
              <small>{'OFFLINE RENDER'}</small>
            </h3>
            <p className="hint">
              {
                'WAV 包含当前节拍器和事件的声音，以及循环起点提示音与曲线提示音。节拍器保留三级音量，A/B 交替按圈切换。曲线跟随节拍时加入提示音。从第 0 秒开始导出整数圈，方便循环使用。'
              }
            </p>
            <div className="field-row">
              <RhythmControl
                id="wavCycles"
                snapshot={snapshot}
                engine={engine}
                ui={ui}
              />
            </div>
            <p className="wav-sum" id="wavSum">
              {snapshot.wavSummary}
            </p>
            <RhythmControl
              id="wavBtn"
              snapshot={snapshot}
              engine={engine}
              ui={ui}
            />
            <p className="wav-res" id="wavRes" aria-live="polite">
              {ui.wavResult}
            </p>
          </article>
        </div>
        <p className="note">
          {
            '设置会保存在当前浏览器中，下次打开可继续调整；换设备不会同步。声音默认关闭，第一次点击“播放”时开启。'
          }
        </p>
      </section>
    </>
  );
}
