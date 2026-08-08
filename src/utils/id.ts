/**
 * Generates a locally-unique, sortable-enough id without pulling in a
 * uuid dependency. Good enough for a local-first SQLite ledger — every
 * id is only ever generated on-device, never coordinated across clients.
 */
export function generateId(prefix?: string): string {
  const time = Date.now().toString(36);
  const random = Math.random().toString(36).slice(2, 10);
  const id = `${time}${random}`;
  return prefix ? `${prefix}_${id}` : id;
}
