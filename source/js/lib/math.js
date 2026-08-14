mixins.math = {
    created() {
        this.renderers.push(this.math);
    },
    methods: {
        async math() {
            if (typeof renderMathInElement === "undefined") {
                for (let i = 0; i < 15; i++) {
                    await new Promise((resolve) => setTimeout(resolve, 100));
                    if (typeof renderMathInElement !== "undefined") break;
                }
                if (typeof renderMathInElement === "undefined") {
                    console.warn("KaTeX auto-render unavailable");
                    return;
                }
            }

            try {
                renderMathInElement(document.body, {
                    delimiters: [
                        { left: "$$", right: "$$", display: true },
                        { left: "$", right: "$", display: false },
                        { left: "\\(", right: "\\)", display: false },
                        { left: "\\[", right: "\\]", display: true },
                    ],
                    throwOnError: false,
                });
            } catch (e) {
                console.warn("KaTeX render error:", e);
            }
        },
    },
};
