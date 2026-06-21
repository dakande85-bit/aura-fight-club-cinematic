import { useParams, useNavigate } from 'react-router-dom';
import { getProduct } from '../data/products.js';
import ProductDetail from './ProductDetail.jsx';

export default function ProductDetailRoute() {
  const { slug } = useParams();
  const navigate  = useNavigate();
  const product   = getProduct(slug);

  return (
    <ProductDetail
      product={product}
      onBack={() => navigate(product?.collection === 'Drop 001' ? '/drop-001' : '/drops')}
    />
  );
}
