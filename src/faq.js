// FAQ 순위 점수: 조회수 + 도움이 됐어요 × 3. 점수가 높은 순서로 FAQ 첫 화면(상위 10개)에 올라간다.
export const faqScore = (f) => (Number(f.views) || 0) + (Number(f.votes) || 0) * 3
