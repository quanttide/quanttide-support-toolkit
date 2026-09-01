/// 客户支持领域模型：Ticket（工单，格式对齐 GitHub Issue）× Comment（评论流）。
///
/// JSON 标签与 docs/specification 的 JSON 示例一一对应（snake_case）。
library;

T _require<T>(Map<String, dynamic> json, String key) => json[key] as T;

List<T> _listOf<T>(Object? raw, T Function(Map<String, dynamic>) fromJson) =>
    (raw as List?)?.cast<Map<String, dynamic>>().map(fromJson).toList() ?? [];

List<String> _stringList(Object? raw) =>
    (raw as List?)?.cast<String>() ?? const [];

Map<String, dynamic> _compact(Map<String, dynamic> json) =>
    json..removeWhere((_, v) => v == null);

/// 交流流中的一条评论：客户 / 支持 / ai 同流发言。
class Comment {
  final String author;
  final String body;
  final String createdAt;

  const Comment({
    required this.author,
    required this.body,
    required this.createdAt,
  });

  factory Comment.fromJson(Map<String, dynamic> json) => Comment(
        author: _require(json, 'author'),
        body: _require(json, 'body'),
        createdAt: _require(json, 'created_at'),
      );

  Map<String, dynamic> toJson() => {
        'author': author,
        'body': body,
        'created_at': createdAt,
      };
}

/// Ticket：一次客户问题的提出与解答。
/// 一问多答 = issue + comments；state 只有 open / closed；人工/AI 的区分是 comment.author 的属性。
class Ticket {
  final String id;
  final int number;
  final String title;
  final String body;

  /// open | closed
  final String state;
  final String author;
  final List<String> labels;
  final List<Comment> comments;
  final String createdAt;
  final String? closedAt;

  const Ticket({
    required this.id,
    required this.number,
    required this.title,
    required this.body,
    required this.state,
    required this.author,
    this.labels = const [],
    this.comments = const [],
    required this.createdAt,
    this.closedAt,
  });

  factory Ticket.fromJson(Map<String, dynamic> json) => Ticket(
        id: _require(json, 'id'),
        number: _require(json, 'number'),
        title: _require(json, 'title'),
        body: _require(json, 'body'),
        state: _require(json, 'state'),
        author: _require(json, 'author'),
        labels: _stringList(json['labels']),
        comments: _listOf(json['comments'], Comment.fromJson),
        createdAt: _require(json, 'created_at'),
        closedAt: json['closed_at'],
      );

  Map<String, dynamic> toJson() => _compact({
        'id': id,
        'number': number,
        'title': title,
        'body': body,
        'state': state,
        'author': author,
        'labels': labels,
        'comments': comments.map((c) => c.toJson()).toList(),
        'created_at': createdAt,
        'closed_at': closedAt,
      });
}
