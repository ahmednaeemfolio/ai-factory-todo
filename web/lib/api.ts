const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

type RequestOptions = {
  method?: "GET" | "POST";
  token?: string;
  body?: unknown;
};

async function request(path: string, options: RequestOptions = {}): Promise<unknown> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    method: options.method ?? "GET",
    headers,
    ...(options.body !== undefined ? { body: JSON.stringify(options.body) } : {}),
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export function register(username: string, password: string): Promise<unknown> {
  return request("/auth/register", {
    method: "POST",
    body: { username, password },
  });
}

export function login(username: string, password: string): Promise<unknown> {
  return request("/auth/login", {
    method: "POST",
    body: { username, password },
  });
}

export function loginAsGhost(): Promise<unknown> {
  return request("/auth/ghost", { method: "POST" });
}

export function listTodos(token: string): Promise<unknown> {
  return request("/todos", { token });
}

export function addTodo(token: string, text: string): Promise<unknown> {
  return request("/todos", {
    method: "POST",
    token,
    body: { text },
  });
}
