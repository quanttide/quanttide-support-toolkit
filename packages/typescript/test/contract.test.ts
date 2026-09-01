// 契约测试：以根 tests/ 的 Schema + Fixture 验证 TypeScript 模型。
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { parseComment, parseSolution, parseTicket } from '../src/models';

const here = dirname(fileURLToPath(import.meta.url));
const fixturesDir = join(here, '../../../tests/fixtures');
const schemasDir = join(here, '../../../tests/schemas');

function fixture(name: string): unknown {
  return JSON.parse(readFileSync(join(fixturesDir, `${name}.json`), 'utf8'));
}

function hasRequired(data: Record<string, unknown>, schemaName: string) {
  const schema = JSON.parse(
    readFileSync(join(schemasDir, `${schemaName}.json`), 'utf8'),
  ) as { required?: string[] };
  const missing = (schema.required ?? []).filter((k) => !(k in data));
  expect(missing).toEqual([]);
}

describe('Ticket 契约', () => {
  it('fixture 覆盖必填字段', () => {
    const data = fixture('ticket') as Record<string, unknown>;
    hasRequired(data, 'ticket');
    const comments = data['comments'] as unknown as Record<string, unknown>[];
    hasRequired(comments[0]!, 'comment');
  });

  it('解析且关键字段符合预期', () => {
    const t = parseTicket(fixture('ticket'));
    expect(t.id).toBe('t-0192');
    expect(t.number).toBe(192);
    expect(t.state).toBe('closed');
    expect(t.author).toBe('黄亮');
    expect(t.labels).toEqual(['faq']);
    expect(t.comments).toHaveLength(2);
    // 人工/AI 区分是 comment.author 的属性
    expect(t.comments[1]?.author).toBe('ai');
    expect(t.closed_at).toBe('2026-09-01T17:16:00+08:00');
  });

  it('round-trip：序列化回 JSON 再解析值不变', () => {
    const t = parseTicket(fixture('ticket'));
    const again = parseTicket(JSON.parse(JSON.stringify(t)));
    expect(again).toEqual(t);
  });

  it('非法 state 拒绝', () => {
    const bad = { ...(fixture('ticket') as object), state: 'done' };
    expect(() => parseTicket(bad)).toThrow(/state/);
  });

  it('open 态无 closed_at', () => {
    const t = parseTicket(fixture('ticket'));
    t.state = 'open';
    delete t.closed_at;
    expect('closed_at' in t).toBe(false);
  });
});

describe('Comment 契约', () => {
  it('解析', () => {
    const data = fixture('ticket') as { comments: unknown[] };
    const c = parseComment(data.comments[0]);
    expect(c.author).toBe('赵子奕');
    expect(c.created_at).toBe('2026-09-01T17:14:00+08:00');
  });
});

describe('Solution 契约', () => {
  it('fixture 覆盖必填字段 + 解析', () => {
    const data = fixture('solution') as Record<string, unknown>;
    hasRequired(data, 'solution');
    const s = parseSolution(data);
    expect(s.id).toBe('s-voucher-usage');
    expect(s.title).toBe('代金券怎么用、怎么挣');
    expect(s.content).toContain('来源：Ticket #192');
  });

  it('round-trip', () => {
    const s = parseSolution(fixture('solution'));
    const again = parseSolution(JSON.parse(JSON.stringify(s)));
    expect(again).toEqual(s);
  });
});
