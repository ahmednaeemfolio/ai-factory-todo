"use client";

import { FormEvent, useState } from "react";
import { addTodo } from "../lib/api";

function getTodoText(value: unknown): string | null {
  if (typeof value === "string") return value;
  if (!value || typeof value !== "object") return null;

  const result = value as Record<string, unknown>;
  if (typeof result.text === "string") return result.text;
  for (const key of ["todo", "item"]) {
    const nestedText = getTodoText(result[key]);
    if (nestedText !== null) return nestedText;
  }
  return null;
}

type TodoListProps = {
  token: string;
  initialTodos: string[];
};

export default function TodoList({ token, initialTodos }: TodoListProps) {
  const [todos, setTodos] = useState(initialTodos);
  const [text, setText] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const newText = text.trim();
    if (!newText || isAdding) return;

    setIsAdding(true);
    setError(null);
    try {
      const createdTodo = await addTodo(token, newText);
      setTodos((currentTodos) => [...currentTodos, getTodoText(createdTodo) ?? newText]);
      setText("");
    } catch {
      setError("Unable to add todo. Please try again.");
    } finally {
      setIsAdding(false);
    }
  }

  return (
    <section>
      <ul>
        {todos.map((todo, index) => (
          <li key={`${index}-${todo}`}>{todo}</li>
        ))}
      </ul>
      <form onSubmit={handleSubmit}>
        <label htmlFor="new-todo">New todo</label>
        <input
          id="new-todo"
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <button type="submit" disabled={isAdding || !text.trim()}>
          {isAdding ? "Adding…" : "Add"}
        </button>
      </form>
      {error && <p role="alert">{error}</p>}
    </section>
  );
}
