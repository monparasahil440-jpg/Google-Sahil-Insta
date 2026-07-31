// Instagram Application Logic (Antigravity Social Media)
// Project Folder: D:\Antigravity Social Media
// Integrated with Supabase database & GitHub Pages SPA architecture

document.addEventListener('DOMContentLoaded', () => {
  let currentFilter = 'none';
  let selectedImageData = null;
  let webcamStream = null;
  let posts = [];

  const initialPosts = [
    {
      id: 'p1',
      username: 'sahil_monpara',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      image_url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=80',
      caption: 'Sunset bliss on the beach 🌅🌊 #antigravity_social_media #instagram',
      filter_effect: 'filter-clarendon',
      location: 'Goa, India',
      likes_count: 142,
      isLiked: false,
      comments: [
        { username: 'alex_tech', text: 'Stunning capture! 🔥' },
        { username: 'design_guru', text: 'Love the lighting.' }
      ],
      created_at: '2 HOURS AGO'
    },
    {
      id: 'p2',
      username: 'react_developer',
      avatar_url: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80',
      image_url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=80',
      caption: 'Late night coding sessions building web apps 💻🚀',
      filter_effect: 'filter-lark',
      location: 'Bengaluru, India',
      likes_count: 89,
      isLiked: true,
      comments: [
        { username: 'sahil_monpara', text: 'Keep crushing it!' }
      ],
      created_at: '5 HOURS AGO'
    },
    {
      id: 'p3',
      username: 'travel_journal',
      avatar_url: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80',
      image_url: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1000&q=80',
      caption: 'Exploring majestic mountain paths 🏔️✨',
      filter_effect: 'filter-vintage',
      location: 'Manali, India',
      likes_count: 310,
      isLiked: false,
      comments: [],
      created_at: '1 DAY AGO'
    }
  ];

  const initialStories = [
    { username: 'Your Story', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80', isUser: true },
    { username: 'alex_tech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { username: 'sarah_m', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' },
    { username: 'code_ninja', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    { username: 'ui_artist', avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=150&q=80' }
  ];

  const initialReels = [
    {
      username: 'drone_view',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80',
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-dramatic-waterfall-in-a-forest-43048-large.mp4',
      caption: 'Nature is unbelievable 🌲💧',
      audio: 'Original Audio - drone_view',
      likes: '12.4k'
    },
    {
      username: 'city_vibes',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      video_url: 'https://assets.mixkit.co/videos/preview/mixkit-tokyo-street-with-neon-lights-at-night-42872-large.mp4',
      caption: 'Tokyo lights at night 🌃✨',
      audio: 'Synthwave Beats',
      likes: '45.2k'
    }
  ];

  const suggestedUsers = [
    { username: 'creative_coder', subtitle: 'Followed by alex_tech', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80' },
    { username: 'web3_pioneer', subtitle: 'Suggested for you', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=150&q=80' },
    { username: 'design_weekly', subtitle: 'New to Instagram', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=150&q=80' }
  ];

  const navItems = document.querySelectorAll('.nav-item[data-view]');
  const views = document.querySelectorAll('.view-section');
  const themeToggle = document.getElementById('theme-toggle');
  const createModal = document.getElementById('create-modal');
  const openCreateBtns = [document.getElementById('open-create-modal'), document.getElementById('mobile-open-create')];
  const modalBackBtn = document.getElementById('modal-back-btn');
  const modalShareBtn = document.getElementById('modal-share-btn');
  const fileInput = document.getElementById('file-input');
  const imagePreview = document.getElementById('image-preview');
  const webcamStreamEl = document.getElementById('webcam-stream');
  const uploadPlaceholder = document.getElementById('upload-placeholder');
  const startWebcamBtn = document.getElementById('start-webcam-btn');
  const filterThumbs = document.querySelectorAll('.filter-thumb');
  const captionInput = document.getElementById('caption-input');
  const locationInput = document.getElementById('location-input');

  navItems.forEach(item => {
    item.addEventListener('click', () => {
      const targetView = item.getAttribute('data-view');
      navItems.forEach(n => n.classList.remove('active'));
      item.classList.add('active');

      views.forEach(view => {
        if (view.id === targetView) {
          view.style.display = 'flex';
        } else {
          view.style.display = 'none';
        }
      });
    });
  });

  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', newTheme);
  });

  async function initApp() {
    renderStories();
    renderSuggestedUsers();
    renderReels();
    await loadPosts();
    renderExploreGrid();
    renderProfileGrid();
  }

  function renderStories() {
    const tray = document.getElementById('stories-tray');
    if (!tray) return;
    tray.innerHTML = initialStories.map(story => `
      <div class="story-item">
        <div class="story-avatar-ring">
          <img class="story-avatar" src="${story.avatar}" alt="${story.username}">
        </div>
        <span class="story-username">${story.username}</span>
      </div>
    `).join('');
  }

  function renderSuggestedUsers() {
    const container = document.getElementById('suggested-users-list');
    if (!container) return;
    container.innerHTML = suggestedUsers.map(u => `
      <div style="display: flex; align-items: center; justify-content: space-between;">
        <div style="display: flex; align-items: center; gap: 12px;">
          <img src="${u.avatar}" style="width: 36px; height: 36px; border-radius: 50%; object-fit: cover;">
          <div style="display: flex; flex-direction: column;">
            <span style="font-weight: 600; font-size: 0.85rem;">${u.username}</span>
            <span style="font-size: 0.75rem; color: var(--text-secondary);">${u.subtitle}</span>
          </div>
        </div>
        <button class="follow-btn">Follow</button>
      </div>
    `).join('');
  }

  async function loadPosts() {
    const remotePosts = await db.getPosts();
    posts = remotePosts && remotePosts.length > 0 ? remotePosts : initialPosts;
    renderPostsFeed();
  }

  function renderPostsFeed() {
    const container = document.getElementById('posts-feed');
    if (!container) return;
    
    container.innerHTML = posts.map(post => `
      <div class="post-card" data-id="${post.id}">
        <div class="post-header">
          <div class="post-user">
            <img class="post-user-avatar" src="${post.avatar_url}" alt="${post.username}">
            <div class="post-user-info">
              <span class="post-username">${post.username}</span>
              <span class="post-location">${post.location || 'Instagram'}</span>
            </div>
          </div>
          <div style="color: var(--text-secondary); cursor: pointer; font-weight: bold;">•••</div>
        </div>

        <div class="post-image-wrapper">
          <img class="post-image ${post.filter_effect || ''}" src="${post.image_url}" alt="Post image">
          <svg class="heart-animation" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
        </div>

        <div class="post-actions">
          <div class="action-buttons-left">
            <button class="action-btn like-btn ${post.isLiked ? 'liked' : ''}">
              <svg viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            </button>
            <button class="action-btn">
              <svg viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615l4.033 1.036z"/></svg>
            </button>
            <button class="action-btn">
              <svg viewBox="0 0 24 24"><path d="M21.707 11.293l-8-8A1 1 0 0 0 12 4v3.545A11.015 11.015 0 0 0 2 18.5a.5.5 0 0 0 .848.371c2.476-2.4 5.617-3.771 9.152-3.864V19a1 1 0 0 0 1.707.707l8-8a1 1 0 0 0 0-1.414z"/></svg>
            </button>
          </div>
          <button class="action-btn">
            <svg viewBox="0 0 24 24"><path d="M20 22L12 16L4 22V4C4 3.44772 4.44772 3 5 3H19C19.5523 3 20 3.44772 20 4V22Z"/></svg>
          </button>
        </div>

        <div class="post-body">
          <div class="likes-count"><span class="likes-num">${post.likes_count}</span> likes</div>
          <div class="caption-text">
            <span class="caption-username">${post.username}</span>
            <span>${post.caption}</span>
          </div>

          <div class="comments-list">
            ${(post.comments || []).map(c => `
              <div class="comment-item"><strong style="margin-right: 6px;">${c.username}</strong>${c.text}</div>
            `).join('')}
          </div>

          <div class="post-time">${post.created_at}</div>
        </div>

        <div class="add-comment-box">
          <input type="text" class="comment-input" placeholder="Add a comment...">
          <button class="post-comment-btn">Post</button>
        </div>
      </div>
    `).join('');

    attachPostEvents();
  }

  function attachPostEvents() {
    document.querySelectorAll('.post-card').forEach(card => {
      const postId = card.getAttribute('data-id');
      const likeBtn = card.querySelector('.like-btn');
      const likesNum = card.querySelector('.likes-num');
      const imgWrapper = card.querySelector('.post-image-wrapper');
      const heartAnim = card.querySelector('.heart-animation');
      const commentInput = card.querySelector('.comment-input');
      const commentBtn = card.querySelector('.post-comment-btn');
      const commentsList = card.querySelector('.comments-list');

      const postObj = posts.find(p => p.id === postId);

      const toggleLike = () => {
        postObj.isLiked = !postObj.isLiked;
        postObj.likes_count += postObj.isLiked ? 1 : -1;
        likeBtn.classList.toggle('liked', postObj.isLiked);
        likesNum.textContent = postObj.likes_count;
      };

      likeBtn.addEventListener('click', toggleLike);

      imgWrapper.addEventListener('dblclick', () => {
        if (!postObj.isLiked) toggleLike();
        heartAnim.classList.add('active');
        setTimeout(() => heartAnim.classList.remove('active'), 800);
      });

      commentBtn.addEventListener('click', () => {
        const text = commentInput.value.trim();
        if (!text) return;
        postObj.comments.push({ username: 'sahil_monpara', text });
        commentsList.insertAdjacentHTML('beforeend', `<div class="comment-item"><strong style="margin-right:6px;">sahil_monpara</strong>${text}</div>`);
        commentInput.value = '';
      });
    });
  }

  function renderReels() {
    const container = document.getElementById('reels-list');
    if (!container) return;
    container.innerHTML = initialReels.map(r => `
      <div class="reel-card">
        <video class="reel-video" src="${r.video_url}" loop autoplay muted playsinline></video>
        <div class="reel-overlay">
          <div class="reel-info">
            <div style="display: flex; align-items: center; gap: 10px;">
              <img src="${r.avatar}" style="width: 36px; height: 36px; border-radius: 50%;">
              <span style="font-weight: 600;">${r.username}</span>
              <button style="padding: 4px 12px; border-radius: 6px; border: 1px solid #fff; background: transparent; color: #fff; font-weight: 600; font-size: 0.8rem;">Follow</button>
            </div>
            <div>${r.caption}</div>
            <div style="font-size: 0.8rem; opacity: 0.8;">🎵 ${r.audio}</div>
          </div>
          <div class="reel-actions">
            <div style="text-align: center;"><svg width="28" height="28" fill="#fff" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg><br>${r.likes}</div>
            <div style="text-align: center;"><svg width="28" height="28" fill="#fff" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615l4.033 1.036z"/></svg><br>482</div>
            <div style="text-align: center;"><svg width="28" height="28" fill="#fff" viewBox="0 0 24 24"><path d="M21.707 11.293l-8-8A1 1 0 0 0 12 4v3.545A11.015 11.015 0 0 0 2 18.5a.5.5 0 0 0 .848.371c2.476-2.4 5.617-3.771 9.152-3.864V19a1 1 0 0 0 1.707.707l8-8a1 1 0 0 0 0-1.414z"/></svg></div>
          </div>
        </div>
      </div>
    `).join('');
  }

  function renderExploreGrid() {
    const grid = document.getElementById('explore-grid');
    if (!grid) return;
    const images = [
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1526772662000-3f88f10405ff?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=400&q=80',
      'https://images.unsplash.com/photo-1447752875215-b2761acb3c5d?auto=format&fit=crop&w=400&q=80'
    ];
    grid.innerHTML = images.map(img => `
      <div style="aspect-ratio: 1; border-radius: 8px; overflow: hidden; background: #262626;">
        <img src="${img}" style="width: 100%; height: 100%; object-fit: cover; cursor: pointer;">
      </div>
    `).join('');
  }

  function renderProfileGrid() {
    const grid = document.getElementById('profile-posts-grid');
    const postsCountEl = document.getElementById('profile-posts-count');
    if (!grid) return;
    if (postsCountEl) postsCountEl.textContent = posts.length;

    grid.innerHTML = posts.map(p => `
      <div class="profile-grid-item">
        <img class="${p.filter_effect || ''}" src="${p.image_url}" alt="Profile Post">
        <div class="grid-overlay">
          <div class="overlay-stat">
            <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/></svg>
            <span>${p.likes_count || 0}</span>
          </div>
          <div class="overlay-stat">
            <svg width="20" height="20" fill="#fff" viewBox="0 0 24 24"><path d="M20.656 17.008a9.993 9.993 0 1 0-3.59 3.615l4.033 1.036z"/></svg>
            <span>${(p.comments || []).length}</span>
          </div>
        </div>
      </div>
    `).join('');
  }

  // PROFILE TABS SWITCHING
  const profileTabs = document.querySelectorAll('.profile-tab-btn');
  profileTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      profileTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
    });
  });

  // SETTINGS & LOGOUT MODAL HANDLERS
  const openSettingsBtn = document.getElementById('open-settings-btn');
  const settingsModal = document.getElementById('settings-modal');
  const closeSettingsBtn = document.getElementById('close-settings-btn');
  const logoutBtn = document.getElementById('logout-btn');

  if (openSettingsBtn) openSettingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
  if (closeSettingsBtn) closeSettingsBtn.addEventListener('click', () => settingsModal.classList.remove('active'));

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to log out of Instagram?')) {
        // Clear session or cached user state
        localStorage.removeItem('insta_session');
        alert('You have logged out successfully.');
        window.location.reload();
      }
    });
  }

  // EDIT PROFILE MODAL HANDLERS
  const openEditProfileBtn = document.getElementById('open-edit-profile-btn');
  const editProfileModal = document.getElementById('edit-profile-modal');
  const closeEditProfileBtn = document.getElementById('close-edit-profile-btn');
  const saveProfileBtn = document.getElementById('save-profile-btn');

  const avatarFileInput = document.getElementById('avatar-file-input');
  const editAvatarPreview = document.getElementById('edit-avatar-preview');
  const profileAvatarImg = document.getElementById('profile-avatar-img');

  const editFullnameInput = document.getElementById('edit-fullname-input');
  const editUsernameInput = document.getElementById('edit-username-input');
  const editWebsiteInput = document.getElementById('edit-website-input');
  const editBioInput = document.getElementById('edit-bio-input');

  const profileFullname = document.getElementById('profile-fullname');
  const profileUsernameHeading = document.getElementById('profile-username-heading');
  const profileBioText = document.getElementById('profile-bio-text');
  const profileWebsiteLink = document.getElementById('profile-website-link');

  if (openEditProfileBtn) openEditProfileBtn.addEventListener('click', () => editProfileModal.classList.add('active'));
  if (closeEditProfileBtn) closeEditProfileBtn.addEventListener('click', () => editProfileModal.classList.remove('active'));

  let newAvatarUrl = null;
  if (avatarFileInput) {
    avatarFileInput.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (evt) => {
          newAvatarUrl = evt.target.result;
          editAvatarPreview.src = newAvatarUrl;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (saveProfileBtn) {
    saveProfileBtn.addEventListener('click', () => {
      if (newAvatarUrl && profileAvatarImg) profileAvatarImg.src = newAvatarUrl;
      if (editUsernameInput.value && profileUsernameHeading) profileUsernameHeading.textContent = editUsernameInput.value;
      if (editFullnameInput.value && profileFullname) profileFullname.textContent = editFullnameInput.value;
      if (editBioInput.value && profileBioText) profileBioText.textContent = editBioInput.value;
      if (editWebsiteInput.value && profileWebsiteLink) {
        profileWebsiteLink.textContent = '🔗 ' + editWebsiteInput.value.replace(/^https?:\/\//, '');
        profileWebsiteLink.href = editWebsiteInput.value;
      }
      editProfileModal.classList.remove('active');
    });
  }

  openCreateBtns.forEach(btn => {
    if (btn) btn.addEventListener('click', () => createModal.classList.add('active'));
  });

  modalBackBtn.addEventListener('click', () => {
    stopWebcam();
    createModal.classList.remove('active');
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (evt) => {
        selectedImageData = evt.target.result;
        imagePreview.src = selectedImageData;
        imagePreview.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        webcamStreamEl.style.display = 'none';
        stopWebcam();
      };
      reader.readAsDataURL(file);
    }
  });

  startWebcamBtn.addEventListener('click', async () => {
    try {
      webcamStream = await navigator.mediaDevices.getUserMedia({ video: true });
      webcamStreamEl.srcObject = webcamStream;
      webcamStreamEl.style.display = 'block';
      uploadPlaceholder.style.display = 'none';
      imagePreview.style.display = 'none';
    } catch (err) {
      alert('Unable to access camera: ' + err.message);
    }
  });

  function stopWebcam() {
    if (webcamStream) {
      webcamStream.getTracks().forEach(track => track.stop());
      webcamStream = null;
    }
  }

  filterThumbs.forEach(thumb => {
    thumb.addEventListener('click', () => {
      filterThumbs.forEach(t => t.classList.remove('selected'));
      thumb.classList.add('selected');
      currentFilter = thumb.getAttribute('data-filter');
      imagePreview.className = 'preview-image ' + currentFilter;
      webcamStreamEl.className = 'webcam-video ' + currentFilter;
    });
  });

  modalShareBtn.addEventListener('click', async () => {
    let finalImageUrl = selectedImageData;

    if (webcamStream) {
      const canvas = document.createElement('canvas');
      canvas.width = webcamStreamEl.videoWidth || 640;
      canvas.height = webcamStreamEl.videoHeight || 480;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(webcamStreamEl, 0, 0, canvas.width, canvas.height);
      finalImageUrl = canvas.toDataURL('image/jpeg');
    }

    if (!finalImageUrl) {
      alert('Please select an image or take a photo first!');
      return;
    }

    modalShareBtn.textContent = 'Posting...';

    const uploadedUrl = await db.uploadImage(finalImageUrl);
    const newPost = await db.createPost({
      username: 'sahil_monpara',
      avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
      image_url: uploadedUrl,
      caption: captionInput.value || 'New post!',
      filter_effect: currentFilter,
      location: locationInput.value || 'India'
    });

    posts.unshift(newPost);
    renderPostsFeed();
    renderProfileGrid();

    stopWebcam();
    modalShareBtn.textContent = 'Share';
    createModal.classList.remove('active');
    uploadPlaceholder.style.display = 'flex';
    imagePreview.style.display = 'none';
    webcamStreamEl.style.display = 'none';
    selectedImageData = null;
    captionInput.value = '';
  });

  const openDmBtn = document.getElementById('open-dm-btn');
  const dmModal = document.getElementById('dm-modal');
  const closeDmBtn = document.getElementById('close-dm-btn');
  const sendChatBtn = document.getElementById('send-chat-btn');
  const chatInput = document.getElementById('chat-input');
  const chatMessages = document.getElementById('chat-messages');

  openDmBtn.addEventListener('click', () => dmModal.classList.add('active'));
  closeDmBtn.addEventListener('click', () => dmModal.classList.remove('active'));

  sendChatBtn.addEventListener('click', () => {
    const text = chatInput.value.trim();
    if (!text) return;
    chatMessages.insertAdjacentHTML('beforeend', `
      <div style="align-self: flex-end; background: var(--accent-blue); color: white; padding: 10px 14px; border-radius: 18px; max-width: 75%; font-size: 0.9rem;">${text}</div>
    `);
    chatInput.value = '';
    chatMessages.scrollTop = chatMessages.scrollHeight;

    setTimeout(() => {
      chatMessages.insertAdjacentHTML('beforeend', `
        <div style="align-self: flex-start; background: var(--bg-tertiary); color: var(--text-primary); padding: 10px 14px; border-radius: 18px; max-width: 75%; font-size: 0.9rem;">Hey Sahil! Loved your latest post on Instagram! 🚀</div>
      `);
      chatMessages.scrollTop = chatMessages.scrollHeight;
    }, 1000);
  });

  initApp();
});
