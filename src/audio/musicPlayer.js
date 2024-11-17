export class DemoMusicPlayer {
    constructor() {
        if (typeof ModPlayer === 'undefined') {
            console.error('ModPlayer not loaded - music disabled');
            return;
        }
        
        try {
            this.player = new ModPlayer();
            this.modUrls = [
                'https://modarchive.org/index.php?request=view_by_moduleid&query=49735',
                'https://modarchive.org/index.php?request=view_by_moduleid&query=59344'
            ];
            this.isInitialized = true;
        } catch (error) {
            console.error('Failed to create ModPlayer:', error);
            this.isInitialized = false;
        }
    }

    async init() {
        if (!this.isInitialized) return;
        
        try {
            await this.player.load(this.modUrls[0]);
            
            window.addEventListener('click', () => {
                if (this.player && !this.player.isPlaying) {
                    this.player.play();
                    console.log('Music started!');
                }
            }, { once: true });
            
        } catch (error) {
            console.error('Error loading music:', error);
        }
    }
} 