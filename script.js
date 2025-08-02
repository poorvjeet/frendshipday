class MemoryGame {
    constructor() {
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.startTime = 0;
        this.gameTimer = null;
        this.canFlip = true;
        this.hintsUsed = 0;
        this.maxHints = 3;
        
        this.symbols = ['🧸', '💕', '🌸', '🎀', '⭐', '🎈', '🦋', '🌺', '💖', '🎪', '🎨', '🎭'];
        this.selectedSymbols = [];
        
        this.initializeGame();
        this.bindEvents();
    }
    
    initializeGame() {
        // Select 6 random symbols for the game (12 cards total)
        this.selectedSymbols = this.shuffleArray([...this.symbols]).slice(0, 6);
        this.cards = [];
        this.flippedCards = [];
        this.matchedPairs = 0;
        this.moves = 0;
        this.gameStarted = false;
        this.canFlip = true;
        this.hintsUsed = 0;
        
        // Create pairs of cards
        this.selectedSymbols.forEach(symbol => {
            this.cards.push({ symbol, id: Math.random(), isFlipped: false, isMatched: false });
            this.cards.push({ symbol, id: Math.random(), isFlipped: false, isMatched: false });
        });
        
        // Shuffle the cards
        this.cards = this.shuffleArray(this.cards);
        
        this.updateDisplay();
        this.updateHintButton();
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    bindEvents() {
        // Welcome screen
        document.getElementById('start-game').addEventListener('click', () => {
            this.startGame();
        });
        
        // Game controls
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.getHint();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Victory screen
        document.getElementById('play-again').addEventListener('click', () => {
            this.restartGame();
        });
        
        // Add touch events for mobile
        document.getElementById('start-game').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startGame();
        });
        
        document.getElementById('hint-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.getHint();
        });
        
        document.getElementById('restart-btn').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.restartGame();
        });
        
        document.getElementById('play-again').addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.restartGame();
        });
    }
    
    startGame() {
        this.showScreen('game-screen');
        this.gameStarted = true;
        this.startTime = Date.now();
        this.startTimer();
        this.renderCards();
        
        // Prevent mobile scrolling and zoom
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.touchAction = 'manipulation';
        
        // Prevent zoom on mobile
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
    restartGame() {
        this.initializeGame();
        this.showScreen('game-screen');
        this.gameStarted = true;
        this.startTime = Date.now();
        this.startTimer();
        this.renderCards();
        
        // Prevent mobile scrolling and zoom
        document.body.style.overflow = 'hidden';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.height = '100%';
        document.body.style.touchAction = 'manipulation';
        
        // Prevent zoom on mobile
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
    startTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        this.gameTimer = setInterval(() => {
            if (this.gameStarted) {
                const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
                document.getElementById('timer').textContent = elapsed;
            }
        }, 1000);
    }
    
    renderCards() {
        const grid = document.getElementById('memory-grid');
        grid.innerHTML = '';
        
        this.cards.forEach((card, index) => {
            const cardElement = document.createElement('div');
            cardElement.className = 'memory-card';
            cardElement.dataset.index = index;
            
            if (card.isFlipped || card.isMatched) {
                cardElement.classList.add('flipped');
                cardElement.textContent = card.symbol;
            }
            
            if (card.isMatched) {
                cardElement.classList.add('matched');
            }
            
            // Enhanced mobile touch handling
            let touchStartTime = 0;
            let touchStartY = 0;
            
            // Click event for desktop
            cardElement.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.flipCard(index);
            });
            
            // Touch events for mobile
            cardElement.addEventListener('touchstart', (e) => {
                e.preventDefault();
                e.stopPropagation();
                touchStartTime = Date.now();
                touchStartY = e.touches[0].clientY;
            }, { passive: false });
            
            cardElement.addEventListener('touchend', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const touchEndTime = Date.now();
                const touchEndY = e.changedTouches[0].clientY;
                const touchDuration = touchEndTime - touchStartTime;
                const touchDistance = Math.abs(touchEndY - touchStartY);
                
                // Only trigger if it's a short tap (not a scroll)
                if (touchDuration < 300 && touchDistance < 10) {
                    this.flipCard(index);
                }
            }, { passive: false });
            
            // Prevent context menu on long press
            cardElement.addEventListener('contextmenu', (e) => {
                e.preventDefault();
            });
            
            // Prevent text selection
            cardElement.addEventListener('selectstart', (e) => {
                e.preventDefault();
            });
            
            grid.appendChild(cardElement);
        });
    }
    
    flipCard(index) {
        if (!this.canFlip || this.cards[index].isFlipped || this.cards[index].isMatched) {
            return;
        }
        
        // Start timer on first flip
        if (!this.gameStarted) {
            this.gameStarted = true;
            this.startTime = Date.now();
            this.startTimer();
        }
        
        this.cards[index].isFlipped = true;
        this.flippedCards.push(index);
        
        this.renderCards();
        
        // Check if we have two cards flipped
        if (this.flippedCards.length === 2) {
            this.canFlip = false;
            this.moves++;
            this.updateDisplay();
            
            setTimeout(() => {
                this.checkMatch();
            }, 1000);
        }
    }
    
    checkMatch() {
        const [index1, index2] = this.flippedCards;
        const card1 = this.cards[index1];
        const card2 = this.cards[index2];
        
        if (card1.symbol === card2.symbol) {
            // Match found
            card1.isMatched = true;
            card2.isMatched = true;
            this.matchedPairs++;
            
            // Play match sound
            this.playSound('match');
            
            // Check if game is won
            if (this.matchedPairs === this.selectedSymbols.length) {
                setTimeout(() => {
                    this.gameWon();
                }, 500);
            }
        } else {
            // No match, flip cards back
            card1.isFlipped = false;
            card2.isFlipped = false;
        }
        
        this.flippedCards = [];
        this.canFlip = true;
        this.renderCards();
    }
    
    gameWon() {
        this.gameStarted = false;
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
        }
        
        const finalTime = Math.floor((Date.now() - this.startTime) / 1000);
        document.getElementById('final-moves').textContent = this.moves;
        document.getElementById('final-time').textContent = finalTime;
        
        this.showScreen('victory-screen');
        this.createConfetti();
        this.createGiftAnimation();
        
        // Restore mobile scrolling and zoom
        document.body.style.overflow = '';
        document.body.style.position = '';
        document.body.style.width = '';
        document.body.style.height = '';
        document.body.style.touchAction = '';
        
        // Restore viewport
        const viewport = document.querySelector('meta[name=viewport]');
        if (viewport) {
            viewport.setAttribute('content', 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no');
        }
    }
    
    updateDisplay() {
        document.getElementById('moves').textContent = this.moves;
        document.getElementById('pairs-found').textContent = this.matchedPairs;
    }
    
    updateHintButton() {
        const hintBtn = document.getElementById('hint-btn');
        const remainingHints = this.maxHints - this.hintsUsed;
        hintBtn.textContent = `💡 Hint (${remainingHints})`;
        
        if (remainingHints <= 0) {
            hintBtn.disabled = true;
            hintBtn.style.opacity = '0.5';
        } else {
            hintBtn.disabled = false;
            hintBtn.style.opacity = '1';
        }
    }
    
    getHint() {
        if (this.hintsUsed >= this.maxHints || !this.gameStarted) return;
        
        this.hintsUsed++;
        this.updateHintButton();
        
        // Find an unmatched pair
        const unmatchedCards = this.cards.filter(card => !card.isMatched);
        const symbolCounts = {};
        
        unmatchedCards.forEach(card => {
            symbolCounts[card.symbol] = (symbolCounts[card.symbol] || 0) + 1;
        });
        
        // Find a symbol that has 2 cards
        const availableSymbol = Object.keys(symbolCounts).find(symbol => symbolCounts[symbol] >= 2);
        
        if (availableSymbol) {
            // Find the two cards with this symbol
            const hintCards = unmatchedCards.filter(card => card.symbol === availableSymbol).slice(0, 2);
            
            // Temporarily show these cards
            hintCards.forEach(card => {
                card.isFlipped = true;
            });
            
            this.renderCards();
            
            // Hide them after 2 seconds
            setTimeout(() => {
                hintCards.forEach(card => {
                    if (!card.isMatched) {
                        card.isFlipped = false;
                    }
                });
                this.renderCards();
            }, 2000);
            
            // Play hint sound
            this.playSound('hint');
        }
    }
    
    showScreen(screenId) {
        // Hide all screens
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // Show target screen
        document.getElementById(screenId).classList.add('active');
    }
    
    playSound(type) {
        // Simple sound effect using Web Audio API
        try {
            const audioContext = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioContext.createOscillator();
            const gainNode = audioContext.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioContext.destination);
            
            if (type === 'match') {
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(1000, audioContext.currentTime + 0.1);
            } else if (type === 'hint') {
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.1);
                oscillator.frequency.setValueAtTime(600, audioContext.currentTime + 0.2);
            } else {
                oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
            }
            
            gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
            
            oscillator.start(audioContext.currentTime);
            oscillator.stop(audioContext.currentTime + 0.2);
        } catch (e) {
            // Fallback for browsers that don't support Web Audio API
            console.log('Sound not supported');
        }
    }
    
    createConfetti() {
        const colors = ['#ff6b9d', '#667eea', '#4ecdc4', '#45b7d1', '#96ceb4', '#feca57'];
        const emojis = ['🎉', '🎊', '✨', '💖', '🎈', '🌸'];
        
        for (let i = 0; i < 50; i++) {
            setTimeout(() => {
                const confetti = document.createElement('div');
                confetti.style.position = 'fixed';
                confetti.style.left = Math.random() * 100 + 'vw';
                confetti.style.top = '-10px';
                confetti.style.fontSize = Math.random() * 20 + 10 + 'px';
                confetti.style.color = colors[Math.floor(Math.random() * colors.length)];
                confetti.style.pointerEvents = 'none';
                confetti.style.zIndex = '1000';
                confetti.textContent = Math.random() > 0.5 ? 
                    emojis[Math.floor(Math.random() * emojis.length)] : 
                    '●';
                
                document.body.appendChild(confetti);
                
                const animation = confetti.animate([
                    { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
                    { transform: `translateY(${window.innerHeight + 100}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
                ], {
                    duration: Math.random() * 3000 + 2000,
                    easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)'
                });
                
                animation.onfinish = () => {
                    document.body.removeChild(confetti);
                };
            }, i * 100);
        }
    }
    
    createGiftAnimation() {
        // Create floating gift emojis around the screen
        const giftEmojis = ['🎁', '🧸', '🎀', '💝', '🎪'];
        
        for (let i = 0; i < 15; i++) {
            setTimeout(() => {
                const gift = document.createElement('div');
                gift.style.position = 'fixed';
                gift.style.left = Math.random() * 100 + 'vw';
                gift.style.top = Math.random() * 100 + 'vh';
                gift.style.fontSize = Math.random() * 30 + 20 + 'px';
                gift.style.pointerEvents = 'none';
                gift.style.zIndex = '999';
                gift.style.opacity = '0';
                gift.textContent = giftEmojis[Math.floor(Math.random() * giftEmojis.length)];
                
                document.body.appendChild(gift);
                
                // Animate gift appearance and floating
                const animation = gift.animate([
                    { opacity: 0, transform: 'scale(0) rotate(0deg)' },
                    { opacity: 1, transform: 'scale(1) rotate(360deg)' },
                    { opacity: 0, transform: 'scale(0.8) rotate(720deg)' }
                ], {
                    duration: 4000,
                    easing: 'ease-in-out'
                });
                
                animation.onfinish = () => {
                    document.body.removeChild(gift);
                };
            }, i * 200);
        }
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new MemoryGame();
}); 