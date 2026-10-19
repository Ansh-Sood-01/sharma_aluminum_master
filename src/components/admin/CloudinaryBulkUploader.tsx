"use client";

import { useRef, useState } from "react";
import { CloudUpload, FileVideo, LoaderCircle, X } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";

export type UploadedAsset = { id: string; url: string; public_id: string; resource_type: "image" | "video" | "raw"; title: string; alt_text: string | null; width?: number; height?: number; duration?: number };

export default function CloudinaryBulkUploader({ userId, assets, onChange }: { userId: string; assets: UploadedAsset[]; onChange: (assets: UploadedAsset[]) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [dragging, setDragging] = useState(false);

  async function uploadFiles(files: FileList | File[]) {
    const picked = Array.from(files);
    if (!picked.length) return;
    setBusy(true); setStatus("");
    try {
      const supabase = getSupabaseBrowserClient();
      const done: UploadedAsset[] = [...assets];
      for (const file of picked) {
        if (!file.type.startsWith("image/") && !file.type.startsWith("video/")) { setStatus(`Skipped ${file.name}: only image and video files are supported.`); continue; }
        const maxBytes = file.type.startsWith("video/") ? 80 * 1024 * 1024 : 20 * 1024 * 1024;
        if (file.size > maxBytes) { setStatus(`Skipped ${file.name}: maximum size is ${file.type.startsWith("video/") ? "80 MB" : "20 MB"}.`); continue; }
        const signedResponse = await fetch("/api/admin/cloudinary-signature", { method: "POST" });
        const signed = await signedResponse.json() as { cloudName?: string; apiKey?: string; timestamp?: number; folder?: string; signature?: string; error?: string };
        if (!signedResponse.ok || !signed.cloudName || !signed.signature) throw new Error(signed.error || "Cloudinary signing failed.");
        const formData = new FormData();
        formData.append("file", file); formData.append("api_key", signed.apiKey!); formData.append("timestamp", String(signed.timestamp)); formData.append("folder", signed.folder!); formData.append("signature", signed.signature);
        const cloudResponse = await fetch(`https://api.cloudinary.com/v1_1/${signed.cloudName}/auto/upload`, { method: "POST", body: formData });
        const cloudResult = await cloudResponse.json() as { secure_url?: string; public_id?: string; resource_type?: "image" | "video" | "raw"; format?: string; width?: number; height?: number; duration?: number; error?: { message?: string } };
        if (!cloudResponse.ok || !cloudResult.secure_url || !cloudResult.public_id) throw new Error(cloudResult.error?.message || `Upload failed for ${file.name}.`);
        const title = file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ");
        const record = { url: cloudResult.secure_url, secure_url: cloudResult.secure_url, public_id: cloudResult.public_id, resource_type: cloudResult.resource_type || (file.type.startsWith("video/") ? "video" : "image"), format: cloudResult.format || null, width: cloudResult.width || null, height: cloudResult.height || null, duration: cloudResult.duration || null, title, alt_text: title, created_by: userId, is_private: false, allow_download: false };
        const { data: asset, error } = await supabase.from("media_assets").insert(record).select("id,url,public_id,resource_type,title,alt_text,width,height,duration").single();
        if (error || !asset) throw new Error(`File uploaded to Cloudinary but its media record could not be saved: ${error?.message || "unknown database error"}.`);
        done.push(asset as UploadedAsset);
        onChange([...done]);
        setStatus(`Uploaded ${file.name}`);
      }
    } catch (error) { setStatus(error instanceof Error ? error.message : "Upload failed."); }
    finally { setBusy(false); if (inputRef.current) inputRef.current.value = ""; }
  }

  return <div className="cloud-upload-wrap"><input ref={inputRef} type="file" multiple accept="image/*,video/mp4,video/webm,video/quicktime" className="visually-hidden" onChange={(e) => e.target.files && void uploadFiles(e.target.files)} />
    <button type="button" className={`cloud-dropzone${dragging ? " is-dragging" : ""}`} onClick={() => inputRef.current?.click()} onDragOver={(e) => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={(e) => { e.preventDefault(); setDragging(false); void uploadFiles(e.dataTransfer.files); }} disabled={busy}><span>{busy ? <LoaderCircle size={22} className="spin" /> : <CloudUpload size={23} />}</span><strong>{busy ? "Uploading files…" : "Drop photographs or videos here"}</strong><small>Or browse files · Images up to 20 MB · Videos up to 80 MB</small></button>
    {status && <p className="upload-status" role="status">{status}</p>}
    {assets.length > 0 && <div className="uploaded-assets-grid">{assets.map((asset) => <div key={asset.id} className="uploaded-asset">{asset.resource_type === "video" ? <span className="asset-type"><FileVideo size={20} /></span> : <img src={asset.url} alt={asset.alt_text || asset.title} /> }<span><strong>{asset.title}</strong><small>{asset.resource_type}</small></span><button type="button" title="Remove from this project" aria-label={`Remove ${asset.title} from project`} onClick={() => onChange(assets.filter((item) => item.id !== asset.id))}><X size={15} /></button></div>)}</div>}
  </div>;
}
