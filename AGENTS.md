# Agent Instructions

## 定位

量潮客户支持工具箱：封装客户支持领域模型（Ticket × Solution）的共通代码，供各应用与工具复用，提高系统一致性。

## 模型事实源

**docs/specification（quanttide-specification-of-customer-support）是领域模型单一事实源**，各语言包模型与 JSON 标签必须与其一一对应：

- 实体：Ticket（工单，对齐 GitHub Issue）× Comment（评论流）× Solution（解决方案，从已 closed 的 Ticket 蒸馏）
- JSON 标签：snake_case，与规范 JSON 示例一致（`created_at` / `closed_at`），不做 case 转换层
- 语义约束随模型携带：state 仅 open/closed；人工/AI 区分是 comment.author 的属性；Solution 仅 id/title/content 三字段

## 契约测试

- 根 `tests/` 的 schemas/ + fixtures/ 是跨语言契约的客观依据（变更先行：先改规范 → 同步 Schema/Fixture → 各语言跟进）
- 语言包升级前契约测试必须全绿；未对齐只允许发 alpha 版本
- 对外引用统一命名 `quanttide-support`（Dart 包 quanttide_support / TS、Rust、Go import 引用同此）

## 发布标签

Go 包遵循双标签制（对齐 course-toolkit 惯例）：主标签 `go/vX.Y.Z` 挂 GitHub Release；同 commit 必须追加 `packages/go/X.Y.Z` 工具链别名标签（Go 子目录模块硬性要求，否则 `go get` 报 unknown revision）。别名不挂 Release、不进 CHANGELOG。

## 提交规则

1. 每次 commit 以后自动 push。
2. 本仓库作为子模块挂载于 quanttide-support 的 `packages/quanttide-support-toolkit`：本仓库 commit + push → 回父仓库更新指针 commit + push → 根仓库 quanttide 同法更新。
3. 提交信息用 Conventional Commits（`feat`/`fix`/`docs`/`chore`）。
