// 契约测试：以根 tests/ 的 Schema + Fixture 验证 Dart 模型。
// 数据形状与 docs/specification 的 JSON 示例对齐（snake_case）。
import 'dart:convert';
import 'dart:io';

import 'package:test/test.dart';
import 'package:quanttide_support/quanttide_support.dart';

final fixturesDir = Directory('${Directory.current.path}/../../tests/fixtures');
final schemasDir = Directory('${Directory.current.path}/../../tests/schemas');

Map<String, dynamic> fixture(String name) =>
    jsonDecode(File('${fixturesDir.path}/$name.json').readAsStringSync())
        as Map<String, dynamic>;

void hasRequired(Map<String, dynamic> data, String schemaName) {
  final schema = jsonDecode(
    File('${schemasDir.path}/$schemaName.json').readAsStringSync(),
  ) as Map<String, dynamic>;
  final missing =
      ((schema['required'] as List?) ?? []).cast<String>().where((k) => !data.containsKey(k));
  expect(missing, isEmpty, reason: '$schemaName 缺少必填字段');
}

void main() {
  test('ticket 契约 + 字段语义', () {
    final data = fixture('ticket');
    hasRequired(data, 'ticket');
    final t = Ticket.fromJson(data);
    expect(t.id, 't-0192');
    expect(t.number, 192);
    expect(t.state, 'closed');
    expect(t.author, '黄亮');
    expect(t.labels, ['faq']);
    expect(t.comments.length, 2);
    // 人工/AI 区分是 comment.author 的属性，不单列字段
    expect(t.comments[1].author, 'ai');
    expect(t.closedAt, '2026-09-01T17:16:00+08:00');
  });

  test('ticket round-trip', () {
    final data = fixture('ticket');
    final t = Ticket.fromJson(data);
    final again = Ticket.fromJson(t.toJson());
    expect(again.id, t.id);
    expect(again.number, t.number);
    expect(again.comments.length, t.comments.length);
    expect(again.comments[1].body, t.comments[1].body);
    expect(again.closedAt, t.closedAt);
  });

  test('ticket open 态无 closed_at', () {
    final t = Ticket(
      id: 't-9999',
      number: 9999,
      title: '测试工单',
      body: '正文',
      state: 'open',
      author: '客户甲',
      createdAt: '2026-09-01T10:00:00+08:00',
    );
    expect(t.toJson().containsKey('closed_at'), isFalse);
  });

  test('comment 契约', () {
    final data = fixture('ticket')['comments'] as List<dynamic>;
    hasRequired(data.first as Map<String, dynamic>, 'comment');
    final c = Comment.fromJson(data.first as Map<String, dynamic>);
    expect(c.author, '赵子奕');
    expect(c.createdAt, '2026-09-01T17:14:00+08:00');
  });

  test('solution 契约 + round-trip', () {
    final data = fixture('solution');
    hasRequired(data, 'solution');
    final s = Solution.fromJson(data);
    expect(s.id, 's-voucher-usage');
    expect(s.title, '代金券怎么用、怎么挣');
    expect(s.content, contains('来源：Ticket #192'));

    final again = Solution.fromJson(s.toJson());
    expect(again.id, s.id);
    expect(again.content, s.content);
  });
}
