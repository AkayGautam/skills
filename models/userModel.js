import db from "../db.js"; 

async function runQuery(sql, params = []) {
  const start = Date.now();
  console.log(`[DB] running query: ${sql} -- params: ${JSON.stringify(params)}`);
  try {
    const maybe = db.query(sql, params);
    if (maybe && typeof maybe.then === "function") {
      const result = await maybe; 
      console.log(
        `[DB] success (promise) (${Date.now() - start}ms) rows=${
          Array.isArray(result[0]) ? result[0].length : typeof result[0]
        }`
      );
      return result;
    }
    return await new Promise((resolve, reject) => {
      db.query(sql, params, (err, results, fields) => {
        if (err) {
          console.error("[DB] error", err);
          return reject(err);
        }
        console.log(
          `[DB] success (callback) (${Date.now() - start}ms) rows=${
            Array.isArray(results) ? results.length : typeof results
          }`
        );
        resolve([results, fields]);
      });
    });
  } catch (err) {
    console.error("[DB] caught error", err);
    throw err;
  }
}
 
export async function createUser(name, email, hashedPassword, role = "user") {
  return db.query(
    "INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)",
    [name, email, hashedPassword, role]
  );
}

export async function updateUserRole(userId, role) {
  return db.query("UPDATE users SET role = ? WHERE id = ?", [role, userId]);
}

export async function findUserByEmail(email) {
  return db.query(
    "SELECT id, name, email, password, role FROM users WHERE email = ?",
    [email]
  );
}

export async function getAllUsers() {
  return db.query(
    "SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC"
  );
}
