import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../Providers/auth-provider';

const generateOrderSlug = () => {
  return 'order-' + Math.random().toString(36).substr(2, 9);
};

export const getProductsAndCategories = () => {
  return useQuery({
    queryKey: ['products', 'categories'],
    queryFn: async () => {
      const [products, categories] = await Promise.all([
        supabase.from('product').select('*, Status'),
        supabase.from('category').select('*'),
      ]);

      if (products.error || categories.error) {
        throw new Error('An error occurred while fetching data');
      }

      return { products: products.data, categories: categories.data };
    }
  });
}

export const getProduct = (slug: string) => {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product')
        .select('*, Status')
        .eq('slug', slug)
        .single();

      if (error || !data) {
        throw new Error(
          'An error occurred while fetching data: ' + error?.message
        );
      }
      return data;
    }
  });
}

export const getCategoriesAndProducts = (categorySlug: string) => {
  return useQuery({
    queryKey: ['categoryAndproducts', categorySlug],
    queryFn: async () => {
      const { data: category, error: categoryError } = await supabase
        .from('category')
        .select('*')
        .eq('slug', categorySlug)
        .single();

      if (categoryError || !category) {
        throw new Error('An error occurred while fetching data');
      }

      const { data: products, error: productsError } = await supabase
        .from('product')
        .select('*, Status')
        .eq('category', category.id);

      if (productsError) {
        throw new Error('An error occurred while fetching data');
      }

      return { category, products };
    }
  });
}

export const getMyOrders = () => {
  const {
    user: { id }
  } = useAuth();

  return useQuery({
    queryKey: ['orders', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order')
        .select('*, refunded_amount')
        .order('created_at', { ascending: false })
        .eq('user', id);

      if (error)
        throw new Error('An error occurred while fetching data: ' + error.message);

      return data;
    }
  });
}

export const createOrder = () => {
  const {
    user: { id },
  } = useAuth();

  const slug = generateOrderSlug();
  const queryClient = useQueryClient();

  return useMutation({
    async mutationFn({ totalPrice }: { totalPrice: number }) {
      const { data, error } = await supabase
        .from('order')
        .insert({
          totalPrice,
          slug,
          user: id,
          status: 'Pending',
          refunded_amount : 0
        })
        .select('*')
        .single();

      if (error)
        throw new Error(
          'An error occurred while creating order: ' + error.message
        );

      return data;
    },

    async onSuccess() {
      await queryClient.invalidateQueries({ queryKey: ['order'] });
    },
  });
};

export const createOrderItem = () => {
  return useMutation({
    async mutationFn({ insertData }: { insertData: { orderId: number, productId: number, quantity: number }[] }) {
      const { data, error } = await supabase
        .from('order_item')
        .insert(
          insertData.map(({ orderId, quantity, productId }) => ({
            order: orderId,
            quantity,
            product: productId,
          }))
        )
        .select('*');

      const productQuantities = insertData.reduce(
        (acc, { productId, quantity }) => {
          if (!acc[productId]) {
            acc[productId] = 0;
          }
          acc[productId] += quantity;
          return acc;
        },
        {} as Record<number, number>
      );

      await Promise.all(
        Object.entries(productQuantities).map(
          async ([productId, totalQuantity]) =>
            supabase.rpc('decrement_product_quantity', {
              product_id: Number(productId),
              quantity: totalQuantity,
            })
        )
      );

      if (error)
        throw new Error('An error occurred while creating order item: ' + error.message);
      
      return data;
    }
  });
}

export const getMyOrder = (slug: string) => {
  const {
    user: { id },
  } = useAuth();

  return useQuery({
    queryKey: ['orders', slug],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('order')
        .select('*, order_item(*, products:product(*, Status))')
        .eq('slug', slug)
        .eq('user', id)
        .single();

      if (error)
        throw new Error('An error occurred while fetching data: ' + error.message);

      return data;
    },
  });
};
