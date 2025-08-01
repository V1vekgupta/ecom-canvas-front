import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingCart, Star, Heart } from 'lucide-react';
import { Product } from '@/lib/api';
import { useCart } from '@/hooks/useCart';
import { useState } from 'react';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export const ProductCard = ({ product, showAddToCart = true }: ProductCardProps) => {
  const { addToCart, loading } = useCart();
  const [isWishlist, setIsWishlist] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await addToCart(product.id, 1);
    } catch (error) {
      // Error handled by useCart
    }
  };

  const toggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsWishlist(!isWishlist);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const mainImage = product.images?.[0]?.downloadUrl || '/placeholder.svg';
  const isOutOfStock = product.quantity === 0;

  return (
    <Link to={`/product/${product.id}`}>
      <Card className="group product-card overflow-hidden h-full">
        <div className="relative aspect-square overflow-hidden">
          <img
            src={mainImage}
            alt={product.name}
            className="object-cover w-full h-full transition-smooth group-hover:scale-105"
          />
          
          {/* Wishlist Button */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={toggleWishlist}
          >
            <Heart className={`h-4 w-4 ${isWishlist ? 'fill-current text-red-500' : ''}`} />
          </Button>

          {/* Stock Badge */}
          {isOutOfStock && (
            <Badge variant="destructive" className="absolute top-2 left-2">
              Out of Stock
            </Badge>
          )}

          {/* Sale Badge (if applicable) */}
          {product.price < 100 && (
            <Badge className="absolute bottom-2 left-2 bg-sale text-white">
              Sale
            </Badge>
          )}
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-smooth">
                {product.name}
              </h3>
            </div>

            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>

            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="text-xs">
                {product.category?.name}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {product.brand}
              </Badge>
            </div>

            {/* Rating (placeholder) */}
            <div className="flex items-center space-x-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-4 w-4 ${
                    i < 4 ? 'fill-current text-rating' : 'text-muted-foreground/30'
                  }`}
                />
              ))}
              <span className="text-sm text-muted-foreground ml-2">(4.0)</span>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 pt-0">
          <div className="flex items-center justify-between w-full">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-2xl font-bold price">
                  {formatPrice(product.price)}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                {product.quantity} in stock
              </p>
            </div>

            {showAddToCart && !isOutOfStock && (
              <Button
                variant="cart"
                size="sm"
                onClick={handleAddToCart}
                disabled={loading}
                className="ml-2"
              >
                <ShoppingCart className="h-4 w-4 mr-1" />
                Add to Cart
              </Button>
            )}
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
};