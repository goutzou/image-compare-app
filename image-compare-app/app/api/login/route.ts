export const runtime = "nodejs";
import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

type UserRecord = {
  username: string;
  password: string;
  role: "admin" | "user";
};

type UsersFile = {
  users: UserRecord[];
};

const USERS_PATH = path.resolve("./data/users.json");

function loadUsers(): UsersFile {
  if (!fs.existsSync(USERS_PATH)) {
    return { users: [] };
  }

  try {
    const raw = fs.readFileSync(USERS_PATH, "utf8");
    return JSON.parse(raw) as UsersFile;
  } catch (err) {
    console.error("Error reading users.json:", err);
    return { users: [] };
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body as {
      username?: string;
      password?: string;
    };

    if (!username || !password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 400 },
      );
    }

    const { users } = loadUsers();
    const user = users.find(
      (entry) => entry.username === username && entry.password === password,
    );

    if (!user) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 },
      );
    }

    return NextResponse.json({ status: "ok", role: user.role });
  } catch (err) {
    console.error("Error processing login:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
