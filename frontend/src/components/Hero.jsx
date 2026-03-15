import { useNavigate } from 'react-router-dom';

export default function Hero() {
  const navigate = useNavigate();

  const handleExploreClick = () => {
    navigate('/customizable-categories');
  };

  return (
    <section className="hero">
      <h1>Customized Textile Products</h1>
      <p>— Delivered Locally —</p>
      <button onClick={handleExploreClick}>Explore Now</button>
    </section>
  );
}
