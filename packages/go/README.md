# quanttide-support-toolkit/packages/go

量潮客户支持领域模型的 Go SDK。模型以 docs/specification（quanttide-support 客户支持规范）为单一事实源，JSON 标签用规范示例的 snake_case（`created_at` / `closed_at`），契约测试引用根 `tests/` 的 Schema 与 Fixture。

```go
import quanttide_support "github.com/quanttide/quanttide-support-toolkit/packages/go/pkg"
```

```bash
go test ./... -count=1
```

发布遵循仓库惯例 `<scope>/vX.Y.Z`（主标签挂 Release）+ `packages/go/X.Y.Z`（工具链别名，Go 子目录模块硬性要求，见根 CONTRIBUTING）。
