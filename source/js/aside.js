// modified from butterfly
/**
* toc,anchor
*/
const newTocNode = (level, idStack, item) => {
    let li = document.createElement('li');
    li.className = 'toc-item toc-level-' + level;
    const a = document.createElement('a');
    a.className = 'toc-link';
    a.href = '#' + encodeURI(item.id);
    const spanNumber = document.createElement('span');
    spanNumber.className = 'toc-number';
    spanNumber.textContent = idStack.join('.') + '.';
    a.appendChild(spanNumber);
    const spanText = document.createElement('span');
    spanText.className = 'toc-text';
    spanText.textContent = item.textContent;
    a.appendChild(spanText);
    li.appendChild(a);
    return li;
}

const buildToc = (l) => {
    const validList = l.map(item => item.level)
    const minId = Math.min(...validList)
    const idOffset = minId - 1;

    let currentNode = document.createElement('ol');
    currentNode.classList.add('toc');
    const nodeList = [];
    const idStack = [0];
    l.forEach(item => {
        level = item.level - idOffset

        while (level < idStack.length) {
            nodeList[nodeList.length - 1].appendChild(currentNode)
            currentNode = nodeList.pop()
            idStack.pop()
        }
        if (level === idStack.length) {
            idStack[idStack.length - 1] += 1;
        }
        else { // level > idStack.length
            nodeList.push(currentNode);
            currentNode = document.createElement('ol');
            currentNode.classList.add('toc-child');
            idStack.push(1);
        }
        currentNode.appendChild(newTocNode(level, idStack, item));
    });

    while (idStack.length > 1) {
        nodeList[nodeList.length - 1].appendChild(currentNode)
        currentNode = nodeList.pop()
        idStack.pop()
    }

    const tocContent = document.getElementById("toc-content")
    tocContent.appendChild(currentNode)
}

const scrollToDest = (pos, time = 500) => {
    const currentPos = window.scrollY
    const isNavFixed = document.getElementById('page-header').classList.contains('fixed')
    if (currentPos > pos || isNavFixed) pos = pos - 70

    if ('scrollBehavior' in document.documentElement.style) {
        window.scrollTo({
            top: pos,
            behavior: 'smooth'
        })
        return
    }

    const startTime = performance.now()
    const animate = currentTime => {
        const timeElapsed = currentTime - startTime
        const progress = Math.min(timeElapsed / time, 1)
        window.scrollTo(0, currentPos + (pos - currentPos) * progress)
        if (progress < 1) {
            requestAnimationFrame(animate)
        }
    }
    requestAnimationFrame(animate)
}

const getEleTop = (ele) => {
    if (!ele) return 0

    let actualTop = ele.offsetTop
    let current = ele.offsetParent

    while (current !== null) {
        actualTop += current.offsetTop
        current = current.offsetParent
    }

    return actualTop
}

const updateAnchor = (anchor) => {
    if (anchor !== window.location.hash) {
        if (!anchor) anchor = location.pathname
        const title = document.title
        window.history.replaceState({
            url: location.href,
            title
        }, title, anchor)
    }
}

const findHeadPosition = (top) => {

    if (top === 0) return false

    let currentId = ''

    let currentIndex = ''

    for (let i = 0; i < $articleList.length; i++) {
        const ele = $articleList[i]
        console.log(ele)
        
        const topOffset = ele.top;
        if (top > topOffset - 80) {
            currentId = ele.id ? '#' + encodeURI(ele.id) : ''
            currentIndex = i
        } else {
            break
        }
    }

    console.log(currentId)

    console.log(currentIndex)

    if (detectItem === currentIndex) return

    if (isAnchor) updateAnchor(currentId)

    detectItem = currentIndex

    if (isToc) {

        $cardToc.querySelectorAll('.active').forEach(i => i.classList.remove('active'))

        if (currentId) {
            const currentActive = $tocLink[currentIndex]
            currentActive.classList.add('active')

            setTimeout(() => autoScrollToc(currentActive), 0)

            if (!isExpand) {
                let parent = currentActive.parentNode
                while (!parent.matches('.toc')) {
                    if (parent.matches('li')) parent.classList.add('active')
                    parent = parent.parentNode
                }
            }
        }
    }
}

const throttle = (func, wait, options = {}) => {
    let timeout, context, args;
    let previous = 0;

    const later = () => {
        previous = options.leading === false ? 0 : new Date().getTime();
        timeout = null;
        func.apply(context, args);
        if (!timeout) context = args = null;
    };

    const throttled = function (...params) {
        const now = new Date().getTime();
        if (!previous && options.leading === false) previous = now;
        const remaining = wait - (now - previous);
        context = this;
        args = params;
        if (remaining <= 0 || remaining > wait) {
            if (timeout) {
                clearTimeout(timeout);
                timeout = null;
            }
            previous = now;
            func.apply(context, args);
            if (!timeout) context = args = null;
        } else if (!timeout && options.trailing !== false) {
            timeout = setTimeout(later, remaining);
        }
    };

    return throttled;
}

const getScrollPercent = (currentTop, ele) => {
    if (!docHeight || ele.clientHeight !== docHeight) {
        docHeight = ele.clientHeight;
        winHeight = window.innerHeight;
        headerHeight = ele.offsetTop;
        contentMath = Math.max(docHeight - winHeight, document.documentElement.scrollHeight - winHeight);
    }

    const scrollPercent = (currentTop - headerHeight) / contentMath;
    return Math.max(0, Math.min(100, Math.round(scrollPercent * 100)));
}

const addEventListenerPjax = (ele, event, fn, option = false) => {

    console.log(ele)
    console.log(fn)
    console.log(event)


    ele.addEventListener(event, fn, option);

    // 模拟 pjaxSendOnce 清理逻辑（假设你在页面加载时清理）
    window.addGlobalFn = window.addGlobalFn || {};
    window.addGlobalFn['pjaxSendOnce'] = window.addGlobalFn['pjaxSendOnce'] || [];

    window.addGlobalFn['pjaxSendOnce'].push(() => {
        ele.removeEventListener(event, fn, option);
    });
}

// main of scroll
const tocScrollFn = throttle(() => {
    const currentTop = window.scrollY || document.documentElement.scrollTop
    if (isToc && isTocPercent) {
        $tocPercentage.textContent = getScrollPercent(currentTop, $article)
    }
    findHeadPosition(currentTop)
}, 100)

let docHeight, winHeight, headerHeight, contentMath;

const $article = document.querySelector('.article-wrap .article .content')

if (!($article && (isToc || isAnchor)))
    throw new Error('未找到文章容器或未启用toc和anchor')

let $tocLink, $cardToc, autoScrollToc, $tocPercentage, isExpand

// find head position & add active class
// const $articleList = Array.from(
//     $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
// ).map(
//     item => document.getElementById(item.id)
// )
const $articleList = Array.from(
    $article.querySelectorAll('h1,h2,h3,h4,h5,h6')
).map(
    item => ({
        tag: item.tagName,
        id: item.id,
        top: getEleTop(item),
        textContent: item.textContent,
        level: Number(item.tagName.slice(1)),
    })
)
let detectItem = ''

if (isToc) {

    buildToc($articleList)

    const $cardTocLayout = document.getElementById('card-toc')
    $cardToc = $cardTocLayout.querySelector('.toc-content')
    $tocLink = $cardToc.querySelectorAll('.toc-link')
    $tocPercentage = $cardTocLayout.querySelector('.toc-percentage')
    isExpand = $cardToc.classList.contains('is-expand')

    // toc元素點擊
    const tocItemClickFn = e => {
        const target = e.target.closest('.toc-link')
        if (!target) return

        e.preventDefault()
        scrollToDest(getEleTop(document.getElementById(decodeURI(target.getAttribute('href')).replace('#', ''))), 300)
        if (window.innerWidth < 900) {
            $cardTocLayout.classList.remove('open')
        }
    }

    addEventListenerPjax($cardToc, 'click', tocItemClickFn)

    autoScrollToc = item => {
        const sidebarHeight = $cardToc.clientHeight
        const itemOffsetTop = item.offsetTop
        const itemHeight = item.clientHeight
        const scrollTop = $cardToc.scrollTop
        const offset = itemOffsetTop - scrollTop
        const middlePosition = (sidebarHeight - itemHeight) / 2

        if (offset !== middlePosition) {
            $cardToc.scrollTop = scrollTop + (offset - middlePosition)
        }
    }

    // 處理 hexo-blog-encrypt 事件
    $cardToc.style.display = 'block'
}

addEventListenerPjax(window, 'scroll', tocScrollFn, { passive: true })
