import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";

const IMAGES = {
  noir: "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/2df19f74-fe37-4106-835f-c69cd3344e82.jpg",
  space: "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/f561515d-5f34-4f8e-a4b3-fc8ab6ba7433.jpg",
  fantasy: "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/a5268deb-76b0-4f39-a915-51310a88face.jpg",
  thriller: "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/53bd3d86-9ea7-4d4b-a9e6-16c368fef170.jpg",
  romance: "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/f76332f2-c9f1-4dec-b696-1d8dfffd3044.jpg",
};

const MOVIES = [
  { id: 1, title: "Тени города", year: 2023, genre: "Нуар", rating: 8.4, duration: "2ч 14мин", img: IMAGES.noir, trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", saved: false, watched: false, tags: ["Триллер", "Нуар"] },
  { id: 2, title: "За горизонтом", year: 2024, genre: "Sci-Fi", rating: 9.1, duration: "2ч 31мин", img: IMAGES.space, trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", saved: true, watched: true, tags: ["Фантастика", "Приключения"] },
  { id: 3, title: "Последний замок", year: 2022, genre: "Фэнтези", rating: 7.8, duration: "2ч 47мин", img: IMAGES.fantasy, trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", saved: false, watched: false, tags: ["Фэнтези", "Эпик"] },
  { id: 4, title: "Изнутри", year: 2024, genre: "Психологический", rating: 8.9, duration: "1ч 58мин", img: IMAGES.thriller, trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", saved: true, watched: false, tags: ["Триллер", "Психологический"] },
  { id: 5, title: "Дождь над Парижем", year: 2023, genre: "Мелодрама", rating: 7.6, duration: "1ч 52мин", img: IMAGES.romance, trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", saved: false, watched: true, tags: ["Романтика", "Драма"] },
  { id: 6, title: "Код молчания", year: 2024, genre: "Триллер", rating: 8.2, duration: "2ч 08мин", img: IMAGES.thriller, trailer: "https://www.youtube.com/embed/dQw4w9WgXcQ", saved: false, watched: false, tags: ["Триллер", "Экшен"] },
];

const COLLECTIONS = [
  { id: 1, title: "Лучшее 2024", count: 12, img: IMAGES.space, description: "Главные фильмы этого года" },
  { id: 2, title: "Нуар и тьма", count: 8, img: IMAGES.noir, description: "Культовые нуар-картины" },
  { id: 3, title: "Эпические миры", count: 15, img: IMAGES.fantasy, description: "Фантастика и фэнтези" },
  { id: 4, title: "Психология страха", count: 9, img: IMAGES.thriller, description: "Психологические триллеры" },
];

type Page = "home" | "catalog" | "my" | "collections" | "search" | "profile";
type Movie = typeof MOVIES[0];

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating / 2);
  return (
    <div className="flex items-center gap-1">
      {[...Array(5)].map((_, i) => (
        <span key={i} className={i < full ? "text-gold text-xs" : "text-white/20 text-xs"}>★</span>
      ))}
      <span className="text-gold text-xs font-medium ml-1">{rating}</span>
    </div>
  );
}

function MovieCard({ movie, onOpen, onSave, delay = 0 }: {
  movie: Movie;
  onOpen: (m: Movie) => void;
  onSave: (id: number) => void;
  delay?: number;
}) {
  return (
    <div
      className="movie-card relative rounded overflow-hidden cursor-pointer group animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-surface">
        <img src={movie.img} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
        <div className="trailer-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-0 flex flex-col justify-end p-3 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
          <button
            onClick={(e) => { e.stopPropagation(); onOpen(movie); }}
            className="w-full py-2 mb-2 bg-gold text-film-black text-xs font-semibold tracking-widest uppercase flex items-center justify-center gap-2 rounded-sm hover:bg-yellow-300 transition-colors"
          >
            <Icon name="Play" size={12} /> Трейлер
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onSave(movie.id); }}
            className={`w-full py-1.5 text-xs tracking-wider uppercase border rounded-sm transition-colors ${movie.saved ? "border-gold text-gold" : "border-white/30 text-white/60 hover:border-white/60"}`}
          >
            {movie.saved ? "В избранном" : "Сохранить"}
          </button>
        </div>

        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {movie.watched && (
            <span className="bg-gold/90 text-film-black text-[9px] px-1.5 py-0.5 rounded-sm font-semibold tracking-wider uppercase">Просмотрено</span>
          )}
        </div>
        <div className="absolute top-2 right-2">
          <span className="bg-black/70 text-gold text-[10px] px-1.5 py-0.5 rounded-sm font-medium">{movie.rating}</span>
        </div>
      </div>

      <div className="p-2 bg-surface">
        <div className="text-[10px] text-muted-foreground uppercase tracking-widest mb-0.5">{movie.genre} · {movie.year}</div>
        <div className="font-serif text-sm text-foreground leading-tight">{movie.title}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{movie.duration}</div>
      </div>
    </div>
  );
}

function TrailerModal({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/95 backdrop-blur-sm animate-fade-in" />
      <div
        className="relative z-10 w-full max-w-3xl mx-4 animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-3 px-1">
          <div>
            <div className="text-[10px] text-gold uppercase tracking-[0.3em] mb-0.5">{movie.genre} · {movie.year}</div>
            <h2 className="font-serif text-2xl text-foreground">{movie.title}</h2>
          </div>
          <button onClick={onClose} className="text-white/40 hover:text-white transition-colors">
            <Icon name="X" size={20} />
          </button>
        </div>

        <div className="relative bg-black rounded overflow-hidden">
          <iframe
            className="trailer-frame"
            src={`${movie.trailer}?autoplay=1`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex items-center gap-4 mt-3 px-1">
          <StarRating rating={movie.rating} />
          <span className="text-muted-foreground text-xs">{movie.duration}</span>
          <div className="flex gap-1 ml-auto">
            {movie.tags.map(t => (
              <span key={t} className="text-[9px] border border-white/20 text-white/40 px-2 py-0.5 rounded-sm uppercase tracking-wider">{t}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-0.5 h-5 bg-gold flex-shrink-0" />
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-white/5 ml-2" />
    </div>
  );
}

function HomePage({ movies, onOpen, onSave }: { movies: Movie[]; onOpen: (m: Movie) => void; onSave: (id: number) => void }) {
  const featured = movies[1];

  return (
    <div className="page-enter">
      <div className="relative h-[72vh] min-h-[500px] overflow-hidden mb-12">
        <img src={featured.img} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" style={{ filter: "brightness(0.35)" }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 p-8 md:p-14 max-w-xl">
          <div className="text-[10px] text-gold uppercase tracking-[0.4em] mb-3 animate-fade-in opacity-0 stagger-1" style={{ animationFillMode: "forwards" }}>Фильм недели</div>
          <h1 className="font-serif text-5xl md:text-6xl text-white leading-none mb-3 animate-fade-in opacity-0 stagger-2" style={{ animationFillMode: "forwards" }}>{featured.title}</h1>
          <div className="flex items-center gap-3 mb-4 animate-fade-in opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
            <StarRating rating={featured.rating} />
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/60 text-xs">{featured.genre}</span>
            <span className="text-white/40 text-xs">·</span>
            <span className="text-white/60 text-xs">{featured.duration}</span>
          </div>
          <p className="text-white/50 text-sm leading-relaxed mb-6 animate-fade-in opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
            Захватывающее путешествие в глубины космоса, где человечество ищет новый дом среди звёзд. Эпическая история выживания и открытий.
          </p>
          <div className="flex gap-3 animate-fade-in opacity-0 stagger-5" style={{ animationFillMode: "forwards" }}>
            <button
              onClick={() => onOpen(featured)}
              className="flex items-center gap-2 bg-gold text-film-black px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-yellow-300 transition-colors"
            >
              <Icon name="Play" size={14} /> Трейлер
            </button>
            <button
              onClick={() => onSave(featured.id)}
              className="flex items-center gap-2 border border-white/30 text-white/70 px-6 py-2.5 text-xs uppercase tracking-widest hover:border-white/60 hover:text-white transition-colors"
            >
              <Icon name="Bookmark" size={14} />
              {featured.saved ? "Сохранено" : "Сохранить"}
            </button>
          </div>
        </div>
      </div>

      <div className="px-4 md:px-10">
        <SectionHeader title="В тренде" />
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {movies.map((m, i) => (
            <MovieCard key={m.id} movie={m} onOpen={onOpen} onSave={onSave} delay={i * 60} />
          ))}
        </div>
      </div>
    </div>
  );
}

function CatalogPage({ movies, onOpen, onSave }: { movies: Movie[]; onOpen: (m: Movie) => void; onSave: (id: number) => void }) {
  const [filter, setFilter] = useState("Все");
  const genres = ["Все", "Нуар", "Sci-Fi", "Фэнтези", "Триллер", "Мелодрама", "Психологический"];
  const filtered = filter === "Все" ? movies : movies.filter(m => m.genre === filter);

  return (
    <div className="px-4 md:px-10 py-8 page-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-0.5 h-6 bg-gold" />
        <h1 className="font-serif text-3xl text-foreground">Каталог</h1>
      </div>

      <div className="flex gap-2 flex-wrap mb-8">
        {genres.map(g => (
          <button
            key={g}
            onClick={() => setFilter(g)}
            className={`px-4 py-1.5 text-[10px] uppercase tracking-widest border transition-all duration-200 ${
              filter === g
                ? "bg-gold border-gold text-film-black font-semibold"
                : "border-white/20 text-white/50 hover:border-white/40 hover:text-white/70"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {filtered.map((m, i) => (
          <MovieCard key={m.id} movie={m} onOpen={onOpen} onSave={onSave} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}

function MyMoviesPage({ movies, onOpen, onSave }: { movies: Movie[]; onOpen: (m: Movie) => void; onSave: (id: number) => void }) {
  const [tab, setTab] = useState<"saved" | "watched">("saved");
  const saved = movies.filter(m => m.saved);
  const watched = movies.filter(m => m.watched);
  const list = tab === "saved" ? saved : watched;

  return (
    <div className="px-4 md:px-10 py-8 page-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-0.5 h-6 bg-gold" />
        <h1 className="font-serif text-3xl text-foreground">Мои фильмы</h1>
      </div>

      <div className="flex gap-0 mb-8 border-b border-white/10">
        <button
          onClick={() => setTab("saved")}
          className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === "saved" ? "border-gold text-gold" : "border-transparent text-white/40 hover:text-white/60"}`}
        >
          Избранное ({saved.length})
        </button>
        <button
          onClick={() => setTab("watched")}
          className={`px-6 py-3 text-xs uppercase tracking-widest transition-colors border-b-2 -mb-px ${tab === "watched" ? "border-gold text-gold" : "border-transparent text-white/40 hover:text-white/60"}`}
        >
          Просмотренные ({watched.length})
        </button>
      </div>

      {list.length === 0 ? (
        <div className="text-center py-20">
          <Icon name="Film" size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">Здесь пока пусто</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
          {list.map((m, i) => (
            <MovieCard key={m.id} movie={m} onOpen={onOpen} onSave={onSave} delay={i * 60} />
          ))}
        </div>
      )}
    </div>
  );
}

function CollectionsPage({ onOpen, onSave, movies }: { onOpen: (m: Movie) => void; onSave: (id: number) => void; movies: Movie[] }) {
  return (
    <div className="px-4 md:px-10 py-8 page-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-0.5 h-6 bg-gold" />
        <h1 className="font-serif text-3xl text-foreground">Подборки</h1>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-12">
        {COLLECTIONS.map((col, i) => (
          <div
            key={col.id}
            className="relative rounded overflow-hidden cursor-pointer group animate-fade-in opacity-0 h-48"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
          >
            <img src={col.img} alt={col.title} className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" style={{ filter: "brightness(0.35)" }} />
            <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent" />
            <div className="relative z-10 p-6 h-full flex flex-col justify-end">
              <div className="text-[9px] text-gold uppercase tracking-[0.3em] mb-1">{col.count} фильмов</div>
              <h3 className="font-serif text-2xl text-white mb-1">{col.title}</h3>
              <p className="text-white/50 text-xs">{col.description}</p>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
              <Icon name="ArrowRight" size={20} className="text-gold" />
            </div>
          </div>
        ))}
      </div>

      <SectionHeader title="Рекомендованные" />
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {movies.slice(0, 4).map((m, i) => (
          <MovieCard key={m.id} movie={m} onOpen={onOpen} onSave={onSave} delay={i * 60} />
        ))}
      </div>
    </div>
  );
}

function SearchPage({ movies, onOpen, onSave }: { movies: Movie[]; onOpen: (m: Movie) => void; onSave: (id: number) => void }) {
  const [query, setQuery] = useState("");
  const results = query.length > 1
    ? movies.filter(m => m.title.toLowerCase().includes(query.toLowerCase()) || m.genre.toLowerCase().includes(query.toLowerCase()))
    : [];

  return (
    <div className="px-4 md:px-10 py-8 page-enter">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-0.5 h-6 bg-gold" />
        <h1 className="font-serif text-3xl text-foreground">Поиск</h1>
      </div>

      <div className="relative max-w-2xl mb-10">
        <Icon name="Search" size={16} className="absolute left-0 top-1/2 -translate-y-1/2 text-gold/60" />
        <input
          type="text"
          value={query}
          onChange={e => setQuery(e.target.value)}
          placeholder="Название фильма, жанр..."
          className="search-input w-full pl-7 pb-2 text-lg placeholder:text-white/20"
          autoFocus
        />
      </div>

      {query.length > 1 && results.length === 0 && (
        <div className="text-center py-20">
          <Icon name="SearchX" size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">Ничего не найдено по запросу «{query}»</p>
        </div>
      )}

      {query.length === 0 && (
        <div className="text-center py-16">
          <div className="shimmer-text font-serif text-6xl mb-4">кино</div>
          <p className="text-white/20 text-xs uppercase tracking-widest">Начните вводить название</p>
        </div>
      )}

      {results.length > 0 && (
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Найдено: {results.length}</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {results.map((m, i) => (
              <MovieCard key={m.id} movie={m} onOpen={onOpen} onSave={onSave} delay={i * 60} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function ProfilePage() {
  const stats = [
    { label: "Просмотрено", value: "47" },
    { label: "Часов", value: "94" },
    { label: "Избранное", value: "12" },
    { label: "Рецензий", value: "8" },
  ];

  return (
    <div className="px-4 md:px-10 py-8 page-enter">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-0.5 h-6 bg-gold" />
        <h1 className="font-serif text-3xl text-foreground">Профиль</h1>
      </div>

      <div className="flex items-center gap-6 mb-10">
        <div className="w-20 h-20 rounded-full bg-surface border border-white/10 flex items-center justify-center">
          <Icon name="User" size={32} className="text-gold/60" />
        </div>
        <div>
          <h2 className="font-serif text-2xl text-foreground mb-1">Алексей Кинолюб</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">Участник с 2023</p>
        </div>
        <button className="ml-auto border border-white/20 text-white/50 text-xs uppercase tracking-widest px-4 py-2 hover:border-white/40 hover:text-white/70 transition-colors">
          Редактировать
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {stats.map((s, i) => (
          <div
            key={s.label}
            className="bg-surface border border-white/5 rounded p-4 text-center animate-fade-in opacity-0"
            style={{ animationDelay: `${i * 80}ms`, animationFillMode: "forwards" }}
          >
            <div className="shimmer-text font-serif text-4xl mb-1">{s.value}</div>
            <div className="text-white/40 text-[10px] uppercase tracking-widest">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="space-y-2">
        {[
          { icon: "Bell", label: "Уведомления" },
          { icon: "Shield", label: "Конфиденциальность" },
          { icon: "Settings", label: "Настройки" },
          { icon: "HelpCircle", label: "Помощь" },
        ].map(item => (
          <button key={item.label} className="w-full flex items-center gap-4 p-4 bg-surface/50 hover:bg-surface border border-white/5 hover:border-white/10 transition-colors text-left">
            <Icon name={item.icon} size={16} className="text-gold/60" />
            <span className="text-white/70 text-sm">{item.label}</span>
            <Icon name="ChevronRight" size={14} className="text-white/20 ml-auto" />
          </button>
        ))}
      </div>
    </div>
  );
}

const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: "home", icon: "Home", label: "Главная" },
  { id: "catalog", icon: "Grid3X3", label: "Каталог" },
  { id: "my", icon: "Bookmark", label: "Мои" },
  { id: "collections", icon: "Layers", label: "Подборки" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "profile", icon: "User", label: "Профиль" },
];

export default function App() {
  const [page, setPage] = useState<Page>("home");
  const [movies, setMovies] = useState(MOVIES);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleSave = (id: number) => {
    setMovies(prev => prev.map(m => m.id === id ? { ...m, saved: !m.saved } : m));
  };

  const navigate = (p: Page) => {
    setPage(p);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-film-black text-foreground">
      {/* Desktop Nav */}
      <nav
        className="fixed top-0 left-0 right-0 z-40 flex items-center justify-between px-8 py-4"
        style={{ background: "linear-gradient(to bottom, rgba(10,10,10,0.98) 0%, transparent 100%)" }}
      >
        <button onClick={() => navigate("home")} className="flex items-center gap-2">
          <Icon name="Film" size={18} className="text-gold" />
          <span className="shimmer-text font-serif text-xl tracking-wider">КИНОТЕКА</span>
        </button>

        <div className="hidden md:flex items-center gap-7">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`text-[10px] uppercase tracking-widest transition-colors ${page === item.id ? "nav-active text-gold" : "text-white/40 hover:text-white/70"}`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <button className="md:hidden text-white/60" onClick={() => setMenuOpen(!menuOpen)}>
          <Icon name={menuOpen ? "X" : "Menu"} size={20} />
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-30 bg-film-black/98 animate-fade-in md:hidden flex flex-col items-center justify-center gap-8">
          {NAV_ITEMS.map((item, i) => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`font-serif text-3xl animate-fade-in opacity-0 ${page === item.id ? "text-gold" : "text-white/60"}`}
              style={{ animationDelay: `${i * 60}ms`, animationFillMode: "forwards" }}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      <main className="pt-16 pb-20 md:pb-8">
        {page === "home" && <HomePage movies={movies} onOpen={setActiveMovie} onSave={handleSave} />}
        {page === "catalog" && <CatalogPage movies={movies} onOpen={setActiveMovie} onSave={handleSave} />}
        {page === "my" && <MyMoviesPage movies={movies} onOpen={setActiveMovie} onSave={handleSave} />}
        {page === "collections" && <CollectionsPage movies={movies} onOpen={setActiveMovie} onSave={handleSave} />}
        {page === "search" && <SearchPage movies={movies} onOpen={setActiveMovie} onSave={handleSave} />}
        {page === "profile" && <ProfilePage />}
      </main>

      {/* Mobile bottom nav */}
      <div
        className="fixed bottom-0 left-0 right-0 z-40 md:hidden border-t border-white/10"
        style={{ background: "rgba(10,10,10,0.97)", backdropFilter: "blur(12px)" }}
      >
        <div className="flex justify-around py-2">
          {NAV_ITEMS.map(item => (
            <button
              key={item.id}
              onClick={() => navigate(item.id)}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 transition-colors ${page === item.id ? "text-gold" : "text-white/30"}`}
            >
              <Icon name={item.icon} size={18} />
              <span className="text-[8px] uppercase tracking-wider">{item.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Trailer modal */}
      {activeMovie && <TrailerModal movie={activeMovie} onClose={() => setActiveMovie(null)} />}
    </div>
  );
}