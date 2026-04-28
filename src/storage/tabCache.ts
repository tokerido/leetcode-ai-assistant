const KEY = "tabCache";

export type TabCache = {
  slug: string;
  hints?: { hints: string[]; revealedCount: number };
  complexity?: { result: string };
  errors?: { errorText: string; result: string };
  optimize?: { result: string };
};

type TabKey = keyof Omit<TabCache, "slug">;

async function get(): Promise<TabCache | null> {
  return new Promise((resolve) => {
    chrome.storage.session.get(KEY, (data) => {
      resolve((data[KEY] as TabCache) ?? null);
    });
  });
}

async function set(cache: TabCache): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.session.set({ [KEY]: cache }, resolve);
  });
}

async function clear(): Promise<void> {
  return new Promise((resolve) => {
    chrome.storage.session.remove(KEY, resolve);
  });
}

export async function clearTabCacheIfSlugChanged(slug: string): Promise<void> {
  const cache = await get();
  if (cache && cache.slug !== slug) {
    await clear();
  }
}

export async function getTabSlice<K extends TabKey>(
  slug: string,
  tab: K
): Promise<TabCache[K] | undefined> {
  const cache = await get();
  if (!cache || cache.slug !== slug) return undefined;
  return cache[tab];
}

export async function setTabSlice<K extends TabKey>(
  slug: string,
  tab: K,
  value: NonNullable<TabCache[K]>
): Promise<void> {
  const cache = await get();
  // Guard: don't write if user already navigated to another problem
  if (cache && cache.slug !== slug) return;
  await set({ ...(cache ?? { slug }), slug, [tab]: value });
}
