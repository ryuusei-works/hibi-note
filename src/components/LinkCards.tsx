import type React from "react";
import type { Section } from "@/types/ui";

export function LinkCards({ section }: { section: Section }) {
  return (
    <>
      <section id="links" hidden={section !== "links"}>
        <div className="collection-toolbar">
          <div className="view-tabs">
            <button className="active" data-collection-view="grid">
              {"カード"}
            </button>
            <button data-collection-view="list">{"リスト"}</button>
          </div>
          <div className="collection-actions">
            <input
              id="workspace-links-search"
              className="collection-search"
              type="search"
              placeholder="リンクを検索…"
              aria-label="リンクを検索"
            />
            <button className="button primary" data-create="link">
              <svg
                width="15"
                height="15"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.65"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M12 5v14M5 12h14"></path>
              </svg>
              {"リンクを追加"}
            </button>
          </div>
        </div>
        <div
          id="workspace-links-items"
          className="workspace-collection-grid"
        ></div>
      </section>
    </>
  );
}
