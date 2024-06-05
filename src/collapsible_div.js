import { LitElement, html, css } from "lit";

export class CollapsibleDiv extends LitElement {
    static properties = {
        is_collapsed: { type: Boolean },
        title: { type: String },
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

    render() {
        return html`
            <div id="main">
                <div id="titlebar" @click=${this.toggle_collapsed}>
                    ${this.title}
                </div>
                <div id="child">
                    ${this.is_collapsed ? html`` : html`<slot></slot>`}
                </div>
            </div>
        `;
    }
    toggle_collapsed() {
        this.is_collapsed = !this.is_collapsed;
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
                padding: 3px;
                background: #5e677b;
            }
            #titlebar:hover {
                opacity: 50%;
                cursor: pointer;
            }
            #child {
                color: light-dark(black, white);
                display: var(--show-content);
            }
        `,
    ];
}
customElements.define("div-c", CollapsibleDiv);
