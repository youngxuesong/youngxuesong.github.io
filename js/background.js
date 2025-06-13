!function(){'use strict';

    /* 工具模块 */
    const Utils = {
        debounce: (func, wait = 30) => {
            let timeout;
            return (...args) => {
                clearTimeout(timeout);
                timeout = setTimeout(() => func.apply(this, args), wait);
            }
        },
        uuid: () => {
            let d = Date.now();
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
                const r = (d + Math.random() * 16) % 16 | 0;
                d = Math.floor(d / 16);
                return (c === 'x' ? r : (r & 0x3 | 0x8)).toString(16);
            });
        }
    };
    
    /* 尺寸传感器 */
    class SizeSensor {
        static sensors = new Map();
        
        static observe(element, callback) {
            const sensor = new ResizeObserver(Utils.debounce(() => {
                callback(element);
            }));
            sensor.observe(element);
            this.sensors.set(element, sensor);
        }
    
        static unobserve(element) {
            const sensor = this.sensors.get(element);
            if(sensor) {
                sensor.disconnect();
                this.sensors.delete(element);
            }
        }
    }
    
    /* 粒子系统核心 */
    class ParticleBackground {
        constructor(container, options = {}) {
            this.container = container;
            this.options = {
                colorType: 'rainbow',
                colors: ['#FF6B6B', '#4ECDC4', '#45B7D1'],
                lineType: 'gradient',
                particleCount: 80,
                maxDistance: 6000,
                particleSize: 2,
                lineWidth: 1,
                opacity: 0.6,
                zIndex: -1,
                velocity: 0.8,          // 新增：基础速度系数
                speedVariation: 0.3,    // 新增：速度随机变化范围
                ...options
            };
            
            this.initCanvas();
            this.initParticles();
            this.bindEvents();
            this.startAnimation();
        }
    
        initCanvas() {
            this.canvas = document.createElement('canvas');
            this.ctx = this.canvas.getContext('2d');
            
            Object.assign(this.canvas.style, {
                position: 'absolute',
                top: '0',
                left: '0',
                zIndex: this.options.zIndex,
                opacity: this.options.opacity
            });
            
            this.container.appendChild(this.canvas);
            this.resizeCanvas();
        }
    
        resizeCanvas() {
            this.canvas.width = this.container.clientWidth;
            this.canvas.height = this.container.clientHeight;
        }
    
        initParticles() {
            this.particles = Array.from({length: this.options.particleCount}, (_, i) => {
                // 速度计算逻辑优化
                const baseSpeed = this.options.velocity * 
                    (1 + this.options.speedVariation * (Math.random() - 0.5));
                
                return {
                    id: i,
                    x: Math.random() * this.canvas.width,
                    y: Math.random() * this.canvas.height,
                    vx: (Math.random() - 0.5) * baseSpeed,
                    vy: (Math.random() - 0.5) * baseSpeed,
                    color: this.generateColor(),
                    connections: new Set()
                };
            });
            
            this.mouse = { x: null, y: null };
        }
    
        generateColor() {
            if(this.options.colorType === 'custom') {
                return this.options.colors[
                    Math.floor(Math.random() * this.options.colors.length)
                ];
            }
            return `hsl(${Math.random()*360}, 70%, 60%)`;
        }
    
        bindEvents() {
            SizeSensor.observe(this.container, () => this.resizeCanvas());
            
            this.mouseHandler = e => {
                const rect = this.container.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            };
            
            this.container.addEventListener('mousemove', this.mouseHandler);
            this.container.addEventListener('mouseleave', () => {
                this.mouse.x = null;
                this.mouse.y = null;
            });
        }
    
        updateParticles() {
            this.particles.forEach(p => {
                // 应用速度系数
                p.x += p.vx * this.options.velocity;
                p.y += p.vy * this.options.velocity;
                
                // 边界反弹
                if(p.x < 0 || p.x > this.canvas.width) p.vx *= -1;
                if(p.y < 0 || p.y > this.canvas.height) p.vy *= -1;
                
                p.x = Math.max(0, Math.min(p.x, this.canvas.width));
                p.y = Math.max(0, Math.min(p.y, this.canvas.height));
            });
        }
    
        drawConnections() {
            const allPoints = [...this.particles];
            if(this.mouse.x !== null) allPoints.push(this.mouse);
    
            for(let i = 0; i < allPoints.length; i++) {
                const p1 = allPoints[i];
                
                for(let j = i+1; j < allPoints.length; j++) {
                    const p2 = allPoints[j];
                    const dx = p1.x - p2.x;
                    const dy = p1.y - p2.y;
                    const distSq = dx*dx + dy*dy;
                    
                    if(distSq < this.options.maxDistance) {
                        const gradient = this.ctx.createLinearGradient(
                            p1.x, p1.y, p2.x, p2.y
                        );
                        gradient.addColorStop(0, p1.color);
                        gradient.addColorStop(1, p2.color || p1.color);
                        
                        this.ctx.strokeStyle = this.options.lineType === 'gradient' 
                            ? gradient 
                            : p1.color;
                        
                        this.ctx.lineWidth = this.options.lineWidth * 
                            (1 - distSq/this.options.maxDistance);
                        
                        this.ctx.beginPath();
                        this.ctx.moveTo(p1.x, p1.y);
                        this.ctx.lineTo(p2.x, p2.y);
                        this.ctx.stroke();
                    }
                }
            }
        }
    
        drawParticles() {
            this.particles.forEach(p => {
                this.ctx.fillStyle = p.color;
                this.ctx.fillRect(
                    p.x - this.options.particleSize/2,
                    p.y - this.options.particleSize/2,
                    this.options.particleSize,
                    this.options.particleSize
                );
            });
        }
    
        animate() {
            this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            this.updateParticles();
            this.drawConnections();
            this.drawParticles();
            requestAnimationFrame(() => this.animate());
        }
    
        startAnimation() {
            this.animationFrame = requestAnimationFrame(() => this.animate());
        }
    
        destroy() {
            cancelAnimationFrame(this.animationFrame);
            SizeSensor.unobserve(this.container);
            this.container.removeEventListener('mousemove', this.mouseHandler);
            this.canvas.remove();
        }
    }
    
    /* 自定义修改配置项 */
    new ParticleBackground(document.body, {
        colorType: 'rainbow',
        //colors: [],       //colorType为custom时开启
        lineType: 'gradient',
        particleCount: 80,
        lineWidth: 2, 
        particleSize: 3,
        maxDistance: 8000,
        velocity: 1.2,       
        speedVariation: 0.3, 
        zIndex: -1,   
        opacity: 0.7
    });
    

    /*页脚显示网站运行时间*/
//此处的时间改为自己的博客运行时间
const CREATE_TIME = new Date('2025-06-08T00:00:00').getTime();  //使用ISO 8601日期格式，兼容所有浏览器
const TIME_UNITS = [
    { value: 31536000000, label: ' 年' },  // 年（毫秒）
    { value: 86400000, label: ' 天' },    // 天
    { value: 3600000, label: ' 时' },     // 小时
    { value: 60000, label: ' 分' },       // 分钟
    { value: 1000, label: ' 秒' }         // 秒
];
//修改此处的数字，选择默认显示时间的格式
let currentFormat = 0; // 0:年天时分秒 1:天时分秒 2:时分秒 3:分秒

function formatDuration(ms) {
    let remaining = ms;
    return TIME_UNITS.map((unit, index) => {
        if (index < currentFormat) return null;
        const value = Math.floor(remaining / unit.value);
        remaining %= unit.value;
        return value > 0 ? `${value}${unit.label}` : '';
    }).filter(Boolean).join(' ');
}

function updateRuntime() {
    const now = Date.now();
    const runtimeText = formatDuration(now - CREATE_TIME);
    document.getElementById('runtime').textContent = `本站已运行：${runtimeText}`;
}

// 点击事件监听
document.getElementById('runtime').addEventListener('click', () => {
    currentFormat = (currentFormat + 1) % 4;
    updateRuntime();
});

// 初始化
updateRuntime();
setInterval(updateRuntime, 1000);

    
    }();


/*************************分类页面美化*************************/
// 获取所有类别列表项
const categoryItems = document.querySelectorAll('.category-list-item');

// 为每个类别列表项生成随机颜色渐变背景和图标
categoryItems.forEach((item, index) => {
    // 为每个类别列表项创建随机颜色渐变背景
    function randomBgImg() {
        const deg = Math.floor(Math.random() * 360);
        const randomBg = `linear-gradient(${deg}deg, #${Math.floor(Math.random()*16777215).toString(16)} 0%, #${Math.floor(Math.random()*16777215).toString(16)} 100%)`;
        item.style.backgroundImage = randomBg;
    }

    // 生成随机图标（这里使用了 Font Awesome 图标库）
    const icons = ['📑', '📚', '🦋', '💻', '💬', '✨']; // 可以根据需要添加更多图标
    const randomIcon = icons[Math.floor(Math.random() * icons.length)];

    // 更新类别列表项的 HTML 内容，设置背景和图标
    item.innerHTML = `
    <div>${item.innerHTML}</div>
    <div class="category-list-icon">${randomIcon}</div>`;

    // 调用随机颜色渐变背景函数
    randomBgImg();
});

function postAddToc() {
  const postContent = document.querySelector('#post > #article-container.post-content');
  const cardToc = document.getElementById('card-toc');

  if (postContent && cardToc) {
    const tocItems = cardToc.querySelectorAll('.toc-link');
    const targetElements = {};

    tocItems.forEach(tocLink => {
      const href = decodeURIComponent(tocLink.getAttribute('href').slice(1));
      const targetElement = document.getElementById(href);
      const tocNumber = tocLink.querySelector('.toc-number').textContent;

      if (targetElement) {
        targetElements[href] = { element: targetElement, tocNumber };
      }
    });

    // 设置 dataset.toc 属性
    Object.entries(targetElements).forEach(([href, { element, tocNumber }]) => {
      element.dataset.toc = tocNumber;
    });
  }
}

postAddToc();

    