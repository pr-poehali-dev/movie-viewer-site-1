import Icon from "@/components/ui/icon";
import { FALLBACK_IMAGES, type Movie } from "@/types";

export function StarRating({ rating }: { rating: number }) {
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

export function Skeleton({ className }: { className?: string }) {
  return <div className={`bg-white/5 animate-pulse rounded ${className ?? ""}`} />;
}

export function MovieCard({ movie, onOpen, onToggle, delay = 0 }: {
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

export function MovieGrid({ movies, onOpen, onToggle, loading }: {
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

export function LoadMoreButton({ onClick, loading }: { onClick: () => void; loading: boolean }) {
  return (
    <div className="flex justify-center mt-10">
      <button
        onClick={onClick}
        disabled={loading}
        className="flex items-center gap-2 border border-white/20 text-white/50 hover:border-gold hover:text-gold px-8 py-3 text-xs uppercase tracking-widest transition-colors disabled:opacity-40"
      >
        {loading ? (
          <div className="w-4 h-4 border-2 border-gold/30 border-t-gold rounded-full animate-spin" />
        ) : (
          <Icon name="ChevronDown" size={14} />
        )}
        {loading ? "Загрузка..." : "Загрузить ещё"}
      </button>
    </div>
  );
}
