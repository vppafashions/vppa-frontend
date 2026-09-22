interface ProductPriceProps {
  price: number;
  originalPrice?: number;
  className?: string;
  priceClassName?: string;
}

export function ProductPrice({
  price,
  originalPrice,
  className = '',
  priceClassName = '',
}: ProductPriceProps) {
  const salePrice = Number(price);
  const listPrice = Number(originalPrice);
  const hasDiscount =
    Number.isFinite(salePrice) && Number.isFinite(listPrice) && listPrice > salePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((listPrice - salePrice) / listPrice) * 100)
    : 0;

  return (
    <div className={`flex flex-wrap items-baseline gap-x-2 gap-y-1 ${className}`.trim()}>
      <span className={priceClassName}>₹{salePrice.toLocaleString('en-IN')}</span>
      {hasDiscount && (
        <>
          <span className="text-muted-foreground line-through">
            ₹{listPrice.toLocaleString('en-IN')}
          </span>
          <span className="text-xs font-medium text-primary">{discountPercentage}% off</span>
        </>
      )}
    </div>
  );
}
