# quanttide-support（Rust）

量潮客户支持领域模型的 Rust SDK。模型以 docs/specification（quanttide-support 客户支持规范）为单一事实源，JSON 字段名用规范示例的 snake_case（`created_at` / `closed_at`），Rust 字段名天然 snake_case 无需 rename。契约测试引用根 `tests/` 的 Schema 与 Fixture。

```rust
use quanttide_support::{Ticket, Comment, Solution};
```

```bash
cargo test
```
