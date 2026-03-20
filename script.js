const games = [];

const gamesContainer = document.querySelector('#gamesContainer');
const detailView = document.querySelector('#detailView');
const libraryView = document.querySelector('#libraryView');
const librarySection = document.querySelector('#librarySection');
const addGameButton = document.querySelector('#addGameButton');
const heroAddGame = document.querySelector('#heroAddGame');
const jumpToLibrary = document.querySelector('#jumpToLibrary');

let activeGameId = null;
let activeRouteId = null;

function uid(prefix) {
  return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
}

function createGame() {
  return {
    id: uid('game'),
    title: '',
    summary: '',
    score: '',
    tags: '',
    repo: '',
    link: '',
    cover: '',
    routes: [],
  };
}

function createRoute() {
  return {
    id: uid('route'),
    name: '',
    summary: '',
    score: '',
    review: '',
    image: '',
  };
}

function findGame(gameId) {
  return games.find((game) => game.id === gameId);
}

function readFileAsDataUrl(file, callback) {
  const reader = new FileReader();
  reader.onload = () => callback(reader.result);
  reader.readAsDataURL(file);
}

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function getGameMeta(game) {
  const items = [];
  if (game.score.trim()) items.push(`评分 ${game.score.trim()}`);
  if (game.tags.trim()) items.push(game.tags.trim());
  return items;
}

function renderLibrary() {
  if (!games.length) {
    gamesContainer.innerHTML = `
      <div class="empty-state library-empty">
        <h3>还没有添加游戏</h3>
        <p>先从一部想记录的作品开始，慢慢把收藏整理起来。</p>
        <button class="primary-button" data-action="create-from-empty">新增游戏</button>
      </div>
    `;

    gamesContainer.querySelector('[data-action="create-from-empty"]').addEventListener('click', handleCreateGame);
    return;
  }

  gamesContainer.innerHTML = games
    .map((game) => {
      const title = game.title.trim() || '未命名游戏';
      const summary = game.summary.trim() || '还没有写简介。';
      const meta = getGameMeta(game)
        .map((item) => `<span class="meta-pill">${escapeHtml(item)}</span>`)
        .join('');

      return `
        <article class="library-card glass-inner" data-game-id="${game.id}">
          <button class="library-card-button" data-action="open-game" data-game-id="${game.id}">
            ${
              game.cover
                ? `<img class="library-cover" src="${game.cover}" alt="${escapeHtml(title)} 封面" />`
                : `<div class="library-cover placeholder-cover"><span>未设置封面</span></div>`
            }
            <div class="library-card-body">
              <h3>${escapeHtml(title)}</h3>
              <p>${escapeHtml(summary)}</p>
              <div class="library-meta">${meta || '<span class="meta-pill subtle">待补充</span>'}</div>
            </div>
          </button>
        </article>
      `;
    })
    .join('');

  gamesContainer.querySelectorAll('[data-action="open-game"]').forEach((button) => {
    button.addEventListener('click', () => openGameDetail(button.dataset.gameId));
  });
}

function renderRouteDetail(game) {
  const route = game.routes.find((item) => item.id === activeRouteId);

  if (!route) {
    return `
      <div class="empty-state route-empty">
        <h3>还没有选中角色路线</h3>
        <p>新增一条路线后，或从上方卡片中选择一位角色查看详细记录。</p>
      </div>
    `;
  }

  return `
    <section class="route-detail glass-inner">
      <div class="route-detail-header">
        <div>
          <p class="eyebrow">Route</p>
          <h3>${escapeHtml(route.name.trim() || '未命名路线')}</h3>
        </div>
        <label class="secondary-button upload-button-inline">
          更换角色图
          <input type="file" accept="image/*" data-action="upload-route-image" data-route-id="${route.id}" hidden />
        </label>
      </div>

      <div class="route-detail-grid">
        ${
          route.image
            ? `<img class="route-portrait" src="${route.image}" alt="${escapeHtml(route.name.trim() || '角色路线')} 图片" />`
            : `<div class="route-portrait placeholder-cover"><span>未设置图片</span></div>`
        }

        <div class="form-grid compact">
          <label>
            <span>路线名称</span>
            <input type="text" value="${escapeHtml(route.name)}" data-field="name" data-route-id="${route.id}" placeholder="例如：主线 / 角色名" />
          </label>
          <label>
            <span>个人评分</span>
            <input type="text" value="${escapeHtml(route.score)}" data-field="score" data-route-id="${route.id}" placeholder="例如：4.5 / 5" />
          </label>
          <label class="full-width">
            <span>一句印象</span>
            <input type="text" value="${escapeHtml(route.summary)}" data-field="summary" data-route-id="${route.id}" placeholder="写一句简短印象即可" />
          </label>
          <label class="full-width">
            <span>路线感想</span>
            <textarea rows="8" data-field="review" data-route-id="${route.id}" placeholder="记录你想留下的内容。">${escapeHtml(route.review)}</textarea>
          </label>
        </div>
      </div>
    </section>
  `;
}

function renderDetail() {
  const game = findGame(activeGameId);
  if (!game) {
    detailView.classList.add('hidden');
    libraryView.classList.remove('hidden');
    return;
  }

  libraryView.classList.add('hidden');
  detailView.classList.remove('hidden');

  const routeCards = game.routes.length
    ? game.routes
        .map((route) => `
          <button class="route-card ${route.id === activeRouteId ? 'is-active' : ''}" data-action="select-route" data-route-id="${route.id}">
            ${
              route.image
                ? `<img class="route-card-thumb" src="${route.image}" alt="${escapeHtml(route.name.trim() || '角色路线')} 缩略图" />`
                : `<div class="route-card-thumb placeholder-cover"><span>路线</span></div>`
            }
            <div class="route-card-body">
              <strong>${escapeHtml(route.name.trim() || '未命名路线')}</strong>
              <span>${escapeHtml(route.summary.trim() || '还没有写简介。')}</span>
            </div>
          </button>
        `)
        .join('')
    : `
      <div class="empty-state routes-empty">
        <h3>还没有角色路线</h3>
        <p>可以先添加一条路线，再继续补充角色评价。</p>
      </div>
    `;

  detailView.innerHTML = `
    <div class="detail-header">
      <button class="secondary-button" data-action="back-to-library">返回游戏库</button>
      <button class="secondary-button danger-button" data-action="remove-game">删除这部游戏</button>
    </div>

    <article class="detail-layout">
      <section class="detail-main">
        <div class="detail-cover-block glass-inner">
          ${
            game.cover
              ? `<img class="detail-cover" src="${game.cover}" alt="${escapeHtml(game.title.trim() || '游戏')} 封面" />`
              : `<div class="detail-cover placeholder-cover"><span>未设置封面</span></div>`
          }
          <label class="secondary-button upload-button-inline wide-button">
            上传封面
            <input type="file" accept="image/*" data-action="upload-game-cover" hidden />
          </label>
        </div>

        <section class="glass-inner detail-form-panel">
          <div class="section-heading compact-heading">
            <div>
              <p class="eyebrow">Game</p>
              <h2>${escapeHtml(game.title.trim() || '游戏详情')}</h2>
            </div>
          </div>

          <div class="form-grid">
            <label>
              <span>游戏名</span>
              <input type="text" value="${escapeHtml(game.title)}" data-field="title" placeholder="输入游戏名" />
            </label>
            <label>
              <span>个人评分</span>
              <input type="text" value="${escapeHtml(game.score)}" data-field="score" placeholder="例如：8.5 / 10" />
            </label>
            <label class="full-width">
              <span>简短标签</span>
              <input type="text" value="${escapeHtml(game.tags)}" data-field="tags" placeholder="例如：悬疑、共通线出色、最爱角色待定" />
            </label>
            <label class="full-width">
              <span>一句介绍</span>
              <input type="text" value="${escapeHtml(game.summary)}" data-field="summary" placeholder="写一句你愿意放在列表页的简介" />
            </label>
            <label class="full-width">
              <span>Bangumi 链接</span>
              <input type="url" value="${escapeHtml(game.link)}" data-field="link" placeholder="可选：贴上作品条目链接" />
            </label>
            <label class="full-width">
              <span>观后感 / repo</span>
              <textarea rows="8" data-field="repo" placeholder="记录你真正想留下的感受。">${escapeHtml(game.repo)}</textarea>
            </label>
          </div>

          ${
            game.link.trim()
              ? `<a class="text-link" href="${escapeHtml(game.link)}" target="_blank" rel="noreferrer">打开作品链接</a>`
              : ''
          }
        </section>
      </section>

      <aside class="detail-side">
        <section class="glass-inner routes-panel">
          <div class="section-heading compact-heading">
            <div>
              <p class="eyebrow">Routes</p>
              <h3>角色路线</h3>
            </div>
            <button class="primary-button small-button" data-action="add-route">新增路线</button>
          </div>
          <div class="route-list">${routeCards}</div>
        </section>

        ${renderRouteDetail(game)}
      </aside>
    </article>
  `;

  detailView.querySelector('[data-action="back-to-library"]').addEventListener('click', closeDetail);
  detailView.querySelector('[data-action="remove-game"]').addEventListener('click', () => removeGame(game.id));
  detailView.querySelector('[data-action="add-route"]').addEventListener('click', () => addRoute(game.id));

  detailView.querySelectorAll('.detail-form-panel [data-field]').forEach((field) => {
    field.addEventListener('input', (event) => updateGameField(game.id, event.target.dataset.field, event.target.value));
  });

  detailView.querySelectorAll('[data-action="select-route"]').forEach((button) => {
    button.addEventListener('click', () => selectRoute(game.id, button.dataset.routeId));
  });

  detailView.querySelector('[data-action="upload-game-cover"]').addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (!file) return;
    readFileAsDataUrl(file, (result) => {
      game.cover = result;
      renderAll();
    });
  });

  detailView.querySelectorAll('[data-route-id][data-field]').forEach((field) => {
    field.addEventListener('input', (event) => {
      updateRouteField(game.id, event.target.dataset.routeId, event.target.dataset.field, event.target.value);
    });
  });

  const routeImageInput = detailView.querySelector('[data-action="upload-route-image"]');
  if (routeImageInput) {
    routeImageInput.addEventListener('change', (event) => {
      const [file] = event.target.files || [];
      const routeId = event.target.dataset.routeId;
      if (!file || !routeId) return;
      readFileAsDataUrl(file, (result) => {
        updateRouteField(game.id, routeId, 'image', result);
      });
    });
  }
}

function renderAll() {
  renderLibrary();
  renderDetail();
}

function handleCreateGame() {
  const game = createGame();
  games.unshift(game);
  activeGameId = game.id;
  activeRouteId = null;
  renderAll();
}

function openGameDetail(gameId) {
  activeGameId = gameId;
  const game = findGame(gameId);
  activeRouteId = game?.routes[0]?.id || null;
  renderAll();
}

function closeDetail() {
  activeGameId = null;
  activeRouteId = null;
  renderAll();
  librarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function updateGameField(gameId, field, value) {
  const game = findGame(gameId);
  if (!game) return;
  game[field] = value;
  renderLibrary();

  if (field === 'title') {
    const heading = detailView.querySelector('.detail-form-panel h2');
    if (heading) heading.textContent = value.trim() || '游戏详情';
  }
}

function addRoute(gameId) {
  const game = findGame(gameId);
  if (!game) return;
  const route = createRoute();
  game.routes.unshift(route);
  activeRouteId = route.id;
  renderAll();
}

function selectRoute(gameId, routeId) {
  activeGameId = gameId;
  activeRouteId = routeId;
  renderDetail();
}

function updateRouteField(gameId, routeId, field, value) {
  const game = findGame(gameId);
  const route = game?.routes.find((item) => item.id === routeId);
  if (!route) return;
  route[field] = value;

  if (field === 'image') {
    renderDetail();
    return;
  }

  const activeHeading = detailView.querySelector('.route-detail h3');
  if (field === 'name' && activeHeading && routeId === activeRouteId) {
    activeHeading.textContent = value.trim() || '未命名路线';
  }

  const routeCard = detailView.querySelector(`[data-action="select-route"][data-route-id="${routeId}"]`);
  if (routeCard) {
    const title = routeCard.querySelector('strong');
    const summary = routeCard.querySelector('span');
    if (field === 'name' && title) title.textContent = value.trim() || '未命名路线';
    if (field === 'summary' && summary) summary.textContent = value.trim() || '还没有写简介。';
  }
}

function removeGame(gameId) {
  const index = games.findIndex((game) => game.id === gameId);
  if (index === -1) return;
  games.splice(index, 1);
  activeGameId = null;
  activeRouteId = null;
  renderAll();
}

addGameButton.addEventListener('click', handleCreateGame);
heroAddGame.addEventListener('click', handleCreateGame);
jumpToLibrary.addEventListener('click', () => {
  librarySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
});

renderAll();
