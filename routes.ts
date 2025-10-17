/**
 * An Array of routes that are accessible to the public
 * These routes do not require authentication
 * @type {string[]}
 */

export const publicRoutes: string[] = [
   
]

/**
 * An Array of routes that are protected
 * These routes require authentication
 * @type {string[]}
 */

export const protectedRoutes: string[] = [
    "/",
    
]

/**
 * An Array of routes that are accessible to the public
 * Routes that start with this (/api/auth) prefix do not require authentication
 * @type {string[]}
 */

export const authRoutes: string[] = [
    "/auth/sign-in",   // Added leading slash
   
]

/**
 * An Array of routes that are accessible to the public
 * Routes that start with this (/api/auth) prefix do not require authentication
 * @type {string}
 */

export const apiAuthPrefix: string = "/api/auth"

export const DEFAULT_LOGIN_REDIRECT = "/"; // Changed to redirect to home page after login
