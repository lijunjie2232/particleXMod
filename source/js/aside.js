// Modified from butterfly, optimized for ParticleXMod

(() => {
    let cleanupAside = null;

    const initAside = () => {
        if (typeof cleanupAside === "function") {
            cleanupAside();
            cleanupAside = null;
        }

        const tocConfig = (window.PARTICLEX_CONFIG && window.PARTICLEX_CONFIG.toc) || {
            enable: true,
            anchor: true,
            percentage: true,
        };
        const isToc = Boolean(tocConfig.enable);
        const isAnchor = Boolean(tocConfig.anchor);
        const isTocPercent = Boolean(tocConfig.percentage);

        const $article = document.getElementById("content");
        const $cardToc = document.getElementById("toc-content");
        const $asideToc = document.getElementById("aside-toc");
        const $tocPercent = document.getElementById("toc-percentage");

        if (!$article || !$cardToc) return;

        let offsetY = window.innerHeight * 0.35;
        let $articleList = [];
        let $tocLinks = [];
        let activeIndex = -1;

        const getEleTop = (ele) => {
            if (!ele) return 0;
            const rect = ele.getBoundingClientRect();
            return rect.top + (window.scrollY || document.documentElement.scrollTop);
        };

        const scrollToDest = (pos) => {
            const menu = document.getElementById("menu");
            const isNavVisible = menu && !menu.classList.contains("hidden");
            const targetTop = Math.max(0, pos - (isNavVisible ? 70 : 20));
            window.scrollTo({
                top: targetTop,
                behavior: "smooth",
            });
        };

        const closeMobileDrawer = () => {
            const asideContent = document.getElementById("aside-content");
            const backdrop = document.getElementById("aside-backdrop");
            if (asideContent) asideContent.classList.remove("mobile-open");
            if (backdrop) backdrop.classList.remove("visible");
        };

        const newTocNode = (level, idStack, item, index) => {
            const li = document.createElement("li");
            li.className = `toc-item toc-level-${level}`;

            const linkSpan = document.createElement("span");
            linkSpan.className = "toc-link";
            linkSpan.dataset.tocIndex = String(index);
            linkSpan.addEventListener("click", (e) => {
                e.preventDefault();
                scrollToDest(getEleTop(item.el));
                closeMobileDrawer();
            });

            const spanNumber = document.createElement("span");
            spanNumber.className = "toc-number";
            spanNumber.textContent = `${idStack.join(".")}. `;
            linkSpan.appendChild(spanNumber);

            const spanText = document.createElement("span");
            spanText.className = "toc-text";
            spanText.textContent = item.textContent;
            linkSpan.appendChild(spanText);

            li.appendChild(linkSpan);
            return li;
        };

        const buildToc = (list) => {
            $cardToc.innerHTML = "";
            if (!list.length) {
                if ($asideToc) $asideToc.style.display = "none";
                $tocLinks = [];
                return;
            }
            if ($asideToc) $asideToc.style.display = "";

            const minLevel = Math.min(...list.map((item) => item.level));
            const idOffset = minLevel - 1;

            let currentNode = document.createElement("ol");
            currentNode.classList.add("toc");
            const nodeList = [];
            const idStack = [0];

            list.forEach((item, index) => {
                const level = item.level - idOffset;

                while (level < idStack.length && nodeList.length > 0) {
                    nodeList[nodeList.length - 1].appendChild(currentNode);
                    currentNode = nodeList.pop();
                    idStack.pop();
                }
                if (level === idStack.length) {
                    idStack[idStack.length - 1] += 1;
                } else {
                    while (level > idStack.length) {
                        nodeList.push(currentNode);
                        currentNode = document.createElement("ol");
                        currentNode.classList.add("toc-child");
                        idStack.push(1);
                    }
                }
                currentNode.appendChild(newTocNode(level, idStack, item, index));
            });

            while (idStack.length > 1 && nodeList.length > 0) {
                nodeList[nodeList.length - 1].appendChild(currentNode);
                currentNode = nodeList.pop();
                idStack.pop();
            }

            $cardToc.appendChild(currentNode);
            $tocLinks = Array.from($cardToc.querySelectorAll(".toc-link"));
        };

        const buildArticleList = () => {
            return Array.from($article.querySelectorAll("h1, h2, h3, h4, h5, h6")).map((el) => ({
                el,
                tag: el.tagName,
                id: el.id,
                top: getEleTop(el),
                textContent: el.textContent.trim(),
                level: Number(el.tagName.slice(1)),
            }));
        };

        const refreshHeadingPositions = () => {
            offsetY = window.innerHeight * 0.35;
            for (const item of $articleList) {
                item.top = getEleTop(item.el);
            }
        };

        const updateAnchor = (anchor) => {
            if (anchor !== window.location.hash) {
                const target = anchor || location.pathname + location.search;
                window.history.replaceState({ url: location.href, title: document.title }, document.title, target);
            }
        };

        const autoScrollToc = (item) => {
            if (!item || !$cardToc) return;
            const containerHeight = $cardToc.clientHeight;
            if (containerHeight <= 0 || $cardToc.scrollHeight <= containerHeight) return;

            const containerRect = $cardToc.getBoundingClientRect();
            const itemRect = item.getBoundingClientRect();
            const itemTopInContainer = itemRect.top - containerRect.top + $cardToc.scrollTop;
            const targetScroll = itemTopInContainer - (containerHeight - itemRect.height) / 2;
            const clampedTop = Math.max(0, Math.min(targetScroll, $cardToc.scrollHeight - containerHeight));

            if (Math.abs($cardToc.scrollTop - clampedTop) > 2) {
                $cardToc.scrollTo({
                    top: clampedTop,
                    behavior: "smooth",
                });
            }
        };

        const findHeadPosition = (top) => {
            if (!$articleList.length) return;

            let currentIndex = 0;
            let currentId = "";

            if (top > 0) {
                for (let i = 0; i < $articleList.length; i++) {
                    const ele = $articleList[i];
                    if (top >= ele.top) {
                        currentId = ele.id ? "#" + encodeURI(ele.id) : "";
                        currentIndex = i;
                    } else {
                        break;
                    }
                }
            }

            if (currentIndex === activeIndex) return;
            activeIndex = currentIndex;

            if (isAnchor && currentId) updateAnchor(currentId);

            if (isToc && $tocLinks.length) {
                $cardToc.querySelectorAll(".toc-active").forEach((el) => el.classList.remove("toc-active"));
                const currentActive = $tocLinks[currentIndex];
                if (currentActive) {
                    currentActive.classList.add("toc-active");
                    autoScrollToc(currentActive);

                    let parent = currentActive.parentNode;
                    while (parent && !parent.matches(".toc")) {
                        if (parent.matches("li")) parent.classList.add("toc-active");
                        parent = parent.parentNode;
                    }
                }
            }
        };

        const getScrollPercent = (currentTop) => {
            const winHeight = window.innerHeight;
            const headerTop = getEleTop($article);
            const contentMath = Math.max($article.clientHeight - winHeight, document.documentElement.scrollHeight - winHeight);
            if (contentMath <= 0) return "100%";
            const pct = Math.max(0, Math.min(100, Math.round(((currentTop - headerTop) / contentMath) * 100)));
            return `${pct}%`;
        };

        let ticking = false;
        const onScroll = () => {
            if (ticking) return;
            ticking = true;
            requestAnimationFrame(() => {
                const currentTop = window.scrollY || document.documentElement.scrollTop;
                if (isTocPercent && $tocPercent) {
                    $tocPercent.textContent = getScrollPercent(currentTop);
                }
                findHeadPosition(currentTop + offsetY);
                ticking = false;
            });
        };

        let resizeTimer = null;
        const onResize = () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                refreshHeadingPositions();
                onScroll();
            }, 150);
        };

        $articleList = buildArticleList();
        buildToc($articleList);
        onScroll();

        const onLoad = () => {
            refreshHeadingPositions();
            onScroll();
        };

        window.addEventListener("scroll", onScroll, { passive: true });
        window.addEventListener("resize", onResize, { passive: true });
        window.addEventListener("load", onLoad, { once: true });

        cleanupAside = () => {
            window.removeEventListener("scroll", onScroll);
            window.removeEventListener("resize", onResize);
            window.removeEventListener("load", onLoad);
            clearTimeout(resizeTimer);
        };

        // Rebuild TOC after dynamic content changes (e.g., Mermaid charts or decrypted content)
        window.rebuildTocAfterMermaid = () => {
            $articleList = buildArticleList();
            activeIndex = -1;
            buildToc($articleList);
            onScroll();
        };
    };

    window.initParticlexAside = initAside;
})();
