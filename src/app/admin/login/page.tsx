import { loginAction } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  return (
    <main className="min-h-screen flex items-center justify-center bg-wedding-cream px-4">
      <form
        action={loginAction}
        className="w-full max-w-sm space-y-4 rounded-xl bg-white p-8 shadow-sm"
      >
        <h1 className="font-serif text-2xl text-wedding-ink">Admin přihlášení</h1>
        <input
          name="password"
          type="password"
          placeholder="Heslo"
          required
          autoFocus
          className="w-full rounded-md border border-wedding-ink/20 px-3 py-2 outline-none focus:border-wedding-sage"
        />
        {error && <p className="text-sm text-red-600">Nesprávné heslo</p>}
        <button
          type="submit"
          className="w-full rounded-md bg-wedding-sage px-4 py-2 text-white hover:bg-wedding-sage/90"
        >
          Přihlásit
        </button>
      </form>
    </main>
  );
}
