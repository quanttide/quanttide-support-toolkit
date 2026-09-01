# 量潮客户支持工具箱

客户支持领域的共通代码工具箱：封装领域模型，供各应用与工具复用，提高系统一致性。**领域模型的事实源是 docs/specification（quanttide-specification-of-customer-support）**——Ticket × Solution 两个实体，各语言包模型与 JSON 标签必须与其一一对应。

## 项目结构

```
quanttide-support-toolkit/
├── AGENTS.md          # AI 开发指引
├── CHANGELOG.md       # 变更日志
├── packages/
│   ├── dart/          # Dart SDK（Ticket × Comment × Solution）
│   └── typescript/    # TypeScript SDK（同构模型 + 解析校验）
└── tests/             # 跨语言契约测试：schemas/（JSON Schema）+ fixtures/（标本）
```

## 模型

| 实体 | 说明 | 关键字段 |
|---|---|---|
| `Ticket` | 工单，格式对齐 GitHub Issue | id / number / title / body / state(open\|closed) / author / labels / comments / created_at / closed_at |
| `Comment` | 交流流中的一条评论，人工/AI 区分是 `author` 的属性 | author / body / created_at |
| `Solution` | 从已 closed 的 Ticket 蒸馏创建，只有三字段 | id / title / content |

JSON 标签遵循 docs/specification 的 JSON 示例（snake_case：`created_at`、`closed_at`）。

## 验证

```bash
# Dart
cd packages/dart && dart pub get && dart test

# TypeScript
cd packages/typescript && npm install && npm run typecheck && npm test
```
