"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, ArrowUpRight, X, ZoomIn, ZoomOut, RotateCcw, Maximize, Share2, MessageCircle, Image as ImageIcon, Play, ChevronLeft, ChevronRight } from "lucide-react";
import type { GalleryCategory, GalleryItem } from "@/config/gallery";

type Props = {
  locale: string;
  category: GalleryCategory;
  categoryLinks: { slug: string; title: string }[];
  phoneHref: string;
  whatsappHref: string;
  callLabel: string;
  quoteLabel: string;
  referenceNote: string;
  backLabel: string;
  demo?: boolean;
};

export default function GalleryExperience({ locale, category, categoryLinks, phoneHref, whatsappHref, callLabel, quoteLabel, referenceNote, backLabel, demo = true }: Props) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const viewerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const dragStart = useRef<{ x: number; y: number; ox: number; oy: number } | null>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const previousFocus = useRef<HTMLElement | null>(null);
  const activeItem: GalleryItem | null = activeIndex === null ? null : category.items[activeIndex] ?? null;

  const resetView = useCallback(() => { setZoom(1); setOffset({ x: 0, y: 0 }); }, []);
  const closeViewer = useCallback(() => { setActiveIndex(null); resetView(); }, [resetView]);
  const showPrevious = useCallback(() => { setActiveIndex((current) => current === null ? null : (current - 1 + category.items.length) % category.items.length); resetView(); }, [category.items.length, resetView]);
  const showNext = useCallback(() => { setActiveIndex((current) => current === null ? null : (current + 1) % category.items.length); resetView(); }, [category.items.length, resetView]);
  const openViewer = (index: number) => { previousFocus.current = document.activeElement as HTMLElement; setActiveIndex(index); resetView(); };

  useEffect(() => {
    if (activeIndex === null) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") closeViewer();
      if (event.key === "ArrowLeft") showPrevious();
      if (event.key === "ArrowRight") showNext();
      if (event.key === "+" || event.key === "=") setZoom((current) => Math.min(3, current + 0.25));
      if (event.key === "-") setZoom((current) => Math.max(1, current - 0.25));
    };
    const onFullscreenChange = () => setIsFullscreen(Boolean(document.fullscreenElement));
    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("fullscreenchange", onFullscreenChange);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("fullscreenchange", onFullscreenChange);
      document.body.style.overflow = "";
      previousFocus.current?.focus?.();
    };
  }, [activeIndex, closeViewer, showNext, showPrevious]);

  async function shareImage(item: GalleryItem) {
    const shareData = { title: item.title, text: item.description, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else if (navigator.clipboard) { await navigator.clipboard.writeText(window.location.href); window.alert("Link copied to clipboard."); }
    } catch { /* User cancelled share; no action needed. */ }
  }
  async function toggleFullscreen() {
    try { if (document.fullscreenElement) await document.exitFullscreen(); else await viewerRef.current?.requestFullscreen?.(); } catch { setIsFullscreen(false); }
  }
  function panStart(event: React.PointerEvent<HTMLImageElement>) {
    if (zoom <= 1) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, y: event.clientY, ox: offset.x, oy: offset.y };
    setIsPanning(true);
  }
  function panMove(event: React.PointerEvent<HTMLImageElement>) {
    if (!dragStart.current) return;
    setOffset({ x: dragStart.current.ox + event.clientX - dragStart.current.x, y: dragStart.current.oy + event.clientY - dragStart.current.y });
  }
  function panEnd() { dragStart.current = null; setIsPanning(false); }

  return (
    <main className="gallery-page">
      <div className="gallery-topbar">
        <a href={`/${locale}`} className="gallery-brand"><span className="brand-mark">S<span>.</span></span><span className="brand-name"><strong>SHARMA</strong><small>ALUMINIUM MASTER</small></span></a>
        <div className="gallery-top-actions"><a href={`/${locale}`}>{backLabel}</a><a href={phoneHref} className="gallery-call">{callLabel}<ArrowUpRight size={15} /></a></div>
      </div>
      <section className="gallery-hero">
        <div className="gallery-hero-copy"><p className="eyebrow"><span className="eyebrow-line" />{category.eyebrow}</p><p className="gallery-breadcrumb"><a href={`/${locale}`}>Home</a><span>/</span><span>Gallery</span><span>/</span><strong>{category.title}</strong></p><h1>{category.title}<em>.</em></h1><p className="gallery-intro">{category.intro}</p><div className="gallery-hero-actions"><a className="button button-dark" href="#gallery-grid">Explore images <ArrowRight size={16} /></a><a className="gallery-inline-link" href={`/${locale}/contact?project=${encodeURIComponent(category.slug)}`}>{quoteLabel}<ArrowUpRight size={15} /></a></div></div>
        <div className={`gallery-hero-art gallery-art-${category.slug}`} aria-label={`${category.title} ${demo ? "reference visual" : "project"}`}><div className="gallery-art-frame"><span /><span /><span /><span /></div><span className="gallery-art-index">S / AM — DETAIL STUDY</span><span className="gallery-art-caption">FORM · FINISH · FUNCTION</span></div>
      </section>
      <section className="gallery-category-nav" aria-label="Browse other galleries"><span>EXPLORE CATEGORIES</span><div>{categoryLinks.map((item) => <a key={item.slug} href={`/${locale}/gallery/${item.slug}`} aria-current={item.slug === category.slug ? "page" : undefined}>{item.title}<ArrowUpRight size={13} /></a>)}</div></section>
      <section id="gallery-grid" className="gallery-collection"><div className="gallery-collection-heading"><div><p className="eyebrow"><span className="eyebrow-line" />{demo ? "THE REFERENCE GALLERY" : "PROJECT GALLERY"}</p><h2>{demo ? <>Find a direction<br /><em>that feels right.</em></> : <>Details worth<br /><em>a closer look.</em></>}</h2></div><p>{referenceNote}</p></div>
        <div className="gallery-photo-grid">{category.items.map((item, index) => <button type="button" className={`gallery-photo-card gallery-photo-${index % 4}`} key={`${item.title}-${index}`} onClick={() => openViewer(index)} aria-label={`Open ${item.mediaType === "video" ? "video" : "image"}: ${item.title}`}>
          <span className="gallery-image-stage"><span className={`gallery-art-fallback fallback-${category.slug.replaceAll("-", "_")}`}><span className="fallback-window" /><span className="fallback-frame" /><span className="fallback-light" /></span>{item.mediaType === "video" ? <><video src={item.imageUrl} preload="metadata" muted playsInline onError={(e) => { e.currentTarget.style.display = "none"; }} /><span className="video-overlay-icon"><Play size={23} fill="currentColor" /></span></> : <img src={item.imageUrl} alt={item.alt || item.title} loading="lazy" onError={(event) => { event.currentTarget.style.display = "none"; }} style={{ objectPosition: item.position ?? "center" }} />}<span className="gallery-zoom"><ZoomIn size={17} /></span></span>
          <span className="gallery-card-meta"><span><small>{item.tag}{demo ? " · REFERENCE" : ""}</small><strong>{item.title}</strong><em>{item.description}</em></span><span className="gallery-card-arrow"><ArrowUpRight size={18} /></span></span>
        </button>)}</div>
        {demo && <p className="gallery-reference-note">{referenceNote}</p>}
      </section>
      <section className="gallery-contact" id="gallery-contact"><div><p className="eyebrow eyebrow-light"><span className="eyebrow-line" />NEXT STEP</p><h2>Have a size<br />or design in mind?</h2><p>Share your space, preferred finish and approximate dimensions. The team can discuss measurements and prepare an estimate.</p></div><div className="gallery-contact-actions"><a className="button button-light" href={`/${locale}/contact?project=${encodeURIComponent(category.slug)}`}>Enquire about this design<ArrowUpRight size={16} /></a><a className="button button-light" href={phoneHref}>{callLabel}<ArrowUpRight size={16} /></a><a className="gallery-whatsapp" href={whatsappHref} target="_blank" rel="noreferrer"><MessageCircle size={15} /> WhatsApp the team<ArrowUpRight size={16} /></a></div></section>
      <footer className="gallery-footer"><a href={`/${locale}`}>← Back to Sharma Aluminium Master</a><span>JALANDHAR · PUNJAB · INDIA</span></footer>

      {activeItem && activeIndex !== null && <div ref={viewerRef} className="gallery-lightbox" role="dialog" aria-modal="true" aria-label={activeItem.title} onClick={closeViewer} onPointerDown={(event) => { touchStart.current = { x: event.clientX, y: event.clientY }; }} onPointerUp={(event) => { if (!touchStart.current) return; const dx = event.clientX - touchStart.current.x; const dy = event.clientY - touchStart.current.y; if (Math.abs(dx) > 70 && Math.abs(dx) > Math.abs(dy) && zoom === 1) { dx < 0 ? showNext() : showPrevious(); } touchStart.current = null; }}>
        <div className="lightbox-topline"><span><ImageIcon size={15} /> {String(activeIndex + 1).padStart(2, "0")} / {String(category.items.length).padStart(2, "0")}</span><div className="lightbox-toolbar"><button type="button" onClick={(e) => { e.stopPropagation(); setZoom((current) => Math.min(3, current + 0.25)); }} aria-label="Zoom in" title="Zoom in"><ZoomIn size={19} /></button><button type="button" onClick={(e) => { e.stopPropagation(); setZoom((current) => Math.max(1, current - 0.25)); if (zoom <= 1.25) setOffset({ x: 0, y: 0 }); }} aria-label="Zoom out" title="Zoom out"><ZoomOut size={19} /></button><button type="button" onClick={(e) => { e.stopPropagation(); resetView(); }} aria-label="Reset zoom" title="Reset zoom"><RotateCcw size={18} /></button><button type="button" onClick={(e) => { e.stopPropagation(); void toggleFullscreen(); }} aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"} title="Fullscreen"><Maximize size={18} /></button><button type="button" onClick={(e) => { e.stopPropagation(); void shareImage(activeItem); }} aria-label="Share this design" title="Share"><Share2 size={18} /></button><button type="button" onClick={closeViewer} aria-label="Close image viewer" title="Close"><X size={22} /></button></div></div>
        <button type="button" className="lightbox-nav lightbox-prev" onClick={(event) => { event.stopPropagation(); showPrevious(); }} aria-label="Previous image"><ArrowLeft size={22} /></button>
        <div className="lightbox-content" onClick={(event) => event.stopPropagation()}>{activeItem.mediaType === "video" ? <video className="lightbox-video" src={activeItem.imageUrl} controls playsInline preload="metadata" /> : <img ref={imageRef} src={activeItem.imageUrl} alt={activeItem.alt || activeItem.title} draggable={false} onPointerDown={panStart} onPointerMove={panMove} onPointerUp={panEnd} onPointerCancel={panEnd} style={{ transform: `translate(${offset.x}px, ${offset.y}px) scale(${zoom})`, cursor: zoom > 1 ? (isPanning ? "grabbing" : "grab") : "zoom-in" }} onDoubleClick={() => setZoom((current) => current > 1 ? 1 : 2)} />}
          <div className="lightbox-caption"><div><span>{activeItem.tag}{demo ? " · REFERENCE VISUAL" : ""}</span><h2>{activeItem.title}</h2><p>{activeItem.description}</p><a href={`/${locale}/contact?project=${encodeURIComponent(category.slug)}`} className="lightbox-enquire-link">Enquire about this design <ArrowUpRight size={14} /></a></div><span>{String(activeIndex + 1).padStart(2, "0")} / {String(category.items.length).padStart(2, "0")}</span></div>
        </div><button type="button" className="lightbox-nav lightbox-next" onClick={(event) => { event.stopPropagation(); showNext(); }} aria-label="Next image"><ArrowRight size={22} /></button>
        <div className="lightbox-filmstrip" onClick={(e) => e.stopPropagation()}>{category.items.map((item, i) => <button key={`${item.title}-thumb`} type="button" className={i === activeIndex ? "active" : ""} onClick={() => { setActiveIndex(i); resetView(); }} aria-label={`View item ${i + 1}: ${item.title}`}>{item.mediaType === "video" ? <span className="filmstrip-video"><Play size={16} /></span> : <img src={item.imageUrl} alt="" loading="lazy" />}</button>)}</div>
        <button type="button" className="lightbox-mobile-prev" onClick={(e) => { e.stopPropagation(); showPrevious(); }} aria-label="Previous image"><ChevronLeft size={19} /></button><button type="button" className="lightbox-mobile-next" onClick={(e) => { e.stopPropagation(); showNext(); }} aria-label="Next image"><ChevronRight size={19} /></button>
      </div>}
    </main>
  );
}
