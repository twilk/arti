# Quest

Ta strona jest Twoja. Ta gra też.

## Jedna komenda

Otwórz terminal w tym katalogu i wklej:

    npm run quest

To wszystko, co musisz pamiętać. Ekran, który się pojawi, powie Ci resztę:
co dziś zrobić, w którym pliku i jaką komendę wkleić następnym razem.

## Jak się pokonuje bossa

Boss to jeden problem na stronie. Żyje tak długo, jak długo test go widzi.

W pliku, który wskaże Ci gra, znajdziesz ramkę z opisem problemu i dwie linie:
jedną oznaczoną `(A) ZEPSUTE`, drugą `(B) DOBRE`. Postaw `//` na początku linii
(A) i zdejmij `//` z linii (B). Zapisz plik. Uruchom `npm run quest`.

Jeśli boss trafił na cmentarzysko — udało się. Zostaje tam na stałe.

## Mapa

    npm run quest:dev

potem otwórz http://localhost:3000/dev/mission

Tam widać to samo co w terminalu, tylko ładniej.

## Czego nie da się zepsuć

Gra żyje osobno od prawdziwej strony. Publiczna wersja portfolio nie widzi
żadnego z tych plików — nie ma ich nawet w wysyłanym kodzie. Możesz tu psuć,
zmieniać i cofać bez ryzyka.

## Gdyby coś nie działało

Każdy błąd w tej grze mówi po polsku, co się stało i co zrobić. Jeśli trafisz
na taki, który tego nie robi — to błąd gry, nie Twój.
