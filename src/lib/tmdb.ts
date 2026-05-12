const TMDB_BASE = "https://api.themoviedb.org/3";
const IMG_BASE = "https://image.tmdb.org/t/p/w500";
const BACKDROP_BASE = "https://image.tmdb.org/t/p/w1280";

const TOKEN = import.meta.env.VITE_TMDB_TOKEN as string;

async function tmdbGet(path: string, params: Record<string, string> = {}) {
  const qs = new URLSearchParams({ language: "ru-RU", ...params }).toString();
  const res = await fetch(`${TMDB_BASE}${path}?${qs}`, {
    headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" },
  });
  if (!res.ok) throw new Error(`TMDB ${res.status}`);
  return res.json();
}

export interface TmdbMovie {
  id: number;
  title: string;
  original_title: string;
  year: string;
  genre: string;
  genres: string[];
  rating: number;
  duration: string;
  img: string | null;
  backdrop: string | null;
  overview: string;
  trailer: string | null;
  saved: boolean;
  watched: boolean;
  tags: string[];
}

function formatMovie(m: Record<string, unknown>): TmdbMovie {
  const poster = m.poster_path ? `${IMG_BASE}${m.poster_path}` : null;
  const backdrop = m.backdrop_path ? `${BACKDROP_BASE}${m.backdrop_path}` : null;
  const runtime = m.runtime as number | undefined;
  const duration = runtime ? `${Math.floor(runtime / 60)}ч ${runtime % 60}мин` : "—";
  const genresList = (m.genres as Array<{ name: string }> | undefined) ?? [];
  const genres = genresList.map((g) => g.name);
  const releaseDate = (m.release_date as string) || (m.first_air_date as string) || "";
  return {
    id: m.id as number,
    title: (m.title as string) || (m.name as string) || "",
    original_title: (m.original_title as string) || "",
    year: releaseDate.slice(0, 4),
    genre: genres[0] || "Кино",
    genres,
    rating: Math.round(((m.vote_average as number) || 0) * 10) / 10,
    duration,
    img: poster,
    backdrop,
    overview: (m.overview as string) || "",
    trailer: null,
    saved: false,
    watched: false,
    tags: genres.slice(0, 2),
  };
}

export async function fetchTrending(page = 1): Promise<TmdbMovie[]> {
  const data = await tmdbGet("/trending/movie/week", { page: String(page) });
  return data.results
    .filter((m: Record<string, unknown>) => m.poster_path)
    .map(formatMovie);
}

export async function searchMovies(query: string): Promise<TmdbMovie[]> {
  const [p1, p2] = await Promise.all([
    tmdbGet("/search/movie", { query, page: "1" }),
    tmdbGet("/search/movie", { query, page: "2" }),
  ]);
  return [...p1.results, ...p2.results]
    .filter((m: Record<string, unknown>) => m.poster_path)
    .slice(0, 40)
    .map(formatMovie);
}

export async function fetchMovieDetails(id: number): Promise<TmdbMovie> {
  const data = await tmdbGet(`/movie/${id}`);
  return formatMovie(data);
}

export async function fetchTrailer(id: number): Promise<string | null> {
  try {
    const data = await tmdbGet(`/movie/${id}/videos`);
    let trailer = data.results.find(
      (v: Record<string, unknown>) => v.type === "Trailer" && v.site === "YouTube"
    );
    if (!trailer) {
      const dataEn = await fetch(
        `${TMDB_BASE}/movie/${id}/videos?language=en-US`,
        { headers: { Authorization: `Bearer ${TOKEN}`, Accept: "application/json" } }
      ).then((r) => r.json());
      trailer = dataEn.results.find(
        (v: Record<string, unknown>) => v.type === "Trailer" && v.site === "YouTube"
      );
    }
    return trailer ? `https://www.youtube.com/embed/${trailer.key}` : null;
  } catch {
    return null;
  }
}