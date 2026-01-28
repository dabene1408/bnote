# BNote
## Don't get blue organizing your band!

BNote ist eine webbasierte Software für Bigbands, Orchester, Chöre, Schulen, Hochschulen/Universitäten, Musikschulen und Vereine. Ziel von BNote ist es, standardisierte Vorgehensweise in der Proben- und Auftrittsorganisation als IT-Lösung umzusetzen und sie für alle frei zugänglich zu machen.

### Download und Installation
Im [Release-Ordner](BNote-Releases/BNote) sind alle offiziellen Releases gelistet. Jedem Release liegt eine readme.txt mit Hinweisen zur Installation bei. Bitte zunächst immer zuerst eine Major-Version vollständig installieren, bevor die Patches der Reihe nach angewandt werden können.

### SMTP-Mailversand (Docker)
Der Mailversand läuft über SMTP und wird über Umgebungsvariablen im `docker-compose.yml` konfiguriert.

Benötigte Variablen (Service `php-apache`):
- `BNOTE_SMTP_HOST` (z. B. `smtp.example.com`)
- `BNOTE_SMTP_PORT` (z. B. `587` oder `465`)
- `BNOTE_SMTP_USER` (SMTP-Login)
- `BNOTE_SMTP_PASS` (SMTP-Passwort)
- `BNOTE_SMTP_SECURE` (`tls` oder `ssl`)
- `BNOTE_SMTP_FROM_EMAIL` (Absenderadresse)
- `BNOTE_SMTP_FROM_NAME` (Absendername)

Nach dem Setzen der Werte den Container neu starten.

### Composer / vendor
Falls `BNote/vendor` fehlt, installiert der Container beim Start automatisch die Composer-Abhängigkeiten.
Dafür ist Internetzugang beim ersten Start nötig.

### Erinnerungsmails
Beim Erstellen eines neuen Treffens oder einer neuen Abstimmung werden sofort Erinnerungsmails an alle Mitglieder mit hinterlegter E-Mail versendet. Leere E-Mail-Felder werden ignoriert.

Zusätzliche Erinnerungen an Personen, die noch nicht abgestimmt haben, werden über den Trigger-Service in festem Intervall versendet. Das Intervall und die Anzahl der Wiederholungen können über ENV-Variablen überschrieben werden:
- `BNOTE_TRIGGER_CYCLE_DAYS` (z. B. `3`)
- `BNOTE_TRIGGER_REPEAT_COUNT` (z. B. `3`)

### Team
Hinter BNote steht ein Team von Software-Entwicklern und Amateurmusikern. Unsere Release-Planung ist öffentlich, ebenso wie die Bugs (siehe hierzu [Issues](../../issues)).

### Infos
Weitere Informationen, Hilfe und Angebote gibt es auf der [BNote Website](http://www.bnote.info) und im [Wiki](../../wiki).
