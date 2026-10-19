import { ArrowLeft, Home, MessageCircle } from "lucide-react";
import { business } from "@/config/business";

export default function NotFound() {
  const phone = business.contacts[0];
  return (
    <main className="not-found-page">
      <a className="brand" href="/en" aria-label={business.name}>
        <span className="brand-mark">S<span>.</span></span>
        <span className="brand-name"><strong>SHARMA</strong><small>ALUMINIUM MASTER</small></span>
      </a>
      <div className="not-found-art" aria-hidden="true"><span>404</span><i /><b /></div>
      <p className="eyebrow"><span className="eyebrow-line" />PAGE NOT FOUND</p>
      <h1>This page is<br /><em>out of frame.</em></h1>
      <p className="not-found-copy">The link may have changed, or this project has not been published. Return to the portfolio or speak directly with the team.</p>
      <div className="not-found-actions">
        <a className="button button-dark" href="/en"><Home size={16} /> Return home</a>
        <a className="button button-outline" href={`https://wa.me/${phone.phoneE164.replace("+", "")}?text=${encodeURIComponent("Hello, I need help finding a page on the Sharma Aluminium Master website.")}`} target="_blank" rel="noreferrer"><MessageCircle size={16} /> Contact the team</a>
      </div>
      <a href="/en" className="not-found-back"><ArrowLeft size={14} /> Sharma Aluminium Master</a>
    </main>
  );
}
