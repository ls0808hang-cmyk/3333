const generatorBtn = document.getElementById('generator-btn');
const lottoNumbersContainer = document.getElementById('lotto-numbers-container');

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
