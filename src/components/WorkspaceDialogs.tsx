import type React from "react";

export function WorkspaceDialogs() {
  return (
    <>
      <div>
        <button
          id="workspace-sidebar-overlay"
          className="sidebar-overlay"
          aria-label="メニューを閉じる"
          hidden
        ></button>
        <dialog
          id="workspace-editor"
          className="modal"
          aria-labelledby="workspace-editor-title"
        >
          <div className="modal-inner">
            <div className="modal-header">
              <h2 id="workspace-editor-title">{"追加"}</h2>
              <button
                className="icon-button"
                data-close-dialog=""
                aria-label="閉じる"
              >
                {"×"}
              </button>
            </div>
            <form id="workspace-editor-form">
              <input type="hidden" id="workspace-editor-kind" />
              <input type="hidden" id="workspace-editor-id" />
              <label className="field">
                {"タイトル"}
                <input required maxLength={200} id="workspace-editor-name" />
              </label>
              <label className="field" id="workspace-editor-url-field">
                {"URL"}
                <input
                  type="url"
                  id="workspace-editor-url"
                  placeholder="https://"
                />
              </label>
              <label className="field">
                {"カテゴリ"}
                <input
                  maxLength={50}
                  id="workspace-editor-category"
                  placeholder="野球、日本代表、観戦など"
                />
              </label>
              <label className="checkbox-field">
                <input
                  type="checkbox"
                  id="workspace-editor-favorite"
                  defaultChecked
                />
                {" お気に入りに登録"}
              </label>
              <p id="workspace-editor-error" role="alert"></p>
              <div className="modal-actions">
                <button type="button" className="button" data-close-dialog="">
                  {"キャンセル"}
                </button>
                <button type="submit" className="button primary">
                  {"保存する"}
                </button>
              </div>
            </form>
          </div>
        </dialog>
        <div id="workspace-toast" className="toast" role="status" hidden></div>
      </div>
    </>
  );
}
