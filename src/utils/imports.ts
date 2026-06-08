import type { Transaction } from "../types";

const normalizeComment = (comment?: string) =>
  (comment ?? "")
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, "")
    .replace(/\s+/g, " ")
    .trim();

export const isPossibleDuplicateTransaction = (a: Transaction, b: Transaction) => {
  if (a.date !== b.date || a.amount !== b.amount || a.type !== b.type) return false;
  const left = normalizeComment(a.comment || a.category);
  const right = normalizeComment(b.comment || b.category);
  if (!left || !right) return a.category === b.category;
  return left.includes(right) || right.includes(left) || left === right;
};

export const findDuplicateTransactions = (existing: Transaction[], incoming: Transaction[]) =>
  incoming.filter((item) => existing.some((current) => isPossibleDuplicateTransaction(current, item)));

export const filterDuplicateTransactions = (existing: Transaction[], incoming: Transaction[]) =>
  incoming.filter((item) => !existing.some((current) => isPossibleDuplicateTransaction(current, item)));
