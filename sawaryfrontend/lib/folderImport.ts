// Browser-only utilities for the bulk project-import feature (app/admin/projects/bulk-import).
// No React here — pure DOM/File API plumbing so it's easy to unit-reason about.

const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|webp)$/i

export interface StagedFile {
  file: File
  /** Root-relative path, e.g. "RootFolder/Villa One/img.jpg" — no leading slash. */
  relativePath: string
}

export interface StagedProjectFile {
  file: File
  /** Name of the sub-folder directly under the project folder, or null if the file
   * sits directly inside the project folder (no section). Anything nested deeper
   * than one extra level flattens into that same section. */
  sectionName: string | null
}

export interface ProjectGroup {
  folderName: string
  files: StagedProjectFile[]
}

// ── Source 1: <input type="file" webkitdirectory> ──────────────────────────────
// Every File from a webkitdirectory picker already carries .webkitRelativePath.
export function readWebkitDirectoryInput(fileList: FileList): StagedFile[] {
  return Array.from(fileList).map(file => ({
    file,
    // webkitRelativePath isn't in the standard File type; present at runtime for this input mode.
    relativePath: (file as File & { webkitRelativePath?: string }).webkitRelativePath || file.name,
  }))
}

// ── Source 2: drag-and-drop of a folder ─────────────────────────────────────────
interface FileSystemEntryLike {
  isFile: boolean
  isDirectory: boolean
  fullPath: string
  file?(callback: (file: File) => void, errback?: (err: unknown) => void): void
  createReader?(): { readEntries(callback: (entries: FileSystemEntryLike[]) => void, errback?: (err: unknown) => void): void }
}

function readAllEntries(reader: { readEntries(cb: (entries: FileSystemEntryLike[]) => void, errback?: (err: unknown) => void) : void }): Promise<FileSystemEntryLike[]> {
  // A single readEntries() call is NOT guaranteed to return every entry in a large
  // directory — must keep calling until it returns an empty batch.
  return new Promise((resolve, reject) => {
    const all: FileSystemEntryLike[] = []
    const readBatch = () => {
      reader.readEntries(entries => {
        if (entries.length === 0) {
          resolve(all)
          return
        }
        all.push(...entries)
        readBatch()
      }, reject)
    }
    readBatch()
  })
}

function entryToFile(entry: FileSystemEntryLike): Promise<File> {
  return new Promise((resolve, reject) => {
    entry.file?.(resolve, reject)
  })
}

async function walkEntry(entry: FileSystemEntryLike, out: StagedFile[]): Promise<void> {
  if (entry.isFile) {
    const file = await entryToFile(entry)
    out.push({ file, relativePath: entry.fullPath.replace(/^\/+/, '') })
    return
  }
  if (entry.isDirectory && entry.createReader) {
    const children = await readAllEntries(entry.createReader())
    for (const child of children) {
      await walkEntry(child, out)
    }
  }
}

export async function readDroppedItems(items: DataTransferItemList): Promise<StagedFile[]> {
  const out: StagedFile[] = []
  const roots: FileSystemEntryLike[] = []

  for (let i = 0; i < items.length; i++) {
    const item = items[i]
    const asAny = item as DataTransferItem & { webkitGetAsEntry?: () => FileSystemEntryLike | null }
    const entry = asAny.webkitGetAsEntry?.()
    if (entry) roots.push(entry)
  }

  for (const root of roots) {
    await walkEntry(root, out)
  }

  return out
}

// ── Grouping + cleanup ───────────────────────────────────────────────────────────

export interface GroupResult {
  groups: ProjectGroup[]
  /** Subfolders that exist but contain zero files matching the image allow-list — no
   * project is created for these (nothing to set as a cover), but the admin should still
   * be told they were seen and skipped rather than have them silently vanish. */
  skippedFolders: string[]
}

export function groupIntoProjects(staged: StagedFile[]): GroupResult {
  const byFolder = new Map<string, StagedProjectFile[]>()
  const allFolders = new Set<string>()

  for (const { file, relativePath } of staged) {
    const segments = relativePath.split('/').filter(Boolean)
    // segments[0] = dropped root, segments[1] = project subfolder. Loose files directly
    // in the root (only 2 segments: root/file.ext) don't belong to any subfolder — skip.
    if (segments.length < 3) continue

    const folderName = segments[1]
    allFolders.add(folderName)

    if (!IMAGE_EXTENSIONS.test(file.name)) continue

    // segments[2] = section sub-folder directly under the project folder, when the file
    // is nested at least one level deeper than the project folder itself (segments.length
    // >= 4, i.e. Root/Project/Section/file.ext). A file sitting right inside the project
    // folder (segments.length === 3) has no section.
    const sectionName = segments.length >= 4 ? segments[2] : null

    const list = byFolder.get(folderName) ?? []
    list.push({ file, sectionName })
    byFolder.set(folderName, list)
  }

  const groups = Array.from(byFolder.entries()).map(([folderName, files]) => ({
    folderName,
    files: files.sort((a, b) => a.file.name.localeCompare(b.file.name, undefined, { numeric: true, sensitivity: 'base' })),
  }))
  const skippedFolders = Array.from(allFolders).filter(f => !byFolder.has(f))

  return { groups, skippedFolders }
}

export function cleanProjectName(folderName: string): string {
  const cleaned = folderName
    .replace(/^\d+[\s_.-]+/, '')
    .replace(/[_-]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  return cleaned || folderName
}
