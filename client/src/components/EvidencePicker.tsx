import { FileAudio, FileText, ImagePlus, Mic, Trash2, UploadCloud, Video } from "lucide-react";

export type EvidenceKind = "photo" | "audio" | "video" | "document";

const evidenceOptions: Array<{
  kind: EvidenceKind;
  label: string;
  detail: string;
  accept: string;
  capture?: "environment" | "user";
  icon: typeof ImagePlus;
}> = [
  { kind: "photo", label: "Photo", detail: "Camera or gallery", accept: "image/*", capture: "environment", icon: ImagePlus },
  { kind: "audio", label: "Record audio", detail: "Voice note", accept: "audio/*", capture: "user", icon: Mic },
  { kind: "video", label: "Record video", detail: "Short clip", accept: "video/*", capture: "environment", icon: Video },
  { kind: "document", label: "Upload file", detail: "PDF or text", accept: "application/pdf,text/plain", icon: FileText },
];

export function evidenceKindForFile(file: File | null): EvidenceKind | null {
  if (!file) return null;
  if (file.type.startsWith("image/")) return "photo";
  if (file.type.startsWith("audio/")) return "audio";
  if (file.type.startsWith("video/")) return "video";
  return "document";
}

export default function EvidencePicker({
  file,
  onChoose,
  onRemove,
  maxSizeLabel = "10 MB max",
}: {
  file: File | null;
  onChoose: (file: File | null) => void;
  onRemove: () => void;
  maxSizeLabel?: string;
}) {
  const kind = evidenceKindForFile(file);
  return (
    <section className="rounded-[24px] border border-[#dfe5eb] bg-[#fbfcfd] p-3.5 sm:p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-bold tracking-[-0.01em] text-[#0a1317]">Add evidence</p>
          <p className="mt-0.5 text-xs leading-5 text-[#5d6c7b]">Choose one clear file. You can replace it before review.</p>
        </div>
        <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-bold text-[#5d6c7b] ring-1 ring-[#e4e8ed]">{maxSizeLabel}</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {evidenceOptions.map((option) => {
          const Icon = option.icon;
          return (
            <label key={option.kind} className="group flex min-h-[96px] cursor-pointer flex-col justify-between rounded-[18px] border border-[#dfe5eb] bg-white p-3 text-left transition duration-150 ease-out hover:-translate-y-0.5 hover:border-[#0064e0] hover:shadow-[0_8px_18px_rgba(10,19,23,.08)] active:scale-[.98] motion-reduce:transform-none motion-reduce:transition-none">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-[#f1f4f7] text-[#0064e0] group-hover:bg-[#e5f0ff]"><Icon className="h-4 w-4" /></span>
              <span><span className="block text-xs font-bold text-[#0a1317]">{option.label}</span><span className="mt-0.5 block text-[11px] leading-4 text-[#5d6c7b]">{option.detail}</span></span>
              <input className="sr-only" type="file" accept={option.accept} capture={option.capture} onChange={(event) => onChoose(event.target.files?.[0] ?? null)} />
            </label>
          );
        })}
      </div>
      {file && <div className="mt-3 flex min-w-0 items-center justify-between gap-3 rounded-[16px] border border-[#d7e7fd] bg-[#eef6ff] px-3 py-2.5"><span className="flex min-w-0 items-center gap-2"><span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-white text-[#0064e0]">{kind === "audio" ? <FileAudio className="h-3.5 w-3.5" /> : kind === "video" ? <Video className="h-3.5 w-3.5" /> : kind === "photo" ? <ImagePlus className="h-3.5 w-3.5" /> : <UploadCloud className="h-3.5 w-3.5" />}</span><span className="min-w-0"><span className="block truncate text-xs font-bold text-[#0a1317]">{file.name}</span><span className="block text-[11px] text-[#5d6c7b]">{kind ?? "file"} · {(file.size / 1024 / 1024).toFixed(1)} MB</span></span></span><button type="button" onClick={onRemove} className="inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1.5 text-xs font-bold text-[#a91f34] transition hover:bg-white active:scale-[.98]"><Trash2 className="h-3.5 w-3.5" />Remove</button></div>}
    </section>
  );
}
