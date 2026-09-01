// 契约测试：以根 tests/ 的 Schema + Fixture 为单一事实源验证 Go 模型。
// 轻量实现（零依赖）：校验必填字段存在性 + 反序列化标本 + round-trip。
package quanttide_support_test

import (
	"encoding/json"
	"os"
	"testing"

	quanttide_support "github.com/quanttide/quanttide-support-toolkit/packages/go/pkg"
)

func fixture(t *testing.T, name string) []byte {
	t.Helper()
	data, err := os.ReadFile("../../../tests/fixtures/" + name + ".json")
	if err != nil {
		t.Fatalf("read %s: %v", name, err)
	}
	return data
}

func hasFields(t *testing.T, data []byte, required ...string) map[string]any {
	t.Helper()
	var m map[string]any
	if err := json.Unmarshal(data, &m); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	for _, k := range required {
		if _, ok := m[k]; !ok {
			t.Fatalf("fixture 缺少必填字段 %q", k)
		}
	}
	return m
}

func TestTicketContract(t *testing.T) {
	data := fixture(t, "ticket")
	m := hasFields(t, data,
		"id", "number", "title", "body", "state", "author", "labels", "comments", "created_at")

	var tk quanttide_support.Ticket
	if err := json.Unmarshal(data, &tk); err != nil {
		t.Fatalf("unmarshal ticket: %v", err)
	}
	if tk.ID != "t-0192" {
		t.Errorf("ID = %q, want t-0192", tk.ID)
	}
	if tk.Number != 192 {
		t.Errorf("Number = %d, want 192", tk.Number)
	}
	if tk.State != "closed" {
		t.Errorf("State = %q, want closed", tk.State)
	}
	if len(tk.Comments) != 2 {
		t.Fatalf("len(Comments) = %d, want 2", len(tk.Comments))
	}
	// 人工/AI 区分是 comment.author 的属性
	if tk.Comments[1].Author != "ai" {
		t.Errorf("Comments[1].Author = %q, want ai", tk.Comments[1].Author)
	}
	if tk.ClosedAt != "2026-09-01T17:16:00+08:00" {
		t.Errorf("ClosedAt = %q", tk.ClosedAt)
	}
	// 语义约束随模型携带：state 无中间态
	if st, ok := m["state"].(string); ok && st != "open" && st != "closed" {
		t.Errorf("state = %q，只能是 open|closed", st)
	}
}

func TestTicketRoundTrip(t *testing.T) {
	var tk quanttide_support.Ticket
	if err := json.Unmarshal(fixture(t, "ticket"), &tk); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	out, err := json.Marshal(tk)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	var again quanttide_support.Ticket
	if err := json.Unmarshal(out, &again); err != nil {
		t.Fatalf("re-unmarshal: %v", err)
	}
	if again.ID != tk.ID || again.Number != tk.Number || again.ClosedAt != tk.ClosedAt {
		t.Errorf("round-trip 值不一致: %+v vs %+v", again, tk)
	}
	if len(again.Comments) != len(tk.Comments) {
		t.Errorf("comments 数量不一致")
	}
}

func TestCommentContract(t *testing.T) {
	var m map[string]any
	if err := json.Unmarshal(fixture(t, "ticket"), &m); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	comments := m["comments"].([]any)
	first := comments[0].(map[string]any)
	for _, k := range []string{"author", "body", "created_at"} {
		if _, ok := first[k]; !ok {
			t.Errorf("comment 缺少必填字段 %q", k)
		}
	}
	if first["author"] != "赵子奕" {
		t.Errorf("author = %v, want 赵子奕", first["author"])
	}
}

func TestSolutionContract(t *testing.T) {
	data := fixture(t, "solution")
	hasFields(t, data, "id", "title", "content")

	var s quanttide_support.Solution
	if err := json.Unmarshal(data, &s); err != nil {
		t.Fatalf("unmarshal solution: %v", err)
	}
	if s.ID != "s-voucher-usage" {
		t.Errorf("ID = %q, want s-voucher-usage", s.ID)
	}
	if s.Content == "" {
		t.Error("Content 为空")
	}

	out, err := json.Marshal(s)
	if err != nil {
		t.Fatalf("marshal: %v", err)
	}
	var again quanttide_support.Solution
	if err := json.Unmarshal(out, &again); err != nil {
		t.Fatalf("re-unmarshal: %v", err)
	}
	if again.Content != s.Content {
		t.Error("round-trip 值不一致")
	}
}
