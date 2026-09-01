# quanttide-support（TypeScript）

量潮客户支持领域模型的 TypeScript SDK。模型与 JSON 标签以 docs/specification（quanttide-specification-of-customer-support）为单一事实源，契约测试引用根 `tests/` 的 Schema 与 Fixture。

- `Ticket`：工单（对齐 GitHub Issue），JSON key 用规范示例的 snake_case（`created_at` / `closed_at`）
- `Comment`：交流流中的一条评论，`author` 携带人工/AI 区分
- `Solution`：解决方案三字段（id / title / content），从已 closed 的 Ticket 蒸馏创建

```bash
npm install
npm run typecheck
npm test
```
