mixins.math = {
    created() {
        this.renderers.push(this.math);
    },
    methods: {
        async math() {
            // Check if KaTeX auto-render is loaded
            if (typeof renderMathInElement === 'undefined') {
                console.warn('KaTeX auto-render not loaded yet, waiting...');
                // Wait for KaTeX to load with retry mechanism
                for (let i = 0; i < 10; i++) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    if (typeof renderMathInElement !== 'undefined') {
                        console.log('KaTeX auto-render loaded, proceeding with math rendering');
                        break;
                    }
                }
                
                if (typeof renderMathInElement === 'undefined') {
                    console.error('KaTeX auto-render failed to load after retries');
                    return;
                }
            }
            
            renderMathInElement(document.body, {
                delimiters: [
                    { left: "$$", right: "$$", display: true },
                    { left: "$", right: "$", display: false },
                    { left: "\\(", right: "\\)", display: false },
                    { left: "\\[", right: "\\]", display: true },
                ],
            });
        },
    },
};
