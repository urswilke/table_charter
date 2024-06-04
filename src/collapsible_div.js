import { LitElement, html, css } from "lit";

export class CollapsibleDiv extends LitElement {
    static properties = {
        is_collapsed: { type: Boolean },
        title: { type: String },
    };

    set is_collapsed(val) {
        this._is_collapsed = val;
        if (this.renderRoot) {
            this.renderRoot.querySelector("#child").style.display = this
                .is_collapsed
                ? "none"
                : "block";
        }
    }
    get is_collapsed() {
        return this._is_collapsed;
    }

    render() {
        return html`
            <div id="main">
                <div id="titlebar">
                    <button @click=${this.toggle_collapse}>
                        ${this.is_collapsed ? "☰" : "×"}
                    </button>
                    ${this.title}
                </div>
                <div id="child">
                    ${this.is_collapsed ? html`` : html`<slot></slot>`}
                </div>
            </div>
        `;
    }
    toggle_collapse() {
        this.is_collapsed = !this.is_collapsed;
    }

    static styles = [
        css`
            #main {
                border: solid light-dark(black, white) 1px;
                color: white;
                border-radius: 5px;
                overflow: hidden;
            }
            #titlebar {
                padding: 3px;
                background: #5e677b;
                /* border-bottom: solid light-dark(black, white) 1px; */
            }
            #child {
                padding: 3px;
                display: none;
            }
        `,
    ];
}
customElements.define("div-c", CollapsibleDiv);
