(function () {
  var CONFIG = window.CIDIAN_CONFIG || {};
  var SESSION_KEY = "cidian.session";
  var CACHE_KEY = "cidian.entries";
  var TAGS = ["感", "联", "疑", "用", "争", "变"];
  var entries = [];
  var signedIn = false;
  var editing = null;
  var openNoteFor = null;
  var noteDrafts = {};
  var confirmDelete = false;
  var collator = new Intl.Collator("zh-Hans-CN");

  var $ = function (id) { return document.getElementById(id); };
  function el(tag, cls, text) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }

  var statusTimer;
  function say(msg) {
    var s = $("status");
    s.textContent = msg;
    s.hidden = false;
    clearTimeout(statusTimer);
    statusTimer = setTimeout(function () { s.hidden = true; }, 3200);
  }
  function writeError(e) {
    if (e && e.code === "auth") say("登录过期了，重新登录后再写。");
    else say("没连上网络，这次没存上。写的内容还在，等会儿再点一次。");
  }

  function letterOf(e) {
    var p = (e.pinyin || "").normalize("NFD").replace(/[̀-ͯ]/g, "").trim();
    var c = p.charAt(0).toUpperCase();
    return /[A-Z]/.test(c) ? c : "";
  }
  function sorted() {
    return entries.slice().sort(function (a, b) {
      var la = letterOf(a), lb = letterOf(b);
      if (la !== lb) {
        if (!la) return 1;
        if (!lb) return -1;
        return la < lb ? -1 : 1;
      }
      return collator.compare(a.word || "", b.word || "");
    });
  }

  function renderNote(n) {
    var p = el("p", "note");
    if (n.tag) p.appendChild(el("span", "note-tag", n.tag));
    p.appendChild(el("span", "note-text", n.text || ""));
    var sign = n.by || "";
    if (n.tag === "变" && n.at) {
      var d = new Date(n.at);
      if (!isNaN(d)) sign += "，" + d.getFullYear() + " 年 " + (d.getMonth() + 1) + " 月 " + d.getDate() + " 日";
    }
    p.appendChild(el("span", "note-by", sign));
    return p;
  }

  function renderNoteForm(e) {
    var form = el("form", "note-form");
    var saved = noteDrafts[e.id] || {};
    var tags = el("div", "tags");
    tags.setAttribute("role", "group");
    tags.setAttribute("aria-label", "旁批角度");
    TAGS.forEach(function (t, i) {
      var label = el("label");
      var r = document.createElement("input");
      r.type = "radio";
      r.name = "tag-" + e.id;
      r.id = "tag-" + e.id + "-" + i;
      r.value = t;
      if ((saved.tag || "感") === t) r.checked = true;
      label.appendChild(r);
      label.appendChild(el("span", "", t));
      tags.appendChild(label);
    });
    form.appendChild(tags);
    var ta = document.createElement("textarea");
    ta.id = "note-" + e.id;
    ta.rows = 3;
    ta.maxLength = 300;
    ta.required = true;
    ta.setAttribute("aria-label", "旁批内容");
    ta.value = saved.text || "";
    ta.addEventListener("input", function () {
      noteDrafts[e.id] = noteDrafts[e.id] || {};
      noteDrafts[e.id].text = ta.value;
    });
    form.addEventListener("change", function (ev) {
      if (ev.target.type === "radio") {
        noteDrafts[e.id] = noteDrafts[e.id] || {};
        noteDrafts[e.id].tag = ev.target.value;
      }
    });
    form.appendChild(ta);
    var row = el("div", "form-row");
    var ok = el("button", "btn", "批上去");
    ok.type = "submit";
    var no = el("button", "btn quiet", "收起");
    no.type = "button";
    no.addEventListener("click", function () { openNoteFor = null; render(); });
    row.appendChild(ok);
    row.appendChild(no);
    form.appendChild(row);
    form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var text = ta.value.trim();
      if (!text) return;
      var checked = form.querySelector("input:checked");
      var notes = (e.notes || []).concat([{
        tag: checked ? checked.value : "",
        by: "夜猫子",
        text: text,
        at: new Date().toISOString()
      }]);
      ok.disabled = true;
      store.update(e.id, { notes: notes }).then(function () {
        delete noteDrafts[e.id];
        openNoteFor = null;
        render();
        say("批上去了。");
      }).catch(function (err) { ok.disabled = false; writeError(err); });
    });
    return form;
  }

  function renderEntry(e) {
    var art = el("article", "entry");
    art.id = "e-" + e.id;
    var body = el("div", "entry-body");
    var head = el("h2", "headline");
    head.appendChild(el("span", "word", e.word || ""));
    if (e.pinyin) head.appendChild(el("span", "pinyin", e.pinyin));
    if (e.pos) head.appendChild(el("span", "pos", e.pos));
    if ((e.notes || []).some(function (n) { return n.tag === "争"; })) head.appendChild(el("span", "disputed", "此处存在争议"));
    body.appendChild(head);
    body.appendChild(el("p", "def", e.def || ""));
    if (e.example) {
      var ex = el("p", "example");
      ex.appendChild(el("span", "mark", "例　"));
      ex.appendChild(document.createTextNode(e.example));
      body.appendChild(ex);
    }
    if (e.source) {
      var so = el("p", "source");
      so.appendChild(el("span", "mark", "【出处】"));
      so.appendChild(document.createTextNode(e.source));
      body.appendChild(so);
    }
    var tools = el("div", "entry-tools");
    var change = el("button", "linkish", "改这一条");
    change.type = "button";
    change.addEventListener("click", function () { openEditor(e); });
    tools.appendChild(change);
    body.appendChild(tools);
    art.appendChild(body);

    var margin = el("aside", "margin");
    margin.setAttribute("aria-label", "旁批");
    (e.notes || []).forEach(function (n) { margin.appendChild(renderNote(n)); });
    if (openNoteFor === e.id) {
      margin.appendChild(renderNoteForm(e));
    } else {
      var w = el("div");
      var write = el("button", "linkish", "写一条旁批");
      write.type = "button";
      write.addEventListener("click", function () {
        openNoteFor = e.id;
        render();
        var t = $("note-" + e.id);
        if (t) t.focus();
      });
      w.appendChild(write);
      margin.appendChild(w);
    }
    art.appendChild(margin);
    return art;
  }

  function todayEntry(list) {
    var d = new Date();
    var key = d.getFullYear() + "-" + (d.getMonth() + 1) + "-" + d.getDate();
    var h = 0;
    for (var i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
    return list[h % list.length];
  }

  var todayTarget = null;
  function render() {
    var list = sorted();
    var book = $("book");
    var scrollY = window.scrollY;
    book.textContent = "";
    $("random").disabled = list.length < 1;
    $("add").disabled = !signedIn;
    if (!list.length) {
      $("span-words").textContent = "还没有词条";
      $("today").hidden = true;
      book.appendChild(el("p", "state", "词典还是空的。点“加一个词”，写下你们之间的第一个词。"));
      return;
    }
    var first = list[0].word, last = list[list.length - 1].word;
    $("span-words").textContent = list.length === 1 ? first : first + " — " + last;
    $("edition").textContent = "第一版，收词 " + list.length + " 条，按音序排列。词条里的“我”是小克，“你”是夜猫子。";
    todayTarget = todayEntry(list);
    $("today-word").textContent = todayTarget.word;
    $("today").hidden = false;
    var current = null;
    list.forEach(function (e) {
      var l = letterOf(e) || "待注音";
      if (l !== current) {
        current = l;
        book.appendChild(el("div", "letter", l));
      }
      book.appendChild(renderEntry(e));
    });
    window.scrollTo(0, scrollY);
  }

  function goTo(id) {
    var node = $("e-" + id);
    if (!node) return;
    var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    node.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    node.classList.remove("flash");
    void node.offsetWidth;
    node.classList.add("flash");
  }

  var lastRandom = null;
  $("random").addEventListener("click", function () {
    var pool = entries.filter(function (e) { return e.id !== lastRandom; });
    if (!pool.length) pool = entries;
    var pick = pool[Math.floor(Math.random() * pool.length)];
    lastRandom = pick.id;
    goTo(pick.id);
  });
  $("today-word").addEventListener("click", function () {
    if (todayTarget) goTo(todayTarget.id);
  });

  function openEditor(e) {
    editing = e || null;
    confirmDelete = false;
    $("editor-title").textContent = e ? "改“" + e.word + "”" : "加一个词";
    $("f-word").value = e ? e.word || "" : "";
    $("f-pinyin").value = e ? e.pinyin || "" : "";
    $("f-pos").value = e ? e.pos || "" : "";
    $("f-def").value = e ? e.def || "" : "";
    $("f-example").value = e ? e.example || "" : "";
    $("f-source").value = e ? e.source || "" : "";
    $("save").textContent = e ? "改好了" : "收进词典";
    $("delete").hidden = !e;
    $("delete").textContent = "删掉这条";
    $("editor").showModal();
  }
  $("add").addEventListener("click", function () { openEditor(null); });
  $("cancel").addEventListener("click", function () { $("editor").close(); });
  $("delete").addEventListener("click", function () {
    if (!editing) return;
    if (!confirmDelete) {
      confirmDelete = true;
      $("delete").textContent = "再点一次就删了";
      return;
    }
    var word = editing.word;
    store.remove(editing.id).then(function () {
      $("editor").close();
      say("“" + word + "”删掉了。");
    }).catch(writeError);
  });
  $("entry-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var word = $("f-word").value.trim();
    var def = $("f-def").value.trim();
    if (!word || !def) return;
    var data = {
      word: word,
      pinyin: $("f-pinyin").value.trim(),
      pos: $("f-pos").value.trim(),
      def: def,
      example: $("f-example").value.trim(),
      source: $("f-source").value.trim()
    };
    var save = $("save");
    save.disabled = true;
    if (!editing) data.notes = [];
    var job = editing ? store.update(editing.id, data) : store.create(data);
    var isNew = !editing;
    job.then(function (row) {
      save.disabled = false;
      $("editor").close();
      say(isNew ? "“" + word + "”收进词典了。" : "改好了。");
      if (isNew) setTimeout(function () { goTo(row.id); }, 80);
    }).catch(function (err) { save.disabled = false; writeError(err); });
  });

  function showState(msg) {
    var book = $("book");
    book.textContent = "";
    book.appendChild(el("p", "state", msg));
  }

  /* 数据层：直接调用 Supabase 的接口，不依赖外部脚本 */
  function readSession() {
    try { return JSON.parse(localStorage.getItem(SESSION_KEY)); } catch (e) { return null; }
  }
  function writeSession(s) {
    try {
      if (s) localStorage.setItem(SESSION_KEY, JSON.stringify(s));
      else localStorage.removeItem(SESSION_KEY);
    } catch (e) { /* 存不了也能用，只是下次要重新登录 */ }
  }
  function readCache() {
    try { return JSON.parse(localStorage.getItem(CACHE_KEY)) || []; } catch (e) { return []; }
  }
  function writeCache() {
    try { localStorage.setItem(CACHE_KEY, JSON.stringify(entries)); } catch (e) { /* 只影响离线查看 */ }
  }
  function authError() { var e = new Error("auth"); e.code = "auth"; return e; }

  function sessionFrom(json) {
    return {
      access: json.access_token,
      refresh: json.refresh_token,
      expires: Date.now() + (json.expires_in || 3600) * 1000
    };
  }
  function authRequest(grant, body) {
    return fetch(CONFIG.url + "/auth/v1/token?grant_type=" + grant, {
      method: "POST",
      headers: { apikey: CONFIG.key, "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
  }
  var refreshing = null;
  function refreshSession() {
    if (refreshing) return refreshing;
    var s = readSession();
    if (!s || !s.refresh) return Promise.reject(authError());
    refreshing = authRequest("refresh_token", { refresh_token: s.refresh }).then(function (res) {
      if (res.status >= 400 && res.status < 500) throw authError();
      if (!res.ok) throw new Error("network");
      return res.json();
    }).then(function (json) {
      var next = sessionFrom(json);
      writeSession(next);
      return next;
    });
    refreshing.then(clearRefresh, clearRefresh);
    return refreshing;
  }
  function clearRefresh() { refreshing = null; }
  function validSession() {
    var s = readSession();
    if (!s) return Promise.reject(authError());
    if (s.expires - Date.now() > 60000) return Promise.resolve(s);
    return refreshSession();
  }
  function api(path, options, retried) {
    return validSession().then(function (s) {
      var headers = Object.assign({
        apikey: CONFIG.key,
        Authorization: "Bearer " + s.access,
        "Content-Type": "application/json"
      }, (options && options.headers) || {});
      return fetch(CONFIG.url + "/rest/v1/" + path, Object.assign({}, options, { headers: headers }));
    }).then(function (res) {
      if (res.status === 401 && !retried) {
        return refreshSession().then(function () { return api(path, options, true); });
      }
      if (res.status === 401 || res.status === 403) throw authError();
      if (!res.ok) throw new Error("request " + res.status);
      return res.status === 204 ? null : res.json();
    }).catch(function (e) {
      if (e && e.code === "auth") needLogin();
      throw e;
    });
  }
  function replaceLocal(row) {
    var found = false;
    entries = entries.map(function (x) {
      if (x.id === row.id) { found = true; return row; }
      return x;
    });
    if (!found) entries.push(row);
    writeCache();
    render();
    return row;
  }
  var RETURN = { headers: { Prefer: "return=representation" } };
  var store = {
    list: function () { return api("entries?select=*"); },
    create: function (data) {
      return api("entries", Object.assign({}, RETURN, { method: "POST", body: JSON.stringify(data) }))
        .then(function (rows) { return replaceLocal(rows[0]); });
    },
    update: function (id, data) {
      return api("entries?id=eq." + encodeURIComponent(id), Object.assign({}, RETURN, { method: "PATCH", body: JSON.stringify(data) }))
        .then(function (rows) { return replaceLocal(rows[0]); });
    },
    remove: function (id) {
      return api("entries?id=eq." + encodeURIComponent(id), { method: "DELETE" }).then(function () {
        entries = entries.filter(function (x) { return x.id !== id; });
        writeCache();
        render();
      });
    }
  };

  /* 和小克合写：词条复制出去，小克写的贴回来。贴回来的内容署名小克，只新增，不改已有内容。 */
  function exportText() {
    var lines = ["《小克与夜猫子词典》，共 " + entries.length + " 条。词条里的“我”是小克，“你”是夜猫子。", ""];
    sorted().forEach(function (e) {
      lines.push(e.word + (e.pinyin ? "（" + e.pinyin + "）" : "") + (e.pos ? " [" + e.pos + "]" : ""));
      lines.push("释义：" + (e.def || ""));
      if (e.example) lines.push("例句：" + e.example);
      if (e.source) lines.push("出处：" + e.source);
      (e.notes || []).forEach(function (n) {
        lines.push("旁批：" + (n.tag ? n.tag + "：" : "") + n.text + "（" + (n.by || "") + "）");
      });
      lines.push("");
    });
    lines.push("小克，看完后如果想新增词条或写旁批，请回复一段这个格式的 JSON，我贴回词典。");
    lines.push("add 是新词，notes 是旁批，word 要和已有词条一字不差，tag 从 感、联、疑、用、争、变 里选，争 是有异议，变 是这个词的意思变了：");
    lines.push('{"add":[{"word":"","pinyin":"","pos":"","def":"","example":"","source":""}],"notes":[{"word":"","tag":"","text":""}]}');
    return lines.join("\n");
  }
  $("copy-all").addEventListener("click", function () {
    var text = exportText();
    function manual() {
      $("c-text").value = text;
      $("copy-box").showModal();
      $("c-text").select();
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(function () {
        say("复制好了，" + entries.length + " 条。发给小克吧。");
      }).catch(manual);
    } else {
      manual();
    }
  });
  $("c-close").addEventListener("click", function () { $("copy-box").close(); });

  function str(v, max) { return typeof v === "string" ? v.trim().slice(0, max) : ""; }
  function parsePaste(raw) {
    var plan = { add: [], notes: [], problems: [] };
    var start = raw.indexOf("{"), end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) { plan.problems.push("没找到小克写的内容，要把那段 JSON 也贴进来。"); return plan; }
    var data;
    try { data = JSON.parse(raw.slice(start, end + 1)); }
    catch (e) { plan.problems.push("这段内容格式不对，可能没复制完整。"); return plan; }
    var known = {};
    entries.forEach(function (e) { known[e.word] = e; });
    (Array.isArray(data.add) ? data.add : []).forEach(function (a) {
      var word = str(a && a.word, 40), def = str(a && a.def, 400);
      if (!word && !def) return;
      if (!word || !def) { plan.problems.push("有一个新词缺词或释义，跳过了。"); return; }
      if (known[word]) { plan.problems.push("“" + word + "”已经有了，没重复收。"); return; }
      known[word] = { pending: true };
      plan.add.push({
        word: word, pinyin: str(a.pinyin, 60), pos: str(a.pos, 12), def: def,
        example: str(a.example, 200), source: str(a.source, 400), notes: []
      });
    });
    (Array.isArray(data.notes) ? data.notes : []).forEach(function (n) {
      var word = str(n && n.word, 40), text = str(n && n.text, 300);
      if (!word && !text) return;
      if (!text) return;
      var target = known[word];
      if (!target || target.pending) { plan.problems.push("词典里没有“" + word + "”，这条旁批没地方写。"); return; }
      var exists = (target.notes || []).some(function (x) { return x.by === "小克" && x.text === text; });
      if (exists) { plan.problems.push("“" + word + "”下面已经有这条旁批了。"); return; }
      var tag = str(n.tag, 2);
      plan.notes.push({ id: target.id, word: word, tag: TAGS.indexOf(tag) >= 0 ? tag : "", text: text });
    });
    return plan;
  }
  var pastePlan = null;
  function showPlan() {
    var box = $("p-preview");
    box.textContent = "";
    var raw = $("p-text").value.trim();
    pastePlan = raw ? parsePaste(raw) : null;
    $("p-save").disabled = !pastePlan || !(pastePlan.add.length || pastePlan.notes.length);
    if (!pastePlan) return;
    if (pastePlan.add.length) box.appendChild(el("span", "", "新词 " + pastePlan.add.length + " 个：" + pastePlan.add.map(function (a) { return a.word; }).join("、")));
    if (pastePlan.notes.length) box.appendChild(el("span", "", "旁批 " + pastePlan.notes.length + " 条，写在：" + pastePlan.notes.map(function (n) { return n.word; }).join("、")));
    pastePlan.problems.forEach(function (p) { box.appendChild(el("span", "bad", p)); });
  }
  $("p-text").addEventListener("input", showPlan);
  $("open-paste").addEventListener("click", function () {
    $("p-text").value = "";
    showPlan();
    $("paste-box").showModal();
  });
  $("p-cancel").addEventListener("click", function () { $("paste-box").close(); });
  $("paste-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    if (!pastePlan) return;
    var plan = pastePlan;
    var btn = $("p-save");
    btn.disabled = true;
    var byEntry = {};
    plan.notes.forEach(function (n) { (byEntry[n.id] = byEntry[n.id] || []).push(n); });
    var now = new Date().toISOString();
    var jobs = plan.add.map(function (a) { return function () { return store.create(a); }; });
    Object.keys(byEntry).forEach(function (id) {
      jobs.push(function () {
        var current = entries.filter(function (x) { return x.id === id; })[0];
        if (!current) return Promise.resolve();
        var added = byEntry[id].map(function (n) { return { tag: n.tag, by: "小克", text: n.text, at: now }; });
        return store.update(id, { notes: (current.notes || []).concat(added) });
      });
    });
    var done = 0;
    jobs.reduce(function (chain, job) {
      return chain.then(job).then(function () { done++; });
    }, Promise.resolve()).then(function () {
      $("paste-box").close();
      say("收好了。");
    }).catch(function (err) {
      /* 已经写好的部分不要再写一遍：重新计算还没收的内容 */
      showPlan();
      writeError(err);
    });
  });

  function showBook(on) {
    $("gate").hidden = on;
    $("book").hidden = !on;
    $("foot").hidden = !on;
    document.querySelector(".running-head").hidden = !on;
  }
  function needLogin() {
    signedIn = false;
    showBook(false);
    var d = $("editor");
    if (d.open) d.close();
  }

  var fetching = false;
  function pull(announce) {
    if (fetching) return;
    fetching = true;
    store.list().then(function (rows) {
      fetching = false;
      entries = rows;
      writeCache();
      render();
    }).catch(function (e) {
      fetching = false;
      if (e && e.code === "auth") return;
      if (entries.length) {
        if (announce) say("没连上网络，看到的是上次的内容。");
      } else {
        showState("没连上网络，也还没有存过内容。联网后再打开一次。");
        $("span-words").textContent = "暂时翻不开";
      }
    });
  }

  $("login-form").addEventListener("submit", function (ev) {
    ev.preventDefault();
    var btn = $("login-btn");
    var err = $("login-err");
    err.textContent = "";
    btn.disabled = true;
    authRequest("password", {
      email: $("l-email").value.trim(),
      password: $("l-password").value
    }).then(function (res) {
      if (res.status >= 400 && res.status < 500) {
        err.textContent = "邮箱或密码不对，再看一下。";
        return null;
      }
      if (!res.ok) throw new Error("network");
      return res.json();
    }).then(function (json) {
      btn.disabled = false;
      if (!json) return;
      writeSession(sessionFrom(json));
      $("l-password").value = "";
      open();
    }).catch(function () {
      btn.disabled = false;
      err.textContent = "没连上网络，等信号好一点再试。";
    });
  });

  $("logout").addEventListener("click", function () {
    writeSession(null);
    try { localStorage.removeItem(CACHE_KEY); } catch (e) { /* 忽略 */ }
    entries = [];
    needLogin();
  });

  function open() {
    signedIn = true;
    showBook(true);
    entries = readCache();
    if (entries.length) render();
    $("add").disabled = false;
    pull(true);
  }

  function start() {
    var standalone = window.navigator.standalone || window.matchMedia("(display-mode: standalone)").matches;
    $("install").hidden = !!standalone || !/iPhone|iPad/.test(navigator.userAgent);
    if (!CONFIG.url || !CONFIG.key) {
      showState("词典还没连上数据库。");
      $("span-words").textContent = "暂时翻不开";
      return;
    }
    if (readSession()) open();
    else needLogin();
    document.addEventListener("visibilitychange", function () {
      if (!document.hidden && signedIn && !$("editor").open && !openNoteFor) pull(false);
    });
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("sw.js").catch(function () { /* 没有离线缓存也能正常用 */ });
    }
  }
  start();
})();
