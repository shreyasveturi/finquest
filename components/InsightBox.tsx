/**
 * InsightBox Component
 * 
 * Inline contextual information within articles.
 * Used to highlight key concepts, definitions, or expert perspectives.
 * Subtle design with left-side accent to avoid disrupting reading flow.
 */

interface InsightBoxProps {
  title: string;
  children: React.ReactNode;
  type?: 'definition' | 'expert' | 'context' | 'tip';
}

const typeStyles = {
  definition: 'border-l-4 border-blue-500 bg-blue-50',
  expert: 'border-l-4 border-green-500 bg-green-50',
  context: 'border-l-4 border-yellow-500 bg-yellow-50',
  tip: 'border-l-4 border-purple-500 bg-purple-50',
};

const typeIcons = {
  definition: '📖',
  expert: '💡',
  context: '🌍',
  tip: '⭐',
};

export default function InsightBox({
  title,
  children,
  type = 'definition',
}: InsightBoxProps) {
  const iconEmoji = typeIcons[type];

  return (
    <div className={`${typeStyles[type]} rounded-r p-4 my-4 text-sm`}>
      <div className="font-medium text-gray-900 mb-2 flex items-center gap-2">
        <span>{iconEmoji}</span>
        <span>{title}</span>
      </div>
      <div className="text-gray-700 leading-relaxed">
        {children}
      </div>
    </div>
  );
}
