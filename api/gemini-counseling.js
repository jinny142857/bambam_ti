/**
 * AI 학생 상담 전략 도우미 - Vercel Serverless Function
 * 
 * 보안 점검용 안내 및 주의사항:
 * 1. 프론트엔드(클라이언트 측 JS)에 API 키를 직접 포함하면 브라우저 개발자 도구의 Network 탭 등을 통해 키가 외부에 노출될 수 있습니다.
 * 2. 이를 방지하기 위해 Gemini API 호출은 Vercel Serverless Function인 이 파일(/api/gemini-counseling.js)에서 안전하게 처리합니다.
 * 3. 로컬 개발 환경에서 사용하는 `.env` 또는 `.env.local` 파일은 외부 배포 시 노출되지 않도록 `.gitignore`에 추가하여 GitHub 등의 원격 저장소에 올리지 않습니다.
 * 4. Vercel 배포 시에는 Vercel 대시보드의 Project Settings > Environment Variables 메뉴에 `GEMINI_API_KEY` 환경 변수를 안전하게 등록해야 합니다.
 * 5. 개인정보 보호 및 데이터 최소화 원칙에 따라, Gemini API로 전송하는 데이터는 학생 이름, 학번, 사진 경로 등 식별 가능한 정보를 제외하고 '학생 A', '학생 B' 등의 가명(Alias)과 학습 정보만 포함하는 최소 정보로 제한합니다.
 */

export default async function handler(req, res) {
  // 1. POST 요청만 허용
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, error: 'Method Not Allowed' });
  }

  // 2. 요청 Body 데이터 추출
  const { studentAlias, gradeSummary, learningTraits, teacherConcern } = req.body;

  // 3. 필수 입력값 검증
  if (!studentAlias || !gradeSummary || !learningTraits || !teacherConcern) {
    return res.status(400).json({ 
      success: false, 
      error: '필수 요청 데이터(studentAlias, gradeSummary, learningTraits, teacherConcern)가 누락되었습니다.' 
    });
  }

  // 4. API Key 검증
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ 
      success: false, 
      error: 'GEMINI_API_KEY 환경 변수가 설정되지 않았습니다.' 
    });
  }

  try {
    // Gemini 3.1 Flash Lite REST API 엔드포인트 URL 구성
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite:generateContent?key=${apiKey}`;

    // 프롬프트 작성 규칙 및 컨텍스트 제공
    const systemInstruction = 
      "당신은 전문적인 교육 상담사이자 교사 지원 AI 도우미입니다. " +
      "제공된 학생 정보(성적 요약, 학습 특성)와 교사의 상담 고민을 바탕으로 실질적이고 구체적인 상담 전략을 제시해 주세요.\n\n" +
      "답변 작성 및 프롬프트 원칙:\n" +
      "1. 절대로 학생을 단정적으로 판단하거나 진단하지 마세요. (예: '의지가 부족하다', '주의력 문제가 있다', '심리적 문제가 있다' 등의 표현은 피해야 합니다.)\n" +
      "2. 교사가 학생을 깊이 이해하고, 공감하며 대화할 수 있도록 돕는 따뜻하고 전문적인 방향으로 응답을 구성해 주세요.\n" +
      "3. 상담 전략은 참고용이며, 최종 판단과 실제 상담은 교사가 학생의 개별 상황을 종합 고려하여 진행해야 한다는 점을 상기시켜 주세요.\n\n" +
      "응답은 반드시 아래의 6개 항목 순서대로 명확히 구분하여 작성해 주세요:\n" +
      "1. 현재 상황 요약\n" +
      "2. 학생 데이터 기반 해석\n" +
      "3. 상담 접근 전략\n" +
      "4. 교사가 던질 수 있는 질문 3개\n" +
      "5. 피해야 할 말 또는 주의점\n" +
      "6. 다음 수업에서 해볼 수 있는 작은 지원";

    const promptText = 
      `[학생 데이터 (익명화)]
- 학생 식별명: ${studentAlias}
- 성적 요약: ${gradeSummary}
- 학습 특성 및 교사 메모: ${learningTraits}

[교사의 상담 고민]
"${teacherConcern}"

위 데이터를 분석하고, 설정된 원칙에 따라 전문적인 상담 전략을 제안해 주세요.`;

    const requestBody = {
      contents: [
        {
          parts: [
            {
              text: promptText
            }
          ]
        }
      ],
      systemInstruction: {
        parts: [
          {
            text: systemInstruction
          }
        ]
      },
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 2048
      }
    };

    // Node.js 내장 fetch를 사용하여 Gemini REST API 호출
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const errorMessage = errorData.error?.message || `HTTP error! status: ${response.status}`;
      return res.status(response.status).json({ 
        success: false, 
        error: `Gemini API 호출에 실패했습니다: ${errorMessage}` 
      });
    }

    const data = await response.json();
    
    // 응답 내용 파싱
    const candidateText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidateText) {
      return res.status(500).json({ 
        success: false, 
        error: 'Gemini API로부터 올바른 응답 텍스트를 받지 못했습니다.' 
      });
    }

    // 성공 결과 반환
    return res.status(200).json({ 
      success: true, 
      result: candidateText 
    });

  } catch (error) {
    return res.status(500).json({ 
      success: false, 
      error: `서버 내부 오류가 발생했습니다: ${error.message}` 
    });
  }
}
