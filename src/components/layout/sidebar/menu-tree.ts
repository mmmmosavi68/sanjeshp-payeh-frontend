import type { MenuPermission } from "@/features/permissions/api";

export type MenuNode = MenuPermission & {
  children: MenuNode[];
};

export type FallbackMenu = {
  id: string;
  link: string;
  menuTitle: string;
  enTitle: string;
  icon: string;
};

export const fallbackMenus: FallbackMenu[] = [
  {
    id: "fb-users",
    link: "/users",
    menuTitle: "مدیریت کاربران",
    enTitle: "Users",
    icon: "users",
  },
  {
    id: "fb-sessions",
    link: "/sessions",
    menuTitle: "نشست‌های فعال",
    enTitle: "Active Sessions",
    icon: "history",
  },
  {
    id: "fb-audit",
    link: "/audit-logs",
    menuTitle: "سوابق ممیزی",
    enTitle: "Audit Logs",
    icon: "file-search",
  },
  {
    id: "fb-api-test",
    link: "/api-test",
    menuTitle: "آزمایش API",
    enTitle: "API Test",
    icon: "flask-conical",
  },
];

export function normalizePath(path: string | null | undefined): string {
  if (!path) return "";

  const cleanPath = path.split("?")[0].split("#")[0];

  if (cleanPath === "/") return "/";

  return cleanPath.replace(/\/+$/, "");
}

export function isActivePath(
  pathname: string,
  href: string | null,
): boolean {
  if (!href || !href.startsWith("/") || href.startsWith("//")) {
    return false;
  }

  const current = normalizePath(pathname);
  const target = normalizePath(href);

  return current === target || current.startsWith(`${target}/`);
}

/** فقط مسیرهای داخلی (ضد open redirect / لینک خارجی). */
export function isValidLink(link: string | null | undefined): link is string {
  return !!link && link.startsWith("/") && !link.startsWith("//");
}

export function buildMenuTree(items: MenuPermission[]): MenuNode[] {
  const nodes = new Map<string, MenuNode>();

  for (const item of items) {
    if (!item.showMenu) continue;

    nodes.set(item.id, {
      ...item,
      children: [],
    });
  }

  const roots: MenuNode[] = [];

  for (const node of nodes.values()) {
    const parent = node.parentId
      ? nodes.get(node.parentId)
      : undefined;

    if (parent && parent.id !== node.id) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }

  const visited = new Set<string>();

  function sortAndValidate(itemsToSort: MenuNode[]) {
    itemsToSort.sort(
      (a, b) =>
        (a.pageCode ?? Number.MAX_SAFE_INTEGER) -
        (b.pageCode ?? Number.MAX_SAFE_INTEGER),
    );

    for (const node of itemsToSort) {
      if (visited.has(node.id)) {
        node.children = [];
        continue;
      }

      visited.add(node.id);
      sortAndValidate(node.children);
    }
  }

  sortAndValidate(roots);

  for (const node of nodes.values()) {
    if (!visited.has(node.id)) {
      roots.push(node);
      sortAndValidate([node]);
    }
  }

  return roots;
}

export function removeMenuRoot(nodes: MenuNode[]): MenuNode[] {
  return nodes.flatMap((node) => {
    if (
      node.menuTitle.trim() === "منوها" &&
      node.parentId === null
    ) {
      return node.children;
    }

    return [node];
  });
}

export function filterMenuTree(
  nodes: MenuNode[],
  query: string,
  locale: string,
): MenuNode[] {
  if (!query.trim()) return nodes;

  const normalizedQuery = query
    .trim()
    .toLocaleLowerCase(locale);

  return nodes.reduce<MenuNode[]>((result, node) => {
    const label = node.menuTitle.toLocaleLowerCase(locale);

    const filteredChildren = filterMenuTree(
      node.children,
      query,
      locale,
    );

    if (
      label.includes(normalizedQuery) ||
      filteredChildren.length > 0
    ) {
      result.push({
        ...node,
        children: filteredChildren,
      });
    }

    return result;
  }, []);
}

export function hasActiveChild(
  node: MenuNode,
  pathname: string,
): boolean {
  return node.children.some(
    (child) =>
      isActivePath(pathname, child.link) ||
      hasActiveChild(child, pathname),
  );
}

export function flattenNavigableMenus(nodes: MenuNode[]): MenuNode[] {
  const result: MenuNode[] = [];

  function visit(items: MenuNode[]) {
    for (const node of items) {
      const hasValidLink =
        !!node.link &&
        node.link.startsWith("/") &&
        !node.link.startsWith("//");

      if (hasValidLink && node.children.length === 0) {
        result.push(node);
      }

      visit(node.children);
    }
  }

  visit(nodes);

  return result;
}

