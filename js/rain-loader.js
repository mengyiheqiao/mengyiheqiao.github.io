class RainSunshineLoader {
    constructor() {
        this.rainLayer = document.getElementById('rainLayer');
        this.percentageEl = document.getElementById('percentage');
        this.statusEl = document.getElementById('status');
        this.loader = document.querySelector('.rain-sunshine-loader');
        
        this.progress = 0;
        this.totalTime = 6000; // 6秒总时长
        this.interval = 50;    // 更新间隔
        this.increment = 100 / (this.totalTime / this.interval);
        
        this.rainDensity = {
            heavy: 10,    // 大雨密度
            medium: 5,    // 中雨密度  
            light: 2      // 小雨密度
        };
        
        this.currentRainLevel = 'heavy';
        this.lastRainTime = 0;
        
        this.init();
    }
    
    init() {
        this.startLoading();
        this.createInitialRain();
    }
    
    createInitialRain() {
        // 初始创建一些雨滴
        for (let i = 0; i < 30; i++) {
            setTimeout(() => this.createRaindrop(), Math.random() * 1000);
        }
    }
    
    createRaindrop() {
        const raindrop = document.createElement('div');
        raindrop.className = 'raindrop';
        
        // 随机位置
        const left = Math.random() * 100;
        raindrop.style.left = `${left}%`;
        
        // 随机动画参数
        const duration = 1 + Math.random() * 1.5;
        const delay = Math.random() * 2;
        const opacity = 0.3 + Math.random() * 0.5;
        
        raindrop.style.animationDuration = `${duration}s`;
        raindrop.style.animationDelay = `${delay}s`;
        raindrop.style.opacity = opacity;
        
        this.rainLayer.appendChild(raindrop);
        
        // 动画结束后移除元素
        setTimeout(() => {
            if (raindrop.parentNode) {
                raindrop.parentNode.removeChild(raindrop);
            }
        }, (duration + delay) * 1000);
    }
    
    updateRainDensity() {
        if (this.progress < 30) {
            this.currentRainLevel = 'heavy';
        } else if (this.progress < 70) {
            this.currentRainLevel = 'medium';
        } else {
            this.currentRainLevel = 'light';
        }
    }
    
    updateVisuals() {
        // 更新天空亮度
        const brightness = 0.5 + (this.progress / 100) * 0.5;
        document.querySelector('.sky-background').style.filter = `brightness(${brightness})`;
        
        // 更新云层透明度
        const cloudOpacity = 0.7 - (this.progress / 100) * 0.4;
        document.querySelectorAll('.cloud').forEach(cloud => {
            cloud.style.opacity = cloudOpacity;
        });
        
        // 更新阳光光束
        if (this.progress > 70) {
            const sunOpacity = ((this.progress - 70) / 30) * 1;
            document.querySelector('.sunbeams').style.opacity = sunOpacity;
        }
        
        // 更新状态文字
        this.updateStatusText();
    }
    
    updateStatusText() {
        this.percentageEl.textContent = `${Math.round(this.progress)}%`;
        
        if (this.progress < 30) {
            this.statusEl.textContent = '大雨倾盆...';
            this.statusEl.style.color = '#FFFFFF';
        } else if (this.progress < 70) {
            this.statusEl.textContent = '雨势渐小...';
            this.statusEl.style.color = '#E8F4FD';
        } else {
            this.statusEl.textContent = '天晴了！';
            this.statusEl.style.color = '#FFEAA7';
        }
    }
    
    startLoading() {
        const loadingInterval = setInterval(() => {
            this.progress += this.increment;
            
            if (this.progress >= 100) {
                this.progress = 100;
                clearInterval(loadingInterval);
                this.loadingComplete();
            }
            
            this.updateRainDensity();
            this.updateVisuals();
            
            // 控制雨滴生成
            const now = Date.now();
            if (now - this.lastRainTime > 1000 / this.rainDensity[this.currentRainLevel]) {
                this.createRaindrop();
                this.lastRainTime = now;
            }
            
        }, this.interval);
    }
    
    loadingComplete() {
        this.loader.classList.add('loading-complete');
        
        // 最终效果：停止下雨，强化阳光
        setTimeout(() => {
            this.rainLayer.innerHTML = '';
            document.querySelector('.sunbeams').style.opacity = '1';
        }, 1000);
        
        // 模拟加载完成后的操作
        setTimeout(() => {
            this.hideLoader();
        }, 2000);
    }
    
    hideLoader() {
        this.loader.style.opacity = '0';
        this.loader.style.transition = 'opacity 1s ease';
        
        setTimeout(() => {
            this.loader.style.display = 'none';
        }, 1000);
    }
}

// 初始化加载动画
document.addEventListener('DOMContentLoaded', () => {
    new RainSunshineLoader();
});