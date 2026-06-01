import type { FileSystemAPI, DirEnt } from "@webcontainer/api";

/**
 * Creates an fs-like object compatible with isomorphic-git,
 * wrapping the WebContainer instance.fs API.
 */
export function createGitFS(fs: FileSystemAPI) {
  return {
    promises: {
      readFile: async (path: string, options?: any) => {
        const encoding = typeof options === "string" ? options : options?.encoding;
        if (encoding === "utf8") {
          return await fs.readFile(path, "utf-8");
        }
        return await fs.readFile(path);
      },
      writeFile: async (path: string, data: string | Uint8Array, options?: any) => {
        await fs.writeFile(path, data);
      },
      readdir: async (path: string, options?: any) => {
        const withFileTypes = typeof options === "object" && options?.withFileTypes;
        const entries = await fs.readdir(path, { withFileTypes: true });
        
        if (withFileTypes) {
           return entries.map((e: DirEnt<string>) => ({
               name: e.name,
               isFile: () => e.isFile(),
               isDirectory: () => e.isDirectory(),
               isSymbolicLink: () => false // WebContainer doesn't expose this in DirEnt currently, assuming false for git
           }));
        }
        
        return entries.map((e: DirEnt<string>) => e.name);
      },
      mkdir: async (path: string, options?: any) => {
        await fs.mkdir(path, { recursive: options?.recursive });
      },
      rmdir: async (path: string, options?: any) => {
        await fs.rm(path, { recursive: options?.recursive, force: true });
      },
      unlink: async (path: string) => {
        await fs.rm(path, { force: true });
      },
      stat: async (path: string) => {
        try {
          const content = await fs.readFile(path);
          return {
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
            size: content.length,
            mtimeMs: Date.now(),
            dev: 0,
            ino: 0,
            mode: 0o666,
            uid: 0,
            gid: 0,
          };
        } catch (err) {
          try {
            await fs.readdir(path);
            return {
              isFile: () => false,
              isDirectory: () => true,
              isSymbolicLink: () => false,
              size: 0,
              mtimeMs: Date.now(),
              dev: 0,
              ino: 0,
              mode: 0o777,
              uid: 0,
              gid: 0,
            };
          } catch (e) {
            throw new Error(`ENOENT: no such file or directory, stat '${path}'`);
          }
        }
      },
      lstat: async (path: string) => {
        // Mock lstat identically to stat for WebContainer wrapper
        try {
          const content = await fs.readFile(path);
          return {
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
            size: content.length,
            mtimeMs: Date.now(),
            dev: 0,
            ino: 0,
            mode: 0o666,
            uid: 0,
            gid: 0,
          };
        } catch (err) {
          try {
            await fs.readdir(path);
            return {
              isFile: () => false,
              isDirectory: () => true,
              isSymbolicLink: () => false,
              size: 0,
              mtimeMs: Date.now(),
              dev: 0,
              ino: 0,
              mode: 0o777,
              uid: 0,
              gid: 0,
            };
          } catch (e) {
            throw new Error(`ENOENT: no such file or directory, lstat '${path}'`);
          }
        }
      },
      readlink: async () => {
        throw new Error("readlink not implemented in WebContainer FS wrapper");
      },
      symlink: async () => {
        throw new Error("symlink not implemented in WebContainer FS wrapper");
      }
    }
  };
}
