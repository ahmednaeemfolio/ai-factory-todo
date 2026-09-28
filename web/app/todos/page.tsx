import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import TodoList from "../../components/TodoList";
import { listTodos } from "../../lib/api";

function getTodoText(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;

  const todo = value as Record<string, unknown>;
  return typeof todo.text === "string" ? todo.text : null;
}

function getTodoItems(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(getTodoText).filter((text): text is string => text !== null);
  }

  if (value && typeof value === "object") {
    const response = value as Record<string, unknown>;
    for (const key of ["todos", "items"]) {
      if (Array.isArray(response[key])) return getTodoItems(response[key]);
    }
  }

  return [];
}

export default async function TodosPage() {
  const token = (await cookies()).get("todo_token")?.value;
  if (!token) redirect("/");

  const todos = getTodoItems(await listTodos(token));

  return (
    <main>
      <h1>Todos</h1>
      <TodoList token={token} initialTodos={todos} />
    </main>
  );
}
