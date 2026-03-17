const generatorBtn = document.getElementById("generator-btn");
const lottoNumbersContainer = document.getElementById("lotto-numbers-container");
const pickCount = document.getElementById("pick-count");
const resultMeta = document.getElementById("result-meta");
const themeToggle = document.getElementById("theme-toggle");
const body = document.body;

const savedTheme = localStorage.getItem("theme");
if (savedTheme === "light") {
    body.classList.add("light-mode");
}
updateThemeButton();

themeToggle.addEventListener("click", () => {
    body.classList.toggle("light-mode");
    localStorage.setItem("theme", body.classList.contains("light-mode") ? "light" : "dark");
    updateThemeButton();
});

generatorBtn.addEventListener("click", () => {
    const count = Number(pickCount.value);
    const sets = Array.from({ length: count }, generateLottoSet);
    displayLottoNumbers(sets);
});

function updateThemeButton() {
    themeToggle.textContent = body.classList.contains("light-mode") ? "다크 모드" : "라이트 모드";
}

function generateLottoSet() {
    const pool = new Set();

    while (pool.size < 7) {
        pool.add(Math.floor(Math.random() * 45) + 1);
    }

    const values = Array.from(pool);
    const numbers = values.slice(0, 6).sort((a, b) => a - b);
    const bonus = values[6];

    return { numbers, bonus };
}

function displayLottoNumbers(sets) {
    lottoNumbersContainer.innerHTML = "";
    resultMeta.textContent = `${sets.length}세트가 생성되었습니다. 각 세트에는 보너스볼이 포함됩니다.`;

    sets.forEach((set, index) => {
        const setCard = document.createElement("article");
        setCard.className = "number-set";

        const header = document.createElement("div");
        header.className = "number-set-header";

        const title = document.createElement("h3");
        title.className = "number-set-title";
        title.textContent = `${index + 1}번째 자동번호`;

        const row = document.createElement("div");
        row.className = "number-row";

        set.numbers.forEach((number) => {
            const lottoNumberDiv = document.createElement("div");
            lottoNumberDiv.className = `lotto-number ${getRangeClass(number)}`;
            lottoNumberDiv.textContent = number;
            row.appendChild(lottoNumberDiv);
        });

        const bonusLabel = document.createElement("span");
        bonusLabel.className = "bonus-label";
        bonusLabel.textContent = "+";
        row.appendChild(bonusLabel);

        const bonusNumber = document.createElement("div");
        bonusNumber.className = `lotto-number bonus-ball ${getRangeClass(set.bonus)}`;
        bonusNumber.textContent = set.bonus;
        row.appendChild(bonusNumber);

        header.append(title);
        setCard.append(header, row);
        lottoNumbersContainer.appendChild(setCard);
    });
}

function getRangeClass(number) {
    if (number <= 10) {
        return "range-1";
    }
    if (number <= 20) {
        return "range-2";
    }
    if (number <= 30) {
        return "range-3";
    }
    if (number <= 40) {
        return "range-4";
    }
    return "range-5";
}

generatorBtn.click();
