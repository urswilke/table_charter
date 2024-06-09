import { LitElement, html, css } from "lit";
export class CollapsibleDiv extends LitElement {
    static properties = {
        is_collapsed: { type: Boolean, reflect: true },
        is_minimized: { type: Boolean, reflect: true },
        title: { type: String },
        short_title: { type: String },
    };

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
                <div id="titlebar" title=${this.title}>
                    <div
                        class="title-text"
                        @click=${this.is_collapsed | !this.is_minimized
                            ? this.toggle_collapsed
                            : null}
                    >
                        ${text}
                    </div>
                    <div class="buttons">
                        <button @click=${this.reattach}>↖️</button>
                        <button @click=${this.toggle_collapsed}>×</button>
                    </div>
                </div>
                <div id="child">
                    ${this.is_collapsed ? html`` : html`<slot></slot>`}
                </div>
            </div>
        `;
    }
    toggle_collapsed() {
        const new_state = !this.is_collapsed;
        this.is_collapsed = new_state;
        this.dispatchEvent(
            new CustomEvent("toggle-collapsed", {
                details: {
                    id: this.id,
                },
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
                cursor: grab;
            }
            #titlebar:active {
                cursor: grabbing;
            }
            :host([is_collapsed]) #titlebar:hover {
                cursor: pointer;
            }
            .buttons {
                display: none;
            }
            :host([is_minimized]) .buttons {
                display: block;
            }
            :host([is_collapsed]) .buttons {
                display: none;
            }
            :host([is_collapsed]) #child {
                color: light-dark(black, white);
                display: none;
            }
        `,
    ];
}
customElements.define("div-c", CollapsibleDiv);
