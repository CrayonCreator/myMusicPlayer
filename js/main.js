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

    document.querySelector('#visualizerModal .close-modal').addEventListener('click', () => {
        const modal = document.getElementById('visualizerModal');
        modal.classList.remove('show');
        modalBackdrop.classList.remove('show');
        document.body.style.overflow = '';
    });

    const userName = document.getElementById('user-name');
    const infoAPI = axios.create({
        baseURL: 'http://47.99.53.155:5000',
        timeout: 99999,
        withCredentials: false,
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
                hideAuthModal();
                updateMyPlaylists(token);
                updateCollectPlaylists(token);
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

    function resetCreatePlaylistForm() {
        document.getElementById('playlistName').value = '';
        document.getElementById('playlistDescription').value = '';
    }


    const createPlaylistBtn = document.getElementById('createPlaylistBtn');
    createPlaylistBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        console.log('创建新歌单');


        const playlistName = document.getElementById('playlistName').value;
        const playlistDescription = document.getElementById('playlistDescription').value;

        if (!playlistName.trim()) {
            showNotification('请输入歌单名称');
            return;
        }


        try {
            const result = await createPlaylist(token, playlistName, playlistDescription);

            if (result) {
                showNotification('创建歌单成功');

                // 如果有当前选择的歌曲，则添加到新创建的歌单中
                if (currentSelectedSongId && result.data && result.data._id) {
                    try {
                        await addSongToPlaylist(currentSelectedSongId, result.data._id);
                    } catch (error) {
                        console.error('添加歌曲到歌单失败:', error);
                    }
                }

                updateMyPlaylists(token);
                resetCreatePlaylistForm();
                closeAllModals();
            } else {
                showNotification('创建歌单失败');
            }
        } catch (error) {
            console.error('创建歌单失败:', error);
            showNotification('创建歌单失败，请稍后再试');
        }
    });

    // 创建歌单请求函数
    function createPlaylist(token, name, description) {
        return infoAPI.post('/api/playlists', {
            name: name,
            description: description,
            isPublic: true,
            coverUrl: "./img/crayon.jpg"
        }, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            console.log('创建歌单:', response.data);
            return response.data;
        }).catch(error => {
            console.error('创建歌单失败:', error);
            return null;
        });
    }
    // 更新我的歌单部分的展示渲染函数
    function updateMyPlaylists(token) {
        infoAPI.get('/api/playlists', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then(response => {
            console.log('我的歌单:', response.data);
            const myPlaylists = response.data.data;
            const myPlaylistsSection = document.querySelector('.my-playlists .section-content');
            if (myPlaylists.length === 0) {
                let innerHTML =
                    `<div class="add-playlist" id="addPlaylist" data-modal="addPlaylist">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"></path>
                        </svg>
                        <span>创建歌单</span>
                    </div>`
                //绑定创建歌单按钮事件
                myPlaylistsSection.innerHTML = innerHTML;
                const addPlaylist = document.getElementById('addPlaylist');
                addPlaylist.addEventListener('click', () => {
                    openModal('createPlaylistModal');
                });
                return;
            }
            myPlaylistsSection.innerHTML = '';
            let innerHTML =
                `<div class="add-playlist" id="addPlaylist" data-modal="addPlaylist">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"></path>
                </svg>
                <span>创建歌单</span>
            </div>`

            innerHTML += myPlaylists.map(playlist => {
                return `
                <div class="item" data-id="${playlist._id}">
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path
                                d="M15 6H3v2h12V6zm0 4H3v2h12v-2zM3 16h8v-2H3v2zM17 6v8.18c-.31-.11-.65-.18-1-.18-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3V8h3V6h-5z"
                                fill="currentColor">
                            </path>
                        </svg>
                        <span>${playlist.name}</span>
                        <button class="delete-playlist" data-id="${playlist._id}">
                            <svg t="1742018702634" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3216" width="16" height="16">
                                <path d="M975.05077 126.385883H560.608493V44.930573c-2.047351-38.826544-38.095347-44.895476-65.003385-44.895476a46.869707 46.869707 0 0 0-48.624579 44.895476v81.45531H48.697699a45.041715 45.041715 0 1 0 0 89.717833h52.71928l0.365599 669.776156v47.674024a93.739414 93.739414 0 0 0 97.322277 89.717832h632.485126a93.885653 93.885653 0 0 0 97.249159-87.743601l-0.438718-707.505905a41.678211 41.678211 0 0 0-1.754872-11.991626h48.25898a45.041715 45.041715 0 1 0 0-89.717832z m-143.972626 807.533611l0.511837-74.289582v74.289582z m0-705.751033v624.515082c-1.681752 67.708812-22.520858 80.431635-97.176039 80.431635l50.525691 1.169914H232.228065l63.68723-1.462393c-76.190694 0-96.371722-12.869062-97.249158-84.380097l0.584958 85.84249h-0.658077l-0.365599-717.815778h634.313118a41.531971 41.531971 0 0 0-1.754872 11.991626z m-438.206169 31.514577a46.869707 46.869707 0 0 0-48.624579 44.895476l0.438718 540.061866a48.843938 48.843938 0 0 0 97.322278 0l-0.438718-540.061866a46.869707 46.869707 0 0 0-48.55146-44.968596z m243.707853 629.779698a46.869707 46.869707 0 0 0 48.624579-44.895476l-0.438718-540.061866a48.843938 48.843938 0 0 0-97.322278 0l0.438718 540.061866a46.869707 46.869707 0 0 0 48.624579 44.895476z" fill="#2c2c2c" p-id="3217">
                                </path>
                            </svg>
                        </button>
                </div>
                
                `;
            }
            ).join('');
            myPlaylistsSection.innerHTML += innerHTML;


            // 删除歌单

            function deleteMyplaylist(token, playlistId) {
                return infoAPI.delete(`/api/playlists/${playlistId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            }

            const deletePlaylistBtns = document.querySelectorAll('.delete-playlist');
            deletePlaylistBtns.forEach(btn => {
                btn.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const playlistId = btn.getAttribute('data-id');
                    console.log('删除歌单:', playlistId);
                    try {
                        await deleteMyplaylist(token, playlistId);
                        showNotification('删除歌单成功');
                        updateMyPlaylists(token);
                    } catch (error) {
                        console.error('删除歌单失败:', error);
                        showNotification('删除歌单失败，请稍后再试');
                    }
                });
            });
            const addPlaylist = document.getElementById('addPlaylist');
            console.log("创建歌单元素:", addPlaylist);

            if (addPlaylist) {
                addPlaylist.addEventListener('click', () => {
                    console.log('创建新歌单按钮被点击');
                    openModal('createPlaylistModal');
                });
            } else {
                console.error('未找到ID为addPlaylist的元素');
            }

            document.querySelectorAll('.my-playlists .item').forEach((item) => {
                item.addEventListener('click', async (e) => {
                    const playlistId = item.getAttribute('data-id');
                    if (!playlistId) return;

                    const playlistName = item.querySelector('span').textContent;
                    showNotification(`正在加载 ${playlistName} 的歌曲...`);

                    try {
                        // 获取歌单中的歌曲
                        const response = await infoAPI.get(`/api/playlists/${playlistId}`, {
                            headers: {
                                'Authorization': `Bearer ${token}`
                            }
                        });
                        console.log('歌单详情:', response.data.data);

                        const songIds = response.data.data.songs;
                        if (songIds && songIds.length > 0) {

                            console.log('歌单中的歌曲:', songIds);

                            const songs = await Promise.all(
                                songIds.map(id => vercel.get(`/song/detail?ids=${id._id}`).then(res => res.data.songs[0]))
                            );

                            showPlaylistDetail(playlistId, playlistName, songs);
                        } else {
                            showNotification("该歌单还没有歌曲");
                        }
                    } catch (error) {
                        console.error("获取歌单歌曲失败:", error);
                        showNotification("获取歌单歌曲失败，请稍后再试");
                    }
                });
            });
        })
    }

    //收藏的歌单

    const collectPlaylists = document.querySelector('.collect-playlists');
    const collectPlaylistsSectionHeader = collectPlaylists.querySelector('.section-header');
    const collectPlaylistsSectionContent = collectPlaylists.querySelector('.section-content');

    //获取用户收藏的歌单信息

    function getUserCollectPlaylists(token) {
        return infoAPI.get('/api/playlists/user/favorites', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        }).then((res) => {
            console.log('获取用户收藏的歌单:', res.data.data);
            return res.data.data;
        }).catch((error) => {
            console.error('获取用户收藏的歌单失败:', error);
            return [];
        });
    }

    //渲染用户收藏的歌单

    function getPlaylistName(playlistId) {
        return vercel.get(`/playlist/detail?id=${playlistId}`).then(res => res.data.playlist.name);
    }

    async function renderUserCollectPlaylists(playlists) {
        if (playlists.length === 0) {
            collectPlaylistsSectionContent.innerHTML = '<div class="empty-message">暂无收藏的歌单</div>';
            return;
        }

        collectPlaylistsSectionContent.innerHTML = '<div class="loading-indicator">加载中...</div>';

        try {
            const playlistPromises = playlists.map(playlistId =>
                getPlaylistName(playlistId)
            );
            const playlistNames = await Promise.all(playlistPromises);

            const innerHTML = playlists.map((playlistId, index) => {
                return `
                 <div class="item" data-id="${playlistId}">
                    <svg viewBox="0 0 24 24" width="16" height="16">
                        <path
                            d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 14H9V8h2v8zm4 0h-2V8h2v8z"
                            fill="currentColor">
                        </path>
                    </svg>
                    <span>${playlistNames[index]}</span>
                </div>
                `;
            }).join('');

            collectPlaylistsSectionContent.innerHTML = innerHTML;

            document.querySelectorAll('.collect-playlists .item').forEach((item, index) => {
                item.addEventListener('click', async () => {
                    const playlistId = playlists[index];
                    const playlistName = playlistNames[index];

                    showNotification(`正在加载 ${playlistName} 的歌曲...`);

                    try {
                        const songs = await getPlaylistSongs(playlistId);
                        if (songs && songs.length > 0) {
                            showPlaylistDetail(playlistId, playlistName, songs);
                        } else {
                            showNotification("未找到该歌单的歌曲");
                        }
                    } catch (error) {
                        console.error("获取歌单歌曲失败:", error);
                        showNotification("获取歌单歌曲失败，请稍后再试");
                    }
                });
            });
        } catch (error) {
            console.error('渲染收藏歌单失败:', error);
            collectPlaylistsSectionContent.innerHTML = '<div class="error-message">加载歌单信息失败</div>';
        }

    }

    function updateCollectPlaylists(token) {

        getUserCollectPlaylists(token).then(playlists => {
            console.log('用户收藏的歌单:', playlists);

            renderUserCollectPlaylists(playlists);
        });
    }

    updateCollectPlaylists(token);

    // 模态框
    const modalTriggers = document.querySelectorAll('[data-modal]');
    const closeModalButtons = document.querySelectorAll('.close-modal');

    function openModal(modalId) {
        let modal = document.getElementById(modalId);

        if (!modal) {
            modal = document.getElementById(`${modalId}Modal`);
        }

        if (modal) {
            modal.classList.add('show');
            modalBackdrop.classList.add('show');
            document.body.style.overflow = 'hidden';
        } else {
            console.error(`找不到ID为${modalId}或${modalId}Modal的模态框`);
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
            <path d="M12 5c-3.86 0-7 3.14-7 7s3.14 7 7 7 7-3.14 7-7-3.14-7-7-7zm0 12c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4z" fill="currentColor"></path>
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
    document.addEventListener('click', () => {
        settingsMenu.classList.remove('show');
        themeMenu.classList.remove('show');
        userMenu.classList.remove('show');
    });

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
                const selectedOption = document.querySelector('#search-type option:checked');
                const type = selectedOption.getAttribute('data-type');

                console.log('搜索类型:', type);
                e.preventDefault();
                performSearch(searchInput.value, type);
            }
        });

        const searchButton = document.querySelector('.search button');
        if (searchButton) {
            searchButton.addEventListener('click', (e) => {
                const selectedOption = document.querySelector('#search-type option:checked');
                const type = selectedOption.getAttribute('data-type');
                console.log('搜索类型:', type);

                e.preventDefault();
                performSearch(searchInput.value, type);
            });
        }
    }

    // 搜索
    function performSearch(query, type) {
        if (!query.trim()) return;
        // type = 1 为单曲
        // type = 1000 为歌单
        // type = 1004 为MV
        console.log('搜索:', query);
        if (type == 1) {
            vercel.get(`/search?keywords=${query}&type=1`).then(res => {
                console.log('搜索结果:', res.data.result.songs);
                showSearchResults(res.data.result.songs, type);
            }).catch(error => {
                console.error('搜索失败:', error);
                showNotification('搜索失败，请稍后再试');
            });
        }
        else if (type == 1000) {
            vercel.get(`/search?keywords=${query}&type=1000`).then(res => {
                console.log('搜索结果:', res.data.result.playlists);
                showSearchResults(res.data.result.playlists, type);
            }
            ).catch(error => {
                console.error('搜索失败:', error);
                showNotification('搜索失败，请稍后再试');
            }
            );
        }
        else if (type == 1004) {
            vercel.get(`/search?keywords=${query}&type=1004`).then(res => {
                console.log('搜索结果:', res.data.result.mvs);
                showSearchResults(res.data.result.mvs, type);
            }).catch(error => {
                console.error('搜索失败:', error);
                showNotification('搜索失败，请稍后再试');
            });
        }

        showNotification(`正在搜索: ${query}`);
    }

    // 显示搜索结果

    async function showSearchResults(results, type) {
        if (type == 1) {
            let innerHTML = '';
            for (const song of results) {
                let imgUrl = './img/crayon.jpg';
                try {
                    const songDetail = await vercel.get(`/song/detail?ids=${song.id}`).then(res => res.data.songs[0]);
                    imgUrl = songDetail.al.picUrl || './img/crayon.jpg';
                } catch (error) {
                    console.error('获取歌曲封面失败:', error);
                }
                innerHTML += `
                 <div class="search-result-item" data-id="${song.id}">
                    <div class="search-result-info">
                        <div class="search-result-img">
                            <img src="${imgUrl}" alt="歌曲封面">
                        </div>
                       <div class="search-result-name">
                        <div class="search-result-title">${song.name}</div>
                        <div class="search-result-artist">${song.artists.map(a => a.name).join(', ')}</div>
                       </div>
                    </div>
                </div>
                `;
            }
            document.querySelector('.search-result').innerHTML = innerHTML;

            //给每个歌曲绑定点击播放事件

            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const songId = item.getAttribute('data-id');
                    console.log('播放歌曲:', songId);
                    try {
                        const songDetail = await vercel.get(`/song/detail?ids=${songId}`).then(res => res.data.songs[0]);
                        const song = await vercel.get(`/song/url?id=${songId}`).then(res => res.data.data[0]);

                        console.log('歌曲链接:', song.url);
                        audioPlayer.src = song.url;

                        songTitle.textContent = item.querySelector('.search-result-title').textContent;
                        songArtist.textContent = item.querySelector('.search-result-artist').textContent;

                        musicCover.src = songDetail.al.picUrl || './img/crayon.jpg';

                        playIcon.style.display = 'none';
                        pauseIcon.style.display = 'block';
                        audioPlayer.play();

                        if (document.querySelector("#searchResultModal").classList.contains("show")) {
                            document.querySelector("#searchResultModal").classList.remove("show");
                            modalBackdrop.classList.remove("show");
                        }
                    } catch (error) {
                        console.error('获取歌曲链接失败:', error);
                        showNotification('获取歌曲链接失败，请稍后再试');
                    }
                });
            });


        }
        if (type == 1000) {
            let innerHTML = results.map(playlist => {
                return `
                  <div class="search-result-item" data-id="${playlist.id}">
                        <div class="srearch-result-info">
                            <div class="search-result-img">
                                <img src="${playlist.coverImgUrl}" alt="歌单封面">
                            </div>
                            <div class="search-result-title">${playlist.name}</div>
                        </div>
                        <div class="search-result-author-info">
                            <div class="search-result-author-img">
                                <img src="${playlist.creator.avatarUrl}" alt="歌单作者头像">
                            </div>
                            <div class="search-result-artist">
                            ${playlist.creator.nickname}
                            </div>
                        </div>
                    </div>
                `
            }).join('');
            document.querySelector('.search-result').innerHTML = innerHTML;

            // 绑定歌单的点击事件：查看歌单详情
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const playlistId = item.getAttribute('data-id');
                    console.log('查看歌单:', playlistId);

                    try {
                        const playlistDetail = await vercel.get(`/playlist/detail?id=${playlistId}`).then(res => res.data.playlist);
                        const songs = playlistDetail.tracks;
                        showPlaylistDetail(playlistId, playlistDetail.name, songs);
                        // 移除搜索结果模态框
                        document.querySelector('#searchResultModal').classList.remove('show');
                    } catch (error) {
                        console.error('获取歌单详情失败:', error);
                        showNotification('获取歌单详情失败，请稍后再试');
                    }
                });
            });




        }
        if (type == 1004) {
            let innerHTML = results.map(mv => {
                return `
                   <div class="search-result-item id="search-result-item-mv" data-id="${mv.id}">
                        <div class="search-result-info" id="search-result-info-mv">
                            <div class="search-result-img" id="search-result-img-mv">
                                <img src="${mv.cover}" alt="MV封面">
                            </div>
                            <div class="search-result-title" id="search-result-title-mv">${mv.name}</div>
                            <div class="search-result-artist" id="search-result-artist-mv">${mv.artists.map(a => a.name).join('，')}</div>
                        </div>
                    </div>
                `
            }).join('');
            document.querySelector('.search-result').innerHTML = innerHTML;

            // 绑定MV的点击事件：播放MV
            document.querySelectorAll('.search-result-item').forEach(item => {
                item.addEventListener('click', async () => {
                    const mvId = item.getAttribute('data-id');
                    console.log('播放MV:', mvId);

                    try {
                        const mvDetail = await vercel.get(`/mv/detail?mvid=${mvId}`).then(res => res.data.data);
                        const mvUrl = await vercel.get(`/mv/url?id=${mvId}`).then(res => res.data.data.url);
                        console.log('MV链接:', mvUrl);

                        showMVDetail(mvDetail, mvUrl);
                    } catch (error) {
                        console.error('获取MV链接失败:', error);
                        showNotification('获取MV链接失败，请稍后再试');
                    }
                });
            });
        }

        document.querySelector('#searchResultModal').classList.add('show');
        modalBackdrop.classList.add('show');



    }
    //播放mv的函数

    function showMVDetail(mv, url) {
        const mvDetail = document.querySelector('#mvDetailModal');
        const mvTitle = mvDetail.querySelector('.mv-title');
        const mvArtist = mvDetail.querySelector('.mv-artist');
        const mvCover = mvDetail.querySelector('.mv-cover img');
        const mvPlayer = mvDetail.querySelector('#mv-player');

        mvTitle.textContent = mv.name;
        mvArtist.textContent = mv.artistName;
        mvCover.src = mv.cover;
        mvPlayer.src = url;

        mvDetail.classList.add('show');
        modalBackdrop.classList.add('show');
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
    const audioVisualizationBtn = document.querySelector('.btn-audioVisualization')
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
    const songTitle = document.querySelector('#song-title');
    const songArtist = document.querySelector('#song-artist');

    // 播放器状态
    const playerState = {
        isPlaying: false,
        isMuted: false,
        isShuffled: false,
        repeatMode: 'none', // 'none', 'all', 'one'
        isFavorite: false,
        volume: 0.6,
        currentTrackIndex: 0,
        playlist: [

        ]
    };

    // 初始化播放器
    function initPlayer() {
        // 设置初始音量
        audioPlayer.volume = playerState.volume;
        updateVolumeUI();

        if (playerState.playlist.length > 0) {
            loadAndPlayTrack(playerState.currentTrackIndex);
        } else {
            songTitle.textContent = '暂无歌曲';
            songArtist.textContent = '请添加歌曲到播放列表';
            musicCover.src = './img/crayon.jpg';
            totalTimeEl.textContent = '0:00';
            currentTimeEl.textContent = '0:00';
        }

        const lyricsBtn = document.querySelector('.btn-lyrics');
        if (lyricsBtn) {
            lyricsBtn.addEventListener('click', openLyricsPanel);
        }

        const btnAddPlaylist = document.querySelector('.btn-add-playlist');

        btnAddPlaylist.addEventListener('click', (e) => {
            e.stopPropagation();

            if (playerState.playlist.length === 0 || playerState.currentTrackIndex < 0) {
                showNotification('没有正在播放的歌曲');
                return;
            }

            const songs = playerState.playlist;
            const index = playerState.currentTrackIndex;
            const songId = songs[index].id;

            if (!songId) {
                showNotification('无法添加该歌曲到歌单');
                return;
            }

            currentSelectedSongId = songId;
            showAddToPlaylistModal(songId);
        });

        const btnDownload = document.querySelector('.btn-download');
        btnDownload.addEventListener('click', downloadCurrentTrack);


        attachEventListeners();
    }

    function downloadCurrentTrack() {
        if (playerState.playlist.length === 0 || playerState.currentTrackIndex < 0) {
            showNotification('没有正在播放的歌曲');
            return;
        }

        const track = playerState.playlist[playerState.currentTrackIndex];

        if (!track.audio) {
            showNotification('歌曲正在加载中，请稍后再试');
            return;
        }

        showNotification(`正在下载：${track.title}`);

        fetch(track.audio)
            .then(response => response.blob())
            .then(blob => {
                const url = window.URL.createObjectURL(blob);

                const downloadLink = document.createElement('a');
                downloadLink.href = url;
                downloadLink.download = `${track.title} - ${track.artist}.mp3`;
                downloadLink.style.display = 'none';

                document.body.appendChild(downloadLink);

                downloadLink.click();

                setTimeout(() => {
                    document.body.removeChild(downloadLink);
                    window.URL.revokeObjectURL(url);
                }, 100);
            })
            .catch(error => {
                console.error('下载歌曲失败:', error);
                showNotification('下载歌曲失败，请稍后再试');
            });
    }


    // 播放音频
    function playAudio() {
        audioPlayer.play().then(() => {
            playerState.isPlaying = true;
            playIcon.style.display = 'none';
            pauseIcon.style.display = 'block';
            musicCover.classList.add('playing');
            visualization();

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
            loadAndPlayTrack(playerState.currentTrackIndex);
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
        loadAndPlayTrack(playerState.currentTrackIndex);
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
        loadAndPlayTrack(playerState.currentTrackIndex);
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
        console.log('切换随机播放');
        playerState.isShuffled = !playerState.isShuffled;
        shuffleBtn.classList.toggle('active', playerState.isShuffled);
    }

    // 切换重复模式
    function toggleRepeat() {
        console.log('切换重复模式');
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


    // 音频可视化函数

    let visualizationActive = false;
    let audioContext = null;
    let analyser = null;
    let animationId = null;
    let audioSource = null;

    function stopVisualization() {
        visualizationActive = false;
        if (animationId) {
            cancelAnimationFrame(animationId);
            animationId = null;
        }

        if (audioSource) {
            try {
                audioSource.disconnect();
                audioSource = null;
            } catch (e) {
                console.error('断开音频源失败:', e);
            }
        }

        if (analyser) {
            try {
                analyser.disconnect();
                analyser = null;
            } catch (e) {
                console.error('断开分析器失败:', e);
            }
        }

        if (audioContext && audioContext.state !== 'closed') {
            try {
                if (typeof audioContext.close === 'function') {
                    audioContext.close();
                }
                audioContext = null;
            } catch (e) {
                console.error('关闭音频上下文失败:', e);
            }
        }
    }

    let isVasualization = false;

    async function visualization() {
        // 如果没有正在播放的歌曲，显示提示并返回
        if (!playerState.playlist.length || playerState.currentTrackIndex < 0) {
            showNotification('没有正在播放的歌曲');
            return;
        }

        if (audioContext && audioSource && analyser) {
            return;
        }

        if(isVasualization){
            stopVisualization();
        }

        if (visualizationActive && audioSource && analyser) {
            return;
        }

        const track = playerState.playlist[playerState.currentTrackIndex];
        const currentTime = audioPlayer.currentTime;
        const wasPlaying = !audioPlayer.paused;

        stopVisualization();
        visualizationActive = true;

        if (!track.audio) {
            showNotification('当前歌曲音频资源不可用');
            return;
        } else if (!track.audio.startsWith('http://localhost:3001')) {
            const originalUrl = track.audio;
            track.audio = `http://localhost:3001/proxy-audio?url=${encodeURIComponent(originalUrl)}`;
        }
        audioPlayer.crossOrigin = "anonymous"; 


        if (audioPlayer.src !== track.audio) {
            audioPlayer.src = track.audio;
            
            if (wasPlaying) {
                await audioPlayer.play().catch(err => console.error('重新播放失败:', err));
            }
        }
        try {
            // 创建新的音频上下文
            audioContext = new (window.AudioContext || window.webkitAudioContext)();

            // 创建分析器
            analyser = audioContext.createAnalyser();
            analyser.fftSize = 512;

            // 创建音频源并连接
            audioSource = audioContext.createMediaElementSource(audioPlayer);
            audioSource.connect(analyser);
            analyser.connect(audioContext.destination);

            // 获取频率
            const bufferLength = analyser.frequencyBinCount;
            const dataArray = new Uint8Array(bufferLength);

            // 获取并设置Canvas
            const canvas = document.getElementById('visualizer');
            if (!canvas) {
                console.error('找不到可视化Canvas');
                stopVisualization();
                return;
            }

            const canvasCtx = canvas.getContext('2d');

            // 设置Canvas尺寸
            const container = canvas.parentElement;
            if (container) {
                canvas.width = container.clientWidth || 500;
                canvas.height = container.clientHeight || 300;
            } else {
                canvas.width = 500;
                canvas.height = 300;
            }

            // 绘制
            function draw() {
                if (!visualizationActive) return;

                animationId = requestAnimationFrame(draw);

                analyser.getByteFrequencyData(dataArray);

                canvasCtx.clearRect(0, 0, canvas.width, canvas.height);

                const barWidth = (canvas.width / bufferLength) * 2.5;
                let x = 0;

                for (let i = 0; i < bufferLength; i++) {
                    const barHeight = dataArray[i] * 1.5;

                    const r = 220 - (dataArray[i] / 5);
                    const g = 180 + (dataArray[i] / 3);
                    const b = 250 - ((i / bufferLength) * 100);

                    canvasCtx.fillStyle = `rgb(${r}, ${g}, ${b})`;
                    canvasCtx.fillRect(x, canvas.height - barHeight, barWidth, barHeight);

                    x += barWidth + 1;
                }
                isVasualization = true;
            }
            //开始画

            draw();

            // 如果wasPlaying为true但当前不是播放状态，则恢复播放
            if (wasPlaying && !playerState.isPlaying) {
                playAudio();
            }


        } catch (error) {
            console.error('音频可视化初始化失败:', error);
            showNotification('音频可视化初始化失败');

            // 恢复播放状态
            if (wasPlaying && !playerState.isPlaying) {
                playAudio();
            }
        }
    }

    // 切换收藏
    function toggleFavorite() {
        if (playerState.playlist.length === 0 || !playerState.playlist[playerState.currentTrackIndex]) {
            showNotification('没有正在播放的歌曲');
            return;
        }

        const track = playerState.playlist[playerState.currentTrackIndex];
        const songId = track.id;
        const token = localStorage.getItem('token');

        if (!token) {
            showNotification('请先登录');
            return;
        }

        // 切换收藏状态
        const newFavoriteState = !playerState.isFavorite;
        playerState.isFavorite = newFavoriteState;

        // 更新UI
        heartIcon.style.display = newFavoriteState ? 'none' : 'block';
        heartFilledIcon.style.display = newFavoriteState ? 'block' : 'none';

        // 添加动画效果
        if (newFavoriteState) {
            favoriteBtn.classList.add('animating');
            setTimeout(() => favoriteBtn.classList.remove('animating'), 800);
        }

        // 调用收藏/取消收藏API
        collectSong(songId, token, newFavoriteState);

        // 显示通知
        const message = newFavoriteState
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
        updateLyrics(currentTime);
    }


    let userScrolling = false;
    let scrollTimeout = null;

    function updateLyrics(currentTime) {
        const lyricsModal = document.getElementById('lyricsModal');
        if (!lyricsModal || !lyricsModal.classList.contains('show')) {
            return;
        }
        const currentTrack = playerState.playlist[playerState.currentTrackIndex];

        if (!currentTrack || !currentTrack.lyrics) {
            return;
        }

        const lyrics = currentTrack.lyrics;

        let activeIndex = -1;
        for (let i = 0; i < lyrics.length; i++) {
            if (currentTime >= lyrics[i].time &&
                (i === lyrics.length - 1 || currentTime < lyrics[i + 1].time)) {
                activeIndex = i;
                break;
            }
        }

        if (activeIndex === -1) {
            for (let i = lyrics.length - 1; i >= 0; i--) {
                if (lyrics[i].time <= currentTime) {
                    activeIndex = i;
                    break;
                }
            }
        }

        document.querySelectorAll('.lyrics-line').forEach(line => {
            line.classList.remove('active', 'near');
        });

        if (activeIndex !== -1) {
            const activeLine = document.querySelector(`.lyrics-line[data-index="${activeIndex}"]`);
            if (activeLine) {
                // 高亮当前行
                activeLine.classList.add('active');

                // 高亮前后各一行
                if (activeIndex > 0) {
                    const prevLine = document.querySelector(`.lyrics-line[data-index="${activeIndex - 1}"]`);
                    if (prevLine) prevLine.classList.add('near');
                }

                if (activeIndex < lyrics.length - 1) {
                    const nextLine = document.querySelector(`.lyrics-line[data-index="${activeIndex + 1}"]`);
                    if (nextLine) nextLine.classList.add('near');
                }

                if (!userScrolling) {
                    smoothScrollToLyric(activeLine);
                }
            }
        }
    }

    function smoothScrollToLyric(element) {
        if (!element) return;

        const lyricsContainer = document.querySelector('.lyrics-container');
        if (!lyricsContainer) return;

        const containerRect = lyricsContainer.getBoundingClientRect();
        const elementRect = element.getBoundingClientRect();

        const idealScrollTop = element.offsetTop - (containerRect.height / 2) + (elementRect.height / 2);

        lyricsContainer.scrollTo({
            top: idealScrollTop,
            behavior: 'smooth'
        });
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

    function showVisualizationModal() {
        const modal = document.getElementById('visualizerModal');
        modal.classList.add('show');
        modalBackdrop.classList.add('show');
        document.body.style.overflow = 'hidden';
        if (playerState.isPlaying && (!visualizationActive || !audioContext)) {
            visualization();
        }
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
        shuffleBtn.addEventListener('click', () => {
            shuffleBtn.classList.toggle('active');
        });

        repeatBtn.addEventListener('click', toggleRepeat);


        favoriteBtn.addEventListener('click', toggleFavorite);

        audioVisualizationBtn.addEventListener('click', showVisualizationModal);

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
        audioPlayer.addEventListener('ended', () => {
            handleTrackEnd();
            if (!playerState.isPlaying) {
                stopVisualization();
            }
        });

        // 歌曲封面也能点击
        musicCover.addEventListener('click', () => {
            if (playerState.isPlaying) {
                pauseAudio();
            } else {
                playAudio();
            }
        });
    }

    async function loadAndPlayTrack(index) {
        const track = playerState.playlist[index];
        playerState.currentTrackIndex = index;
        console.log('播放:', track);

        songTitle.textContent = track.title;
        songArtist.textContent = track.artist;
        musicCover.src = track.cover;

        if (!track.audio) {
            try {
                showNotification(`正在获取 ${track.title} 的音频...`);
                const songUrlData = await getSongUrlBySongId(track.id);
                if (songUrlData.data[0].url) {
                    const originalUrl = songUrlData.data[0].url;
                    track.audio = `http://localhost:3001/proxy-audio?url=${encodeURIComponent(originalUrl)}`;
                    audioPlayer.crossOrigin = "anonymous";
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
        } else if (!track.audio.includes('/proxy-audio?url=')) {
            track.audio = `http://localhost:3001/proxy-audio?url=${encodeURIComponent(track.audio)}`;
            audioPlayer.crossOrigin = "anonymous";
        }
        audioPlayer.src = track.audio;
        totalTimeEl.textContent = formatTime(track.duration);

        progress.style.width = '0%';
        progressHandle.style.left = '0%';
        currentTimeEl.textContent = '0:00';

        playAudio();

        const lyricsModal = document.getElementById('lyricsModal');
        if (lyricsModal && lyricsModal.classList.contains('show')) {
            loadLyrics();
        }

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

        // 检查歌曲是否已收藏
        if (track.id) {
            checkIfSongIsFavorite(track.id);
        }

        updataPlaylistUI();
    }

    // 检查歌曲是否已收藏
    async function checkIfSongIsFavorite(songId) {
        const token = localStorage.getItem('token');
        if (!token) return;

        try {
            const favoriteSongs = await getFavoriteSongs(token);
            if (favoriteSongs && favoriteSongs.data) {
                const isFavorite = favoriteSongs.data.includes(songId);
                playerState.isFavorite = isFavorite;
                heartIcon.style.display = isFavorite ? 'none' : 'block';
                heartFilledIcon.style.display = isFavorite ? 'block' : 'none';
            }
        } catch (error) {
            console.error('检查歌曲收藏状态失败:', error);
        }
    }

    initPlayer();


    //下方的歌单列表按钮点击逻辑

    const playListBtn = document.querySelector('.btn-playlist');
    const playList = document.querySelector('.playlist');

    playListBtn.addEventListener('click', (e) => {
        console.log("歌单按钮被点击了");
        e.stopPropagation();
        playList.classList.toggle('show');
    });

    //点击其他位置关闭播放列表
    document.addEventListener('click', (e) => {
        if (e.target !== playListBtn && !playList.contains(e.target)) {
            playList.classList.remove('show');
        }
    });

    // 根据分类获取而歌手名称
    const vercel = axios.create({
        baseURL: 'http://47.99.53.155:3000',
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
        return vercel.get(`/song/url/v1?id=${singerId}&level=exhigh`)
            .then(response => response.data);
    }

    //检查音乐能不能听
    function checkSingleMusicPlayable(songId) {
        return vercel.get(`/check/music?id=${songId}`)
            .then(response => response.data.success);
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
                    showArtistDetail(singerId, singerName, songs);
                } else {
                    showNotification("未找到该歌手的热门歌曲");
                }
            } catch (error) {
                console.error("获取歌手热门歌曲失败:", error);
                showNotification("获取歌手热门歌曲失败，请稍后再试");
            }
        }
    });

    let checkingMusicAbortController = null;

    //显示歌手详情页
    async function showArtistDetail(singerId, singerName, songs) {

        //如果需要中断，就直接终端请求
        if (checkingMusicAbortController) {
            checkingMusicAbortController.abort();
        }

        checkingMusicAbortController = new AbortController();

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
                        <div class="song-row" data-id="${song.id}" data-index="${index}">
                            <div class="col-num">${index + 1}</div>
                            <div class="col-title">
                                <img src="${song.al.picUrl || './img/crayon.jpg'}" alt="${song.name}">
                                <div>
                                    <div class="song-name">${song.name}</div>
                                    <div class="song-artist">${song.ar.map(a => a.name).join(', ')}</div>
                                </div>
                            </div>
                            <div class="col-album">${song.al.name}</div>
                            <div class="col-duration">${formatTime(song.dt / 1000)}</div>
                            <div class="col-actions">
                            <button class="btn-add-to-myplaylist" title="添加到我的歌单">
                                <svg t="1741961915966" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1506" width="16" height="16">
                                    <path d="M978.823529 843.294118 873.411765 843.294118 873.411765 978.823529C873.411765 1003.760941 853.172706 1024 828.235294 1024 803.297882 1024 783.058824 1003.760941 783.058824 978.823529L783.058824 843.294118 677.647059 843.294118C652.709647 843.294118 632.470588 823.055059 632.470588 798.117647 632.470588 773.150118 652.709647 752.941176 677.647059 752.941176L783.058824 752.941176 783.058824 647.529412C783.058824 622.561882 803.297882 602.352941 828.235294 602.352941 853.172706 602.352941 873.411765 622.561882 873.411765 647.529412L873.411765 752.941176 978.823529 752.941176C1003.760941 752.941176 1024 773.150118 1024 798.117647 1024 823.055059 1003.760941 843.294118 978.823529 843.294118ZM647.529412 692.705882 225.882353 692.705882C200.944941 692.705882 180.705882 672.466824 180.705882 647.529412 180.705882 622.561882 200.944941 602.352941 225.882353 602.352941L647.529412 602.352941C672.466824 602.352941 692.705882 622.561882 692.705882 647.529412 692.705882 672.466824 672.466824 692.705882 647.529412 692.705882ZM647.529412 331.294118 225.882353 331.294118C200.944941 331.294118 180.705882 311.055059 180.705882 286.117647 180.705882 261.150118 200.944941 240.911059 225.882353 240.911059L647.529412 240.911059C672.466824 240.911059 692.705882 261.150118 692.705882 286.117647 692.705882 311.055059 672.466824 331.294118 647.529412 331.294118ZM647.529412 512 225.882353 512C200.944941 512 180.705882 491.760941 180.705882 466.823529 180.705882 441.856 200.944941 421.647059 225.882353 421.647059L647.529412 421.647059C672.466824 421.647059 692.705882 441.856 692.705882 466.823529 692.705882 491.760941 672.466824 512 647.529412 512ZM828.235294 542.117647C803.297882 542.117647 783.058824 521.878588 783.058824 496.911059L783.058824 90.352941 90.352941 90.352941 90.352941 903.529412 647.529412 903.529412C672.466824 903.529412 692.705882 923.738353 692.705882 948.705882 692.705882 973.643294 672.466824 993.882353 647.529412 993.882353L45.176471 993.882353C20.239059 993.882353 0 973.643294 0 948.705882L0 45.176471C0 20.239059 20.239059 0 45.176471 0L828.235294 0C853.172706 0 873.411765 20.239059 873.411765 45.176471L873.411765 496.911059C873.411765 521.878588 853.172706 542.117647 828.235294 542.117647Z" p-id="1507">
                                    </path>
                                </svg>
                            </button>
                            <button class="btn-add-to-playlist" title="加入播放列表">
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                                </svg>
                            </button>
                            <button class="favorite-btn" title="收藏">
                                <svg t="1741919593749" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="3434" width="200" height="200"><path d="M523.3408 232.192l-5.7344 4.7104-5.888 5.1456-3.5072-3.1744a230.912 230.912 0 0 0-39.8592-27.8016c-55.6544-30.8224-121.7024-36.736-195.328-8.192-93.0304 36.0448-148.8896 139.52-130.8672 254.3872 20.6592 131.584 130.304 261.4784 327.3984 367.8208 12.7488 6.8608 25.216 10.8032 36.5312 11.9296l3.3024 0.256 2.2272 0.0512c13.44-0.4352 27.52-4.4544 41.984-12.2368 197.12-106.3424 306.7648-236.2624 327.424-367.8208 18.0224-114.8928-37.8368-218.3424-130.8672-254.3872-86.7072-33.6128-161.6128-19.456-220.672 24.576l-6.144 4.7616z m203.6992 30.3616c64.256 24.9088 104.192 98.944 90.752 184.8064-17.2032 109.5168-113.664 223.7952-294.5536 321.3824l-2.8672 1.4592a34.8672 34.8672 0 0 1-8.576 2.9952l-0.3584 0.0512a39.168 39.168 0 0 1-11.4944-4.5056c-180.9152-97.5872-277.376-211.8656-294.5536-321.3824-13.4656-85.8624 26.496-159.8976 90.752-184.8064 55.4496-21.504 101.7344-17.3568 141.184 4.5056a161.7408 161.7408 0 0 1 36.2496 27.4432c5.0432 5.0688 8.6016 9.2416 10.6496 11.9552l27.1872 39.1936 26.368-37.6064c1.2288-1.7152 3.4816-4.5824 7.168-8.6784 6.4-6.9888 14.0032-14.0288 22.8096-20.608 42.2912-31.5392 94.336-41.3696 159.2832-16.2048z" fill="#FB553C" p-id="3435"></path></svg>
                            </button>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>
    `;

        mainContentAera.innerHTML = detailHTML;

        document.querySelectorAll('.favorite-btn').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();

                const songId = songs[index].id;
                const token = localStorage.getItem('token');

                if (!token) {
                    showNotification('请先登录');
                    return;
                }

                const isFavorite = !btn.classList.contains('active');

                if (isFavorite) {
                    btn.classList.add('active', 'animating');
                    setTimeout(() => btn.classList.remove('animating'), 800);
                    showNotification(`已添加《${songs[index].name}》到我喜欢的音乐`);
                } else {
                    btn.classList.remove('active');
                    showNotification(`已从我喜欢的音乐中移除《${songs[index].name}》`);
                }


                collectSong(songId, token, isFavorite);
            });
        });

        mainContentAera.scrollTop = 0;
        const style = document.createElement('style');
        style.textContent = `
            .song-row.unplayable {
                opacity: 0.6;
                cursor: not-allowed;
            }
            .unplayable-icon {
                margin-left: 5px;
                color: #ff5252;
                display: inline-flex;
                align-items: center;
            }
            .loading-songs {
                text-align: center;
                padding: 20px;
                color: var(--text-secondary);
            }
            .checking-playable {
                font-size: 12px;
                color: #888;
                margin-left: 5px;
            }
            .col-actions {
                display: flex;
                justify-content: center;
                align-items: center;
                width: 50px;
            }
            .btn-add-to-playlist {
                background: transparent;
                border: none;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                color: var(--text-secondary);
                transition: background-color 0.2s, color 0.2s;
            }
            .btn-add-to-playlist:hover {
                background-color: rgba(128, 128, 128, 0.2);
                color: var(--accent-primary);
            }
            .song-row.unplayable .btn-add-to-playlist {
                opacity: 0.5;
                cursor: not-allowed;
            }
        `;
        document.head.appendChild(style);

        document.querySelector('.back-button').addEventListener('click', () => {
            if (checkingMusicAbortController) {
                checkingMusicAbortController.abort();
                checkingMusicAbortController = null;
            }

            showSingersList();
        });

        document.querySelector('.play-all-btn').addEventListener('click', () => {
            const playableSongs = songs.filter((song, index) => !document.querySelectorAll('.song-row')[index].classList.contains('unplayable'));
            if (playableSongs.length > 0) {
                const newPlaylist = playableSongs.map(song => {
                    return {
                        id: song.id,
                        title: song.name,
                        artist: song.ar.map(a => a.name).join(', '),
                        cover: song.al.picUrl || './img/crayon.jpg',
                        audio: null,
                        duration: song.dt / 1000,
                        playable: true
                    };
                });

                // 更新播放列表
                playerState.playlist = newPlaylist;
                playerState.currentTrackIndex = 0;

                // 播放第一首
                loadAndPlayTrack(0);
                showNotification(`已添加 ${playableSongs.length} 首歌曲到播放列表`);
            } else {
                showNotification('没有可播放的歌曲');
            }
        });
        document.querySelectorAll('.song-row').forEach(row => {
            row.addEventListener('click', (e) => {
                if (e.target.closest('.btn-add-to-playlist')) {
                    return;
                }
                if (row.classList.contains('unplayable')) {
                    showNotification('该歌曲无法播放');
                } else {
                    const songIndex = parseInt(row.getAttribute('data-index'));
                    const song = songs[songIndex];

                    const singleSongPlaylist = [{
                        id: song.id,
                        title: song.name,
                        artist: song.ar.map(a => a.name).join(', '),
                        cover: song.al.picUrl || './img/crayon.jpg',
                        audio: null,
                        duration: song.dt / 1000,
                        playable: true
                    }];

                    // 替换播放列表并播放
                    playerState.playlist = singleSongPlaylist;
                    playerState.currentTrackIndex = 0;
                    loadAndPlayTrack(0);
                }
            });
            const addToPlaylistBtn = row.querySelector('.btn-add-to-playlist');
            addToPlaylistBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                if (row.classList.contains('unplayable')) {
                    showNotification('无法添加不可播放的歌曲');
                    return;
                }

                const songIndex = parseInt(row.getAttribute('data-index'));
                const song = songs[songIndex];

                const trackToAdd = {
                    id: song.id,
                    title: song.name,
                    artist: song.ar.map(a => a.name).join(', '),
                    cover: song.al.picUrl || './img/crayon.jpg',
                    audio: null,
                    duration: song.dt / 1000,
                    playable: true
                };

                // 检查歌曲是否已在列表中
                const existingIndex = playerState.playlist.findIndex(track => track.id === trackToAdd.id);

                if (existingIndex !== -1) {
                    showNotification('该歌曲已在播放列表中');
                } else {
                    playerState.playlist.push(trackToAdd);
                    updataPlaylistUI();
                    showNotification(`已添加《${song.name}》到播放列表`);
                }
            });
            //点击按钮显示我的歌单模态框，进行选择歌单或者创建新歌单，把歌曲添加到歌单（songId->playlistId）（3.15号做!!!）
            const addToMyPlaylistBtn = row.querySelector('.btn-add-to-myplaylist');


        });

        document.querySelectorAll('.btn-add-to-myplaylist').forEach((btn, index) => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation(); // 防止触发歌曲行的点击事件

                const songId = songs[index].id;
                const token = localStorage.getItem('token');

                if (!token) {
                    showNotification('请先登录');
                    return;
                }

                currentSelectedSongId = songId;
                closeAllModals();
                setTimeout(() => {
                    showAddToPlaylistModal(songId);
                }, 100);

            });
        });

        await checkMusicCanPlay(songs, checkingMusicAbortController.signal);

        updataPlaylistUI();
    }

    let currentSelectedSongId = null;

    function showAddToPlaylistModal(songId) {
        const addToPlaylistModal = document.getElementById('addToPlaylistModal');

        if (!addToPlaylistModal) {
            console.error('找不到添加到歌单模态框');
            return;
        }

        currentSelectedSongId = songId;

        loadUserPlaylists().then(() => {
            document.querySelectorAll('.modal').forEach(modal => {
                if (modal.id !== 'addToPlaylistModal') {
                    modal.classList.remove('show');
                }
            });

            addToPlaylistModal.classList.add('show');
            modalBackdrop.classList.add('show');
        });
    }

    // 加载用户歌单
    async function loadUserPlaylists() {
        try {
            const userPlaylistsContainer = document.querySelector('.user-playlists-container');
            userPlaylistsContainer.innerHTML = '<div class="loading-indicator">加载中...</div>';

            const token = localStorage.getItem('token');
            if (!token) {
                userPlaylistsContainer.innerHTML = '<div class="error-message">请先登录</div>';
                return;
            }

            const response = await infoAPI.get('/api/playlists', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            const playlists = response.data.data;
            renderUserPlaylists(playlists);
        } catch (error) {
            console.error('获取用户歌单失败:', error);
            const userPlaylistsContainer = document.querySelector('.user-playlists-container');
            userPlaylistsContainer.innerHTML = '<div class="error-message">加载歌单失败，请稍后再试</div>';
        }
    }

    // 渲染用户歌单列表
    function renderUserPlaylists(playlists) {
        const userPlaylistsContainer = document.querySelector('.user-playlists-container');

        if (!playlists || playlists.length === 0) {
            userPlaylistsContainer.innerHTML = '<div class="empty-message">暂无歌单，请创建新歌单</div>';
            return;
        }

        let playlistsHTML = '';
        playlists.forEach(playlist => {
            playlistsHTML += `
                <div class="playlist-item" data-id="${playlist._id}">
                    <img src="${playlist.coverUrl || './img/crayon.jpg'}" alt="${playlist.name}">
                    <div class="playlist-item-info">
                        <div class="playlist-item-name">${playlist.name}</div>
                        <div class="playlist-item-count">${playlist.songs ? playlist.songs.length : 0} 首歌曲</div>
                    </div>
                </div>
            `;
        });

        userPlaylistsContainer.innerHTML = playlistsHTML;

        // 添加点击歌单事件
        document.querySelectorAll('.playlist-item').forEach(item => {
            item.addEventListener('click', function () {
                const playlistId = this.getAttribute('data-id');
                addSongToPlaylist(currentSelectedSongId, playlistId);
            });
        });
    }

    // 添加歌曲到歌单
    async function addSongToPlaylist(songId, playlistId) {
        if (!songId || !playlistId) {
            showNotification('歌曲或歌单信息不完整');
            return;
        }

        const token = localStorage.getItem('token');
        if (!token) {
            showNotification('请先登录');
            return;
        }

        try {
            const response = await infoAPI.post(`/api/playlists/${playlistId}/songs`, {
                songId: songId
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.data.success) {
                showNotification('已添加到歌单');
                closeAllModals();
                // 更新我的歌单列表
                return true;
            } else {
                showNotification(response.data.message || '添加失败');
                return false;
            }
        } catch (error) {
            console.error('添加歌曲到歌单失败:', error);
            if (error.response && error.response.data && error.response.data.message) {
                showNotification(error.response.data.message);
            } else {
                showNotification('添加失败，请稍后再试');
            }
            return false;
        }
    }

    // 创建新歌单选项点击事件
    const createNewPlaylistOption = document.querySelector('.create-new-playlist-option');
    if (createNewPlaylistOption) {
        createNewPlaylistOption.addEventListener('click', () => {
            closeAllModals();
            setTimeout(() => {
                openModal('createPlaylistModal');
            }, 300);
        });
    }

    // 在歌手详情页和歌单详情页中也添加添加到歌单按钮的事件
    function setupAddToPlaylistButtons() {
        document.addEventListener('click', function (e) {
            const addToPlaylistBtn = e.target.closest('.btn-add-to-myplaylist');
            if (addToPlaylistBtn) {
                const songId = addToPlaylistBtn.getAttribute('data-song-id');
                if (songId) {
                    currentSelectedSongId = songId;
                    showAddToPlaylistModal(songId);
                }
            }
        });
    }

    // 初始化添加到歌单按钮
    setupAddToPlaylistButtons();

    // 修改创建歌单逻辑，支持创建后立即添加歌曲



    //检查歌曲是否可以播放

    async function checkMusicCanPlay(songs, abortSignal) {
        const songRows = document.querySelectorAll('.song-row');

        for (let i = 0; i < songs.length; i++) {
            //检查一下abort
            if (abortSignal && abortSignal.aborted) {
                return;
            }


            const songId = songs[i].id;
            const songRow = songRows[i];

            const songNameElement = songRow.querySelector('.song-name');
            const checkingElement = document.createElement('span');

            checkingElement.textContent = '检查中...';
            checkingElement.className = 'checking-playable';
            songNameElement.appendChild(checkingElement);

            try {
                const canPlay = await checkSingleMusicPlayable(songId);
                checkingElement.remove();


                if (!canPlay) {
                    songRow.classList.add('unplayable');

                    const unplayableIcon = document.createElement('div');
                    unplayableIcon.className = 'unplayable-icon';
                    unplayableIcon.title = '该歌曲暂时无法播放';
                    unplayableIcon.innerHTML = `
                        <svg viewBox="0 0 24 24" width="16" height="16">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.14 8 8-3.14 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
                        </svg>
                    `;
                    songNameElement.appendChild(unplayableIcon);
                }
            } catch (error) {
                console.error('音乐播放不了:', error);
                checkingElement.remove();
                songRow.classList.add('unplayable');

                const errorIcon = document.createElement('div');
                errorIcon.className = 'unplayable-icon';
                errorIcon.title = '音乐无法播放';
                errorIcon.innerHTML = `
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.14 8 8-3.14 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="currentColor"/>
                </svg>
                `;
                songNameElement.appendChild(errorIcon);
            }


        }
    }

    //缓存
    let cachedSingers = null;

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
        <div class="playlistClassification">
            <ul>
                <li data-cat="全部" class="all">全部</li>
                <li data-cat="华语">华语</li>
                <li data-cat="古风">古风</li>
                <li data-cat="流行">流行</li>
                <li data-cat="摇滚">摇滚</li>
                <li data-cat="民谣">民谣</li>
                <li data-cat="电子">电子</li>
            </ul>
        </div>
        <div class="classified-playlist">
            <div class="loading-indicator">加载中...</div>
        </div>
    `;

        // 获取新的元素
        const classifiedSinger = document.querySelector('.classified-singer');
        const classifiedPlaylist = document.querySelector('.classified-playlist');

        // 加载歌手数据
        if (cachedSingers) {
            renderSingers(cachedSingers, classifiedSinger);
        } else {
            // 只在没有缓存时请求数据
            getSingerByType(-1).then(res => {
                cachedSingers = res;
                renderSingers(res, classifiedSinger);
            }).catch(error => {
                console.error('获取歌手数据失败:', error);
                classifiedSinger.innerHTML = '<div class="error-message">获取歌手数据失败，请稍后再试</div>';
            });
        }

        // 加载歌单数据
        getPlaylistAll().then(res => {
            let innerHTML = res.map((item) => {
                return `
                <div class="playlist-items">
                    <img src="${item.coverImgUrl}" alt="${item.name}">
                    <div class="playlist-info">
                        <div class="playlist-name" data-id="${item.id}">${item.name}</div>
                        <div class="playlist-author">${item.creator.nickname}</div>
                        <div class="playlist-description">${item.description || ''}</div>
                    </div>
                </div>`;
            }).join('');
            classifiedPlaylist.innerHTML = innerHTML;
        }).catch(error => {
            console.error('获取歌单数据失败:', error);
            classifiedPlaylist.innerHTML = '<div class="error-message">获取歌单数据失败，请稍后再试</div>';
        });



        // 重新绑定事件监听器
        const singerClassificationListByType = document.querySelector('.singerClassificationListByType');
        const singerClassificationListByArea = document.querySelector('.singerClassificationListByArea');
        const playlistClassification = document.querySelector('.playlistClassification');

        // 为类型筛选添加事件
        if (singerClassificationListByType) {
            singerClassificationListByType.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI') {
                    const singerType = e.target.getAttribute('data-type');
                    getSingerByType(singerType).then(res => {
                        renderSingers(res, classifiedSinger);
                    }).catch(error => {
                        console.error('获取歌手数据失败:', error);
                        classifiedSinger.innerHTML = '<div class="error-message">获取歌手数据失败，请稍后再试</div>';
                    });
                }
            });
        }

        // 为地区筛选添加事件
        if (singerClassificationListByArea) {
            singerClassificationListByArea.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI') {
                    const singerArea = e.target.getAttribute('data-area');
                    getSingerByArea(singerArea).then(res => {
                        renderSingers(res, classifiedSinger);
                    }).catch(error => {
                        console.error('获取歌手数据失败:', error);
                        classifiedSinger.innerHTML = '<div class="error-message">获取歌手数据失败，请稍后再试</div>';
                    });
                }
            });
        }

        // 为歌单分类添加事件
        if (playlistClassification) {
            playlistClassification.addEventListener('click', (e) => {
                if (e.target.tagName === 'LI') {
                    const playlistCat = e.target.getAttribute('data-cat');
                    getPlaylistByCat(playlistCat).then(res => {
                        let innerHTML = res.map((item) => {
                            return `
                        <div class="playlist-items">
                            <img src="${item.coverImgUrl}" alt="${item.name}">
                            <div class="playlist-info">
                                <div class="playlist-name" data-id="${item.id}">${item.name}</div>
                                <div class="playlist-author">${item.creator.nickname}</div>
                                <div class="playlist-description">${item.description || ''}</div>
                            </div>
                        </div>`;
                        }).join('');
                        classifiedPlaylist.innerHTML = innerHTML;
                    }).catch(error => {
                        console.error('获取歌单数据失败:', error);
                        classifiedPlaylist.innerHTML = '<div class="error-message">获取歌单数据失败，请稍后再试</div>';
                    });
                }
            });
        }

        // 为歌单点击添加事件
        classifiedPlaylist.addEventListener('click', async (e) => {
            if (e.target.classList.contains('playlist-name') || e.target.closest('.playlist-items')) {
                const playlistId = e.target.classList.contains('playlist-name') ?
                    e.target.getAttribute('data-id') :
                    e.target.closest('.playlist-items').querySelector('.playlist-name').getAttribute('data-id');

                const playlistNameElement = e.target.closest('.playlist-items').querySelector('.playlist-name');
                const playlistName = playlistNameElement.textContent;
                showNotification(`正在加载 ${playlistName} 的歌曲...`);

                try {
                    const songs = await getPlaylistSongs(playlistId);
                    console.log("歌单歌曲:", songs);

                    if (songs && songs.length > 0) {
                        showPlaylistDetail(playlistId, playlistName, songs);
                    } else {
                        showNotification("未找到该歌单的歌曲");
                    }
                } catch (error) {
                    console.error("获取歌单歌曲失败:", error);
                    showNotification("获取歌单歌曲失败，请稍后再试");
                }
            }
        });
    }

    //渲染歌手
    function renderSingers(singers, container) {
        let innerHTML = singers.map((item) => {
            return `                   
                 <div class="singer-items">
                    <img src="${item.picUrl}" alt="${item.name}" loading="lazy">
                    <div class="singer-info">
                        <div class="singer-name" data-id="${item.id}">${item.name}</div>
                    </div>
                </div>`
        }).join('');
        container.innerHTML = innerHTML;

        addSingerClickEvents(container);
    }

    //添加歌手点击事件
    function addSingerClickEvents(container) {
        container.addEventListener('click', async (e) => {
            const singerItem = e.target.closest('.singer-items');
            if (!singerItem) return;

            const singerNameElement = singerItem.querySelector('.singer-name');
            if (!singerNameElement) return;

            const singerId = singerNameElement.getAttribute('data-id');
            const singerName = singerNameElement.textContent;

            showNotification(`正在加载 ${singerName} 的热门歌曲...`);

            try {
                if (checkingMusicAbortController) {
                    checkingMusicAbortController.abort();
                }
                checkingMusicAbortController = new AbortController();

                // 获取歌手热门歌曲
                const songs = await getSingerHotSong(singerId);
                if (!songs || songs.length === 0) {
                    showNotification(`${singerName} 暂无热门歌曲`);
                    return;
                }

                // 显示歌手详情页
                await showArtistDetail(singerId, singerName, songs);
            } catch (error) {
                console.error('获取歌手热门歌曲失败:', error);
                showNotification(`获取 ${singerName} 的热门歌曲失败，请稍后再试`);
            }
        });
    }

    async function loadAndPlayTrack(index) {
        const track = playerState.playlist[index];
        playerState.currentTrackIndex = index;
        console.log('播放:', track);

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


        // 检查歌曲是否已收藏
        if (track.id) {
            checkIfSongIsFavorite(track.id);
        }

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

    // 精品分类歌单展示

    const playlistClassification = document.querySelector('.playlistClassification');
    const classifiedPlaylist = document.querySelector('.classified-playlist');
    // 请求歌单图片，名称，id
    function getPlaylistByCat(cat) {
        return vercel.get(`/top/playlist/highquality?cat=${cat}&limit=20`)
            .then(response => response.data.playlists);
    }

    function getPlaylistAll() {
        return vercel.get(`/top/playlist/highquality?limit=20`)
            .then(response => response.data.playlists);
    }
    // 默认获取全部歌单
    (() => {
        getPlaylistAll().then(res => {
            let innerHTML = res.map((item) => {
                return `
                <div class="playlist-items">
                    <img src="${item.coverImgUrl}" alt="${item.name}">
                    <div class="playlist-info">
                        <div class="playlist-name" data-id="${item.id}">${item.name}</div>
                        
                        <div class="playlist-author">${item.creator.nickname}</div>
                        <div class="playlist-description">${item.description}</div>
                    </div>
                </div>`
            }).join('');
            classifiedPlaylist.innerHTML = innerHTML;
        }).catch(error => {
            console.error('获取歌单数据失败:', error);
            classifiedPlaylist.innerHTML = '<div class="error-message">获取歌单数据失败，请稍后再试</div>';
        });
    })()


    playlistClassification.addEventListener('click', (e) => {
        if (e.target.tagName === 'LI') {
            const playlistCat = e.target.getAttribute('data-cat');
            getPlaylistByCat(playlistCat).then(res => {
                let innerHTML = res.map((item) => {
                    return `
                    <div class="playlist-items">
                        <img src="${item.coverImgUrl}" alt="${item.name}">
                        <div class="playlist-info">
                            <div class="playlist-name" data-id="${item.id}">${item.name}</div>
                            <div class="playlist-author">${item.creator.nickname}</div>
                            <div class="playlist-description">${item.description}</div>
                        </div>
                    </div>`
                }).join('');
                classifiedPlaylist.innerHTML = innerHTML;
            }).catch(error => {
                console.error('获取歌单数据失败:', error);
                classifiedPlaylist.innerHTML = '<div class="error-message">获取歌单数据失败，请稍后再试</div>';
            });
        }
    });


    //点击歌单进入歌单详情页

    const playlistItems = document.querySelector('.classified-playlist');

    playlistItems.addEventListener('click', async (e) => {
        if (e.target.classList.contains('playlist-name') || e.target.closest('.playlist-items')) {
            const playlistId = e.target.classList.contains('playlist-name') ?
                e.target.getAttribute('data-id') :
                e.target.closest('.playlist-items').querySelector('.playlist-name').getAttribute('data-id');

            const playlistNameElement = e.target.closest('.playlist-items').querySelector('.playlist-name');
            const playlistName = playlistNameElement.textContent;
            showNotification(`正在加载 ${playlistName} 的歌曲...`);

            try {
                const songs = await getPlaylistSongs(playlistId);
                console.log("歌单歌曲:", songs);

                if (songs && songs.length > 0) {
                    showPlaylistDetail(playlistId, playlistName, songs);
                } else {
                    showNotification("未找到该歌单的歌曲");
                }
            } catch (error) {
                console.error("获取歌单歌曲失败:", error);
                showNotification("获取歌单歌曲失败，请稍后再试");
            }
        }
    });



    //获取歌单所有歌曲

    function getPlaylistSongs(playlistId) {
        return vercel.get(`/playlist/track/all?id=${playlistId}`)
            .then(response => response.data.songs);
    }

    //显示歌单详情页
    function showPlaylistDetail(playlistId, playlistName, songs) {
        const playlistModal = document.getElementById('playlistModal');


        if (!playlistModal) {
            const newModal = document.createElement('div');
            newModal.id = 'playlistModal';
            newModal.className = 'modal';
            newModal.innerHTML = '<div class="modal-content"></div>';
            document.body.appendChild(newModal);

            const newBackdrop = document.createElement('div');
            newBackdrop.id = 'modalBackdrop';
            newBackdrop.className = 'modal-backdrop';
            document.body.appendChild(newBackdrop);

            return showPlaylistDetail(playlistId, playlistName, songs);
        }

        playlistModal.querySelector('.modal-content').innerHTML = `
        <div class="modal-header">
            <h3>${playlistName || '歌单详情'}</h3>
            <button class="close-modal">
                <svg viewBox="0 0 24 24" width="24" height="24">
                    <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                </svg>
            </button>
        </div>
        <div class="modal-body">
            <div class="loading-indicator">加载中...</div>
        </div>
    `;

        playlistModal.classList.add('show');
        modalBackdrop.classList.add('show');
        document.body.style.overflow = 'hidden';

        playlistModal.querySelector('.close-modal').addEventListener('click', () => {
            playlistModal.classList.remove('show');
            modalBackdrop.classList.remove('show');
            document.body.style.overflow = '';
        });

        const modalBody = playlistModal.querySelector('.modal-body');
        let innerHTML = `
        <div class="playlist-info">
            
            <button class="play-all-btn">
                <svg viewBox="0 0 24 24" width="16" height="16">
                    <path d="M8 5v14l11-7z" fill="currentColor"/>
                </svg>
                播放全部
            </button>
            <button class="favorite-btn">
 
                <svg class="heart-icon" viewBox="0 0 1024 1024" width="24" height="24">
                    <path d="M523.3408 232.192l-5.7344 4.7104-5.888 5.1456-3.5072-3.1744a230.912 230.912 0 0 0-39.8592-27.8016c-55.6544-30.8224-121.7024-36.736-195.328-8.192-93.0304 36.0448-148.8896 139.52-130.8672 254.3872 20.6592 131.584 130.304 261.4784 327.3984 367.8208 12.7488 6.8608 25.216 10.8032 36.5312 11.9296l3.3024 0.256 2.2272 0.0512c13.44-0.4352 27.52-4.4544 41.984-12.2368 197.12-106.3424 306.7648-236.2624 327.424-367.8208 18.0224-114.8928-37.8368-218.3424-130.8672-254.3872-86.7072-33.6128-161.6128-19.456-220.672 24.576l-6.144 4.7616z" fill="#d81e06"/>
                </svg>

            </button>
            <button class="defavorite-btn">
            
                <svg class="heart-icon" t="1741950553599" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="7470" width="24" height="24">
                    <path d="M899.84 182.613333a277.589333 277.589333 0 0 0-197.12-81.493333c-71.68 0-139.093333 26.88-190.72 75.52a278.016 278.016 0 0 0-190.72-75.52c-74.666667 0-144.64 29.013333-197.12 81.493333a278.869333 278.869333 0 0 0 0 394.24l316.586667 316.586667a100.821333 100.821333 0 0 0 142.506666 0l316.586667-316.586667a278.869333 278.869333 0 0 0 0-394.24z m-66.986667 340.48l-309.76 309.76c-5.973333 5.973333-15.786667 5.973333-21.76 0l-310.613333-310.613333C115.626667 448 109.226667 319.146667 183.466667 243.626667c36.693333-37.12 85.76-57.6 137.813333-57.6 51.626667 0 100.266667 20.053333 136.96 56.746666L399.36 368.213333l-16.64 33.706667 32.426667 11.093333 197.546666 67.413334L512 682.666667l145.066667-203.093334 12.8-17.92-22.613334-10.24-174.08-80.213333 59.733334-88.746667c8.106667-11.946667 17.066667-23.04 27.306666-32.853333 27.733333-27.733333 62.293333-50.346667 100.693334-58.453333 71.253333-14.933333 141.653333 8.533333 188.16 61.866666 65.28 74.666667 54.186667 199.68-16.213334 270.08z" p-id="7471"></path>
                </svg>
                
            </button>
        </div>
        <div class="song-list">
        `;
        innerHTML += songs.map((item, index) => {
            return `
                <div class="song-item" data-index="${index}" data-musicId="${item.id}">
                    <div class="song-info">
                        <img src="${item.al.picUrl || './img/crayon.jpg'}" alt="${item.name}">
                        <div>
                            <div class="song-title">${item.name}</div>
                            <div class="song-artist">${item.ar.map(a => a.name).join(', ') || '未知歌手'}</div>
                        </div>
                    </div>
                    <div class="song-actions">
                        <button class="btn-add-to-playlist" title="加入播放列表">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        innerHTML += `</div>`;

        modalBody.innerHTML = innerHTML;


        // 添加播放全部按钮事件处理程序
        modalBody.querySelector('.play-all-btn').addEventListener('click', () => {
            const newPlaylist = songs.map(song => {
                return {
                    id: song.id,
                    title: song.name,
                    artist: song.ar.map(a => a.name).join(', '),
                    cover: song.al.picUrl || './img/crayon.jpg',
                    audio: null,
                    duration: song.dt / 1000,
                    playable: true
                };
            });

            // 更新播放列表
            playerState.playlist = newPlaylist;
            playerState.currentTrackIndex = 0;

            // 播放第一首
            loadAndPlayTrack(0);
            showNotification(`已添加 ${songs.length} 首歌曲到播放列表`);

            // 关闭模态框
            playlistModal.classList.remove('show');
            modalBackdrop.classList.remove('show');
            document.body.style.overflow = '';
        });

        // 添加收藏歌单

        modalBody.querySelector('.favorite-btn').addEventListener('click', () => {
            const token = localStorage.getItem('token');
            if (!token) {
                showAuthModal();
                return;
            }

            favoritePlaylist(token, playlistId, true);
            setTimeout(() => {
                updateCollectPlaylists(token);
            }, 1000);
        });

        // 添加取消收藏歌单

        modalBody.querySelector('.defavorite-btn').addEventListener('click', () => {
            const token = localStorage.getItem('token');
            if (!token) {
                showAuthModal();
                return;
            }

            favoritePlaylist(token, playlistId, false);
            setTimeout(() => {
                updateCollectPlaylists(token);
            }, 1000);
        });


        function favoritePlaylist(token, playlistId, isFavorite) {
            if (isFavorite) {
                console.log(`尝试收藏歌单 ID: ${playlistId}`);
                const url = `/api/playlists/${playlistId}/favorite`;
                const method = 'post';

                infoAPI({
                    method: method,
                    url: url,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                })
                    .then(response => {
                        console.log('收藏歌单响应:', response.data);
                        if (response.data.success) {
                            showNotification('已收藏歌单');
                        } else {
                            showNotification(`操作失败: ${response.data.message || '未知错误'}`);
                        }
                    })
                    .catch(error => {
                        console.error('收藏歌单失败:', error);
                        console.error('错误详情:', error.response?.data || error.message);
                        showNotification('收藏歌单失败，请稍后再试');
                    });
            } else {
                console.log(`尝试取消收藏歌单 ID: ${playlistId}`);
                const url = `/api/playlists/${playlistId}/favorite`;
                const method = 'delete';

                infoAPI({
                    method: method,
                    url: url,
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                })
                    .then(response => {
                        console.log('取消收藏歌单响应:', response.data);
                        if (response.data.success) {
                            showNotification('已取消收藏歌单');
                        } else {
                            showNotification(`操作失败: ${response.data.message || '未知错误'}`);
                        }
                    })
                    .catch(error => {
                        console.error('取消收藏歌单失败:', error);
                        console.error('错误详情:', error.response?.data || error.message);
                        showNotification('取消收藏歌单失败，请稍后再试');
                    });
            }
        }

        // 为每个歌曲项添加事件处理程序
        modalBody.querySelectorAll('.song-item').forEach((songItem, index) => {
            songItem.addEventListener('click', () => {
                const songIndex = parseInt(songItem.getAttribute('data-index'));
                const song = songs[songIndex];

                const singleSongPlaylist = [{
                    id: song.id,
                    title: song.name,
                    artist: song.ar.map(a => a.name).join(', '),
                    cover: song.al.picUrl || './img/crayon.jpg',
                    audio: null,
                    duration: song.dt / 1000,
                    playable: true
                }];

                // 替换播放列表并播放
                playerState.playlist = singleSongPlaylist;
                playerState.currentTrackIndex = 0;
                loadAndPlayTrack(0);

                // 关闭模态框
                playlistModal.classList.remove('show');
                modalBackdrop.classList.remove('show');
                document.body.style.overflow = '';
            });

            const addToPlaylistBtn = songItem.querySelector('.btn-add-to-playlist');
            addToPlaylistBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                const songIndex = parseInt(songItem.getAttribute('data-index'));
                const song = songs[songIndex];

                const trackToAdd = {
                    id: song.id,
                    title: song.name,
                    artist: song.ar.map(a => a.name).join(', '),
                    cover: song.al.picUrl || './img/crayon.jpg',
                    audio: null,
                    duration: song.dt / 1000,
                    playable: true
                };

                // 检查歌曲是否已在列表中
                const existingIndex = playerState.playlist.findIndex(track => track.id === trackToAdd.id);

                if (existingIndex !== -1) {
                    showNotification('该歌曲已在播放列表中');
                } else {
                    playerState.playlist.push(trackToAdd);
                    updataPlaylistUI();
                    showNotification(`已添加《${song.name}》到播放列表`);
                }
            });

            // 在showPlaylistDetail函数中为歌曲项添加"添加到我的歌单"按钮
            const addToMyPlaylistBtn = document.createElement('button');
            addToMyPlaylistBtn.className = 'btn-add-to-myplaylist';
            addToMyPlaylistBtn.setAttribute('title', '添加到我的歌单');
            addToMyPlaylistBtn.setAttribute('data-song-id', songs[index].id);
            addToMyPlaylistBtn.innerHTML = `
                <svg t="1741961915966" class="icon" viewBox="0 0 1024 1024" version="1.1" xmlns="http://www.w3.org/2000/svg" p-id="1506" width="16" height="16">
                    <path d="M978.823529 843.294118 873.411765 843.294118 873.411765 978.823529C873.411765 1003.760941 853.172706 1024 828.235294 1024 803.297882 1024 783.058824 1003.760941 783.058824 978.823529L783.058824 843.294118 677.647059 843.294118C652.709647 843.294118 632.470588 823.055059 632.470588 798.117647 632.470588 773.150118 652.709647 752.941176 677.647059 752.941176L783.058824 752.941176 783.058824 647.529412C783.058824 622.561882 803.297882 602.352941 828.235294 602.352941 853.172706 602.352941 873.411765 622.561882 873.411765 647.529412L873.411765 752.941176 978.823529 752.941176C1003.760941 752.941176 1024 773.150118 1024 798.117647 1024 823.055059 1003.760941 843.294118 978.823529 843.294118ZM647.529412 692.705882 225.882353 692.705882C200.944941 692.705882 180.705882 672.466824 180.705882 647.529412 180.705882 622.561882 200.944941 602.352941 225.882353 602.352941L647.529412 602.352941C672.466824 602.352941 692.705882 622.561882 692.705882 647.529412 692.705882 672.466824 672.466824 692.705882 647.529412 692.705882ZM647.529412 331.294118 225.882353 331.294118C200.944941 331.294118 180.705882 311.055059 180.705882 286.117647 180.705882 261.150118 200.944941 240.911059 225.882353 240.911059L647.529412 240.911059C672.466824 240.911059 692.705882 261.150118 692.705882 286.117647 692.705882 311.055059 672.466824 331.294118 647.529412 331.294118ZM647.529412 512 225.882353 512C200.944941 512 180.705882 491.760941 180.705882 466.823529 180.705882 441.856 200.944941 421.647059 225.882353 421.647059L647.529412 421.647059C672.466824 421.647059 692.705882 441.856 692.705882 466.823529 692.705882 491.760941 672.466824 512 647.529412 512ZM828.235294 542.117647C803.297882 542.117647 783.058824 521.878588 783.058824 496.911059L783.058824 90.352941 90.352941 90.352941 90.352941 903.529412 647.529412 903.529412C672.466824 903.529412 692.705882 923.738353 692.705882 948.705882 692.705882 973.643294 672.466824 993.882353 647.529412 993.882353L45.176471 993.882353C20.239059 993.882353 0 973.643294 0 948.705882L0 45.176471C0 20.239059 20.239059 0 45.176471 0L828.235294 0C853.172706 0 873.411765 20.239059 873.411765 45.176471L873.411765 496.911059C873.411765 521.878588 853.172706 542.117647 828.235294 542.117647Z" p-id="1507">
                    </path>
                </svg>
            `;

            songItem.querySelector('.song-actions').prepend(addToMyPlaylistBtn);


            addToMyPlaylistBtn.addEventListener('click', (e) => {
                e.stopPropagation();

                const songId = songs[index].id;
                currentSelectedSongId = songId;

                showAddToPlaylistModal(songId);
            });
        });
    }


    //用户收藏和取消收藏歌曲的函数

    function collectSong(songId, token, isFavorite) {
        console.log(`尝试${isFavorite ? '收藏' : '取消收藏'}歌曲 ID: ${songId}`);

        const url = `/api/songs/${songId}/favorite`;
        const method = isFavorite ? 'post' : 'delete';

        infoAPI({
            method: method,
            url: url,
            headers: {
                Authorization: `Bearer ${token}`
            }
        })
            .then(response => {
                console.log(`${isFavorite ? '收藏' : '取消收藏'}响应:`, response.data);
                if (response.data.success) {
                    showNotification(isFavorite ? '已添加到我喜欢的音乐' : '已从我喜欢的音乐中移除');
                } else {
                    // API 返回 success: false
                    showNotification(`操作失败: ${response.data.message || '未知错误'}`);
                }
            })
            .catch(error => {
                console.error(`${isFavorite ? '收藏' : '取消收藏'}失败:`, error);
                console.error('错误详情:', error.response?.data || error.message);
                showNotification(`${isFavorite ? '收藏' : '取消收藏'}失败，请稍后再试`);
            });
    }

    //获取用户收藏的歌曲id
    function getFavoriteSongs(token) {
        return infoAPI.get('/api/songs/user/favorites', {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => response.data);
    }
    getFavoriteSongs(localStorage.getItem('token')).then(res => {
        console.log(res);
    });


    // 获取用户收藏的歌曲详情
    async function getFavoriteSongsDetail(token) {
        try {
            // 1. 先获取用户收藏的歌曲ID列表
            const response = await infoAPI.get('/api/songs/user/favorites', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.data.success || !response.data.data || response.data.data.length === 0) {
                return []; // 没有收藏歌曲或获取失败
            }

            // 2. 获取歌曲ID列表
            const songIds = response.data.data;

            // 3. 使用歌曲ID获取歌曲详情
            const songDetailsResponse = await vercel.get(`/song/detail?ids=${songIds.join(',')}`);

            if (songDetailsResponse.data && songDetailsResponse.data.songs) {
                return songDetailsResponse.data.songs;
            } else {
                console.error('获取歌曲详情失败:', songDetailsResponse);
                return [];
            }
        } catch (error) {
            console.error('获取用户收藏歌曲详情失败:', error);
            return [];
        }
    }


    if (token) {
        function renderFavoriteSong(token) {
            getFavoriteSongsDetail(token).then(songs => {
                console.log('用户收藏的歌曲:', songs);

                // 渲染收藏歌曲列表
                if (songs.length > 0) {
                    const favoritesModal = document.getElementById('favoritesModal');
                    const modalBody = favoritesModal.querySelector('.modal-body');
                    const songList = modalBody.querySelector('.song-list');
                    updateSongList(songList, songs);
                } else {
                    const favoritesModal = document.getElementById('favoritesModal');
                    const modalBody = favoritesModal.querySelector('.modal-body');
                    const songList = modalBody.querySelector('.song-list');
                    songList.innerHTML = '<div class="empty-message">您还没有收藏的歌曲</div>';
                    showNotification('您还没有收藏的歌曲');
                }
            });
        }

        function updateSongList(songList, songs) {

            if (!songs || songs.length === 0) {
                songList.innerHTML = '<div class="empty-message">您还没有收藏任何歌曲</div>';
                return;
            }

            songList.innerHTML = songs.map((song, index) => `
                <div class="song-item" data-index="${index}" data-id="${song.id}">
                    <div class="song-info">
                        <img src="${song.al.picUrl || './img/crayon.jpg'}" alt="${song.name}">
                        <div>
                            <div class="song-title">${song.name}</div>
                            <div class="song-artist">${song.ar.map(a => a.name).join(', ')}</div>
                        </div>
                    </div>
                    <div class="song-actions">
                        <button class="btn-add-to-playlist" title="加入播放列表">
                            <svg viewBox="0 0 24 24" width="16" height="16">
                                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
                            </svg>
                        </button>
                        <button class="btn-remove-favorite" title="取消收藏">
                            <svg viewBox="0 0 1024 1024" version="1.1" width="16" height="16">
                                <path d="M523.3408 232.192l-5.7344 4.7104-5.888 5.1456-3.5072-3.1744a230.912 230.912 0 0 0-39.8592-27.8016c-55.6544-30.8224-121.7024-36.736-195.328-8.192-93.0304 36.0448-148.8896 139.52-130.8672 254.3872 20.6592 131.584 130.304 261.4784 327.3984 367.8208 12.7488 6.8608 25.216 10.8032 36.5312 11.9296l3.3024 0.256 2.2272 0.0512c13.44-0.4352 27.52-4.4544 41.984-12.2368 197.12-106.3424 306.7648-236.2624 327.424-367.8208 18.0224-114.8928-37.8368-218.3424-130.8672-254.3872-86.7072-33.6128-161.6128-19.456-220.672 24.576l-6.144 4.7616z" fill="#FB553C"/>
                            </svg>
                        </button>
                    </div>
                </div>
            `).join('');

            // 绑定取消收藏事件
            songList.querySelectorAll('.btn-remove-favorite').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const songItem = e.target.closest('.song-item');
                    const songId = songItem.getAttribute('data-id');
                    collectSong(songId, token, false);
                    setTimeout(() => {
                        renderFavoriteSong(token);
                    }, 2000);
                });
            });
        }

        renderFavoriteSong(token);

        const favoriteMusic = document.querySelector('[data-modal="favorites"]');

        favoriteMusic.addEventListener('click', () => {
            console.log('点击了我的喜欢');
            openModal('favorites');
            renderFavoriteSong(token);
        });

    }

    //添加歌曲到我的歌单

    function addSongToPlaylist(songId, playlistId, token) {
        infoAPI.post(`/api/playlists/${playlistId}/songs`, { songId: songId }, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        }).then(response => {
            console.log(response.data);
            showNotification('已添加到我的歌单');
        }).catch(error => {
            console.error('添加到我的歌单失败:', error);
            showNotification('添加到我的歌单失败，请稍后再试');
        })
    }

    // 接下来做歌词的展示
    function openLyricsPanel() {
        const lyricsModal = document.getElementById('lyricsModal');

        if (!lyricsModal) {
            console.error('找不到歌词模态框元素');
            return;
        }

        lyricsModal.classList.add('show');
        modalBackdrop.classList.add('show');
        document.body.style.overflow = 'hidden';

        loadLyrics();
    }

    async function loadLyrics() {
        const lyricsContainer = document.querySelector('.lyrics-container');

        if (!lyricsContainer) {
            return;
        }

        lyricsContainer.innerHTML = `
            <div class="lyrics-loading">
                <div class="spinner"></div>
                <p>加载歌词中...</p>
            </div>
        `;

        if (playerState.playlist.length === 0 || playerState.currentTrackIndex < 0) {
            lyricsContainer.innerHTML = '<div class="empty-message">没有播放歌曲</div>';
            return;
        }

        const currentTrack = playerState.playlist[playerState.currentTrackIndex];

        if (!currentTrack || !currentTrack.id) {
            lyricsContainer.innerHTML = '<div class="empty-message">没有歌词</div>';
            return;

        }

        if (currentTrack.lyrics) {
            renderLyrics(currentTrack.lyrics);
            return;
        }

        try {
            const response = await vercel.get(`/lyric?id=${currentTrack.id}`);
            const lyricsData = response.data;

            if (lyricsData.lrc.lyric) {

                const parsedLyrics = parseLyrics(lyricsData.lrc.lyric);
                currentTrack.lyrics = parsedLyrics;
                renderLyrics(parsedLyrics);
            } else {
                lyricsContainer.innerHTML = '<div class="empty-message">没有歌词</div>';
            }
        } catch (error) {
            console.error('获取歌词失败:', error);
            lyricsContainer.innerHTML = '<div class="empty-message">获取歌词失败，请稍后再试</div>';

        }

        if (lyricsContainer) {
            lyricsContainer.addEventListener('scroll', function () {
                // 用户开始滚动
                userScrolling = true;

                if (scrollTimeout) {
                    clearTimeout(scrollTimeout);
                }

                scrollTimeout = setTimeout(() => {
                    userScrolling = false;
                }, 3000);
            });
        }
    }

    function parseLyrics(lyrics) {
        if (!lyrics) {
            return [];
        }
        const lines = lyrics.split('\n');
        const parsedLyrics = [];

        const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
        lines.forEach(line => {
            // 查找类似 [00:04.050] 这样的时间标签
            const match = timeRegex.exec(line);
            if (match) {
                const minutes = parseInt(match[1]);
                const seconds = parseInt(match[2]);
                const milliseconds = parseInt(match[3]);

                const timeInSeconds = minutes * 60 + seconds + milliseconds / 1000;

                const text = line.replace(timeRegex, '').trim();

                if (text) {
                    parsedLyrics.push({
                        time: timeInSeconds,
                        text: text
                    });
                }
            }
        });


        return parsedLyrics.sort((a, b) => a.time - b.time);
    }



    //渲染歌词

    function renderLyrics(lyrics) {
        const lyricsContainer = document.querySelector('.lyrics-container');
        if (!lyricsContainer) return;

        if (!lyrics || lyrics.length === 0) {
            lyricsContainer.innerHTML = '<div class="no-lyrics">暂无歌词</div>';
            return;
        }

        let html = '<div class="lyrics-placeholder"></div>';

        // 逐行生成歌词
        lyrics.forEach((line, index) => {
            html += `<div class="lyrics-line" data-time="${line.time}" data-index="${index}">${line.text}</div>`;
        });

        html += '<div class="lyrics-placeholder"></div>';
        lyricsContainer.innerHTML = html;

        // 点击歌词跳转到那个歌词的时间点

        document.querySelectorAll('.lyrics-line').forEach(line => {
            line.addEventListener('click', () => {
                const time = parseFloat(line.getAttribute('data-time'));
                if (!isNaN(time) && audioPlayer.readyState >= 2) {
                    audioPlayer.currentTime = time;
                    // 如果暂停，就自动播放
                    if (!playerState.isPlaying) {
                        playAudio();
                    }
                }
            });
        });
    }

});