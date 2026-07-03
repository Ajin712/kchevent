# 퀴즈 번호 등록 이벤트

객관식 퀴즈 5개를 풀고 3개 이상 맞힌 사용자만 원하는 번호를 등록할 수 있는 소규모 이벤트 웹앱입니다. 번호 중복은 Supabase의 `unique` 제약으로 막습니다.

## 구성

- `/` 퀴즈 참여 화면
- `/admin.html` 관리자 번호 목록 화면
- `/api/submit` 점수 확인 및 번호 등록
- `/api/admin` 관리자 목록 조회

## Supabase 설정

1. Supabase 프로젝트를 만듭니다.
2. SQL Editor에서 `supabase/schema.sql` 내용을 실행합니다.
3. Project Settings > API에서 아래 값을 확인합니다.
   - Project URL
   - service_role key

## Vercel 환경변수

Vercel 프로젝트의 Settings > Environment Variables에 추가합니다.

```text
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
ADMIN_PASSWORD=원하는관리자비밀번호
```

`SUPABASE_SERVICE_ROLE_KEY`는 절대 브라우저 코드에 넣지 마세요. 이 프로젝트에서는 Vercel API 안에서만 사용합니다.

## 배포

1. 이 폴더를 GitHub 저장소로 올립니다.
2. Vercel에서 해당 저장소를 Import합니다.
3. 환경변수를 설정한 뒤 배포합니다.

관리자는 배포된 주소 뒤에 `/admin.html`을 붙여 접속하면 등록된 번호를 볼 수 있고 CSV로 내려받을 수 있습니다.
