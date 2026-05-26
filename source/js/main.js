const app = Vue.createApp({
    mixins: Object.values(mixins),
    data() {
        return {
            loading: true,
            hiddenMenu: false,
            showMenuItems: false,
            menuColor: false,
            scrollTop: 0,
            renderers: [],
        };
    },
    created() {
        window.addEventListener("load", () => {
            this.loading = false;
        });
    },
    async mounted() {
        window.addEventListener("scroll", this.handleScroll, true);
        await this.render();
        this.initFloatingAside();
    },
    methods: {
        async render() {
            for (let i of this.renderers) await i();
        },
        handleScroll() {
            let wrap = this.$refs.homePostsWrap;
            let newScrollTop = document.documentElement.scrollTop;
            if (this.scrollTop < newScrollTop) {
                this.hiddenMenu = true;
                this.showMenuItems = false;
            } else this.hiddenMenu = false;
            if (wrap) {
                if (newScrollTop <= window.innerHeight - 100) this.menuColor = true;
                else this.menuColor = false;
                if (newScrollTop <= 400) wrap.style.top = "-" + newScrollTop / 5 + "px";
                else wrap.style.top = "-80px";
            }
            this.scrollTop = newScrollTop;
        },
        initFloatingAside() {
            // Add click-to-toggle functionality for floating aside on medium screens
            const asideContent = document.getElementById('aside-content');
            if (!asideContent) return;
            
            // Check if we're in the medium screen range (901-1200px)
            const checkMediaQuery = () => {
                return window.matchMedia('(min-width: 901px) and (max-width: 1200px)').matches;
            };
            
            // Toggle aside visibility on click
            const toggleAside = (e) => {
                if (!checkMediaQuery()) return;
                
                // Prevent toggling when clicking inside the aside content itself
                if (e.target.closest('.card-widget') || e.target.tagName === 'A' || e.target.tagName === 'BUTTON') {
                    return;
                }
                
                asideContent.classList.toggle('expanded');
            };
            
            // Add click event to the pseudo-element (handled via the ::before)
            asideContent.addEventListener('click', toggleAside);
            
            // Also add keyboard support
            document.addEventListener('keydown', (e) => {
                if (!checkMediaQuery()) return;
                if (e.key === 'Escape' && asideContent.classList.contains('expanded')) {
                    asideContent.classList.remove('expanded');
                }
            });
        },
    },
});
app.mount("#layout");
