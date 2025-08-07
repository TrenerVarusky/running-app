// components/ArticlesSection.tsx
import biegaczImg from '../../assets/biegacz.png'
import { useEffect, useState } from 'react';
import { useInView } from '../../hooks/useInView';

const ArticlesSection = () => {
  const { ref, isVisible } = useInView(0.3);
  const [animate, setAnimate] = useState(false);

  useEffect(() => {
    if (isVisible) setAnimate(true);
  }, [isVisible]);

  const articles = [
    {
      title: 'Jak trenować mądrze i skutecznie?',
      description: 'Poznaj zasady treningu, które zwiększą Twoją wydolność i poprawią technikę biegu bez ryzyka kontuzji.',
      date: '05.08.2025',
      tags: ['Trening', 'Wiedza'],
      image: '/images/article1.jpg',
    },
    {
      title: 'Regeneracja – tajna broń biegacza',
      description: 'Odpoczynek to nie lenistwo. Dowiedz się, jak regeneracja wpływa na osiągi i jak włączyć ją do planu.',
      date: '21.07.2025',
      tags: ['Regeneracja'],
      image: '/images/article2.jpg',
    },
    {
      title: 'Czy tempo biegu ma znaczenie?',
      description: 'Zrozum różnice między biegami tempowymi, interwałami i spokojnym rozbieganiem.',
      date: '28.07.2025',
      tags: ['Strategia', 'Technika'],
      image: '/images/article3.jpg',
    },
  ];

  const handleClick = (title: string) => {
    console.log(`Kliknięto artykuł: ${title}`);
  };

  return (
    <section className="bg-gray-800 py-20" ref={ref}>
      <div className="w-[90vw] max-w-7xl mx-auto text-white">
        <h2 className="text-3xl md:text-4xl font-bold mb-12 text-center">Najnowsze artykuły:</h2>
        <div className="grid gap-8 md:grid-cols-3">
          {articles.map((article, index) => (
            <div key={index} className={`bg-gray-900 rounded-xl shadow-md overflow-hidden flex flex-col transition transform hover:scale-105 hover:duration-300 duration-1000 ${
                animate ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              }`} >
              <img src={biegaczImg} alt={article.title} className="h-48 w-full object-cover cursor-pointer" onClick={() => handleClick(article.title)}/>
              <div className="p-6 flex flex-col flex-grow">
                <div className="flex gap-2 mb-2 text-sm text-blue-400">
                  {article.tags.map((tag, i) => (
                    <span key={i} className="bg-blue-950 px-2 py-0.5 rounded-full">{tag}</span>
                  ))}
                </div>
                <p className="text-xs text-gray-400 mb-2">{article.date}</p>
                <h3 className="text-xl font-semibold mb-2 cursor-pointer" onClick={() => handleClick(article.title)}>{article.title}</h3>
                <p className="text-sm text-gray-300 flex-grow">{article.description}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-12 text-center">
          <button className="bg-blue-600 hover:bg-blue-700 px-6 py-3 rounded-full text-white font-semibold transition hover:scale-105 cursor-pointer">
            Więcej artykułów
          </button>
        </div>
      </div>
    </section>
  );
};

export default ArticlesSection;
