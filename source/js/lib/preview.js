mixins.preview = {
    data() {
        return { 
            previewShow: false,
            currentImageIndex: 0,
            images: [],
            scale: 1,
            isDragging: false,
            startX: 0,
            startY: 0,
            translateX: 0,
            translateY: 0
        };
    },
    created() {
        this.renderers.push(this.preview);
    },
    mounted() {
        // Add keyboard event listeners
        document.addEventListener('keydown', this.handleKeydown);
        
        // Add mouse event listeners to the preview container for better drag experience
        const preview = this.$refs.preview;
        if (preview) {
            preview.addEventListener('mousedown', this.handleMouseDown);
            preview.addEventListener('wheel', this.handleWheel, { passive: false });
            document.addEventListener('mousemove', this.handleMouseMove);
            document.addEventListener('mouseup', this.handleMouseUp);
        }
        
        // Add touch event listeners for mobile
        const previewContent = this.$refs.previewContent;
        if (previewContent) {
            previewContent.addEventListener('touchstart', this.handleTouchStart, { passive: false });
            previewContent.addEventListener('touchmove', this.handleTouchMove, { passive: false });
            previewContent.addEventListener('touchend', this.handleTouchEnd);
        }
    },
    beforeDestroy() {
        // Clean up event listeners
        document.removeEventListener('keydown', this.handleKeydown);
        document.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseup', this.handleMouseUp);
        
        const preview = this.$refs.preview;
        if (preview) {
            preview.removeEventListener('mousedown', this.handleMouseDown);
            preview.removeEventListener('wheel', this.handleWheel);
        }
        
        const previewContent = this.$refs.previewContent;
        if (previewContent) {
            previewContent.removeEventListener('touchstart', this.handleTouchStart);
            previewContent.removeEventListener('touchmove', this.handleTouchMove);
            previewContent.removeEventListener('touchend', this.handleTouchEnd);
        }
    },
    methods: {
        preview() {
            let preview = this.$refs.preview,
                content = this.$refs.previewContent;
            
            // Collect all images in the content area
            this.images = Array.from(document.querySelectorAll('.post-content img, .content img, article img'));
            
            for (let i = 0; i < this.images.length; i++) {
                const img = this.images[i];
                img.style.cursor = 'zoom-in';
                img.addEventListener("click", (e) => {
                    e.stopPropagation();
                    this.currentImageIndex = i;
                    this.showImage(i);
                    this.previewShow = true;
                    this.resetZoom();
                });
            }
            
            preview.addEventListener("click", (e) => {
                if (e.target === preview) {
                    this.previewShow = false;
                }
            });
            
            window.addEventListener("resize", () => {
                this.previewShow = false;
                this.resetZoom();
            });
        },
        
        showImage(index) {
            if (index >= 0 && index < this.images.length) {
                const content = this.$refs.previewContent;
                const img = this.images[index];
                content.alt = img.alt;
                content.src = img.src;
                this.resetZoom();
            }
        },
        
        nextImage() {
            if (this.images.length > 0) {
                this.currentImageIndex = (this.currentImageIndex + 1) % this.images.length;
                this.showImage(this.currentImageIndex);
            }
        },
        
        prevImage() {
            if (this.images.length > 0) {
                this.currentImageIndex = (this.currentImageIndex - 1 + this.images.length) % this.images.length;
                this.showImage(this.currentImageIndex);
            }
        },
        
        zoomIn() {
            this.scale = Math.min(this.scale + 0.2, 3);
            this.applyTransform();
        },
        
        zoomOut() {
            this.scale = Math.max(this.scale - 0.2, 0.5);
            this.applyTransform();
        },
        
        resetZoom() {
            this.scale = 1;
            this.translateX = 0;
            this.translateY = 0;
            this.applyTransform();
        },
        
        applyTransform() {
            const content = this.$refs.previewContent;
            if (content) {
                content.style.transform = `translate(${this.translateX}px, ${this.translateY}px) scale(${this.scale})`;
            }
        },
        
        handleKeydown(e) {
            if (!this.previewShow) return;
            
            switch(e.key) {
                case 'Escape':
                    this.previewShow = false;
                    break;
                case 'ArrowLeft':
                    this.prevImage();
                    break;
                case 'ArrowRight':
                    this.nextImage();
                    break;
                case '+':
                case '=':
                    this.zoomIn();
                    break;
                case '-':
                    this.zoomOut();
                    break;
                case '0':
                    this.resetZoom();
                    break;
            }
        },
        
        handleWheel(e) {
            if (!this.previewShow) return;
            e.preventDefault();
            
            if (e.deltaY < 0) {
                this.zoomIn();
            } else {
                this.zoomOut();
            }
        },
        
        handleMouseDown(e) {
            if (!this.previewShow || e.button !== 0 || this.scale <= 1) return;
            e.preventDefault();
            
            this.isDragging = true;
            this.startX = e.clientX - this.translateX;
            this.startY = e.clientY - this.translateY;
            
            const content = this.$refs.previewContent;
            if (content) {
                content.style.cursor = 'grabbing';
            }
        },
        
        handleMouseMove(e) {
            if (!this.isDragging || !this.previewShow) return;
            e.preventDefault();
            
            this.translateX = e.clientX - this.startX;
            this.translateY = e.clientY - this.startY;
            this.applyTransform();
        },
        
        handleMouseUp() {
            if (!this.isDragging) return;
            this.isDragging = false;
            const content = this.$refs.previewContent;
            if (content) {
                content.style.cursor = this.scale > 1 ? 'grab' : 'default';
            }
        },
        
        handleTouchStart(e) {
            if (e.touches.length === 1 && this.scale > 1) {
                this.isDragging = true;
                this.startX = e.touches[0].clientX - this.translateX;
                this.startY = e.touches[0].clientY - this.translateY;
            }
        },
        
        handleTouchMove(e) {
            if (!this.isDragging || e.touches.length !== 1) return;
            e.preventDefault();
            
            this.translateX = e.touches[0].clientX - this.startX;
            this.translateY = e.touches[0].clientY - this.startY;
            this.applyTransform();
        },
        
        handleTouchEnd() {
            this.isDragging = false;
        }
    }
};
