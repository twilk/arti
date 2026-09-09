# Quest

Ta strona jest Twoja. Ta gra też.

## Jedna komenda

    npm run quest

Tyle musisz pamiętać. Ekran, który się pojawi, powie resztę: co dziś zrobić,
w którym pliku i jaką komendę wkleić następnym razem.

## Jak się pokonuje bossa

Boss to jeden problem na stronie. Żyje tak długo, jak długo widzi go test.

W pliku, który wskaże gra, znajdziesz ramkę z opisem problemu i dwie linie:
`(A) ZEPSUTE` i `(B) DOBRE`. Postaw `//` na początku linii (A), zdejmij `//`
z linii (B), zapisz, uruchom `npm run quest`. Boss na cmentarzysku zostaje
tam na stałe.

## Dwoje graczy chodzi po stronie

    npm run gracze

Jedna postać ogląda stronę na telefonie, druga na komputerze. Robią rzeczy,
których nikt nie planuje, i po każdym ruchu sprawdzają, czy coś się nie posypało.
Zastrzeżenia dzielą na cztery stopnie: nie da się użyć, część osób nie da rady,
działa ale kłuje, da się lepiej. Rozgrywkę da się odtworzyć co do ruchu, więc
z każdego znaleziska można zrobić bossa.

## Mapa

    npm run quest:dev

potem http://localhost:3000/dev/mission

## Czego nie da się zepsuć

Gra żyje osobno od prawdziwej strony. Publiczna wersja portfolio nie widzi tych
plików — nie ma ich nawet w wysyłanym kodzie. Możesz tu psuć i cofać bez ryzyka.
Każdy błąd mówi po polsku, co się stało i co zrobić.
