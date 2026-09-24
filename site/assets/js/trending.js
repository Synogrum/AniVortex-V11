// trending.js — versiune corectată (VISIBLE declarat la început)
const CATEGORIES = ["Anime", "Manga", "Desene", "Live-Action", "Filme/Seriale", "Cărți"];

// Variabile de stare globale
let catIndex   = 0;
let currentCat = CATEGORIES[0];
let windowStart = 0;
let isSliding   = false;
let slideAutoplay = null;
let slideAutoplayRoot = null;

// Popup-ul există strict cât timp cursorul rămâne pe card.
let activePopupPair = null;

// CONSTANTĂ — declarată înainte de orice utilizare
const VISIBLE = 6;

const DATA = {
  "Anime": [
    { rank:1, title:"Demon Slayer", img:"https://cdn.myanimelist.net/images/anime/1286/99889.jpg", episode:"Ep. 26", total:"26", score:8.7, views:980000, viewsLabel:"980K", desc:"Un tânăr devine vânător de demoni după ce familia sa este masacrată și sora sa transformată în demon." },
    { rank:2, title:"Attack on Titan", img:"https://cdn.myanimelist.net/images/anime/10/47347.jpg", episode:"Ep. 87", total:"87", score:9.0, views:1200000, viewsLabel:"1.2M", desc:"Omenirea luptă pentru supraviețuire împotriva titanilor gigantici care amenință să o extermine." },
    { rank:3, title:"Jujutsu Kaisen", img:"https://cdn.myanimelist.net/images/anime/1171/109222.jpg", episode:"Ep. 24", total:"24", score:8.6, views:870000, viewsLabel:"870K", desc:"Un adolescent înghite un deget blestemat și devine gazda celui mai puternic spirit malefic." },
    { rank:4, title:"One Piece", img:"https://cdn.myanimelist.net/images/anime/6/73245.jpg", episode:"Ep. 1100", total:"1100", score:8.9, views:1500000, viewsLabel:"1.5M", desc:"Monkey D. Luffy și echipa sa de pirați caută cea mai mare comoară din lume, One Piece." },
    { rank:5, title:"Naruto Shippuden", img:"https://cdn.myanimelist.net/images/anime/1565/111305.jpg", episode:"Ep. 500", total:"500", score:8.3, views:760000, viewsLabel:"760K", desc:"Naruto Uzumaki continuă drumul spre a deveni Hokage, confruntând inamici tot mai puternici." },
    { rank:6, title:"Vinland Saga", img:"https://cdn.myanimelist.net/images/anime/1500/103005.jpg", episode:"Ep. 24", total:"24", score:8.8, views:620000, viewsLabel:"620K", desc:"Un tânăr viking asistă la moartea tatălui său și pornește pe un drum al răzbunării și descoperirii de sine." },
    { rank:7, title:"Fullmetal Alchemist: Brotherhood", img:"https://cdn.myanimelist.net/images/anime/1223/96541.jpg", episode:"Ep. 64", total:"64", score:9.1, views:1350000, viewsLabel:"1.35M", desc:"Doi frați alchimiști caută Piatra Filosofală pentru a-și recăpăta corpurile pierdute." },
    { rank:8, title:"Hunter x Hunter", img:"https://cdn.myanimelist.net/images/anime/11/33657.jpg", episode:"Ep. 148", total:"148", score:9.0, views:1050000, viewsLabel:"1.05M", desc:"Gon Freecss pornește în căutarea tatălui său, devenind vânător și înfruntând pericole extreme." },
    { rank:9, title:"Bleach", img:"https://cdn.myanimelist.net/images/anime/3/40451.jpg", episode:"Ep. 366", total:"366", score:8.2, views:870000, viewsLabel:"870K", desc:"Ichigo Kurosaki dobândește puteri de Shinigami și protejează lumea viilor de spiritele malefice." },
    { rank:10, title:"Tokyo Ghoul", img:"https://cdn.myanimelist.net/images/anime/5/64449.jpg", episode:"Ep. 12", total:"12", score:7.8, views:740000, viewsLabel:"740K", desc:"Un student devine pe jumătate ghoul și se luptă să-și păstreze umanitatea în lumea umbrelor." },
    { rank:11, title:"Sword Art Online", img:"https://cdn.myanimelist.net/images/anime/11/39717.jpg", episode:"Ep. 25", total:"25", score:7.7, views:680000, viewsLabel:"680K", desc:"Kirito este prins într-un joc VR mortal unde moartea în joc înseamnă moarte în realitate." },
    { rank:12, title:"Re:Zero", img:"https://cdn.myanimelist.net/images/anime/11/79410.jpg", episode:"Ep. 50", total:"50", score:8.3, views:720000, viewsLabel:"720K", desc:"Subaru este transportat într-o lume fantastică și descoperă că poate învia după moarte." },
    { rank:13, title:"Mob Psycho 100", img:"https://cdn.myanimelist.net/images/anime/8/80356.jpg", episode:"Ep. 37", total:"37", score:8.6, views:640000, viewsLabel:"640K", desc:"Shigeo Kageyama, un elev cu puteri psihice imense, încearcă să ducă o viață normală." },
    { rank:14, title:"Chainsaw Man", img:"https://cdn.myanimelist.net/images/anime/1806/126216.jpg", episode:"Ep. 12", total:"12", score:8.5, views:810000, viewsLabel:"810K", desc:"Denji fuzionează cu câinele său demon și devine Chainsaw Man, un vânător de demoni brutal." },
    { rank:15, title:"Spy x Family", img:"https://cdn.myanimelist.net/images/anime/1441/122795.jpg", episode:"Ep. 37", total:"37", score:8.6, views:760000, viewsLabel:"760K", desc:"Un spion, o asasină și o copilă telepath formează o familie falsă cu scopuri diferite." },
    { rank:16, title:"Dragon Ball Z", img:"https://cdn.myanimelist.net/images/anime/1277/142208.jpg", episode:"Ep. 291", total:"291", score:8.1, views:1100000, viewsLabel:"1.1M", desc:"Goku și prietenii săi apără Pământul de inamici din ce în ce mai puternici din spațiu și alte dimensiuni." }
  ],
  "Manga": [
    { rank:1, title:"Berserk", img:"https://cdn.myanimelist.net/images/manga/1/157897.jpg", episode:"Cap. 374", total:"374", score:9.4, views:1100000, viewsLabel:"1.1M", desc:"Guts, un mercenar singuratic, luptă împotriva demonilor într-o lume întunecată și brutală medievală." },
    { rank:2, title:"Vagabond", img:"https://cdn.myanimelist.net/images/manga/1/259070.jpg", episode:"Cap. 327", total:"327", score:9.2, views:780000, viewsLabel:"780K", desc:"Viața lui Miyamoto Musashi, cel mai mare samurai din istoria Japoniei, redată cu artă vizuală uimitoare." },
    { rank:3, title:"Vinland Saga", img:"https://cdn.myanimelist.net/images/manga/2/188925.jpg", episode:"Cap. 210", total:"210", score:9.1, views:670000, viewsLabel:"670K", desc:"Povestea vikingului Thorfinn, de la răzbunare la căutarea unui tărâm al păcii." },
    { rank:4, title:"One Piece", img:"https://cdn.myanimelist.net/images/manga/2/253146.jpg", episode:"Cap. 1110", total:"1110", score:9.0, views:1400000, viewsLabel:"1.4M", desc:"Aventura piratului Monkey D. Luffy în căutarea One Piece, cea mai mare comoară din lume." },
    { rank:5, title:"Chainsaw Man", img:"https://cdn.myanimelist.net/images/manga/3/216464.jpg", episode:"Cap. 165", total:"165", score:8.8, views:890000, viewsLabel:"890K", desc:"Denji fuzionează cu câinele său demon și devine Chainsaw Man, un vânător de demoni brutal." },
    { rank:6, title:"Solo Leveling", img:"https://cdn.myanimelist.net/images/manga/3/222295.jpg", episode:"Cap. 179", total:"179", score:8.7, views:980000, viewsLabel:"980K", desc:"Cel mai slab vânător din lume primește o putere unică și începe să urce singur spre vârf." },
    { rank:7, title:"Fullmetal Alchemist", img:"https://cdn.myanimelist.net/images/manga/3/243675.jpg", episode:"Cap. 108", total:"108", score:9.1, views:1000000, viewsLabel:"1M", desc:"Frații Elric caută Piatra Filosofală pentru a-și recăpăta trupurile pierdute." },
    { rank:8, title:"Death Note", img:"https://cdn.myanimelist.net/images/manga/2/54453.jpg", episode:"Cap. 108", total:"108", score:8.8, views:920000, viewsLabel:"920K", desc:"Un student genial găsește un caiet cu care poate ucide orice om și decide să curețe lumea." },
    { rank:9, title:"Naruto", img:"https://cdn.myanimelist.net/images/manga/3/117681.jpg", episode:"Cap. 700", total:"700", score:8.0, views:860000, viewsLabel:"860K", desc:"Naruto Uzumaki, un ninja paria, luptă să fie recunoscut și să devină cel mai mare Hokage." },
    { rank:10, title:"Attack on Titan", img:"https://cdn.myanimelist.net/images/manga/2/37846.jpg", episode:"Cap. 139", total:"139", score:9.0, views:1150000, viewsLabel:"1.15M", desc:"Omenirea luptă pentru supraviețuire în spatele unor ziduri imense împotriva titanilor giganți." },
    { rank:11, title:"Blue Period", img:"https://cdn.myanimelist.net/images/manga/3/224907.jpg", episode:"Cap. 82", total:"82", score:8.7, views:490000, viewsLabel:"490K", desc:"Un elev popular descoperă arta și decide să urmeze Tokyo University of the Arts." },
    { rank:12, title:"Dorohedoro", img:"https://cdn.myanimelist.net/images/manga/2/177868.jpg", episode:"Cap. 167", total:"167", score:8.7, views:520000, viewsLabel:"520K", desc:"Într-o lume distopică, Caiman caută vrăjitorul care i-a transformat capul în cap de reptilă." },
    { rank:13, title:"Tokyo Ghoul", img:"https://cdn.myanimelist.net/images/manga/3/114037.jpg", episode:"Cap. 179", total:"179", score:8.3, views:680000, viewsLabel:"680K", desc:"Un student devine pe jumătate ghoul și se zbate între umanitate și natura sa monstruoasă." },
    { rank:14, title:"My Hero Academia", img:"https://cdn.myanimelist.net/images/manga/1/209370.jpg", episode:"Cap. 430", total:"430", score:8.2, views:730000, viewsLabel:"730K", desc:"Izuku Midoriya, născut fără puteri, moștenește puterea celui mai mare erou și pornește spre glorie." },
    { rank:15, title:"Hunter x Hunter", img:"https://cdn.myanimelist.net/images/manga/3/156819.jpg", episode:"Cap. 400", total:"400", score:9.0, views:850000, viewsLabel:"850K", desc:"Gon caută tatăl său și descoperă lumea periculoasă a vânătorilor de renume mondial." },
    { rank:16, title:"Jujutsu Kaisen", img:"https://cdn.myanimelist.net/images/manga/3/216464.jpg", episode:"Cap. 270", total:"270", score:8.6, views:820000, viewsLabel:"820K", desc:"Yuji Itadori înghite un deget blestemat și intră în lumea exorciștilor de spirite malefice." }
  ],
  "Desene": [
    { rank:1, title:"Avatar: The Last Airbender", img:"https://m.media-amazon.com/images/M/MV5BODc5YTBhMTItMjgyYy00MWY3LTg2ZWUtYTMzMjAzZTBkZWMwXkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_.jpg", episode:"Ep. 61", total:"61", score:9.3, views:1400000, viewsLabel:"1.4M", desc:"Aang, ultimul maestru al aerului, trebuie să stăpânească toate cele patru elemente pentru a salva lumea." },
    { rank:2, title:"The Legend of Korra", img:"https://m.media-amazon.com/images/M/MV5BMjE3ODY0NjU0Ml5BMl5BanBnXkFtZTgwMzQyODUzMTE@._V1_.jpg", episode:"Ep. 52", total:"52", score:8.4, views:870000, viewsLabel:"870K", desc:"Korra, noul Avatar, luptă să mențină echilibrul într-o lume modernă plină de conflicte politice." },
    { rank:3, title:"Gravity Falls", img:"https://m.media-amazon.com/images/M/MV5BMjA4NzgyNzM0NV5BMl5BanBnXkFtZTgwMzM5NDE4MTE@._V1_.jpg", episode:"Ep. 40", total:"40", score:8.9, views:960000, viewsLabel:"960K", desc:"Gemenii Dipper și Mabel descoperă misterele supranaturale ascunse în orășelul Gravity Falls." },
    { rank:4, title:"Batman: The Animated Series", img:"https://m.media-amazon.com/images/M/MV5BNWM1NmYyM2ItNWZhNC00NjQxLWFkYmItMzZhMDRhMzFiYjgxXkEyXkFqcGdeQXVyNTM3MDMyMDQ@._V1_.jpg", episode:"Ep. 85", total:"85", score:9.0, views:820000, viewsLabel:"820K", desc:"Bruce Wayne luptă împotriva crimei în Gotham City ca vigilentul mascat Batman." },
    { rank:5, title:"Steven Universe", img:"https://m.media-amazon.com/images/M/MV5BYjRiZTM4ZWMtODYwZi00N2E5LWI3OTMtNDViNzc4OGE2MTZlXkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_.jpg", episode:"Ep. 160", total:"160", score:8.1, views:640000, viewsLabel:"640K", desc:"Un băiețel cu puteri speciale apără Pământul alături de Gem Warriors, niște guerriere extraterestre." },
    { rank:6, title:"Arcane", img:"https://m.media-amazon.com/images/M/MV5BYmU5OWM5ZTAtNjUzOC00NmUyLTgyOWMtMjlkNjdlMDAzMzU1XkEyXkFqcGdeQXVyMDM2NDM2MQ@@._V1_.jpg", episode:"Ep. 9", total:"9", score:9.0, views:1300000, viewsLabel:"1.3M", desc:"Două surori din lumea League of Legends sunt prinse în conflictul dintre Piltover și Zaun." },
    { rank:7, title:"Over the Garden Wall", img:"https://m.media-amazon.com/images/M/MV5BOGQ2MDUzNTctZDU3Yi00MDZhLWJiNGItNGY2NzZiYTNjNmQ1XkEyXkFqcGdeQXVyNTA4NTMyOTU@._V1_.jpg", episode:"Ep. 10", total:"10", score:8.7, views:580000, viewsLabel:"580K", desc:"Doi frați rătăciți încearcă să găsească drumul spre casă prin păduri misterioase și întunecate." },
    { rank:8, title:"Castlevania", img:"https://m.media-amazon.com/images/M/MV5BNjdhOGY1OTktYWJkZC00ZDExLWE4NzEtMDk2ZjU0YWJiNWE5XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", episode:"Ep. 32", total:"32", score:8.3, views:740000, viewsLabel:"740K", desc:"Trevor Belmont luptă împotriva lui Dracula și a hoardei sale de monștri care amenință omenirea." },
    { rank:9, title:"Invincible", img:"https://m.media-amazon.com/images/M/MV5BMjk1MDYzNjYxNl5BMl5BanBnXkFtZTgwMTk5NzI2NzI@._V1_.jpg", episode:"Ep. 24", total:"24", score:8.7, views:1100000, viewsLabel:"1.1M", desc:"Fiul celui mai puternic supererou de pe Pământ descoperă că moștenirea tatălui său ascunde un secret înfiorător." },
    { rank:10, title:"The Owl House", img:"https://m.media-amazon.com/images/M/MV5BMjU1YTk5OTQtNzRkZS00MGJkLTllMTgtNWE2ZWJmN2MzMzZkXkEyXkFqcGdeQXVyMjgyNjk3MzE@._V1_.jpg", episode:"Ep. 43", total:"43", score:8.3, views:520000, viewsLabel:"520K", desc:"O adolescentă ajunge accidental în Ținutul Blestemului și devine ucenica unei vrăjitoare excentrice." },
    { rank:11, title:"Amphibia", img:"https://m.media-amazon.com/images/M/MV5BOGI1ZTQxYTktZDJlNC00MzE0LTgzNjAtZDBiMDIzOTdhYWEzXkEyXkFqcGdeQXVyMDc2ODM1MjE@._V1_.jpg", episode:"Ep. 78", total:"78", score:7.9, views:440000, viewsLabel:"440K", desc:"O fată este transportată într-o lume de amfibieni antropomorfi și trebuie să găsească drumul spre casă." },
    { rank:12, title:"She-Ra and the Princesses of Power", img:"https://m.media-amazon.com/images/M/MV5BZjljZDI5MjktOTkxZC00ZTg5LWI1N2UtMTJhNGU3Yzk4MDZmXkEyXkFqcGdeQXVyMzExNzQ3MA@@._V1_.jpg", episode:"Ep. 52", total:"52", score:8.0, views:490000, viewsLabel:"490K", desc:"Adora descoperă că este destinată să devină She-Ra și trebuie să aleagă între forță și loialitate." },
    { rank:13, title:"Star Wars: The Clone Wars", img:"https://m.media-amazon.com/images/M/MV5BNzg0MzI1NDYtNTFlYS00YTM5LWE5OWMtNjJjYTgzYzQ5ODgyXkEyXkFqcGdeQXVyMjM4NTM5NDY@._V1_.jpg", episode:"Ep. 133", total:"133", score:8.4, views:890000, viewsLabel:"890K", desc:"Povestea Războaielor Clonelor, cu Ahsoka Tano și Obi-Wan Kenobi în prim-plan." },
    { rank:14, title:"Infinity Train", img:"https://m.media-amazon.com/images/M/MV5BYzlhNzI3NzQtYTgyZC00MzViLWJhY2ItMzU4ZWRjNTViZTI3XkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", episode:"Ep. 40", total:"40", score:8.5, views:430000, viewsLabel:"430K", desc:"Pasageri blocați pe un tren misterios trebuie să rezolve puzzle-uri pentru a putea coborî." },
    { rank:15, title:"Young Justice", img:"https://m.media-amazon.com/images/M/MV5BOTcyOTIzODAxNF5BMl5BanBnXkFtZTgwODg5OTMyMzI@._V1_.jpg", episode:"Ep. 91", total:"91", score:8.5, views:700000, viewsLabel:"700K", desc:"Tinerii supereroi formează o echipă secretă și operează în umbra Ligii Dreptății." },
    { rank:16, title:"Sym-Bionic Titan", img:"https://m.media-amazon.com/images/M/MV5BYjBhYzM4MDktNzc4OS00ZWJhLTlhMDMtM2Q0YjViZTYxOWZiXkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_.jpg", episode:"Ep. 20", total:"20", score:7.8, views:350000, viewsLabel:"350K", desc:"Trei fugari de pe o planetă extraterestră se ascund pe Pământ și apară omenirea de invadatori." }
  ],
  "Live-Action": [
    { rank:1, title:"One Piece (Netflix)", img:"https://m.media-amazon.com/images/M/MV5BOTRkNjU3NjItZTU0Ni00ZDc3LWI5NTEtNDEzNzJlMzdkZDUzXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", episode:"Ep. 8", total:"8", score:8.4, views:1100000, viewsLabel:"1.1M", desc:"Adaptare live-action a celebrului manga/anime One Piece, urmărind aventurile lui Monkey D. Luffy." },
    { rank:2, title:"Avatar (Netflix)", img:"https://m.media-amazon.com/images/M/MV5BZjNiZjY2NTktYTMxMi00N2M5LTliMGMtZjljMzNjYzQzNmQxXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", episode:"Ep. 8", total:"8", score:7.5, views:890000, viewsLabel:"890K", desc:"Versiunea live-action a seriei animate clasice despre ultimul maestru al aerului." },
    { rank:3, title:"Cowboy Bebop (Netflix)", img:"https://m.media-amazon.com/images/M/MV5BOTcwMzY4ZTgtMDQ2ZC00NWM1LTg5ZTYtNGM0ZDMzODkwNjViXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", episode:"Ep. 10", total:"10", score:6.8, views:560000, viewsLabel:"560K", desc:"Vânători de recompense în spațiu — Spike, Jet și Faye — caută criminali pe tot sistemul solar." },
    { rank:4, title:"Bleach (Film)", img:"https://m.media-amazon.com/images/M/MV5BMzJiNTI3MjItMGJiMC00YmE4LWE3NzItNWRhMGJkMjRkOGMxXkEyXkFqcGdeQXVyNTgyNTA4MjM@._V1_.jpg", episode:"Film", total:"1", score:6.5, views:430000, viewsLabel:"430K", desc:"Ichigo Kurosaki, un adolescent cu abilitatea de a vedea fantome, devine un Shinigami de substituție." },
    { rank:5, title:"Yu Yu Hakusho (Netflix)", img:"https://m.media-amazon.com/images/M/MV5BMzc5YTJlY2MtMDVlMi00NWM1LWIxNzUtYzYzZDFjZGViNjBmXkEyXkFqcGdeQXVyMTkxNjUyNQ@@._V1_.jpg", episode:"Ep. 5", total:"5", score:7.2, views:610000, viewsLabel:"610K", desc:"Yusuke Urameshi, un adolescent delincvent, devine detectiv al lumii spiritelor după moartea sa eroică." },
    { rank:6, title:"Death Note (Film)", img:"https://m.media-amazon.com/images/M/MV5BNjQ5MTYzNjQtZTkzMi00Y2YwLTljNTQtNGI4ZTQzMzU4N2Y4XkEyXkFqcGdeQXVyNDQxNjcxNQ@@._V1_.jpg", episode:"Film", total:"1", score:7.0, views:740000, viewsLabel:"740K", desc:"Light Yagami găsește un caiet magic cu care poate ucide pe oricine al cărui nume îl scrie." },
    { rank:7, title:"Alice in Borderland", img:"https://m.media-amazon.com/images/M/MV5BNzExNjQ1OTYtNDc3ZC00ZGQ3LTk4MmItNWVhZGZjZmUwYjZlXkEyXkFqcGdeQXVyMTUzMTg2ODkz._V1_.jpg", episode:"Ep. 16", total:"16", score:7.8, views:950000, viewsLabel:"950K", desc:"Arisu și prietenii săi sunt prinși într-o versiune a Tokyoului unde trebuie să joace jocuri mortale." },
    { rank:8, title:"Squid Game", img:"https://m.media-amazon.com/images/M/MV5BYWE3MDVkN2EtNjQ5MS00ZDQ4LTliNzYtMjc2YWMzMDEwMTA3XkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", episode:"Ep. 9", total:"9", score:8.0, views:1500000, viewsLabel:"1.5M", desc:"Oameni îndatorați participă la jocuri pentru copii cu mize mortale pentru un premiu uriaș." },
    { rank:9, title:"Kingdom", img:"https://m.media-amazon.com/images/M/MV5BODkxNGQ0NTItYTU0Yy00MzgwLTkzNmItMDhhZWQ3NzVjNGYxXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", episode:"Ep. 36", total:"36", score:8.4, views:720000, viewsLabel:"720K", desc:"Prințul moștenitor descoperă o epidemie de zombi care amenință Joseon și încearcă să salveze regatul." },
    { rank:10, title:"All of Us Are Dead", img:"https://m.media-amazon.com/images/M/MV5BMDFmNTA5MGEtYzk2ZS00MTE0LTliZWEtZDlmMzMzMTA2M2IxXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", episode:"Ep. 12", total:"12", score:7.5, views:860000, viewsLabel:"860K", desc:"Un virus transforma elevii unui liceu în zombi și supraviețuitorii luptă să scape în viață." },
    { rank:11, title:"Demon Slayer (Film)", img:"https://cdn.myanimelist.net/images/anime/1704/106947.jpg", episode:"Film", total:"1", score:8.3, views:790000, viewsLabel:"790K", desc:"Tanjiro și echipa se luptă cu un demon puternic în Trenul Infinit alături de Pilonul Flăcărilor." },
    { rank:12, title:"My Love Story with Yamada", img:"https://m.media-amazon.com/images/M/MV5BMzExYmFkZDEtMjU3ZC00YzI3LTliMGQtNTFhMzZiN2VhMWFhXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", episode:"Ep. 12", total:"12", score:7.6, views:460000, viewsLabel:"460K", desc:"O fată timidă se îndrăgostește de un student popular care iubește manga-ul yaoi." },
    { rank:13, title:"Tokyo Revengers (Live)", img:"https://m.media-amazon.com/images/M/MV5BOGI3ZDZlYTEtOGRhNS00MzliLTgyODgtMjZiNzhmMzFjMzZhXkEyXkFqcGdeQXVyMTEzMTI1Mjk3._V1_.jpg", episode:"Film", total:"1", score:7.1, views:530000, viewsLabel:"530K", desc:"Takemichi călătorește în trecut pentru a împiedica moartea fostei sale iubite cauzate de o bandă." },
    { rank:14, title:"Parasyte: The Maxim (Live)", img:"https://m.media-amazon.com/images/M/MV5BOGM2ZTliYWMtNmI4Ni00YWZjLWI5NTYtMzE5ZDliNTQ4NTY4XkEyXkFqcGdeQXVyNTA4NTMyOTU@._V1_.jpg", episode:"Film", total:"1", score:6.9, views:480000, viewsLabel:"480K", desc:"Shinichi Izumi este parțial invadat de un parazit extraterestru și luptă să rămână uman." },
    { rank:15, title:"Fullmetal Alchemist (Live)", img:"https://m.media-amazon.com/images/M/MV5BMjQ1MzcxNjg4N15BMl5BanBnXkFtZTgwNzkyMzk5MjI@._V1_.jpg", episode:"Film", total:"1", score:6.7, views:420000, viewsLabel:"420K", desc:"Frații Elric caută Piatra Filosofală pentru a-și recăpăta trupurile pierdute în această adaptare live." },
    { rank:16, title:"Rurouni Kenshin", img:"https://m.media-amazon.com/images/M/MV5BMjI5MTU2OTcxNl5BMl5BanBnXkFtZTcwNzQ5NTc4OA@@._V1_.jpg", episode:"Film", total:"1", score:7.9, views:650000, viewsLabel:"650K", desc:"Un samurai ucigaș cu jurământul de a nu mai ucide protejează cei nevinovați în era Meiji." }
  ],
  "Filme/Seriale": [
    { rank:1, title:"Demon Slayer: Mugen Train", img:"https://cdn.myanimelist.net/images/anime/1704/106947.jpg", episode:"Film", total:"1", score:8.3, views:1300000, viewsLabel:"1.3M", desc:"Tanjiro și echipa urcă în Trenul Infinit pentru a ajuta Pilonul Flăcărilor împotriva unui demon." },
    { rank:2, title:"Your Name", img:"https://cdn.myanimelist.net/images/anime/5/87048.jpg", episode:"Film", total:"1", score:8.9, views:1050000, viewsLabel:"1.05M", desc:"Doi adolescenți din orașe diferite descoperă că își schimbă trupurile în somn și se îndrăgostesc." },
    { rank:3, title:"Spirited Away", img:"https://cdn.myanimelist.net/images/anime/6/79597.jpg", episode:"Film", total:"1", score:8.8, views:960000, viewsLabel:"960K", desc:"O fetiță de 10 ani rătăcește într-o lume a spiritelor și trebuie să muncească pentru a-și salva părinții." },
    { rank:4, title:"Jujutsu Kaisen 0", img:"https://cdn.myanimelist.net/images/anime/1121/119044.jpg", episode:"Film", total:"1", score:8.1, views:810000, viewsLabel:"810K", desc:"Yuta Okkotsu este bântuit de spiritul prietenei sale decedate și este recrutat de Jujutsu High." },
    { rank:5, title:"Princess Mononoke", img:"https://cdn.myanimelist.net/images/anime/7/75919.jpg", episode:"Film", total:"1", score:8.7, views:680000, viewsLabel:"680K", desc:"Un prinț căută vindecarea unui blestem și se prinde în conflictul dintre oameni și spiritele naturii." },
    { rank:6, title:"A Silent Voice", img:"https://cdn.myanimelist.net/images/anime/1122/96435.jpg", episode:"Film", total:"1", score:8.9, views:790000, viewsLabel:"790K", desc:"Un fost agresor încearcă să-și ispășească trecutul și să se împrietenească cu fata pe care a chinuit-o." },
    { rank:7, title:"The Garden of Words", img:"https://cdn.myanimelist.net/images/anime/6/64955.jpg", episode:"Film", total:"1", score:8.2, views:570000, viewsLabel:"570K", desc:"Un elev și o profesoară se întâlnesc în fiecare dimineață ploioasă într-o grădină din Tokyo." },
    { rank:8, title:"Wolf Children", img:"https://cdn.myanimelist.net/images/anime/9/55836.jpg", episode:"Film", total:"1", score:8.6, views:660000, viewsLabel:"660K", desc:"O tânără crescută singură doi copii care sunt pe jumătate lup, alegând între natură și societate." },
    { rank:9, title:"Nausicaä of the Valley of the Wind", img:"https://cdn.myanimelist.net/images/anime/7/39401.jpg", episode:"Film", total:"1", score:8.5, views:540000, viewsLabel:"540K", desc:"O prințesă luptă să aducă pace între regate rivale și să înțeleagă pericolul pădurii toxice." },
    { rank:10, title:"My Neighbor Totoro", img:"https://cdn.myanimelist.net/images/anime/5/50996.jpg", episode:"Film", total:"1", score:8.2, views:680000, viewsLabel:"680K", desc:"Două surori se mută la țară și descoperă Totoro, un spirit magic al pădurii." },
    { rank:11, title:"Howl's Moving Castle", img:"https://cdn.myanimelist.net/images/anime/5/75810.jpg", episode:"Film", total:"1", score:8.7, views:730000, viewsLabel:"730K", desc:"O tânără blestemată de o vrăjitoare devine bătrână și caută refugiu în castelul zburător al lui Howl." },
    { rank:12, title:"Castle in the Sky", img:"https://cdn.myanimelist.net/images/anime/12/77273.jpg", episode:"Film", total:"1", score:8.4, views:500000, viewsLabel:"500K", desc:"O fetiță cu o piatră magică și un băiat pilot caută împreună misterioasa insulă zburătoare Laputa." },
    { rank:13, title:"Weathering with You", img:"https://cdn.myanimelist.net/images/anime/1880/99927.jpg", episode:"Film", total:"1", score:8.4, views:620000, viewsLabel:"620K", desc:"Un adolescent fugar și o fată cu puterea de a controla vremea înfruntă destinul împreună." },
    { rank:14, title:"Grave of the Fireflies", img:"https://cdn.myanimelist.net/images/anime/1/39593.jpg", episode:"Film", total:"1", score:8.5, views:580000, viewsLabel:"580K", desc:"Doi frați luptă să supraviețuiască în Japonia bombardată din al Doilea Război Mondial." },
    { rank:15, title:"Belle", img:"https://cdn.myanimelist.net/images/anime/1764/113464.jpg", episode:"Film", total:"1", score:8.0, views:490000, viewsLabel:"490K", desc:"O adolescentă timidă devine o celebră cântăreață virtuală și caută identitatea unui mister." },
    { rank:16, title:"Suzume", img:"https://cdn.myanimelist.net/images/anime/1826/138545.jpg", episode:"Film", total:"1", score:8.8, views:850000, viewsLabel:"850K", desc:"O tânără pornește într-o călătorie pentru a închide uși misterioase care aduc dezastre în toată Japonia." }
  ],
  "Cărți": [
    { rank:1, title:"No Longer Human", img:"https://cdn.myanimelist.net/images/manga/4/216859.jpg", episode:"Roman", total:"1", score:9.1, views:870000, viewsLabel:"870K", desc:"Osamu Dazai explorează alienarea și inadecvarea unui om incapabil să se conecteze cu societatea." },
    { rank:2, title:"Battle Royale", img:"https://upload.wikimedia.org/wikipedia/en/4/4f/Battle_Royale_novel.jpg", episode:"Roman", total:"1", score:8.7, views:650000, viewsLabel:"650K", desc:"O clasă de elevi este forțată să se lupte între ei până când rămâne un singur supraviețuitor." },
    { rank:3, title:"Sword Art Online", img:"https://cdn.myanimelist.net/images/manga/2/163277.jpg", episode:"Vol. 27", total:"27", score:8.0, views:740000, viewsLabel:"740K", desc:"Kirito este prins într-un joc VR mortal unde moartea în joc înseamnă moarte în realitate." },
    { rank:4, title:"Overlord", img:"https://cdn.myanimelist.net/images/manga/3/179153.jpg", episode:"Vol. 17", total:"17", score:8.5, views:690000, viewsLabel:"690K", desc:"Un jucător rămâne blocat în corpul personajului său — un schelet atotputernic — la finalul unui MMORPG." },
    { rank:5, title:"Re:Zero", img:"https://cdn.myanimelist.net/images/manga/1/188063.jpg", episode:"Vol. 40", total:"40", score:8.6, views:810000, viewsLabel:"810K", desc:"Subaru este transportat într-un tărâm fantastic și descoperă că poate învia după moarte." },
    { rank:6, title:"Mushoku Tensei", img:"https://cdn.myanimelist.net/images/manga/1/209370.jpg", episode:"Vol. 26", total:"26", score:8.8, views:760000, viewsLabel:"760K", desc:"Un bărbat fără scop se reîncarnează într-o lume magică și hotărăște să nu mai risipească această viață." },
    { rank:7, title:"The Rising of the Shield Hero", img:"https://cdn.myanimelist.net/images/manga/3/188177.jpg", episode:"Vol. 22", total:"22", score:8.1, views:640000, viewsLabel:"640K", desc:"Naofumi Iwatani este invocat ca Eroul Scutului într-o lume nouă, dar trădat și condamnat pe nedrept." },
    { rank:8, title:"That Time I Got Reincarnated as a Slime", img:"https://cdn.myanimelist.net/images/manga/3/191847.jpg", episode:"Vol. 25", total:"25", score:8.3, views:710000, viewsLabel:"710K", desc:"Un om obișnuit se reîncarnează ca slime, cea mai slabă creatură, dar cu abilități uimitoare." },
    { rank:9, title:"Konosuba", img:"https://cdn.myanimelist.net/images/manga/3/188617.jpg", episode:"Vol. 17", total:"17", score:8.2, views:590000, viewsLabel:"590K", desc:"Kazuma moare în circumstanțe ridicole și este trimis într-o lume fantastică cu o zeiță inutilă." },
    { rank:10, title:"Classroom of the Elite", img:"https://cdn.myanimelist.net/images/manga/3/217440.jpg", episode:"Vol. 11", total:"11", score:8.4, views:680000, viewsLabel:"680K", desc:"Într-o școală de elită, elevii trebuie să supraviețuiască unui sistem extrem de competitiv și manipulativ." },
    { rank:11, title:"The Apothecary Diaries", img:"https://cdn.myanimelist.net/images/manga/1/271997.jpg", episode:"Vol. 12", total:"12", score:8.6, views:720000, viewsLabel:"720K", desc:"O farmacistă devenită slujnică în curtea imperială rezolvă misterele palatului cu inteligența ei." },
    { rank:12, title:"Frieren: Beyond Journey's End", img:"https://cdn.myanimelist.net/images/manga/2/254584.jpg", episode:"Vol. 12", total:"12", score:9.2, views:880000, viewsLabel:"880K", desc:"O elfă magiciană reflectează la viața și prietenii umani după ce călătoria eroică s-a terminat." },
    { rank:13, title:"A Returner's Magic Should Be Special", img:"https://cdn.myanimelist.net/images/manga/3/238289.jpg", episode:"Vol. 8", total:"8", score:8.0, views:510000, viewsLabel:"510K", desc:"Un supraviețuitor al labirintului shadow se întoarce în trecut pentru a schimba soarta lumii." },
    { rank:14, title:"Toradora!", img:"https://cdn.myanimelist.net/images/manga/2/56189.jpg", episode:"Vol. 10", total:"10", score:8.0, views:540000, viewsLabel:"540K", desc:"Ryuuji și Taiga, doi colegi cu reputații înșelătoare, se ajută reciproc să cunoască persoanele iubite." },
    { rank:15, title:"Zaregoto", img:"https://cdn.myanimelist.net/images/manga/1/157897.jpg", episode:"Vol. 9", total:"9", score:8.1, views:390000, viewsLabel:"390K", desc:"Un student fără emoții vizitează o insulă izolată plină de genii și se confruntă cu crime misterioase." },
    { rank:16, title:"Durarara!!", img:"https://cdn.myanimelist.net/images/manga/3/80983.jpg", episode:"Vol. 13", total:"13", score:8.3, views:620000, viewsLabel:"620K", desc:"O colecție de personaje ciudate din Ikebukuro, Tokyo, cu vieți interconectate în mod surprinzător." }
  ]
};

// ── Helper pentru trunchiere titlu ─────────────────────────────
function truncateTitle(title, maxLength = 26) {
  if (title.length <= maxLength) return title;
  return title.slice(0, maxLength - 3) + "...";
}

// ── Helpers ───────────────────────────────────────────────────
function getPairClass(rank) {
  if (rank === 1) return "pair-1";
  if (rank === 2) return "pair-2";
  if (rank === 3) return "pair-3";
  return "";
}

// Titlurile și etichetele sunt escapate înainte de inserarea în HTML.
function escapeTrendingText(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  })[char]);
}

// V3: lumină și înclinare controlate de poziția cursorului.
function attachTrendingCardEffect(pair) {
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
  let bounds = null;
  let frame = 0;
  let pointerX = 0;
  let pointerY = 0;

  function resetEffect() {
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    bounds = null;
    pair.classList.remove('avt-tilt-active');
    for (const property of ['--avt-rx', '--avt-ry', '--avt-light-x', '--avt-light-y']) {
      pair.style.removeProperty(property);
    }
  }

  function moveEffect(event) {
    if (event.pointerType === 'touch' || reducedMotion.matches || !finePointer.matches) {
      resetEffect();
      return;
    }
    if (!bounds) bounds = pair.getBoundingClientRect();
    if (!bounds.width || !bounds.height) return;
    pointerX = event.clientX;
    pointerY = event.clientY;
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      if (!bounds || !pair.isConnected) return;
      const x = Math.max(0, Math.min(1, (pointerX - bounds.left) / bounds.width));
      const y = Math.max(0, Math.min(1, (pointerY - bounds.top) / bounds.height));
      pair.style.setProperty('--avt-rx', ((0.5 - y) * 6).toFixed(2) + 'deg');
      pair.style.setProperty('--avt-ry', ((x - 0.5) * 8).toFixed(2) + 'deg');
      pair.style.setProperty('--avt-light-x', (x * 100).toFixed(1) + '%');
      pair.style.setProperty('--avt-light-y', (y * 100).toFixed(1) + '%');
      pair.classList.add('avt-tilt-active');
    });
  }

  pair.addEventListener('pointerenter', moveEffect, { passive: true });
  pair.addEventListener('pointermove', moveEffect, { passive: true });
  pair.addEventListener('pointerleave', resetEffect);
  pair.addEventListener('pointercancel', resetEffect);
  pair.addEventListener('focusout', resetEffect);
}

function buildPairElement(item, animIndex) {
  const pair = document.createElement("article");
  pair.className = `trending-pair ${getPairClass(item.rank)}`;
  pair.style.animationDelay = `${animIndex * 0.06}s`;
  pair.dataset.rank = item.rank;

  pair.innerHTML = `
    <div class="avt-visual">
      <div class="avt-artwork">
        <img src="${escapeTrendingText(item.img)}" alt="${escapeTrendingText(item.title)}" loading="lazy" decoding="async">
      </div>
      <span class="avt-rank" aria-label="Locul ${item.rank}">${String(item.rank).padStart(2, "0")}</span>
    </div>
    <div class="avt-caption">
      <h3 class="avt-title">${escapeTrendingText(item.title)}</h3>
    </div>
    <button class="avt-details-trigger" type="button" aria-label="Detalii despre ${escapeTrendingText(item.title)}"></button>
  `;

  const poster = pair.querySelector(".avt-artwork img");
  poster.addEventListener("error", () => {
    poster.hidden = true;
    poster.style.display = "none";
    const missing = document.createElement("span");
    missing.className = "avt-image-missing";
    missing.textContent = item.title;
    poster.parentElement.appendChild(missing);
  }, { once: true });

  // V36 — popup strict pe hover: nu rămâne deschis pe click/focus
  // și nu poate fi "ținut" deschis mutând cursorul pe popup.
  pair.addEventListener("mouseenter", () => {
    activePopupPair = pair;
    stopSlideTimer();
    showPopup(item, pair);
  });

  pair.addEventListener("mouseleave", () => {
    if (activePopupPair === pair) {
      hidePopup();
      startSlideTimer(currentCat);
    }
  });
  return pair;
}

// ── Render Cards (render complet la schimbarea categoriei) ─────
function renderCards(category) {
  const viewport = document.getElementById("cardsContainer");
  if (!viewport) return;

  stopSlideTimer();
  windowStart = 0;
  isSliding = false;

  viewport.classList.add("fade-out");

  setTimeout(() => {
    viewport.innerHTML = "";

    const track = document.createElement("div");
    track.className = "cards-track";
    viewport.appendChild(track);

    const items = (DATA[category] || []).slice(0, 16);
    const visible = items.slice(0, VISIBLE);

    visible.forEach((item, i) => {
      track.appendChild(buildPairElement(item, i));
    });

    viewport.classList.remove("fade-out");

    if (items.length > VISIBLE) startSlideTimer(category);
  }, 220);
}

// ── Slide ─────────────────────────────────────────────────────
// V42 — când ultimul card (#16) a ajuns în fereastra vizibilă și
// expiră timpul lui, caruselul se resetează la #1 în loc să continue
// circular cu combinații de tipul 12, 13, 14, 15, 16, 1.
function resetCarouselToStart(track, items) {
  if (isSliding) return;

  isSliding = true;
  hidePopup();

  const currentPairs = [...track.querySelectorAll(":scope > .trending-pair")];
  const firstPair = currentPairs[0];

  if (!firstPair || currentPairs.length === 0) {
    windowStart = 0;
    isSliding = false;
    return;
  }

  const CARD_W = firstPair.offsetWidth;
  const GAP = parseFloat(window.getComputedStyle(track).gap) || 28;
  const SLOT = CARD_W + GAP;
  const visibleCount = Math.min(VISIBLE, items.length);

  // V44 — reset continuu, fără fade și fără moment gol.
  // Păstrăm fereastra finală pe ecran, adăugăm 1..6 imediat după ea,
  // apoi glisăm întregul șir spre stânga. Astfel vechile carduri ies,
  // iar 1..6 intră din dreapta exact ca o continuare a caruselului.
  const restartPairs = items.slice(0, visibleCount).map((item) => {
    const pair = buildPairElement(item, 0);
    pair.style.animation = "none";
    pair.style.opacity = "1";
    pair.style.transform = "none";
    pair.style.flexShrink = "0";
    return pair;
  });

  restartPairs.forEach(pair => track.appendChild(pair));

  // Forțăm layout-ul înainte de animație ca browserul să vadă grupul nou.
  void track.offsetWidth;

  const resetDistance = currentPairs.length * SLOT;
  track.style.transition = "transform 0.95s cubic-bezier(0.77, 0, 0.18, 1)";
  track.style.transform = `translateX(-${resetDistance}px)`;

  let settled = false;
  let safetyTimer = null;

  const finishReset = () => {
    if (settled) return;
    settled = true;

    track.removeEventListener("transitionend", onEnd);
    if (safetyTimer) window.clearTimeout(safetyTimer);

    // Scoatem doar vechea fereastră. Noile 1..6 rămân deja în poziție.
    currentPairs.forEach(pair => {
      if (pair.isConnected) pair.remove();
    });

    // Normalizare invizibilă: după eliminare, noile carduri sunt deja 1..6.
    track.style.transition = "none";
    track.style.transform = "none";
    windowStart = 0;

    requestAnimationFrame(() => {
      track.style.transition = "";
      track.style.transform = "";
      isSliding = false;
    });
  };

  const onEnd = (event) => {
    if (event.target !== track || event.propertyName !== "transform") return;
    finishReset();
  };

  track.addEventListener("transitionend", onEnd);
  safetyTimer = window.setTimeout(finishReset, 1150);
}
function slideNextCard(category) {
  if (isSliding) return;

  const viewport = document.getElementById("cardsContainer");
  if (!viewport) return;

  const track = viewport.querySelector(".cards-track");
  if (!track) return;

  const items = (DATA[category] || []).slice(0, 16);
  if (items.length <= VISIBLE) return;

  hidePopup();

  // V43 — reset exact după fereastra finală.
  // Nu ne bazăm doar pe windowStart: verificăm și DOM-ul, ca să nu mai
  // existe încă un pas de tip 9,10,11,12,13 + un loc gol.
  const lastWindowStart = Math.max(0, items.length - VISIBLE);
  const renderedPairs = [...track.querySelectorAll(":scope > .trending-pair")];
  const renderedLastPair = renderedPairs[renderedPairs.length - 1];
  const finalItem = items[items.length - 1];
  const finalCardIsAlreadyLastVisible =
    renderedLastPair && finalItem &&
    String(renderedLastPair.dataset.rank) === String(finalItem.rank);

  // Exemplu cu 13 carduri:
  // 8,9,10,11,12,13 rămân 20 secunde; la următorul tick se revine direct
  // la 1,2,3,4,5,6. Nu mai efectuăm încă un slide spre 9..13.
  if (finalCardIsAlreadyLastVisible || windowStart >= lastWindowStart) {
    resetCarouselToStart(track, items);
    return;
  }

  const firstPair = track.querySelector(".trending-pair");
  if (!firstPair) return;

  isSliding = true;

  const CARD_W = firstPair.offsetWidth;
  const GAP = parseFloat(window.getComputedStyle(track).gap) || 28;
  const SLOT = CARD_W + GAP;

  // Nu mai folosim modulo aici: înainte de final resetăm explicit la #1.
  const nextItem = items[windowStart + VISIBLE];
  if (!nextItem) {
    resetCarouselToStart(track, items);
    return;
  }

  const newPair = buildPairElement(nextItem, 0);
  newPair.style.animation = "none";
  newPair.style.opacity = "1";
  newPair.style.transform = "none";
  newPair.style.flexShrink = "0";
  track.appendChild(newPair);

  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      track.style.transition = "transform 0.7s cubic-bezier(0.77, 0, 0.18, 1)";
      track.style.transform = `translateX(-${SLOT}px)`;
    });
  });

  let settled = false;
  let safetyTimer = null;

  const finishSlide = () => {
    if (settled) return;
    settled = true;
    track.removeEventListener("transitionend", onEnd);
    if (safetyTimer) window.clearTimeout(safetyTimer);

    track.style.transition = "none";
    track.style.transform = "none";

    const oldFirst = track.querySelector(".trending-pair");
    if (oldFirst) oldFirst.remove();

    // Nu permitem niciodată ca indexul să treacă de ultima fereastră completă.
    windowStart = Math.min(windowStart + 1, Math.max(0, items.length - VISIBLE));
    isSliding = false;
  };

  const onEnd = (e) => {
    if (e.target !== track || e.propertyName !== "transform") return;
    finishSlide();
  };

  track.addEventListener("transitionend", onEnd);
  safetyTimer = window.setTimeout(finishSlide, 850);
}

// ── Slide Timer ───────────────────────────────────────────────
function ensureSlideAutoplay() {
  const viewport = document.getElementById("cardsContainer");
  if (!viewport) return null;
  if (slideAutoplay && slideAutoplayRoot === viewport) return slideAutoplay;

  slideAutoplay?.destroy();
  slideAutoplayRoot = viewport;
  slideAutoplay = window.AniVortexCarousel.createAutoplayController({
    root: viewport,
    interval: 20000,
    tick: () => slideNextCard(currentCat),
    canStart: () => !activePopupPair && !viewport.matches(":hover") && !viewport.contains(document.activeElement),
  });
  window.AniVortexCarousel.bindInteractionPause(viewport, slideAutoplay, {
    canResume: () => !activePopupPair,
  });
  return slideAutoplay;
}

function startSlideTimer(category) {
  currentCat = category || currentCat;
  ensureSlideAutoplay()?.start();
}

function stopSlideTimer() {
  slideAutoplay?.stop();
}

// ── Hover Popup ───────────────────────────────────────────────
function getBarGradient(pct) {
  const yellow  = [255, 214,   0];
  const orange  = [255, 120,   0];
  const red     = [220,  30,  30];
  const purple  = [ 55,  30, 180];

  function lerp(a, b, t) {
    return a.map((v, i) => Math.round(v + (b[i] - v) * t));
  }
  function rgb(c) { return `rgb(${c[0]},${c[1]},${c[2]})`; }
  function colorAt(p) {
    if (p <= 30)  return lerp(yellow, yellow, 0);
    if (p <= 55)  return lerp(yellow, orange, (p - 30) / 25);
    if (p <= 75)  return lerp(orange, red,    (p - 55) / 20);
    return              lerp(red,    purple,  (p - 75) / 25);
  }
  const startColor = colorAt(Math.max(0, pct - 40));
  const endColor   = colorAt(pct);
  return `linear-gradient(90deg, ${rgb(startColor)}, ${rgb(endColor)})`;
}

/* ═══════════════════════════════════════════════════════════════
   SHOW POPUP — versiunea finală cu design main.css
   - Header: ANIME — TV + titlu + ★ rating
   - Stats: VIZIONĂRI | EPISODUL (panou central) | LOC
   - "DIN X" cu cifra mai mare
   ═══════════════════════════════════════════════════════════════ */
function showPopup(item, pair) {
  const popup = document.getElementById("hoverPopup");
  if (!popup) return;
  activePopupPair = pair;

  const pct = Math.round((item.views / 1500000) * 100);
  const epNumber = String(item.episode).replace(/\D/g, "") || "1";
  const totalNumber = String(item.total ?? item.episode).replace(/\D/g, "") || epNumber;

  popup.innerHTML = `
    <div class="trending-popup-top">
      <div class="trending-popup-meta">
        <span class="meta-category">ANIME</span>
        <span class="meta-line" aria-hidden="true"></span>
        <span class="meta-type">TV</span>
      </div>
      <h3 class="trending-popup-title-main" title="${escapeTrendingText(item.title)}">${escapeTrendingText(item.title)}</h3>
      <div class="trending-popup-score" aria-label="Rating ${item.score} din 10">
        <i class="fa-solid fa-star" aria-hidden="true"></i>
        <span>${Number(item.score).toFixed(2)}</span>
      </div>
    </div>

    <div class="trending-popup-sep"></div>

    <div class="trending-popup-fire">
      <div class="trending-popup-fire-label">
        <span>🔥 Popularitate</span><span>${pct}%</span>
      </div>
      <div class="trending-popup-fire-track">
        <div class="trending-popup-fire-bar" style="width:0"></div>
      </div>
    </div>

    <div class="trending-popup-stats">
      <div class="trending-stat-side trending-stat-vizionari">
        <span class="trending-stat-label">VIZIONĂRI</span>
        <strong class="trending-stat-value">${escapeTrendingText(item.viewsLabel)}</strong>
      </div>

      <div class="trending-stat-episode">
        <span class="trending-stat-ep-label">EPISODUL</span>
        <strong class="trending-stat-ep-number">${escapeTrendingText(epNumber)}</strong>
        <span class="trending-stat-ep-total">
          <span class="total-label">DIN</span>
          <span class="total-value">${escapeTrendingText(totalNumber)}</span>
        </span>
      </div>

      <div class="trending-stat-side trending-stat-loc">
        <span class="trending-stat-label">LOC</span>
        <strong class="trending-stat-value">#${item.rank}</strong>
      </div>
    </div>

    <div class="trending-popup-desc">
      <span class="trending-popup-desc-label">DESCRIEREA SERIEI</span>
      <p>${escapeTrendingText(item.desc)}</p>
    </div>

    <button class="trending-watch-btn" type="button">▶ Vizionează acum</button>
  `;

  const cardRect = pair.getBoundingClientRect();
  popup.style.width = cardRect.width + "px";

  popup.classList.add("active");

  requestAnimationFrame(() => {
    const bar = popup.querySelector(".trending-popup-fire-bar");
    if (bar) {
      bar.style.background = getBarGradient(pct);
      bar.style.width = pct + "%";
    }
  });

  positionPopup(popup, pair);
}

function positionPopup(popup, pair) {
  const result = window.AniVortexPopup.placeAdjacent(popup, pair, {
    prefer: "right",
    fallback: "left",
    rightGap: 33,
    leftGap: 37,
    safe: 8,
    vertical: "top",
    clampY: false,
    width: popup.getBoundingClientRect().width || 290,
  });
  popup.classList.toggle("is-popup-left", result?.side === "left");
}

function hidePopup() {
  const popup = document.getElementById("hoverPopup");
  activePopupPair = null;
  if (popup) popup.classList.remove("active");
}

// V37 — la scroll popup-ul urmărește cardul 1:1 și NU se mai blochează în viewport.
// Cât timp cursorul este încă pe același card, îl repoziționăm.
// Dacă scroll-ul mută cardul de sub cursor, :hover devine fals și popup-ul dispare.
function syncHoveredPopupPosition() {
  const pair = activePopupPair;
  const popup = document.getElementById("hoverPopup");

  if (!pair || !popup || !pair.isConnected || !popup.classList.contains("active")) return;

  if (!pair.matches(":hover")) {
    hidePopup();
    startSlideTimer(currentCat);
    return;
  }

  positionPopup(popup, pair);
}

// Un singur manager comun urmărește viewport-ul și limitează repoziționarea la un frame.
window.AniVortexPopup.bindViewportTracking(syncHoveredPopupPosition, { wheel: true });

document.addEventListener("keydown", event => {
  if (event.key === "Escape") hidePopup();
});

// ── Category Button ───────────────────────────────────────────
function switchToCategory(index) {
  catIndex   = index;
  currentCat = CATEGORIES[catIndex];

  stopSlideTimer();
  windowStart = 0;

  const catLabel = document.getElementById("catLabel");
  if (catLabel) {
    catLabel.classList.add("swapping");
    setTimeout(() => {
      catLabel.textContent = currentCat;
      catLabel.classList.remove("swapping");
    }, 150);
  }

  renderCards(currentCat);
}

// ── Init în DOMContentLoaded ─────────────────────────────────
function bindTrendingCarouselInteractions() {
  ensureSlideAutoplay();
}

document.addEventListener("DOMContentLoaded", function() {
  const catBtn   = document.getElementById("catBtn");
  const catLabel = document.getElementById("catLabel");

  if (catBtn && catLabel) {
    catBtn.addEventListener("click", () => {
      switchToCategory((catIndex + 1) % CATEGORIES.length);
    });
  }

  bindTrendingCarouselInteractions();
  renderCards(currentCat);
});


// V22 — wheel guard pentru containerul Trending.
(function initTrendingWheelGuard() {
  function bindWheelGuard() {
    const scrollArea = document.getElementById("scrollArea");
    if (!scrollArea || scrollArea.dataset.wheelGuard === "1") return;

    scrollArea.dataset.wheelGuard = "1";
    scrollArea.addEventListener("wheel", (event) => {
      if (event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY)) return;

      const left = scrollArea.scrollLeft;
      requestAnimationFrame(() => {
        if (scrollArea.scrollLeft !== left) scrollArea.scrollLeft = left;
      });
    }, { passive: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindWheelGuard, { once: true });
  } else {
    bindWheelGuard();
  }
})();

/* V55 — scroll vertical REAL pe pagină când cursorul este peste Trending/card.
   Unele containere ale secțiunii pot consuma rotița chiar fără preventDefault().
   De aceea, pentru mișcarea verticală, preluăm evenimentul și derulăm explicit pagina. */
(function () {
  function bindTrendingPageScroll() {
    const master = document.getElementById("trendingMaster");
    if (!master || master.dataset.v55PageScroll === "1") return;

    master.dataset.v55PageScroll = "1";

    master.addEventListener("wheel", function (event) {
      const isVerticalWheel =
        !event.shiftKey &&
        Math.abs(event.deltaY) >= Math.abs(event.deltaX);

      if (!isVerticalWheel) return;

      // Împiedicăm containerul Trending să consume rotița.
      event.preventDefault();
      event.stopPropagation();

      // Derulăm pagina propriu-zisă, indiferent dacă pointerul este pe card/popup/zonă Trending.
      window.scrollBy({
        top: event.deltaY,
        left: 0,
        behavior: "auto"
      });

      // Popup-ul rămâne sincronizat cu cardul cât timp acesta este încă sub cursor.
      syncHoveredPopupPosition();
    }, { passive: false, capture: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", bindTrendingPageScroll, { once: true });
  } else {
    bindTrendingPageScroll();
  }
})();

(function initTrendingDecorativeEffects() {
  function enhanceCard(card) {
    let fx = card.querySelector(":scope > .avt-v31-fx");

    if (!fx) {
      fx = document.createElement("div");
      fx.className = "avt-v31-fx";
      fx.innerHTML = `
        <span class="avt-v31-shard s1"></span>
        <span class="avt-v31-shard s2"></span>
        <span class="avt-v31-shard s3"></span>
        <span class="avt-v31-shard s4"></span>
        <span class="avt-v31-title-glint"></span>
      `;
      card.appendChild(fx);
    }

    if (!fx.querySelector(":scope > .avt-v32-extra")) {
      const extra = document.createElement("div");
      extra.className = "avt-v32-extra";
      extra.innerHTML = `
        <span class="avt-v32-corner-glow left"></span>
        <span class="avt-v32-corner-glow right"></span>
        <span class="avt-v32-ring left ring-1"></span>
        <span class="avt-v32-ring left ring-2"></span>
        <span class="avt-v32-ring left ring-3"></span>
        <span class="avt-v32-ring right ring-1"></span>
        <span class="avt-v32-ring right ring-2"></span>
        <span class="avt-v32-ring right ring-3"></span>
      `;
      fx.appendChild(extra);
    }

    if (!card.querySelector(":scope > .avt-v33-frame")) {
      const frame = document.createElement("div");
      frame.className = "avt-v33-frame";
      card.appendChild(frame);
    }
  }

  function enhanceCards(root = document) {
    if (root instanceof Element && root.matches?.(".trending-pair")) {
      enhanceCard(root);
    }
    root.querySelectorAll?.(".trending-pair").forEach(enhanceCard);
  }

  function init() {
    const target =
      document.querySelector("#trendingMaster .cards-track") ||
      document.getElementById("trendingMaster");

    if (!target || target.dataset.effectsObserver === "1") return;
    target.dataset.effectsObserver = "1";
    enhanceCards(target);

    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        for (const node of mutation.addedNodes) {
          if (node instanceof Element) enhanceCards(node);
        }
      }
    });
    observer.observe(target, { childList: true, subtree: true });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();
