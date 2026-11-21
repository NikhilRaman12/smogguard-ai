import React from 'react';
import ReactMarkdown from 'react-markdown';
import { format } from 'date-fns';
import { Bot, User } from 'lucide-react';

const toolBadges = {
  'aqi_data': { emoji: '📊', label: 'Real-time AQI' },
  'weather_data': { emoji: '🌤', label: 'Weather Data' },
  'health_risk': { emoji: '🏥', label: 'Health Analysis' },
  'forecast': { emoji: '📈', label: 'Forecast Data' },
  'emission_calc': { emoji: '🌍', label: 'Emission Calculator' },
  'routine_gen': { emoji: '📅', label: 'Routine Generator' },
};

export default function ChatMessage({ role, content, toolsUsed = [], timestamp }) {
  const isUser = role === 'user';

  return (
    <div
      className={`flex gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'} animate-slide-up`}
    >
      {/* Avatar */}
      <div
        className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser
            ? 'bg-indigo-600 text-white'
            : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
        }`}
      >
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message bubble */}
      <div className={`max-w-[75%] min-w-0 ${isUser ? 'items-end' : 'items-start'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isUser
              ? 'bg-indigo-600 text-white rounded-tr-sm'
              : 'bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-tl-sm shadow-sm'
          }`}
        >
          {isUser ? (
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{content}</p>
          ) : (
            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-p:my-1 prose-headings:my-2 prose-ul:my-1 prose-li:my-0.5">
              <ReactMarkdown>{content}</ReactMarkdown>
            </div>
          )}
        </div>

        {/* Tool usage badges */}
        {!isUser && toolsUsed && toolsUsed.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {toolsUsed.map((tool, i) => {
              const badge = toolBadges[tool] || { emoji: '🔧', label: tool };
              return (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 px-2 py-0.5 bg-slate-100 dark:bg-slate-700/50 text-slate-600 dark:text-slate-400 rounded-full text-[10px] font-medium"
                >
                  {badge.emoji} {badge.label}
                </span>
              );
            })}
          </div>
        )}

        {/* Timestamp */}
        {timestamp && (
          <p
            className={`text-[10px] mt-1 text-slate-400 dark:text-slate-500 ${
              isUser ? 'text-right' : 'text-left'
            }`}
          >
            {format(new Date(timestamp), 'h:mm a')}
          </p>
        )}
      </div>
    </div>
  );
}
