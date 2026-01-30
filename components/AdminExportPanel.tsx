'use client';

import { useState } from 'react';
import Button from './Button';

interface Props {
  token: string;
}

export default function AdminExportPanel({ token }: Props) {
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const buildUrl = (type: 'rounds' | 'matches') => {
    const params = new URLSearchParams({
      type,
      token,
    });
    if (from) params.set('from', from);
    if (to) params.set('to', to);
    return `/api/admin/export?${params.toString()}`;
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">From</label>
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-neutral-700">To</label>
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 text-sm"
          />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <a href={buildUrl('rounds')} className="flex-1">
          <Button className="w-full">Download Rounds CSV</Button>
        </a>
        <a href={buildUrl('matches')} className="flex-1">
          <Button className="w-full" variant="outline">Download Matches CSV</Button>
        </a>
      </div>
    </div>
  );
}
