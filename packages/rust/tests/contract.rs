//! 契约测试：以根 tests/ 的 Schema + Fixture 为单一事实源验证 Rust 模型。

use std::fs;

use quanttide_support::{Comment, Solution, Ticket};

fn fixture(name: &str) -> serde_json::Value {
    let path = format!("../../tests/fixtures/{name}.json");
    let raw = fs::read_to_string(&path)
        .unwrap_or_else(|e| panic!("read {path}: {e}"));
    serde_json::from_str(&raw).unwrap_or_else(|e| panic!("parse {path}: {e}"))
}

fn has_required(obj: &serde_json::Map<String, serde_json::Value>, required: &[&str]) {
    for k in required {
        assert!(obj.contains_key(*k), "缺少必填字段 {k}");
    }
}

#[test]
fn ticket_contract() {
    let v = fixture("ticket");
    let obj = v.as_object().expect("ticket 应为对象");
    has_required(
        obj,
        &["id", "number", "title", "body", "state", "author", "labels", "comments", "created_at"],
    );
    // state 无中间态
    let state = obj["state"].as_str().unwrap();
    assert!(
        state == "open" || state == "closed",
        "state = {state}，只能是 open|closed"
    );

    let t: Ticket = serde_json::from_value(v).expect("解析 Ticket");
    assert_eq!(t.id, "t-0192");
    assert_eq!(t.number, 192);
    assert_eq!(t.state, "closed");
    assert_eq!(t.labels, vec!["faq"]);
    assert_eq!(t.comments.len(), 2);
    // 人工/AI 区分是 comment.author 的属性
    assert_eq!(t.comments[1].author, "ai");
    assert_eq!(
        t.closed_at.as_deref(),
        Some("2026-09-01T17:16:00+08:00")
    );
}

#[test]
fn ticket_round_trip() {
    let v = fixture("ticket");
    let t: Ticket = serde_json::from_value(v).expect("解析 Ticket");
    let out = serde_json::to_value(&t).expect("序列化 Ticket");
    let again: Ticket = serde_json::from_value(out).expect("再解析");
    assert_eq!(again, t);
}

#[test]
fn comment_contract() {
    let v = fixture("ticket");
    let comments = v["comments"].as_array().expect("comments 应为数组");
    let first = comments[0].as_object().expect("comment 应为对象");
    has_required(first, &["author", "body", "created_at"]);
    let c: Comment = serde_json::from_value(comments[0].clone()).expect("解析 Comment");
    assert_eq!(c.author, "赵子奕");
    assert_eq!(c.created_at, "2026-09-01T17:14:00+08:00");
}

#[test]
fn solution_contract_and_round_trip() {
    let v = fixture("solution");
    let obj = v.as_object().expect("solution 应为对象");
    has_required(obj, &["id", "title", "content"]);

    let s: Solution = serde_json::from_value(v.clone()).expect("解析 Solution");
    assert_eq!(s.id, "s-voucher-usage");
    assert_eq!(s.title, "代金券怎么用、怎么挣");
    assert!(s.content.contains("来源：Ticket #192"));

    let out = serde_json::to_value(&s).expect("序列化 Solution");
    let again: Solution = serde_json::from_value(out).expect("再解析");
    assert_eq!(again, s);
}
