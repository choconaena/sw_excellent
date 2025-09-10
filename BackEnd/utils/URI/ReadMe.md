## 실행(라우팅 경로)

**예시:**

```
http://114.110.128.184:30384/ai/runlocalfunc
```


# AI 기능

**Base Address:** `http://114.110.128.184:30384/ai`

**라우팅 경로 정리:**

1. `/`
    - **전체 경로:** `http://114.110.128.184:30384/`
    - **기능:** 기본 AI 모듈 실행 (`aiModule.runAiFunction()`)
2. `/runlocalfunc`
    - **전체 경로:** `http://114.110.128.184:30384/runlocalfunc`
    - **기능:** `runAIFunc_local` 함수 호출
3. `/runremotefunc`
    - **전체 경로:** `http://114.110.128.184:30384/runremotefunc`
    - **기능:** `runAIFunc_remote` 함수 호출

# DB 데이터 요청

**Base Address:** `http://114.110.128.184:30384/db/`

**라우팅 경로 정리:**

1. `/`
    - **전체 경로:** `http://114.110.128.184:30384/db/`
    - **기능:** 기본 DB 모듈 실행 (`dbModule.runDbFunction()`)

### USER ROUTES

1. `/users/:userId` (특정 유저 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/users/:userId`
    - **기능:** 특정 유저 조회 (`dbModule.getUser()`)
2. `/users` (유저 생성)
    - **전체 경로:** `http://114.110.128.184:30384/db/users`
    - **기능:** 유저 생성 (`dbModule.createUser()`)
3. `/users/:userId` (유저 정보 업데이트)
    - **전체 경로:** `http://114.110.128.184:30384/db/users/:userId`
    - **기능:** 유저 정보 업데이트 (`dbModule.updateUser()`)
4. `/users/:userId` (유저 삭제)
    - **전체 경로:** `http://114.110.128.184:30384/db/users/:userId`
    - **기능:** 유저 삭제 (`dbModule.deleteUser()`)

### CLIENT ROUTES

1. `/clients/:clientId` (특정 클라이언트 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/clients/:clientId`
    - **기능:** 특정 클라이언트 조회 (`dbModule.getClient()`)
2. `/clients` (클라이언트 생성)
    - **전체 경로:** `http://114.110.128.184:30384/db/clients`
    - **기능:** 클라이언트 생성 (`dbModule.createClient()`)
3. `/clients/:clientId` (클라이언트 정보 업데이트)
    - **전체 경로:** `http://114.110.128.184:30384/db/clients/:clientId`
    - **기능:** 클라이언트 정보 업데이트 (`dbModule.updateClient()`)
4. `/clients/:clientId` (클라이언트 삭제)
    - **전체 경로:** `http://114.110.128.184:30384/db/clients/:clientId`
    - **기능:** 클라이언트 삭제 (`dbModule.deleteClient()`)

### POLICY INFO ROUTES

1. `/policies/:policyId` (특정 정책 정보 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/policies/:policyId`
    - **기능:** 특정 정책 정보 조회 (`dbModule.getPolicyInfo()`)
2. `/policies` (정책 정보 생성)
    - **전체 경로:** `http://114.110.128.184:30384/db/policies`
    - **기능:** 정책 정보 생성 (`dbModule.createPolicyInfo()`)
3. `/policies/:policyId` (정책 정보 업데이트)
    - **전체 경로:** `http://114.110.128.184:30384/db/policies/:policyId`
    - **기능:** 정책 정보 업데이트 (`dbModule.updatePolicyInfo()`)
4. `/policies/:policyId` (정책 정보 삭제)
    - **전체 경로:** `http://114.110.128.184:30384/db/policies/:policyId`
    - **기능:** 정책 정보 삭제 (`dbModule.deletePolicyInfo()`)

### CHECKLIST ROUTES

1. `/checklists/:checklistId` (특정 체크리스트 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/checklists/:checklistId`
    - **기능:** 특정 체크리스트 조회 (`dbModule.getChecklist()`)
2. `/checklists` (체크리스트 생성)
    - **전체 경로:** `http://114.110.128.184:30384/db/checklists`
    - **기능:** 체크리스트 생성 (`dbModule.createChecklist()`)
3. `/checklists/:checklistId` (체크리스트 업데이트)
    - **전체 경로:** `http://114.110.128.184:30384/db/checklists/:checklistId`
    - **기능:** 체크리스트 업데이트 (`dbModule.updateChecklist()`)
4. `/checklists/:checklistId/answer` (특정 체크리스트의 선택된 답변 업데이트)
    - **전체 경로:** `http://114.110.128.184:30384/db/checklists/:checklistId/answer`
    - **기능:** 특정 체크리스트의 선택된 답변 업데이트 (`dbModule.updateSelectedAnswer()`)
5. `/checklists/:checklistId` (체크리스트 삭제)
    - **전체 경로:** `http://114.110.128.184:30384/db/checklists/:checklistId`
    - **기능:** 체크리스트 삭제 (`dbModule.deleteChecklist()`)

### CONSULTATION COMMENT ROUTES

1. `/comments/:commentId` (특정 상담 코멘트 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/comments/:commentId`
    - **기능:** 특정 상담 코멘트 조회 (`dbModule.getConsultationComment()`)
2. `/comments` (상담 코멘트 생성)
    - **전체 경로:** `http://114.110.128.184:30384/db/comments`
    - **기능:** 상담 코멘트 생성 (`dbModule.createConsultationComment()`)
3. `/comments/:commentId` (상담 코멘트 업데이트)
    - **전체 경로:** `http://114.110.128.184:30384/db/comments/:commentId`
    - **기능:** 상담 코멘트 업데이트 (`dbModule.updateConsultationComment()`)
4. `/comments/:commentId` (상담 코멘트 삭제)
    - **전체 경로:** `http://114.110.128.184:30384/db/comments/:commentId`
    - **기능:** 상담 코멘트 삭제 (`dbModule.deleteConsultationComment()`)

### QUESTIONS ROUTES

1. `/questions/:questionId` (특정 question_id에 해당하는 질문 리스트 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/questions/:questionId`
    - **기능:** 특정 질문 리스트 조회 (`dbModule.getQuestionsById()`)
2. `/welfare-policies/:policyId` (특정 정책 정보 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/welfare-policies/:policyId`
    - **기능:** 특정 정책 정보 조회 (`dbModule.getWelfarePolicyById()`)
3. `/conversation-summary/:summaryId` (특정 대화 요약 조회)
    - **전체 경로:** `http://114.110.128.184:30384/db/conversation-summary/:summaryId`
    - **기능:** 특정 대화 요약 조회 (`dbModule.getConversationLogById()`)
