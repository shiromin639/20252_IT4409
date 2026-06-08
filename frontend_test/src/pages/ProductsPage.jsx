import CatalogView from '../components/catalog/CatalogView';

function ProductsPage(props) {
  return (
    <CatalogView
      {...props}
      showDetailPanel={false}
      onOpenProduct={(productId) => props.navigate(`/products/${productId}`)}
    />
  );
}

export default ProductsPage;
