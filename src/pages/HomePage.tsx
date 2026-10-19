import { Link } from 'react-router-dom'

export default function HomePage() {
  return (
    <div className="stack">
      <section className="hero-card">
        <p className="eyebrow">건축기사 시공 · 공정관리</p>
        <h1>공정표를 만드는 순서를 따라 배우기</h1>
        <p className="lead">
          공종 분해부터 작업일수, 선후관계, 횡선식 작성, 주공정 확인까지. 소규모 RC조 샘플 공사로
          학생 수준에서 한 장을 완성합니다.
        </p>
      </section>

      <section className="card-grid">
        <Link to="/quiz" className="feature-card">
          <span className="badge">기능 1</span>
          <h2>개념 퀴즈</h2>
          <p>OX, 객관식, 단답형으로 횡선식·주공정·시공순서를 점검합니다.</p>
        </Link>
        <Link to="/schedule" className="feature-card featured">
          <span className="badge">기능 2</span>
          <h2>공정표 제작 실습</h2>
          <p>5단계 가이드로 근린생활시설 3층 공사의 횡선식 공정표를 직접 만듭니다.</p>
        </Link>
        <Link to="/exam" className="feature-card">
          <span className="badge">기능 3</span>
          <h2>기출형 풀이</h2>
          <p>건축기사 시공 경향을 반영한 유사 문항과 해설, 오답노트를 제공합니다.</p>
        </Link>
      </section>

      <section className="panel">
        <h2>실습에서 익히는 작성 순서</h2>
        <ol className="steps-preview">
          <li>공사 개요를 읽고 필요한 공종만 고른다</li>
          <li>수량 ÷ 1일 시공량으로 작업일수를 구한다</li>
          <li>선행 공정을 지정한다 (완료 후 착수)</li>
          <li>횡선식(바차트)으로 일정을 그린다</li>
          <li>여유 0인 주공정과 총공기를 확인한다</li>
        </ol>
      </section>
    </div>
  )
}
