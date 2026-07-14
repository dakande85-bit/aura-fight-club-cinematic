import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, dropOneProducts } from '../data/products.js';
import { getPreorderProduct } from '../data/preorderProducts.js';
import { applyProductOverride } from '../data/productOverrides.js';
import ProductDetail from './ProductDetail.jsx';

function findProductBySlug(slug) {
  const preorderProduct = getPreorderProduct(slug);
  if (preorderProduct) return applyProductOverride(preorderProduct);

  const catalogueProduct = getProduct(slug);
  if (catalogueProduct) return applyProductOverride(catalogueProduct);

  const dropProduct = dropOneProducts.find((item) => item.slug === slug) ?? null;
  return applyProductOverride(dropProduct);
}

export default function ProductDetailRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = findProductBySlug(slug);
  const backPath = product?.collection === 'Pre-Order'
    ? '/pre-orders'
    : product?.department === 'Equipment'
      ? '/equipment'
      : product?.department === 'Apparel'
        ? '/apparel'
        : product?.collection === 'Drop 001' ? '/drop-001' : '/drops';

  return (
    <ProductDetail
      product={product}
      onBack={() => navigate(backPath)}
    />
  );
}
