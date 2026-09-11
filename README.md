# arti

Dwie rzeczy dzielą to repozytorium.

**Strona** — jednostronicowe portfolio malarskie. Statyczny Next.js, bez CMS-a
i bez bazy: galeria powstaje z plików graficznych w `sources/`. Na żywo pod
[arti-gallery.vercel.app](https://arti-gallery.vercel.app).

**Gra** — narzędzie do nauki projektowania, owinięte wokół tej strony. Siedzi za
flagą środowiskową i nie ma jej w wersji produkcyjnej. Poniżej masz tutorial:
od pustego katalogu do pierwszego pokonanego bossa.

Dokumentacja samej strony — dodawanie prac, adresy produkcyjne, budowanie —
jest [niżej, po angielsku](#the-site). Ten podział jest celowy i wyjaśniony
[na końcu](#o-językach).

---

# Pierwszy quest

Wszystko poniżej robi się przez wpisywanie komend do terminala i klikanie
w przeglądarce. Nie musisz umieć programować. Nie musisz rozumieć, co jest
w plikach, do których gra Cię wyśle — one same tłumaczą, co robić.

## Zanim zaczniesz — raz, jakieś pięć minut

Potrzebujesz trzech rzeczy:

1. **Node.js w wersji 20 albo nowszej.** Sprawdź, czy już go masz — otwórz
   terminal i wpisz `node --version`. Jeśli odpowie numerem, jesteś w domu.
   Jeśli odpowie, że nie zna takiej komendy, pobierz go z
   [nodejs.org](https://nodejs.org) (wersja oznaczona LTS).
2. **Terminal.** Na Windowsie: PowerShell albo Terminal Windows. Na macOS:
   Terminal. To jest to okno, w którym wpisuje się komendy.
3. **Edytor tekstu.** Wystarczy [VS Code](https://code.visualstudio.com).
   Będziesz w nim przesuwać dwa znaki `//` z jednej linii na drugą.

Potem, jeden raz:

```bash
git clone https://github.com/twilk/arti.git
cd arti
npm install
```

Ostatnia komenda pobiera zależności i trwa minutę albo dwie. Wypisze przy tym
sporo tekstu — to normalne.

## Krok 1 · Zapytaj grę, co dziś

To jedyna komenda, którą musisz pamiętać:

```bash
npm run quest
```

Za pierwszym razem potrafi milczeć **długo** — w dwóch pomiarach na świeżym
klonie wyszło 41 i 81 sekund, zależnie od tego, ile komputer musiał dociągnąć.
Potem jest to około dwudziestu sekund. To nie jest zawieszenie: gra po drodze
puszcza testy, bo z nich dowiaduje się, którzy bossowie jeszcze żyją. Poczekaj.

Potem rysuje ekran o czterech częściach:

| część | co w niej jest |
| --- | --- |
| **DZIŚ** | jedno zadanie. Nie lista, nie plan tygodnia — jedno |
| **BOSSOWIE** | wszystkie żywe problemy na stronie, z życiem i wskazówką |
| **CMENTARZYSKO** | to, co już pokonałaś. Zostaje tam na stałe |
| **NASTĘPNY KROK** | dosłownie komenda do wklejenia |

Czytaj **DZIŚ**. Reszta ekranu jest do obejrzenia, nie do zrobienia.

## Krok 2 · Ekran mówi jedno z dwóch

Na świeżo sklonowanym repozytorium wypadnie kata. Gdy w tym tygodniu masz już
katę za sobą — wypadnie boss. Obie ścieżki są niżej; robisz tę, którą wskazał
ekran.

### 2A · „Zrób katę…”

Kata to piętnastominutowe ćwiczenie w przeglądarce. Nic tu nie dotyka strony,
nie ma czego zepsuć i nie trzeba otwierać żadnego pliku.

Uruchom serwer i **zostaw to okno terminala otwarte**:

```bash
npm run quest:dev
```

Gdy napisze `Ready`, otwórz w przeglądarce adres, który podał Ci ekran z kroku 1
— przy pierwszej kacie będzie to `http://localhost:3000/dev/kata/hierarchia`.

Co zobaczysz i co z tym zrobić:

- **Zegar** odlicza piętnaście minut. Można go zatrzymać. Gdy dojdzie do zera,
  policzy dalej na plus i nic więcej się nie stanie — to presja, nie kara.
- **Rysunek po lewej** zmienia się na żywo. **Suwaki i przełącznik po prawej** nim sterują.
  Ruszaj nimi i patrz. O to chodzi w całym ćwiczeniu.
- Gdy uznasz, że jest dobrze, kliknij **Skończone**. Dopiero wtedy odsłoni się
  wersja wzorcowa i przełącznik **Twoja / Wzorcowa** — możesz skakać między nimi
  tam i z powrotem.
- Pod spodem: **dlaczego wzorcowa wygląda tak** (przeczytaj), **lista do
  sprawdzenia** (nikt jej nie liczy) i pole **co zapamiętasz z tej katy**.

To ostatnie pole jest jedyną rzeczą, którą kata po sobie zostawia. Jedno zdanie
własnymi słowami wystarczy. Zapisuje się samo.

Gdy skończysz, wróć do terminala i zatrzymaj serwer klawiszami **Ctrl+C**.

### 2B · „Pokonaj bossa…”

Boss to jeden konkretny problem na stronie. Żyje dopóty, dopóki widzi go test.
Ekran podał Ci nazwę pliku — na razie zawsze `config/quest/tokens.ts`.

1. Otwórz ten plik w edytorze.
2. Znajdź ramkę z nazwą bossa. Jest w niej opis problemu, wyjaśnienie, dla kogo
   to problem, i wskazówka — celowo wskazówka, nie gotowa łatka.
3. Pod ramką są dwie linie: jedna oznaczona `(A) ZEPSUTE`, druga `(B) DOBRE`.

Przed:

```ts
export const caption = '#b8b6b0'; // (A) ZEPSUTE
// export const caption = '#66645c'; // (B) DOBRE
```

Po:

```ts
// export const caption = '#b8b6b0'; // (A) ZEPSUTE
export const caption = '#66645c'; // (B) DOBRE
```

Zmieniły się dwa znaki `//`: doszły na początku pierwszej linii, zniknęły
z początku drugiej. `//` mówi komputerowi „to jest notatka, pomiń” — czyli
przenosisz linię ze stanu „obowiązuje” do „nie obowiązuje” i odwrotnie.

4. **Zapisz plik** (Ctrl+S). To najczęściej pomijany krok.
5. Wróć do terminala i wpisz:

```bash
npm run quest
```

## Krok 3 · Sprawdź, że coś się stało

Po drugim `npm run quest`:

- boss zniknął z **BOSSOWIE** i pojawił się na **CMENTARZYSKU** — udało się;
- boss ma mniej życia, ale jeszcze żyje — pilnuje go więcej niż jeden test,
  przeczytaj, który jeszcze świeci na czerwono;
- nic się nie zmieniło — plik nie został zapisany albo `//` wylądowało nie tam.
  Zobacz tabelę [Gdy coś nie działa](#gdy-coś-nie-działa).

Nie ma tu punktów ani poziomów. Cmentarzysko jest jedynym licznikiem i rośnie
tylko w jedną stronę.

## Krok 4 · Obejrzyj mapę

Gdy będziesz chciała zobaczyć całość, a nie jedno zadanie:

```bash
npm run quest:dev
```

| adres | co tam jest |
| --- | --- |
| `http://localhost:3000/dev/mission` | baza: zadanie na dziś, kolejka, talia kat, cmentarzysko, Twój zeszyt zasad |
| `http://localhost:3000/dev/quest` | ćwiczebna kopia galerii z odczytem wartości i progów |
| `http://localhost:3000` | prawdziwa strona, ta sama co w internecie |

Ćwiczebna kopia jest osobna od prawdziwej strony właśnie po to, żeby dało się
w niej psuć bez konsekwencji.

## Krok 5 · Jutro

Jutro znowu `npm run quest`. To cała pętla.

Gra sama pilnuje rytmu: dopóki w danym tygodniu nie zrobisz ani jednej katy,
zadaniem na dziś będzie kata. Potem wracają bossowie. Tydzień, nie dzień —
seria liczona dziennie karałaby za życie, a nie za brak pracy.

## Gdy Twoja praca ma trafiać dalej

Do gry to nie jest potrzebne. Bossów pokonuje się u siebie i cmentarzysko rośnie
niezależnie od tego, czy ktokolwiek to widzi. Ale gdy zechcesz, żeby Twoje
poprawki trafiały do wspólnego repozytorium:

```bash
npm run dostepy
```

Sześć kroków, można puszczać ile razy chcesz. Skrypt sprawdzi narzędzia, zaloguje
Cię do GitHuba (**w Twojej przeglądarce — nikt tu nie pyta Cię o hasło ani nie
prosi o żaden token**), przyjmie zaproszenie do repozytorium, ustawi Twój podpis
pod zmianami i na koniec zrobi próbę na sucho, żeby okazało się teraz, a nie
wtedy, gdy będziesz miała coś gotowego.

Postawi też jedno zabezpieczenie: wysyłka prosto na `main` — czyli prosto na żywą
stronę — zostanie na Twoim komputerze zablokowana. Pracujesz na własnej gałęzi,
a na stronę trafia to dopiero, gdy ktoś scali Twoje zgłoszenie. Nadal nie da się
przypadkiem zepsuć produkcji, i tak ma zostać.

Jeśli nie masz jeszcze prawa zapisu, skrypt zatrzyma się i poda gotowe zdanie do
wysłania osobie, która prowadzi repozytorium. Potem uruchamiasz go jeszcze raz.

## Gdy coś nie działa

| co widzisz | co to znaczy | co zrobić |
| --- | --- | --- |
| `node: nie znaleziono` / `not recognized` | nie ma Node.js albo terminal go jeszcze nie widzi | zainstaluj z nodejs.org, zamknij i otwórz terminal na nowo |
| `Testy w ogóle się nie uruchomiły` | brakuje zależności | wpisz `npm install` w katalogu `arti` |
| `Nie ma jeszcze żadnego bossa` | dane gry się nie wczytały | `npm install` jeszcze raz; jeśli dalej to samo, to jest błąd do zgłoszenia |
| `Port 3000 is already in use` | poprzedni serwer wciąż chodzi | Ctrl+C w tamtym oknie, albo zamknij je i spróbuj ponownie |
| boss nie stracił życia po zamianie | plik niezapisany albo zamieniona nie ta para linii | sprawdź, czy linia, która nie zaczyna się od `//`, kończy się na `(B) DOBRE` |
| strona w przeglądarce wygląda na gołą | serwer jeszcze się buduje | odczekaj i odśwież |

Każdy błąd w tej grze mówi po polsku, co się stało i co zrobić. Jeśli trafisz
na taki, który tego nie robi, to jest usterka gry, nie Twoja.

---

## Ściągawka

Poniżej są gotowe odpowiedzi. Nic tu nie pilnuje, czy zajrzałaś, i nic się nie
zmieni, jeśli zajrzysz — ale w bossach odpowiedź jest jednym z dwóch możliwych
wyborów, więc podglądanie zabiera dokładnie tę część, na której polega ćwiczenie.

W katach jest inaczej i warto to wiedzieć: „wzorcowa” odsłania się i tak, po
kliknięciu **Skończone**. Podglądanie jej wcześniej odbiera tylko porównanie
własnej próby z cudzą — a to jest cała kata.

<details>
<summary><b>Bossowie</b> — pięć zamian, wszystkie w <code>config/quest/tokens.ts</code></summary>

Wszędzie schemat jest ten sam: dopisz `//` na początku linii `(A) ZEPSUTE`,
usuń `//` z początku linii `(B) DOBRE`, zapisz, uruchom `npm run quest`.
Numery linii to podpowiedź — pewnym punktem zaczepienia jest nazwa po
`export const`.

| # | boss | trudność | szukaj | linie | z | na |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Kontrast 1,86:1 na podpisach prac | łatwy | `caption` | 34–35 | `'#b8b6b0'` | `'#66645c'` |
| 2 | Przycisk wysoki na 28 pikseli | łatwy | `wysokoscPrzycisku` | 58–59 | `28` | `44` |
| 3 | Wiersz długi na 110 znaków | średni | `miaraWiersza` | 80–81 | `110` | `62` |
| 4 | Przeskok z nagłówka pierwszego na czwarty | średni | `poziomNaglowkaGalerii` | 103–104 | `4` | `2` |
| 5 | Galeria bez prac pokazuje pustkę | średni | `pustyStanMowiCoZrobic` | 127–128 | `false` | `true` |

A skoro już tu jesteś — po co każda z tych liczb:

1. **4,5 do 1** to próg, poniżej którego tekst przestaje być tekstem dla osoby
   patrzącej na telefon w słońcu. `#b8b6b0` na papierze daje 1,86. Nie chodzi
   o to, żeby było jak najciemniej, tylko o najjaśniejszy szary, który przechodzi.
2. **44 piksele** to wielkość celu, w który trafia kciuk za pierwszym razem.
   WCAG wymaga 24 na poziomie AA (2.5.8) i 44 na AAA (2.5.5). Tu stoi ta druga liczba, bo kciuk nie zna poziomów zgodności.
3. **45–75 znaków** w wierszu. Dłuższy wiersz gubi się przy przeskoku do
   następnego: oko wraca do lewej krawędzi i nie wie, do którego wiersza.
4. **Nagłówki idą po kolei.** Skok z pierwszego na czwarty to dla czytnika ekranu
   informacja, że dwa poziomy treści zostały pominięte — a nie zostały.
5. **Pusty stan mówi, co zrobić.** Galeria bez prac, która pokazuje pustkę,
   wygląda jak awaria. Ta sama galeria z jednym zdaniem instrukcji jest stanem,
   nie błędem.

</details>

<details>
<summary><b>Katy</b> — wartości wzorcowe wszystkich czterech</summary>

**hierarchia wizualna** — `/dev/kata/hierarchia`

| suwak | start | wzorzec |
| --- | --- | --- |
| Wielkość tytułu | 15 px | **19 px** |
| Wielkość metadanych | 15 px | **12 px** |
| Odstęp pod tytułem | 2 px | **8 px** |
| Przygaszenie metadanych | 0 % | **45 %** |
| Co stoi wyżej | metadane | **tytuł** |

Cztery narzędzia robią tu jedną robotę: wielkość, kolor, odstęp i kolejność. Start ma tytuł
i metadane w tym samym rozmiarze, w tym samym kolorze i sklejone razem — oko nie
ma za co złapać, więc czyta wszystko po kolei jak listę.

**stany interfejsu** — `/dev/kata/stany`

| suwak | start | wzorzec |
| --- | --- | --- |
| Rozjaśnienie pod kursorem | 0 % | **18 %** |
| Grubość obrysu zaznaczenia | 0 px | **2 px** |
| Odsunięcie obrysu | 0 px | **3 px** |
| Wciśnięcie | 0 px | **1 px** |
| Przygaszenie wyłączonego | 0 % | **55 %** |

Pięć stanów jednego przycisku ma się różnić na tyle, żeby dało się je rozpoznać
bez podpisu. Wszystkie na zerze to jeden stan udający pięć.

**dostępność (pierścień focusu)** — `/dev/kata/pierscien`

| suwak | start | wzorzec |
| --- | --- | --- |
| Grubość obrysu | 2 px | **2 px** — bez zmian |
| Odsunięcie od krawędzi | 0 px | **3 px** |
| Kolor obrysu | atrament | **dopasowany** |

Jedyna kata, w której grubość zostaje taka, jaka była. Rzecz jest w tym, że
atramentowy obrys znika na ciemnym tle powiększenia — odcina się od niego 1,08
do 1. Obrys, którego nie widać, nie istnieje dla osoby chodzącej po stronie
klawiaturą.

**dostępność i mikrocopy (opis obrazu)** — `/dev/kata/opis`

Tu nie ma odpowiedzi i gra tak to podpisuje: przełącznik mówi **„Jedna
z możliwych”**, nie „Wzorcowa”. Dwa dobre opisy mogą być zupełnie różne.

Ta jedna z możliwych brzmi:

> Rozległa łąka w pełnym słońcu, żółć trawy zajmuje niemal cały kadr, u góry
> wąski pas nieba.

Zwróć uwagę, czego w niej nie ma: słów „obraz”, „zdjęcie przedstawia”, nazwiska
autora, roku, techniki. To wszystko czytnik ekranu przeczyta z podpisu obok.
Opis ma dokładać to, czego w podpisie nie ma — czyli sam widok.

</details>

<details>
<summary><b>Ostatnia wyprawa</b></summary>

Jeszcze jej nie ma. Pięciu bossów i cztery katy przechodzi się zamianą
komentarzy i suwakami — ostatnia wyprawa ma być tą częścią, w której to samo
robi się już naprawdę, we własnym kodzie i na produkcji.

Gdy powstanie, ściągawki do niej tu nie będzie. Nie z zasady, tylko dlatego,
że nie ma czego ściągnąć: nie ma jednej dobrej odpowiedzi do wklejenia.

</details>

---

# The site

## Adding an artwork

1. Drop the image into `sources/` (`.jpg` `.jpeg` `.png` `.webp` `.avif` `.tif`).
2. Commit and push.

That is the whole process. `prepare-artworks` runs automatically before `dev` and `build`,
so Vercel regenerates the gallery on every deploy. No component is ever edited to add,
remove or reorder a work.

**Order** follows a natural sort of the filenames, so prefixing them (`01_`, `02_`, …)
sets the sequence in the gallery.

**Titles and metadata** are read from the filename, and only when they are actually there:

| filename | title | year | dimensions |
| --- | --- | --- | --- |
| `blue_monday.jpg` | Blue Monday | — | — |
| `blue_monday_2024.jpg` | Blue Monday | 2024 | — |
| `blue_monday_2024_100x80.jpg` | Blue Monday | 2024 | 100 × 80 cm |

Nothing is inferred beyond this. A file with no year in its name simply shows no year.
A year in the middle of a name stays part of the title: `studio_1993_notes` is titled
"Studio 1993 Notes", not "Studio Notes" from 1993.

**Resolution.** Sources are delivered at up to 2400px on the long edge and are never
upscaled, so a small source keeps its proportions but looks soft. The script warns about
any file under 1200px wide.

`sources/` is treated as immutable: the script only reads from it and writes derivatives
to `public/artworks/`, which is generated output — do not edit it by hand.

## Artist details

Everything identifying the artist lives in [`config/site.ts`](config/site.ts): name,
location, discipline, bio, email, Instagram. Values marked `PLACEHOLDER` there are not
real data and should be replaced. `instagram` is `null`, which hides the link entirely
rather than pointing at an invented handle.

## How the gallery behaves

A CSS multi-column masonry, so portrait, square and landscape works sit together at their
own natural proportions — nothing is cropped or stretched to a common box. The lightbox
is a native `<dialog>`, which supplies the focus trap and inert background; Escape, arrow
keys, backdrop click and the close button all dismiss it.

Guarded at 0, 1, 2 and 20 artworks: with one work the arrows are hidden, with twenty all
render and all but the first few stay lazy, and with none the empty state says what to do.

## Where everything lives

| | |
| --- | --- |
| **Site** | **https://arti-gallery.vercel.app** — the canonical address; this is the one to share |
| Repository | https://github.com/twilk/arti — public, deploys from `main` |
| Vercel project | https://vercel.com/wilczyy-2955s-projects/arti — dashboard, logs, deployments |

The site answers on more than one address, and it is worth knowing which is which:

| address | responds | what it is |
| --- | --- | --- |
| `arti-gallery.vercel.app` | 200 | canonical: named in `<link rel="canonical">`, Open Graph and the sitemap |
| `arti-olive-iota.vercel.app` | 200 | assigned automatically by Vercel; serves the same site, points nowhere in the metadata |
| `arti-wilczyy-2955s-projects.vercel.app` | 302 → Vercel SSO | team-scoped; regenerated on every production deploy and cannot be removed for good. Anonymous visitors get a login page, not the site |
| `arti-git-main-wilczyy-2955s-projects.vercel.app` | 302 → Vercel SSO | the same, for the `main` branch |
| `arti.vercel.app` | 451 | **not ours.** Held by a disabled project on an unrelated Vercel account; `vercel alias set` refuses it as already in use |

Endpoints worth checking after a deploy — all 200:

```
/            /robots.txt    /sitemap.xml    /og.jpg    /icon.svg
```

`/dev/mission` returns **404** in production, and that is the point: the quest is not
in the production build at all.

## Why the quest cannot reach production

Quest routes are named `page.quest.tsx` and `route.quest.ts`. Next only treats those as
routes when `NEXT_PUBLIC_QUEST=1` adds `quest.tsx` to `pageExtensions`, so without the
flag they are not routes, not in the bundle and not in the sitemap. This is not a
component checking a variable at runtime — the code is not there at all.

`tests/project/produkcja-bez-harnessu.test.ts` keeps it that way: it fails if any route
under `app/dev` loses its quest extension, and if anything outside the quest imports
from it.

---

## Commands

```bash
npm run quest            # what to do today; runs the boss tests and draws the screen
npm run quest:dev        # dev server with the quest enabled
npm run gracze           # send the two players round the site
npm run gracze:lokalnie  # build, serve, patrol every screen, tear down

npm run dev              # http://localhost:3000 (regenerates artworks first)
npm run build            # production build (regenerates artworks first)
npm run artworks         # regenerate artworks only
npm run typecheck        # tsc --noEmit
npm test                 # every test
npm run test:szybko      # skips component-rendering tests, which cost ~7s of jsdom startup
npm run proba            # clones into a temp dir and walks the newcomer path end to end (~4 min)
npm run sprawdz          # every check below, cheapest first, stops at the first failure
npm run sprawdz -- --szybko   # only the fast four, for the working loop
```

`npm run sprawdz` runs types, fast tests, all tests, the production build, a player
patrol and the from-scratch trial — in that order, because waiting four minutes to learn
that TypeScript does not compile is four minutes wasted.

**Two players** — `npm run gracze` sends agents round the site on a phone and on a
desktop, doing seventeen kinds of deliberately unplanned thing and running ten kinds of
check after every move. Findings are graded in four levels and every run is reproducible
from its seed, so a finding can become a test and a test can become a boss.

## Layout

```
sources/                     original files, never modified
public/artworks/             generated WebP derivatives
public/og.jpg                generated social card
data/artworks.json           generated manifest
data/artworks.ts             typed accessor
config/site.ts               artist details
components/                  Header, Gallery, Artwork, Lightbox, About, Contact
app/                         layout, page, globals.css, robots, sitemap, icon

app/dev/                     quest routes — page.quest.tsx only
components/quest/            quest components, including rysunki/ (one drawing per kata)
config/quest/                bosses, katas, the values she toggles
lib/quest/                   contrast, the daily-task rule, boss ordering
scripts/gracze/              the two players: moves and checks
.quest/                      game data. baseline and findings are committed;
                             boss state and progress are not — those are hers
QUEST.md                     her instructions, in Polish, one screen

tests/project/               88 checks that must stay green
tests/bosses/                boss tests — red on purpose, that is what keeps them alive
```

Four files there are plain `.mjs` rather than TypeScript: the boss and kata data, the
boss ordering, and the rule that decides today's task. Both the website and the terminal
command read all four, and the terminal cannot read TypeScript. The `.ts` files beside
them carry only the types.

This is not tidiness. When the terminal answered "what is today's task" with its own
half of the rule, it sent you to a boss while the mission screen sent you to a kata —
and neither of them was obviously wrong to look at.

## O językach

Strona jest po angielsku, gra po polsku, a ten plik po trochu w obu.

To nie jest niedopatrzenie. Portfolio ma trafiać do każdego, gra ma jedną
użytkowniczkę. Tutorial jest po polsku, bo każdy ekran, komunikat błędu
i komentarz w pliku, do którego wysyła, jest po polsku — instrukcja w innym
języku niż to, co widać na ekranie, jest instrukcją do czegoś innego.
Dokumentacja strony została po angielsku, bo dotyczy rzeczy publicznej.

Nazwy w kodzie idą za językiem tego, do czego należą: angielskie na stronie,
polskie w grze — tam plik, który ona otworzy, ma się czytać jak zdania.
