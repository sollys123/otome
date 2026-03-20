const ratingCategories = ['综合', '剧情', '感情', '文笔', '人设', '趣味性', '深度'];

const bangumiFixtures = {
  game: [
    {
      title: 'Collar×Malice',
      subtitle: '悬疑 × 都会 × 乙女游戏',
      image:
        'https://images.unsplash.com/photo-1512149673953-1e251807ec4a?auto=format&fit=crop&w=600&q=80',
      url: 'https://bgm.tv/subject_search/Collar%20Malice?cat=4',
    },
    {
      title: 'Cupid Parasite',
      subtitle: '恋爱喜剧 × 时髦霓虹',
      image:
        'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=600&q=80',
      url: 'https://bgm.tv/subject_search/Cupid%20Parasite?cat=4',
    },
    {
      title: 'Code:Realize',
      subtitle: '蒸汽朋克 × 冒险',
      image:
        'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=600&q=80',
      url: 'https://bgm.tv/subject_search/Code%20Realize?cat=4',
    },
  ],
  character: [
    {
      title: '笹塚尊',
      subtitle: 'Collar×Malice',
      image:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80',
      url: 'https://bgm.tv/character?search=%E7%AC%B9%E5%A1%9A%E5%B0%8A',
    },
    {
      title: '白石景之',
      subtitle: 'Collar×Malice',
      image:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=500&q=80',
      url: 'https://bgm.tv/character?search=%E7%99%BD%E7%9F%B3%E6%99%AF%E4%B9%8B',
    },
    {
      title: 'Gill Lovecraft',
      subtitle: 'Cupid Parasite',
      image:
        'https://images.unsplash.com/photo-1507591064344-4c6ce005b128?auto=format&fit=crop&w=500&q=80',
      url: 'https://bgm.tv/character?search=Gill%20Lovecraft',
    },
  ],
  avatar: [
    {
      title: '糖果粉头像',
      subtitle: '可作为站点头像示意',
      image:
        'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=500&q=80',
      url: 'https://bgm.tv',
    },
    {
      title: '紫雾头像',
      subtitle: '轻透明氛围',
      image:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=500&q=80',
      url: 'https://bgm.tv',
    },
  ],
};

const gameTemplate = document.querySelector('#gameTemplate');
const characterTemplate = document.querySelector('#characterTemplate');
const gamesContainer = document.querySelector('#gamesContainer');
const bgmModal = document.querySelector('#bgmModal');
const bgmResults = document.querySelector('#bgmResults');
const bgmSearchInput = document.querySelector('#bgmSearchInput');
const bgmSearchLink = document.querySelector('#bgmSearchLink');
const uploadFallback = document.querySelector('#uploadFallback');
const bgmFallbackUpload = document.querySelector('#bgmFallbackUpload');
const modalTitle = document.querySelector('#modalTitle');

let currentPickerContext = null;

function createStars(container) {
  ratingCategories.forEach((category) => {
    const item = document.createElement('div');
    item.className = 'rating-card';

    const label = document.createElement('div');
    label.className = 'rating-label';
    label.textContent = category;

    const stars = document.createElement('div');
    stars.className = 'stars';

    for (let i = 1; i <= 5; i += 1) {
      const button = document.createElement('button');
      button.type = 'button';
      button.className = 'star-button';
      button.textContent = '★';
      button.dataset.value = String(i);
      button.addEventListener('click', () => {
        [...stars.children].forEach((star, index) => {
          star.classList.toggle('active', index < i);
        });
      });
      stars.appendChild(button);
    }

    item.append(label, stars);
    container.appendChild(item);
  });
}

function previewImage(file, img) {
  const reader = new FileReader();
  reader.onload = (event) => {
    img.src = event.target?.result;
  };
  reader.readAsDataURL(file);
}

function bindSingleUpload(input, img) {
  input.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (file) previewImage(file, img);
  });
}

function createGalleryPreview(file) {
  const card = document.createElement('div');
  card.className = 'preview-card';

  const thumb = document.createElement('div');
  thumb.className = 'preview-thumb';
  const image = document.createElement('img');
  image.className = 'preview-image';
  image.alt = file.name;
  thumb.appendChild(image);

  const meta = document.createElement('div');
  meta.className = 'preview-meta';
  const title = document.createElement('strong');
  title.textContent = file.name;
  const input = document.createElement('textarea');
  input.className = 'comment-input';
  input.rows = 3;
  input.placeholder = '给这张图写评论、记录名场面或台词感想。';
  meta.append(title, input);

  card.append(thumb, meta);
  previewImage(file, image);
  return card;
}

function bindGalleryUpload(input, list) {
  input.addEventListener('change', (event) => {
    const files = [...(event.target.files || [])];
    if (!files.length) return;
    list.classList.remove('empty-state');
    if (list.dataset.placeholder === 'true') list.innerHTML = '';
    list.dataset.placeholder = 'false';
    files.forEach((file) => list.appendChild(createGalleryPreview(file)));
  });
}

function openPicker(type, context) {
  currentPickerContext = { type, context };
  modalTitle.textContent =
    type === 'game' ? '从 Bangumi 游戏库选择封面' : type === 'character' ? '从 Bangumi 角色库选择立绘' : '选择站点头像';
  bgmSearchInput.value = '';
  bgmSearchLink.href =
    type === 'character'
      ? 'https://bgm.tv/character'
      : type === 'game'
        ? 'https://bgm.tv/subject_search?cat=4'
        : 'https://bgm.tv';
  renderBangumiResults(type);
  switchPickerSource('bangumi');
  bgmModal.showModal();
}

function switchPickerSource(source) {
  document.querySelectorAll('.tab-button').forEach((button) => {
    button.classList.toggle('active', button.dataset.source === source);
  });
  bgmResults.classList.toggle('hidden', source !== 'bangumi');
  uploadFallback.classList.toggle('hidden', source !== 'upload');
}

function applyBangumiSelection(item) {
  if (!currentPickerContext) return;

  const { type, context } = currentPickerContext;
  if (type === 'avatar') {
    context.image.src = item.image;
  } else {
    context.image.src = item.image;
    context.link.href = item.url;
    context.link.textContent = `查看 Bangumi ${type === 'game' ? '条目' : '角色条目'}`;
    if (context.titleInput && !context.titleInput.value.trim()) {
      context.titleInput.value = item.title;
    }
  }
  bgmModal.close();
}

function renderBangumiResults(type, keyword = '') {
  bgmResults.innerHTML = '';
  const pool = bangumiFixtures[type] || [];
  const filtered = pool.filter((item) => `${item.title} ${item.subtitle}`.toLowerCase().includes(keyword.toLowerCase()));

  if (!filtered.length) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.textContent = '没有匹配到示例结果。你仍然可以点击上方按钮打开 Bangumi 搜索，或切换到自己上传。';
    bgmResults.appendChild(empty);
    return;
  }

  filtered.forEach((item) => {
    const card = document.createElement('div');
    card.className = 'bgm-result-card';

    const image = document.createElement('img');
    image.className = 'bgm-result-thumb';
    image.src = item.image;
    image.alt = item.title;

    const text = document.createElement('div');
    text.innerHTML = `<strong>${item.title}</strong><p class="muted">${item.subtitle}</p>`;

    const action = document.createElement('button');
    action.type = 'button';
    action.className = 'primary-button small';
    action.textContent = '选择';
    action.addEventListener('click', () => applyBangumiSelection(item));

    card.append(image, text, action);
    bgmResults.appendChild(card);
  });
}

function createCharacterCard(name = '') {
  const fragment = characterTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.character-card');
  const image = fragment.querySelector('.character-image');
  const link = fragment.querySelector('.bangumi-link');
  const titleInput = fragment.querySelector('.character-name');
  const ratings = fragment.querySelector('.character-ratings');
  const uploadInput = fragment.querySelector('.character-upload');
  const cgUpload = fragment.querySelector('.cg-upload');
  const dialogueUpload = fragment.querySelector('.dialogue-upload');
  const cgList = fragment.querySelector('.cg-list');
  const dialogueList = fragment.querySelector('.dialogue-list');
  const pickerButton = fragment.querySelector('[data-open-bgm]');

  titleInput.value = name;
  image.src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=500&q=80';
  link.href = 'https://bgm.tv/character';
  createStars(ratings);
  bindSingleUpload(uploadInput, image);
  bindGalleryUpload(cgUpload, cgList);
  bindGalleryUpload(dialogueUpload, dialogueList);
  pickerButton.addEventListener('click', () => openPicker('character', { image, link, titleInput }));

  return card;
}

function createGameCard(seed = {}) {
  const fragment = gameTemplate.content.cloneNode(true);
  const card = fragment.querySelector('.game-card');
  const image = fragment.querySelector('.game-cover');
  const link = fragment.querySelector('.bangumi-link');
  const titleInput = fragment.querySelector('.title-input');
  const coverUpload = fragment.querySelector('.game-cover-upload');
  const gameRatings = fragment.querySelector('.game-ratings');
  const charactersList = fragment.querySelector('.characters-list');
  const addCharacterButton = fragment.querySelector('.add-character');
  const pickerButton = fragment.querySelector('[data-open-bgm]');

  titleInput.value = seed.title || '';
  image.src =
    seed.image ||
    'https://images.unsplash.com/photo-1512149673953-1e251807ec4a?auto=format&fit=crop&w=600&q=80';
  link.href = seed.url || 'https://bgm.tv/subject_search?cat=4';
  createStars(gameRatings);
  bindSingleUpload(coverUpload, image);
  pickerButton.addEventListener('click', () => openPicker('game', { image, link, titleInput }));
  addCharacterButton.addEventListener('click', () => charactersList.appendChild(createCharacterCard()));

  charactersList.appendChild(createCharacterCard('默认男主线路'));
  return card;
}

function boot() {
  gamesContainer.appendChild(createGameCard(bangumiFixtures.game[0]));

  document.querySelector('#addBlankGame').addEventListener('click', () => {
    gamesContainer.appendChild(createGameCard());
  });

  document.querySelector('#pickAvatarButton').addEventListener('click', () => {
    openPicker('avatar', { image: document.querySelector('#siteAvatar') });
  });

  document.querySelector('#addBangumiGameButton').addEventListener('click', () => {
    gamesContainer.appendChild(createGameCard());
    const latest = gamesContainer.lastElementChild;
    openPicker('game', {
      image: latest.querySelector('.game-cover'),
      link: latest.querySelector('.bangumi-link'),
      titleInput: latest.querySelector('.title-input'),
    });
  });

  document.querySelector('#avatarUpload').addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (file) previewImage(file, document.querySelector('#siteAvatar'));
  });

  document.querySelectorAll('.tab-button').forEach((button) => {
    button.addEventListener('click', () => switchPickerSource(button.dataset.source));
  });

  bgmSearchInput.addEventListener('input', (event) => {
    if (!currentPickerContext) return;
    renderBangumiResults(currentPickerContext.type, event.target.value.trim());
  });

  bgmFallbackUpload.addEventListener('change', (event) => {
    const [file] = event.target.files || [];
    if (!file || !currentPickerContext) return;
    previewImage(file, currentPickerContext.context.image);
    bgmModal.close();
  });
}

boot();
