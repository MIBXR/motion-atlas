import { useEffect, useMemo, useState } from 'react';
import catalog from 'atlas:catalog';
import {
  Checkbox,
  CodeBlock,
  CopyButton,
  Input,
  SearchField,
  SegmentedControl,
  useToastStack,
} from '../components/ui';
import { ActionLink } from '../components/actions';
import { Shell } from '../components/Shell';
import { agentItems, agentInstruction } from '../domain/agent-instructions';
import { project } from '../project';
import '../styles/agent.css';
const items = agentItems(catalog);
const known = new Set(items.map((item) => item.e.id));
const roleNames = {
  foundation: '骨架',
  support: '支撑',
  accent: '点睛',
  case: '案例',
};
const commands = `node scripts/atlas.mjs search "转场 地图" --limit 5
node scripts/atlas.mjs show map-pilgrimage --source
node scripts/atlas.mjs export split-compare-stamp --out ../my-demo
node scripts/render.mjs demos/cases/map-pilgrimage/index.html --fps 30`;
export default function AgentPage() {
  const { toast } = useToastStack();
  const [state, setState] = useState(() => {
    let saved = {};
    try {
      saved = JSON.parse(localStorage.getItem('ma-agent') || '{}');
    } catch {
      saved = {};
    }
    const value = {
      sel: ['map-pilgrimage', 'split-compare-stamp'],
      kind: 'all',
      target: 'code',
      brief: '',
      ...saved,
    };
    return { ...value, sel: value.sel.filter((id) => known.has(id)) };
  });
  const [query, setQuery] = useState('');
  const instruction = useMemo(() => agentInstruction(state, items), [state]);
  const results = items.filter(
    (item) =>
      (state.kind === 'all' || item.kind === state.kind) &&
      [
        item.e.id,
        item.e.title,
        item.e.summary,
        item.sub,
        ...(item.e.tags || []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(query.toLowerCase().trim()),
  );
  useEffect(() => {
    try {
      localStorage.setItem('ma-agent', JSON.stringify(state));
    } catch {
      toast({ title: '任务设置未能保存，当前结果仍可复制。', type: 'warning' });
    }
  }, [state, toast]);
  const update = (patch) => setState((previous) => ({ ...previous, ...patch }));
  return (
    <Shell page="agent" className="agent-page">
      <div className="agent-content">
        <header className="page-heading">
          <p className="eyebrow">FOR AGENTS · CONTEXT / COMPOSITION / EXPORT</p>
          <h1>
            同一套资料，
            <br />
            机器也能读。
          </h1>
          <p>
            结构化索引、完整资料包与命令行工具，供 Agent
            检索案例、读取设计依据并取得可运行源码。
          </p>
        </header>
        <section className="agent-section">
          <h2>推荐工作流</h2>
          <ol className="agent-workflow">
            <li>先明确作品的内容、载体与目标，再检索案例和巧思。</li>
            <li>选择一个案例或骨架，搭配有明确职责的支撑与点睛。</li>
            <li>读取完整资料包、Prompt 与源码，保留来源和适用边界。</li>
            <li>替换真实内容，播放、定位并按需要逐帧渲染。</li>
          </ol>
          <div className="agent-actions">
            <ActionLink href={project.documentURL('docs/agent.md')}>
              完整工作流
            </ActionLink>
            <ActionLink href="agent/catalog.json">结构化索引 JSON</ActionLink>
          </div>
        </section>
        <section className="agent-section">
          <h2>指令生成器</h2>
          <p className="agent-description">
            选一个案例或骨架巧思，再加入支撑和点睛，生成实现或视频制作指令。
          </p>
          <div className="generator">
            <div className="generator-selection">
              <SearchField
                label="筛选案例与巧思"
                placeholder="筛选：地图、转场、HUD、抽卡…"
                value={query}
                onValueChange={setQuery}
              />
              <SegmentedControl
                label="条目类型"
                value={state.kind}
                onValueChange={(value) => update({ kind: value })}
                options={[
                  { value: 'all', label: '全部' },
                  { value: 'cases', label: '案例' },
                  { value: 'patterns', label: '巧思' },
                ]}
              />
              <div className="generator-list">
                {results.length ? (
                  results.map((item) => (
                    <div className="generator-item" key={item.e.id}>
                      <Checkbox
                        checked={state.sel.includes(item.e.id)}
                        onCheckedChange={(checked) =>
                          update({
                            sel: checked
                              ? [
                                  .../* @__PURE__ */ new Set([
                                    ...state.sel,
                                    item.e.id,
                                  ]),
                                ]
                              : state.sel.filter((id) => id !== item.e.id),
                          })
                        }
                        label={
                          <span>
                            <strong>{item.e.title}</strong>
                            <small>
                              {item.e.id} · {item.sub}
                            </small>
                          </span>
                        }
                      />
                      <span className={`generator-role role-${item.role}`}>
                        {roleNames[item.role]}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>没有匹配的条目</p>
                )}
              </div>
            </div>
            <div className="generator-output">
              <SegmentedControl
                label="生成目标"
                value={state.target}
                onValueChange={(value) => update({ target: value })}
                options={[
                  { value: 'code', label: '代码实现' },
                  { value: 'video', label: '视频生成' },
                ]}
              />
              <Input
                label="制作需求"
                placeholder="例如：上海一日城市漫游、新品发布倒计时"
                value={state.brief}
                onChange={(event) => update({ brief: event.target.value })}
              />
              {instruction.warnings.length > 0 && (
                <p className="generator-warning" role="status">
                  {instruction.warnings.join(' ')}
                </p>
              )}
              <CodeBlock
                code={instruction.text}
                language="text"
                maxLines={22}
              />
              <CopyButton value={instruction.text} label="复制" />
            </div>
          </div>
        </section>
        <section className="agent-section">
          <h2>命令行</h2>
          <CodeBlock code={commands} language="shell" />
          <p className="agent-description">
            本地 Node.js
            命令可检索、读取和导出条目；作品需要成片时使用渲染命令。
          </p>
          <ActionLink href={project.documentURL('docs/pipeline.md')}>
            渲染管线
          </ActionLink>
        </section>
        <section className="agent-section">
          <h2>资料格式</h2>
          <p>
            索引按案例、巧思与素材组织。每个资料包保留条目、文档原文、Prompt、来源与运行文件。
          </p>
          <div className="agent-actions">
            <ActionLink href="agent/catalog.json">总索引</ActionLink>
            <ActionLink href="agent/cases/index.json">案例目录</ActionLink>
            <ActionLink href="agent/patterns/index.json">巧思目录</ActionLink>
            <ActionLink href="agent/materials/index.json">素材目录</ActionLink>
          </div>
        </section>
      </div>
    </Shell>
  );
}
