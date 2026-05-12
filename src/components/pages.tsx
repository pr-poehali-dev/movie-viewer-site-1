import { useState, useEffect, useCallback, useRef } from "react";
import Icon from "@/components/ui/icon";
import { searchMovies } from "@/lib/tmdb";
import { FALLBACK_IMAGES, COLLECTIONS, type Movie } from "@/types";
import { Skeleton, StarRating, MovieGrid, LoadMoreButton } from "@/components/MovieCard";

function SectionHeader({ title }: { title: string }) {
  return (
    <div className="flex items-center gap-4 mb-6">
      <div className="w-0.5 h-5 bg-gold flex-shrink-0" />
      <h2 className="font-serif text-2xl text-foreground">{title}</h2>
      <div className="flex-1 h-px bg-white/5 ml-2" />
    </div>
  );
}

export function HomePage({ movies, onOpen, onToggle, loading, onLoadMore, loadingMore }: {
  movies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
  loading: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
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
        {!loading && <LoadMoreButton onClick={onLoadMore} loading={loadingMore} />}
      </div>
    </div>
  );
}

export function CatalogPage({ movies, onOpen, onToggle, loading, onLoadMore, loadingMore }: {
  movies: Movie[];
  onOpen: (m: Movie) => void;
  onToggle: (id: number, key: "saved" | "watched") => void;
  loading: boolean;
  onLoadMore: () => void;
  loadingMore: boolean;
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
      {!loading && <LoadMoreButton onClick={onLoadMore} loading={loadingMore} />}
    </div>
  );
}

export function MyMoviesPage({ movies, onOpen, onToggle }: {
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

export function CollectionsPage({ movies, onOpen, onToggle }: {
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
          <MovieGrid movies={movies.slice(0, 20)} onOpen={onOpen} onToggle={onToggle} />
        </>
      )}
    </div>
  );
}

export function SearchPage({ globalMovies, onOpen, onToggle }: {
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

export function ProfilePage({ movies }: { movies: Movie[] }) {
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
