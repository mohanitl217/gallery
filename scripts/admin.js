// Admin panel functionality
class AdminManager {
    constructor() {
        this.currentSection = 'dashboard';
        this.selectedFiles = [];
        this.folderStructure = this.generateFolderStructure();
        this.init();
    }

    init() {
        this.checkAdminAuth();
        this.setupAdminInterface();
        this.loadDashboardData();
        this.setupFileUpload();
    }

    checkAdminAuth() {
        const user = localStorage.getItem('currentUser');
        if (!user || JSON.parse(user).username !== 'admin') {
            window.location.href = 'index.html?redirect=admin';
            return;
        }
        gallery.currentUser = JSON.parse(user);
        gallery.isAdmin = true;
    }

    setupAdminInterface() {
        // Section navigation
        const navItems = document.querySelectorAll('.nav-item');
        navItems.forEach(item => {
            item.addEventListener('click', (e) => {
                if (e.target.getAttribute('href')?.startsWith('#')) {
                    e.preventDefault();
                    const section = e.target.getAttribute('href').substring(1);
                    this.showSection(section);
                }
            });
        });

        // Mobile sidebar toggle
        this.setupMobileSidebar();
    }

    setupMobileSidebar() {
        // Add mobile toggle button if needed
        if (window.innerWidth <= 768) {
            const header = document.querySelector('.admin-header');
            const toggleBtn = document.createElement('button');
            toggleBtn.className = 'sidebar-toggle btn btn-outline';
            toggleBtn.innerHTML = '<i class="fas fa-bars"></i>';
            toggleBtn.onclick = () => {
                document.querySelector('.admin-sidebar').classList.toggle('open');
            };
            header.insertBefore(toggleBtn, header.firstChild);
        }
    }

    showSection(sectionId) {
        // Hide all sections
        document.querySelectorAll('.admin-section').forEach(section => {
            section.classList.remove('active');
        });

        // Show selected section
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.add('active');
        }

        // Update navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[href="#${sectionId}"]`)?.parentElement.classList.add('active');

        // Update section title
        const sectionTitles = {
            dashboard: 'Dashboard',
            upload: 'Upload Media',
            manage: 'Manage Folders',
            users: 'User Management',
            gallery: 'Media Gallery'
        };
        document.getElementById('sectionTitle').textContent = sectionTitles[sectionId] || 'Admin Panel';

        this.currentSection = sectionId;

        // Load section-specific data
        switch (sectionId) {
            case 'dashboard':
                this.loadDashboardData();
                break;
            case 'upload':
                this.loadUploadInterface();
                break;
            case 'manage':
                this.loadFolderManagement();
                break;
            case 'users':
                this.loadUserManagement();
                break;
            case 'gallery':
                this.loadGalleryManagement();
                break;
        }
    }

    loadDashboardData() {
        // Update stats (already populated in HTML, but could be dynamic)
        this.animateStats();
    }

    animateStats() {
        const statNumbers = document.querySelectorAll('.stat-info h3');
        statNumbers.forEach((stat, index) => {
            const finalValue = parseInt(stat.textContent);
            let currentValue = 0;
            const increment = finalValue / 50;
            const timer = setInterval(() => {
                currentValue += increment;
                if (currentValue >= finalValue) {
                    stat.textContent = finalValue.toLocaleString();
                    clearInterval(timer);
                } else {
                    stat.textContent = Math.floor(currentValue).toLocaleString();
                }
            }, 30 + index * 10);
        });
    }

    loadUploadInterface() {
        // Reset upload form
        this.resetUploadForm();
        this.loadOccasionOptions();
    }

    resetUploadForm() {
        this.selectedFiles = [];
        document.getElementById('uploadPreview').innerHTML = '';
        document.getElementById('uploadBtn').disabled = true;
        document.getElementById('fileInput').value = '';
        
        // Reset selects
        document.getElementById('uploadYear').disabled = true;
        document.getElementById('uploadSubfolder').disabled = true;
        document.getElementById('newYearBtn').disabled = true;
        document.getElementById('newSubfolderBtn').disabled = true;
    }

    loadOccasionOptions() {
        const occasionSelect = document.getElementById('uploadOccasion');
        if (!occasionSelect) return;

        // Populate with existing occasions
        const occasions = [...new Set(gallery.mockData.media.map(item => item.occasion))];
        occasionSelect.innerHTML = '<option value="">Select Occasion</option>' +
            occasions.map(occasion => 
                `<option value="${occasion}">${gallery.formatOccasionName(occasion)}</option>`
            ).join('');
    }

    loadYears() {
        const occasion = document.getElementById('uploadOccasion').value;
        const yearSelect = document.getElementById('uploadYear');
        const newYearBtn = document.getElementById('newYearBtn');

        if (!occasion) {
            yearSelect.disabled = true;
            newYearBtn.disabled = true;
            return;
        }

        yearSelect.disabled = false;
        newYearBtn.disabled = false;

        // Get years for this occasion
        const years = [...new Set(
            gallery.mockData.media
                .filter(item => item.occasion === occasion)
                .map(item => item.year)
        )].sort().reverse();

        yearSelect.innerHTML = '<option value="">Select Year</option>' +
            years.map(year => `<option value="${year}">${year}</option>`).join('');

        // Reset subfolder
        document.getElementById('uploadSubfolder').disabled = true;
        document.getElementById('newSubfolderBtn').disabled = true;
    }

    loadSubfolders() {
        const occasion = document.getElementById('uploadOccasion').value;
        const year = document.getElementById('uploadYear').value;
        const subfolderSelect = document.getElementById('uploadSubfolder');
        const newSubfolderBtn = document.getElementById('newSubfolderBtn');

        if (!occasion || !year) {
            subfolderSelect.disabled = true;
            newSubfolderBtn.disabled = true;
            return;
        }

        subfolderSelect.disabled = false;
        newSubfolderBtn.disabled = false;

        // Get subfolders for this occasion and year
        const subfolders = [...new Set(
            gallery.mockData.media
                .filter(item => item.occasion === occasion && item.year === year && item.subfolder)
                .map(item => item.subfolder)
        )];

        subfolderSelect.innerHTML = '<option value="">Select Category (Optional)</option>' +
            subfolders.map(subfolder => 
                `<option value="${subfolder}">${gallery.formatSubfolderName(subfolder)}</option>`
            ).join('');
    }

    setupFileUpload() {
        const fileInput = document.getElementById('fileInput');
        if (fileInput) {
            fileInput.addEventListener('change', (e) => this.handleFileSelect(e));
        }
    }

    handleFileSelect(event) {
        const files = Array.from(event.target?.files || event.dataTransfer?.files || []);
        
        // Validate file types
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'video/mp4', 'video/mov'];
        const validFiles = files.filter(file => validTypes.includes(file.type));
        
        if (validFiles.length !== files.length) {
            gallery.showNotification('Some files were skipped. Only images and videos are allowed.', 'warning');
        }

        this.selectedFiles = [...this.selectedFiles, ...validFiles];
        this.updateUploadPreview();
        
        // Enable upload button if we have files
        document.getElementById('uploadBtn').disabled = this.selectedFiles.length === 0;
    }

    updateUploadPreview() {
        const preview = document.getElementById('uploadPreview');
        preview.innerHTML = this.selectedFiles.map((file, index) => {
            const isVideo = file.type.startsWith('video/');
            const url = URL.createObjectURL(file);
            
            return `
                <div class="preview-item">
                    ${isVideo 
                        ? `<video src="${url}" muted></video>` 
                        : `<img src="${url}" alt="${file.name}">`
                    }
                    <button class="preview-remove" onclick="adminManager.removeFile(${index})">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
            `;
        }).join('');
    }

    removeFile(index) {
        this.selectedFiles.splice(index, 1);
        this.updateUploadPreview();
        document.getElementById('uploadBtn').disabled = this.selectedFiles.length === 0;
    }

    async uploadFiles() {
        const occasion = document.getElementById('uploadOccasion').value;
        const year = document.getElementById('uploadYear').value;
        const subfolder = document.getElementById('uploadSubfolder').value;

        if (!occasion || !year) {
            gallery.showNotification('Please select occasion and year', 'error');
            return;
        }

        const uploadBtn = document.getElementById('uploadBtn');
        uploadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Uploading...';
        uploadBtn.disabled = true;

        try {
            // Simulate upload process
            for (let i = 0; i < this.selectedFiles.length; i++) {
                const file = this.selectedFiles[i];
                
                // Simulate upload delay
                await new Promise(resolve => setTimeout(resolve, 1000));
                
                // Create media item
                const mediaItem = {
                    id: Date.now() + i,
                    title: `${gallery.formatOccasionName(occasion)} - ${file.type.startsWith('video/') ? 'Video' : 'Photo'}`,
                    type: file.type.startsWith('video/') ? 'video' : 'image',
                    occasion: occasion,
                    year: year,
                    subfolder: subfolder || null,
                    thumbnail: URL.createObjectURL(file),
                    url: URL.createObjectURL(file),
                    likes: 0,
                    views: 0,
                    uploadDate: new Date(),
                    comments: []
                };

                gallery.mockData.media.unshift(mediaItem);
            }

            gallery.showNotification(`${this.selectedFiles.length} files uploaded successfully!`, 'success');
            this.resetUploadForm();

        } catch (error) {
            gallery.showNotification('Upload failed. Please try again.', 'error');
        } finally {
            uploadBtn.innerHTML = '<i class="fas fa-upload"></i> Upload Files';
        }
    }

    // Folder management
    loadFolderManagement() {
        const folderTree = document.getElementById('folderTree');
        if (!folderTree) return;

        folderTree.innerHTML = this.generateFolderTreeHTML();
    }

    generateFolderStructure() {
        const structure = {};
        
        gallery.mockData.media.forEach(item => {
            if (!structure[item.occasion]) {
                structure[item.occasion] = {};
            }
            if (!structure[item.occasion][item.year]) {
                structure[item.occasion][item.year] = {};
            }
            if (item.subfolder) {
                if (!structure[item.occasion][item.year][item.subfolder]) {
                    structure[item.occasion][item.year][item.subfolder] = 0;
                }
                structure[item.occasion][item.year][item.subfolder]++;
            } else {
                if (!structure[item.occasion][item.year]['_files']) {
                    structure[item.occasion][item.year]['_files'] = 0;
                }
                structure[item.occasion][item.year]['_files']++;
            }
        });

        return structure;
    }

    generateFolderTreeHTML() {
        let html = '';
        
        Object.keys(this.folderStructure).forEach(occasion => {
            html += `
                <div class="folder-item">
                    <i class="fas fa-folder"></i>
                    ${gallery.formatOccasionName(occasion)}
                </div>
            `;
            
            Object.keys(this.folderStructure[occasion]).forEach(year => {
                html += `
                    <div class="folder-item subfolder">
                        <i class="fas fa-folder"></i>
                        ${year}
                    </div>
                `;
                
                Object.keys(this.folderStructure[occasion][year]).forEach(subfolder => {
                    if (subfolder !== '_files') {
                        const count = this.folderStructure[occasion][year][subfolder];
                        html += `
                            <div class="folder-item file">
                                <i class="fas fa-folder-open"></i>
                                ${gallery.formatSubfolderName(subfolder)} (${count} files)
                            </div>
                        `;
                    }
                });
                
                if (this.folderStructure[occasion][year]['_files']) {
                    html += `
                        <div class="folder-item file">
                            <i class="fas fa-file"></i>
                            ${this.folderStructure[occasion][year]['_files']} files
                        </div>
                    `;
                }
            });
        });

        return html;
    }

    // User management
    loadUserManagement() {
        this.updateUserLists();
    }

    updateUserLists() {
        const pendingUsers = document.getElementById('pendingUsers');
        const activeUsers = document.getElementById('activeUsers');

        if (pendingUsers) {
            const pending = gallery.mockData.users.filter(u => u.status === 'pending');
            pendingUsers.innerHTML = pending.map(user => this.createUserCard(user, true)).join('');
            
            if (pending.length === 0) {
                pendingUsers.innerHTML = '<p class="text-center text-secondary">No pending approvals</p>';
            }
        }

        if (activeUsers) {
            const active = gallery.mockData.users.filter(u => u.status === 'approved');
            activeUsers.innerHTML = active.map(user => this.createUserCard(user, false)).join('');
        }
    }

    createUserCard(user, isPending) {
        return `
            <div class="user-card">
                <div class="user-info">
                    <div class="user-name">${user.name}</div>
                    <div class="user-email">${user.email}</div>
                    <div class="user-class">Class: ${user.class}</div>
                </div>
                <div class="user-actions">
                    ${isPending ? `
                        <button class="btn btn-sm btn-approve" onclick="adminManager.approveUser(${user.id})">
                            <i class="fas fa-check"></i> Approve
                        </button>
                        <button class="btn btn-sm btn-reject" onclick="adminManager.rejectUser(${user.id})">
                            <i class="fas fa-times"></i> Reject
                        </button>
                    ` : `
                        <button class="btn btn-sm btn-outline" onclick="adminManager.viewUserActivity(${user.id})">
                            <i class="fas fa-eye"></i> View Activity
                        </button>
                        <button class="btn btn-sm btn-error" onclick="adminManager.deactivateUser(${user.id})">
                            <i class="fas fa-ban"></i> Deactivate
                        </button>
                    `}
                </div>
            </div>
        `;
    }

    approveUser(userId) {
        if (authManager) {
            authManager.approveUser(userId);
            this.updateUserLists();
        }
    }

    rejectUser(userId) {
        if (authManager) {
            authManager.rejectUser(userId);
            this.updateUserLists();
        }
    }

    viewUserActivity(userId) {
        // Mock user activity view
        gallery.showNotification('User activity feature coming soon!', 'info');
    }

    deactivateUser(userId) {
        const user = gallery.mockData.users.find(u => u.id === userId);
        if (user) {
            user.status = 'deactivated';
            gallery.showNotification(`${user.name} has been deactivated`, 'success');
            this.updateUserLists();
        }
    }

    // Gallery management
    loadGalleryManagement() {
        const galleryGrid = document.getElementById('adminGalleryGrid');
        if (!galleryGrid) return;

        const recentMedia = gallery.mockData.media.slice(0, 20);
        galleryGrid.innerHTML = recentMedia.map(item => this.createAdminMediaCard(item)).join('');
    }

    createAdminMediaCard(item) {
        return `
            <div class="media-card admin-gallery-item">
                <div class="media-thumbnail">
                    ${item.type === 'video' 
                        ? `<video src="${item.url}" muted></video>` 
                        : `<img src="${item.thumbnail}" alt="${item.title}">`
                    }
                    <div class="media-type">${item.type === 'video' ? 'VIDEO' : 'PHOTO'}</div>
                    <div class="admin-overlay">
                        <button class="admin-action edit" onclick="adminManager.editMedia(${item.id})" title="Edit">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="admin-action delete" onclick="adminManager.deleteMedia(${item.id})" title="Delete">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="media-info">
                    <div class="media-title">${item.title}</div>
                    <div class="media-details">
                        ${gallery.formatOccasionName(item.occasion)} - ${item.year}
                        ${item.subfolder ? ` • ${gallery.formatSubfolderName(item.subfolder)}` : ''}
                    </div>
                    <div class="media-stats">
                        <span><i class="far fa-heart"></i> ${item.likes}</span>
                        <span><i class="far fa-eye"></i> ${item.views}</span>
                    </div>
                </div>
            </div>
        `;
    }

    editMedia(itemId) {
        gallery.showNotification('Media editing feature coming soon!', 'info');
    }

    deleteMedia(itemId) {
        if (confirm('Are you sure you want to delete this media item?')) {
            const index = gallery.mockData.media.findIndex(item => item.id === itemId);
            if (index !== -1) {
                gallery.mockData.media.splice(index, 1);
                gallery.showNotification('Media deleted successfully!', 'success');
                this.loadGalleryManagement();
            }
        }
    }

    // Modal handlers for creating new folders
    showCreateOccasionModal() {
        gallery.showModal('createOccasionModal');
    }

    showCreateYearModal() {
        const occasion = document.getElementById('uploadOccasion').value;
        if (!occasion) {
            gallery.showNotification('Please select an occasion first', 'error');
            return;
        }
        gallery.showModal('createYearModal');
    }

    showCreateSubfolderModal() {
        const occasion = document.getElementById('uploadOccasion').value;
        const year = document.getElementById('uploadYear').value;
        
        if (!occasion || !year) {
            gallery.showNotification('Please select occasion and year first', 'error');
            return;
        }
        gallery.showModal('createSubfolderModal');
    }

    createOccasion(event) {
        event.preventDefault();
        const name = document.getElementById('occasionName').value.trim();
        
        if (!name) return;

        // Create occasion folder structure (mock)
        const occasionKey = name.toLowerCase().replace(/\s+/g, '-');
        
        gallery.showNotification(`Occasion "${name}" created successfully!`, 'success');
        gallery.closeModal('createOccasionModal');
        
        // Update occasion dropdown
        this.loadOccasionOptions();
        
        // Reset form
        event.target.reset();
    }

    createYear(event) {
        event.preventDefault();
        const year = document.getElementById('yearName').value.trim();
        
        if (!year) return;

        gallery.showNotification(`Year folder "${year}" created successfully!`, 'success');
        gallery.closeModal('createYearModal');
        
        // Update year dropdown
        this.loadYears();
        
        // Reset form
        event.target.reset();
    }

    createSubfolder(event) {
        event.preventDefault();
        const name = document.getElementById('subfolderName').value.trim();
        
        if (!name) return;

        gallery.showNotification(`Category "${name}" created successfully!`, 'success');
        gallery.closeModal('createSubfolderModal');
        
        // Update subfolder dropdown
        this.loadSubfolders();
        
        // Reset form
        event.target.reset();
    }

    logout() {
        gallery.logout();
    }
}

// Global admin functions
function showSection(sectionId) {
    if (adminManager) {
        adminManager.showSection(sectionId);
    }
}

function loadYears() {
    if (adminManager) {
        adminManager.loadYears();
    }
}

function loadSubfolders() {
    if (adminManager) {
        adminManager.loadSubfolders();
    }
}

function handleFileSelect(event) {
    if (adminManager) {
        adminManager.handleFileSelect(event);
    }
}

function uploadFiles() {
    if (adminManager) {
        adminManager.uploadFiles();
    }
}

function showCreateOccasionModal() {
    if (adminManager) {
        adminManager.showCreateOccasionModal();
    }
}

function showCreateYearModal() {
    if (adminManager) {
        adminManager.showCreateYearModal();
    }
}

function showCreateSubfolderModal() {
    if (adminManager) {
        adminManager.showCreateSubfolderModal();
    }
}

function createOccasion(event) {
    if (adminManager) {
        adminManager.createOccasion(event);
    }
}

function createYear(event) {
    if (adminManager) {
        adminManager.createYear(event);
    }
}

function createSubfolder(event) {
    if (adminManager) {
        adminManager.createSubfolder(event);
    }
}

function logout() {
    if (adminManager) {
        adminManager.logout();
    }
}

// Initialize admin manager
let adminManager;
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin.html')) {
        adminManager = new AdminManager();
    }
});