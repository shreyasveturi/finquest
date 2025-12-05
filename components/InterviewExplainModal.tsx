/**
 * InterviewExplainModal Component
 * 
 * AI-powered explanation for highlighted text.
 * Shows how selected text relates to interview context.
 * Currently placeholder for future AI integration.
 */

'use client';

import Modal from '@/components/Modal';

interface InterviewExplainModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedText: string;
  articleTitle?: string;
}

export default function InterviewExplainModal({
  isOpen,
  onClose,
  selectedText,
  articleTitle = 'Article',
}: InterviewExplainModalProps) {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="space-y-4 max-w-md">
        <h2 className="text-xl font-bold text-gray-900">Interview Explanation</h2>

        <div className="bg-gray-50 p-4 rounded border border-gray-200">
          <p className="text-xs font-medium text-gray-600 mb-2">SELECTED TEXT</p>
          <p className="text-gray-900">"{selectedText}"</p>
        </div>

        <div className="bg-blue-50 p-4 rounded border border-blue-200">
          <p className="text-xs font-medium text-blue-600 mb-2">💡 HOW TO EXPLAIN THIS</p>
          <div className="text-sm text-gray-700 space-y-2">
            <p>
              When interviewing, explain this concept by connecting it to:
            </p>
            <ul className="list-disc list-inside space-y-1 text-sm">
              <li>Why this matters in financial decision-making</li>
              <li>Real-world applications and examples</li>
              <li>How it connects to broader economic trends</li>
              <li>What risks or opportunities it presents</li>
            </ul>
          </div>
        </div>

        <div className="bg-yellow-50 p-4 rounded border border-yellow-200">
          <p className="text-xs font-medium text-yellow-700 mb-2">💬 INTERVIEW TALKING POINT</p>
          <p className="text-sm text-gray-700">
            "Based on {articleTitle}, when this comes up in conversations, you should be able to explain why it's important and how it affects financial planning. Focus on the practical implications rather than just the definition."
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-900 font-medium rounded transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
}
