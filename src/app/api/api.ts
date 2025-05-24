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

export const getMyProfile = () => {
  const {
    user: { id },
  } = useAuth();

  return useQuery({
    queryKey: ['my-profile', id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profile')
        .select('user_id, wallet_balance, address, first_name, phone_number,delivery_note')
        .eq('user_id', id)
        .maybeSingle();

      if (error) {
        console.error('Profile fetch error:', error.message);
        throw new Error('Failed to fetch profile: ' + error.message);
      }

      if (!data) {
        console.warn('No profile found for user:', id);
        return null;
      }

      console.log('Fetched profile data:', data);
      return data;
    },
  });
};



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
          status: 'Received',
          refunded_amount: 0
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
      const individualInsertData: { order: number, product: number, quantity: number }[] = [];

      for (const { orderId, productId, quantity } of insertData) {
        for (let i = 0; i < quantity; i++) {
          individualInsertData.push({
            order: orderId,
            product: productId,
            quantity: 1,
          });
        }
      }

      const { data, error } = await supabase
        .from('order_item')
        .insert(individualInsertData)
        .select('*');

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
        .select('*, order_item(*,status, products:product(*, Status))')
        .eq('slug', slug)
        .eq('user', id)
        .single();

      if (error)
        throw new Error('An error occurred while fetching data: ' + error.message);

      return data;
    },
  });
};

export const upsertMyProfile = () => {
  const { user } = useAuth();  // Get the user from the context
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profileData: {
      wallet_balance?: number;
      address?: string;
      first_name?: string;
      phone_number?: string;
      email?: string;
    }) => {
      if (!user || !user.id) {
        throw new Error('User is not authenticated');
      }

      const { data, error } = await supabase
        .from('profile')
        .upsert({
          user_id: user.id,  // ✅ Use the correct column for UUID
          ...profileData,
        }, { onConflict: 'user_id' }) // Optional: Ensure upsert is based on `user_id`
        .select('*')
        .single();

      if (error) throw new Error('Failed to update profile: ' + error.message);
      return data;
    },

    onSuccess: async () => {
      if (user?.id) {
        await queryClient.invalidateQueries({ queryKey: ['my-profile', user.id] });
      }
    },
  });
};
