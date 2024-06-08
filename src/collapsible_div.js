import { LitElement, html, css } from "lit";

export class CollapsibleDiv extends LitElement {
    static properties = {
        is_collapsed: { type: Boolean, reflect: true },
        is_minimized: { type: Boolean },
        title: { type: String },
        short_title: { type: String },
    };

    set is_collapsed(val) {
        this._is_collapsed = val;
        this.style.setProperty(
            "--show-content",
            this.is_collapsed ? "none" : "block",
        );
    }
    get is_collapsed() {
        return this._is_collapsed;
    }

    reattach() {
        this.dispatchEvent(
            new CustomEvent("re-attach", {
                bubbles: true,
                composed: true,
            }),
        );
    }
    render() {
        let text, text_align_str;
        if (this.is_minimized & this.is_collapsed) {
            text = this.short_title;
            text_align_str = "center";
        } else {
            text = this.title;
            text_align_str = "start";
        }
        this.style.setProperty("--text-alignment", text_align_str);
        return html`
            <div id="main">
                <div
                    id="titlebar"
                    @click=${this.toggle_collapsed}
                    title=${this.title}
                >
                    ${text}
                    ${!this.is_collapsed & this.is_minimized
                        ? html` <button @click=${this.reattach}>↖️</button> `
                        : html``}
                </div>
                <div id="child">
                    ${this.is_collapsed ? html`` : html`<slot></slot>`}
                </div>
            </div>
        `;
    }
    toggle_collapsed() {
        this.is_collapsed = !this.is_collapsed;
        !this.is_collapsed &&
            this.dispatchEvent(
                new CustomEvent("toggle-collapsed", {
                    bubbles: true,
                    composed: true,
                }),
            );
    }

    static styles = [
        css`
            #main {
                background-color: light-dark(white, black);
                border: solid light-dark(black, white) 1px;
                color: white;
                border-radius: 5px;
                overflow: hidden;
            }
            #titlebar {
                display: flex;
                justify-content: space-between;
                padding: 3px;
                background: #5e677b;
                text-align: var(--text-alignment);
            }
            #titlebar:hover {
                opacity: 80%;
            }
            #titlebar:hover {
                cursor: zoom-out;
            }
            :host([is_collapsed]) #titlebar:hover {
                cursor: context-menu;
            }
            #child {
                color: light-dark(black, white);
                display: var(--show-content);
            }
        `,
    ];
}
customElements.define("div-c", CollapsibleDiv);
