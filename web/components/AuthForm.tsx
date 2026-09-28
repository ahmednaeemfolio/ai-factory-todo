"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { login, loginAsGhost, register } from "../lib/api";

type AuthAction = "login" | "register";

function tokenFromResponse(response: unknown): string {
  if (
    typeof response === "object" &&
    response !== null &&
    "token" in response &&
    typeof response.token === "string" &&
    response.token.length > 0
  ) {
    return response.token;
  }

  throw new Error("The authentication response did not include a token.");
}

export default function AuthForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function finishSignIn(token: string) {
    document.cookie = `todo_token=${encodeURIComponent(token)}; Path=/; SameSite=Lax`;
    router.push("/todos");
  }

  async function handleAuth(action: AuthAction) {
    setError("");
    setIsSubmitting(true);

    try {
      const response =
        action === "register"
          ? await register(username, password)
          : await login(username, password);
      finishSignIn(tokenFromResponse(response));
    } catch {
      setError(
        action === "register"
          ? "Registration failed. The username may already be taken; please check your details and try again."
          : "Login failed. Please check your username and password and try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleGuestLogin() {
    setError("");
    setIsSubmitting(true);

    try {
      finishSignIn(tokenFromResponse(await loginAsGhost()));
    } catch {
      setError("Unable to continue as a guest. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter;
    const action: AuthAction =
      submitter instanceof HTMLButtonElement && submitter.value === "register"
        ? "register"
        : "login";
    void handleAuth(action);
  }

  return (
    <section aria-label="Account sign in">
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="username">Username</label>
          <input
            autoComplete="username"
            id="username"
            name="username"
            onChange={(event) => setUsername(event.target.value)}
            required
            value={username}
          />
        </div>
        <div>
          <label htmlFor="password">Password</label>
          <input
            autoComplete="current-password"
            id="password"
            name="password"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </div>
        <div>
          <button disabled={isSubmitting} name="action" type="submit" value="register">
            Register
          </button>{" "}
          <button disabled={isSubmitting} name="action" type="submit" value="login">
            Login
          </button>
        </div>
      </form>

      <button disabled={isSubmitting} onClick={handleGuestLogin} type="button">
        Continue as Guest
      </button>

      {error && (
        <p role="alert" aria-live="polite">
          {error}
        </p>
      )}
    </section>
  );
}
