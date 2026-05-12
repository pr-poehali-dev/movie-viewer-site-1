import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";
import { fetchTrending, searchMovies, fetchTrailer, type TmdbMovie } from "@/lib/tmdb";

const FALLBACK_IMAGES = [
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/2df19f74-fe37-4106-835f-c69cd3344e82.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/f561515d-5f34-4f8e-a4b3-fc8ab6ba7433.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/a5268deb-76b0-4f39-a915-51310a88face.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/53bd3d86-9ea7-4d4b-a9e6-16c368fef170.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/f76332f2-c9f1-4dec-b696-1d8dfffd3044.jpg",
];

const COLLECTIONS = [
  { id: 1, title: "Лучшее 2024", count: 12, img: FALLBACK_IMAGES[1], description: "Главные фильмы этого года" },
  { id: 2, title: "Нуар и тьма", count: 8, img: FALLBACK_IMAGES[0], description: "Культовые нуар-картины" },
  { id: 3, title: "Эпические миры", count: 15, img: FALLBACK_IMAGES[2], description: "Фантастика и фэнтези" },
  { id: 4, title: "Психология страха", count: 9, img: FALLBACK_IMAGES[3], description: "Психологические триллеры" },
];

type Page = "home" | "catalog" | "my" | "collections" | "search" | "profile";
type Movie = TmdbMovie & { saved: boolean; watched: boolean };

function useLocalMovies(movies: TmdbMovie[]): [Movie[], (id: number, key: "saved" | "watched") => void] {
  const [overrides, setOverrides] = useState<Record<number, { saved?: boolean; watched?: boolean }>>({});
  const toggle = (id: number, key: "saved" | "watched") => {
    setOverrides(prev => ({
      ...prev,
      [id]: { ...prev[id], [key]: !(prev[id]?.[key] ?? false) },
    }));
  };
  const merged = movies.map(m => ({
    ...m,
    saved: overrides[m.id]?.saved ?? m.saved,
    watched: overrides[m.id]?.watched ?? m.watched,
  }));
  return [merged, toggle];
}

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

function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded ${className ?? ""}`} />;
}

function MovieCard({ movie, onOpen, onToggle, delay = 0 }: {
  movie: Movie;
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
  delay?: number;
}) {
  const img = movie.img || FALLBACK_IMAGES[movie.id % FALLBACK_IMAGES.length];
  return (
    <div
      className="movie-card relative rounded overflow-hidden cursor-pointer group animate-fade-in opacity-0"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
    >
      <div className="aspect-[2/3] relative overflow-hidden bg-surface">
        <img src={img} alt={movie.title} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
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
            onClick={(e) => { e.stopPropagation(); onToggle(movie.id, "saved"); }}
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
        <div className="font-serif text-sm text-foreground leading-tight line-clamp-2">{movie.title}</div>
        <div className="text-[10px] text-muted-foreground mt-0.5">{movie.duration}</div>
      </div>
    </div>
  );
}

function MovieGrid({ movies, onOpen, onToggle, loading }: {
  movies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
  loading?: boolean;
}) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="rounded overflow-hidden">
            <Skeleton className="aspect-[2/3] rounded-none" />
            <div className="p-2 bg-surface space-y-1">
              <Skeleton className="h-2 w-16" />
              <Skeleton className="h-3 w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {movies.map((m, i) => (
        <MovieCard key={m.id} movie={m} onOpen={onOpen} onToggle={onToggle} delay={i * 50} />
      ))}
    </div>
  );
}

function TrailerModal({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(movie.trailer);
  const [loadingTrailer, setLoadingTrailer] = useState(!movie.trailer);
  const [mode, setMode] = useState<"trailer" | "watch">("trailer");

  useEffect(() => {
    if (!movie.trailer) {
      setLoadingTrailer(true);
      fetchTrailer(movie.id).then(url => {
        setTrailerUrl(url);
        setLoadingTrailer(false);
      });
    }
  }, [movie.id, movie.trailer]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const img = movie.img || FALLBACK_IMAGES[movie.id % FALLBACK_IMAGES.length];

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

        <div className="flex gap-2 mb-3 px-1">
          <button
            onClick={() => setMode("trailer")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors ${mode === "trailer" ? "bg-gold text-black font-medium" : "border border-white/20 text-white/50 hover:text-white"}`}
          >
            <Icon name="PlayCircle" size={13} />
            Трейлер
          </button>
          <button
            onClick={() => setMode("watch")}
            className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded transition-colors ${mode === "watch" ? "bg-gold text-black font-medium" : "border border-white/20 text-white/50 hover:text-white"}`}
          >
            <Icon name="Tv" size={13} />
            Смотреть фильм
          </button>
        </div>

        <div className="relative bg-black rounded overflow-hidden aspect-video">
          {mode === "watch" ? (
            <iframe
              className="trailer-frame"
              src={`https://kinobox.tv/video?tmdb=${movie.id}&autoplay=1`}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen"
              allowFullScreen
            />
          ) : (
            <>
              {loadingTrailer && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
                </div>
              )}
              {!loadingTrailer && trailerUrl ? (
                <iframe
                  className="trailer-frame"
                  src={`${trailerUrl}?autoplay=1`}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              ) : !loadingTrailer && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                  <img src={img} alt="" className="absolute inset-0 w-full h-full object-cover opacity-20" />
                  <Icon name="VideoOff" size={32} className="text-white/30 relative z-10" />
                  <p className="text-white/40 text-sm relative z-10">Трейлер недоступен</p>
                </div>
              )}
            </>
          )}
        </div>

        {mode === "watch" && (
          <p className="text-white/30 text-[10px] mt-2 px-1">Контент предоставляется сервисом Kinobox. Доступность фильма зависит от источников.</p>
        )}

        {movie.overview && mode === "trailer" && (
          <p className="text-white/40 text-xs leading-relaxed mt-3 px-1 line-clamp-2">{movie.overview}</p>
        )}

        <div className="flex items-center gap-4 mt-3 px-1">
          <StarRating rating={movie.rating} />
          <span className="text-muted-foreground text-xs">{movie.duration}</span>
          <div className="flex gap-1 ml-auto flex-wrap justify-end">
            {movie.tags.slice(0, 2).map(t => (
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

function HomePage({ movies, onOpen, onToggle, loading }: {
  movies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
  loading: boolean;
}) {
  const featured = movies[0];
  const featuredImg = featured?.backdrop || featured?.img || FALLBACK_IMAGES[1];

  return (
    <div className="page-enter">
      <div className="relative h-[72vh] min-h-[500px] overflow-hidden mb-12">
        {loading ? (
          <div className="absolute inset-0 bg-surface animate-pulse" />
        ) : (
          <img src={featuredImg} alt="" className="absolute inset-0 w-full h-full object-cover scale-105" style={{ filter: "brightness(0.35)" }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />

        <div className="absolute bottom-0 left-0 p-8 md:p-14 max-w-xl">
          <div className="text-[10px] text-gold uppercase tracking-[0.4em] mb-3 animate-fade-in opacity-0 stagger-1" style={{ animationFillMode: "forwards" }}>Фильм недели</div>
          {loading ? (
            <div className="space-y-3">
              <Skeleton className="h-12 w-72" />
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-12 w-40" />
            </div>
          ) : featured ? (
            <>
              <h1 className="font-serif text-5xl md:text-6xl text-white leading-none mb-3 animate-fade-in opacity-0 stagger-2" style={{ animationFillMode: "forwards" }}>{featured.title}</h1>
              <div className="flex items-center gap-3 mb-4 animate-fade-in opacity-0 stagger-3" style={{ animationFillMode: "forwards" }}>
                <StarRating rating={featured.rating} />
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/60 text-xs">{featured.genre}</span>
                <span className="text-white/40 text-xs">·</span>
                <span className="text-white/60 text-xs">{featured.year}</span>
              </div>
              {featured.overview && (
                <p className="text-white/50 text-sm leading-relaxed mb-6 line-clamp-2 animate-fade-in opacity-0 stagger-4" style={{ animationFillMode: "forwards" }}>
                  {featured.overview}
                </p>
              )}
              <div className="flex gap-3 animate-fade-in opacity-0 stagger-5" style={{ animationFillMode: "forwards" }}>
                <button
                  onClick={() => onOpen(featured)}
                  className="flex items-center gap-2 bg-gold text-film-black px-6 py-2.5 text-xs font-semibold uppercase tracking-widest hover:bg-yellow-300 transition-colors"
                >
                  <Icon name="Play" size={14} /> Трейлер
                </button>
                <button
                  onClick={() => onToggle(featured.id, "saved")}
                  className="flex items-center gap-2 border border-white/30 text-white/70 px-6 py-2.5 text-xs uppercase tracking-widest hover:border-white/60 hover:text-white transition-colors"
                >
                  <Icon name="Bookmark" size={14} />
                  {featured.saved ? "Сохранено" : "Сохранить"}
                </button>
              </div>
            </>
          ) : null}
        </div>
      </div>

      <div className="px-4 md:px-10">
        <SectionHeader title="В тренде на этой неделе" />
        <MovieGrid movies={movies} onOpen={onOpen} onToggle={onToggle} loading={loading} />
      </div>
    </div>
  );
}

function CatalogPage({ movies, onOpen, onToggle, loading }: {
  movies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
  loading: boolean;
}) {
  const [filter, setFilter] = useState("Все");
  const genres = ["Все", ...Array.from(new Set(movies.map(m => m.genre))).slice(0, 8)];
  const filtered = filter === "Все" ? movies : movies.filter(m => m.genre === filter);

  return (
    <div className="px-4 md:px-10 py-8 page-enter">
      <div className="flex items-center gap-4 mb-8">
        <div className="w-0.5 h-6 bg-gold" />
        <h1 className="font-serif text-3xl text-foreground">Каталог</h1>
      </div>

      {!loading && (
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
      )}

      <MovieGrid movies={filtered} onOpen={onOpen} onToggle={onToggle} loading={loading} />
    </div>
  );
}

function MyMoviesPage({ movies, onOpen, onToggle }: {
  movies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
}) {
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
          <p className="text-white/20 text-xs mt-1">Наведи на карточку фильма и сохрани его</p>
        </div>
      ) : (
        <MovieGrid movies={list} onOpen={onOpen} onToggle={onToggle} />
      )}
    </div>
  );
}

function CollectionsPage({ movies, onOpen, onToggle }: {
  movies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
}) {
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

      {movies.length > 0 && (
        <>
          <SectionHeader title="Рекомендованные" />
          <MovieGrid movies={movies.slice(0, 6)} onOpen={onOpen} onToggle={onToggle} />
        </>
      )}
    </div>
  );
}

function SearchPage({ globalMovies, onOpen, onToggle }: {
  globalMovies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
}) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const doSearch = useCallback(async (q: string) => {
    if (q.trim().length < 2) { setResults([]); setSearched(false); return; }
    setLoading(true);
    setSearched(true);
    try {
      const raw = await searchMovies(q);
      const withState = raw.map(m => ({
        ...m,
        saved: globalMovies.find(gm => gm.id === m.id)?.saved ?? false,
        watched: globalMovies.find(gm => gm.id === m.id)?.watched ?? false,
      }));
      setResults(withState);
    } catch {
      setResults([]);
    }
    setLoading(false);
  }, [globalMovies]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => doSearch(query), 500);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [query, doSearch]);

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
          placeholder="Название фильма..."
          className="search-input w-full pl-7 pb-2 text-lg placeholder:text-white/20"
          autoFocus
        />
        {loading && (
          <div className="absolute right-0 top-1/2 -translate-y-1/2">
            <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
          </div>
        )}
      </div>

      {!searched && !loading && (
        <div className="text-center py-16">
          <div className="shimmer-text font-serif text-6xl mb-4">кино</div>
          <p className="text-white/20 text-xs uppercase tracking-widest">Начните вводить название на любом языке</p>
        </div>
      )}

      {searched && !loading && results.length === 0 && (
        <div className="text-center py-20">
          <Icon name="SearchX" size={48} className="text-white/10 mx-auto mb-4" />
          <p className="text-white/30 text-sm">Ничего не найдено по запросу «{query}»</p>
        </div>
      )}

      {loading && <MovieGrid movies={[]} onOpen={onOpen} onToggle={onToggle} loading />}

      {!loading && results.length > 0 && (
        <div>
          <p className="text-white/30 text-xs uppercase tracking-widest mb-6">Найдено: {results.length}</p>
          <MovieGrid movies={results} onOpen={onOpen} onToggle={onToggle} />
        </div>
      )}
    </div>
  );
}

function ProfilePage({ movies }: { movies: Movie[] }) {
  const saved = movies.filter(m => m.saved).length;
  const watched = movies.filter(m => m.watched).length;
  const stats = [
    { label: "Просмотрено", value: String(watched) },
    { label: "Часов", value: watched ? String(watched * 2) : "0" },
    { label: "Избранное", value: String(saved) },
    { label: "В каталоге", value: String(movies.length) },
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
          <h2 className="font-serif text-2xl text-foreground mb-1">Кинолюбитель</h2>
          <p className="text-white/40 text-xs uppercase tracking-widest">Участник с 2024</p>
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
  const [rawMovies, setRawMovies] = useState<TmdbMovie[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeMovie, setActiveMovie] = useState<Movie | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [movies, toggleMovie] = useLocalMovies(rawMovies);

  useEffect(() => {
    fetchTrending()
      .then(setRawMovies)
      .catch(() => setRawMovies([]))
      .finally(() => setLoading(false));
  }, []);

  const handleOpen = useCallback((m: Movie) => setActiveMovie(m), []);

  const navigate = (p: Page) => {
    setPage(p);
    setMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-film-black text-foreground">
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

      <main className="pt-16 pb-20 md:pb-8">
        {page === "home" && <HomePage movies={movies} onOpen={handleOpen} onToggle={toggleMovie} loading={loading} />}
        {page === "catalog" && <CatalogPage movies={movies} onOpen={handleOpen} onToggle={toggleMovie} loading={loading} />}
        {page === "my" && <MyMoviesPage movies={movies} onOpen={handleOpen} onToggle={toggleMovie} />}
        {page === "collections" && <CollectionsPage movies={movies} onOpen={handleOpen} onToggle={toggleMovie} />}
        {page === "search" && <SearchPage globalMovies={movies} onOpen={handleOpen} onToggle={toggleMovie} />}
        {page === "profile" && <ProfilePage movies={movies} />}
      </main>

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

      {activeMovie && <TrailerModal movie={activeMovie} onClose={() => setActiveMovie(null)} />}
    </div>
  );
}