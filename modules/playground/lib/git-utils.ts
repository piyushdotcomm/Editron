import { WebContainer } from "@webcontainer/api";
import git from "isomorphic-git";
import http from "isomorphic-git/http/web";

/**
 * Creates a node-like 'fs' object that `isomorphic-git` can use,
 * wrapping the WebContainer instances' `fs` API.
 */
export function createGitFS(instance: WebContainer) {
    return {
        promises: {
            readFile: async (filepath: string, opts?: any) => {
                const encoding = typeof opts === "string" ? opts : opts?.encoding;
                const u8 = await instance.fs.readFile(filepath);
                if (encoding === "utf8") {
                    return new TextDecoder().decode(u8);
                }
                return u8;
            },
            writeFile: async (filepath: string, data: any, opts?: any) => {
                if (typeof data === "string") {
                    await instance.fs.writeFile(filepath, data);
                } else {
                    await instance.fs.writeFile(filepath, new Uint8Array(data));
                }
            },
            unlink: async (filepath: string) => {
                await instance.fs.rm(filepath);
            },
            readdir: async (filepath: string) => {
                // WebContainer readdir returns dirents if withFileTypes is true, but isomorphic-git just wants strings
                const entries = await instance.fs.readdir(filepath);
                return entries;
            },
            mkdir: async (filepath: string) => {
                await instance.fs.mkdir(filepath, { recursive: true });
            },
            rmdir: async (filepath: string) => {
                await instance.fs.rm(filepath, { recursive: true });
            },
            stat: async (filepath: string) => {
                // WebContainer doesn't give a full node fs.Stats, we need to mock size/mtime/isDirectory etc
                return await mockStat(instance, filepath);
            },
            lstat: async (filepath: string) => {
                return await mockStat(instance, filepath);
            },
            readlink: async (filepath: string) => {
                throw new Error("readlink not implemented/needed for basic git");
            },
            symlink: async (target: string, filepath: string) => {
                throw new Error("symlink not implemented/needed for basic git");
            }
        }
    };
}

async function mockStat(instance: WebContainer, filepath: string) {
    try {
        // We can check if it's a directory by trying to read it
        const content = await instance.fs.readFile(filepath);
        return {
            isFile: () => true,
            isDirectory: () => false,
            isSymbolicLink: () => false,
            size: content.length,
            mtimeMs: 1672531200000, // Static stable timestamp to avoid unnecessary re-hashing
            ino: 0,
            dev: 0,
            mode: 0o100644,
            uid: 0,
            gid: 0
        };
    } catch (e: any) {
        if (e.message.includes("EISDIR") || e.message.includes("Is a directory")) {
            return {
                isFile: () => false,
                isDirectory: () => true,
                isSymbolicLink: () => false,
                size: 0,
                mtimeMs: Date.now(),
                ino: 0,
                dev: 0,
                mode: 0o040000,
                uid: 0,
                gid: 0
            };
        }
        throw e;
    }
}

// Helper to initialize a repo if it doesn't exist
export async function initGitRepo(instance: WebContainer, dir: string = "/") {
    const fs = createGitFS(instance);
    try {
        await fs.promises.stat(`${dir}/.git`);
    } catch {
        await git.init({ fs, dir });
    }
}

// Get the current status of all files
export async function getGitStatus(instance: WebContainer, dir: string = "/") {
    const fs = createGitFS(instance);

    // Check if repo exists first
    try {
        await fs.promises.stat(`${dir}/.git`);
    } catch {
        return [];
    }

    const matrix = await git.statusMatrix({
        fs,
        dir,
        filter: (f) => !f.startsWith('node_modules/') && !f.startsWith('.next/') && f !== '.git'
    });

    // Matrix format: [filepath, HEAD, WORKDIR, STAGE]
    // 0 = absent, 1 = present, 2 = present in index but diff in workdir

    return matrix.map(row => {
        const [filepath, head, workdir, stage] = row;

        let status = "unmodified";
        if (head === 0 && workdir === 1 && stage === 0) status = "added, unstaged"; // new, untracked
        if (head === 0 && workdir === 1 && stage === 1) status = "added, staged";
        if (head === 1 && workdir === 1 && stage === 0) status = "modified, unstaged";
        if (head === 1 && workdir === 1 && stage === 1) status = "modified, staged";
        if (head === 1 && workdir === 0 && stage === 1) status = "deleted, unstaged";
        if (head === 1 && workdir === 0 && stage === 0) status = "deleted, staged";

        return {
            filepath,
            head,
            workdir,
            stage,
            status
        };
    }).filter(s => s.status !== "unmodified");
}

export async function stageGitFile(instance: WebContainer, dir: string, filepath: string) {
    const fs = createGitFS(instance);
    await git.add({ fs, dir, filepath });
}

export async function unstageGitFile(instance: WebContainer, dir: string, filepath: string) {
    const fs = createGitFS(instance);
    await git.resetIndex({ fs, dir, filepath });
}

export async function commitGitRepo(instance: WebContainer, dir: string, message: string, name: string, email: string) {
    const fs = createGitFS(instance);
    return await git.commit({
        fs,
        dir,
        author: {
            name: name,
            email: email,
        },
        message: message
    });
}

export async function getGitHistory(instance: WebContainer, dir: string = "/", depth: number = 10) {
    const fs = createGitFS(instance);
    try {
        const commits = await git.log({ fs, dir, depth });
        return commits.map(c => ({
            oid: c.oid,
            message: c.commit.message,
            author: c.commit.author.name,
            timestamp: c.commit.author.timestamp
        }));
    } catch {
        return [];
    }
}

export async function pushGitRepo(instance: WebContainer, dir: string, params: {
    githubToken: string;
    repoUrl: string; // e.g., https://github.com/owner/repo
}) {
    const fs = createGitFS(instance);

    // Add remote if doesn't exist
    try {
        await git.addRemote({
            fs,
            dir,
            remote: 'origin',
            url: params.repoUrl
        });
    } catch (e) {
        // remote already exists, that's fine
    }

    const currentBranch = await git.currentBranch({ fs, dir }) || 'main';

    return await git.push({
        fs,
        http,
        dir,
        remote: 'origin',
        ref: currentBranch,
        corsProxy: 'https://cors.isomorphic-git.org',
        onAuth: () => ({ username: params.githubToken, password: '' }),
    });
}

export async function pullGitRepo(instance: WebContainer, dir: string, params: {
    githubToken: string;
    repoUrl: string;
}) {
    const fs = createGitFS(instance);

    // Add remote if doesn't exist
    try {
        await git.addRemote({
            fs,
            dir,
            remote: 'origin',
            url: params.repoUrl
        });
    } catch (e) {
        // remote already exists, that's fine
    }

    const currentBranch = await git.currentBranch({ fs, dir }) || 'main';

    return await git.pull({
        fs,
        http,
        dir,
        ref: currentBranch,
        singleBranch: true,
        corsProxy: 'https://cors.isomorphic-git.org',
        author: {
            name: "Editron User",
            email: "user@editron.io",
        },
        onAuth: () => ({ username: params.githubToken, password: '' }),
    });
}
