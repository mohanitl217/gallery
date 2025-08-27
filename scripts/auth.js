// Authentication functionality
class AuthManager {
    constructor() {
        this.init();
    }

    init() {
        this.setupAuthForms();
        this.checkInitialAuth();
    }

    setupAuthForms() {
        // Login form
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(e);
            });
        }

        // Signup form
        const signupForm = document.getElementById('signupForm');
        if (signupForm) {
            signupForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleSignup(e);
            });
        }
    }

    checkInitialAuth() {
        // Check if redirected from admin login attempt
        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.get('redirect') === 'admin') {
            gallery.showNotification('Please login as admin to access admin panel', 'info');
            showLoginModal();
        }
    }

    async handleLogin(event) {
        event.preventDefault();
        
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const loginBtn = event.target.querySelector('button[type="submit"]');

        // Show loading state
        loginBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
        loginBtn.disabled = true;

        try {
            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            // Mock authentication
            if (username === 'admin' && password === 'admin123') {
                // Admin login
                const adminUser = {
                    id: 0,
                    username: 'admin',
                    name: 'Administrator',
                    email: 'admin@school.edu',
                    role: 'admin'
                };

                localStorage.setItem('currentUser', JSON.stringify(adminUser));
                gallery.currentUser = adminUser;
                gallery.isAdmin = true;

                closeModal('loginModal');
                gallery.showNotification('Welcome back, Admin!', 'success');
                
                // Redirect to admin panel or update UI
                const urlParams = new URLSearchParams(window.location.search);
                if (urlParams.get('redirect') === 'admin' || window.location.pathname.includes('admin')) {
                    window.location.href = 'admin.html';
                } else {
                    gallery.updateAuthUI();
                }

            } else {
                // Check if user exists and is approved
                const user = gallery.mockData.users.find(u => 
                    u.username === username && u.status === 'approved'
                );

                if (user) {
                    // Mock password check (in real app, this would be hashed)
                    const mockPassword = 'password123';
                    
                    if (password === mockPassword) {
                        localStorage.setItem('currentUser', JSON.stringify(user));
                        gallery.currentUser = user;
                        gallery.isAdmin = false;

                        closeModal('loginModal');
                        gallery.showNotification(`Welcome back, ${user.name}!`, 'success');
                        gallery.updateAuthUI();
                    } else {
                        throw new Error('Invalid password');
                    }
                } else {
                    const pendingUser = gallery.mockData.users.find(u => u.username === username);
                    if (pendingUser && pendingUser.status === 'pending') {
                        throw new Error('Your account is pending approval by admin');
                    } else {
                        throw new Error('Invalid username or password');
                    }
                }
            }

        } catch (error) {
            gallery.showNotification(error.message, 'error');
        } finally {
            // Reset button
            loginBtn.innerHTML = 'Login';
            loginBtn.disabled = false;
        }
    }

    async handleSignup(event) {
        event.preventDefault();

        const formData = {
            name: document.getElementById('signupName').value,
            email: document.getElementById('signupEmail').value,
            username: document.getElementById('signupUsername').value,
            password: document.getElementById('signupPassword').value,
            class: document.getElementById('studentClass').value
        };

        const signupBtn = event.target.querySelector('button[type="submit"]');

        // Show loading state
        signupBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';
        signupBtn.disabled = true;

        try {
            // Validate form data
            this.validateSignupData(formData);

            // Simulate API delay
            await new Promise(resolve => setTimeout(resolve, 1500));

            // Check if username or email already exists
            const existingUser = gallery.mockData.users.find(u => 
                u.username === formData.username || u.email === formData.email
            );

            if (existingUser) {
                throw new Error('Username or email already exists');
            }

            // Create new user (pending approval)
            const newUser = {
                id: Date.now(),
                ...formData,
                status: 'pending',
                createdAt: new Date()
            };

            // Add to mock data
            gallery.mockData.users.push(newUser);

            closeModal('signupModal');
            gallery.showNotification('Account created! Please wait for admin approval.', 'success');

            // Reset form
            event.target.reset();

        } catch (error) {
            gallery.showNotification(error.message, 'error');
        } finally {
            // Reset button
            signupBtn.innerHTML = 'Sign Up';
            signupBtn.disabled = false;
        }
    }

    validateSignupData(data) {
        if (!data.name.trim()) {
            throw new Error('Full name is required');
        }
        if (!data.email.includes('@')) {
            throw new Error('Please enter a valid email address');
        }
        if (data.username.length < 3) {
            throw new Error('Username must be at least 3 characters long');
        }
        if (data.password.length < 6) {
            throw new Error('Password must be at least 6 characters long');
        }
        if (!data.class.trim()) {
            throw new Error('Class/Grade is required');
        }
    }

    logout() {
        return gallery.logout();
    }

    // Password reset functionality
    async resetPassword(email) {
        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1000));

            const user = gallery.mockData.users.find(u => u.email === email);
            if (!user) {
                throw new Error('Email not found');
            }

            gallery.showNotification('Password reset link sent to your email!', 'success');
        } catch (error) {
            gallery.showNotification(error.message, 'error');
        }
    }

    // Admin functions for user management
    approveUser(userId) {
        const user = gallery.mockData.users.find(u => u.id === userId);
        if (user) {
            user.status = 'approved';
            gallery.showNotification(`${user.name} approved!`, 'success');
            
            // Update admin UI if on admin page
            if (window.location.pathname.includes('admin.html')) {
                this.updateUserManagementUI();
            }
        }
    }

    rejectUser(userId) {
        const userIndex = gallery.mockData.users.findIndex(u => u.id === userId);
        if (userIndex !== -1) {
            const user = gallery.mockData.users[userIndex];
            gallery.mockData.users.splice(userIndex, 1);
            gallery.showNotification(`${user.name} rejected and removed.`, 'success');
            
            // Update admin UI if on admin page
            if (window.location.pathname.includes('admin.html')) {
                this.updateUserManagementUI();
            }
        }
    }

    updateUserManagementUI() {
        // This would update the admin user management interface
        if (typeof updateUserLists === 'function') {
            updateUserLists();
        }
    }

    // Check if user has permission for specific actions
    hasPermission(action) {
        if (!gallery.currentUser) return false;
        
        switch (action) {
            case 'upload':
                return gallery.isAdmin;
            case 'comment':
                return true; // All logged in users can comment
            case 'like':
                return true; // All logged in users can like
            case 'admin':
                return gallery.isAdmin;
            default:
                return false;
        }
    }

    // Session management
    refreshSession() {
        const user = localStorage.getItem('currentUser');
        if (user) {
            try {
                gallery.currentUser = JSON.parse(user);
                gallery.isAdmin = gallery.currentUser.username === 'admin';
                return true;
            } catch (error) {
                localStorage.removeItem('currentUser');
                return false;
            }
        }
        return false;
    }

    // Auto-logout after inactivity
    setupAutoLogout() {
        let inactivityTimer;
        const inactivityTime = 30 * 60 * 1000; // 30 minutes

        const resetTimer = () => {
            clearTimeout(inactivityTimer);
            inactivityTimer = setTimeout(() => {
                if (gallery.currentUser) {
                    gallery.showNotification('Session expired due to inactivity', 'info');
                    this.logout();
                }
            }, inactivityTime);
        };

        // Reset timer on user activity
        ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'].forEach(event => {
            document.addEventListener(event, resetTimer, true);
        });

        resetTimer();
    }
}

// Global auth functions
function handleLogin(event) {
    if (typeof authManager !== 'undefined') {
        return authManager.handleLogin(event);
    }
}

function handleSignup(event) {
    if (typeof authManager !== 'undefined') {
        return authManager.handleSignup(event);
    }
}

// Initialize auth manager
let authManager;
document.addEventListener('DOMContentLoaded', () => {
    authManager = new AuthManager();
    authManager.setupAutoLogout();
});