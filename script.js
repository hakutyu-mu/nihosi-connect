let currentQuestion;
let userAnswer = { year: null, event: null, relation: null };
let quizData = [];
let selectedEras = []; // チェックボックスで選択された時代を格納する配列

// CSV読み込み関数
async function loadCSV() {
    try {
        const response = await fetch('assets/日本史リンクデータ管理1.csv');
        const data = await response.text();
        const parsedData = parseCSV(data);

        quizData = parsedData; // データをグローバル変数に保存
        initializeQuestions(); // データがロードされてから初期化
    } catch (error) {
        console.error("CSVファイルの読み込みに失敗しました:", error);
    }
}

// CSV解析関数
function parseCSV(data) {
    const lines = data.trim().split('\n');
    const headers = lines[0].split(',');

    return lines.slice(1).map(line => {
        const values = line.split(',');
        const result = {};
        headers.forEach((header, index) => {
            result[header.trim()] = values[index].trim(); // header と値に trim() を追加して不要な空白を除去
        });
        return result;
    });
}

// チェックボックスの状態を取得
function getSelectedEras() {
    const checkboxes = document.querySelectorAll("input[name='era']:checked");
    selectedEras = Array.from(checkboxes).map(checkbox => checkbox.value);
}

// フィルタリング関数
function filterQuestionsByEra() {
    if (selectedEras.length === 0) return quizData;
    return quizData.filter(question => selectedEras.includes(question.era));
}

// 問題をランダムに表示
function loadQuestion() {
    const data = filterQuestionsByEra();
    currentQuestion = data[Math.floor(Math.random() * data.length)];

    document.getElementById("person-name").innerText = currentQuestion.person;

    setOptions("year", data.map(q => q.year), currentQuestion.year);
    setOptions("event", data.map(q => q.event), currentQuestion.event);
    setOptions("relation", data.map(q => q.relation), currentQuestion.relation);
}

// 選択肢ボタンを作成
function setOptions(type, options, correctAnswer) {
    const optionsDiv = document.getElementById(`${type}-options`);
    optionsDiv.innerHTML = "";

    const uniqueOptions = Array.from(new Set(options));
    const filteredOptions = uniqueOptions.filter(option => option !== correctAnswer);
    const randomOptions = filteredOptions.sort(() => Math.random() - 0.5).slice(0, 5);
    const finalOptions = [...randomOptions, correctAnswer].sort(() => Math.random() - 0.5);

    finalOptions.forEach((option) => {
        const button = document.createElement("button");
        button.innerText = option;
        button.classList.add("option");
        button.onclick = () => selectOption(type, option);
        optionsDiv.appendChild(button);
    });
}

// ユーザーの選択を記録
function selectOption(type, value) {
    userAnswer[type] = value;

    document.querySelectorAll(`#${type}-options .option`).forEach(btn => {
        btn.style.backgroundColor = btn.innerText === value ? "#add8e6" : "";
    });
}

// 選択の正誤判定を行う関数
function submitAnswer() {
    if (!userAnswer.year || !userAnswer.event || !userAnswer.relation) {
        alert("全ての選択肢を選んでください。");
        return;
    }

    const isCorrect =
        userAnswer.year === currentQuestion.year &&
        userAnswer.event === currentQuestion.event &&
        userAnswer.relation === currentQuestion.relation;

    checkAnswer(isCorrect);
}

// 正誤判定後に結果を表示
function checkAnswer(isCorrect) {
    const resultElement = document.getElementById("result");
    resultElement.classList.remove("correct", "incorrect", "show");

    if (isCorrect) {
        resultElement.textContent = "正解！";
    } else {
        resultElement.textContent = `不正解。
        正しい答えは ${currentQuestion.year}, ${currentQuestion.event}, ${currentQuestion.relation} です。`;
    }
    resultElement.classList.add(isCorrect ? "correct" : "incorrect", "show");
    resultElement.style.opacity = 1;
}

// 初期化処理
function initializeQuestions() {
    getSelectedEras(); // チェックボックスの状態を取得
    loadQuestion(); // 最初の問題をロード
}

// フィルターを適用
function applyFilters() {
    getSelectedEras();
    loadQuestion();
}

// 次の問題へ進むときのリセット
function resetResult() {
    const resultElement = document.getElementById("result");
    resultElement.classList.remove("show", "correct", "incorrect");
    resultElement.textContent = ""; // 表示テキストをリセット
    resultElement.style.opacity = 0;

    loadQuestion(); // 次の問題をロード
}

// リセットボタン
document.getElementById("reset").onclick = () => {
    resetResult();
    loadQuestion();
};

// 初期化
document.addEventListener("DOMContentLoaded", () => {
    loadCSV().then(() => {
        loadQuestion(); // 初期の問題を読み込む
    });
    
    document.getElementById("check-answer").onclick = submitAnswer;
    document.getElementById("reset").onclick = () => {
        resetResult();
        loadQuestion();
        window.scrollTo({
            top: 0,
            behavior: "smooth"
        });
    };
});
