mixins.mermaid = {
    created() {
        this.renderers.push(this.mermaid);
    },
    methods: {
        async mermaid() {
            console.log('=== Mermaid renderer started ===');
            
            // Check if mermaid library is loaded
            if (typeof mermaid === 'undefined') {
                console.warn('Mermaid library not loaded, skipping mermaid rendering');
                return;
            }
            console.log('mermaid object available:', typeof mermaid !== 'undefined');
            
            // 初始化 Mermaid
            try {
                mermaid.initialize({
                    theme: '<%= theme.mermaid.theme %>',
                    startOnLoad: false,
                    securityLevel: 'loose',
                });
                console.log('Mermaid initialized successfully');
            } catch (initError) {
                console.error('Mermaid initialization error:', initError);
                return;
            }
            
            // 查找所有 mermaid 图表并渲染（支持两种格式）
            // 格式1: <mermaid data="..."> (当前格式)
            // 格式2: <div class="mermaid-code" data-mermaid="..."> (旧格式)
            const mermaidElements = document.querySelectorAll('mermaid, div.mermaid-code');
            console.log(`Found ${mermaidElements.length} mermaid elements to render`);
            
            // Use for...of instead of forEach to properly handle async/await
            for (let index = 0; index < mermaidElements.length; index++) {
                const element = mermaidElements[index];
                console.log(`Processing mermaid element ${index + 1}/${mermaidElements.length}`);
                
                // Extract base64 encoded content and decode it
                // Support both formats: <mermaid data="..."> and <div class="mermaid-code" data-mermaid="...">
                let encodedContent = element.getAttribute('data') || element.getAttribute('data-mermaid');
                if (!encodedContent) {
                    console.warn('Mermaid element has no data or data-mermaid attribute');
                    continue;
                }
                
                let graphDefinition;
                try {
                    // Decode base64 to get the original mermaid code (UTF-8 safe)
                    // Use decodeURIComponent and escape to handle UTF-8 characters properly
                    graphDefinition = decodeURIComponent(escape(atob(encodedContent)));
                    console.log(`Decoded mermaid content (${graphDefinition.length} chars)`);
                } catch (decodeError) {
                    console.error('Mermaid base64 decode error:', decodeError);
                    element.outerHTML = 
                        `<div class="mermaid-error">图表数据解码失败<br><small>${decodeError.message}</small></div>`;
                    continue;
                }
                
                const id = `mermaid-${Date.now()}-${index}`;
                
                try {
                    console.log(`Rendering mermaid chart with ID: ${id}`);
                    const { svg } = await mermaid.render(id, graphDefinition);
                    console.log(`Successfully rendered mermaid chart ${index + 1}`);
                    element.outerHTML = `<div class="mermaid-chart">${svg}</div>`;
                } catch (error) {
                    console.error('Mermaid render error:', error);
                    element.outerHTML = 
                        `<div class="mermaid-error">图表渲染失败<br><small>${error.message}</small></div>`;
                }
            }
            
            console.log('=== Mermaid rendering completed ===');
            
            // Rebuild TOC after mermaid rendering to update heading positions
            if (typeof rebuildTocAfterMermaid === 'function') {
                console.log('Rebuilding TOC after Mermaid rendering...');
                rebuildTocAfterMermaid();
            }
        },
    },
};
