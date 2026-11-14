import type React from "react";
import type { Section } from "@/types/ui";

export function Schedule({ section }: { section: Section }) {
  return (
    <>
      <section id="schedule" hidden={section !== "schedule"}>
        <div className="collection-toolbar">
          <p className="muted">{"野球・日本代表の予定を、月ごとに確認。"}</p>
        </div>
        <article className="card calendar-card">
          <div className="card-heading">
            <div>
              <span className="eyebrow">{"YOUR SPORTS CALENDAR"}</span>
              <h3>{"試合カレンダー"}</h3>
            </div>
            <div className="calendar-controls">
              <button id="month-prev" aria-label="前の月">
                {"‹"}
              </button>
              <strong id="calendar-month"></strong>
              <button id="month-next" aria-label="次の月">
                {"›"}
              </button>
              <button id="month-today">{"今月"}</button>
            </div>
          </div>
          <div
            className="tabs calendar-filters"
            id="calendar-filters"
            aria-label="カレンダーの表示対象"
          >
            <button
              data-calendar-filter="all"
              className="selected"
              aria-pressed="true"
            >
              {"すべて"}
            </button>
            <button data-calendar-filter="baseball" aria-pressed="false">
              {"野球"}
            </button>
            <button data-calendar-filter="football" aria-pressed="false">
              {"サッカー"}
            </button>
            <button data-calendar-filter="favorite" aria-pressed="false">
              {"応援球団"}
            </button>
          </div>
          <p id="calendar-filter-note" className="home-note" role="status"></p>
          <div className="calendar-legend">
            <span>{"⚾ プロ野球"}</span>
            <span>{"⚽ 男子日本代表"}</span>
            <span>{"★ 応援球団"}</span>
          </div>
          <p className="calendar-hint">
            {"日付を選ぶと、下に試合の詳細が表示されます。"}
          </p>
          <div
            id="calendar"
            className="calendar-grid"
            aria-label="月間試合日程"
          ></div>
          <div className="day-detail">
            <h3 id="day-title"></h3>
            <div id="day-games"></div>
          </div>
          <details className="data-details">
            <summary>{"日程の取得範囲・更新日時"}</summary>
            <p id="calendar-coverage" className="note"></p>
            <div className="card-foot">
              <span data-time="baseballGames"></span>
              <span data-time="footballGames"></span>
            </div>
          </details>
        </article>
      </section>
    </>
  );
}
