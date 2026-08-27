/**
 * Platzhalter, der beim Seitenwechsel sofort erscheint. Ohne ihn passiert nach
 * einem Klick sichtbar nichts, bis der Server geantwortet hat – und das fühlt
 * sich an, als hätte der Knopf nicht reagiert.
 */
export function Skelett() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Inhalt wird geladen">
      <div className="space-y-3">
        <div className="h-6 w-32 animate-pulse rounded-full bg-mist-200" />
        <div className="h-9 w-3/4 animate-pulse rounded-lg bg-mist-200" />
        <div className="h-5 w-1/2 animate-pulse rounded-lg bg-mist-100" />
      </div>
      {[0, 1, 2].map((i) => (
        <div key={i} className="card space-y-3">
          <div className="h-5 w-1/3 animate-pulse rounded-lg bg-mist-200" />
          <div className="h-4 w-full animate-pulse rounded-lg bg-mist-100" />
          <div className="h-4 w-2/3 animate-pulse rounded-lg bg-mist-100" />
        </div>
      ))}
    </div>
  );
}
