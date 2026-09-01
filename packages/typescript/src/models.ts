/**
 * 量潮客户支持领域模型：Ticket（工单，对齐 GitHub Issue）× Comment × Solution。
 *
 * JSON 标签与 docs/specification 的 JSON 示例一一对应（snake_case）：
 * `created_at` / `closed_at` 等。
 */

/** 交流流中的一条评论：客户 / 支持 / ai 同流发言。 */
export interface Comment {
  author: string;
  body: string;
  created_at: string;
}

/** Ticket：一次客户问题的提出与解答。state 只有 open / closed。 */
export interface Ticket {
  id: string;
  /** 仓库内递增编号，对外引用用 #number */
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed';
  author: string;
  labels: string[];
  comments: Comment[];
  created_at: string;
  closed_at?: string;
}

/** Solution：从已 closed 的 Ticket 蒸馏创建的可复用知识。只有三个字段。 */
export interface Solution {
  id: string;
  title: string;
  content: string;
}

// ---------- 解析辅助（契约校验：必填字段存在性） ----------

type JsonRecord = Record<string, unknown>;

function requireString(obj: JsonRecord, key: string): string {
  const v = obj[key];
  if (typeof v !== 'string') throw new Error(`${key} 缺失或类型错误`);
  return v;
}

function requireNumber(obj: JsonRecord, key: string): number {
  const v = obj[key];
  if (typeof v !== 'number') throw new Error(`${key} 缺失或类型错误`);
  return v;
}

function requireStringArray(obj: JsonRecord, key: string): string[] {
  const v = obj[key];
  if (!Array.isArray(v) || v.some((x) => typeof x !== 'string')) {
    throw new Error(`${key} 缺失或类型错误`);
  }
  return v as string[];
}

/** 解析 Comment，校验必填字段。 */
export function parseComment(raw: unknown): Comment {
  if (typeof raw !== 'object' || raw === null) throw new Error('Comment 必须为对象');
  const obj = raw as JsonRecord;
  return {
    author: requireString(obj, 'author'),
    body: requireString(obj, 'body'),
    created_at: requireString(obj, 'created_at'),
  };
}

/** 解析 Ticket，校验必填字段（含 comment 列表）。 */
export function parseTicket(raw: unknown): Ticket {
  if (typeof raw !== 'object' || raw === null) throw new Error('Ticket 必须为对象');
  const obj = raw as JsonRecord;
  const state = requireString(obj, 'state');
  if (state !== 'open' && state !== 'closed') {
    throw new Error(`state 必须是 open|closed，实际为 ${state}`);
  }
  const commentsRaw = obj['comments'];
  if (!Array.isArray(commentsRaw)) throw new Error('comments 缺失或类型错误');
  return {
    id: requireString(obj, 'id'),
    number: requireNumber(obj, 'number'),
    title: requireString(obj, 'title'),
    body: requireString(obj, 'body'),
    state,
    author: requireString(obj, 'author'),
    labels: requireStringArray(obj, 'labels'),
    comments: commentsRaw.map(parseComment),
    created_at: requireString(obj, 'created_at'),
    ...(obj['closed_at'] !== undefined
      ? { closed_at: requireString(obj, 'closed_at') }
      : {}),
  };
}

/** 解析 Solution，校验必填字段。 */
export function parseSolution(raw: unknown): Solution {
  if (typeof raw !== 'object' || raw === null) throw new Error('Solution 必须为对象');
  const obj = raw as JsonRecord;
  return {
    id: requireString(obj, 'id'),
    title: requireString(obj, 'title'),
    content: requireString(obj, 'content'),
  };
}
