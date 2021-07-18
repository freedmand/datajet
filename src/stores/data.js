import { cachedWritable } from "../lib/memory";

const { writable, derived } = require("svelte/store");

export const SQL = writable(null);
export const dbFile = cachedWritable("dbFile", null);
export const table = cachedWritable("table", null);

export const db = derived([SQL, dbFile], ([SQL, dbFile]) => {
  if (SQL == null) return null;
  if (dbFile == null) return null;
  return new SQL.Database(dbFile);
});

export const tables = derived(db, (db) => {
  if (db == null) return null;

  const results = db.exec(`SELECT name FROM sqlite_master WHERE type='table'`);
  if (results.length == 0) return [];
  return results[0].values[0];
});

export const tableRows = derived([tables, db], ([tables, db]) => {
  const tableMap = {};
  if (tables == null || db == null) return tableMap;

  tables.forEach((table) => {
    // Run a query to get the number of rows in the table
    const results = db.exec(`SELECT COUNT(*) FROM ${table}`);
    tableMap[table] = results[0].values[0];
  });
  return tableMap;
});
