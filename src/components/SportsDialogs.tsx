import type React from "react";

export function SportsDialogs() {
  return (
    <>
      <dialog
        id="player-dialog"
        className="tool-dialog"
        aria-labelledby="player-dialog-title"
        hidden
      >
        <div className="dialog-heading">
          <h2 id="player-dialog-title"></h2>
          <button
            className="secondary-button"
            data-close-dialog="player-dialog"
            aria-label="選手詳細を閉じる"
          >
            {"閉じる ×"}
          </button>
        </div>
        <p id="player-dialog-subtitle" className="note"></p>
        <div id="player-dialog-stats" className="player-stats"></div>
        <p id="player-dialog-note" className="note"></p>
        <a id="player-dialog-source" target="_blank" rel="noopener noreferrer">
          {"NPB公式の年度成績 ↗"}
        </a>
      </dialog>
      <dialog
        id="share-dialog"
        className="tool-dialog"
        aria-labelledby="share-dialog-title"
        hidden
      >
        <div className="dialog-heading">
          <h2 id="share-dialog-title">{"共有画像のプレビュー"}</h2>
          <button className="secondary-button" data-close-dialog="share-dialog">
            {"閉じる ×"}
          </button>
        </div>
        <p id="share-dialog-note" className="note"></p>
        <button id="share-download" className="secondary-button">
          {"PNG画像を保存"}
        </button>
        <img
          id="share-preview"
          className="share-preview"
          alt="指名と成績の共有画像"
        />
      </dialog>
      <div
        id="draft-announcement"
        className="draft-announcement"
        role="status"
        aria-live="polite"
        hidden
      >
        <button
          id="announcement-close"
          className="secondary-button"
          aria-label="指名演出を閉じる"
        >
          {"×"}
        </button>
        <small id="announcement-title"></small>
        <strong id="announcement-player"></strong>
        <span id="announcement-team"></span>
      </div>
      <dialog
        id="soccer-player-dialog"
        className="tool-dialog"
        aria-labelledby="soccer-player-title"
        hidden
      >
        <div className="dialog-heading">
          <h2 id="soccer-player-title"></h2>
          <button id="soccer-player-close" className="secondary-button">
            {"閉じる"}
          </button>
        </div>
        <div id="soccer-player-body"></div>
      </dialog>
    </>
  );
}
