import { useState } from "react";
import type { TmdbMovie } from "@/lib/tmdb";

export type Page = "home" | "catalog" | "my" | "collections" | "search" | "profile";
export type Movie = TmdbMovie & { saved: boolean; watched: boolean };

export const FALLBACK_IMAGES = [
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/2df19f74-fe37-4106-835f-c69cd3344e82.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/f561515d-5f34-4f8e-a4b3-fc8ab6ba7433.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/a5268deb-76b0-4f39-a915-51310a88face.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/53bd3d86-9ea7-4d4b-a9e6-16c368fef170.jpg",
  "https://cdn.poehali.dev/projects/7909db32-36ae-4649-a9fe-dc9d8872b972/files/f76332f2-c9f1-4dec-b696-1d8dfffd3044.jpg",
];

export const COLLECTIONS = [
  { id: 1, title: "Лучшее 2024", count: 12, img: FALLBACK_IMAGES[1], description: "Главные фильмы этого года" },
  { id: 2, title: "Нуар и тьма", count: 8, img: FALLBACK_IMAGES[0], description: "Культовые нуар-картины" },
  { id: 3, title: "Эпические миры", count: 15, img: FALLBACK_IMAGES[2], description: "Фантастика и фэнтези" },
  { id: 4, title: "Психология страха", count: 9, img: FALLBACK_IMAGES[3], description: "Психологические триллеры" },
];

export const NAV_ITEMS: { id: Page; icon: string; label: string }[] = [
  { id: "home", icon: "Home", label: "Главная" },
  { id: "catalog", icon: "Grid3X3", label: "Каталог" },
  { id: "my", icon: "Bookmark", label: "Мои" },
  { id: "collections", icon: "Layers", label: "Подборки" },
  { id: "search", icon: "Search", label: "Поиск" },
  { id: "profile", icon: "User", label: "Профиль" },
];

export function useLocalMovies(movies: TmdbMovie[]): [Movie[], (id: number, key: "saved" | "watched") => void] {
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
