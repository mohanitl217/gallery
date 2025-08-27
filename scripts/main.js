// Main JavaScript functionality
class SchoolGallery {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.mockData = this.generateMockData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadRecentMedia();
        this.checkAuthStatus();
    }

    setupEventListeners() {
        // Navigation
        const hamburger = document.querySelector('.hamburger');
        const navMenu = document.querySelector('.nav-menu');

        if (hamburger) {
            hamburger.addEventListener('click', () => {
                navMenu.classList.toggle('active');
            });
        }

        // Close modals when clicking outside
        window.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeModal(e.target.id);
            }
        });

        // Upload area drag and drop (if on admin page)
        const uploadArea = document.getElementById('uploadArea');
        if (uploadArea) {
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });

            uploadArea.addEventListener('dragleave', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
            });

            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                this.handleFileSelect(e);
            });
        }
    }

    generateMockData() {
        const occasions = ['sports-day', 'annual-function', 'science-fair', 'graduation', 'cultural-fest'];
        const years = ['2024', '2023', '2022'];
        const subfolders = ['group-photos', 'performances', 'awards', 'candid-moments'];
        
        const mediaItems = [];
        let id = 1;

        occasions.forEach(occasion => {
            years.forEach(year => {
                // Add some items with subfolders, some without
                const numItems = Math.floor(Math.random() * 10) + 5;
                
                for (let i = 0; i < numItems; i++) {
                    const hasSubfolder = Math.random() > 0.5;
                    const isVideo = Math.random() > 0.8;
                    
                    mediaItems.push({
                        id: id++,
                        title: `${this.formatOccasionName(occasion)} - ${isVideo ? 'Video' : 'Photo'} ${i + 1}`,
                        type: isVideo ? 'video' : 'image',
                        occasion: occasion,
                        year: year,
                        subfolder: hasSubfolder ? subfolders[Math.floor(Math.random() * subfolders.length)] : null,
                        thumbnail: this.generateThumbnailUrl(isVideo),
                        url: this.generateMediaUrl(isVideo),
                        likes: Math.floor(Math.random() * 100),
                        views: Math.floor(Math.random() * 1000) + 100,
                        uploadDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000),
                        comments: this.generateComments()
                    });
                }
            });
        });

        return {
            media: mediaItems.sort((a, b) => b.uploadDate - a.uploadDate),
            occasions: occasions,
            years: years,
            subfolders: subfolders,
            users: this.generateMockUsers()
        };
    }

    generateMockUsers() {
        return [
            {
                id: 1,
                name: 'John Smith',
                email: 'john.smith@school.edu',
                username: 'jsmith',
                class: 'Grade 10',
                status: 'pending'
            },
            {
                id: 2,
                name: 'Emma Johnson',
                email: 'emma.johnson@school.edu',
                username: 'ejohnson',
                class: 'Grade 12',
                status: 'pending'
            },
            {
                id: 3,
                name: 'Michael Brown',
                email: 'michael.brown@school.edu',
                username: 'mbrown',
                class: 'Grade 9',
                status: 'approved'
            }
        ];
    }

    generateComments() {
        const comments = [
            { author: 'Sarah M.', text: 'Great photo! Love the energy.' },
            { author: 'David K.', text: 'Such a memorable moment!' },
            { author: 'Lisa R.', text: 'Amazing capture! 📸' },
            { author: 'Tom W.', text: 'Brings back so many memories.' },
            { author: 'Amy L.', text: 'Beautiful shot!' }
        ];

        const numComments = Math.floor(Math.random() * 3);
        const shuffled = comments.sort(() => 0.5 - Math.random());
        return shuffled.slice(0, numComments);
    }

    generateThumbnailUrl(isVideo) {
        if (isVideo) {
            const videoIds = ['dQw4w9WgXcQ', 'M7lc1UVf-VE', 'kJQP7kiw5Fk', 'L_jWHffIx5E'];
            const videoId = videoIds[Math.floor(Math.random() * videoIds.length)];
            return `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
        } else {
            const imageIds = [
                'https://images.pexels.com/photos/1543793/pexels-photo-1543793.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/1370296/pexels-photo-1370296.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/1198264/pexels-photo-1198264.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/1516440/pexels-photo-1516440.jpeg?auto=compress&cs=tinysrgb&w=600',
                'https://images.pexels.com/photos/1633578/pexels-photo-1633578.jpeg?auto=compress&cs=tinysrgb&w=600'
            ];
            return imageIds[Math.floor(Math.random() * imageIds.length)];
        }
    }

    generateMediaUrl(isVideo) {
        if (isVideo) {
            return 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';
        } else {
            return this.generateThumbnailUrl(false);
        }
    }

    formatOccasionName(occasion) {
        return occasion.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    formatSubfolderName(subfolder) {
        if (!subfolder) return '';
        return subfolder.split('-').map(word => 
            word.charAt(0).toUpperCase() + word.slice(1)
        ).join(' ');
    }

    checkAuthStatus() {
        // Check if user is logged in (mock implementation)
        const savedUser = localStorage.getItem('currentUser');
        if (savedUser) {
            this.currentUser = JSON.parse(savedUser);
            this.isAdmin = this.currentUser.username === 'admin';
            this.updateAuthUI();
        }
    }

    updateAuthUI() {
        const authButtons = document.querySelector('.auth-buttons');
        if (this.currentUser && authButtons) {
            authButtons.innerHTML = `
                <span>Welcome, ${this.currentUser.name || this.currentUser.username}</span>
                ${this.isAdmin ? '<a href="admin.html" class="btn btn-secondary">Admin Panel</a>' : ''}
                <button class="btn btn-outline" onclick="gallery.logout()">Logout</button>
            `;
        }
    }

    loadRecentMedia(limit = 12) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        const recentMedia = this.mockData.media.slice(0, limit);
        
        galleryGrid.innerHTML = recentMedia.map(item => this.createMediaCard(item)).join('');
    }

    createMediaCard(item) {
        return `
            <div class="media-card" onclick="gallery.openMediaModal('${item.id}')">
                <div class="media-thumbnail">
                    ${item.type === 'video' 
                        ? `<video src="${item.url}" muted></video>` 
                        : `<img src="${item.thumbnail}" alt="${item.title}">`
                    }
                    <div class="media-type">${item.type === 'video' ? 'VIDEO' : 'PHOTO'}</div>
                    <div class="quick-actions">
                        <button class="quick-action" onclick="event.stopPropagation(); gallery.likeMedia('${item.id}')">
                            <i class="far fa-heart"></i>
                        </button>
                        <button class="quick-action" onclick="event.stopPropagation(); gallery.shareMedia('${item.id}')">
                            <i class="fas fa-share"></i>
                        </button>
                    </div>
                </div>
                <div class="media-info">
                    <div class="media-title">${item.title}</div>
                    <div class="media-details">
                        ${this.formatOccasionName(item.occasion)} - ${item.year}
                        ${item.subfolder ? ` • ${this.formatSubfolderName(item.subfolder)}` : ''}
                    </div>
                    <div class="media-stats">
                        <span><i class="far fa-heart"></i> ${item.likes}</span>
                        <span><i class="far fa-eye"></i> ${item.views}</span>
                        <span><i class="far fa-calendar"></i> ${item.uploadDate.toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
        `;
    }

    openMediaModal(itemId) {
        const item = this.mockData.media.find(m => m.id == itemId);
        if (!item) return;

        const modal = document.getElementById('mediaModal');
        const mediaDisplay = document.getElementById('mediaDisplay');
        const mediaTitle = document.getElementById('mediaTitle');
        const mediaDetails = document.getElementById('mediaDetails');
        const commentsList = document.getElementById('commentsList');
        const likeCount = document.getElementById('likeCount');
        const likeBtn = document.getElementById('likeBtn');

        // Update media display
        if (item.type === 'video') {
            mediaDisplay.innerHTML = `<video controls src="${item.url}" style="max-width: 100%; max-height: 100%;"></video>`;
        } else {
            mediaDisplay.innerHTML = `<img src="${item.url}" alt="${item.title}" style="max-width: 100%; max-height: 100%; object-fit: contain;">`;
        }

        // Update info
        mediaTitle.textContent = item.title;
        mediaDetails.innerHTML = `
            <p><strong>Occasion:</strong> ${this.formatOccasionName(item.occasion)}</p>
            <p><strong>Year:</strong> ${item.year}</p>
            ${item.subfolder ? `<p><strong>Category:</strong> ${this.formatSubfolderName(item.subfolder)}</p>` : ''}
            <p><strong>Uploaded:</strong> ${item.uploadDate.toLocaleDateString()}</p>
            <p><strong>Views:</strong> ${item.views}</p>
        `;

        // Update likes
        likeCount.textContent = item.likes;
        
        // Update comments
        commentsList.innerHTML = item.comments.map(comment => `
            <div class="comment">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');

        // Store current item for actions
        modal.dataset.currentItem = itemId;

        this.showModal('mediaModal');
    }

    likeMedia(itemId) {
        const item = this.mockData.media.find(m => m.id == itemId);
        if (!item) return;

        item.likes++;
        
        // Update UI if modal is open for this item
        const modal = document.getElementById('mediaModal');
        if (modal && modal.dataset.currentItem == itemId) {
            document.getElementById('likeCount').textContent = item.likes;
        }

        // Update gallery card
        const mediaCards = document.querySelectorAll('.media-card');
        mediaCards.forEach(card => {
            if (card.onclick.toString().includes(itemId)) {
                const likeSpan = card.querySelector('.media-stats span:first-child');
                if (likeSpan) {
                    likeSpan.innerHTML = `<i class="far fa-heart"></i> ${item.likes}`;
                }
            }
        });

        // Show feedback
        this.showNotification('Liked! ❤️', 'success');
    }

    shareMedia(itemId) {
        const item = this.mockData.media.find(m => m.id == itemId);
        if (!item) return;

        // Mock share functionality
        const shareUrl = `${window.location.origin}${window.location.pathname}?media=${itemId}`;
        
        if (navigator.share) {
            navigator.share({
                title: item.title,
                text: `Check out this ${item.type} from ${this.formatOccasionName(item.occasion)}`,
                url: shareUrl
            });
        } else {
            // Fallback: copy to clipboard
            navigator.clipboard.writeText(shareUrl).then(() => {
                this.showNotification('Link copied to clipboard!', 'success');
            });
        }
    }

    downloadMedia() {
        // Mock download functionality
        this.showNotification('Download started!', 'success');
    }

    addComment() {
        const input = document.getElementById('commentInput');
        const modal = document.getElementById('mediaModal');
        const itemId = modal.dataset.currentItem;
        
        if (!input.value.trim() || !this.currentUser) {
            this.showNotification('Please login to comment', 'error');
            return;
        }

        const item = this.mockData.media.find(m => m.id == itemId);
        if (!item) return;

        const newComment = {
            author: this.currentUser.name || this.currentUser.username,
            text: input.value.trim()
        };

        item.comments.unshift(newComment);

        // Update UI
        const commentsList = document.getElementById('commentsList');
        commentsList.innerHTML = item.comments.map(comment => `
            <div class="comment">
                <div class="comment-author">${comment.author}</div>
                <div class="comment-text">${comment.text}</div>
            </div>
        `).join('');

        input.value = '';
        this.showNotification('Comment added!', 'success');
    }

    handleCommentKeypress(event) {
        if (event.key === 'Enter') {
            this.addComment();
        }
    }

    showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('show');
            modal.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('show');
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }
    }

    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            background: ${type === 'success' ? 'var(--success-color)' : type === 'error' ? 'var(--error-color)' : 'var(--primary-color)'};
            color: white;
            border-radius: 0.5rem;
            z-index: 9999;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            box-shadow: var(--shadow-lg);
        `;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.isAdmin = false;
        
        // Redirect to home if on admin page
        if (window.location.pathname.includes('admin.html')) {
            window.location.href = 'index.html';
        } else {
            this.updateAuthUI();
            window.location.reload();
        }
    }

    loadMoreMedia() {
        // Mock load more functionality
        this.showNotification('Loading more media...', 'info');
        
        setTimeout(() => {
            const currentItems = document.querySelectorAll('.media-card').length;
            const nextItems = this.mockData.media.slice(currentItems, currentItems + 12);
            
            const galleryGrid = document.getElementById('galleryGrid');
            nextItems.forEach(item => {
                const cardHTML = this.createMediaCard(item);
                galleryGrid.insertAdjacentHTML('beforeend', cardHTML);
            });

            if (nextItems.length === 0) {
                document.querySelector('.load-more').style.display = 'none';
                this.showNotification('No more media to load', 'info');
            } else {
                this.showNotification(`Loaded ${nextItems.length} more items`, 'success');
            }
        }, 1000);
    }
}

// Global functions
function showLoginModal() {
    gallery.showModal('loginModal');
}

function showSignupModal() {
    gallery.showModal('signupModal');
}

function closeModal(modalId) {
    gallery.closeModal(modalId);
}

function filterByOccasion() {
    const occasion = document.getElementById('occasionSelect').value;
    const yearSelect = document.getElementById('yearSelect');
    const subfolderSelect = document.getElementById('subfolderSelect');

    if (occasion) {
        // Enable year select and populate with years for this occasion
        yearSelect.disabled = false;
        const years = [...new Set(
            gallery.mockData.media
                .filter(item => item.occasion === occasion)
                .map(item => item.year)
        )].sort().reverse();
        
        yearSelect.innerHTML = '<option value="">All Years</option>' + 
            years.map(year => `<option value="${year}">${year}</option>`).join('');
    } else {
        yearSelect.disabled = true;
        yearSelect.innerHTML = '<option value="">Select Year</option>';
        subfolderSelect.disabled = true;
        subfolderSelect.innerHTML = '<option value="">Select Category</option>';
    }

    applyFilters();
}

function filterByYear() {
    const occasion = document.getElementById('occasionSelect').value;
    const year = document.getElementById('yearSelect').value;
    const subfolderSelect = document.getElementById('subfolderSelect');

    if (occasion && year) {
        // Enable subfolder select and populate
        subfolderSelect.disabled = false;
        const subfolders = [...new Set(
            gallery.mockData.media
                .filter(item => item.occasion === occasion && item.year === year && item.subfolder)
                .map(item => item.subfolder)
        )];
        
        subfolderSelect.innerHTML = '<option value="">All Categories</option>' + 
            subfolders.map(subfolder => 
                `<option value="${subfolder}">${gallery.formatSubfolderName(subfolder)}</option>`
            ).join('');
    } else {
        subfolderSelect.disabled = true;
        subfolderSelect.innerHTML = '<option value="">Select Category</option>';
    }

    applyFilters();
}

function filterBySubfolder() {
    applyFilters();
}

function applyFilters() {
    const occasion = document.getElementById('occasionSelect').value;
    const year = document.getElementById('yearSelect').value;
    const subfolder = document.getElementById('subfolderSelect').value;

    let filteredMedia = gallery.mockData.media;

    if (occasion) {
        filteredMedia = filteredMedia.filter(item => item.occasion === occasion);
    }
    if (year) {
        filteredMedia = filteredMedia.filter(item => item.year === year);
    }
    if (subfolder) {
        filteredMedia = filteredMedia.filter(item => item.subfolder === subfolder);
    }

    const galleryGrid = document.getElementById('galleryGrid');
    if (galleryGrid) {
        galleryGrid.innerHTML = filteredMedia.map(item => gallery.createMediaCard(item)).join('');
        
        if (filteredMedia.length === 0) {
            galleryGrid.innerHTML = `
                <div class="empty-state" style="grid-column: 1 / -1;">
                    <i class="fas fa-images"></i>
                    <h4>No media found</h4>
                    <p>Try adjusting your filters</p>
                </div>
            `;
        }
    }
}

function clearFilters() {
    document.getElementById('occasionSelect').value = '';
    document.getElementById('yearSelect').value = '';
    document.getElementById('yearSelect').disabled = true;
    document.getElementById('subfolderSelect').value = '';
    document.getElementById('subfolderSelect').disabled = true;
    
    gallery.loadRecentMedia();
}

// Initialize gallery when DOM loads
let gallery;
document.addEventListener('DOMContentLoaded', () => {
    gallery = new SchoolGallery();
});