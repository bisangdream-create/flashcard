# AI 스마트 플래시카드 — 배포 패키지

## 들어 있는 파일
- `index.html`: 웹사이트 화면과 학습 기능
- `netlify/functions/analyze.mjs`: Gemini API를 안전하게 호출하는 서버 함수
- `netlify.toml`: Netlify 설정

## 배포 방법 (초보자용)
1. 압축 파일을 컴퓨터에 풀어 `ai-flashcard-site` 폴더를 준비합니다.
2. https://app.netlify.com/ 에 가입/로그인합니다.
3. Netlify에서 새 사이트를 만들고 GitHub 저장소 연결 또는 Netlify CLI 방식으로 배포합니다.
   - 중요: 이 프로젝트에는 `netlify/functions` 서버 함수가 포함되어 있으므로, `index.html` 파일만 Netlify Drop에 올리는 방식으로는 AI 기능이 작동하지 않습니다.
   - 가장 쉬운 반복 배포 방법은 GitHub에 폴더 내용을 올린 뒤 Netlify에서 해당 저장소를 Import하는 것입니다.
4. Google AI Studio에서 Gemini API 키를 만듭니다: https://aistudio.google.com/apikey
5. Netlify 사이트의 Site configuration / Environment variables에서 다음 변수를 추가합니다.
   - 이름: `GEMINI_API_KEY`
   - 값: Google AI Studio에서 발급한 API 키
   - Functions에서 사용할 수 있는 범위로 설정합니다.
6. 저장한 뒤 사이트를 다시 배포합니다.
7. 배포된 주소에서 사진 업로드 → AI 카드 변환을 시험합니다.

## 공유와 저장
- 카드와 모르는 카드 표시는 현재 브라우저의 localStorage에 저장됩니다.
- 다른 사람에게 공유하려면 `카드 목록 내보내기`로 JSON 파일을 저장하고 전달합니다.
- 상대방은 같은 사이트에서 `공유 카드 가져오기`를 눌러 JSON 파일을 불러옵니다.
- 개인 저장은 브라우저/기기별입니다. 브라우저 데이터를 지우면 카드가 사라질 수 있으니 주기적으로 내보내기 백업을 권장합니다.

## 보안 및 비용
- API 키를 HTML 코드에 넣지 마세요. Netlify 환경 변수에만 저장합니다.
- 공개된 AI 분석 함수는 방문자가 호출할 수 있습니다. 사용량/비용 제한을 Google AI Studio와 Netlify에서 확인하고, 필요하면 로그인/요청 제한을 추가하세요.
- Gemini API 사용량/요금은 계정과 현재 정책에 따라 달라질 수 있습니다.
- 업로드한 사진은 AI 분석을 위해 Google Gemini API로 전송됩니다. 민감한 개인정보가 포함된 사진은 올리지 마세요.
