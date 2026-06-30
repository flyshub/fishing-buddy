---
number: 0003
title: "记录空军"
status: ready-for-agent
created: 2026-06-05
updated: 2026-06-05
---

# 记录空军

## What to build

用户开始记录 → 完成 GPS + 天气 → 不添加任何鱼种 → 结束出钓 → 该 Trip 标记为"空军"。验证记录流程的边界情况（零渔获），确保"没钓到鱼"也是一条有价值的记录。

## 用户故事

- As a fisherman, I want to manually confirm the end time of my trip, so that trip duration is accurate without extra effort. (US 14)
- As a fisherman, I want to see that trips where I caught nothing are recorded as 空军, so that my statistics accurately reflect my actual fishing experience. (US 19)

## Acceptance criteria

- [ ] 用户完成记录页流程后，未添加任何鱼种时弹出确认"本次是否空军？"
- [ ] 确认后创建一条 Trip 记录，end_time 已设置，species_list 为空
- [ ] 该 Trip 在历史列表中标记为"空军"（视觉上与普通 Trip 区分）
- [ ] 空军 Trip 的数据完整持久化（包含 GPS、天气数据）
- [ ] 历史列表可筛选显示"仅空军"或"非空军"
- [ ] 空军标记在数据层有明确标识（Trip 表中有对应字段或逻辑判断）
- [ ] 数据层单元测试通过（空 species_list 创建 Trip 的测试用例）

## Blocked by

- 0001-first-trip-end-to-end（需要记录页和数据层基础能力）

## Notes

- 空军是钓鱼文化中非常重要的概念（"空军了"= 一条没钓到），必须明确支持
- 这不是功能增强，是核心流程的必要边界情况
- 中鱼率（US 20）的计算依赖于此：`中鱼率 = (非空军 Trip 数 / 总 Trip 数) × 100`
