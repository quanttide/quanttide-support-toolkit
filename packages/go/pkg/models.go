// Package quanttide_support 提供客户支持领域模型。
//
// 模型以 docs/specification（quanttide-support 客户支持规范）
// 为单一事实源：Ticket × Solution 两个业务实体。
// JSON 标签与规范 JSON 示例一一对应（snake_case：created_at / closed_at），
// 不做 case 转换层，供各应用与工具复用。
package quanttide_support

// Comment 是交流流中的一条评论：客户 / 支持 / ai 同流发言。
// 人工/AI 的区分是 Author 的属性，不单列字段。
type Comment struct {
	Author    string `json:"author"`
	Body      string `json:"body"`
	CreatedAt string `json:"created_at"`
}

// Ticket 是一次客户问题的提出与解答，格式对齐 GitHub Issue。
//
// 一问多答 = comments（无独立 Reply 实体）；State 只有 open / closed，
// 无"已解决"中间态——是否真正解决由交流内容体现。
type Ticket struct {
	ID        string    `json:"id"`
	Number    int       `json:"number"` // 仓库内递增编号，对外引用用 #number
	Title     string    `json:"title"`
	Body      string    `json:"body"`
	State     string    `json:"state"` // "open" / "closed"
	Author    string    `json:"author"`
	Labels    []string  `json:"labels,omitempty"` // 轻量标签（faq / bug / feature-request）
	Comments  []Comment `json:"comments,omitempty"`
	CreatedAt string    `json:"created_at"`
	ClosedAt  string    `json:"closed_at,omitempty"` // 可选
}

// Solution 是沉淀下来的可复用知识：从已 closed 的 Ticket 蒸馏创建，
// 不存在凭空的解决方案。只有三个字段——Title 是"什么问题"，Content 是"怎么解决"。
// 来源引用写在 Content 开头（如"来源：Ticket #192"）；失效走归档不删除。
type Solution struct {
	ID      string `json:"id"`
	Title   string `json:"title"`
	Content string `json:"content"`
}
