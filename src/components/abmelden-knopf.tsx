/** Abmelden – bewusst im Profilbereich statt in der Kopfzeile. */
export function AbmeldenKnopf() {
  return (
    <form action="/auth/signout" method="post">
      <button
        type="submit"
        className="btn-secondary w-full text-red-600 hover:border-red-300 hover:text-red-700 sm:w-auto"
      >
        Abmelden
      </button>
    </form>
  );
}
