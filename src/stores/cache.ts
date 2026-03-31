/**
 * Sistema simples de cache com TTL (Time To Live)
 * Útil para dados que mudam infrequentemente
 * Será complementado com Zustand/Redux quando necessário
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>> = new Map();

  /**
   * Armazena valor no cache
   */
  set<T>(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
    });
  }

  /**
   * Recupera valor do cache se válido (não expirado)
   */
  get<T>(key: string, ttl: number = 5 * 60 * 1000): T | null {
    const entry = this.cache.get(key);
    if (!entry) {return null;}

    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  /**
   * Verifica se chave existe e é válida
   */
  has(key: string, ttl: number = 5 * 60 * 1000): boolean {
    const entry = this.cache.get(key);
    if (!entry) {return false;}

    const age = Date.now() - entry.timestamp;
    if (age > ttl) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove origem do cache
   */
  remove(key: string): void {
    this.cache.delete(key);
  }

  /**
   * Limpa todo o cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Remove entradas expiradas
   */
  cleanup(ttl: number = 5 * 60 * 1000): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > ttl) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Retorna tamanho atual do cache
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Wrapper para get com fallback fetcher
   * Se não existe no cache, executa fetcher e armazena
   */
  async getOrFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttl: number = 5 * 60 * 1000
  ): Promise<T> {
    // Tentar pegar do cache
    const cached = this.get<T>(key, ttl);
    if (cached !== null) {
      return cached;
    }

    // Se não existe, fetch e armazena
    const data = await fetcher();
    this.set(key, data);
    return data;
  }
}

// Exportar instância singleton
export const cache = new SimpleCache();

/**
 * Função helper para cache com TTL
 * Uso: const users = await withCache('users', () => usersService.getAllUsers())
 */
export async function withCache<T>(
  key: string,
  fetcher: () => Promise<T> | T,
  ttl: number = 5 * 60 * 1000
): Promise<T> {
  // Verificar cache
  const cached = cache.get<T>(key, ttl);
  if (cached !== null) {
    return cached;
  }

  // Executar fetcher (pode ser sync ou async)
  const result = await Promise.resolve(fetcher());
  cache.set(key, result);
  return result;
}

/**
 * Invalidar cache de um recurso
 */
export function invalidateCache(pattern?: string): void {
  if (!pattern) {
    cache.clear();
    return;
  }

  // Limpar entradas que casam com pattern
  // Exemplo: invalidateCache('users') limpa 'users', 'users:1', etc
  // Implementação com regex se necessário
}
