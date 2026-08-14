mixins.search = {
    data() {
        return { rawSearch: "" };
    },
    watch: {
        search(value) {
            const timeline = this.$refs.timeline;
            if (!timeline) return;
            for (const el of timeline.children) {
                const title = (el.dataset && el.dataset.title) || "";
                if (!value || title.includes(value)) {
                    el.style.opacity = "1";
                    el.style.visibility = "visible";
                    el.style.marginTop = "0";
                } else {
                    el.style.opacity = "0";
                    el.style.visibility = "hidden";
                    el.style.marginTop = `${-el.offsetHeight - 30}px`;
                }
            }
        },
    },
    computed: {
        search() {
            return this.rawSearch.toLowerCase().replace(/\s+/g, "");
        },
    },
};
