import { useEffect, useState } from 'react';
import { XIcon, RulerIcon } from 'lucide-react';

interface SizeGuideData {
  name: string;
  gender: string;
  clothingType: string;
  columns: string;
  rows: string;
  unit: string;
  measureImage?: string;
}

interface SizeGuideModalProps {
  sizeGuideId: string;
  isOpen: boolean;
  onClose: () => void;
}

export function SizeGuideModal({ sizeGuideId, isOpen, onClose }: SizeGuideModalProps) {
  const [guide, setGuide] = useState<SizeGuideData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'chart' | 'measure'>('chart');

  useEffect(() => {
    if (!isOpen || !sizeGuideId) return;
    setLoading(true);
    setError('');
    setActiveTab('chart');
    fetch(`/api/inventory?action=size-guide&id=${encodeURIComponent(sizeGuideId)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load size guide');
        return res.json();
      })
      .then((data) => {
        setGuide(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || 'Failed to load size guide');
        setLoading(false);
      });
  }, [isOpen, sizeGuideId]);

  if (!isOpen) return null;

  let columns: string[] = [];
  let rows: string[][] = [];
  try {
    columns = guide ? JSON.parse(guide.columns) : [];
    rows = guide ? JSON.parse(guide.rows) : [];
  } catch {
    // ignore parse errors
  }

  const unitLabel = guide?.unit === 'inches' ? 'in' : guide?.unit === 'cm' ? 'cm' : 'in/cm';
  const hasMeasureImage = !!(guide?.measureImage);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      {/* Modal */}
      <div className="relative bg-background border border-border max-w-3xl w-full mx-4 max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <RulerIcon className="w-5 h-5 text-muted-foreground" />
            <div>
              <h2 className="font-serif text-lg">{guide?.name || 'Size Guide'}</h2>
              {guide && (
                <p className="text-xs text-muted-foreground uppercase tracking-widest mt-0.5">
                  {guide.gender} &middot; {guide.clothingType}
                  {guide.unit && ` \u00B7 ${unitLabel}`}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-accent/10 transition-colors"
            aria-label="Close size guide"
          >
            <XIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs (only show if measure image exists) */}
        {hasMeasureImage && !loading && !error && (
          <div className="flex border-b border-border">
            <button
              className={`flex-1 py-3 text-sm font-medium tracking-wide transition-colors ${
                activeTab === 'chart'
                  ? 'border-b-2 border-foreground text-foreground'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
              onClick={() => setActiveTab('chart')}
            >
              Size Chart
            </button>
            <button
              className={`flex-1 py-3 text-sm font-medium tracking-wide transition-colors ${
                activeTab === 'measure'
                  ? 'border-b-2 border-red-600 text-red-600'
                  : 'text-red-600 opacity-70 hover:opacity-100'
              }`}
              onClick={() => setActiveTab('measure')}
            >
              How to measure
            </button>
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-auto p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
              <span className="ml-3 text-sm text-muted-foreground">Loading size guide...</span>
            </div>
          )}

          {error && (
            <div className="text-center py-12">
              <p className="text-sm text-red-500">{error}</p>
            </div>
          )}

          {/* Size Chart Tab */}
          {!loading && !error && guide && activeTab === 'chart' && columns.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    {columns.map((col, i) => (
                      <th
                        key={i}
                        className={`py-3 px-4 text-xs uppercase tracking-widest font-medium text-muted-foreground ${i === 0 ? 'text-left' : 'text-center'}`}
                      >
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, rowIdx) => (
                    <tr
                      key={rowIdx}
                      className={`border-b border-border/50 ${rowIdx % 2 === 0 ? '' : 'bg-accent/5'}`}
                    >
                      {row.map((cell, cellIdx) => (
                        <td
                          key={cellIdx}
                          className={`py-3 px-4 ${cellIdx === 0 ? 'font-medium text-left' : 'text-center text-muted-foreground'}`}
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {!loading && !error && guide && activeTab === 'chart' && columns.length === 0 && (
            <p className="text-center text-sm text-muted-foreground py-8">
              No measurement data available.
            </p>
          )}

          {/* How to Measure Tab */}
          {!loading && !error && guide && activeTab === 'measure' && hasMeasureImage && (
            <div className="flex flex-col items-center gap-4">
              <p className="text-sm text-muted-foreground">How to measure yourself</p>
              <img
                src={guide.measureImage}
                alt="How to measure"
                className="max-w-full max-h-[60vh] object-contain"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-border bg-accent/5">
          <p className="text-xs text-muted-foreground text-center">
            All measurements are approximate. For the best fit, measure yourself and compare to the chart above.
          </p>
        </div>
      </div>
    </div>
  );
}
