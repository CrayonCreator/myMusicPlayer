document.addEventListener('DOMContentLoaded', function () {

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
    
    // 点击文档其他位置关闭菜单
    document.addEventListener('click', () => {
        settingsMenu.classList.remove('show');
        themeMenu.classList.remove('show');
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
            {
                title: 'Shape of You',
                artist: 'Ed Sheeran',
                cover: 'https://via.placeholder.com/300',
                audio: 'https://example.com/audio/shapeofyou.mp3',
                duration: 234
            },
            {
                title: 'Blinding Lights',
                artist: 'The Weeknd',
                cover: 'https://via.placeholder.com/300',
                audio: 'https://example.com/audio/blindinglights.mp3',
                duration: 202
            }
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
});