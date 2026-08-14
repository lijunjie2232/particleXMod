mixins.highlight = {
    data() {
        return { copying: false };
    },
    created() {
        if (typeof hljs !== "undefined") {
            hljs.configure({ ignoreUnescapedHTML: true });
        }
        this.renderers.push(this.highlight);
    },
    methods: {
        sleep(ms) {
            return new Promise((resolve) => setTimeout(resolve, ms));
        },
        escapeHtml(str) {
            return str
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#39;");
        },
        async copyText(text) {
            if (navigator.clipboard && window.isSecureContext) {
                await navigator.clipboard.writeText(text);
                return;
            }
            const textarea = document.createElement("textarea");
            textarea.value = text;
            textarea.style.position = "fixed";
            textarea.style.opacity = "0";
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand("copy");
            document.body.removeChild(textarea);
        },
        highlight() {
            if (typeof hljs === "undefined") return;
            const codes = document.querySelectorAll("pre");
            for (const pre of codes) {
                if (pre.dataset.pxHighlighted) continue;
                pre.dataset.pxHighlighted = "true";

                const codeEl = pre.querySelector("code");
                const code = codeEl ? codeEl.textContent : pre.textContent;
                const classList = [
                    ...pre.classList,
                    ...(codeEl ? codeEl.classList : []),
                ];
                const language =
                    classList
                        .find((c) => c.startsWith("language-"))
                        ?.replace("language-", "") || "plaintext";

                let highlighted;
                try {
                    highlighted = hljs.getLanguage(language)
                        ? hljs.highlight(code, { language }).value
                        : this.escapeHtml(code);
                } catch {
                    highlighted = this.escapeHtml(code);
                }

                pre.innerHTML = `
                <div class="code-content hljs">${highlighted}</div>
                <div class="language">${this.escapeHtml(language)}</div>
                <button type="button" class="copycode" aria-label="コードをコピー" title="コピー">
                    <i class="fa-solid fa-copy fa-fw"></i>
                    <i class="fa-solid fa-check fa-fw"></i>
                </button>
                `;

                const content = pre.querySelector(".code-content");
                if (content && typeof hljs.lineNumbersBlock === "function") {
                    try {
                        hljs.lineNumbersBlock(content, { singleLine: true });
                    } catch (e) {
                        console.warn("Failed to apply line numbers:", e);
                    }
                }

                const copycode = pre.querySelector(".copycode");
                if (copycode) {
                    copycode.addEventListener("click", async () => {
                        if (this.copying) return;
                        this.copying = true;
                        try {
                            await this.copyText(code);
                            copycode.classList.add("copied");
                            await this.sleep(1000);
                            copycode.classList.remove("copied");
                        } catch (e) {
                            console.warn("Copy failed:", e);
                        } finally {
                            this.copying = false;
                        }
                    });
                }
            }
        },
    },
};
