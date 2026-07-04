import { useParams, useNavigate } from 'react-router-dom';
import { getProduct, dropOneProducts } from '../data/products.js';
import ProductDetail from './ProductDetail.jsx';

function findProductBySlug(slug) {
  const catalogueProduct = getProduct(slug);
  if (catalogueProduct) return catalogueProduct;
  return dropOneProducts.find((item) => item.slug === slug) ?? null;
}

export default function ProductDetailRoute() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = findProductBySlug(slug);

  return (
    <ProductDetail
      product={product}
      onBack={() => navigate(product?.collection === 'Drop 001' ? '/drop-001' : '/drops')}
    />
  );
}
