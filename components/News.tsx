import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import type { NewsArticle } from '../types';
import { NewsIcon } from './icons/NewsIcon';

const formatDate = (dateString: string) => {
    const parts = dateString.split('-').map(part => parseInt(part, 10));
    const date = new Date(parts[0], parts[1] - 1, parts[2]);
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
};

const NewsCard: React.FC<{ article: NewsArticle; onToggleExpand: () => void; isExpanded: boolean }> = ({ article, onToggleExpand, isExpanded }) => (
    <div className="w-full bg-black bg-opacity-30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10 flex flex-col">
        {article.imageUrl ? (
          <img src={article.imageUrl} alt={article.title} className="w-full h-40 object-cover" />
        ) : (
          <div className="w-full h-40 bg-gray-700/50 flex items-center justify-center">
            <NewsIcon className="w-16 h-16 text-gray-500" />
          </div>
        )}
        <div className="p-4 flex-grow">
            <h3 className="text-lg font-bold text-cyan-300">{article.title}</h3>
            <p className="text-sm text-gray-300 dark:text-gray-400 mt-1">{article.summary}</p>
        </div>
        <div
            className={`transition-all duration-500 ease-in-out overflow-hidden ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}
        >
            <div className="px-4 pb-4">
                <div className="pt-4 border-t border-white/10">
                    <p className="text-gray-200 dark:text-gray-300 whitespace-pre-line text-sm">{article.fullText}</p>
                </div>
            </div>
        </div>
        <div className="px-4 pb-4 mt-auto">
            {article.fullText && (
                 <button 
                    onClick={onToggleExpand} 
                    className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold transition-colors duration-200" 
                    aria-expanded={isExpanded}
                 >
                    {isExpanded ? 'Read Less' : 'Read More'}
                 </button>
            )}
            <div className="flex justify-between items-center text-xs text-gray-400 dark:text-gray-500 pt-3">
                <span>{article.source}</span>
                <span>{formatDate(article.date)}</span>
            </div>
        </div>
    </div>
);


const SkeletonCard: React.FC = () => (
    <div className="w-full bg-black bg-opacity-30 backdrop-blur-md rounded-xl overflow-hidden shadow-lg border border-white/20 dark:bg-gray-900/40 dark:border-white/10">
        <div className="w-full h-40 bg-gray-700/50 animate-pulse"></div>
        <div className="p-4">
            <div className="h-5 bg-gray-700/50 rounded w-3/4 mb-3 animate-pulse"></div>
            <div className="h-4 bg-gray-700/50 rounded w-full mb-2 animate-pulse"></div>
            <div className="h-4 bg-gray-700/50 rounded w-5/6 animate-pulse"></div>
        </div>
        <div className="px-4 pb-4">
            <div className="flex justify-between items-center text-xs pt-3">
                <div className="h-3 bg-gray-700/50 rounded w-1/4 animate-pulse"></div>
                <div className="h-3 bg-gray-700/50 rounded w-1/3 animate-pulse"></div>
            </div>
        </div>
    </div>
);


export default function News() {
  const [expandedArticleIds, setExpandedArticleIds] = useState<Set<number>>(new Set());
  const [selectedCity, setSelectedCity] = useState('All Cities');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchNews = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const responseSchema = {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.INTEGER },
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            fullText: { type: Type.STRING },
            date: { type: Type.STRING },
            imageUrl: { type: Type.STRING },
            source: { type: Type.STRING },
            city: { type: Type.STRING },
          },
        },
      };

      const prompt = `Generate a JSON array of 8 realistic, recent news articles about flooding or water level management in various cities in Indonesia. Each article must be a JSON object with the following fields: "id" (unique integer from 1 to 8), "title" (string), "summary" (string, 1-2 sentences), "fullText" (string, 2-4 paragraphs), "date" (string in 'YYYY-MM-DD' format from the last two months), "source" (string, a plausible Indonesian news source name like 'Jakarta Post' or 'Kompas'), "city" (string, a major Indonesian city name), and "imageUrl" (string, a valid picsum.photos URL like 'https://picsum.photos/seed/your_seed/600/400' or null if no image is available). Ensure a diverse set of cities. At least 2 articles must have a null imageUrl. Respond with only the raw JSON array, without any surrounding text or markdown formatting.`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: responseSchema,
        },
      });
      
      const cleanedText = response.text.replace(/```json\n?|\n?```/g, '').trim();
      const parsedArticles: NewsArticle[] = JSON.parse(cleanedText);
      setArticles(parsedArticles);

    } catch (e) {
      console.error("Failed to fetch news:", e);
      setError(e instanceof Error ? e.message : "An unknown error occurred. Please check the console for details.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchNews();
  }, [fetchNews]);
  
  const cities = useMemo(() => {
    if (articles.length === 0) return ['All Cities'];
    return ['All Cities', ...new Set(articles.map(article => article.city))];
  }, [articles]);

  const handleToggleExpand = (articleId: number) => {
    setExpandedArticleIds(prevIds => {
      const newIds = new Set(prevIds);
      if (newIds.has(articleId)) {
        newIds.delete(articleId);
      } else {
        newIds.add(articleId);
      }
      return newIds;
    });
  };

  const filteredNews = articles.filter(article => {
    const cityMatch = selectedCity === 'All Cities' || article.city === selectedCity;
    return cityMatch;
  });

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {Array.from({ length: 6 }).map((_, index) => <SkeletonCard key={index} />)}
        </div>
      );
    }

    if (error) {
      return (
        <div className="text-center py-10 px-4 bg-red-900 bg-opacity-40 rounded-xl border border-red-500">
          <p className="text-lg font-semibold text-red-300">Failed to Load News</p>
          <p className="text-red-400 mt-1 text-sm">{error}</p>
          <button 
            onClick={fetchNews} 
            className="mt-4 px-5 py-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold rounded-lg shadow-md transition-transform transform hover:scale-105"
          >
            Retry
          </button>
        </div>
      );
    }

    if (filteredNews.length > 0) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNews.map(article => (
            <NewsCard
                key={article.id}
                article={article}
                isExpanded={expandedArticleIds.has(article.id)}
                onToggleExpand={() => handleToggleExpand(article.id)}
            />
          ))}
        </div>
      );
    }

    return (
      <div className="text-center py-10 bg-black bg-opacity-20 rounded-xl dark:bg-gray-900/40">
        <p className="text-lg text-gray-300 dark:text-gray-400">No news articles found for the selected filters.</p>
      </div>
    );
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-center mb-4">Indonesia Flood News</h2>
        <div className="flex justify-center items-center gap-4 p-4 bg-black bg-opacity-20 rounded-xl dark:bg-gray-900/40">
            <select 
              value={selectedCity}
              onChange={(e) => setSelectedCity(e.target.value)}
              className="w-full md:w-auto px-4 py-2 bg-gray-700 bg-opacity-50 border border-gray-500 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-400 transition dark:bg-gray-800 dark:border-gray-600 disabled:opacity-50"
              disabled={isLoading || !!error}
            >
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
        </div>
      </div>
      {renderContent()}
    </div>
  );
}