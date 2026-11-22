(function () {
  function initBlogPlayer() {
    if (window.__blogAPlayer || typeof window.APlayer !== "function") {
      return;
    }

    var container = document.getElementById("blog-aplayer");
    if (!container) {
      return;
    }

    window.__blogAPlayer = new window.APlayer({
      container: container,
      fixed: true,
      autoplay: false,
      theme: "#49b1f5",
      loop: "all",
      order: "list",
      preload: "metadata",
      volume: 0.7,
      mutex: true,
      listFolded: true,
      lrcType: 0,
      audio: [
        {
          name: "永遠の零時",
          artist: "小克",
          url: "/music/eternal-midnight.mp3",
          cover: "/music/cover-eternal-midnight.webp"
        },
        {
          name: "夜猫の時間",
          artist: "小克",
          url: "/music/night-owl-time.mp3",
          cover: "/music/cover-night-owl-time.webp"
        },
        {
          name: "さくら ~あなたに出会えてよかった~",
          artist: "夜明け / 佐天Tamako",
          url: "/music/sakura.mp3",
          cover: "/music/cover-sakura.webp"
        }
      ]
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initBlogPlayer);
  } else {
    initBlogPlayer();
  }
})();
