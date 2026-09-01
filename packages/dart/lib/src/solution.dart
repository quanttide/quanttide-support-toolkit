/// 客户支持领域模型：Solution（解决方案，从已 closed 的 Ticket 蒸馏创建）。
///
/// JSON 标签与 docs/specification 的 JSON 示例一一对应（snake_case）。
library;

T _require<T>(Map<String, dynamic> json, String key) => json[key] as T;

Map<String, dynamic> _compact(Map<String, dynamic> json) =>
    json..removeWhere((_, v) => v == null);

/// Solution：沉淀下来的可复用知识。只有三个字段——title 是"什么问题"，content 是"怎么解决"。
class Solution {
  final String id;
  final String title;
  final String content;

  const Solution({
    required this.id,
    required this.title,
    required this.content,
  });

  factory Solution.fromJson(Map<String, dynamic> json) => Solution(
        id: _require(json, 'id'),
        title: _require(json, 'title'),
        content: _require(json, 'content'),
      );

  Map<String, dynamic> toJson() => _compact({
        'id': id,
        'title': title,
        'content': content,
      });
}
