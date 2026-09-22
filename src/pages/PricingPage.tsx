import { useRef, useState, type ChangeEvent } from 'react';
import {
  AlertCircle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  LockKeyhole,
  RefreshCw,
  Upload,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import {
  parsePricingCsv,
  pricingRowsToCsv,
  type PricingRow,
} from '../lib/pricingCsv';

const currencyFormatter = new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2,
});

function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

async function readApiError(response: Response): Promise<string> {
  const payload = await response.json().catch(() => ({}));
  const details = Array.isArray(payload.details) ? payload.details.join(' ') : '';
  return [payload.error, details].filter(Boolean).join(' ') || 'The pricing request failed. Please try again.';
}

export function PricingPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [secret, setSecret] = useState('');
  const [products, setProducts] = useState<PricingRow[]>([]);
  const [previewRows, setPreviewRows] = useState<PricingRow[]>([]);
  const [fileName, setFileName] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [selectedGender, setSelectedGender] = useState('all');
  const [selectedCollection, setSelectedCollection] = useState('all');

  const genderOptions = Array.from(
    new Set(products.map((product) => product.gender).filter(Boolean)),
  ).sort();
  const collectionOptions = Array.from(
    new Set(products.map((product) => product.collection).filter(Boolean)),
  ).sort();
  const filteredProducts = products.filter((product) => {
    const matchesGender = selectedGender === 'all' || product.gender === selectedGender;
    const matchesCollection = selectedCollection === 'all' || product.collection === selectedCollection;
    return matchesGender && matchesCollection;
  });

  const loadPricing = async () => {
    if (!secret.trim()) {
      setErrors(['Enter the pricing management secret to continue.']);
      setMessage('');
      return false;
    }

    setLoading(true);
    setErrors([]);
    setMessage('');

    try {
      const response = await fetch('/api/pricing', {
        headers: { 'x-pricing-admin-secret': secret.trim() },
        cache: 'no-store',
      });
      if (!response.ok) throw new Error(await readApiError(response));

      const data = await response.json();
      setProducts(data.products || []);
      setLoaded(true);
      setMessage(`${(data.products || []).length} products ready to export.`);
      return true;
    } catch (error) {
      setLoaded(false);
      setProducts([]);
      setPreviewRows([]);
      setFileName('');
      setErrors([error instanceof Error ? error.message : 'Unable to load pricing.']);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const downloadPricing = () => {
    if (!loaded) return;

    const blob = new Blob([pricingRowsToCsv(filteredProducts)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `vppa-pricing-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 0);
    setMessage(`${filteredProducts.length} pricing rows downloaded. Edit Selling Price and MRP, then upload the CSV.`);
  };

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    setErrors([]);
    setMessage('');

    try {
      const result = parsePricingCsv(await file.text());
      setPreviewRows(result.rows);
      setErrors(result.errors);
      if (result.errors.length === 0) {
        setMessage(`${result.rows.length} pricing rows are ready to apply.`);
      }
    } catch {
      setPreviewRows([]);
      setErrors(['Unable to read the selected CSV file.']);
    } finally {
      event.target.value = '';
    }
  };

  const applyPricing = async () => {
    if (!loaded || previewRows.length === 0 || errors.length > 0) return;

    setLoading(true);
    setErrors([]);
    setMessage('');

    try {
      const response = await fetch('/api/pricing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-pricing-admin-secret': secret.trim(),
        },
        body: JSON.stringify({ updates: previewRows }),
      });
      if (!response.ok) throw new Error(await readApiError(response));

      const data = await response.json();
      setPreviewRows([]);
      setFileName('');
      const refreshed = await loadPricing();
      if (refreshed) setMessage(`${data.updatedCount} product prices updated successfully.`);
    } catch (error) {
      setErrors([error instanceof Error ? error.message : 'Unable to apply pricing.']);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background py-16 md:py-24">
      <div className="container mx-auto max-w-6xl px-4 md:px-8">
        <div className="max-w-3xl mb-12">
          <p className="text-xs uppercase tracking-[0.28em] text-primary font-semibold mb-4">
            Catalog operations
          </p>
          <h1 className="font-magazine text-5xl md:text-6xl tracking-tight mb-5">
            Pricing CSV
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Export the complete product price list, edit Selling Price and MRP in Excel or Google Sheets,
            then upload the CSV to update the storefront catalog in one pass.
          </p>
        </div>

        <section className="border border-border/50 bg-card/60 p-6 md:p-8 mb-8">
          <div className="flex items-start gap-4 mb-7">
            <div className="flex size-11 shrink-0 items-center justify-center bg-foreground text-background">
              <LockKeyhole className="size-5" aria-hidden="true" />
            </div>
            <div>
              <h2 className="font-magazine text-2xl mb-1">Secure catalog access</h2>
              <p className="text-sm text-muted-foreground">
                Enter the server-configured pricing secret to load the current catalog. It is never included in the CSV.
              </p>
            </div>
          </div>

          <div className="flex flex-col md:flex-row gap-3 md:items-end">
            <label className="flex-1">
              <span className="block text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                Pricing management secret
              </span>
              <input
                type="password"
                value={secret}
                onChange={(event) => setSecret(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') void loadPricing();
                }}
                className="h-11 w-full border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                placeholder="Enter secret"
                autoComplete="current-password"
              />
            </label>
            <Button type="button" onClick={() => void loadPricing()} disabled={loading}>
              {loading ? (previewRows.length ? 'Applying…' : 'Loading…') : 'Load pricing'}
            </Button>
          </div>
        </section>

        {loaded && (
          <>
            <section className="border border-border/50 bg-card/60 p-6 md:p-8 mb-8">
              <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">
                    Catalog filters
                  </p>
                  <h2 className="font-magazine text-3xl mb-2">Choose a product group</h2>
                  <p className="text-sm text-muted-foreground">
                    Gender and Collection are included in the CSV as reference fields.
                  </p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full lg:w-auto lg:min-w-[420px]">
                  <label>
                    <span className="block text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">
                      Gender
                    </span>
                    <select
                      value={selectedGender}
                      onChange={(event) => setSelectedGender(event.target.value)}
                      className="h-11 w-full border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="all">All genders</option>
                      {genderOptions.map((gender) => <option key={gender} value={gender}>{gender}</option>)}
                    </select>
                  </label>
                  <label>
                    <span className="block text-xs uppercase tracking-[0.16em] text-muted-foreground mb-2">
                      Collection
                    </span>
                    <select
                      value={selectedCollection}
                      onChange={(event) => setSelectedCollection(event.target.value)}
                      className="h-11 w-full border border-border bg-background px-3 text-sm focus:border-primary focus:outline-none"
                    >
                      <option value="all">All collections</option>
                      {collectionOptions.map((collection) => (
                        <option key={collection} value={collection}>{collection}</option>
                      ))}
                    </select>
                  </label>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-5">
                Showing {filteredProducts.length} of {products.length} products.
              </p>
            </section>

            <section className="grid gap-4 md:grid-cols-2 mb-8">
              <div className="border border-border/50 bg-card/60 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <FileSpreadsheet className="size-5 text-primary" aria-hidden="true" />
                  <h2 className="font-magazine text-2xl">1. Download</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Download the selected group with Gender, Collection, Item Code, Selling Price, and MRP.
                </p>
                <Button type="button" variant="outline" onClick={downloadPricing} disabled={filteredProducts.length === 0}>
                  <Download className="size-4 mr-2" aria-hidden="true" />
                  Download CSV
                </Button>
              </div>

              <div className="border border-border/50 bg-card/60 p-6">
                <div className="flex items-center gap-3 mb-4">
                  <Upload className="size-5 text-primary" aria-hidden="true" />
                  <h2 className="font-magazine text-2xl">2. Upload</h2>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed mb-6">
                  Keep the Item Code or Product ID unchanged. Only Selling Price and MRP are applied.
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv"
                  className="sr-only"
                  onChange={(event) => void handleFileChange(event)}
                />
                <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                  <Upload className="size-4 mr-2" aria-hidden="true" />
                  Choose CSV
                </Button>
                {fileName && <p className="text-xs text-muted-foreground mt-3 truncate">{fileName}</p>}
              </div>
            </section>

            {previewRows.length > 0 && (
              <section className="border border-border/50 bg-card/60 p-6 md:p-8 mb-8">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                  <div>
                    <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground mb-2">Upload preview</p>
                    <h2 className="font-magazine text-3xl">Review before applying</h2>
                  </div>
                  <Button type="button" onClick={() => void applyPricing()} disabled={loading || errors.length > 0}>
                    {loading ? 'Applying…' : 'Apply prices'}
                  </Button>
                </div>

                <div className="overflow-x-auto border border-border/40">
                  <table className="w-full min-w-[900px] text-sm">
                    <thead className="bg-muted/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                      <tr>
                        <th className="px-4 py-3 font-medium">Item Code</th>
                        <th className="px-4 py-3 font-medium">Product</th>
                        <th className="px-4 py-3 font-medium">Gender</th>
                        <th className="px-4 py-3 font-medium">Collection</th>
                        <th className="px-4 py-3 font-medium text-right">Selling Price</th>
                        <th className="px-4 py-3 font-medium text-right">MRP</th>
                      </tr>
                    </thead>
                    <tbody>
                      {previewRows.slice(0, 20).map((row) => (
                        <tr key={`${row.productId}-${row.itemCode}`} className="border-t border-border/30">
                          <td className="px-4 py-3 font-mono text-xs">{row.itemCode || row.productId}</td>
                          <td className="px-4 py-3">{row.productName || '—'}</td>
                          <td className="px-4 py-3">{row.gender || '—'}</td>
                          <td className="px-4 py-3">{row.collection || '—'}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(row.sellingPrice)}</td>
                          <td className="px-4 py-3 text-right">{formatCurrency(row.mrp)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {previewRows.length > 20 && (
                  <p className="text-xs text-muted-foreground mt-3">
                    Showing the first 20 of {previewRows.length} rows. All valid rows will be applied.
                  </p>
                )}
              </section>
            )}
          </>
        )}

        {(errors.length > 0 || message) && (
          <div
            className={`flex items-start gap-3 border p-4 text-sm ${
              errors.length > 0
                ? 'border-red-200 bg-red-50 text-red-700'
                : 'border-green-200 bg-green-50 text-green-700'
            }`}
            role="status"
          >
            {errors.length > 0 ? (
              <AlertCircle className="size-5 shrink-0" aria-hidden="true" />
            ) : (
              <CheckCircle2 className="size-5 shrink-0" aria-hidden="true" />
            )}
            <div className="space-y-1">
              {errors.length > 0
                ? errors.map((error) => <p key={error}>{error}</p>)
                : <p>{message}</p>}
            </div>
          </div>
        )}

        {loaded && products.length === 0 && (
          <div className="mt-8 flex items-center gap-3 text-sm text-muted-foreground">
            <RefreshCw className="size-4" aria-hidden="true" />
            No products were returned from the catalog.
          </div>
        )}
      </div>
    </main>
  );
}
