"use client";

import { useLocale } from "next-intl";
import { useEffect, useMemo, useState } from "react";

import { usePathname } from "@/i18n/navigation";
import { usePermissionContext } from "@/features/permissions/permission-provider";

import {
  fallbackMenus,
  filterMenuTree,
  flattenNavigableMenus,
  isActivePath,
  normalizePath,
  buildMenuTree,
  removeMenuRoot,
  type MenuNode,
} from "./menu-tree";
import {
  FAVORITES_STORAGE_KEY,
  MAX_FAVORITES,
  MAX_RECENT_ITEMS,
  RECENT_STORAGE_KEY,
  VISIBLE_RECENT_ITEMS,
  readStorageArray,
  writeStorageArray,
} from "./sidebar-storage";

/** تمام state و منطق سایدبار (منوی پویا، علاقه‌مندی‌ها، اخیر، جستجوی سریع). */
export function useSidebarMenu(onNavigate?: () => void) {
  const locale = useLocale();
  const pathname = usePathname();

  const { items, loading, failed, reload } =
    usePermissionContext();

  const [search, setSearch] = useState("");
  const [expandedItems, setExpandedItems] = useState<
    Record<string, boolean>
  >({});

  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [storageReady, setStorageReady] = useState(false);

  const [quickSearchOpen, setQuickSearchOpen] = useState(false);
  const [quickSearch, setQuickSearch] = useState("");

  // بارگذاری اطلاعات ذخیره‌شده در مرورگر
useEffect(() => {
  const frameId = window.requestAnimationFrame(() => {
    const favorites = readStorageArray(FAVORITES_STORAGE_KEY);
    const recent = readStorageArray(RECENT_STORAGE_KEY);

    setFavoriteIds(favorites.slice(0, MAX_FAVORITES));
    setRecentIds(recent.slice(0, MAX_RECENT_ITEMS));
    setStorageReady(true);
  });

  return () => {
    window.cancelAnimationFrame(frameId);
  };
}, []);

  // ذخیره علاقه‌مندی‌ها
  useEffect(() => {
    if (!storageReady) return;

    writeStorageArray(
      FAVORITES_STORAGE_KEY,
      favoriteIds.slice(0, MAX_FAVORITES),
    );
  }, [favoriteIds, storageReady]);

  // ذخیره تاریخچه
  useEffect(() => {
    if (!storageReady) return;

    writeStorageArray(
      RECENT_STORAGE_KEY,
      recentIds.slice(0, MAX_RECENT_ITEMS),
    );
  }, [recentIds, storageReady]);

  const menuTree = useMemo(() => {
    if (failed) {
      return fallbackMenus.map<MenuNode>((item) => ({
        id: item.id,
        parentId: null,
        menuTitle:
          locale === "fa" ? item.menuTitle : item.enTitle,
        pageCode: null,
        version: null,
        controllerName: null,
        actionName: null,
        showMenu: true,
        icon: item.icon,
        link: item.link,
        children: [],
      }));
    }

    return removeMenuRoot(buildMenuTree(items));
  }, [items, failed, locale]);

  const navigableMenus = useMemo(
    () => flattenNavigableMenus(menuTree),
    [menuTree],
  );

  const filteredMenus = useMemo(
    () => filterMenuTree(menuTree, search, locale),
    [menuTree, search, locale],
  );

  const favoriteMenus = useMemo(
    () =>
      favoriteIds
        .map((id) => navigableMenus.find((node) => node.id === id))
        .filter((node): node is MenuNode => !!node),
    [favoriteIds, navigableMenus],
  );

  const recentMenus = useMemo(
    () =>
      recentIds
        .map((id) => navigableMenus.find((node) => node.id === id))
        .filter((node): node is MenuNode => !!node)
        .slice(0, VISIBLE_RECENT_ITEMS),
    [recentIds, navigableMenus],
  );

  const quickSearchResults = useMemo(() => {
    const query = quickSearch.trim().toLocaleLowerCase(locale);

    if (!query) return navigableMenus.slice(0, 8);

    return navigableMenus
      .filter((node) =>
        node.menuTitle.toLocaleLowerCase(locale).includes(query),
      )
      .slice(0, 10);
  }, [navigableMenus, quickSearch, locale]);

// ثبت صفحه فعال در تاریخچه
useEffect(() => {
  if (!storageReady || !pathname) return;

  const matched = [...navigableMenus]
    .sort(
      (a, b) =>
        normalizePath(b.link).length -
        normalizePath(a.link).length,
    )
    .find((node) => isActivePath(pathname, node.link));

  if (!matched) return;

  const frameId = window.requestAnimationFrame(() => {
    setRecentIds((current) => {
      const next = [
        matched.id,
        ...current.filter((id) => id !== matched.id),
      ].slice(0, MAX_RECENT_ITEMS);

      if (
        current.length === next.length &&
        current.every((id, index) => id === next[index])
      ) {
        return current;
      }

      return next;
    });
  });

  return () => {
    window.cancelAnimationFrame(frameId);
  };
}, [pathname, navigableMenus, storageReady]);

  // میانبر جستجوی سریع
  useEffect(() => {
    function handleKeyboard(event: KeyboardEvent) {
      if (
        (event.ctrlKey || event.metaKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setQuickSearchOpen((current) => !current);
        setQuickSearch("");
      }

      if (event.key === "Escape") {
        setQuickSearchOpen(false);
      }
    }

    window.addEventListener("keydown", handleKeyboard);

    return () => {
      window.removeEventListener("keydown", handleKeyboard);
    };
  }, []);

  function toggleExpanded(id: string) {
    setExpandedItems((current) => ({
      ...current,
      [id]: !(current[id] ?? false),
    }));
  }

  function toggleFavorite(id: string) {
    setFavoriteIds((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      if (current.length >= MAX_FAVORITES) {
        return current;
      }

      return [...current, id];
    });
  }

  function handleNavigate() {
    setQuickSearchOpen(false);
    setQuickSearch("");
    onNavigate?.();
  }

  return {
    locale,
    pathname,
    loading,
    failed,
    reload,
    search,
    setSearch,
    expandedItems,
    favoriteIds,
    favoriteMenus,
    recentMenus,
    filteredMenus,
    quickSearchOpen,
    setQuickSearchOpen,
    quickSearch,
    setQuickSearch,
    quickSearchResults,
    toggleExpanded,
    toggleFavorite,
    handleNavigate,
  };
}

export type SidebarMenuState = ReturnType<typeof useSidebarMenu>;
