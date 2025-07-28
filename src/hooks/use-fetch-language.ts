import { useCallback, useState } from "react";

interface LanguageData {
  language: string;
  id: string;
  usagePercent: number;
}

interface UseFetchLanguagesReturn {
  languages: LanguageData[];
  isLoading: boolean;
  error: string | null;
  fetchLanguages: (username: string) => Promise<LanguageData[]>;
}

// Session storage key prefix
const STORAGE_KEY_PREFIX = "l-line-languages-";

export const useFetchLanguages = (): UseFetchLanguagesReturn => {
  const [languages, setLanguages] = useState<LanguageData[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Generate storage key for username
  const getStorageKey = useCallback((user: string) => {
    return `${STORAGE_KEY_PREFIX}${user.toLowerCase()}`;
  }, []);

  // Get languages from session storage
  const getFromStorage = useCallback(
    (user: string): LanguageData[] | null => {
      try {
        const storageKey = getStorageKey(user);
        const stored = sessionStorage.getItem(storageKey);

        if (stored) {
          const parsed = JSON.parse(stored);
          // Validate the data structure
          if (
            Array.isArray(parsed) &&
            parsed.every(
              (item) =>
                typeof item === "object" &&
                "language" in item &&
                "id" in item &&
                "usagePercent" in item
            )
          ) {
            console.log(
              `Found cached languages for ${user}:`,
              parsed.length,
              "languages"
            );
            return parsed;
          }
        }
      } catch (error) {
        console.warn("Error reading from session storage:", error);
      }
      return null;
    },
    [getStorageKey]
  );

  // Save languages to session storage
  const saveToStorage = useCallback(
    (user: string, data: LanguageData[]) => {
      try {
        const storageKey = getStorageKey(user);
        sessionStorage.setItem(storageKey, JSON.stringify(data));
        console.log(`Cached languages for ${user}:`, data.length, "languages");
      } catch (error) {
        console.warn("Error saving to session storage:", error);
      }
    },
    [getStorageKey]
  );

  // Fetch languages from API
  const fetchFromAPI = useCallback(
    async (user: string): Promise<LanguageData[]> => {
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let allRepos: any[] = [];
        let page = 1;
        const perPage = 200; // Maximum allowed by GitHub

        // Fetch all repositories using pagination
        while (true) {
          const apiUrl = `https://api.github.com/users/${user}/repos?per_page=${perPage}&page=${page}&sort=updated`;

          const response = await fetch(apiUrl);

          if (!response.ok) {
            throw new Error(
              `GitHub API error: ${response.status} ${response.statusText}`
            );
          }

          const repos = await response.json();

          // If we get less than perPage, we've reached the end
          if (repos.length === 0) break;

          allRepos = [...allRepos, ...repos];

          // If we got less than perPage results, we're done
          if (repos.length < perPage) break;

          page++;

          // Safety check to prevent infinite loops (GitHub has max ~1000 repos per user typically)
          if (page > 50) {
            console.warn("Reached maximum page limit, stopping pagination");
            break;
          }
        }

        console.log(`Fetched ${allRepos.length} repositories for ${user}`);

        // Process repositories to extract language data
        const languageStats: Record<string, number> = {};
        let totalBytes = 0;

        // Count language usage across all repos
        for (const repo of allRepos) {
          if (repo.language) {
            const lang = repo.language.toLowerCase();
            languageStats[lang] = (languageStats[lang] || 0) + (repo.size || 1);
            totalBytes += repo.size || 1;
          }
        }

        // Convert to percentage and format
        const languageData: LanguageData[] = Object.entries(languageStats).map(
          ([id, bytes]) => ({
            language: id.charAt(0).toUpperCase() + id.slice(1), // Capitalize first letter
            id: id,
            usagePercent: Math.round((bytes / totalBytes) * 100),
          })
        );

        return languageData;
      } catch (error) {
        console.error("Error fetching from GitHub API:", error);
        throw error;
      }
    },
    []
  );

  // Main fetch function (manually triggered)
  const fetchLanguages = useCallback(
    async (username: string): Promise<LanguageData[]> => {
      if (!username || !username.trim()) {
        throw new Error("Username is required");
      }

      const user = username.trim();
      setIsLoading(true);
      setError(null);

      try {
        // First, try to get from session storage
        const cachedData = getFromStorage(user);

        if (cachedData) {
          setLanguages(cachedData);
          setIsLoading(false);
          return cachedData;
        }

        // If not in cache, fetch from API
        console.log(`Fetching languages for ${user} from GitHub API...`);
        const apiData = await fetchFromAPI(user);

        // Save to cache and update state
        saveToStorage(user, apiData);
        setLanguages(apiData);

        return apiData;
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Failed to fetch languages";
        setError(errorMessage);
        setLanguages([]); // Reset languages on error
        throw error; // Re-throw so caller can handle it
      } finally {
        setIsLoading(false);
      }
    },
    [getFromStorage, fetchFromAPI, saveToStorage]
  );

  return {
    languages,
    isLoading,
    error,
    fetchLanguages,
  };
};
