(function () {
    const SHARE_TITLE = "Brick Face";
    const SHARE_TEXT = "Turned my face into a brick wall 🧱";

    function buildShareData() {
        return {
            title: SHARE_TITLE,
            text: SHARE_TEXT,
            url: window.location.href
        };
    }

    function buildTwitterUrl(data) {
        const params = new URLSearchParams({
            text: `${data.text} ${data.url}`
        });
        return `https://twitter.com/intent/tweet?${params.toString()}`;
    }

    function init() {
        const shareBtn = document.getElementById("shareFab");
        const twitterLink = document.getElementById("twitterFab");

        if (twitterLink) {
            twitterLink.href = buildTwitterUrl(buildShareData());
        }

        if (shareBtn) {
            shareBtn.addEventListener("click", async () => {
                const data = buildShareData();
                if (navigator.share) {
                    try {
                        await navigator.share(data);
                        return;
                    } catch (err) {
                        if (err && err.name === "AbortError") return;
                    }
                }
                try {
                    await navigator.clipboard.writeText(data.url);
                    shareBtn.setAttribute("aria-label", "Link copied");
                    shareBtn.style.background = "#2e7d32";
                    setTimeout(() => {
                        shareBtn.setAttribute("aria-label", "Share");
                        shareBtn.style.background = "";
                    }, 1200);
                } catch {
                    window.open(buildTwitterUrl(data), "_blank", "noopener");
                }
            });
        }
    }

    if (typeof module !== "undefined" && module.exports) {
        module.exports = { buildShareData, buildTwitterUrl };
    } else {
        if (document.readyState === "loading") {
            document.addEventListener("DOMContentLoaded", init);
        } else {
            init();
        }
    }
})();
