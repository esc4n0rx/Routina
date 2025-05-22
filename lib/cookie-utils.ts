// Utilitário para gerenciar cookies de forma segura

export interface CookieOptions {
  expires?: Date;
  maxAge?: number;
  path?: string;
  domain?: string;
  secure?: boolean;
  sameSite?: 'strict' | 'lax' | 'none';
}

export const cookieUtils = {
  // Definir um cookie
  set(name: string, value: string, options: CookieOptions = {}): void {
    if (typeof document === 'undefined') return;

    const {
      expires,
      maxAge,
      path = '/',
      domain,
      secure = true,
      sameSite = 'strict'
    } = options;

    let cookieString = `${encodeURIComponent(name)}=${encodeURIComponent(value)}`;

    if (expires) {
      cookieString += `; expires=${expires.toUTCString()}`;
    }

    if (maxAge !== undefined) {
      cookieString += `; max-age=${maxAge}`;
    }

    if (path) {
      cookieString += `; path=${path}`;
    }

    if (domain) {
      cookieString += `; domain=${domain}`;
    }

    if (secure) {
      cookieString += '; secure';
    }

    cookieString += `; samesite=${sameSite}`;

    document.cookie = cookieString;
  },

  // Obter um cookie
  get(name: string): string | null {
    if (typeof document === 'undefined') return null;

    const nameEQ = `${encodeURIComponent(name)}=`;
    const cookies = document.cookie.split(';');

    for (let cookie of cookies) {
      let c = cookie.trim();
      if (c.indexOf(nameEQ) === 0) {
        return decodeURIComponent(c.substring(nameEQ.length));
      }
    }

    return null;
  },

  // Remover um cookie
  remove(name: string, options: Pick<CookieOptions, 'path' | 'domain'> = {}): void {
    const { path = '/', domain } = options;
    
    this.set(name, '', {
      expires: new Date(0),
      path,
      domain
    });
  },

  // Verificar se um cookie existe
  exists(name: string): boolean {
    return this.get(name) !== null;
  },

  // Obter todos os cookies como objeto
  getAll(): Record<string, string> {
    if (typeof document === 'undefined') return {};

    const cookies: Record<string, string> = {};
    const cookieArray = document.cookie.split(';');

    for (let cookie of cookieArray) {
      const [name, value] = cookie.trim().split('=');
      if (name && value) {
        cookies[decodeURIComponent(name)] = decodeURIComponent(value);
      }
    }

    return cookies;
  }
};