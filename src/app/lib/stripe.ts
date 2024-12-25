// 1 setup payment sheet
//2 open stripe checkout form
import { CollectionMode } from '@stripe/stripe-react-native/lib/typescript/src/types/PaymentSheet'
import { supabase } from './supabase'
import { initPaymentSheet, presentPaymentSheet } from '@stripe/stripe-react-native'

const fetchStripekeys =async(totalAmount:number)=>{
    const {data,error}= await supabase.functions.invoke('stripe-checkout',{
       body: {
        totalAmount,
         },
    })
    if (error) throw new Error(error.message)
    return data
}

export const setupStripePaymentSheet= async(totalAmount: number) => {
    const{paymentIntent, publicKey, ephmeralKey,customer}= await fetchStripekeys(totalAmount)
     
    if (!paymentIntent || !publicKey) {
        throw new Error('Failed to fetch stripe keys')
    }
    await initPaymentSheet({
        merchantDisplayName: 'CHITTS',
        paymentIntentClientSecret: paymentIntent,
        customerId: customer,
        customerEphemeralKeySecret: ephmeralKey,
        billingDetailsCollectionConfiguration: {
            name: 'always' as CollectionMode,
            phone: 'always' as CollectionMode
        }
    })
    // fetch paymentIntent and publishable key from the server
}

export const openStripeCheckout= async ()=>{
    const {error}= await presentPaymentSheet();
        
    if (error) {
        throw new Error(error.message)
    }
    return true
}


