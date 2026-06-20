import type { TemplateFolder } from "@/modules/playground/lib/path-to-json";

const SKIP_EXTENSIONS = new Set([
  "png",
  "jpg",
  "jpeg",
  "gif",
  "bmp",
  "ico",
  "svg",
  "woff",
  "woff2",
  "ttf",
  "eot",
  "otf",
  "mp3",
  "mp4",
  "wav",
  "avi",
  "mov",
  "zip",
  "tar",
  "gz",
  "rar",
  "pdf",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "exe",
  "dll",
  "so",
  "dylib",
  "pyc",
  "class",
  "o",
]);

const SKIP_FOLDERS = new Set([
  "node_modules",
  ".git",
  ".next",
  "dist",
  "build",
  "__pycache__",
  ".cache",
  ".DS_Store",
]);

const MAX_SINGLE_FILE_SIZE = 500_000;

export interface ParsedGitHubRepoUrl {
  owner: string;
  repo: string;
  branch?: string;
  path?: string;
}

export interface GitHubRepoMetadata {
  name: string;
  full_name: string;
  html_url: string;
  description: string | null;
  default_branch: string;
}

export interface GitHubContentEntry {
  path: string;
  type: "file" | "dir" | string;
  size?: number;
  name?: string;
  download_url?: string | null;
}

export interface GitHubFileEntry {
  path: string;
  content: string;
  size?: number;
}

export function parseGitHubRepoUrl(repoUrl: string): ParsedGitHubRepoUrl | null {
  try {
    const parsed = new URL(repoUrl.trim());
    const host = parsed.hostname.replace(/^www\./, "").toLowerCase();

    if (host !== "github.com") {
      return null;
    }

    const segments = parsed.pathname.split("/").filter(Boolean);
    if (segments.length < 2) {
      return null;
    }

    const [owner, repo, mode, branchOrPath, ...rest] = segments;

    if (!owner || !repo) {
      return null;
    }

    if (mode === "tree" || mode === "blob" || mode === "raw") {
      const path = rest.join("/");
      return {
        owner,
        repo,
        branch: branchOrPath,
        path: path || undefined,
      };
    }

    if (segments.length > 2) {
      return null;
    }

    return {
      owner,
      repo,
    };
  } catch {
    return null;
  }
}

function isTemplateFolder(item: TemplateFolder | { filename: string }): item is TemplateFolder {
  return "folderName" in item;
}

function shouldSkipPath(pathValue: string): boolean {
  const parts = pathValue.split("/").filter(Boolean);

  if (parts.length === 0) {
    return true;
  }

  if (parts.some((part) => SKIP_FOLDERS.has(part) || part.startsWith("."))) {
    return true;
  }

  const fileName = parts[parts.length - 1];
  if (fileName.startsWith(".")) {
    return true;
  }

  const ext = fileName.includes(".") ? fileName.split(".").pop()!.toLowerCase() : "";
  return SKIP_EXTENSIONS.has(ext);
}

export function buildTemplateFolderFromEntries(
  rootName: string,
  entries: GitHubFileEntry[]
): TemplateFolder {
  const root: TemplateFolder = { folderName: rootName, items: [] };

  for (const entry of entries) {
    const cleanPath = entry.path.replace(/^\/+/, "");

    if (!cleanPath || shouldSkipPath(cleanPath)) {
      continue;
    }

    if (typeof entry.size === "number" && entry.size > MAX_SINGLE_FILE_SIZE) {
      continue;
    }

    const parts = cleanPath.split("/").filter(Boolean);
    if (parts.length === 0) {
      continue;
    }

    const fileName = parts.pop()!;
    const dotIndex = fileName.lastIndexOf(".");
    const fileExtension = dotIndex > 0 ? fileName.slice(dotIndex + 1) : "";
    const filename = dotIndex > 0 ? fileName.slice(0, dotIndex) : fileName;

    let currentFolder = root;
    for (const part of parts) {
      let nextFolder = currentFolder.items.find(
        (item) => isTemplateFolder(item) && item.folderName === part
      ) as TemplateFolder | undefined;

      if (!nextFolder) {
        nextFolder = { folderName: part, items: [] };
        currentFolder.items.push(nextFolder);
      }

      currentFolder = nextFolder;
    }

    currentFolder.items.push({
      filename,
      fileExtension,
      content: entry.content,
    });
  }

  return root;
}

export function hasPackageJson(entries: GitHubContentEntry[]): boolean {
  return entries.some((entry) => entry.type === "file" && entry.name === "package.json");
}

export function getMonorepoCandidates(entries: GitHubContentEntry[]): string[] {
  return entries
    .filter((entry) => entry.type === "dir")
    .map((entry) => entry.path)
    .filter(Boolean);
}
