const generatorBtn = document.getElementById('generator-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers-container');
const themeToggle = document.getElementById('theme-toggle');
const body = document.body;

// Check for saved theme preference
const savedTheme = localStorage.getItem('theme');
if (savedTheme === 'light') {
    body.classList.add('light-mode');
    themeToggle.textContent = 'Dark Mode';
}

themeToggle.addEventListener('click', () => {
    body.classList.toggle('light-mode');
    const isLightMode = body.classList.contains('light-mode');
    
    themeToggle.textContent = isLightMode ? 'Dark Mode' : 'Light Mode';
    localStorage.setItem('theme', isLightMode ? 'light' : 'dark');
});

generatorBtn.addEventListener('click', () => {
    const lottoNumbers = generateLottoNumbers();
    displayLottoNumbers(lottoNumbers);
});

function generateLottoNumbers() {
    const numbers = new Set();
    while (numbers.size < 6) {
        const randomNumber = Math.floor(Math.random() * 45) + 1;
        numbers.add(randomNumber);
    }
    return Array.from(numbers);
}

function displayLottoNumbers(numbers) {
    lottoNumbersContainer.innerHTML = '';
    numbers.forEach(number => {
        const lottoNumberDiv = document.createElement('div');
        lottoNumberDiv.classList.add('lotto-number');
        lottoNumberDiv.textContent = number;
        lottoNumbersContainer.appendChild(lottoNumberDiv);
    });
}
