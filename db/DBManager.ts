import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system';
import { Asset } from 'expo-asset';

class DBManager {
  private static instance: DBManager;
  private db: SQLite.SQLiteDatabase;

  private constructor(db: SQLite.SQLiteDatabase) {
    this.db = db;
  }

  static async getInstance(): Promise<DBManager> {
    if (!DBManager.instance) {
      const db = await SQLite.openDatabaseAsync('dp.db');
      DBManager.instance = new DBManager(db);
    }
    return DBManager.instance;
  }

  getDB(): SQLite.SQLiteDatabase {
    return this.db;
  }

  static async initializeIfNeeded(): Promise<void> {
    const dbPath = `${FileSystem.documentDirectory}SQLite/dp.db`;
    const fileInfo = await FileSystem.getInfoAsync(dbPath);

    if (!fileInfo.exists) {
      console.log('🔧 Initializing database from schema/seed SQL...');
      const dbManager = await DBManager.getInstance();
      const db = dbManager.getDB();
      await DBManager.runSQLFile(db, require('../assets/sql/schema.sql'));
      await DBManager.runSQLFile(db, require('../assets/sql/seed.sql'));
    } else {
      console.log('Database already exists!');
    }
  }

  private static async runSQLFile(db: SQLite.SQLiteDatabase, sqlFile: number): Promise<void> {
    const asset = Asset.fromModule(sqlFile);
    await asset.downloadAsync();
    const uri = asset.localUri ?? asset.uri;
    const sql = await FileSystem.readAsStringAsync(uri);

    const statements = sql
      .split(/;\s*$/m)
      .map((stmt) => stmt.trim())
      .filter((stmt) => stmt.length > 0);

    await db.execAsync(statements.join(';\n') + ';');
  }
}

export default DBManager;