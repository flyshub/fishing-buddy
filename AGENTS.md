## 🧭 核心原则（强制遵守）

### 1. 先思考，再行动（Think Before Coding）

- 任何任务开始前，必须先确认目标、边界条件、验收标准。
- 需求模糊时，主动提出澄清问题，禁止自行猜测或沉默犯错。
- 先输出思路、方案或伪代码，再进入实现阶段。

### 2. 极简优先（Simplicity First）

- 用最直接、最易懂的方式实现功能，拒绝过度设计和无用抽象。
- 不引入不必要的依赖、设计模式或架构。
- 代码以“能跑、能读、能维护”为首要目标。

### 3. 精准修改（Precise Modification）

- 只修改与当前任务直接相关的代码，不附带重构、优化或无关改动。
- 每次改动范围要小、可追溯，不破坏项目现有结构和风格。
- 保持文件的原有格式、命名和编码规范。

### 4. 目标驱动（Goal-Driven Execution）

- 所有任务必须有明确的成功标准，完成后主动验证并闭环。
- 遇到阻碍或无法完成时，立即反馈问题，而不是硬写错误代码。

# Agent skills

### Issue tracker

Issues are tracked as local markdown files in `issues/` directory. See `docs/agents/issue-tracker.md`.

### Triage labels

Five canonical labels: `needs-triage`, `needs-info`, `ready-for-agent`, `ready-for-human`, `wontfix`. See `docs/agents/triage-labels.md`.

### Domain docs

Single-context layout: one `CONTEXT.md` at root + `docs/adr/` at root. See `docs/agents/domain.md`.
