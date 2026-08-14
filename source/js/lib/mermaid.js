mixins.mermaid = {
    created() {
        this.renderers.push(this.mermaid);
    },
    methods: {
        decodeBase64Utf8(base64) {
            const binary = atob(base64);
            const bytes = Uint8Array.from(binary, (c) => c.charCodeAt(0));
            return new TextDecoder("utf-8").decode(bytes);
        },
        escapeMermaidError(msg) {
            return String(msg)
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;");
        },
        async mermaid() {
            if (typeof mermaid === "undefined") return;

            const mermaidElements = document.querySelectorAll("mermaid, div.mermaid-code");
            if (!mermaidElements.length) return;

            const isDark = document.documentElement.getAttribute("data-theme") === "dark";
            const configuredTheme = (window.PARTICLEX_CONFIG && window.PARTICLEX_CONFIG.mermaidTheme) || "default";
            const theme = isDark ? "dark" : configuredTheme;

            try {
                mermaid.initialize({
                    theme,
                    startOnLoad: false,
                    securityLevel: "loose",
                });
            } catch (initError) {
                console.error("Mermaid initialization error:", initError);
                return;
            }

            for (let index = 0; index < mermaidElements.length; index++) {
                const element = mermaidElements[index];
                const encodedContent = element.getAttribute("data") || element.getAttribute("data-mermaid");
                if (!encodedContent) continue;

                let graphDefinition;
                try {
                    graphDefinition = this.decodeBase64Utf8(encodedContent);
                } catch (decodeError) {
                    console.error("Mermaid base64 decode error:", decodeError);
                    element.outerHTML = `<div class="mermaid-error">図表データのデコードに失敗しました<br><small>${this.escapeMermaidError(decodeError.message)}</small></div>`;
                    continue;
                }

                const id = `mermaid-${Date.now()}-${index}`;
                try {
                    const { svg } = await mermaid.render(id, graphDefinition);
                    element.outerHTML = `<div class="mermaid-chart">${svg}</div>`;
                } catch (error) {
                    console.error("Mermaid render error:", error);
                    element.outerHTML = `<div class="mermaid-error">図表のレンダリングに失敗しました<br><small>${this.escapeMermaidError(error.message)}</small></div>`;
                }
            }

            if (typeof window.rebuildTocAfterMermaid === "function") {
                window.rebuildTocAfterMermaid();
            }
        },
    },
};
