import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
function tentukanDataDir() {
  const localDir = path.join(__dirname, 'data');
  try {
    if (!fs.existsSync(localDir)) {
      fs.mkdirSync(localDir, { recursive: true });
    }
    // Uji izin tulis
    const testFile = path.join(localDir, `.write_test_${Date.now()}`);
    fs.writeFileSync(testFile, 'test');
    fs.unlinkSync(testFile);
    return localDir;
  } catch (err) {
    console.warn(`Direktori data lokal (${localDir}) tidak dapat ditulisi (${err.code}), menggunakan /tmp/pilah_data.`);
    const tmpDir = path.join('/tmp', 'pilah_data');
    if (!fs.existsSync(tmpDir)) {
      fs.mkdirSync(tmpDir, { recursive: true });
    }
    // Salin file yang sudah ada dari localDir jika ada
    try {
      if (fs.existsSync(localDir)) {
        for (const file of fs.readdirSync(localDir)) {
          const src = path.join(localDir, file);
          const dst = path.join(tmpDir, file);
          if (!fs.existsSync(dst) && fs.statSync(src).isFile()) {
            fs.copyFileSync(src, dst);
          }
        }
      }
    } catch {
      // Abaikan jika penyalinan gagal
    }
    return tmpDir;
  }
}

const DATA_DIR = tentukanDataDir();

// Inisialisasi file JSON jika belum ada
const COLLECTIONS = ['pengguna.json', 'entri.json', 'sesi.json'];
for (const file of COLLECTIONS) {
  const filePath = path.join(DATA_DIR, file);
  if (!fs.existsSync(filePath)) {
    try {
      fs.writeFileSync(filePath, JSON.stringify([], null, 2), 'utf8');
    } catch (e) {
      console.error(`Gagal membuat file awal ${filePath}:`, e);
    }
  }
}

// Antrean penulisan untuk mencegah race condition (tulis satu per satu)
const writeQueues = new Map();

function enqueueWrite(filePath, data) {
  const previousPromise = writeQueues.get(filePath) || Promise.resolve();
  const nextPromise = previousPromise
    .then(async () => {
      const tempPath = `${filePath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
      const jsonContent = JSON.stringify(data, null, 2);
      await fs.promises.writeFile(tempPath, jsonContent, 'utf8');
      await fs.promises.rename(tempPath, filePath);
    })
    .catch((err) => {
      console.error(`Gagal menulis ke ${filePath}:`, err);
      throw err;
    });

  writeQueues.set(filePath, nextPromise);
  return nextPromise;
}

export const Storage = {
  getFilePath(collectionName) {
    const filename = collectionName.endsWith('.json') ? collectionName : `${collectionName}.json`;
    return path.join(DATA_DIR, filename);
  },

  async read(collectionName) {
    const filePath = this.getFilePath(collectionName);
    try {
      const content = await fs.promises.readFile(filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  },

  readSync(collectionName) {
    const filePath = this.getFilePath(collectionName);
    try {
      const content = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(content || '[]');
    } catch (err) {
      if (err.code === 'ENOENT') {
        return [];
      }
      throw err;
    }
  },

  async write(collectionName, data) {
    const filePath = this.getFilePath(collectionName);
    await enqueueWrite(filePath, data);
    return data;
  }
};
