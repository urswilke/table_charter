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
        let text;
        if (this.is_minimized & this.is_collapsed) {
            text = this.short_title;
        } else {
            text = this.title;
        }
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
                    </div>
                </div>
                <div id="child">
                    ${this.is_collapsed ? html`` : html`<slot></slot>`}
                </div>
            </div>
        `;
    }
    toggle_collapsed() {
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
                display: flex;
                flex-direction: column;
            }
            #titlebar {
                display: flex;
                justify-content: space-between;
                padding: 3px;
                background: #5e677b;
            }
            :host([is_minimized]) .title-text {
                text-align: center;
            }
            #child {
                overflow: hidden;
            }
            ::slotted(*) {
                overflow: scroll;
                height: 100%;
                width: 100%;
            }
            .title-text {
                flex-grow: 1;
            }
            .title-text:hover {
                cursor: pointer;
                opacity: 80%;
            }
            :host([is_minimized]) .title-text:hover {
                cursor: grab;
            }
            :host([is_minimized]) .title-text:active {
                cursor: grabbing;
            }
            :host([is_collapsed]) .title-text:hover {
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
                display: none;
            }
            #main {
                resize: none;
            }
            :host([is_minimized]) #main {
                resize: both;
            }
            :host([is_collapsed]) #main {
                resize: none;
            }
        `,
    ];
}
customElements.define("div-c", CollapsibleDiv);
