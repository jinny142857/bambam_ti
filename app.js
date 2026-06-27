const USERS = [
  { id: "admin", password: "2026", role: "admin", name: "관리자" },
  { id: "10101", password: "1234", role: "student", studentId: "10101" },
  { id: "10102", password: "1234", role: "student", studentId: "10102" },
  { id: "10103", password: "1234", role: "student", studentId: "10103" },
];

const STUDENTS = [
  {
    id: "10101",
    name: "김코딩",
    photo: "assets/10101_김코딩.jpg",
    grades: {
      "정보 수행평가": "A",
      "웹앱 프로젝트": "92점",
      "디지털 윤리 퀴즈": "88점",
      "수업 참여도": "상",
    },
    traits: [
      "문제 해결 과정을 차분히 설명합니다.",
      "새 도구를 시도할 때 기록을 꼼꼼히 남깁니다.",
      "제출 전 확인 습관을 더 연습하면 좋습니다.",
    ],
    teacherMemo: "프론트엔드 구조 이해가 빠르며, 팀원 질문에 답하는 태도가 좋습니다.",
  },
  {
    id: "10102",
    name: "박개발",
    photo: "assets/10102_박개발.jpg",
    grades: {
      "정보 수행평가": "B+",
      "웹앱 프로젝트": "86점",
      "디지털 윤리 퀴즈": "91점",
      "수업 참여도": "중상",
    },
    traits: [
      "협업 중 역할 분담을 잘 지킵니다.",
      "UI 수정 아이디어를 자주 제안합니다.",
      "프로젝트 범위를 작게 나누는 연습이 필요합니다.",
    ],
    teacherMemo: "기능 구현 의욕이 높고, 오류가 날 때 원인을 함께 추적하려는 태도가 좋습니다.",
  },
  {
    id: "10103",
    name: "이교사",
    photo: "assets/10103_이교사.jpg",
    grades: {
      "정보 수행평가": "A-",
      "웹앱 프로젝트": "89점",
      "디지털 윤리 퀴즈": "95점",
      "수업 참여도": "상",
    },
    traits: [
      "학습 내용을 자기 언어로 정리합니다.",
      "개선할 지점을 발견하면 근거를 함께 제시합니다.",
      "코드 주석을 더 구체적으로 쓰면 좋습니다.",
    ],
    teacherMemo: "질문의 초점이 좋고, 개선 방향을 토의하는 데 적극적입니다.",
  },
];

const loginForm = document.querySelector("#loginForm");
const userIdInput = document.querySelector("#userId");
const passwordInput = document.querySelector("#password");
const loginMessage = document.querySelector("#loginMessage");
const logoutButton = document.querySelector("#logoutButton");
const loginView = document.querySelector("#loginView");
const studentView = document.querySelector("#studentView");
const adminView = document.querySelector("#adminView");

let currentUser = null;

loginForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const id = userIdInput.value.trim();
  const password = passwordInput.value;
  const user = USERS.find((item) => item.id === id && item.password === password);

  if (!user) {
    loginMessage.textContent = "아이디 또는 비밀번호가 올바르지 않습니다.";
    passwordInput.value = "";
    passwordInput.focus();
    return;
  }

  currentUser = user;
  loginMessage.textContent = "";
  loginForm.reset();

  if (user.role === "admin") {
    renderAdminDashboard();
  } else {
    const student = STUDENTS.find((item) => item.id === user.studentId);
    renderStudentPage(student);
  }
});

logoutButton.addEventListener("click", () => {
  currentUser = null;
  showOnly(loginView);
  logoutButton.classList.add("hidden");
  userIdInput.focus();
});

function showOnly(targetView) {
  [loginView, studentView, adminView].forEach((view) => view.classList.add("hidden"));
  targetView.classList.remove("hidden");
}

function renderStudentPage(student) {
  if (!student) {
    loginMessage.textContent = "학생 정보를 찾을 수 없습니다.";
    showOnly(loginView);
    return;
  }

  studentView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Student</p>
        <h2>${student.name} 학생 페이지</h2>
        <p>로그인한 학생의 학습 현황을 확인합니다.</p>
      </div>
    </div>

    <div class="student-layout">
      <article class="student-profile">
        <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
        <div class="profile-body">
          <h3>${student.name}</h3>
          <p class="student-number">학번 ${student.id}</p>
          <div class="tag-row" aria-label="학습 키워드">
            <span class="tag">정보</span>
            <span class="tag">프로젝트</span>
          </div>
        </div>
      </article>

      <div class="content-stack">
        ${renderGrades(student.grades, false, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
      </div>
    </div>
  `;

  showOnly(studentView);
  logoutButton.classList.remove("hidden");
}

// AI 학생 상담 전략 도우미 상태 변수
let selectedStudent = null;

function renderAdminDashboard() {
  adminView.innerHTML = `
    <div class="view-header">
      <div class="view-title">
        <p class="eyebrow">Admin</p>
        <h2>관리자 대시보드</h2>
        <p>학생 3명의 학습 현황을 한 화면에서 비교합니다.</p>
      </div>
    </div>

    <section class="admin-grid" aria-label="전체 학생 정보">
      ${STUDENTS.map(renderStudentCard).join("")}
    </section>

    <!-- AI 학생 상담 전략 도우미 섹션 -->
    <section class="counseling-assistant-section" id="counselingSection">
      <h2>🤖 AI 학생 상담 전략 도우미</h2>
      
      <div class="assistant-grid">
        <!-- 왼쪽 패널: 학생 선택 및 고민 입력 -->
        <div class="counseling-form">
          <div>
            <label>선택된 학생</label>
            <div id="selectedStudentBox" class="selected-student-box">
              <span class="info-value">학생 카드의 "상담 전략 요청" 버튼을 클릭하여 학생을 선택해 주세요.</span>
            </div>
          </div>

          <div>
            <label for="teacherConcern">교사 상담 고민 입력</label>
            <textarea 
              id="teacherConcern" 
              placeholder="상담 고민을 입력하세요. (예: 수업 참여는 좋은데 평가 결과가 낮습니다. 어떻게 상담하면 좋을까요?)"
              disabled
            ></textarea>
          </div>

          <button id="getStrategyBtn" class="primary-button" type="button" disabled>AI 상담 전략 받기</button>
        </div>

        <!-- 오른쪽 패널: 데이터 미리보기 및 결과 -->
        <div class="counseling-form">
          <div>
            <label>Gemini 전송 데이터 미리보기 (익명화)</label>
            <pre id="previewData" class="preview-box">학생 선택 후 고민을 입력하면 여기에 실시간 미리보기가 표시됩니다.</pre>
          </div>

          <div>
            <label>상담 전략 제안 결과</label>
            <div id="strategyResult" class="result-box" style="display: none;"></div>
            <div id="errorIndicator" class="error-box" style="display: none;"></div>
          </div>
        </div>
      </div>

      <div class="assistant-footer-notice">
        ⚠️ AI 상담 전략은 참고용입니다. 최종 판단과 실제 상담은 교사가 학생의 상황을 종합적으로 고려하여 진행해야 합니다.
      </div>
    </section>
  `;

  showOnly(adminView);
  logoutButton.classList.remove("hidden");

  // 이벤트 리스너 바인딩
  setupCounselingListeners();
}

function renderStudentCard(student) {
  return `
    <article class="student-card">
      <img class="student-photo" src="${student.photo}" alt="${student.name} 학생 사진" />
      <div class="student-card-body">
        <h3>${student.name}</h3>
        <p class="student-number">학번 ${student.id}</p>
        ${renderGrades(student.grades, true, `gradesTitle-${student.id}`)}
        ${renderTraits(student)}
        <button 
          class="primary-button student-card-counseling-btn" 
          type="button"
          onclick="selectStudentForCounseling('${student.id}')"
        >
          상담 전략 요청
        </button>
      </div>
    </article>
  `;
}

// 전역 범위에서 호출할 수 있도록 window 객체에 등록
window.selectStudentForCounseling = function(studentId) {
  const student = STUDENTS.find((item) => item.id === studentId);
  if (!student) return;

  selectedStudent = student;

  // 선택된 학생 정보 렌더링 (화면에는 실명 및 학번 노출)
  const box = document.getElementById("selectedStudentBox");
  box.innerHTML = `
    <div class="selected-student-info">
      <div class="info-row">
        <span class="info-label">이름:</span>
        <span class="info-value" style="color: var(--ink); font-weight: bold;">${student.name}</span>
      </div>
      <div class="info-row">
        <span class="info-label">학번:</span>
        <span class="info-value" style="color: var(--ink); font-weight: bold;">${student.id}</span>
      </div>
      <div class="info-row" style="margin-top: 4px;">
        <span class="info-label" style="font-size: 12px; color: var(--teal);">전송 가명:</span>
        <span class="info-value" style="font-size: 12px; color: var(--teal); font-weight: bold;">${getStudentAlias(student.id)}</span>
      </div>
    </div>
  `;

  // 입력 활성화
  const textarea = document.getElementById("teacherConcern");
  const getBtn = document.getElementById("getStrategyBtn");
  textarea.removeAttribute("disabled");
  getBtn.removeAttribute("disabled");

  // 미리보기 업데이트
  updatePreview();

  // 이전 결과 및 에러 초기화
  document.getElementById("strategyResult").style.display = "none";
  document.getElementById("errorIndicator").style.display = "none";

  // 상담 섹션 위치로 부드럽게 스크롤
  document.getElementById("counselingSection").scrollIntoView({ behavior: 'smooth' });
};

// 가명 맵핑 도우미 함수
function getStudentAlias(studentId) {
  const index = STUDENTS.findIndex(s => s.id === studentId);
  if (index === 0) return "학생 A";
  if (index === 1) return "학생 B";
  if (index === 2) return "학생 C";
  return `학생 ${String.fromCharCode(65 + index)}`;
}

// 익명화 전송용 JSON 데이터 구성 도우미 함수
function buildPayload() {
  if (!selectedStudent) return null;

  // 성적 요약 포맷팅
  const gradeSummary = Object.entries(selectedStudent.grades)
    .map(([key, val]) => `${key}: ${val}`)
    .join(", ");

  // 학습 특성 요약 포맷팅
  const learningTraits = [
    ...selectedStudent.traits,
    `교사 메모: ${selectedStudent.teacherMemo}`
  ].join(" / ");

  const teacherConcern = document.getElementById("teacherConcern").value;

  return {
    studentAlias: getStudentAlias(selectedStudent.id),
    gradeSummary,
    learningTraits,
    teacherConcern: teacherConcern || ""
  };
}

// 미리보기 박스 실시간 업데이트
function updatePreview() {
  const previewBox = document.getElementById("previewData");
  if (!selectedStudent) {
    previewBox.textContent = "학생 선택 후 고민을 입력하면 여기에 실시간 미리보기가 표시됩니다.";
    return;
  }
  const payload = buildPayload();
  previewBox.textContent = JSON.stringify(payload, null, 2);
}

// 이벤트 리스너 바인딩 함수
function setupCounselingListeners() {
  const textarea = document.getElementById("teacherConcern");
  const getBtn = document.getElementById("getStrategyBtn");

  if (!textarea || !getBtn) return;

  // 실시간 입력 감지
  textarea.addEventListener("input", () => {
    updatePreview();
  });

  // API 호출 핸들러
  getBtn.addEventListener("click", async () => {
    if (!selectedStudent) return;

    const teacherConcernVal = textarea.value.trim();
    const resultBox = document.getElementById("strategyResult");
    const errorBox = document.getElementById("errorIndicator");

    // 초기화
    resultBox.style.display = "none";
    errorBox.style.display = "none";

    // 고민 비어있을 시 호출 방지 및 에러 안내
    if (!teacherConcernVal) {
      errorBox.textContent = "상담 고민을 먼저 입력해주세요.";
      errorBox.style.display = "block";
      return;
    }

    const payload = buildPayload();

    // 로딩 인디케이터 표시
    getBtn.setAttribute("disabled", "true");
    textarea.setAttribute("disabled", "true");
    resultBox.innerHTML = `
      <div class="loading-indicator">
        <div class="loading-spinner"></div>
        <span>AI가 상담 전략을 생성하는 중입니다. 잠시만 기다려 주세요...</span>
      </div>
    `;
    resultBox.style.display = "block";

    try {
      // 프론트엔드는 /api/gemini-counseling 으로 POST 요청만 보낸다. (API Key 불포함)
      const response = await fetch("/api/gemini-counseling", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // 응답 렌더링 처리
        resultBox.innerHTML = formatStrategyResult(data.result);
      } else {
        throw new Error(data.error || "알 수 없는 오류");
      }
    } catch (err) {
      resultBox.style.display = "none";
      errorBox.textContent = "AI 상담 전략을 불러오지 못했습니다. API 키 또는 Vercel 환경 변수를 확인해주세요.";
      errorBox.style.display = "block";
      console.error(err);
    } finally {
      getBtn.removeAttribute("disabled");
      textarea.removeAttribute("disabled");
    }
  });
}

// 결과 텍스트 포맷터 (주요 섹션들에 대해 HTML 태그 부여)
function formatStrategyResult(text) {
  // 정규식이나 간단한 교체를 활용해 번호 매겨진 주요 그룹에 h4 스타일 적용
  let formatted = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  const sections = [
    "1. 현재 상황 요약",
    "2. 학생 데이터 기반 해석",
    "3. 상담 접근 전략",
    "4. 교사가 던질 수 있는 질문 3개",
    "5. 피해야 할 말 또는 주의점",
    "6. 다음 수업에서 해볼 수 있는 작은 지원"
  ];

  sections.forEach(sec => {
    // 줄의 시작 부분 등에서 해당 텍스트 매칭 시 h4 태그 적용
    const regex = new RegExp(`(^|\\n)(${sec})`, 'g');
    formatted = formatted.replace(regex, `$1<h4>$2</h4>`);
  });

  return formatted;
}

function renderGrades(grades, compact = false, headingId = "gradesTitle") {
  const rows = Object.entries(grades)
    .map(([label, value]) => `<tr><th scope="row">${label}</th><td>${value}</td></tr>`)
    .join("");

  return `
    <section aria-labelledby="${headingId}">
      <div class="section-title">
        <h3 id="${headingId}">성적 정보</h3>
      </div>
      <table class="grade-table ${compact ? "compact-table" : ""}">
        <tbody>${rows}</tbody>
      </table>
    </section>
  `;
}

function renderTraits(student) {
  return `
    <section aria-labelledby="traitsTitle-${student.id}">
      <div class="section-title">
        <h3 id="traitsTitle-${student.id}">학습 특성 및 교사 메모</h3>
      </div>
      <ul class="memo-list">
        ${student.traits.map((trait) => `<li>${trait}</li>`).join("")}
        <li>${student.teacherMemo}</li>
      </ul>
    </section>
  `;
}

showOnly(loginView);

