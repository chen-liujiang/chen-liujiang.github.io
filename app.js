// API基础地址：本地开发指向后端5000端口，生产环境（nginx代理）为空
var API_BASE = window.location.port === '5000' ? 'http://localhost:5000' : '';

// 本地备用数据（API不可用时使用）
const fallbackWorks = [
    {
        id: "7647807189112851721",
        title: "火星营地",
    },
    {
        id: "7644459484105936166",
        title: "乌洲水闸",
    },
    {
        id: "7604456518175526185",
        title: "世荣草朗稻梦生态园",
    },
    {
        id: "7627733585167961350",
        title: "翠亨海岸公园",
    },
    {
        id: "7628822679298067754",
        title: "石岐河",
    },
    {
        id: "7625848802552974642",
        title: "洪圣公园",
    },
    {
        id: "7570963119699283234",
        title: "南围海堤",
    },
    {
        id: "7565720964902735138",
        title: "黄茅海",
    },
];

// 渲染作品列表
async function renderWorks() {
    const container = document.getElementById('works-container');

    // 清空容器
    container.innerHTML = '';

    // 从API获取作品数据，失败时使用本地备用数据
    let works = fallbackWorks;

    // 遍历作品数据，生成 HTML
    works.forEach(work => {
        const videoId = work.video_id || work.id;
        const workElement = document.createElement('div');
        workElement.className = 'bg-white rounded-xl shadow-sm overflow-hidden card-hover';

        // 创建视频容器
        const videoContainer = document.createElement('div');
        videoContainer.className = 'video-container';

        // 创建iframe元素
        const iframe = document.createElement('iframe');
        iframe.src = `https://open.douyin.com/player/video?vid=${videoId}&autoplay=0`;
        iframe.frameBorder = '0';
        iframe.allowFullscreen = true;
        iframe.className = 'w-full h-full';
        iframe.sandbox = 'allow-scripts allow-same-origin allow-popups'

        // 创建信息容器
        const infoContainer = document.createElement('div');
        infoContainer.className = 'p-4';

        const title = document.createElement('h3');
        title.className = 'font-medium mb-2';
        title.textContent = work.title;

        const stats = document.createElement('div');
        stats.className = 'flex items-center gap-4 text-gray-500 text-sm';

        if (work.views) {
            const views = document.createElement('span');
            views.innerHTML = `<i class="far fa-eye mr-1"></i>${work.views}`;
            stats.appendChild(views);
        }

        if (work.likes) {
            const likes = document.createElement('span');
            likes.innerHTML = `<i class="far fa-heart mr-1"></i>${work.likes}`;
            stats.appendChild(likes);
        }

        infoContainer.appendChild(title);
        infoContainer.appendChild(stats);

        videoContainer.appendChild(iframe);
        workElement.appendChild(videoContainer);
        workElement.appendChild(infoContainer);

        container.appendChild(workElement);
    });
}


// 复制功能
function copyToClipboard(text, label) {
    // 创建一个临时输入框来执行复制操作
    const tempInput = document.createElement('input');
    tempInput.value = text;
    document.body.appendChild(tempInput);
    tempInput.select();

    try {
        // 执行复制命令
        const successful = document.execCommand('copy');
        if (successful) {
            // 显示提示消息
            showToast(label + '已复制');
        } else {
            showToast('复制失败，请手动复制');
        }
    } catch (err) {
        showToast('复制失败，请手动复制');
        console.error('复制失败:', err);
    }

    // 移除临时输入框
    document.body.removeChild(tempInput);
}

// 显示提示消息
function showToast(message) {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toast-msg');

    // 设置提示消息
    toastMsg.textContent = message;

    // 显示提示
    toast.classList.remove('hidden');
    toast.classList.add('flex');

    // 2秒后隐藏提示
    setTimeout(() => {
        toast.classList.add('hidden');
        toast.classList.remove('flex');
    }, 2000);
}

// 记录已被点击（激活）过的iframe
const activatedIframes = new Set();

// 监听iframe交互，点击播放一个视频时暂停其他视频
function setupIframeFocusListeners() {
    const iframes = document.querySelectorAll('.video-container iframe');

    // 监听窗口blur事件，检测焦点是否转移到了iframe
    window.addEventListener('blur', function() {
        setTimeout(() => {
            const activeElement = document.activeElement;
            if (activeElement && activeElement.tagName === 'IFRAME') {
                activatedIframes.add(activeElement);
                // 只暂停之前被点击过的其他iframe
                iframes.forEach(iframe => {
                    if (iframe !== activeElement && activatedIframes.has(iframe)) {
                        pauseIframe(iframe);
                    }
                });
            }
        }, 100);
    });

    // 点击iframe容器时也检测
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach(container => {
        container.addEventListener('click', function() {
            const clickedIframe = container.querySelector('iframe');
            if (clickedIframe) {
                activatedIframes.add(clickedIframe);
                // 只暂停之前被点击过的其他iframe
                iframes.forEach(iframe => {
                    if (iframe !== clickedIframe && activatedIframes.has(iframe)) {
                        pauseIframe(iframe);
                    }
                });
            }
        });
    });
}

// 暂停iframe视频：先清空src再恢复，强制重新加载
function pauseIframe(iframe) {
    const currentSrc = iframe.src;
    if (currentSrc) {
        iframe.src = '';
        requestAnimationFrame(() => {
            iframe.src = currentSrc;
        });
    }
}

// 页面加载完成后渲染作品列表
document.addEventListener('DOMContentLoaded', renderWorks);

// 动态缩放iframe以适应容器宽度
function scaleIframes() {
    const videoContainers = document.querySelectorAll('.video-container');
    videoContainers.forEach(container => {
        const iframe = container.querySelector('iframe');
        if (iframe) {
            const containerWidth = container.offsetWidth;
            if (containerWidth > 0) {
                const iframeWidth = 1600; // iframe的固定宽度
                const iframeHeight = 900; // iframe的固定高度
                const scale = containerWidth / iframeWidth;
                iframe.style.transform = `scale(${scale})`;
                // 动态设置容器高度为iframe缩放后的实际高度
                container.style.height = (iframeHeight * scale) + 'px';
            }
        }
    });
}

// 页面加载时调整iframe缩放
window.addEventListener('load', scaleIframes);

// 窗口大小改变时调整iframe缩放
window.addEventListener('resize', scaleIframes);

// iframe加载完成时调整缩放
function setupIframeLoadListeners() {
    const iframes = document.querySelectorAll('.video-container iframe');
    iframes.forEach(iframe => {
        iframe.addEventListener('load', scaleIframes);
    });
}

// 延迟重试机制，确保iframe在容器宽度稳定后正确缩放
function delayedScale() {
    scaleIframes();
    setTimeout(scaleIframes, 500);
    setTimeout(scaleIframes, 1000);
    setTimeout(scaleIframes, 2000);
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    setupIframeLoadListeners();
    setupIframeFocusListeners();
    delayedScale();
});
