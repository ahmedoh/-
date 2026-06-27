document.addEventListener('DOMContentLoaded', () => {
    // --- Elements ---
    const introOverlay = document.getElementById('intro-overlay');
    const entryBtn = document.getElementById('entry-btn');
    const mainContent = document.getElementById('main-content');
    const audioContainer = document.getElementById('audio-container');
    const bgMusic = document.getElementById('bg-music');
    const playPauseBtn = document.getElementById('play-pause-btn');
    const vinylDisc = document.getElementById('vinyl-disc');
    const typedNickname = document.getElementById('typed-nickname');
    const envelope = document.getElementById('envelope');
    const balloonContainer = document.getElementById('balloon-container');
    const wishMessageBox = document.getElementById('wish-message-box');
    const wishText = document.getElementById('wish-text');
    const floatingBg = document.getElementById('floating-bg');
    
    // Lightbox
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxClose = document.querySelector('.lightbox-close');

    // --- State ---
    let audioPlaying = false;
    let names = ["مُنَّه", "LALA", "منمونة", "إيمان", "مُنَّه حبيبتي"];
    let nameIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 150;

    // --- Reasons for Balloon Popping Game ---
    const loveReasons = [
        "عشان ضحكتك اللي بتنور يومي كله وبتنسيني أي تعب 🥰",
        "عشان طيبة قلبك وحنيتك اللي ملهاش مثيل في الدنيا ❤️",
        "عشان شقاوتك ودلعك ولما بتقولي LALA وتخليني أضحك من قلبي 💫",
        "عشان وقوفك جنبي وجدعنتك اللي بتثبتلي دايماً إنك سندي 💪",
        "عشان عيونك الجميلة اللي بتخليني أسرح فيها وأنسى كل حاجة حواليا 🌟",
        "عشان كملتي 22 سنة وبقيتي أجمل بنوتة كبرت وسكرها زاد 🎂"
    ];
    let poppedCount = 0;

    // --- Confetti Canvas System ---
    const canvas = document.getElementById('confetti-canvas');
    const ctx = canvas.getContext('2d');
    let confettiActive = false;
    let particles = [];
    const colors = ['#ff3366', '#ffd700', '#8a2be2', '#00ced1', '#ff4500', '#ff1493', '#ff85a2'];

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    class ConfettiParticle {
        constructor(x, y, isExplosion = false) {
            this.x = x;
            this.y = y;
            this.size = Math.random() * 8 + 4;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            
            if (isExplosion) {
                // Radial velocity for explosion
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 8 + 4;
                this.speedX = Math.cos(angle) * speed;
                this.speedY = Math.sin(angle) * speed;
            } else {
                // Falling velocity
                this.speedX = Math.random() * 2 - 1;
                this.speedY = Math.random() * 3 + 2;
            }
            
            this.rotation = Math.random() * 360;
            this.rotationSpeed = Math.random() * 4 - 2;
            this.opacity = 1;
            this.decay = Math.random() * 0.015 + 0.005;
            this.shape = Math.random() > 0.5 ? 'circle' : 'rect';
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;
            this.rotation += this.rotationSpeed;
            
            // Apply gravity to explosion particles
            this.speedY += 0.1; 
            
            this.opacity -= this.decay;
        }

        draw() {
            ctx.save();
            ctx.translate(this.x, this.y);
            ctx.rotate((this.rotation * Math.PI) / 180);
            ctx.globalAlpha = this.opacity;
            ctx.fillStyle = this.color;

            if (this.shape === 'circle') {
                ctx.beginPath();
                ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.fillRect(-this.size / 2, -this.size / 2, this.size, this.size);
            }
            ctx.restore();
        }
    }

    function generateBurst(x, y, count = 50) {
        for (let i = 0; i < count; i++) {
            particles.push(new ConfettiParticle(x, y, true));
        }
    }

    function addFallingConfetti() {
        if (!confettiActive) return;
        if (particles.length < 150 && Math.random() < 0.4) {
            particles.push(new ConfettiParticle(Math.random() * canvas.width, -10, false));
        }
    }

    function animateConfetti() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        addFallingConfetti();

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].opacity <= 0 || particles[i].y > canvas.height + 20) {
                particles.splice(i, 1);
            }
        }
        requestAnimationFrame(animateConfetti);
    }
    animateConfetti();

    // --- Floating Hearts Background ---
    function createFloatingHeart() {
        const heart = document.createElement('i');
        heart.classList.add('fa-solid', 'fa-heart', 'floating-heart');
        
        // Random sizes and positions
        const size = Math.random() * 20 + 10; // 10px to 30px
        const left = Math.random() * 100; // 0% to 100%
        const duration = Math.random() * 10 + 10; // 10s to 20s
        
        heart.style.fontSize = `${size}px`;
        heart.style.left = `${left}%`;
        heart.style.animationDuration = `${duration}s`;
        
        // Random pink/rose/gold hues
        const heartColors = ['#ff3366', '#ff7597', '#ffd700', '#ff1493', '#e0a300'];
        heart.style.color = heartColors[Math.floor(Math.random() * heartColors.length)];
        
        floatingBg.appendChild(heart);
        
        // Remove after animation completes
        setTimeout(() => {
            heart.remove();
        }, duration * 1000);
    }

    // --- Nickname Typing Animation ---
    function typeNicknameEffect() {
        const currentName = names[nameIndex];
        
        if (isDeleting) {
            typedNickname.textContent = currentName.substring(0, charIndex - 1);
            charIndex--;
            typingSpeed = 70;
        } else {
            typedNickname.textContent = currentName.substring(0, charIndex + 1);
            charIndex++;
            typingSpeed = 150;
        }

        if (!isDeleting && charIndex === currentName.length) {
            // Wait at the end of the name
            typingSpeed = 2000;
            isDeleting = true;
        } else if (isDeleting && charIndex === 0) {
            isDeleting = false;
            nameIndex = (nameIndex + 1) % names.length;
            typingSpeed = 500; // Delay before typing next name
        }

        setTimeout(typeNicknameEffect, typingSpeed);
    }

    // --- Envelope click handler ---
    envelope.addEventListener('click', (e) => {
        // Prevent opening if clicking children handles in weird ways
        envelope.classList.toggle('open');
    });

    // --- Interactive Balloon Game Creator ---
    function createBalloons() {
        balloonContainer.innerHTML = '';
        poppedCount = 0;
        
        for (let i = 0; i < 6; i++) {
            const balloon = document.createElement('div');
            // Add color, and the new positional class for bouquet layout
            balloon.classList.add('balloon', `balloon-color-${(i % 6) + 1}`, `b-pos-${i + 1}`);
            
            // Add knot decoration
            const knot = document.createElement('div');
            knot.classList.add('balloon-knot');
            balloon.appendChild(knot);
            
            // Add string decoration
            const string = document.createElement('div');
            string.classList.add('balloon-string');
            balloon.appendChild(string);
            
            // Slightly stagger animation start
            balloon.style.animationDelay = `${Math.random() * 1.5}s`;
            
            // Instant Pop Action
            balloon.addEventListener('click', (e) => {
                if (!balloon.classList.contains('popped')) {
                    balloon.classList.add('popped');
                    
                    // Burst particles at click location instantly
                    const rect = balloon.getBoundingClientRect();
                    generateBurst(rect.left + rect.width / 2, rect.top + rect.height / 2, 45);
                    
                    // Show message instantly without delay
                    showWishMessage(loveReasons[i]);
                    
                    // Track pops
                    poppedCount++;
                    if (poppedCount === 6) {
                        setTimeout(() => {
                            showWishMessage("كل بالونة فرقعتيها بتعبر عن جزء صغير من حبي ودلعي ليكي. كل سنة وأنتِ منورة حياتي يا مُنَّه! 💖✨");
                            // Add a massive confetti celebration
                            generateBurst(window.innerWidth / 2, window.innerHeight / 2, 100);
                        }, 1200);
                    }
                }
            });
            
            balloonContainer.appendChild(balloon);
        }
    }

    function showWishMessage(message) {
        wishMessageBox.classList.remove('hidden');
        wishText.style.opacity = 0;
        
        setTimeout(() => {
            wishText.textContent = message;
            wishText.style.opacity = 1;
            wishText.style.transition = 'opacity 0.3s ease';
        }, 200);
    }

    // --- Lightbox Functions ---
    const polaroidCards = document.querySelectorAll('.polaroid-card');
    
    polaroidCards.forEach(card => {
        card.addEventListener('click', () => {
            const img = card.querySelector('.polaroid-img');
            const caption = card.querySelector('.polaroid-caption');
            
            lightbox.style.display = 'block';
            lightboxImg.src = img.src;
            lightboxCaption.textContent = caption.textContent;
            
            // Explode a few particles upon opening for surprise
            generateBurst(window.innerWidth / 2, window.innerHeight / 2, 20);
        });
    });

    function closeLightbox() {
        lightbox.style.display = 'none';
    }

    lightboxClose.addEventListener('click', closeLightbox);

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox || e.target === lightboxClose) {
            closeLightbox();
        }
    });

    // --- Interactive Birthday Cake Functions ---
    const cakeWishMessageMain = document.getElementById('cake-wish-message-main');
    const cake3dWrapper = document.getElementById('cake-3d-wrapper');
    const candlesLeft = document.getElementById('candles-left');
    const candleHint = document.getElementById('candle-hint');
    const allCandles = document.querySelectorAll('.cake-candle');
    let blownOutCandlesMain = 0;

    function playVoiceGreeting() {
        if ('speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const message = "كل سنة وأنتِ طيبة يا إيمان، يا منمونة يا أحلى لا لا في الدنيا! عيد ميلاد سعيد وعقبال مية سنة حلوة وأنتِ في الـ ٢٢ مع حبيبك دايماً وبخير وسعادة!";
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'ar-EG';
            utterance.rate = 0.82;
            utterance.pitch = 1.05;
            const voices = window.speechSynthesis.getVoices();
            const arabicVoice = voices.find(v => v.lang.includes('ar'));
            if (arabicVoice) utterance.voice = arabicVoice;
            window.speechSynthesis.speak(utterance);
        }
    }

    allCandles.forEach(candle => {
        candle.addEventListener('click', () => {
            const flame = candle.querySelector('.candle-flame');
            if (flame && !flame.classList.contains('out')) {
                flame.classList.add('out');

                // Burst particles at candle position
                const rect = candle.getBoundingClientRect();
                generateBurst(rect.left + rect.width / 2, rect.top + 10, 20);

                blownOutCandlesMain++;
                const remaining = 5 - blownOutCandlesMain;
                if (candlesLeft) candlesLeft.textContent = remaining;

                if (blownOutCandlesMain === 5) {
                    // All candles blown!
                    if (candleHint) candleHint.style.display = 'none';

                    setTimeout(() => {
                        if (cakeWishMessageMain) cakeWishMessageMain.classList.remove('hidden');
                        generateBurst(window.innerWidth / 2, window.innerHeight / 2, 120);
                        playVoiceGreeting();
                    }, 600);
                }
            }
        });
    });

    // --- Audio control ---
    function toggleAudio() {
        if (audioPlaying) {
            bgMusic.pause();
            vinylDisc.style.animationPlayState = 'paused';
            playPauseBtn.innerHTML = '<i class="fa-solid fa-play"></i>';
            audioPlaying = false;
        } else {
            // Browser might block this if not triggered inside user event, 
            // but since it's inside click event it is safe!
            bgMusic.play().then(() => {
                vinylDisc.style.animationPlayState = 'running';
                playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
                audioPlaying = true;
            }).catch(err => {
                console.log("Audio play blocked: ", err);
            });
        }
    }

    playPauseBtn.addEventListener('click', toggleAudio);

    // --- ENTRY BUTTON ACTION ---
    entryBtn.addEventListener('click', () => {
        confettiActive = true;
        
        // Massive burst of confetti at the heart position
        const btnRect = entryBtn.getBoundingClientRect();
        generateBurst(btnRect.left + btnRect.width / 2, btnRect.top + btnRect.height / 2, 100);
        
        // Try starting the music
        bgMusic.play().then(() => {
            audioPlaying = true;
            vinylDisc.style.animationPlayState = 'running';
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        }).catch(err => {
            console.log("Audio autoplay failed, waiting for user toggle:", err);
        });

        // Hide overlay and reveal main container
        introOverlay.classList.add('fade-out');
        mainContent.classList.remove('hidden');
        audioContainer.classList.remove('hidden');

        setTimeout(() => {
            mainContent.classList.add('visible');
            introOverlay.style.display = 'none';
        }, 800);

        // Initialize features
        typeNicknameEffect();
        createBalloons();
        
        // Start floating background hearts
        setInterval(createFloatingHeart, 1500);
        for(let i = 0; i < 8; i++) {
            setTimeout(createFloatingHeart, Math.random() * 5000);
        }
    });

});
