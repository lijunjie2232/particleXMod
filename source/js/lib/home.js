mixins.home = {
    mounted() {
        const background = this.$refs.homeBackground;
        if (background && background.dataset.images) {
            const images = background.dataset.images.split(",").filter(Boolean);
            if (images.length > 0) {
                const id = Math.floor(Math.random() * images.length);
                background.style.backgroundImage = `url('${images[id]}')`;
            }
        }
        this.menuColor = true;

        const homePostsWrap = this.$refs.homePostsWrap;
        const maxBlur = 10;
        const startBlurOffset = 0.618;

        if (homePostsWrap && background) {
            let lastBlur = -1;
            let blurTicking = false;

            this._homeBlurHandler = () => {
                if (blurTicking) return;
                blurTicking = true;
                requestAnimationFrame(() => {
                    const rect = homePostsWrap.getBoundingClientRect();
                    const threshold = window.innerHeight * startBlurOffset;
                    let blurValue = 0;
                    if (rect.top < threshold && threshold > 0) {
                        blurValue = Math.min(maxBlur, Math.max(0, Math.floor(((threshold - rect.top) / threshold) * maxBlur)));
                    }
                    if (blurValue !== lastBlur) {
                        background.style.filter = blurValue > 0 ? `blur(${blurValue}px)` : "none";
                        lastBlur = blurValue;
                    }
                    blurTicking = false;
                });
            };

            window.addEventListener("scroll", this._homeBlurHandler, { passive: true });
        }
    },
    beforeUnmount() {
        if (this._homeBlurHandler) {
            window.removeEventListener("scroll", this._homeBlurHandler);
        }
    },
    methods: {
        homeClick() {
            window.scrollTo({ top: window.innerHeight, behavior: "smooth" });
        },
    },
};
