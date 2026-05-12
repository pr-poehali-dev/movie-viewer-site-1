import { useState, useEffect } from "react";
import Icon from "@/components/ui/icon";
import { fetchTrailer } from "@/lib/tmdb";
import { FALLBACK_IMAGES, type Movie } from "@/types";
import { StarRating } from "@/components/MovieCard";

export function TrailerModal({ movie, onClose }: { movie: Movie; onClose: () => void }) {
  const [trailerUrl, setTrailerUrl] = useState<string | null>(movie.trailer);
  const [loadingTrailer, setLoadingTrailer] = useState(!movie.trailer);
  const [mode, setMode] = useState<"trailer" | "watch">("watch");

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
