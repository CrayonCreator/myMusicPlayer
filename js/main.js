document.addEventListener('DOMContentLoaded', function () {
    // 登录/注册的元素获取
    const authModal = document.getElementById('authModal');
    const authBackdrop = document.getElementById('authBackdrop');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authForms = document.querySelectorAll('.auth-form');
    const loginForm = document.querySelector('.login-form');
    const registerForm = document.querySelector('.register-form');
    const loginBtn = document.getElementById('loginBtn');
    const registerBtn = document.getElementById('registerBtn');
    const sendCodeBtn = document.getElementById('sendCodeBtn');

    const userName = document.getElementById('user-name');
    const infoAPI = axios.create({
        baseURL: 'http://47.99.53.155:5000',
        timeout: 99999,
    });

    const token = localStorage.getItem('token');
    const savedEmail = localStorage.getItem('userEmail');

    //渲染用户名称函数
    function renderUserName(token) {
        infoAPI.get('/api/users', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            userName.textContent = response.data.data[0].username;
        })
    }

    if (token) {
        renderUserName(token);
        if (savedEmail) {
            document.getElementById('user-email').textContent = savedEmail;
        }
        infoAPI.get('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            console.log('Token 验证成功:', response.data);
            if (response.data.success === true) {
                //验证成功
                hideAuthModal();
            }
        }).catch(error => {
            console.error('Token 验证失败:', error);
            // token 无效或过期，显示登录
            showAuthModal();
            // 清除无效 token
            localStorage.removeItem('token');
            delete infoAPI.defaults.headers.common['Authorization'];
        });
    } else {
        // 没有 token，显示登录
        showAuthModal();
    }

    //获取用户信息
    function getUserInfo(token) {
        infoAPI.get('/api/auth/me', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            console.log('获取用户信息:', response.data);
            if (response.data.success === true) {
                document.getElementById('user-email').textContent = response.data.data.email;
            }
        }).catch(error => {
            console.error('获取用户信息失败:', error);
        });
    }



    // 侧边栏中的展开/收起功能
    const sectionHeaders = document.querySelectorAll('.section-header');

    // 默认展开收藏的音乐
    const firstSection = document.querySelector('.collection .section-content');
    const firstToggleIcon = document.querySelector('.collection .toggle-icon');
    firstSection.classList.add('show');
    firstToggleIcon.classList.add('active');

    sectionHeaders.forEach(header => {
        header.addEventListener('click', () => {
            const content = header.nextElementSibling;
            const icon = header.querySelector('.toggle-icon');

            content.classList.toggle('show');
            icon.classList.toggle('active');
        });
    });

    // 模态框
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeModalButtons = document.querySelectorAll('.close-modal');
    const modalBackdrop = document.querySelector('.modal-backdrop');

    function openModal(modalId) {
        const modal = document.getElementById(`${modalId}Modal`);
        if (modal) {
            modal.classList.add('show');
            modalBackdrop.classList.add('show');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeAllModals() {
        const modals = document.querySelectorAll('.modal');
        modals.forEach(modal => {
            modal.classList.remove('show');
        });
        modalBackdrop.classList.remove('show');
        document.body.style.overflow = '';
    }

    modalTriggers.forEach(trigger => {
        trigger.addEventListener('click', () => {
            const modalId = trigger.getAttribute('data-modal');
            openModal(modalId);
        });
    });

    closeModalButtons.forEach(button => {
        button.addEventListener('click', closeAllModals);
    });

    modalBackdrop.addEventListener('click', closeAllModals);

    // 主题切换
    const themeToggle = document.createElement('div');
    themeToggle.className = 'theme-toggle';
    themeToggle.innerHTML = `
        <svg viewBox="0 0 24 24" width="20" height="20" class="moon-icon">
            <path d="M12 3c-4.97 0-9 4.03-9 9s4.03 9 9 9 9-4.03 9-9-4.03-9-9-9zm0 16c-3.86 0-7-3.14-7-7s3.14-7 7-7 7 3.14 7 7-3.14 7-7 7z" fill="currentColor"></path>
            <path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5z" fill="currentColor"></path>
        </svg>
        <svg viewBox="0 0 24 24" width="20" height="20" class="sun-icon" style="display:none">
            <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zm-2 5.79V18h-3.52L12 20.48 9.52 18H6v-3.52L3.52 12 6 9.52V6h3.52L12 3.52 14.48 6H18v3.52L20.48 12 18 14.48z" fill="currentColor"></path>
            <path d="M12 6c-3.31 0-6 2.69-6 6s2.69 6 6 6 6-2.69 6-6-2.69-6-6-6zm0 10c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"></path>
        </svg>
    `;

    // 添加主题切换按钮到顶部logo的右边
    const topLogo = document.querySelector('.top-logo');
    topLogo.appendChild(themeToggle);

    // 检查用户之前的主题选择localStorage
    const savedTheme = localStorage.getItem('theme');

    if (savedTheme === 'dark') {
        document.body.classList.add('dark-theme');
        document.querySelector('.moon-icon').style.display = 'none';
        document.querySelector('.sun-icon').style.display = 'block';
    }

    // 主题切换逻辑
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');

        document.querySelector('.moon-icon').style.display = isDark ? 'none' : 'block';
        document.querySelector('.sun-icon').style.display = isDark ? 'block' : 'none';

        localStorage.setItem('theme', isDark ? 'dark' : 'light');//存上
    });

    // 主题切换过渡
    const themeTransition = document.createElement('style');
    themeTransition.textContent = `
        body {
            transition: background-color 1s, color 1s;
        }
        
        .sidebar, .main-content, .modal, .card, .song-item {
            transition: background-color 1s, border-color 1s;
        }
    `;
    document.head.appendChild(themeTransition);

    // 右下角通知样式
    const style = document.createElement('style');
    style.textContent = `
        .notification {
            position: fixed;
            bottom: 20px;
            right: 20px;
            background-color: var(--accent-primary);
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
            z-index: 1000;
            animation: slideIn 0.3s ease forwards;
        }
        
        @keyframes slideIn {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        
        .notification.fade-out {
            animation: slideOut 0.3s ease forwards;
        }
        
        @keyframes slideOut {
            from { transform: translateX(0); opacity: 1; }
            to { transform: translateX(100%); opacity: 0; }
        }
    `;
    document.head.appendChild(style);

    // 顶部菜单栏交互
    // 设置菜单交互
    const settingsToggle = document.getElementById('settings-toggle');
    const settingsMenu = document.getElementById('settings-menu');

    if (settingsToggle && settingsMenu) {
        settingsToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            settingsMenu.classList.toggle('show');
            themeMenu.classList.remove('show'); // 关闭其他菜单
            userMenu.classList.remove('show');

        });
    }




    // 主题菜单交互
    const themeToggleBtn = document.getElementById('theme-toggle');
    const themeMenu = document.getElementById('theme-menu');
    const themeOptions = document.querySelectorAll('.theme-option');

    if (themeToggleBtn && themeMenu) {
        themeToggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            themeMenu.classList.toggle('show');
            settingsMenu.classList.remove('show'); // 关闭其他菜单
            userMenu.classList.remove('show');
        });

        themeOptions.forEach(option => {
            option.addEventListener('click', () => {
                const theme = option.getAttribute('data-theme');

                // 移除所有active
                themeOptions.forEach(opt => opt.classList.remove('active'));

                option.classList.add('active');

                applyTheme(theme);

                themeMenu.classList.remove('show');
            });
        });
    }

    // 应用主题函数
    function applyTheme(theme) {
        // 移除所有主题类
        document.body.classList.remove('dark-theme', 'green-theme', 'blue-theme');

        // 设置主题图标
        const moonIcon = document.querySelector('.moon-icon');
        const sunIcon = document.querySelector('.sun-icon');

        if (theme === 'dark') {
            document.body.classList.add('dark-theme');
            moonIcon.style.display = 'none';
            sunIcon.style.display = 'block';
        } else {
            if (theme === 'green') document.body.classList.add('green-theme');
            if (theme === 'blue') document.body.classList.add('blue-theme');
            moonIcon.style.display = 'block';
            sunIcon.style.display = 'none';
        }

        // 保存到本地存储
        localStorage.setItem('theme', theme);
    }

    // 用户信息菜单
    const userMenu = document.getElementById('user-menu');
    const userMenuToggle = document.getElementById('user-menu-toggle');


    if (userMenu && userMenuToggle) {
        userMenuToggle.addEventListener('click', (e) => {
            e.stopPropagation();
            userMenu.classList.toggle('show');
            settingsMenu.classList.remove('show'); // 关闭其他菜单
            themeMenu.classList.remove('show');

        });

    }
    // 点击文档其他位置关闭菜单
    document.addEventListener('click', () => {
        settingsMenu.classList.remove('show');
        themeMenu.classList.remove('show');
        userMenu.classList.remove('show');
    });

    // 阻止菜单内的点击事件冒泡
    settingsMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    themeMenu.addEventListener('click', (e) => {
        e.stopPropagation();
    });

    // 搜索框交互
    const searchInput = document.querySelector('.search input');

    if (searchInput) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch(searchInput.value);
            }
        });

        const searchButton = document.querySelector('.search button');
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                e.preventDefault();
                performSearch(searchInput.value);
            });
        }
    }

    // 搜索函数
    function performSearch(query) {
        if (!query.trim()) return;

        console.log('搜索:', query);

        // 这里添加实际的搜索逻辑

        // 显示搜索结果或导航到搜索结果页面

        // 搜索结果通知
        showNotification(`正在搜索: ${query}`);
    }

    // 加载已保存的主题
    const currentTheme = localStorage.getItem('theme');
    if (currentTheme) {
        // 更新主题选择UI
        themeOptions.forEach(option => {
            if (option.getAttribute('data-theme') === currentTheme) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });

        applyTheme(currentTheme);
    }

    // 添加通知显示函数
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // 3秒后移除通知
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 播放器
    const audioPlayer = document.getElementById('audio-player');
    const playPauseBtn = document.querySelector('.btn-play-pause');
    const playIcon = document.querySelector('.icon-play');
    const pauseIcon = document.querySelector('.icon-pause');
    const prevBtn = document.querySelector('.btn-previous');
    const nextBtn = document.querySelector('.btn-next');
    const shuffleBtn = document.querySelector('.btn-shuffle');
    const repeatBtn = document.querySelector('.btn-repeat');
    const favoriteBtn = document.querySelector('.btn-favorite');
    const heartIcon = document.querySelector('.icon-heart');
    const heartFilledIcon = document.querySelector('.icon-heart-filled');
    const volumeBtn = document.querySelector('.btn-volume');
    const volumeIcon = document.querySelector('.icon-volume');
    const muteIcon = document.querySelector('.icon-mute');
    const volumeBar = document.querySelector('.volume-bar');
    const volumeLevel = document.querySelector('.volume-level');
    const volumeHandle = document.querySelector('.volume-handle');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.querySelector('.progress');
    const progressBuffer = document.querySelector('.progress-buffer');
    const progressHandle = document.querySelector('.progress-handle');
    const currentTimeEl = document.querySelector('.current-time');
    const totalTimeEl = document.querySelector('.total-time');
    const musicCover = document.querySelector('.music-cover');
    const songTitle = document.querySelector('.song-title');
    const songArtist = document.querySelector('.song-artist');

    // 播放器状态
    const playerState = {
        isPlaying: false,
        isMuted: false,
        isShuffled: false,
        repeatMode: 'none', // 'none', 'all', 'one'
        isFavorite: false,
        volume: 0.7,
        currentTrackIndex: 0,
        playlist: [
            {
                title: '七里香',
                artist: '周杰伦',
                cover: './img/crayon.jpg',
                audio: 'https://example.com/audio/qilixiang.mp3', // 替换成api返回的的音频链接
                duration: 273 // 秒
            },

        ]
    };

    // 初始化播放器
    function initPlayer() {
        // 设置初始音量
        audioPlayer.volume = playerState.volume;
        updateVolumeUI();

        // 加载第一首歌
        loadTrack(playerState.currentTrackIndex);

        // 添加事件监听器
        attachEventListeners();
    }

    // 展示待播放歌曲列表
    function showPlaylist() {

    }

    document.querySelector('.btn-playlist').addEventListener('click', () => {
        console.log('播放列表');

        showPlaylist();
    });

    // 加载歌曲
    function loadTrack(index) {
        const track = playerState.playlist[index];

        // 更新UI
        songTitle.textContent = track.title;
        songArtist.textContent = track.artist;
        musicCover.src = track.cover;

        // 如果有实际的音频文件，则设置
        if (track.audio) {
            audioPlayer.src = track.audio;
        }

        // 更新总时长
        totalTimeEl.textContent = formatTime(track.duration);

        // 重置进度条
        progress.style.width = '0%';
        progressHandle.style.left = '0%';
        currentTimeEl.textContent = '0:00';

        // 如果正在播放，则自动播放下一首
        if (playerState.isPlaying) {
            playAudio();
        }
    }

    // 播放音频
    function playAudio() {
        audioPlayer.play().then(() => {
            playerState.isPlaying = true;
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            musicCover.classList.add('playing');
        }).catch(error => {
            console.error('播放失败:', error);

        });
    }

    // 暂停音频
    function pauseAudio() {
        audioPlayer.pause();
        playerState.isPlaying = false;
        playIcon.style.display = 'block';
        pauseIcon.style.display = 'none';
        musicCover.classList.remove('playing');
    }


    // 播放结束之后
    function handleTrackEnd() {
        // 根据重复模式决定下一步操作
        if (playerState.repeatMode === 'one') {
            // 重复当前歌曲
            loadTrack(playerState.currentTrackIndex);
            playAudio();
        } else if (playerState.repeatMode === 'all') {
            // 播放下一首，如果是最后一首则回到第一首
            playNextTrack();
        } else {
            // 如果是最后一首则停止播放，否则播放下一首
            if (playerState.currentTrackIndex < playerState.playlist.length - 1) {
                playNextTrack();
            } else {
                pauseAudio();
                progress.style.width = '100%';
                progressHandle.style.left = '100%';
            }
        }
    }

    // 播放下一首
    function playNextTrack() {
        if (playerState.isShuffled) {
            // 随机播放
            const newIndex = getRandomTrackIndex();
            playerState.currentTrackIndex = newIndex;
        } else {
            // 顺序播放
            playerState.currentTrackIndex = (playerState.currentTrackIndex + 1) % playerState.playlist.length;
        }
        loadTrack(playerState.currentTrackIndex);
        playAudio();
    }

    // 播放上一首
    function playPrevTrack() {
        if (playerState.isShuffled) {
            // 随机播放
            const newIndex = getRandomTrackIndex();
            playerState.currentTrackIndex = newIndex;
        } else {
            // 顺序播放，如果是第一首则跳到最后一首(类似轮播图？)
            playerState.currentTrackIndex = (playerState.currentTrackIndex - 1 + playerState.playlist.length) % playerState.playlist.length;
        }
        loadTrack(playerState.currentTrackIndex);
        playAudio();
    }

    // 获取随机歌曲索引
    function getRandomTrackIndex() {
        if (playerState.playlist.length <= 1) return 0;

        let newIndex;
        do {
            newIndex = Math.floor(Math.random() * playerState.playlist.length);
        } while (newIndex === playerState.currentTrackIndex);

        return newIndex;
    }

    // 切换随机播放
    function toggleShuffle() {
        playerState.isShuffled = !playerState.isShuffled;
        shuffleBtn.classList.toggle('active', playerState.isShuffled);
    }

    // 切换重复模式
    function toggleRepeat() {
        const modes = ['none', 'all', 'one'];
        const currentIndex = modes.indexOf(playerState.repeatMode);
        playerState.repeatMode = modes[(currentIndex + 1) % modes.length];

        // 更新UI
        repeatBtn.classList.remove('mode-all', 'mode-one');
        if (playerState.repeatMode === 'all') {
            repeatBtn.classList.add('mode-all');
        } else if (playerState.repeatMode === 'one') {
            repeatBtn.classList.add('mode-one');
        }
    }

    // 切换收藏
    function toggleFavorite() {
        playerState.isFavorite = !playerState.isFavorite;
        heartIcon.style.display = playerState.isFavorite ? 'none' : 'block';
        heartFilledIcon.style.display = playerState.isFavorite ? 'block' : 'none';

        // 显示通知
        const track = playerState.playlist[playerState.currentTrackIndex];
        const message = playerState.isFavorite
            ? `已添加「${track.title}」到我喜欢的音乐`
            : `已从我喜欢的音乐中移除「${track.title}」`;
        showNotification(message);
    }

    // 处理音量变化
    function handleVolumeChange(e) {
        const rect = volumeBar.getBoundingClientRect();
        let volumeValue = (e.clientX - rect.left) / rect.width;

        // 限制在0-1
        volumeValue = Math.max(0, Math.min(1, volumeValue));

        // 更新音量
        playerState.volume = volumeValue;
        audioPlayer.volume = volumeValue;

        // 如果之前是静音状态，取消静音
        if (playerState.isMuted && volumeValue > 0) {
            playerState.isMuted = false;
            volumeIcon.style.display = 'block';
            muteIcon.style.display = 'none';
        }

        updateVolumeUI();
    }

    // 更新音量
    function updateVolumeUI() {
        const displayVolume = playerState.isMuted ? 0 : playerState.volume;
        volumeLevel.style.width = `${displayVolume * 100}%`;
        volumeHandle.style.left = `${displayVolume * 100}%`;

        // 更新音量图标
        if (displayVolume === 0) {
            volumeIcon.style.display = 'none';
            muteIcon.style.display = 'block';
        } else {
            volumeIcon.style.display = 'block';
            muteIcon.style.display = 'none';
        }
    }

    // 切换静音
    function toggleMute() {
        playerState.isMuted = !playerState.isMuted;
        audioPlayer.muted = playerState.isMuted;
        updateVolumeUI();
    }

    // 处理进度条点击
    function handleProgressBarClick(e) {
        const rect = progressBar.getBoundingClientRect();
        const percent = (e.clientX - rect.left) / rect.width;

        // 设置进度
        const duration = playerState.playlist[playerState.currentTrackIndex].duration;
        const newTime = percent * duration;

        // 更新UI
        progress.style.width = `${percent * 100}%`;
        progressHandle.style.left = `${percent * 100}%`;
        currentTimeEl.textContent = formatTime(newTime);

        // 实际音频设置currentTime(明天再搞)
        if (audioPlayer.src) {
            audioPlayer.currentTime = newTime;
        }
    }

    // 监听音频时间变化
    function handleTimeUpdate() {
        const duration = audioPlayer.duration || playerState.playlist[playerState.currentTrackIndex].duration;
        const currentTime = audioPlayer.currentTime;
        const percent = (currentTime / duration) * 100;

        progress.style.width = `${percent}%`;
        progressHandle.style.left = `${percent}%`;

        if (audioPlayer.buffered.length > 0) {
            const bufferedEnd = audioPlayer.buffered.end(audioPlayer.buffered.length - 1);
            const bufferedPercent = (bufferedEnd / duration) * 100;
            progressBuffer.style.width = `${bufferedPercent}%`;
        }

        currentTimeEl.textContent = formatTime(currentTime);
    }

    // 格式化时间(秒 -> mm:ss)
    function formatTime(seconds) {
        seconds = Math.floor(seconds);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }

    // 显示通知
    function showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.textContent = message;
        document.body.appendChild(notification);

        // 3秒后自动消失
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    function attachEventListeners() {
        // 播放/暂停
        playPauseBtn.addEventListener('click', () => {
            if (playerState.isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        });

        prevBtn.addEventListener('click', playPrevTrack);

        nextBtn.addEventListener('click', playNextTrack);

        shuffleBtn.addEventListener('click', toggleShuffle);

        repeatBtn.addEventListener('click', toggleRepeat);

        favoriteBtn.addEventListener('click', toggleFavorite);

        volumeBtn.addEventListener('click', toggleMute);

        volumeBar.addEventListener('click', handleVolumeChange);
        volumeBar.addEventListener('mousedown', (e) => {
            handleVolumeChange(e);
            document.addEventListener('mousemove', handleVolumeChange);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', handleVolumeChange);
            }, { once: true });
        });

        // 进度条
        progressBar.addEventListener('click', handleProgressBarClick);
        progressBar.addEventListener('mousedown', (e) => {
            handleProgressBarClick(e);
            document.addEventListener('mousemove', handleProgressBarClick);
            document.addEventListener('mouseup', () => {
                document.removeEventListener('mousemove', handleProgressBarClick);
            }, { once: true });
        });

        audioPlayer.addEventListener('timeupdate', handleTimeUpdate);
        audioPlayer.addEventListener('ended', handleTrackEnd);

        // 歌曲封面也能点击
        musicCover.addEventListener('click', () => {
            if (playerState.isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        });
    }

    initPlayer();


    //下方的歌单列表按钮点击逻辑

    const playListBtn = document.querySelector('.btn-playlist');
    const playList = document.querySelector('.playlist');

    playListBtn.addEventListener('click', () => {
        playList.classList.toggle('show');
    });

    // 根据分类获取而歌手名称
    const vercel = axios.create({
        baseURL: 'https://netease-cloud-music-api-zeta-roan.vercel.app',
        timeout: 100000,
    });

    function getSingerByType(type) {
        return vercel.get(`/artist/list?type=${type}&limit=20`)
            .then(response => response.data.artists);
    }
    function getSingerByArea(area) {
        return vercel.get(`/artist/list?area=${area}&limit=20`)
            .then(response => response.data.artists);
    }

    //默认获取全部歌手
    (() => {
        getSingerByType(-1).then(res => {
            // 此时 res 是数组
            let innerHTML = res.map((item) => {
                return `                   
                 <div class="singer-items">
                    <img src="${item.picUrl}" alt="${item.name}">
                    <div class="singer-info">
                        <div class="singer-name" data-id="${item.id}">${item.name}</div>
                    </div>
                </div>`
            }).join('');
            classifiedSinger.innerHTML = innerHTML;
        }).catch(error => {
            console.error('获取歌手数据失败:', error);
            classifiedSinger.innerHTML = '<div class="error-message">获取歌手数据失败，请稍后再试</div>';
        });
    })();


    const classifiedSinger = document.querySelector('.classified-singer');

    const singerClassificationListByType = document.querySelector('.singerClassificationListByType');
    singerClassificationListByType.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const singerType = e.target.getAttribute('data-type');
            // console.log(singerType);

            getSingerByType(singerType).then(res => {
                // 此时 res 是数组
                let innerHTML = res.map((item) => {
                    return `                   
                     <div class="singer-items">
                        <img src="${item.picUrl}" alt="${item.name}">
                        <div class="singer-info">
                            <div class="singer-name" data-id="${item.id}">${item.name}</div>
                        </div>
                    </div>`
                }).join('');
                classifiedSinger.innerHTML = innerHTML;
            }).catch(error => {
                console.error('获取歌手数据失败:', error);
                classifiedSinger.innerHTML = '<div class="error-message">获取歌手数据失败，请稍后再试</div>';
            });
        }
    });

    const singerClassificationListByArea = document.querySelector('.singerClassificationListByArea');
    singerClassificationListByArea.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const singerArea = e.target.getAttribute('data-area');


            getSingerByArea(singerArea).then(res => {
                // 此时 res 是数组
                let innerHTML = res.map((item) => {
                    return `                   
                     <div class="singer-items">
                        <img src="${item.img1v1Url}" alt="${item.name}">
                        <div class="singer-info">
                            <div class="singer-name" data-id="${item.id}">${item.name}</div>
                        </div>
                    </div>`
                }).join('');
                classifiedSinger.innerHTML = innerHTML;
            }).catch(error => {
                console.error('获取歌手数据失败:', error);
                classifiedSinger.innerHTML = '<div class="error-message">获取歌手数据失败，请稍后再试</div>';
            });
        }
    });

    //调取歌曲url
    function getSongUrlBySongId(singerId) {
        return vercel.get(`/song/url?id=${singerId}`)
            .then(response => response.data);
    }


    //获取歌手热门50首歌曲
    function getSingerHotSong(singerId) {
        return vercel.get(`/artist/top/song?id=${singerId}`)
            .then(response => response.data.songs);
    }
    // 点击歌手进入歌手详情页
    classifiedSinger.addEventListener('click', async (e) => {
        if (e.target.classList.contains('singer-name') || e.target.closest('.singer-items')) {

            const singerId = e.target.classList.contains('singer-name') ?
                e.target.getAttribute('data-id') :
                e.target.closest('.singer-items').querySelector('.singer-name').getAttribute('data-id');

            const singerNameElement = e.target.closest('.singer-items').querySelector('.singer-name');
            const singerName = singerNameElement.textContent;
            showNotification(`正在加载 ${singerName} 的热门歌曲...`);
            try {
                // 获取歌手热门歌曲
                const songs = await getSingerHotSong(singerId);
                console.log("歌手热门歌曲:", songs);

                if (songs && songs.length > 0) {
                    // 将歌手热门歌曲添加到播放列表
                    const newPlaylist = songs.map(song => {
                        return {
                            id: song.id,
                            title: song.name,
                            artist: song.ar.map(a => a.name).join(', '),
                            cover: song.al.picUrl || './img/default-cover.jpg',
                            audio: null,
                            duration: song.dt / 1000
                        };
                    });

                    //更新播放列表
                    playerState.playlist = newPlaylist;
                    playerState.currentTrackIndex = 0;

                    //显示歌手详情页
                    showArtistDetail(singerId, singerName, songs);

                    //更新播放列表

                    updataPlaylistUI();
                    showNotification(`已添加 ${singerName} 的热门歌曲到播放列表`);
                } else {
                    showNotification("未找到该歌手的热门歌曲");
                }
            } catch (error) {
                console.error("获取歌手热门歌曲失败:", error);
                showNotification("获取歌手热门歌曲失败，请稍后再试");
            }
        }
    });

    //显示歌手详情页
    function showArtistDetail(singerId, singerName, songs) {
        const mainContentAera = document.querySelector('.mainContentArea');
        const scrollPosition = mainContentAera.scrollTop;

        //渲染

        const detailHTML = `
        <div class="artist-detail">
            <div class="back-button">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M20 11H7.83l5.59-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20v-2z" fill="currentColor"/>
                </svg>
                <span>返回歌手列表</span>
            </div>
            
            <div class="artist-header">
                <h1>${singerName}</h1>
                <button class="play-all-btn">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path d="M8 5v14l11-7z" fill="currentColor"/>
                    </svg>
                    播放全部
                </button>
            </div>
            
            <div class="songs-table">
                <div class="table-header">
                    <div class="col-num">#</div>
                    <div class="col-title">标题</div>
                    <div class="col-album">专辑</div>
                    <div class="col-duration">时长</div>
                </div>
                <div class="table-body">
                    ${songs.map((song, index) => `
                        <div class="song-row" data-index="${index}">
                            <div class="col-num">${index + 1}</div>
                            <div class="col-title">
                                <img src="${song.al.picUrl || './img/default-cover.jpg'}" alt="${song.name}">
                                <div>
                                    <div class="song-name">${song.name}</div>
                                    <div class="song-artist">${song.ar.map(a => a.name).join(', ')}</div>
                                </div>
                            </div>
                            <div class="col-album">${song.al.name}</div>
                            <div class="col-duration">${formatTime(song.dt / 1000)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

        mainContentAera.innerHTML = detailHTML;

        mainContentAera.scrollTop = 0;

        document.querySelector('.back-button').addEventListener('click', () => {
            showSingersList();
        });

        document.querySelector('.play-all-btn').addEventListener('click', () => {
            loadAndPlayTrack(0);
        });
        document.querySelectorAll('.song-row').forEach(row => {
            row.addEventListener('click', () => {
                const index = row.getAttribute('data-index');
                loadAndPlayTrack(index);
            });
        });
    }

    function showSingersList() {
        const mainContentArea = document.querySelector('.mainContentArea');

        mainContentArea.innerHTML = `
        <div class="classify">
            <div class="singerClassification">
                <ul class="singerClassificationListByType">
                    <li data-type="-1" class="all">全部</li>
                    <li data-type="1" class="man">男歌手</li>
                    <li data-type="2" class="woman">女歌手</li>
                    <li data-type="3" class="band">乐队组合</li>
                </ul>
                <div class="devide"></div>
                <ul class="singerClassificationListByArea">
                    <li data-area="-1" class="all">全部</li>
                    <li data-area="7" class="cn">华语</li>
                    <li data-area="96" class="eu">欧美</li>
                    <li data-area="8" class="jp">日本</li>
                    <li data-area="16" class="kr">韩国</li>
                    <li data-area="0" class="other">其他</li>
                </ul>
            </div>
        </div>
        <div class="classified-singer">
            <!-- 加载中指示器 -->
            <div class="loading-indicator">加载中...</div>
        </div>
    `;
        // 获取新的元素
        const classifiedSinger = document.querySelector('.classified-singer');

        // 重新加载歌手列表
        getSingerByType(-1).then(res => {
            let innerHTML = res.map((item) => {
                return `                   
                 <div class="singer-items">
                    <img src="${item.picUrl}" alt="${item.name}" loading="lazy">
                    <div class="singer-info">
                        <div class="singer-name" data-id="${item.id}">${item.name}</div>
                    </div>
                </div>`
            }).join('');
            classifiedSinger.innerHTML = innerHTML;

            classifiedSinger.querySelectorAll('.singer-items').forEach(item => {
                item.addEventListener('click', async function () {
                    const singerNameElement = this.querySelector('.singer-name');
                    const singerId = singerNameElement.getAttribute('data-id');
                    const singerName = singerNameElement.textContent;

                    showNotification(`正在加载 ${singerName} 的热门歌曲...`);

                    try {
                        // 获取歌手热门歌曲
                        const songs = await getSingerHotSong(singerId);

                        if (songs && songs.length > 0) {
                            // 将歌手热门歌曲添加到播放列表
                            const newPlaylist = songs.map(song => {
                                return {
                                    id: song.id,
                                    title: song.name,
                                    artist: song.ar.map(a => a.name).join(', '),
                                    cover: song.al.picUrl || './img/default-cover.jpg',
                                    audio: null,
                                    duration: song.dt / 1000
                                };
                            });

                            // 更新播放列表
                            playerState.playlist = newPlaylist;
                            playerState.currentTrackIndex = 0;

                            // 显示歌手详情页
                            showArtistDetail(singerId, singerName, songs);

                            // 更新播放列表
                            updataPlaylistUI();

                            showNotification(`已添加 ${singerName} 的热门歌曲到播放列表`);
                        } else {
                            showNotification("未找到该歌手的热门歌曲");
                        }
                    } catch (error) {
                        console.error("获取歌手热门歌曲失败:", error);
                        showNotification("获取歌手热门歌曲失败，请稍后再试");
                    }
                });
            });
        }).catch(error => {
            console.error('获取歌手数据失败:', error);
            classifiedSinger.innerHTML = '<div class="error-message">获取歌手数据失败，请稍后再试</div>';
        });


    }



    async function loadAndPlayTrack(index) {
        const track = playerState.playlist[index];
        playerState.currentTrackIndex = index;

        songTitle.textContent = track.title;
        songArtist.textContent = track.artist;
        musicCover.src = track.cover;

        if (!track.audio) {
            try {
                showNotification(`正在获取 ${track.title} 的音频...`);
                const songUrlData = await getSongUrlBySongId(track.id);
                if (songUrlData.data[0].url) {
                    track.audio = songUrlData.data[0].url;
                }
                else {
                    showNotification(`未找到 ${track.title} 的音频`);
                    throw new Error(`未找到 ${track.title} 的音频`);
                }
            } catch (err) {
                console.error('获取音频失败:', err);
                showNotification('获取音频失败，请稍后再试');
                if (playerState.playlist.length > index + 1) {
                    setTimeout(() => loadAndPlayTrack(index + 1), 3000);

                }
                return;
            }
        }
        audioPlayer.src = track.audio;
        totalTimeEl.textContent = formatTime(track.duration);

        progress.style.width = '0%';
        progressHandle.style.left = '0%';
        currentTimeEl.textContent = '0:00';

        playAudio();

        const playingIndicator = document.querySelector('.song-item.playing');
        if (playingIndicator) {
            playingIndicator.style.display = 'flex';
        }

        document.querySelectorAll('.song-row').forEach(row => {
            const rowIndex = parseInt(row.getAttribute('data-index'));
            if (rowIndex === index) {
                row.classList.add('playing');
            }
            else {
                row.classList.remove('playing');
            }
        })

        updataPlaylistUI();
    }

    function updataPlaylistUI() {
        const playlistContent = document.querySelector('.play-list-content');
        if (!playlistContent) return;

        playlistContent.innerHTML = '';
        playerState.playlist.forEach((track, index) => {
            const songItem = document.createElement('div');
            songItem.className = 'song-items';
            if (index === playerState.currentTrackIndex) {
                songItem.classList.add('active');
            }

            songItem.innerHTML = `
                <img src="${track.cover}" alt="${track.title}">
                <div class="song-info">
                    <span>${track.title}</span>
                    <span>${track.artist}</span>
                </div>
                <div class="duration">
                    <span>${formatTime(track.duration)}</span>
                </div>
                <div class="delete">
                    <svg class="icon" viewBox="0 0 1024 1024" width="16" height="16">
                        <path d="M572.91974805 512l242.82096754-242.82096757c16.30246778-16.30246778 16.30246778-43.75925563 0-60.91974802-16.30246778-16.30246778-43.75925563-16.30246778-60.91974802 0L512 451.08025195 269.17903243 208.25928441c-16.30246778-16.30246778-43.75925563-16.30246778-60.91974802 0-16.30246778 16.30246778-16.30246778 43.75925563 0 60.91974802L451.08025195 512l-242.82096754 242.82096757c-16.30246778 16.30246778-16.30246778 43.75925563 0 60.91974802 16.30246778 16.30246778 43.75925563 16.30246778 60.91974802 0l242.82096757-242.82096754 242.82096757 242.82096754c16.30246778 16.30246778 43.75925563 16.30246778 60.91974802 0 16.30246778-16.30246778 16.30246778-43.75925563 0-60.91974802L572.91974805 512z" fill="#3A414B"></path>
                    </svg>
                </div>
            `;
            songItem.addEventListener('click', (e) => {
                if (!e.target.closest('.delete')) {
                    loadAndPlayTrack(index);
                }
            });

            const deleteBtn = songItem.querySelector('.delete');
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                removeFromPlaylist(index);
            });

            playlistContent.appendChild(songItem);
        })
    }

    function removeFromPlaylist(index) {
        if (index === playerState.currentTrackIndex) {
            if (playerState.playlist.length === 1) {
                pauseAudio();
                playerState.playlist = [];
                playerState.currentTrackIndex = 0;

                // 重置信息
                songTitle.textContent = '歌曲名称';
                songArtist.textContent = '歌手名称';
                musicCover.src = './img/crayon.jpg';
                audioPlayer.src = '';
                progress.style.width = '0%';
                progressHandle.style.left = '0%';
                currentTimeEl.textContent = '0:00';
                totalTimeEl.textContent = '0:00';
            } else {
                playerState.playlist.splice(index, 1);
                if (index >= playerState.playlist.length) {
                    playerState.currentTrackIndex = 0;

                }
                loadAndPlayTrack(playerState.currentTrackIndex);
            }
        } else {
            if (index < playerState.currentTrackIndex) {
                playerState.currentTrackIndex--;
            }
            playerState.playlist.splice(index, 1);
        }
        updataPlaylistUI();
        showNotification('已从播放列表中移除歌曲');
    }





    showAuthModal();

    // 显示登录/注册模态框
    function showAuthModal() {
        authModal.classList.add('show');
        authBackdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
    }


    function hideAuthModal() {
        authModal.classList.remove('show');
        authBackdrop.classList.remove('show');
        document.body.style.overflow = '';
    }


    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabTarget = tab.getAttribute('data-tab');


            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');


            authForms.forEach(form => form.classList.remove('active'));
            document.querySelector(`.${tabTarget}-form`).classList.add('active');
        });
    });

    const userEmail = document.getElementById('user-email');
    loginBtn.addEventListener('click', () => {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        // 前端验证
        if (!validateEmail(email)) {
            showInputError('loginEmail', '请输入有效的邮箱地址');
            return;
        }

        if (!password.trim()) {
            showInputError('loginPassword', '请输入密码');
            return;
        }

        // 显示登录中
        loginBtn.textContent = '登录中...';
        loginBtn.disabled = true;

        // 调用后端登录API
        infoAPI.post('/api/auth/login', {
            email: email,
            password: password
        }).then(response => {
            console.log(response.data);
            showNotification('登录成功！');

            renderUserName(response.data.user);
            // 修改用户邮箱信息
            localStorage.setItem('token', response.data.token);
            // console.log(localStorage.getItem('token'));
            localStorage.setItem('userEmail', email);
            userEmail.textContent = email;
            hideAuthModal();
            loginBtn.textContent = '登录';
            loginBtn.disabled = false;
        }).catch(error => {
            console.error('登录失败:', error);
            showNotification('登录失败，请检查邮箱和密码是否正确');
            loginBtn.textContent = '登录';
            loginBtn.disabled = false;
        });
    });

    // 注册
    registerBtn.addEventListener('click', () => {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const code = document.getElementById('verificationCode').value;


        // 前端验证
        let isValid = true;

        if (!name.trim()) {
            showInputError('registerName', '请输入用户名');
            isValid = false;
        }

        if (!validateEmail(email)) {
            showInputError('registerEmail', '请输入有效的邮箱地址');
            isValid = false;
        }

        if (!validatePassword(password)) {
            showInputError('registerPassword', '密码至少6位，且包含字母和数字');
            isValid = false;
        }

        if (!code.trim() || code.length !== 6) {
            showInputError('verificationCode', '请输入6位验证码');
            isValid = false;
        }

        if (!isValid) return;

        // 显示注册中
        registerBtn.textContent = '注册中...';
        registerBtn.disabled = true;

        // 调用后端注册API
        //先发送验证码
        console.log(name);
        console.log(email);
        console.log(password);
        console.log(code);


        infoAPI.post('/api/auth/register', {
            username: name,
            email: email,
            password: password,
            verificationCode: code
        }).then(response => {
            console.log(response.data);
            showNotification('注册成功！');
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('userEmail', email);
            userEmail.textContent = email;
            hideAuthModal();
            registerBtn.textContent = '注册';
            registerBtn.disabled = false;
        })
    });



    //退出登录

    const logoutBtn = document.getElementById('logout');

    logoutBtn.addEventListener('click', () => {
        infoAPI.get('/api/auth/logout', {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('token')}`
            }
        }).then(response => {
            console.log(response.data);
            localStorage.removeItem('token');
            showAuthModal();
        }).catch(error => {
            console.error('退出登录失败:', error);
        });
    });

    // 发送验证码
    sendCodeBtn.addEventListener('click', () => {
        const email = document.getElementById('registerEmail').value;

        if (!validateEmail(email)) {
            showInputError('registerEmail', '请输入有效的邮箱地址');
            return;
        }

        // 禁用按钮，开始倒计时
        let countdown = 60;
        sendCodeBtn.disabled = true;
        sendCodeBtn.classList.add('disabled');
        sendCodeBtn.textContent = `已发送(${countdown}s)`;

        const timer = setInterval(() => {
            countdown--;
            sendCodeBtn.textContent = `已发送(${countdown}s)`;

            if (countdown <= 0) {
                clearInterval(timer);
                sendCodeBtn.disabled = false;
                sendCodeBtn.classList.remove('disabled');
                sendCodeBtn.textContent = '发送验证码';
            }
        }, 1000);

        // 调用后端发送验证码API
        infoAPI.post('/api/auth/sendverificationcode', {
            email: email
        }).then(response => {
            console.log(response.data);
            showNotification('验证码已发送到邮箱，请查收');
        }).catch(error => {
            console.error('发送验证码失败:', error);
            showNotification('发送验证码失败，请稍后再试');
        })

        console.log('发送验证码到:', email);
    });

    // 忘记密码
    document.getElementById('forgotPassword').addEventListener('click', (e) => {
        e.preventDefault();
        showNotification('请联系管理员重置密码');
    });

    document.querySelectorAll('.auth-form input').forEach(input => {
        input.addEventListener('focus', () => {
            const formGroup = input.closest('.form-group');
            if (formGroup.classList.contains('error')) {
                formGroup.classList.remove('error');
            }
        });
    });

    function showInputError(inputId, message) {
        const input = document.getElementById(inputId);
        const formGroup = input.closest('.form-group');

        formGroup.classList.add('error');

        let errorMessage = formGroup.querySelector('.error-message');
        if (!errorMessage) {
            errorMessage = document.createElement('div');
            errorMessage.className = 'error-message';
            formGroup.appendChild(errorMessage);
        }

        errorMessage.textContent = message;
    }

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password) {
        return password.length >= 6 && /[a-zA-Z]/.test(password) && /\d/.test(password);
    }
});