//! 量潮客户支持领域模型：Ticket × Solution。
//!
//! 模型以 docs/specification（quanttide-specification-of-customer-support）
//! 为单一事实源。JSON 字段名与规范示例一一对应（snake_case：
//! `created_at` / `closed_at`），Rust 字段名天然 snake_case，无需 rename。

use serde::{Deserialize, Serialize};

/// 交流流中的一条评论：客户 / 支持 / ai 同流发言。
/// 人工/AI 的区分是 `author` 的属性，不单列字段。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Comment {
    pub author: String,
    pub body: String,
    #[serde(rename = "created_at")]
    pub created_at: String,
}

/// Ticket：一次客户问题的提出与解答，格式对齐 GitHub Issue。
///
/// 一问多答 = comments（无独立 Reply 实体）；`state` 只有 open / closed，
/// 无"已解决"中间态。人工/AI 的区分在评论流的 `author` 里。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Ticket {
    pub id: String,
    /// 仓库内递增编号，对外引用用 #number
    pub number: u32,
    pub title: String,
    pub body: String,
    /// "open" | "closed"
    pub state: String,
    pub author: String,
    /// 轻量标签（faq / bug / feature-request）
    #[serde(default)]
    pub labels: Vec<String>,
    #[serde(default)]
    pub comments: Vec<Comment>,
    #[serde(rename = "created_at")]
    pub created_at: String,
    #[serde(rename = "closed_at", skip_serializing_if = "Option::is_none")]
    pub closed_at: Option<String>,
}

/// Solution：沉淀下来的可复用知识，从已 closed 的 Ticket 蒸馏创建。
///
/// 只有三个字段——`title` 是"什么问题"，`content` 是"怎么解决"。
/// 来源引用写在 content 开头（如"来源：Ticket #192"）；失效走归档不删除。
#[derive(Debug, Clone, PartialEq, Eq, Serialize, Deserialize)]
pub struct Solution {
    pub id: String,
    pub title: String,
    pub content: String,
}
