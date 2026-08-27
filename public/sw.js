/*
 * Service Worker für die Curamus-App.
 *
 * Bewusst nur für Benachrichtigungen zuständig – es wird nichts
 * zwischengespeichert. Die App zeigt Termine, Nachrichten und Anfahrt in
 * Echtzeit; ein Cache würde hier alte Stände anzeigen, und das wäre schlimmer
 * als eine Seite, die kurz lädt.
 */

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (ereignis) => {
  let inhalt = { titel: "Curamus Medical", text: "Es gibt etwas Neues.", ziel: "/" };
  try {
    if (ereignis.data) inhalt = { ...inhalt, ...ereignis.data.json() };
  } catch {
    // Auch ohne lesbaren Inhalt soll etwas ankommen
  }

  ereignis.waitUntil(
    self.registration.showNotification(inhalt.titel, {
      body: inhalt.text,
      icon: "/icon-192.png",
      badge: "/icon-192.png",
      lang: "de",
      tag: inhalt.gruppe || undefined,
      renotify: Boolean(inhalt.gruppe),
      data: { ziel: inhalt.ziel || "/" },
    })
  );
});

self.addEventListener("notificationclick", (ereignis) => {
  ereignis.notification.close();
  const ziel = ereignis.notification.data?.ziel || "/";

  ereignis.waitUntil(
    self.clients.matchAll({ type: "window", includeUncontrolled: true }).then((fenster) => {
      // Ist die App schon offen, dort hinspringen statt einen zweiten Tab zu öffnen
      for (const f of fenster) {
        if (f.url.includes(self.location.origin)) {
          return f.focus().then(() => f.navigate(ziel));
        }
      }
      return self.clients.openWindow(ziel);
    })
  );
});
