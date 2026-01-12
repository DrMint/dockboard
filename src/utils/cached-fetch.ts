import { db, eq, Requests } from "astro:db";

const CACHE_EXPIRATION_TIME = 1000 * 60 * 60 * 24; // 24 hours

export const cachedFetch = async (
  url: string,
  options: RequestInit = {},
  skipCache: boolean = false
): Promise<{
  headers: Record<string, string>;
  body: string;
  timestamp: number;
}> => {
  const cachedResponses = await db.select().from(Requests).where(eq(Requests.url, url));
  const cachedResponse = cachedResponses[0];
  if (!skipCache && cachedResponse) {
    const isExpired = Date.now() - cachedResponse.timestamp > CACHE_EXPIRATION_TIME;
    if (!isExpired) {
      return {
        headers: cachedResponse.responseHeaders as Record<string, string>,
        body: cachedResponse.responseBody,
        timestamp: cachedResponse.timestamp,
      };
    }
  }

  const response = await fetch(url, options);
  const headers = Object.fromEntries(response.headers.entries());
  const body = await response.text();
  const timestamp = Date.now();

  if (cachedResponse) {
    await db
      .update(Requests)
      .set({ responseHeaders: headers, responseBody: body, timestamp })
      .where(eq(Requests.url, url));
  } else {
    await db
      .insert(Requests)
      .values({ url, responseHeaders: headers, responseBody: body, timestamp });
  }

  return { headers, body, timestamp };
};
