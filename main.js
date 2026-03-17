const graphData = {
    "시청": { "1": [{to: "종로3가", time: 3}, {to: "서울역", time: 2}], "2": [{to: "신도림", time: 15}, {to: "신설동", time: 10}] },
    "서울역": { "1": [{to: "시청", time: 2}, {to: "용산", time: 5}], "4": [{to: "명동", time: 3}, {to: "사당", time: 15}] },
    "종로3가": { "1": [{to: "시청", time: 3}, {to: "동대문", time: 3}], "3": [{to: "충무로", time: 2}] },
    "동대문": { "1": [{to: "종로3가", time: 3}, {to: "신설동", time: 3}], "4": [{to: "충무로", time: 3}] },
    "신설동": { "1": [{to: "동대문", time: 3}], "2": [{to: "시청", time: 10}, {to: "왕십리", time: 5}] },
    "신도림": { "1": [{to: "영등포", time: 3}, {to: "용산", time: 10}], "2": [{to: "시청", time: 15}, {to: "사당", time: 15}, {to: "강남", time: 20}] },
    "영등포": { "1": [{to: "신도림", time: 3}] },
    "용산": { "1": [{to: "신도림", time: 10}, {to: "서울역", time: 5}] },
    "강남": { "2": [{to: "신도림", time: 20}, {to: "교대", time: 2}, {to: "건대입구", time: 15}] },
    "교대": { "2": [{to: "강남", time: 2}, {to: "사당", time: 6}], "3": [{to: "충무로", time: 15}, {to: "고속터미널", time: 3}] },
    "사당": { "2": [{to: "교대", time: 6}, {to: "신도림", time: 15}], "4": [{to: "서울역", time: 15}, {to: "동작", time: 5}] },
    "건대입구": { "2": [{to: "강남", time: 15}, {to: "왕십리", time: 10}] },
    "왕십리": { "2": [{to: "건대입구", time: 10}, {to: "신설동", time: 5}] },
    "충무로": { "3": [{to: "종로3가", time: 2}, {to: "교대", time: 15}], "4": [{to: "동대문", time: 3}, {to: "명동", time: 2}] },
    "고속터미널": { "3": [{to: "교대", time: 3}, {to: "양재", time: 5}] },
    "양재": { "3": [{to: "고속터미널", time: 5}] },
    "동작": { "4": [{to: "사당", time: 5}] },
    "명동": { "4": [{to: "충무로", time: 2}, {to: "서울역", time: 3}] }
};

const stations = Object.keys(graphData).sort();
const TRANSFER_PENALTY = 5;

// DOM Elements
const startInput = document.getElementById('start-station');
const endInput = document.getElementById('end-station');
const swapBtn = document.getElementById('swap-btn');
const findBtn = document.getElementById('find-path-btn');
const stationList = document.getElementById('station-list');
const resultPanel = document.getElementById('result-panel');
const errorMessage = document.getElementById('error-message');
const totalTimeEl = document.getElementById('total-time');
const routeSummaryEl = document.getElementById('route-summary');
const pathListEl = document.getElementById('path-list');
const themeToggle = document.getElementById('theme-toggle');

// Initialize
function init() {
    stations.forEach(station => {
        const option = document.createElement('option');
        option.value = station;
        stationList.appendChild(option);
    });

    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "light") {
        document.body.classList.add("light-mode");
    }
    updateThemeButton();
    
    // Event Listeners
    themeToggle.addEventListener("click", toggleTheme);
    swapBtn.addEventListener("click", swapStations);
    findBtn.addEventListener("click", handleFindPath);
}

function toggleTheme() {
    document.body.classList.toggle("light-mode");
    localStorage.setItem("theme", document.body.classList.contains("light-mode") ? "light" : "dark");
    updateThemeButton();
}

function updateThemeButton() {
    themeToggle.textContent = document.body.classList.contains("light-mode") ? "다크 모드" : "라이트 모드";
}

function swapStations() {
    const temp = startInput.value;
    startInput.value = endInput.value;
    endInput.value = temp;
}

// Priority Queue for Dijkstra
class PriorityQueue {
    constructor() {
        this.elements = [];
    }
    enqueue(item, priority) {
        this.elements.push({item, priority});
        this.elements.sort((a, b) => a.priority - b.priority);
    }
    dequeue() {
        return this.elements.shift().item;
    }
    isEmpty() {
        return this.elements.length === 0;
    }
}

function findShortestPath(start, end) {
    if (start === end) return { time: 0, path: [], transfers: 0, error: null };
    if (!graphData[start] || !graphData[end]) return { error: "존재하지 않는 역입니다." };

    const pq = new PriorityQueue();
    // state: node_line
    const distances = {};
    const previous = {};

    // Initialize start states
    Object.keys(graphData[start]).forEach(line => {
        const stateId = `${start}_${line}`;
        distances[stateId] = 0;
        pq.enqueue({ station: start, line: line, prevPath: [] }, 0);
    });

    let bestEndState = null;
    let minTime = Infinity;

    while (!pq.isEmpty()) {
        const current = pq.dequeue();
        const { station, line, prevPath } = current;
        const stateId = `${station}_${line}`;
        
        if (distances[stateId] > minTime) continue;

        if (station === end) {
            if (distances[stateId] < minTime) {
                minTime = distances[stateId];
                bestEndState = current;
            }
            continue;
        }

        const linesAtCurrentStation = Object.keys(graphData[station]);
        
        // Transfer to other lines at the same station
        linesAtCurrentStation.forEach(nextLine => {
            if (nextLine !== line) {
                const nextStateId = `${station}_${nextLine}`;
                const transferTime = distances[stateId] + TRANSFER_PENALTY;
                
                if (distances[nextStateId] === undefined || transferTime < distances[nextStateId]) {
                    distances[nextStateId] = transferTime;
                    const pathCopy = [...prevPath, { type: 'transfer', station, fromLine: line, toLine: nextLine }];
                    pq.enqueue({ station, line: nextLine, prevPath: pathCopy }, transferTime);
                    previous[nextStateId] = { station, line, type: 'transfer' };
                }
            }
        });

        // Move to adjacent stations on the SAME line
        if (graphData[station][line]) {
            graphData[station][line].forEach(neighbor => {
                const nextStation = neighbor.to;
                const travelTime = neighbor.time;
                const nextStateId = `${nextStation}_${line}`;
                const newDist = distances[stateId] + travelTime;

                if (distances[nextStateId] === undefined || newDist < distances[nextStateId]) {
                    distances[nextStateId] = newDist;
                    const pathCopy = [...prevPath, { type: 'move', from: station, to: nextStation, line, time: travelTime }];
                    pq.enqueue({ station: nextStation, line, prevPath: pathCopy }, newDist);
                    previous[nextStateId] = { station, line, type: 'move' };
                }
            });
        }
    }

    if (!bestEndState) {
        return { error: "경로를 찾을 수 없습니다." };
    }

    const pathEvents = bestEndState.prevPath;
    let transferCount = pathEvents.filter(e => e.type === 'transfer').length;
    let moveCount = pathEvents.filter(e => e.type === 'move').length;

    return {
        time: minTime,
        path: pathEvents,
        transfers: transferCount,
        moves: moveCount,
        error: null
    };
}

function handleFindPath() {
    const start = startInput.value.trim();
    const end = endInput.value.trim();

    resultPanel.hidden = true;
    errorMessage.hidden = true;

    if (!start || !end) {
        showError("출발역과 도착역을 모두 입력해주세요.");
        return;
    }

    const result = findShortestPath(start, end);

    if (result.error) {
        showError(result.error);
        return;
    }

    renderResult(start, end, result);
}

function showError(msg) {
    errorMessage.textContent = msg;
    errorMessage.hidden = false;
}

function renderResult(start, end, result) {
    totalTimeEl.textContent = result.time;
    routeSummaryEl.textContent = `환승 ${result.transfers}회 | ${result.moves}개 역 이동`;
    
    pathListEl.innerHTML = '';
    
    if (result.path.length === 0) {
        pathListEl.innerHTML = '<li class="path-item">출발역과 도착역이 같습니다.</li>';
        resultPanel.hidden = false;
        return;
    }

    let currentStation = start;
    let currentLine = result.path[0].type === 'move' ? result.path[0].line : result.path[0].toLine;

    // Add Start Node
    addPathNode(currentStation, currentLine, "출발");

    result.path.forEach(event => {
        if (event.type === 'move') {
            addPathNode(event.to, event.line, `${event.time}분 소요`);
            currentStation = event.to;
            currentLine = event.line;
        } else if (event.type === 'transfer') {
            addPathNode(event.station, event.toLine, `환승 (약 ${TRANSFER_PENALTY}분)`, true);
            currentLine = event.toLine;
        }
    });

    resultPanel.hidden = false;
}

function addPathNode(stationName, line, desc, isTransfer = false) {
    const li = document.createElement('li');
    li.className = 'path-item';
    
    const node = document.createElement('div');
    node.className = `path-node ${isTransfer ? 'line-transfer' : 'line-' + line}`;
    node.textContent = line;
    
    const content = document.createElement('div');
    content.className = 'path-content';
    
    const title = document.createElement('div');
    title.className = 'station-name';
    title.textContent = stationName;
    
    if (isTransfer) {
        const badge = document.createElement('span');
        badge.className = 'transfer-badge';
        badge.textContent = `${line}호선 환승`;
        title.appendChild(badge);
    }
    
    const action = document.createElement('div');
    action.className = 'action-text';
    action.textContent = desc;
    
    content.appendChild(title);
    content.appendChild(action);
    
    li.appendChild(node);
    li.appendChild(content);
    
    pathListEl.appendChild(li);
}

init();
