# 契约测试

跨语言数据模型与 docs/specification 一致性验证。**单一事实源是根 `tests/` 下的 Schema 与 Fixture**，各语言在自身包内编写契约测试并引用它们。

## 各包状态

| 包 | 状态 | 说明 |
|---|------|------|
| `dart/` | ✅ 已对齐 | Ticket × Comment × Solution；JSON 标签 snake_case，与规范示例一致 |
| `typescript/` | ✅ 已对齐 | 同构模型 + 解析校验（必填字段存在性、state 枚举） |
| `go/` | ✅ 已对齐 | pkg 包 quanttide_support；契约测试零依赖（必填字段 + round-trip） |
| `rust/` | ✅ 已对齐 | crate quanttide-support；serde 模型 + 集成测试 |

## 设计

- **实体范围**：Ticket → Comment（评论流）+ Solution（蒸馏知识）——文档规范只有这两个业务实体。
- **字段命名：snake_case**——即 docs/specification JSON 示例的标签（`created_at` / `closed_at`），各语言包不做 case 转换层。
- **语义约束**（模型本身携带，非应用层）：
  - `state` 只有 open / closed，无"已解决"中间态；
  - 人工 / AI 的区分是 `comment.author` 的属性，不单列字段；
  - Solution 从已 closed 的 Ticket 蒸馏创建，`content` 开头写来源引用（如"来源：Ticket #192"）。

```
tests/
  README.md
  schemas/    # JSON Schema（draft-07）：ticket / comment / solution
  fixtures/   # 规范 JSON 示例标本：ticket（#192 代金券）/ solution（s-voucher-usage）
packages/
  dart/test/contract_test.dart
  typescript/test/contract.test.ts
```

## 测试内容

1. **必填字段存在性** — fixture 覆盖 Schema 的 `required`；
2. **Fixture 反序列化** — 共享标本能被正确解析且关键字段值符合预期；
3. **Round-trip** — 反序列化 → 再序列化 → 再解析，值不变；
4. TypeScript 侧额外校验 state 枚举与非法输入拒绝。

## 运行

```bash
cd packages/dart && dart test
cd packages/typescript && npm test
cd packages/go && go test ./... -count=1
cd packages/rust && cargo test
```

## 工作流

1. **规范或字段变更**：先改 docs/specification → 同步根 `tests/` 的 Schema + fixture → 各语言模型与 JSON 标签跟进；
2. 各语言包升级前必须契约测试全绿（对齐惯例：契约测试是版本客观依据，未对齐只允许发 alpha）。
