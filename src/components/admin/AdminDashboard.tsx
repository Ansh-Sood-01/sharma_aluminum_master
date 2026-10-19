"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { LayoutDashboard, FolderKanban, Tags, Inbox, CalendarClock, Bot, Settings2, LogOut, Plus, Pencil, Trash2, Save, X, LoaderCircle, CheckCircle2, AlertTriangle, ExternalLink, RefreshCw, Phone, Mail, MessageCircle } from "lucide-react";
import { getSupabaseBrowserClient } from "@/lib/supabase/browser";
import CloudinaryBulkUploader, { type UploadedAsset } from "@/components/admin/CloudinaryBulkUploader";
import { business } from "@/config/business";

type Locale = "en" | "hi" | "pa";
type Translation = { locale: Locale; title: string; description: string };
type CategoryRow = { id: string; slug: string; cover_image_url: string | null; sort_order: number; active: boolean; category_translations?: Translation[] };
type MediaRow = { id: string; url: string; public_id?: string | null; resource_type: "image" | "video" | "raw"; title: string; alt_text: string | null; width?: number; height?: number; duration?: number };
type ProjectRow = { id: string; slug: string; category_id: string | null; cover_image_url: string | null; tags: string[]; featured: boolean; premium: boolean; published: boolean; allow_download: boolean; created_at: string; categories?: { slug: string } | null; project_translations?: Translation[]; project_media?: Array<{ position: number; media_assets: MediaRow | null }> };
type EnquiryRow = { id: string; type: string; name: string; phone: string; email: string | null; service: string | null; message: string; status: string; created_at: string; admin_notes?: string | null; project_slug?: string | null; follow_up_at?: string | null };
type RelatedRequest = { id: string; status: string; preferred_time?: string | null; preferred_date?: string | null; address?: string; requirement?: string; created_at: string; enquiries?: { name: string; phone: string; message: string } | null };
type Conversation = { id: string; status: string; locale: string; created_at: string; ai_messages?: Array<{ role: string; content: string; needs_human: boolean; created_at: string }> };
type Tab = "overview" | "projects" | "categories" | "enquiries" | "visits" | "care" | "setup";

type ProjectForm = { title: string; titleHi: string; titlePa: string; slug: string; categoryId: string; description: string; descriptionHi: string; descriptionPa: string; coverUrl: string; tags: string; featured: boolean; premium: boolean; published: boolean; allowDownload: boolean };
const emptyProject: ProjectForm = { title: "", titleHi: "", titlePa: "", slug: "", categoryId: "", description: "", descriptionHi: "", descriptionPa: "", coverUrl: "", tags: "", featured: false, premium: false, published: false, allowDownload: false };
const nav: { id: Tab; label: string; icon: typeof LayoutDashboard }[] = [
  { id: "overview", label: "Overview", icon: LayoutDashboard }, { id: "projects", label: "Projects & media", icon: FolderKanban }, { id: "categories", label: "Categories", icon: Tags }, { id: "enquiries", label: "Enquiries", icon: Inbox }, { id: "visits", label: "Visits & callbacks", icon: CalendarClock }, { id: "care", label: "Customer care", icon: Bot }, { id: "setup", label: "Setup & security", icon: Settings2 },
];
function slugify(value: string) { return value.toLowerCase().normalize("NFKD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 90); }
function tr(rows: Translation[] | undefined, locale: Locale): Translation | undefined { return rows?.find((x) => x.locale === locale) || rows?.find((x) => x.locale === "en"); }
function asUploadedAsset(row: MediaRow): UploadedAsset { return { id: row.id, url: row.url, public_id: row.public_id || "", resource_type: row.resource_type, title: row.title || "Media", alt_text: row.alt_text, width: row.width, height: row.height, duration: row.duration }; }

export default function AdminDashboard({ user }: { user: { email: string | null; fullName: string | null } }) {
  const router = useRouter();
  const [tab, setTab] = useState<Tab>("overview");
  const [categories, setCategories] = useState<CategoryRow[]>([]);
  const [projects, setProjects] = useState<ProjectRow[]>([]);
  const [enquiries, setEnquiries] = useState<EnquiryRow[]>([]);
  const [visits, setVisits] = useState<RelatedRequest[]>([]);
  const [callbacks, setCallbacks] = useState<RelatedRequest[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [projectEditor, setProjectEditor] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [projectForm, setProjectForm] = useState<ProjectForm>(emptyProject);
  const [projectAssets, setProjectAssets] = useState<UploadedAsset[]>([]);
  const [categoryEditor, setCategoryEditor] = useState(false);
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [categoryForm, setCategoryForm] = useState({ title: "", titleHi: "", titlePa: "", slug: "", description: "", descriptionHi: "", descriptionPa: "", coverImage: "", sortOrder: "0", active: true });

  const client = useMemo(() => {
    try { return getSupabaseBrowserClient(); } catch { return null; }
  }, []);

  const loadAll = useCallback(async (showSpinner = true) => {
    if (!client) { setLoading(false); setError("Supabase environment values are missing. Add them to .env.local and restart the dev server."); return; }
    if (showSpinner) setLoading(true);
    setError("");
    try {
      const [{ data: authData }, cats, projs, ens, visitRows, callbackRows, chatRows] = await Promise.all([
        client.auth.getUser(),
        client.from("categories").select("*,category_translations(*)").order("sort_order", { ascending: true }),
        client.from("projects").select("*,categories(slug),project_translations(*),project_media(position,media_assets(id,url,public_id,resource_type,title,alt_text,width,height,duration))").order("created_at", { ascending: false }),
        client.from("enquiries").select("*").order("created_at", { ascending: false }).limit(150),
        client.from("site_visit_requests").select("*,enquiries(name,phone,message)").order("created_at", { ascending: false }).limit(100),
        client.from("callback_requests").select("*,enquiries(name,phone,message)").order("created_at", { ascending: false }).limit(100),
        client.from("ai_conversations").select("*,ai_messages(role,content,needs_human,created_at)").order("created_at", { ascending: false }).limit(100),
      ]);
      if (authData.user) setCurrentUserId(authData.user.id);
      const firstError = [cats, projs, ens, visitRows, callbackRows, chatRows].find((result) => result.error)?.error;
      if (firstError) throw new Error(firstError.message);
      setCategories((cats.data || []) as CategoryRow[]);
      setProjects((projs.data || []) as unknown as ProjectRow[]);
      setEnquiries((ens.data || []) as EnquiryRow[]);
      setVisits((visitRows.data || []) as unknown as RelatedRequest[]);
      setCallbacks((callbackRows.data || []) as unknown as RelatedRequest[]);
      setConversations((chatRows.data || []) as unknown as Conversation[]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not load admin data. Check the Supabase migration, RLS policies and admin user row.");
    } finally { setLoading(false); }
  }, [client]);

  useEffect(() => { void loadAll(); }, [loadAll]);

  async function signOut() {
    await client?.auth.signOut();
    router.push("/admin"); router.refresh();
  }
  function startNewProject() { setEditingProjectId(null); setProjectForm(emptyProject); setProjectAssets([]); setProjectEditor(true); setError(""); setNotice(""); }
  function editProject(project: ProjectRow) {
    const en = tr(project.project_translations, "en"); const hi = tr(project.project_translations, "hi"); const pa = tr(project.project_translations, "pa");
    setEditingProjectId(project.id); setProjectForm({ title: en?.title || project.slug, titleHi: hi?.title || "", titlePa: pa?.title || "", slug: project.slug, categoryId: project.category_id || "", description: en?.description || "", descriptionHi: hi?.description || "", descriptionPa: pa?.description || "", coverUrl: project.cover_image_url || "", tags: (project.tags || []).join(", "), featured: project.featured, premium: project.premium, published: project.published, allowDownload: project.allow_download });
    const media = (project.project_media || []).map((item) => item.media_assets).filter((item): item is MediaRow => Boolean(item)).map(asUploadedAsset);
    setProjectAssets(media); setProjectEditor(true); setError(""); setNotice("");
  }
  async function saveProject(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!client) return;
    if (!projectForm.title.trim()) { setError("Project title is required."); return; }
    if (projectForm.published && !projectForm.coverUrl.trim() && projectAssets.length === 0) {
      setError("Add a cover image or at least one photograph/video before publishing this project.");
      return;
    }
    setSaving(true); setError(""); setNotice("");
    try {
      const slug = slugify(projectForm.slug || projectForm.title);
      if (!slug) throw new Error("Please provide a valid project slug.");
      const data = { slug, category_id: projectForm.categoryId || null, cover_image_url: projectForm.coverUrl.trim() || projectAssets.find((item) => item.resource_type === "image")?.url || null, tags: projectForm.tags.split(",").map((tag) => tag.trim()).filter(Boolean).slice(0, 20), featured: projectForm.featured, premium: projectForm.premium, published: projectForm.published, allow_download: projectForm.allowDownload, ...(editingProjectId ? {} : { created_by: currentUserId }) };
      let projectId = editingProjectId;
      if (editingProjectId) {
        const { error: updateError } = await client.from("projects").update(data).eq("id", editingProjectId);
        if (updateError) throw new Error(updateError.message);
        const { error: deleteTranslationError } = await client.from("project_translations").delete().eq("project_id", editingProjectId);
        if (deleteTranslationError) throw new Error(deleteTranslationError.message);
        const { error: deleteMediaError } = await client.from("project_media").delete().eq("project_id", editingProjectId);
        if (deleteMediaError) throw new Error(deleteMediaError.message);
      } else {
        const { data: created, error: createError } = await client.from("projects").insert(data).select("id").single();
        if (createError || !created) throw new Error(createError?.message || "Project could not be created.");
        projectId = created.id as string;
      }
      const translations: Translation[] = [
        { locale: "en", title: projectForm.title.trim(), description: projectForm.description.trim() },
        { locale: "hi", title: projectForm.titleHi.trim() || projectForm.title.trim(), description: projectForm.descriptionHi.trim() || projectForm.description.trim() },
        { locale: "pa", title: projectForm.titlePa.trim() || projectForm.title.trim(), description: projectForm.descriptionPa.trim() || projectForm.description.trim() },
      ];
      const { error: translationError } = await client.from("project_translations").insert(translations.map((item) => ({ project_id: projectId, ...item })));
      if (translationError) throw new Error(translationError.message);
      if (projectAssets.length) {
        const { error: mediaError } = await client.from("project_media").insert(projectAssets.map((asset, index) => ({ project_id: projectId, media_asset_id: asset.id, position: index, is_cover: index === 0 })));
        if (mediaError) throw new Error(mediaError.message);
      }
      setProjectEditor(false); setNotice(editingProjectId ? "Project updated." : "Project created."); await loadAll(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Project could not be saved."); }
    finally { setSaving(false); }
  }
  async function deleteProject(project: ProjectRow) {
    if (!client || !window.confirm(`Delete project “${tr(project.project_translations, "en")?.title || project.slug}”? This removes its gallery links but does not delete files from Cloudinary.`)) return;
    const { error: deleteError } = await client.from("projects").delete().eq("id", project.id);
    if (deleteError) setError(deleteError.message); else { setNotice("Project deleted. Its Cloudinary media remains in storage until removed there separately."); await loadAll(false); }
  }
  async function toggleProject(project: ProjectRow, field: "published" | "featured" | "premium") {
    if (!client) return;
    const { error: updateError } = await client.from("projects").update({ [field]: !project[field] }).eq("id", project.id);
    if (updateError) setError(updateError.message); else await loadAll(false);
  }

  function startNewCategory() { setEditingCategoryId(null); setCategoryForm({ title: "", titleHi: "", titlePa: "", slug: "", description: "", descriptionHi: "", descriptionPa: "", coverImage: "", sortOrder: String(categories.length * 10), active: true }); setCategoryEditor(true); setError(""); }
  function editCategory(category: CategoryRow) {
    const en = tr(category.category_translations, "en"); const hi = tr(category.category_translations, "hi"); const pa = tr(category.category_translations, "pa");
    setEditingCategoryId(category.id); setCategoryForm({ title: en?.title || category.slug, titleHi: hi?.title || "", titlePa: pa?.title || "", slug: category.slug, description: en?.description || "", descriptionHi: hi?.description || "", descriptionPa: pa?.description || "", coverImage: category.cover_image_url || "", sortOrder: String(category.sort_order), active: category.active }); setCategoryEditor(true); setError("");
  }
  async function saveCategory(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!client) return; setSaving(true); setError(""); setNotice("");
    try {
      const slug = slugify(categoryForm.slug || categoryForm.title);
      if (!categoryForm.title.trim() || !slug) throw new Error("Category name and valid slug are required.");
      const data = { slug, cover_image_url: categoryForm.coverImage.trim() || null, sort_order: Number(categoryForm.sortOrder) || 0, active: categoryForm.active };
      let categoryId = editingCategoryId;
      if (editingCategoryId) {
        const { error: updateError } = await client.from("categories").update(data).eq("id", editingCategoryId);
        if (updateError) throw new Error(updateError.message);
        const { error: deleteError } = await client.from("category_translations").delete().eq("category_id", editingCategoryId);
        if (deleteError) throw new Error(deleteError.message);
      } else {
        const { data: created, error: insertError } = await client.from("categories").insert(data).select("id").single();
        if (insertError || !created) throw new Error(insertError?.message || "Category could not be created."); categoryId = created.id as string;
      }
      const rows = [
        { locale: "en", title: categoryForm.title.trim(), description: categoryForm.description.trim() },
        { locale: "hi", title: categoryForm.titleHi.trim() || categoryForm.title.trim(), description: categoryForm.descriptionHi.trim() || categoryForm.description.trim() },
        { locale: "pa", title: categoryForm.titlePa.trim() || categoryForm.title.trim(), description: categoryForm.descriptionPa.trim() || categoryForm.description.trim() },
      ].map((item) => ({ category_id: categoryId, ...item }));
      const { error: translationError } = await client.from("category_translations").insert(rows);
      if (translationError) throw new Error(translationError.message);
      setCategoryEditor(false); setNotice(editingCategoryId ? "Category updated." : "Category created."); await loadAll(false);
    } catch (err) { setError(err instanceof Error ? err.message : "Category could not be saved."); }
    finally { setSaving(false); }
  }
  async function updateEnquiryStatus(row: EnquiryRow, status: string) {
    if (!client) return;
    const { error: updateError } = await client.from("enquiries").update({ status }).eq("id", row.id);
    if (updateError) setError(updateError.message); else { setEnquiries((rows) => rows.map((item) => item.id === row.id ? { ...item, status } : item)); setNotice("Enquiry status updated."); }
  }
  async function updateRelatedStatus(table: "site_visit_requests" | "callback_requests", id: string, status: string, list: "visits" | "callbacks") {
    if (!client) return;
    const { error: updateError } = await client.from(table).update({ status }).eq("id", id);
    if (updateError) setError(updateError.message); else { setNotice("Request status updated."); if (list === "visits") setVisits((rows) => rows.map((row) => row.id === id ? { ...row, status } : row)); else setCallbacks((rows) => rows.map((row) => row.id === id ? { ...row, status } : row)); }
  }

  const publishedCount = projects.filter((p) => p.published).length;
  const newEnquiryCount = enquiries.filter((e) => e.status === "new").length;
  const escalatedCount = conversations.filter((c) => c.status === "escalated").length;

  return <div className="admin-shell"><aside className="admin-sidebar"><a className="brand" href="/en"><span className="brand-mark">S<span>.</span></span><span className="brand-name"><strong>SHARMA</strong><small>ALUMINIUM MASTER</small></span></a><div className="admin-sidebar-caption">OWNER WORKSPACE</div><nav aria-label="Admin navigation">{nav.map((item) => { const Icon = item.icon; return <button key={item.id} className={tab === item.id ? "active" : ""} onClick={() => { setTab(item.id); setError(""); setNotice(""); }}><Icon size={17} /><span>{item.label}</span>{item.id === "enquiries" && newEnquiryCount > 0 && <em>{newEnquiryCount}</em>}</button>; })}</nav><div className="admin-sidebar-bottom"><div className="admin-user-dot">{(user.fullName || user.email || "S").slice(0, 1).toUpperCase()}</div><span><strong>{user.fullName || "Administrator"}</strong><small>{user.email || "Signed in"}</small></span><button className="admin-signout" onClick={signOut} title="Sign out" aria-label="Sign out"><LogOut size={17} /></button></div></aside>
    <main className="admin-main"><header className="admin-topbar"><div><p className="eyebrow">SHARMA ALUMINIUM MASTER / ADMIN</p><h1>{nav.find((item) => item.id === tab)?.label}</h1></div><div className="admin-top-actions"><a className="admin-view-site" href="/en" target="_blank" rel="noreferrer"><ExternalLink size={15} /> View website</a><button type="button" onClick={() => void loadAll()} className="admin-refresh"><RefreshCw size={15} /> Refresh</button></div></header>
      {error && <div className="admin-alert error"><AlertTriangle size={17} /><span>{error}</span></div>}{notice && <div className="admin-alert success"><CheckCircle2 size={17} /><span>{notice}</span><button type="button" onClick={() => setNotice("")}><X size={14} /></button></div>}
      {loading ? <div className="admin-loading"><LoaderCircle size={26} className="spin" /><p>Loading your workspace…</p></div> : <>
        {tab === "overview" && <section className="admin-content"><div className="admin-welcome"><div><p className="eyebrow">GOOD DAY</p><h2>Welcome back{user.fullName ? `, ${user.fullName}` : ""}.</h2><p>Keep the portfolio current, and make sure customer requests get a follow-up.</p></div><button className="button button-dark" onClick={startNewProject}><Plus size={17} /> Add a project</button></div><div className="admin-stat-grid"><article><span>Published projects</span><strong>{publishedCount}</strong><small>{projects.length - publishedCount} draft or unpublished</small></article><article><span>Categories</span><strong>{categories.filter((c) => c.active).length}</strong><small>{categories.length} total</small></article><article><span>New enquiries</span><strong>{newEnquiryCount}</strong><small>{enquiries.length} stored requests</small></article><article><span>Human follow-ups</span><strong>{escalatedCount + newEnquiryCount}</strong><small>Escalated chats + new enquiries</small></article></div><div className="admin-two-columns"><article className="admin-panel"><div className="admin-panel-heading"><div><h3>Recent enquiries</h3><p>Latest customer requests</p></div><button onClick={() => setTab("enquiries")}>View all →</button></div>{enquiries.slice(0, 5).map((row) => <div key={row.id} className="admin-activity-row"><span className={`admin-status-dot status-${row.status}`} /><span><strong>{row.name}</strong><small>{row.service || row.type.replaceAll("_", " ")} · {new Date(row.created_at).toLocaleDateString()}</small></span><b>{row.status.replaceAll("_", " ")}</b></div>)}{!enquiries.length && <p className="admin-empty">No enquiries yet. Website submissions will appear here once Supabase is configured.</p>}</article><article className="admin-panel"><div className="admin-panel-heading"><div><h3>Quick actions</h3><p>Common owner tasks</p></div></div><button className="admin-quick-action" onClick={startNewProject}><FolderKanban size={18} /><span><strong>Add a completed project</strong><small>Add title, photos, video and category.</small></span><Plus size={16} /></button><button className="admin-quick-action" onClick={() => { setTab("categories"); startNewCategory(); }}><Tags size={18} /><span><strong>Create a category</strong><small>Keep the showroom organized.</small></span><Plus size={16} /></button><button className="admin-quick-action" onClick={() => setTab("setup")}><Settings2 size={18} /><span><strong>Review integrations</strong><small>Check setup and deployment steps.</small></span><ExternalLink size={16} /></button></article></div></section>}

        {tab === "projects" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Portfolio projects</h2><p>Upload photographs or video clips, translate project details, and choose what visitors can see.</p></div><button className="button button-dark" onClick={startNewProject}><Plus size={17} /> New project</button></div>{projectEditor && <form className="admin-editor-card" onSubmit={saveProject}><div className="admin-editor-header"><div><p className="eyebrow">{editingProjectId ? "EDIT PORTFOLIO ENTRY" : "NEW PORTFOLIO ENTRY"}</p><h3>{editingProjectId ? "Update project" : "Create a project"}</h3></div><button type="button" className="icon-button" onClick={() => setProjectEditor(false)} aria-label="Close project editor"><X size={19} /></button></div><div className="admin-fields"><label>Project title (English)*<input value={projectForm.title} onChange={(e) => setProjectForm({ ...projectForm, title: e.target.value, slug: projectForm.slug || slugify(e.target.value) })} required maxLength={150} /></label><label>URL slug*<input value={projectForm.slug} onChange={(e) => setProjectForm({ ...projectForm, slug: slugify(e.target.value) })} required maxLength={90} /><small>Example: modern-aluminium-kitchen</small></label><label>Title (Hindi)<input value={projectForm.titleHi} onChange={(e) => setProjectForm({ ...projectForm, titleHi: e.target.value })} /></label><label>Title (Punjabi)<input value={projectForm.titlePa} onChange={(e) => setProjectForm({ ...projectForm, titlePa: e.target.value })} /></label><label>Category<select value={projectForm.categoryId} onChange={(e) => setProjectForm({ ...projectForm, categoryId: e.target.value })}><option value="">Choose category</option>{categories.filter((c) => c.active).map((cat) => <option key={cat.id} value={cat.id}>{tr(cat.category_translations, "en")?.title || cat.slug}</option>)}</select></label><label>Tags (comma separated)<input value={projectForm.tags} onChange={(e) => setProjectForm({ ...projectForm, tags: e.target.value })} placeholder="kitchen, matte finish, glass" /></label><label className="admin-field-full">Description (English)<textarea value={projectForm.description} onChange={(e) => setProjectForm({ ...projectForm, description: e.target.value })} rows={3} maxLength={4000} /></label><label className="admin-field-full">Description (Hindi)<textarea value={projectForm.descriptionHi} onChange={(e) => setProjectForm({ ...projectForm, descriptionHi: e.target.value })} rows={2} maxLength={4000} /></label><label className="admin-field-full">Description (Punjabi)<textarea value={projectForm.descriptionPa} onChange={(e) => setProjectForm({ ...projectForm, descriptionPa: e.target.value })} rows={2} maxLength={4000} /></label><label className="admin-field-full">Cover image URL (optional)<input value={projectForm.coverUrl} onChange={(e) => setProjectForm({ ...projectForm, coverUrl: e.target.value })} placeholder="Automatically uses the first uploaded image if blank" /></label></div><div className="admin-upload-section"><h4>Project photographs and videos</h4><p>Media is stored on Cloudinary. Uploading requires the signed-upload environment variables to be configured.</p><CloudinaryBulkUploader userId={currentUserId} assets={projectAssets} onChange={setProjectAssets} /></div><div className="admin-checkbox-row"><label><input type="checkbox" checked={projectForm.published} onChange={(e) => setProjectForm({ ...projectForm, published: e.target.checked })} /> Publish on public website</label><label><input type="checkbox" checked={projectForm.featured} onChange={(e) => setProjectForm({ ...projectForm, featured: e.target.checked })} /> Feature on homepage</label><label><input type="checkbox" checked={projectForm.premium} onChange={(e) => setProjectForm({ ...projectForm, premium: e.target.checked })} /> Premium collection</label><label><input type="checkbox" checked={projectForm.allowDownload} onChange={(e) => setProjectForm({ ...projectForm, allowDownload: e.target.checked })} /> Allow public downloads</label></div><div className="admin-editor-footer"><span>Projects default to draft until you publish them.</span><button type="button" className="button button-outline" onClick={() => setProjectEditor(false)}>Cancel</button><button type="submit" className="button button-dark" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}{saving ? "Saving…" : "Save project"}</button></div></form>}
          <div className="admin-table-card"><div className="admin-table-toolbar"><h3>All projects <span>{projects.length}</span></h3><small>Drafts are visible only to administrators.</small></div><div className="admin-table-scroll"><table><thead><tr><th>Project</th><th>Category</th><th>Media</th><th>Visibility</th><th>Highlights</th><th>Actions</th></tr></thead><tbody>{projects.map((project) => <tr key={project.id}><td><strong>{tr(project.project_translations, "en")?.title || project.slug}</strong><small>/{project.slug}</small></td><td>{tr(categories.find((c) => c.id === project.category_id)?.category_translations, "en")?.title || project.categories?.slug || "—"}</td><td>{project.project_media?.length || 0} item(s)</td><td><button className={`pill-toggle ${project.published ? "is-on" : ""}`} onClick={() => void toggleProject(project, "published")}>{project.published ? "Published" : "Draft"}</button></td><td><label className="mini-check"><input type="checkbox" checked={project.featured} onChange={() => void toggleProject(project, "featured")} /> Featured</label><label className="mini-check"><input type="checkbox" checked={project.premium} onChange={() => void toggleProject(project, "premium")} /> Premium</label></td><td><div className="table-actions"><button title="Edit project" onClick={() => editProject(project)}><Pencil size={15} /></button>{project.published && <a title="View public project" href={`/en/project/${project.slug}`} target="_blank" rel="noreferrer"><ExternalLink size={15} /></a>}<button title="Delete project" onClick={() => void deleteProject(project)}><Trash2 size={15} /></button></div></td></tr>)}</tbody></table>{!projects.length && <p className="admin-empty">No projects found. Create your first project above.</p>}</div></div>
        </section>}

        {tab === "categories" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Categories</h2><p>Manage English, Hindi and Punjabi category labels, descriptions, visibility and ordering.</p></div><button className="button button-dark" onClick={startNewCategory}><Plus size={17} /> New category</button></div>{categoryEditor && <form className="admin-editor-card" onSubmit={saveCategory}><div className="admin-editor-header"><div><p className="eyebrow">{editingCategoryId ? "EDIT CATEGORY" : "NEW CATEGORY"}</p><h3>{editingCategoryId ? "Update category" : "Create a category"}</h3></div><button type="button" className="icon-button" onClick={() => setCategoryEditor(false)} aria-label="Close category editor"><X size={19} /></button></div><div className="admin-fields"><label>Category name (English)*<input value={categoryForm.title} onChange={(e) => setCategoryForm({ ...categoryForm, title: e.target.value, slug: categoryForm.slug || slugify(e.target.value) })} required /></label><label>URL slug*<input value={categoryForm.slug} onChange={(e) => setCategoryForm({ ...categoryForm, slug: slugify(e.target.value) })} required /></label><label>Category name (Hindi)<input value={categoryForm.titleHi} onChange={(e) => setCategoryForm({ ...categoryForm, titleHi: e.target.value })} /></label><label>Category name (Punjabi)<input value={categoryForm.titlePa} onChange={(e) => setCategoryForm({ ...categoryForm, titlePa: e.target.value })} /></label><label>Description (English)<textarea value={categoryForm.description} onChange={(e) => setCategoryForm({ ...categoryForm, description: e.target.value })} rows={2} /></label><label>Description (Hindi)<textarea value={categoryForm.descriptionHi} onChange={(e) => setCategoryForm({ ...categoryForm, descriptionHi: e.target.value })} rows={2} /></label><label>Description (Punjabi)<textarea value={categoryForm.descriptionPa} onChange={(e) => setCategoryForm({ ...categoryForm, descriptionPa: e.target.value })} rows={2} /></label><label>Display order<input type="number" value={categoryForm.sortOrder} onChange={(e) => setCategoryForm({ ...categoryForm, sortOrder: e.target.value })} /></label><label className="admin-field-full">Cover image URL (optional)<input value={categoryForm.coverImage} onChange={(e) => setCategoryForm({ ...categoryForm, coverImage: e.target.value })} /></label><label className="admin-check-single"><input type="checkbox" checked={categoryForm.active} onChange={(e) => setCategoryForm({ ...categoryForm, active: e.target.checked })} /> Visible on the public website</label></div><div className="admin-editor-footer"><span>Untranslated fields fall back to English.</span><button type="button" className="button button-outline" onClick={() => setCategoryEditor(false)}>Cancel</button><button type="submit" className="button button-dark" disabled={saving}>{saving ? <LoaderCircle size={16} className="spin" /> : <Save size={16} />}{saving ? "Saving…" : "Save category"}</button></div></form>}<div className="admin-category-grid">{categories.map((category) => <article key={category.id} className={`admin-category-card${category.active ? "" : " is-inactive"}`}>{category.cover_image_url ? <img src={category.cover_image_url} alt="" /> : <div className="admin-category-art"><Tags size={26} /></div>}<div><small>/{category.slug}</small><h3>{tr(category.category_translations, "en")?.title || category.slug}</h3><p>{tr(category.category_translations, "en")?.description || "No description added yet."}</p><div className="admin-category-meta"><span>Order {category.sort_order}</span><span>{category.active ? "Active" : "Hidden"}</span></div><button className="button button-outline" onClick={() => editCategory(category)}><Pencil size={15} /> Edit category</button></div></article>)}</div></section>}

        {tab === "enquiries" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Customer enquiries</h2><p>Review quotation, project and general requests. Status changes are saved to Supabase.</p></div><span className="admin-count-chip">{newEnquiryCount} new</span></div><div className="admin-table-card"><div className="admin-table-scroll"><table><thead><tr><th>Customer</th><th>Requirement</th><th>Contact</th><th>Received</th><th>Status</th><th>Notes / link</th></tr></thead><tbody>{enquiries.map((row) => <tr key={row.id}><td><strong>{row.name}</strong><small>{row.type.replaceAll("_", " ")}</small></td><td><strong>{row.service || "General request"}</strong><small className="table-message">{row.message}</small></td><td><a href={`tel:${row.phone}`}><Phone size={13} /> {row.phone}</a>{row.email && <a href={`mailto:${row.email}`}><Mail size={13} /> {row.email}</a>}<a href={`https://wa.me/${row.phone.replace(/\D/g, "")}?text=${encodeURIComponent(`Hello ${row.name}, this is Sharma Aluminium Master following up on your enquiry.`)}`} target="_blank" rel="noreferrer"><MessageCircle size={13} /> WhatsApp</a></td><td>{new Date(row.created_at).toLocaleString()}</td><td><select className="status-select" value={row.status} onChange={(e) => void updateEnquiryStatus(row, e.target.value)}><option value="new">New</option><option value="contacted">Contacted</option><option value="visit_scheduled">Visit scheduled</option><option value="quoted">Quoted</option><option value="won">Won</option><option value="closed">Closed</option><option value="spam">Spam</option></select></td><td>{row.project_slug && <a href={`/en/project/${row.project_slug}`} target="_blank" rel="noreferrer">View project ↗</a>}<small>{row.admin_notes || "—"}</small></td></tr>)}</tbody></table>{!enquiries.length && <p className="admin-empty">No customer enquiries yet.</p>}</div></div></section>}

        {tab === "visits" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Visits and callbacks</h2><p>Coordinate measurement visits and customer call-backs.</p></div></div><div className="admin-two-columns"><article className="admin-panel"><div className="admin-panel-heading"><div><h3>Measurement visits</h3><p>{visits.length} request(s)</p></div></div>{visits.map((row) => <div className="request-card" key={row.id}><strong>{row.enquiries?.name || "Customer"}</strong><a href={`tel:${row.enquiries?.phone || ""}`}>{row.enquiries?.phone || "Phone not available"}</a><p>{row.address || "Address to be confirmed"}</p><small>{row.preferred_date || "Date flexible"} · {row.preferred_time || "Time flexible"}</small><p>{row.requirement || row.enquiries?.message}</p><select className="status-select" value={row.status} onChange={(e) => void updateRelatedStatus("site_visit_requests", row.id, e.target.value, "visits")}><option value="new">New</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>)}{!visits.length && <p className="admin-empty">No measurement visit requests yet.</p>}</article><article className="admin-panel"><div className="admin-panel-heading"><div><h3>Call-back requests</h3><p>{callbacks.length} request(s)</p></div></div>{callbacks.map((row) => <div className="request-card" key={row.id}><strong>{row.enquiries?.name || "Customer"}</strong><a href={`tel:${row.enquiries?.phone || ""}`}>{row.enquiries?.phone || "Phone not available"}</a><p>{row.enquiries?.message}</p><small>Preferred time: {row.preferred_time || "Not specified"}</small><select className="status-select" value={row.status} onChange={(e) => void updateRelatedStatus("callback_requests", row.id, e.target.value, "callbacks")}><option value="new">New</option><option value="called">Called</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></div>)}{!callbacks.length && <p className="admin-empty">No callback requests yet.</p>}</article></div></section>}

        {tab === "care" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Customer care conversations</h2><p>Conversations marked for human follow-up appear first. Avoid entering sensitive information in chat transcripts.</p></div><span className="admin-count-chip">{escalatedCount} escalated</span></div><div className="admin-table-card"><div className="admin-table-scroll"><table><thead><tr><th>Conversation</th><th>Locale</th><th>Created</th><th>Status</th><th>Latest messages</th></tr></thead><tbody>{conversations.map((conversation) => <tr key={conversation.id}><td><strong>{conversation.id.slice(0, 8)}…</strong><small>Session retained for support</small></td><td>{conversation.locale.toUpperCase()}</td><td>{new Date(conversation.created_at).toLocaleString()}</td><td><span className={`conversation-pill ${conversation.status}`}>{conversation.status}</span></td><td><div className="chat-transcript">{(conversation.ai_messages || []).slice(-4).map((message, index) => <p key={index}><b>{message.role}:</b> {message.content}</p>)}</div></td></tr>)}</tbody></table>{!conversations.length && <p className="admin-empty">No saved chat conversations yet. Enable the service-role key to persist chat history.</p>}</div></div></section>}

        {tab === "setup" && <section className="admin-content"><div className="admin-section-heading"><div><h2>Integrations & security</h2><p>Configuration status is based on environment values; keep all private keys on the server.</p></div></div><div className="setup-checklist"><article><CheckCircle2 size={20} /><div><h3>Supabase public connection</h3><p>{client ? "Public project URL and key are present in this browser session." : "Missing public configuration."}</p></div><span className={client ? "config-good" : "config-bad"}>{client ? "Configured" : "Missing"}</span></article><article><AlertTriangle size={20} /><div><h3>Service role key</h3><p>Required for validated public form writes and secure server-side conversation history. This secret is not readable in the browser, so verify it in Vercel / local environment settings.</p></div><span className="config-manual">Verify on server</span></article><article><AlertTriangle size={20} /><div><h3>Cloudinary signed uploads</h3><p>Set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY and CLOUDINARY_API_SECRET on the server. The upload-signature endpoint checks admin permission before signing an upload.</p></div><span className="config-manual">Verify on server</span></article><article><AlertTriangle size={20} /><div><h3>Email notifications</h3><p>Set RESEND_API_KEY and RESEND_FROM_EMAIL to send new enquiry notifications. Verify the sender/domain with Resend before going live.</p></div><span className="config-manual">Optional</span></article><article><AlertTriangle size={20} /><div><h3>AI customer care</h3><p>Set AI_API_KEY and AI_MODEL (and AI_BASE_URL if not using the default OpenAI-compatible endpoint). A deterministic FAQ fallback remains available when AI is not configured.</p></div><span className="config-manual">Optional</span></article><article><ShieldCheckIcon /><div><h3>Administrator permissions</h3><p>Each owner must have an active row in Supabase public.admin_users. RLS policies restrict customer records and unpublished portfolio items.</p></div><span className="config-good">Database-gated</span></article></div><div className="admin-security-note"><h3>Before launch</h3><p>Apply the SQL migration, add the intended administrator by Auth user UUID, configure the environment secrets in Vercel, replace the sample gallery visuals with real project images, and test enquiry submissions and uploads on the deployed URL. Consider a managed rate limit / Turnstile before advertising the site widely.</p><a href="/en/privacy" target="_blank" rel="noreferrer">Review public privacy page ↗</a></div></section>}
      </>}
      <footer className="admin-main-footer"><span>Sharma Aluminium Master · Private administration</span><span>Customer records are private and subject to the configured Supabase RLS policies.</span></footer></main>
  </div>;
}

function ShieldCheckIcon() { return <CheckCircle2 size={20} />; }
