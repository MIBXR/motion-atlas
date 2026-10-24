$stop-that-shit change -- 资源库第一阶段：原样收录视频提示词合集与两个 Skill 仓库，新增「资源库」页面（按本方案逐条实施，不自行发挥）。

# 0. 背景与原则

- 用户决定把 4 个外部仓库纳入 Motion Atlas。本阶段收录其中 3 个：
  - awesome-opus5-5-videos：703 条，含提示词全文；
  - garden-skills；
  - agent-anime-skill（ai-handdrawn-video）。

  lemo-opuscar 的 59 个样片在第二阶段处理，本阶段不碰。
- **原样收录**：上游文件逐字节复制，不改写、不翻译、不删减；保留上游 LICENSE 与 README。
- **方案已定**：本文写死了页面结构、文案、数据格式与校验规则，你照做即可。遇到本文没有覆盖的岔路，停下来，写进报告的“待决定”一节，不要自行决定。
- 事实依据（位于主工作区，已被 git 忽略，只读）：
  - `dev/shots/Tnew/inventory.md`：许可与目录；
  - `dev/shots/Tnew/survey/awesome-data.md`：videos.json 字段；
  - `dev/shots/Tnew/survey/motion-atlas-site.md`：站点结构。
- 上游克隆（只读）：`dev/shots/Tnew/refs/{1-awesome-opus5-5-videos,3-garden-skills,4-agent-anime-skill}/`。这些克隆的 `git` 命令会报 `bad object HEAD`，提交号一律用下表的值，不要从 git 读。

| 名称 | 上游 | 提交 | 许可（照抄到 UPSTREAM.json 的 license） |
|---|---|---|---|
| opus-videos | https://github.com/yihui-dev/awesome-opus5-5-videos | 92aee2f586ac0715cb3cbcb6384834f98a33383d | `MIT（列表）；视频与提示词归各作者` |
| garden-skills | https://github.com/ConardLi/garden-skills | 7a6d5a72e4f44bb4cc0c23c01b3d97205c723b68 | `MIT` |
| agent-anime-skill | https://github.com/waterpro/agent-anime-skill | c643fe2409322d9d879c55e173d18ef876e7221d | `未声明许可；上游 README：仅供个人娱乐，请勿进行商业用途。` |

- 工作树：`.worktrees/resources`，分支 `feat/resources`（已建好，基于 feat/endfield-protocol 的 4ec9308）。
- 本地服务器端口 4328：`node scripts/serve.mjs --port 4328`。不要用 4321–4327。
- 网站界面文字 ≥ 12px：`scripts/check.mjs` 会查 `assets/` 与根目录下的 html。

# 1. 收录脚本与目录

## 1.1 `.gitattributes`

在末尾加一行，保证收录的文件逐字节一致：

```
resources/** -text
```

## 1.2 新增 `scripts/vendor-resources.mjs`

**用法**

```
node scripts/vendor-resources.mjs <name> <上游克隆目录> --commit <sha> [--fetched YYYY-MM-DD]
```

- `name` 取 `opus-videos | garden-skills | agent-anime-skill`；
- `--fetched` 默认为当天。

**脚本内置配置表（写死）**

| name | 目标目录 | 收录规则 | excluded（写进 UPSTREAM.json） |
|---|---|---|---|
| opus-videos | `resources/opus-videos/` | 克隆根下除 `.git/` 外的全部文件 | `[".git/"]` |
| garden-skills | `resources/skills/garden-skills/` | 克隆根下除 `.git/`、`.github/`、`website/` 外的全部文件 | `[".git/", ".github/", "website/（上游宣传站点，18 MB）"]` |
| agent-anime-skill | `resources/skills/agent-anime-skill/` | 克隆根下除 `.git/` 外的全部文件 | `[".git/"]` |

**行为**

1. 清空目标目录，然后按相对路径逐个复制文件（字节复制）。Windows 长路径用 `fs.cpSync` 或 `\\?\` 前缀处理，以全部复制成功为准。
2. 在目标目录写 `UPSTREAM.json`（2 空格缩进，末尾换行），结构如下：

   ```json
   {
     "name": "<name>",
     "repo": "<owner/repo>",
     "url": "<上表 URL>",
     "commit": "<sha>",
     "fetchedAt": "<YYYY-MM-DD>",
     "license": "<上表许可原文>",
     "notice": ["..."],
     "excluded": ["..."],
     "files": [{"path": "<相对路径，正斜杠>", "bytes": 0, "sha256": "<hex>"}]
   }
   ```

   - `files` 按 path 排序，不含 UPSTREAM.json 自身。
   - `notice` 按名称取值：
     - **agent-anime-skill**：

       ```json
       ["仅供个人娱乐，请勿进行商业用途。", "若有人使用此skill进行侵权行为，与本人无关，自行承担法律风险。"]
       ```

       即上游 README.md 第 1、2 行原文。
     - **opus-videos**：

       ```json
       ["Every video and prompt belongs to its creator, linked from each entry. Previews are short clips hosted for this list. If you are a creator and want an entry changed or removed, open an issue."]
       ```

       即 README.md:111 原文。
     - **garden-skills**：`[]`。
3. 打印 `收录 N 个文件，共 X 字节`。

**执行**：三个名称各运行一次，提交号用第 0 节表格中的值，并加 `--fetched 2026-10-24`。

## 1.3 发布

`scripts/build-static.mjs` 的复制目录列表加入 `resources`。

# 2. 数据生成（`scripts/lib/catalog.mjs` + `scripts/build.mjs`）

## 2.1 新函数 `buildResources()`

该函数读 `resources/`，返回对象 `RES`。`buildAll()` 把它写成 `data/resources.js`：

```js
/* 由 scripts/build.mjs 生成，请勿手改 */
window.MA_RES = <JSON>;
```

`RES` 的结构：

```js
{
  videos: {
    upstream: { repo, url, commit, fetchedAt, license, notice },   // 取自 resources/opus-videos/UPSTREAM.json
    items: [{
      slug,
      title,        // JSON 有 title 则用之，否则 null
      author, authorUrl, postUrl,
      remakeUrl,    // skillry_url，可为 null
      category,     // motion | 3d | explainer | interactive
      tags,         // tech_tags 原样
      partial,      // 'none' | 'part' | 'post'
      poster,       // poster_url 原样
      added,        // added 原样
      excerpt
    }]
  },
  skills: [{
    id,             // SKILL.md frontmatter 的 name
    repo,           // 'garden-skills' | 'agent-anime-skill'
    dir,            // 例 'resources/skills/garden-skills/skills/motion-showreel'
    description,    // frontmatter description 原文（去掉包裹引号）
    upstream: { repo, url, commit, license, notice },
    files: [{ path, bytes }]   // dir 内全部文件，相对 dir，按 path 排序
  }]
}
```

**videos 字段规则**

- `partial` 的判定：
  - `prompt_partial === false` → `'none'`；
  - 否则读对应的 `prompts/<slug>.md`：
    - 含 `The author shared only part of the prompt.` → `'part'`；
    - 含 `The author didn't publish the full prompt.` → `'post'`；
    - 两者都不含 → 构建报错。
- `excerpt`：取 JSON 的 `prompt`，把空白折叠成单个空格并去掉首尾空白，再按 `Array.from` 截取前 200 字；有截断时末尾加 `…`。
- `items` 排序：`added` 降序，同一天的按 `slug` 升序。

**skills 字段规则**

- 来源：`resources/skills/*/` 下的所有 `SKILL.md`，排除路径中含 `/references/`、`/assets/`、`/templates/` 的。
- 解析：从 YAML frontmatter 取 `name` 与 `description`。`description` 若是 `>` 或 `|` 多行块，按 YAML 规则拼接。
- 排序：先按 repo（garden-skills 在前），再按 id。
- 预期恰好 7 个，数量不符就停下报告：
  - `beautiful-article`
  - `gpt-image-2`
  - `kb-retriever`
  - `motion-showreel`
  - `web-design-engineer`
  - `web-video-presentation`
  - `ai-handdrawn-video`

## 2.2 其他生成物

- **README 计数块**：在现有三项之后追加以下内容，分隔符与现有内容完全一致：

  ```
  　·　**N 条视频提示词**　·　**M 个 Skill**
  ```

- **`agent/catalog.json`**：在 `counts` 之后加入 `resources` 字段，不计入 `contentVersion`：

  ```json
  {
    "videos": {
      "count": 703,
      "data": "resources/opus-videos/data/videos.json",
      "prompts": "resources/opus-videos/prompts/",
      "license": "<license>"
    },
    "skills": [
      {"id": "...", "path": "<dir>/SKILL.md", "license": "<license>"}
    ]
  }
  ```

- **`docs/resources.md`**（第 5 节）：现有规则会自动把它收入文档中心。

# 3. 校验（`scripts/check.mjs`）

新增以下检查。任何一项失败都报错，退出码为 1。

- **R1**：以下三处都有 `UPSTREAM.json`，且字段 name、repo、url、commit、fetchedAt、license、notice、excluded、files 齐全：
  - `resources/opus-videos/`
  - `resources/skills/garden-skills/`
  - `resources/skills/agent-anime-skill/`
- **R2**：`files` 中的每个文件都存在，且 bytes 与 sha256 一致；目录中没有清单之外的文件（UPSTREAM.json 自身除外）。
- **R3**：`videos.json` 的每个 slug 都有对应的 `prompts/<slug>.md`；反过来，每个 md 也都有对应的 slug。
- **R4**：skills 恰为第 2.1 节列出的 7 个，且 description 都非空。
- **R5**：`data/resources.js` 与内存重建的结果一致。这一条并入现有的生成物一致性检查。

# 4. 页面

## 4.1 共享 Markdown 渲染器（先做这一步）

- 把 `assets/docs.js` 中的以下内容原样移到新文件 `assets/markdown.js`：
  - `RE`、`resolve`、`linkFor`、`inline`、`parseList`、`render`；
  - 以及它们依赖的辅助代码。
- 对外暴露 `window.MAMarkdown = { render, resolve }`。
- `render(md, base, heads, opts)` 新增可选参数 `opts.link(resolvedPath, rawHref)`，由它返回链接的 href。不传时行为与原来完全一致（沿用原 `linkFor`）。图片 `src` 的解析规则同原实现。
- `docs.html` 在 `assets/docs.js` 之前加载 `assets/markdown.js`；`docs.js` 改为调用 `window.MAMarkdown`。
- **验收**：改前、改后各截一组图，视口 1440×900，分别打开 `docs.html` 的以下三页，像素差比较，三张必须完全一致（差异像素为 0）：
  - `#doc/docs/guide.md`
  - `#doc/docs/pipeline.md`
  - `#doc/prompts/cases/archive-os.md`

## 4.2 `resources.html`

- **结构**：照 `cases.html`：
  - title：`资源库 · Motion Atlas`；
  - description：`外部收录的视频提示词与 Skill，原样保存并保留作者与许可。`；
  - head 加载 `assets/site.css`、`assets/docs.css`、`assets/resources.css`（新）；
  - body 带 `data-page="resources"`，内含 `#site-header`、`main#app`、`#site-footer`；
  - 按顺序加载脚本：`data/resources.js`、`assets/site.js`、`assets/markdown.js`、`assets/resources.js`（新）。
- **样式**：
  - 优先复用 `site.css` / `docs.css` 中的现有类；只为新增结构在 `assets/resources.css` 中补样式。
  - 颜色只用现有 CSS 变量，字号 ≥ 12px。
- **导航**：`assets/site.js` 的 `NAV` 中，在 `['patterns.html', '巧思库']` 之后插入 `['resources.html', '资源库']`。页脚不改。

## 4.3 路由（hash）

| hash | 视图 |
|---|---|
| 空，或 `#videos` | 视频提示词列表 |
| `#videos?cat=<c>&tag=<t>&full=<none\|part\|post>&q=<词>&sort=<added\|author>` | 带筛选的列表；各参数均可省略 |
| `#video/<slug>` | 单条提示词详情 |
| `#skills`、`#skills?repo=<garden-skills\|agent-anime-skill>` | Skill 列表 |
| `#skill/<id>`、`#skill/<id>/<文件相对路径>` | Skill 阅读视图；默认文件 `SKILL.md` |

- 筛选状态用 `history.replaceState` 写回 hash。
- 从详情返回列表时，恢复离开前的筛选条件与滚动位置（滚动位置存在内存里即可）。

## 4.4 视频提示词列表

布局照 `assets/library.js` 的列表，沿用同名类：`.lib` = `aside.lib-side` + `section`；`section` 内依次为 `.lib-head`、`.toolbar`、`.result-line`、`.grid`。

### 页头与切换

- `.lib-head`（不放 heroArt）：
  - eyebrow：`RESOURCES · PROMPTS / SKILLS`；
  - h1：`别人做成的片子，<br>和<em>做片的方法</em>。`；
  - p：`收录外部仓库的视频提示词与 Skill，原样保存，保留作者与许可。`
- 页头下方放两段切换：
  - 复用 `.tabs` 的现有样式；若它不适用于按钮，就照 `.orient-seg` 写一个 `.res-tabs`。
  - 两段分别为 `视频提示词 703` 和 `Skills 7`，链接到 `#videos`、`#skills`。
  - 数字用等宽字体，颜色 `--muted`；当前段加 `aria-current="page"`。

### 侧栏

用 `.side-group` + `.side-list` + 现有的 `sideButton` 形式，单选；每项的计数为当前条件下的数量。依次为：

1. **分类**：`全部`、`动效`（motion）、`3D 场景`（3d）、`讲解`（explainer）、`交互`（interactive）。
2. **技术标签**：第一项 `全部标签`，其后按出现次数降序列出 13 个标签，显示原文（如 `canvas`）。
3. **提示词完整度**：`全部`、`完整提示词`（none）、`部分提示词`（part）、`仅原帖文字`（post）。
4. **`.side-foot`**：

   ```html
   <b>●</b> SOURCE · awesome-opus5-5-videos<br>视频与提示词归各作者
   ```

### 工具栏与结果行

- `.toolbar`：
  - 侧栏开关按钮，同 library，文案 `筛选`；
  - 搜索框，placeholder 为 `搜索作者、标题、提示词片段…`；在 author、title、excerpt 中做不区分大小写的子串匹配；
  - 排序 select：`最新收录`（added）、`作者 A–Z`（author）。
- `.result-line`：左边 `共 N 条`，右边 `提示词多为英文原文，点开可复制`。

### 卡片

结构照 `library.js` 的 `cardHTML`：`article.card` 内含 `.card-media`、`.card-index`、`.card-body`。整卡是指向 `#video/<slug>` 的链接。

- **`.card-media`**：
  - `<img src="poster" alt="@author 的视频封面" loading="lazy" decoding="async">`；
  - 比例 16:9，`object-fit: cover`；
  - 图片加载失败时换成 `<span class="ph">VIDEO</span>`。
- **`.card-index`**：`三位序号 / 分类中文`，如 `001 / 动效`；序号按当前筛选结果排列。
- **`.card-body`**，从上到下：
  1. 标题：h3 元素，类与 library 卡片一致；内容为 title，没有时写 `@author 的作品`；
  2. 作者：一行 `@author`，等宽字体，muted 色；
  3. excerpt：最多 3 行（`-webkit-line-clamp: 3`）；
  4. chips：每个 tag 一个 `.chip`；partial 为 `part` 时追加 `.chip.accent` `部分提示词`，为 `post` 时追加 `.chip.accent` `仅原帖文字`。

### 分页

- 每次渲染 48 张卡。
- 列表底部放 `.btn` 按钮：`再显示 48 条（剩余 K）`。
- 筛选条件变化时，回到前 48 条。

## 4.5 视频详情 `#video/<slug>`

容器 `.res-detail`：最大宽 960px，水平居中；左右内边距 `var(--gutter)`，上 16px，下 80px。内容从上到下：

1. **返回链接** `← 视频提示词`：回到列表并恢复状态。
2. **eyebrow**：`分类中文 · 收录于 <added>`。
3. **h1**：取值规则同卡片标题；字体照 `.detail-head h1`。
4. **chips 行**：
   - 作者 `a.chip`，文字 `@author`，链到 authorUrl；
   - 各 tag；
   - partial 标签，规则同卡片。
5. **操作行**，按钮样式照 `.detail-actions .btn`：
   - **`复制提示词`**：复制 JSON 中 `prompt` 的原文。
     - 来源：`resources/opus-videos/data/videos.json`，首次进入详情时 fetch 一次并缓存。
     - 复制用 `Site.copy`，提示与站内其他复制按钮一致。
   - **`原帖 ↗`**：链接 postUrl，新标签打开，`rel="noopener"`。
   - **`看复刻 ↗`**：链接 remakeUrl；remakeUrl 为 null 时不显示。
6. **封面图**：
   - 宽 100%，16:9，`object-fit: cover`；
   - 圆角 `var(--radius)`，1px `var(--line)` 边框；
   - 加载失败则隐藏。
7. **正文**：`article.doc`，fetch `resources/opus-videos/prompts/<slug>.md`，用 `MAMarkdown.render` 渲染。失败时显示 `.doc-empty`：`提示词文件读取失败`。
8. **来源说明**：一段 `.side-foot` 样式的文字，其中 `@author` 和 `yihui-dev/awesome-opus5-5-videos` 为链接：

   ```
   提示词版权归 @author 所有 · 来源 yihui-dev/awesome-opus5-5-videos @ 92aee2f · MIT（列表）
   ```

## 4.6 Skill 列表 `#skills`

- 页头与两段切换同 4.4，当前段为第二段。
- **侧栏**：
  - `来源`：`全部`、`garden-skills`（6）、`agent-anime-skill`（1）；
  - `.side-foot`：`<b>●</b> 原样收录上游文件<br>许可见各 Skill`。
- **工具栏**：只有搜索框，placeholder 为 `搜索 Skill 名称与说明…`。
- **卡片**，链接到 `#skill/<id>`：
  - `.card-media` 放 `<span class="ph">SKILL</span>`；
  - `.card-index`：`三位序号 / repo`；
  - `.card-body`：
    1. h3 为 id；
    2. description，最多 4 行；
    3. chips：repo、`N 个文件`；许可 chip 在 MIT 时用 `.chip`，在 agent-anime-skill 时用 `.chip.accent` `未声明许可`。

## 4.7 Skill 阅读 `#skill/<id>/<path>`

### 顶部信息块

宽度规则同 `.res-detail`，但最大宽 1440px。从上到下：

1. 返回链接 `← Skills`；
2. eyebrow：`SKILL · <repo>`；
3. h1：id；
4. description 段落；
5. chips：上游链接 `a.chip`（文字为 `owner/repo @ 前 7 位提交`）、许可 chip；
6. 若 `upstream.notice` 不为空，用提示块逐行原样显示：
   - 左侧 1px `var(--accent)` 线，内边距 12px 16px，背景 `var(--accent-soft)`；
   - 第一行前加 `上游声明：`。

### 下方三栏

直接复用 `docs.html` 的 `.docs` 网格：`aside.docs-side` + `article.doc` + `aside.doc-toc`，类名相同。

**左栏：该 Skill 的文件树**

- 按目录分组，组名为目录路径，根目录写 `/`。
- `.md` 文件链接到 `#skill/<id>/<path>`。
- 其他文件直接链接到原始文件，新标签打开，后附灰色字节数（如 `12.3 KB`）。
- 当前文件高亮，样式同 docs 的当前项。

**中栏：正文**

- fetch `<dir>/<path>`，调用：

  ```js
  MAMarkdown.render(md, '<dir>/<path>', heads, { link })
  ```

- `link` 的规则：
  - 解析后指向本 Skill 目录内的 `.md` → `#skill/<id>/<相对 dir 的路径>`；
  - 指向本 Skill 目录内的其他文件 → 原始文件路径；
  - 指向本 Skill 目录外、但仍在 `resources/` 内的文件 → 原始文件路径；
  - 外部 URL → 原样。
- 顶部加 `.doc-path`：左边 `<repo> / <dir 相对 resources/skills 的路径>/<path>`，右边 `原始 Markdown` 链接。

**右栏**：本页目录，生成方式同 docs。

## 4.8 移动端

- 宽 ≤ 900px 时，侧栏行为同 library：由 `筛选` 按钮展开。
- Skill 阅读页按 `docs.css` 的现有断点退化。
- 390×844 视口下不得出现横向滚动。

# 5. 文档

## 5.1 新增 `docs/resources.md`

全文照抄：

````markdown
# 外部资源

资源库收录外部仓库的内容，原样保存在 `resources/`，不改写、不翻译。每个目录下的 `UPSTREAM.json` 记录上游地址、提交、收录日期、许可与逐文件 SHA256；`node scripts/check.mjs` 会核对文件与清单一致。

| 目录 | 上游 | 内容 | 许可 |
| --- | --- | --- | --- |
| `resources/opus-videos/` | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 703 条 Claude Opus 5.5 视频的提示词，附原帖与复刻链接 | 列表 MIT；视频与提示词归各作者 |
| `resources/skills/garden-skills/` | [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | 6 个 Skill，含用代码做短片的 motion-showreel 与网页视频演示 web-video-presentation（未收录上游宣传站点 `website/`） | MIT |
| `resources/skills/agent-anime-skill/` | [waterpro/agent-anime-skill](https://github.com/waterpro/agent-anime-skill) | ai-handdrawn-video：AI 手书 / PV 的分阶段制作流程 | 未声明许可；上游注明仅供个人娱乐、请勿商业用途 |

## 更新

用上游的新克隆重新收录（会清空目标目录后重写）：

```
node scripts/vendor-resources.mjs opus-videos <克隆目录> --commit <sha>
node scripts/vendor-resources.mjs garden-skills <克隆目录> --commit <sha>
node scripts/vendor-resources.mjs agent-anime-skill <克隆目录> --commit <sha>
```

然后运行 `node scripts/build.mjs` 与 `node scripts/check.mjs`。

## 署名

视频与提示词的版权属于各自作者，资源库在每条详情页标明作者与原帖。若作者希望修改或移除条目，请到上游仓库提出。
````

## 5.2 `README.md`

**(1) 替换案例小节**：替换 `## 收录内容` → `### 案例` 下的内容，范围从表头那一行起，到 `将在后续迭代迁移。` 那一段为止，换成以下内容：

```markdown
| 案例 | 载体 | 证据 | 时长 |
| --- | --- | --- | --- |
| [地图巡礼 · 游戏过场式旅行影像](demos/cases/map-pilgrimage/) | 影像视频 / 交互展示台 | 逐帧/源码实测 | 60s |
| [莱茵生命档案终端](demos/cases/archive-os/) | 交互操作台 / 交互展示台 | 逐帧/源码实测 | 77.6s |
| [终末地 · 集成工业协议](demos/cases/industrial-protocol/) | 影像视频 / 交互展示台 | 本地转译 | 60s |

三个案例都来自用户提供的参考或真实存在的界面：地图巡礼转译自用户提供的参考；莱茵生命档案终端是 [RhineLabUI](https://github.com/LBEILC/RhineLabUI)（MIT）的忠实移植，沿用其代码、模型、字体、音频与档案内容；终末地工业协议照《明日方舟：终末地》集成工业系统（AIC）的真实界面与交互重做，美术为生成的平面风格素材，不含官方图像。

地图巡礼与工业协议采用横屏 1920×1080 / 竖屏 1080×1920 两套固定画幅构图，档案终端为横屏 1920×1080；三者都整体等比缩放，可离线逐帧导出视频。地图巡礼从上海飞抵关西机场，走访京都伏见稻荷、鸭川、奈良公园与大阪道顿堀，地图瓦片按镜头计划渐进下载，缓冲不足时暂停等待。档案终端以上游界面配合虚拟时钟重放开机、档案浏览与解密。工业协议用 60 秒走完标题、AIC 探索界面、放置蓝图、配件机面板、干员升级、分享蓝图与收尾七个场景。

地图巡礼的 12 个巧思使用固定舞台、预加载与乐谱；档案终端与工业协议各自的 5 个巧思仍是自适应布局与原有音效调用，将在后续迭代迁移。
```

**(2) 新增外部资源小节**：放在 `## 收录内容` 的最后，即下一个 `## ` 标题之前：

```markdown
### 外部资源

[资源库](resources.html) 原样收录外部仓库的视频提示词与 Skill，保存在 `resources/`，保留上游许可与署名，详见 [docs/resources.md](docs/resources.md)。

| 资源 | 内容 | 上游 | 许可 |
| --- | --- | --- | --- |
| 视频提示词 | 703 条 Claude Opus 5.5 视频的提示词，附原帖与复刻链接 | [yihui-dev/awesome-opus5-5-videos](https://github.com/yihui-dev/awesome-opus5-5-videos) | 列表 MIT；视频与提示词归各作者 |
| Skills | 6 个 Skill，含 motion-showreel、web-video-presentation | [ConardLi/garden-skills](https://github.com/ConardLi/garden-skills) | MIT |
| Skills | ai-handdrawn-video：AI 手书 / PV 制作流程 | [waterpro/agent-anime-skill](https://github.com/waterpro/agent-anime-skill) | 未声明许可；上游注明仅供个人娱乐、请勿商业用途 |
```

**(3) 其余旧描述**：README 其他地方若仍用“FIELDWORK”或“17s”描述现有案例，列进报告，不要改。

## 5.3 `AGENT.md`

在描述 `agent/catalog.json` 的位置之后加一句；找不到这个位置就加在文件末尾，并在报告中说明：

```
`agent/catalog.json` 的 `resources` 字段列出资源库的视频提示词数据与 Skill 路径（外部收录，许可各异，使用前看对应 `UPSTREAM.json`）。
```

# 6. 验证

全部在本工作树根目录执行，使用下列原命令。

1. **构建与检查**：
   - 依次运行 `node scripts/build.mjs`、`node scripts/check.mjs`（必须退出 0）、`npm run build:site`。
   - 确认 `dist/resources/` 存在，且其文件数等于三个 UPSTREAM.json 中 files 数之和再加 3。
2. **逐字节核对**：
   - 写临时脚本，放在 `dev/wip/Tres/tools/`。
   - 把三个收录目录与上游克隆逐文件比较 sha256（排除 excluded）。
   - 报告一致数与不一致数；不一致数必须为 0。
3. **启动服务器**：`node scripts/serve.mjs --port 4328`。
4. **smoke**：连续运行 2 次，每次都必须 25/25：

   ```
   node --import ./dev/wip/T4a/tools/direct-browser.mjs scripts/smoke.mjs --base http://localhost:4328
   ```

   资源库不是条目，不进 smoke。这一步只用来确认现有条目没有被破坏。
5. **页面检查脚本** `dev/wip/Tres/tools/check-pages.mjs`：
   - 用 `scripts/lib/cdp.mjs` 启动浏览器，逐项断言；任一失败则退出码非 0。
   - (a) 打开 `resources.html#videos`：没有控制台错误，结果行为 `共 703 条`，首屏 48 张卡。
   - (b) 依次点击 `分类 / 3D 场景`、`技术标签 / shader`、`提示词完整度 / 仅原帖文字`：每一步的结果数都与用 `MA_RES` 自行计算的数一致。
   - (c) 703 个 slug 的 `resources/opus-videos/prompts/<slug>.md` 全部能 fetch 到 200。
   - (d) 打开 5 条 `#video/<slug>`，其中至少一条 part、一条 post：
     - 正文中有 `## Prompt` 对应的 h2 和代码块；
     - 在页面里调用“复制提示词”的逻辑并读回，所得文本与 JSON 中的 prompt 完全相等。
   - (e) 7 个 Skill 中所有 `.md` 都打开阅读视图，逐个 fetch 正文里的站内链接与图片，列出全部 404：
     - 上游原本就缺的文件（inventory 已列）单独列出，不算失败；
     - 其余的 404 算失败。
   - (f) `docs.html` 的三篇像素一致（第 4.1 节）。
   - (g) 390×844 视口下，以下三处的 `document.documentElement.scrollWidth` 都 ≤ 390：
     - `resources.html#videos`
     - `#video/<slug>`
     - `#skill/motion-showreel`
6. **截图**：存到 `dev/shots/Tres/`，每张都要打开查看。
   - 1440×900：
     - `#videos`
     - `#videos?cat=3d`
     - `#video/<一条有 title 的>`
     - `#video/<一条 post>`
     - `#skills`
     - `#skill/motion-showreel`
     - `#skill/ai-handdrawn-video`
     - `#skill/web-video-presentation/references/CHAPTER-CRAFT.md`
   - 390×844：
     - `#videos`
     - `#video/<同上那条有 title 的>`
     - `#skill/motion-showreel`
7. **报告** `dev/reports/Tres-a.md`：
   - 逐节核对表：本方案第 1–6 节每一条，写“已做”“偏离（原因）”或“未做”；
   - 逐字节核对结果；
   - 两次 smoke 的结果行；
   - check-pages 全部断言的结果；
   - 上游缺失文件清单；
   - 截图索引；
   - “待决定”一节。

# 7. 允许修改

- **配置**：`.gitattributes`
- **脚本**：
  - `scripts/vendor-resources.mjs`（新）
  - `scripts/lib/catalog.mjs`
  - `scripts/build.mjs`
  - `scripts/check.mjs`
  - `scripts/build-static.mjs`
- **收录内容与生成物**：
  - `resources/**`：只能由 vendor 脚本写入
  - `data/resources.js` 与其他构建生成物
- **页面与前端资源**：
  - `assets/markdown.js`（新）
  - `assets/docs.js`
  - `docs.html`
  - `assets/site.js`：仅 NAV
  - `assets/resources.js`（新）
  - `assets/resources.css`（新）
  - `resources.html`（新）
- **文档**：
  - `docs/resources.md`（新）
  - `README.md`：仅第 5.2 节
  - `AGENT.md`：仅第 5.3 节
- **过程产物**：`dev/wip/Tres/**`、`dev/shots/Tres/**`、`dev/reports/Tres-a.md`

不 commit、不 push、不切分支。不改 `demos/`、`entries/`、`kit/`、`vendor/`。
