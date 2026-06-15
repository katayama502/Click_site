/* Click かんたんガイド — フロントエンドロジック
   注：表示する動的テキストは全て escapeHtml() でエスケープしてから innerHTML に渡しています（XSS対策済み）。 */
(function () {
  "use strict";

  const TOPICS = (window.CLICK_TOPICS || []).slice();
  const VIDEOS = (window.CLICK_VIDEOS || []).slice();

  const N = (s) => (s || "").normalize("NFKC").toLowerCase();

  const CAT_META = {
    "はじめに":        { emoji: "🚀" },
    "基本操作":        { emoji: "🖱️" },
    "キャンバス":      { emoji: "🎨" },
    "エレメント":      { emoji: "🧩" },
    "データベース":    { emoji: "🗄️" },
    "機能実装":        { emoji: "⚙️" },
    "レスポンシブ":    { emoji: "📱" },
    "外部サービス連携":{ emoji: "🔗" },
    "決済":            { emoji: "💳" },
    "Proプラン機能":   { emoji: "⭐" },
    "活用ガイド":      { emoji: "💡" },
    "ページテンプレート":{ emoji: "📋" },
    "アプリ共有":      { emoji: "👥" },
    "アカウント":      { emoji: "👤" },
    "FAQ":             { emoji: "❓" },
    "その他":          { emoji: "📎" }
  };
  const CAT_ORDER = Object.keys(CAT_META);

  const GOALS = [
    { emoji:"🏁", name:"はじめてアプリを作る", desc:"アカウント作成から最初のアプリ完成まで", q:"超基本 キャンバス はじめに" },
    { emoji:"🔐", name:"ログイン機能をつける", desc:"会員登録・ログイン・パスワード", q:"ログイン アカウント登録 パスワード" },
    { emoji:"🗄️", name:"データを保存・表示する", desc:"データベースとリスト表示", q:"データベース リスト データ 保存" },
    { emoji:"🔍", name:"検索・絞り込みを作る", desc:"検索フォーム・タグ・フリーワード", q:"検索 絞り込み タグ フィルター" },
    { emoji:"👍", name:"いいね・お気に入り", desc:"トグルでいいね機能を実装", q:"いいね トグル お気に入り" },
    { emoji:"💳", name:"決済・販売する", desc:"Click Pay / JPYC で支払い", q:"決済 支払い Click Pay JPYC" },
    { emoji:"📱", name:"スマホで綺麗に見せる", desc:"レスポンシブデザイン", q:"レスポンシブ スマホ タブレット 配置" },
    { emoji:"🔗", name:"外部サービスと連携", desc:"スプレッドシート・LINE・Zapier", q:"連携 スプレッドシート LINE Zapier kintone" },
    { emoji:"🌐", name:"アプリを公開する", desc:"Web公開・独自ドメイン・ストア公開", q:"公開 ドメイン ビルド ストア" },
    { emoji:"🤖", name:"AI機能を使う", desc:"AIチャットボット・AI画像生成", q:"AI チャットボット 画像生成" },
    { emoji:"🧩", name:"部品(エレメント)を知る", desc:"ボタン・フォーム・リストなど", q:"エレメント ボタン フォーム" },
    { emoji:"⚡", name:"ボタンに動きをつける", desc:"アクションでページ移動・データ操作", q:"アクション ボタン ページ移動 クリックフロー" }
  ];

  let activeCat = "ALL";
  const $ = (id) => document.getElementById(id);
  const homeView = $("homeView"), videoView = $("videoView"), searchResults = $("searchResults");
  const heroEl = $("hero");

  function escapeHtml(s){return (s||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}

  function relatedVideos(topic, limit) {
    const terms = new Set();
    (topic.keywords || []).forEach(k => terms.add(N(k)));
    N(topic.title).split(/[\s（）()・/／、,]+/).forEach(w => { if (w.length >= 2) terms.add(w); });
    const scored = [];
    for (const v of VIDEOS) {
      const vt = N(v.title);
      let score = 0;
      terms.forEach(t => { if (t.length >= 2 && vt.indexOf(t) >= 0) score += t.length; });
      if (score > 0) scored.push({ v, score });
    }
    scored.sort((a, b) => b.score - a.score);
    return scored.slice(0, limit || 3).map(x => x.v);
  }

  function scoreTopic(topic, tokens) {
    const title = N(topic.title), desc = N(topic.description), cat = N(topic.category);
    const kw = (topic.keywords || []).map(N).join(" ");
    const steps = (topic.steps || []).map(N).join(" ");
    let score = 0;
    for (const tk of tokens) {
      if (!tk) continue;
      if (title.indexOf(tk) >= 0) score += 10;
      if (kw.indexOf(tk) >= 0) score += 6;
      if (cat.indexOf(tk) >= 0) score += 4;
      if (desc.indexOf(tk) >= 0) score += 3;
      if (steps.indexOf(tk) >= 0) score += 1;
    }
    return score;
  }
  function scoreVideo(video, tokens) {
    const title = N(video.title), grp = N(video.group);
    let score = 0;
    for (const tk of tokens) {
      if (!tk) continue;
      if (title.indexOf(tk) >= 0) score += 8;
      if (grp.indexOf(tk) >= 0) score += 3;
    }
    return score;
  }

  function highlight(text, tokens) {
    let out = escapeHtml(text);
    tokens.forEach(tk => {
      if (tk.length < 1) return;
      const re = new RegExp("(" + tk.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + ")", "gi");
      out = out.replace(re, "<mark>$1</mark>");
    });
    return out;
  }

  function renderQuickTags() {
    const tags = ["ログイン","ボタン","データベース","検索","いいね","フォーム","レスポンシブ","アクション","公開","決済"];
    $("quickTags").innerHTML = tags.map(t => '<span class="qtag">'+escapeHtml(t)+'</span>').join("");
    $("quickTags").querySelectorAll(".qtag").forEach(el => {
      el.addEventListener("click", () => { $("searchInput").value = el.textContent; doSearch(el.textContent); });
    });
  }

  function renderSidebar() {
    const counts = {};
    TOPICS.forEach(t => counts[t.category] = (counts[t.category] || 0) + 1);
    const cats = CAT_ORDER.filter(c => counts[c]);
    let html = '<li class="cat-item '+(activeCat==="ALL"?"active":"")+'" data-cat="ALL"><span class="cat-emoji">📚</span>すべて<span class="cat-count">'+TOPICS.length+'</span></li>';
    html += cats.map(c => '<li class="cat-item '+(activeCat===c?"active":"")+'" data-cat="'+escapeHtml(c)+'"><span class="cat-emoji">'+CAT_META[c].emoji+'</span>'+escapeHtml(c)+'<span class="cat-count">'+counts[c]+'</span></li>').join("");
    $("catList").innerHTML = html;
    $("catList").querySelectorAll(".cat-item").forEach(el => {
      el.addEventListener("click", () => { activeCat = el.dataset.cat; renderSidebar(); renderTopics(); closeDrawer(); window.scrollTo({top: heroEl.offsetHeight, behavior:"smooth"}); });
    });
  }

  function renderGoals() {
    $("goalGrid").innerHTML = GOALS.map((g,i) =>
      '<div class="goal-card" data-i="'+i+'"><div class="goal-emoji">'+g.emoji+'</div><div class="goal-name">'+escapeHtml(g.name)+'</div><div class="goal-desc">'+escapeHtml(g.desc)+'</div></div>'
    ).join("");
    $("goalGrid").querySelectorAll(".goal-card").forEach(el => {
      el.addEventListener("click", () => { const g = GOALS[+el.dataset.i]; $("searchInput").value = g.name; doSearch(g.q); });
    });
  }

  function renderPath() {
    const tut = VIDEOS.filter(v => v.tag === "tutorial").sort((a,b) => {
      const rank = t => /超基本/.test(t)?0:1;
      const r = rank(a.title) - rank(b.title);
      return r !== 0 ? r : a.order - b.order;
    });
    $("pathList").innerHTML = tut.map(v =>
      '<li class="path-step" data-vid="'+escapeHtml(v.id)+'"><span class="ps-title">'+escapeHtml(v.title.replace(/／.*$/,"").replace(/\s*-\s*イベント予約アプリ.*/,""))+'</span><span class="ps-meta">▶ 動画で見る</span></li>'
    ).join("");
    $("pathList").querySelectorAll(".path-step").forEach(el => {
      el.addEventListener("click", () => openVideoModal(el.dataset.vid));
    });
  }

  function topicCardHtml(t, tokens) {
    const hasVid = relatedVideos(t,1).length > 0;
    const hasSteps = (t.steps || []).length > 0;
    const title = tokens ? highlight(t.title, tokens) : escapeHtml(t.title);
    const desc = tokens ? highlight(t.description||"", tokens) : escapeHtml(t.description||"");
    return '<div class="topic-card" data-id="'+escapeHtml(t.id)+'">'+
      '<span class="topic-cat">'+(CAT_META[t.category]?CAT_META[t.category].emoji:"")+' '+escapeHtml(t.category)+'</span>'+
      '<div class="topic-title">'+title+'</div>'+
      '<div class="topic-desc">'+desc+'</div>'+
      '<div class="topic-foot">'+(hasVid?'<span class="badge-video">🎬 動画あり</span>':'')+(hasSteps?'<span class="badge-steps">📝 手順あり</span>':'')+'</div>'+
    '</div>';
  }

  function renderTopics() {
    const list = activeCat === "ALL" ? TOPICS : TOPICS.filter(t => t.category === activeCat);
    $("topicsTitle").textContent = activeCat === "ALL" ? "すべての解説" : (CAT_META[activeCat].emoji + " " + activeCat);
    $("topicsCount").textContent = list.length + "件";
    $("topicGrid").innerHTML = list.map(t => topicCardHtml(t)).join("");
    bindTopicCards($("topicGrid"));
  }

  function bindTopicCards(scope) {
    scope.querySelectorAll(".topic-card").forEach(el => {
      el.addEventListener("click", () => openTopicModal(el.dataset.id));
    });
  }

  function doSearch(query) {
    const q = N(query).trim();
    $("searchClear").hidden = !query;
    if (!q) { exitSearch(); return; }
    const tokens = q.split(/[\s　]+/).filter(Boolean);
    const tHits = TOPICS.map(t => ({ t, s: scoreTopic(t, tokens) })).filter(x => x.s > 0).sort((a,b)=>b.s-a.s);
    const vHits = VIDEOS.map(v => ({ v, s: scoreVideo(v, tokens) })).filter(x => x.s > 0).sort((a,b)=>b.s-a.s).slice(0,8);

    homeView.hidden = true; videoView.hidden = true; searchResults.hidden = false;
    let html = '<div class="sr-head">「'+escapeHtml(query)+'」の検索結果：解説 '+tHits.length+'件 / 動画 '+vHits.length+'件</div>';
    if (!tHits.length && !vHits.length) {
      html += '<div class="sr-empty">見つかりませんでした。別のことばで試してみてください。<br>例：「ボタン」「データ」「公開」</div>';
    } else {
      if (tHits.length) {
        html += '<h3 class="section-h" style="font-size:1.1rem;margin:18px 0 12px">📖 解説</h3><div class="topic-grid">';
        html += tHits.map(x => topicCardHtml(x.t, tokens)).join("");
        html += '</div>';
      }
      if (vHits.length) {
        html += '<h3 class="section-h" style="font-size:1.1rem;margin:28px 0 12px">🎬 関連動画</h3><div class="vcard-grid">';
        html += vHits.map(x => videoCardHtml(x.v)).join("");
        html += '</div>';
      }
    }
    searchResults.innerHTML = html;
    bindTopicCards(searchResults);
  }
  function exitSearch() {
    searchResults.hidden = true; searchResults.innerHTML = "";
    homeView.hidden = false; videoView.hidden = true;
  }

  function videoCardHtml(v) {
    return '<div class="vcard"><div class="vembed"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.id)+'" title="'+escapeHtml(v.title)+'" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div><div class="vmeta"><div class="vt">'+escapeHtml(v.title)+'</div></div></div>';
  }

  function renderVideoLibrary() {
    const GROUP_ORDER = ["Clickを知る","はじめの設定","基礎チュートリアル","レスポンシブ講座","新機能・エレメント紹介","便利ワザ","よくある質問(動画)","ウェビナー(応用)","アプリの共有・複製","その他"];
    const byGroup = {};
    VIDEOS.forEach(v => (byGroup[v.group] = byGroup[v.group] || []).push(v));
    const groups = GROUP_ORDER.filter(g => byGroup[g]).concat(Object.keys(byGroup).filter(g => !GROUP_ORDER.includes(g)));
    $("videoGroups").innerHTML = groups.map(g => {
      const vids = byGroup[g].slice().sort((a,b)=>a.order-b.order);
      return '<div class="vgroup"><div class="vgroup-title">'+escapeHtml(g)+' <span class="vcount">'+vids.length+'本</span></div><div class="vcard-grid">'+vids.map(videoCardHtml).join("")+'</div></div>';
    }).join("");
  }

  function openTopicModal(id) {
    const t = TOPICS.find(x => x.id === id);
    if (!t) return;
    const vids = relatedVideos(t, 2);
    let html = '<span class="md-cat">'+(CAT_META[t.category]?CAT_META[t.category].emoji:"")+' '+escapeHtml(t.category)+'</span>';
    html += '<h2 class="md-title">'+escapeHtml(t.title)+'</h2>';
    html += '<p class="md-desc">'+escapeHtml(t.description||"")+'</p>';
    if (t.whenToUse) html += '<div class="md-when"><b>こんな時に</b> '+escapeHtml(t.whenToUse)+'</div>';
    if ((t.steps||[]).length) {
      html += '<div class="md-h">📝 操作の手順</div><ol class="md-steps">'+t.steps.map(s=>'<li class="md-step">'+escapeHtml(s)+'</li>').join("")+'</ol>';
    }
    if ((t.tips||[]).length) {
      html += '<div class="md-h">💡 ポイント・注意</div><ul class="md-tips">'+t.tips.map(s=>'<li class="md-tip">'+escapeHtml(s)+'</li>').join("")+'</ul>';
    }
    if (vids.length) {
      html += '<div class="md-h">🎬 関連する解説動画</div><div class="md-videos">'+vids.map(v=>
        '<div class="md-video"><div class="vembed"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.id)+'" title="'+escapeHtml(v.title)+'" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div><div class="vtitle">'+escapeHtml(v.title)+'</div></div>'
      ).join("")+'</div>';
    }
    if ((t.keywords||[]).length) {
      html += '<div class="md-kw">'+t.keywords.map(k=>'<span class="kw">#'+escapeHtml(k)+'</span>').join("")+'</div>';
    }
    html += '<a class="md-manual" href="'+escapeHtml(t.manualUrl)+'" target="_blank" rel="noopener">📘 公式マニュアルで詳しく見る ↗</a>';
    $("modalBody").innerHTML = html;
    showModal();
  }
  function openVideoModal(vid) {
    const v = VIDEOS.find(x => x.id === vid);
    if (!v) return;
    $("modalBody").innerHTML = '<span class="md-cat">🎬 '+escapeHtml(v.group)+'</span><h2 class="md-title">'+escapeHtml(v.title)+'</h2><div class="md-video"><div class="vembed"><iframe loading="lazy" src="https://www.youtube-nocookie.com/embed/'+encodeURIComponent(v.id)+'?autoplay=1" title="'+escapeHtml(v.title)+'" allow="accelerometer;autoplay;clipboard-write;encrypted-media;gyroscope;picture-in-picture" allowfullscreen></iframe></div></div><a class="md-manual" href="'+escapeHtml(v.url)+'" target="_blank" rel="noopener">YouTubeで見る ↗</a>';
    showModal();
  }
  function showModal(){ $("modalOverlay").hidden = false; document.body.style.overflow = "hidden"; }
  function closeModal(){ $("modalOverlay").hidden = true; $("modalBody").innerHTML = ""; document.body.style.overflow = ""; }

  // モバイル用の左サイドドロワー
  function openDrawer(){ $("sidebar").classList.add("open"); $("drawerBackdrop").hidden = false; document.body.style.overflow = "hidden"; }
  function closeDrawer(){ $("sidebar").classList.remove("open"); $("drawerBackdrop").hidden = true; document.body.style.overflow = ""; }
  function toggleDrawer(){ $("sidebar").classList.contains("open") ? closeDrawer() : openDrawer(); }

  function go(view) {
    closeDrawer();
    if (view === "videos") { exitSearch(); homeView.hidden = true; videoView.hidden = false; renderVideoLibrary(); window.scrollTo({top:0,behavior:"smooth"}); }
    else { $("searchInput").value=""; $("searchClear").hidden=true; exitSearch(); window.scrollTo({top:0,behavior:"smooth"}); }
  }

  function init() {
    if (!TOPICS.length) {
      $("topicGrid").innerHTML = '<p style="color:var(--ink-soft)">コンテンツを準備中です…（data.js が読み込まれていません）</p>';
    }
    renderQuickTags();
    renderSidebar();
    renderGoals();
    renderPath();
    renderTopics();

    let timer;
    $("searchInput").addEventListener("input", (e) => {
      clearTimeout(timer);
      const val = e.target.value;
      $("searchClear").hidden = !val;
      timer = setTimeout(() => doSearch(val), 120);
    });
    $("searchClear").addEventListener("click", () => { $("searchInput").value=""; $("searchClear").hidden=true; exitSearch(); });
    $("modalClose").addEventListener("click", closeModal);
    $("modalOverlay").addEventListener("click", (e) => { if (e.target === $("modalOverlay")) closeModal(); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") { closeModal(); closeDrawer(); } });
    document.querySelectorAll("[data-nav]").forEach(el => el.addEventListener("click", (e) => { e.preventDefault(); go(el.dataset.nav); }));
    // ハンバーガー → 左サイドドロワーの開閉
    $("menuToggle").addEventListener("click", toggleDrawer);
    $("drawerClose").addEventListener("click", closeDrawer);
    $("drawerBackdrop").addEventListener("click", closeDrawer);
    // ドロワー内の外部リンク(公式マニュアル)タップでも閉じる
    document.querySelectorAll(".drawer-nav .drawer-link").forEach(el => el.addEventListener("click", closeDrawer));
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", init);
  else init();
})();
