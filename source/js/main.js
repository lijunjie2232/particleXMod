const app = Vue.createApp({
    mixins: Object.values(mixins),
    data() {
        return {
            loading: true,
            hiddenMenu: false,
            showMenuItems: false,
            menuColor: false,
            showBackToTop: false,
            darkMode: document.documentElement.getAttribute("data-theme") === "dark",
            scrollTop: 0,
            scrollTicking: false,
            renderers: [],
        };
    },
    created() {
        const hideLoading = () => {
            this.loading = false;
        };
        if (document.readyState === "complete" || document.readyState === "interactive") {
            requestAnimationFrame(hideLoading);
        } else {
            document.addEventListener("DOMContentLoaded", hideLoading, { once: true });
            window.addEventListener("load", hideLoading, { once: true });
        }
        // Fallback timeout so a slow third-party asset never traps the user
        setTimeout(hideLoading, 1500);
        this.syncHighlightTheme();
    },
    async mounted() {
        window.addEventListener("scroll", this.onScroll, { passive: true });
        this.handleScroll();
        await this.render();
        if (typeof window.initParticlexAside === "function") {
            window.initParticlexAside();
        }
        this.initFloatingAside();
    },
    beforeUnmount() {
        window.removeEventListener("scroll", this.onScroll);
    },
    methods: {
        async render() {
            for (const fn of this.renderers) {
                try {
                    await fn();
                } catch (e) {
                    console.error("Renderer error:", e);
                }
            }
        },
        onScroll() {
            if (this.scrollTicking) return;
            this.scrollTicking = true;
            requestAnimationFrame(() => {
                this.handleScroll();
                this.scrollTicking = false;
            });
        },
        handleScroll() {
            const wrap = this.$refs.homePostsWrap;
            const newScrollTop = window.scrollY || document.documentElement.scrollTop;
            if (newScrollTop > 80 && this.scrollTop < newScrollTop) {
                this.hiddenMenu = true;
                this.showMenuItems = false;
            } else {
                this.hiddenMenu = false;
            }
            this.showBackToTop = newScrollTop > 300;

            if (wrap) {
                this.menuColor = newScrollTop <= window.innerHeight - 100;
                wrap.style.top = newScrollTop <= 400 ? `-${newScrollTop / 5}px` : "-80px";
            }

            const progressBar = document.getElementById("reading-progress");
            if (progressBar) {
                const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
                const pct = maxScroll > 0 ? Math.min(100, Math.max(0, (newScrollTop / maxScroll) * 100)) : 0;
                progressBar.style.width = `${pct}%`;
            }

            this.scrollTop = newScrollTop;
        },
        scrollToTop() {
            window.scrollTo({ top: 0, behavior: "smooth" });
        },
        toggleDarkMode() {
            this.darkMode = !this.darkMode;
            if (this.darkMode) {
                document.documentElement.setAttribute("data-theme", "dark");
            } else {
                document.documentElement.removeAttribute("data-theme");
            }
            try {
                localStorage.setItem("particlex-theme", this.darkMode ? "dark" : "light");
            } catch (e) {}
            this.syncHighlightTheme();
        },
        syncHighlightTheme() {
            const light = document.getElementById("hljs-theme-light");
            const dark = document.getElementById("hljs-theme-dark");
            if (light && dark) {
                light.disabled = this.darkMode;
                dark.disabled = !this.darkMode;
            }
        },
        toggleMobileAside() {
            const asideContent = document.getElementById("aside-content");
            const backdrop = document.getElementById("aside-backdrop");
            if (!asideContent) return;
            const isOpen = asideContent.classList.toggle("mobile-open");
            if (backdrop) backdrop.classList.toggle("visible", isOpen);
        },
        closeMobileAside() {
            const asideContent = document.getElementById("aside-content");
            const backdrop = document.getElementById("aside-backdrop");
            if (asideContent) {
                asideContent.classList.remove("mobile-open");
                asideContent.classList.remove("expanded");
            }
            if (backdrop) backdrop.classList.remove("visible");
        },
        initFloatingAside() {
            const asideContent = document.getElementById("aside-content");
            if (!asideContent) return;

            const isMediumScreen = () =>
                window.matchMedia("(min-width: 901px) and (max-width: 1200px)").matches;

            asideContent.addEventListener("click", (e) => {
                if (!isMediumScreen()) return;
                if (e.target.closest(".card-widget") || e.target.closest("a") || e.target.closest("button")) {
                    return;
                }
                asideContent.classList.toggle("expanded");
            });

            document.addEventListener("keydown", (e) => {
                if (e.key === "Escape") {
                    this.closeMobileAside();
                }
            });
        },
    },
});
app.mount("#layout");
