// Gallery specific functionality
class GalleryManager {
    constructor() {
        this.currentView = 'grid';
        this.currentSort = 'newest';
        this.searchQuery = '';
        this.currentFilters = {
            occasion: '',
            year: '',
            subfolder: '',
            type: ''
        };
    }

    initializeGallery() {
        this.setupGalleryControls();
        this.setupInfiniteScroll();
        this.setupSearch();
    }

    setupGalleryControls() {
        const viewToggle = document.querySelector('.view-toggle');
        if (viewToggle) {
            viewToggle.addEventListener('click', (e) => {
                if (e.target.tagName === 'BUTTON') {
                    this.changeView(e.target.dataset.view);
                }
            });
        }

        const sortControl = document.getElementById('sortSelect');
        if (sortControl) {
            sortControl.addEventListener('change', (e) => {
                this.changeSorting(e.target.value);
            });
        }
    }

    changeView(viewType) {
        this.currentView = viewType;
        const galleryGrid = document.getElementById('galleryGrid');
        const viewButtons = document.querySelectorAll('.view-toggle button');

        // Update active button
        viewButtons.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-view="${viewType}"]`).classList.add('active');

        // Update grid class
        galleryGrid.className = `gallery-grid ${viewType}-view`;

        this.applyCurrentFilters();
    }

    changeSorting(sortType) {
        this.currentSort = sortType;
        this.applyCurrentFilters();
    }

    setupSearch() {
        const searchInput = document.getElementById('gallerySearch');
        if (searchInput) {
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.debounceSearch();
            });
        }
    }

    debounceSearch() {
        clearTimeout(this.searchTimeout);
        this.searchTimeout = setTimeout(() => {
            this.applyCurrentFilters();
        }, 300);
    }

    setupInfiniteScroll() {
        if (!document.querySelector('.load-more')) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.loadMoreMedia();
                }
            });
        });

        const loadMoreBtn = document.querySelector('.load-more');
        if (loadMoreBtn) {
            observer.observe(loadMoreBtn);
        }
    }

    applyCurrentFilters() {
        let filteredMedia = [...gallery.mockData.media];

        // Apply search
        if (this.searchQuery) {
            filteredMedia = filteredMedia.filter(item =>
                item.title.toLowerCase().includes(this.searchQuery) ||
                gallery.formatOccasionName(item.occasion).toLowerCase().includes(this.searchQuery) ||
                (item.subfolder && gallery.formatSubfolderName(item.subfolder).toLowerCase().includes(this.searchQuery))
            );
        }

        // Apply filters
        Object.keys(this.currentFilters).forEach(key => {
            const value = this.currentFilters[key];
            if (value) {
                if (key === 'type') {
                    filteredMedia = filteredMedia.filter(item => item.type === value);
                } else {
                    filteredMedia = filteredMedia.filter(item => item[key] === value);
                }
            }
        });

        // Apply sorting
        filteredMedia = this.sortMedia(filteredMedia);

        this.renderFilteredMedia(filteredMedia);
    }

    sortMedia(mediaArray) {
        switch (this.currentSort) {
            case 'newest':
                return mediaArray.sort((a, b) => b.uploadDate - a.uploadDate);
            case 'oldest':
                return mediaArray.sort((a, b) => a.uploadDate - b.uploadDate);
            case 'popular':
                return mediaArray.sort((a, b) => b.likes - a.likes);
            case 'views':
                return mediaArray.sort((a, b) => b.views - a.views);
            case 'title':
                return mediaArray.sort((a, b) => a.title.localeCompare(b.title));
            default:
                return mediaArray;
        }
    }

    renderFilteredMedia(mediaArray) {
        const galleryGrid = document.getElementById('galleryGrid');
        if (!galleryGrid) return;

        if (mediaArray.length === 0) {
            galleryGrid.innerHTML = this.getEmptyState();
            return;
        }

        galleryGrid.innerHTML = mediaArray.map(item => gallery.createMediaCard(item)).join('');
    }

    getEmptyState() {
        let message = 'No media found';
        let description = 'Try adjusting your search or filters';

        if (this.searchQuery) {
            message = `No results for "${this.searchQuery}"`;
            description = 'Try a different search term';
        } else if (Object.values(this.currentFilters).some(v => v)) {
            message = 'No media matches your filters';
            description = 'Try adjusting your filter selection';
        }

        return `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <i class="fas fa-search"></i>
                <h4>${message}</h4>
                <p>${description}</p>
                <button class="btn btn-primary" onclick="galleryManager.clearAllFilters()">
                    Clear Filters
                </button>
            </div>
        `;
    }

    clearAllFilters() {
        this.searchQuery = '';
        this.currentFilters = {
            occasion: '',
            year: '',
            subfolder: '',
            type: ''
        };

        // Reset UI
        const searchInput = document.getElementById('gallerySearch');
        if (searchInput) searchInput.value = '';

        const filterSelects = document.querySelectorAll('.filter-controls select');
        filterSelects.forEach(select => {
            select.value = '';
            if (select.id !== 'occasionSelect') {
                select.disabled = true;
            }
        });

        this.applyCurrentFilters();
    }

    loadMoreMedia() {
        // Implementation for infinite scroll
        return gallery.loadMoreMedia();
    }

    // Lightbox functionality
    openLightbox(itemId) {
        const item = gallery.mockData.media.find(m => m.id == itemId);
        if (!item) return;

        const lightbox = this.createLightbox(item);
        document.body.appendChild(lightbox);

        // Add keyboard navigation
        this.setupLightboxKeyboard(itemId);
    }

    createLightbox(item) {
        const lightbox = document.createElement('div');
        lightbox.className = 'lightbox';
        lightbox.innerHTML = `
            <div class="lightbox-content">
                <button class="lightbox-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
                <button class="lightbox-prev" onclick="galleryManager.prevMedia()">
                    <i class="fas fa-chevron-left"></i>
                </button>
                <button class="lightbox-next" onclick="galleryManager.nextMedia()">
                    <i class="fas fa-chevron-right"></i>
                </button>
                <div class="lightbox-media">
                    ${item.type === 'video'
                        ? `<video controls src="${item.url}"></video>`
                        : `<img src="${item.url}" alt="${item.title}">`
                    }
                </div>
                <div class="lightbox-info">
                    <h3>${item.title}</h3>
                    <p>${gallery.formatOccasionName(item.occasion)} - ${item.year}</p>
                </div>
            </div>
        `;

        return lightbox;
    }

    setupLightboxKeyboard(itemId) {
        const handler = (e) => {
            switch (e.key) {
                case 'Escape':
                    document.querySelector('.lightbox')?.remove();
                    document.removeEventListener('keydown', handler);
                    break;
                case 'ArrowLeft':
                    this.prevMedia();
                    break;
                case 'ArrowRight':
                    this.nextMedia();
                    break;
            }
        };

        document.addEventListener('keydown', handler);
    }

    prevMedia() {
        // Navigate to previous media in lightbox
        console.log('Navigate to previous media');
    }

    nextMedia() {
        // Navigate to next media in lightbox
        console.log('Navigate to next media');
    }

    // Masonry layout
    initMasonryLayout() {
        const grid = document.querySelector('.gallery-grid.masonry');
        if (!grid) return;

        // Simple masonry implementation
        const items = grid.querySelectorAll('.media-card');
        let columns = 3;

        if (window.innerWidth < 768) columns = 1;
        else if (window.innerWidth < 1024) columns = 2;

        const columnHeights = new Array(columns).fill(0);
        const columnWidth = grid.offsetWidth / columns;

        items.forEach((item, index) => {
            const shortestColumn = columnHeights.indexOf(Math.min(...columnHeights));
            
            item.style.position = 'absolute';
            item.style.left = `${shortestColumn * columnWidth}px`;
            item.style.top = `${columnHeights[shortestColumn]}px`;
            item.style.width = `${columnWidth - 20}px`;

            columnHeights[shortestColumn] += item.offsetHeight + 20;
        });

        grid.style.height = `${Math.max(...columnHeights)}px`;
    }

    // Analytics tracking
    trackMediaView(itemId) {
        // Track media view for analytics
        console.log(`Media ${itemId} viewed`);
    }

    trackMediaInteraction(itemId, action) {
        // Track user interactions (like, share, download)
        console.log(`Media ${itemId}: ${action}`);
    }
}

// Initialize gallery manager
let galleryManager;
document.addEventListener('DOMContentLoaded', () => {
    galleryManager = new GalleryManager();
    galleryManager.initializeGallery();
});

// Add CSS for lightbox
const lightboxStyles = `
<style>
.lightbox {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.9);
    z-index: 9999;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-content {
    position: relative;
    max-width: 90%;
    max-height: 90%;
    display: flex;
    flex-direction: column;
    align-items: center;
}

.lightbox-media {
    max-width: 100%;
    max-height: 80vh;
    display: flex;
    align-items: center;
    justify-content: center;
}

.lightbox-media img,
.lightbox-media video {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
}

.lightbox-close,
.lightbox-prev,
.lightbox-next {
    position: absolute;
    background: rgba(255, 255, 255, 0.2);
    border: none;
    color: white;
    padding: 1rem;
    cursor: pointer;
    border-radius: 50%;
    transition: all 0.3s ease;
}

.lightbox-close {
    top: 20px;
    right: 20px;
}

.lightbox-prev {
    left: 20px;
    top: 50%;
    transform: translateY(-50%);
}

.lightbox-next {
    right: 20px;
    top: 50%;
    transform: translateY(-50%);
}

.lightbox-close:hover,
.lightbox-prev:hover,
.lightbox-next:hover {
    background: rgba(255, 255, 255, 0.3);
}

.lightbox-info {
    margin-top: 1rem;
    text-align: center;
    color: white;
}

.lightbox-info h3 {
    margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
    .lightbox-prev,
    .lightbox-next {
        display: none;
    }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', lightboxStyles);