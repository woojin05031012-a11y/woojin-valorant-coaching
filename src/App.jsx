import ApplyForm from './components/ApplyForm.jsx'
import FirebaseTest from './components/FirebaseTest.jsx'

const NAV = [['about', '소개'], ['coaching', '코칭 안내'], ['video', '영상'], ['reviews', '후기'], ['apply', '신청']]
const FLOW = [
  ['신청서 작성', '닉네임, 티어, 고민, Discord ID 입력'],
  ['Discord로 연락', '신청 내용을 확인한 뒤 먼저 연락드립니다'],
  ['일정 조율', 'Discord에서 시간과 진행 방식을 정합니다'],
  ['1:1 코칭', '음성 통화와 화면 공유로 진행'],
]
const TOPICS = ['에임 및 교전 방식', '포지셔닝', '스킬 활용', '상황 판단', '라운드 운영', '잘못된 플레이 습관']
const TAG = { done: '완료', doing: '진행 중', todo: '예정' }
const STATUS = [
  ['done', '조사와 사이트 구조·메뉴 설계'],
  ['done', '화면 시안 제작'],
  ['done', 'React(Vite) 프로젝트 전환'],
  ['done', 'Firebase 연결과 저장 테스트 (1주차)'],
  ['todo', '정보 화면 구현, 영상·후기·FAQ (2~3주차)'],
  ['todo', '신청 저장 연결, 연락 흐름 테스트 (4~5주차)'],
  ['todo', '콘텐츠 채우기, 테스트, 배포 (6~8주차)'],
]

export default function App() {
  return (
    <>
      <header className="top"><div className="wrap">
        <a className="logo" href="#top">WOOJIN<small>VALORANT COACHING</small></a>
        <nav aria-label="주 메뉴">{NAV.map(([id, t]) => <a key={id} href={'#' + id}>{t}</a>)}</nav>
        <a className="btn sm" href="#apply">코칭 신청</a>
      </div></header>

      <main id="top">
        <div className="hero"><div className="wrap">
          <div>
            <p className="kicker">발로란트 1:1 코칭</p>
            <h1>내 플레이의 문제를,<br />직접 짚어드립니다.</h1>
            <p className="lead">발로란트 강의 영상을 운영하며 쌓은 피드백 경험으로, 신청자의 플레이를 같이 보며 고쳐야 할 부분을 알려드립니다.</p>
            <div className="fact"><b>300+</b><span>건의 1:1 피드백 진행</span></div>
            <a className="btn" href="#apply">코칭 신청하기</a>
          </div>
          <div className="flow">
            <h2>신청 후 진행 순서</h2>
            <ol aria-label="코칭 진행 순서">
              {FLOW.map(([t, d], i) => <li key={t}><b>{i + 1}</b><div>{t}<span>{d}</span></div></li>)}
            </ol>
          </div>
        </div></div>

        <section id="about"><div className="wrap">
          <h2 className="sec">소개</h2>
          <p className="sub">처음 방문한 분도 어떤 사람에게 코칭을 받는지 알 수 있도록 정리하는 영역입니다.</p>
          <div className="about">
            <p>발로란트 강의 영상을 올리는 유튜브 채널을 운영하고 있습니다. 영상 마지막에 1:1 코칭 홍보를 넣어 문의를 받았고, 지금까지 300건 이상의 1:1 피드백을 진행했습니다.</p>
            <dl>
              <dt>채널</dt><dd><span className="todo">채널명·링크 입력 예정</span></dd>
              <dt>현재 티어</dt><dd><span className="todo">입력 예정</span></dd>
              <dt>플레이 스타일</dt><dd><span className="todo">입력 예정</span></dd>
            </dl>
          </div>
        </div></section>

        <section id="coaching"><div className="wrap">
          <h2 className="sec">코칭 안내</h2>
          <p className="sub">신청 전에 원하는 피드백을 받을 수 있는지 확인하세요. 코칭은 Discord 음성 통화와 화면 공유로 진행합니다.</p>
          <ul className="topics">{TOPICS.map((t) => <li key={t}>{t}</li>)}</ul>
        </div></section>

        <section id="video"><div className="wrap">
          <h2 className="sec">영상</h2>
          <p className="sub">실력과 설명 방식을 직접 보고 판단할 수 있도록 대표 영상을 넣을 자리입니다.</p>
          <div className="placeholder video"><div>YouTube 영상 삽입 예정<br /><small>대표 영상 선정 후 연결</small></div></div>
        </div></section>

        <section id="reviews"><div className="wrap">
          <h2 className="sec">후기</h2>
          <p className="sub">기존 코칭 이용자의 후기를 실제 기록에서 골라 싣습니다.</p>
          <div className="placeholder">후기 자료 정리 중입니다. 닉네임과 프로필 정보는 가린 뒤 게시할 예정입니다.</div>
        </div></section>

        <section id="apply"><div className="wrap">
          <h2 className="sec">코칭 신청</h2>
          <p className="sub">현재는 입력 확인까지만 동작하며, 신청 내용은 아직 저장되지 않습니다.</p>
          <ApplyForm />
        </div></section>

        <section id="status"><div className="wrap">
          <h2 className="sec">개발 현황 <span className="todo">1주차</span></h2>
          <p className="sub">과제 보고용으로 현재 진행 상태를 정리했습니다.</p>
          <ul className="status">
            {STATUS.map(([s, t]) => <li key={t}><span className={'tag ' + s}>{TAG[s]}</span>{t}</li>)}
          </ul>
          {import.meta.env.DEV && <FirebaseTest />}
        </div></section>
      </main>

      <footer><div className="wrap">Woojin VALORANT Coaching · 대학 과제 프로젝트 · 이용약관과 개인정보 처리 안내는 배포 전에 작성합니다</div></footer>
    </>
  )
}
