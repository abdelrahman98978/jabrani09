export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      accessories: {
        Row: {
          category: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          name: string
          name_ar: string
          original_price: number | null
          price: number
          stock: number | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name: string
          name_ar: string
          original_price?: number | null
          price: number
          stock?: number | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          name?: string
          name_ar?: string
          original_price?: number | null
          price?: number
          stock?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      addresses: {
        Row: {
          building_number: string | null
          city: string | null
          created_at: string | null
          district: string | null
          id: string
          is_default: boolean | null
          label: string
          postal_code: string | null
          street: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          building_number?: string | null
          city?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          postal_code?: string | null
          street?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          building_number?: string | null
          city?: string | null
          created_at?: string | null
          district?: string | null
          id?: string
          is_default?: boolean | null
          label?: string
          postal_code?: string | null
          street?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          logo_url: string | null
          name: string
          name_ar: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name: string
          name_ar: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          name?: string
          name_ar?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      car_reviews: {
        Row: {
          car_id: string
          cons: string[] | null
          content: string | null
          created_at: string
          helpful_count: number | null
          id: string
          is_approved: boolean | null
          is_verified_purchase: boolean | null
          pros: string[] | null
          rating: number
          title: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          car_id: string
          cons?: string[] | null
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          pros?: string[] | null
          rating: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          car_id?: string
          cons?: string[] | null
          content?: string | null
          created_at?: string
          helpful_count?: number | null
          id?: string
          is_approved?: boolean | null
          is_verified_purchase?: boolean | null
          pros?: string[] | null
          rating?: number
          title?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_reviews_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      car_views: {
        Row: {
          car_id: string
          created_at: string
          id: string
          referrer: string | null
          user_agent: string | null
          viewer_ip: string | null
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          viewer_ip?: string | null
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          referrer?: string | null
          user_agent?: string | null
          viewer_ip?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "car_views_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      cars: {
        Row: {
          brand_id: string | null
          color: string | null
          color_ar: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          engine_size: string | null
          fuel_type: string | null
          has_discount: boolean | null
          has_test_drive: boolean | null
          id: string
          images: string[] | null
          is_featured: boolean | null
          is_new: boolean | null
          main_image: string | null
          mileage: number | null
          model: string
          name: string
          name_ar: string
          original_price: number | null
          price: number
          status: string | null
          transmission: string | null
          updated_at: string
          video_360_thumbnail: string | null
          video_360_type: string | null
          video_360_url: string | null
          video_overlay_opacity: string | null
          video_thumbnail: string | null
          video_url: string | null
          views_count: number | null
          year: number
        }
        Insert: {
          brand_id?: string | null
          color?: string | null
          color_ar?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          has_discount?: boolean | null
          has_test_drive?: boolean | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          main_image?: string | null
          mileage?: number | null
          model: string
          name: string
          name_ar: string
          original_price?: number | null
          price: number
          status?: string | null
          transmission?: string | null
          updated_at?: string
          video_360_thumbnail?: string | null
          video_360_type?: string | null
          video_360_url?: string | null
          video_overlay_opacity?: string | null
          video_thumbnail?: string | null
          video_url?: string | null
          views_count?: number | null
          year: number
        }
        Update: {
          brand_id?: string | null
          color?: string | null
          color_ar?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          engine_size?: string | null
          fuel_type?: string | null
          has_discount?: boolean | null
          has_test_drive?: boolean | null
          id?: string
          images?: string[] | null
          is_featured?: boolean | null
          is_new?: boolean | null
          main_image?: string | null
          mileage?: number | null
          model?: string
          name?: string
          name_ar?: string
          original_price?: number | null
          price?: number
          status?: string | null
          transmission?: string | null
          updated_at?: string
          video_360_thumbnail?: string | null
          video_360_type?: string | null
          video_360_url?: string | null
          video_overlay_opacity?: string | null
          video_thumbnail?: string | null
          video_url?: string | null
          views_count?: number | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "cars_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
        ]
      }
      cart_items: {
        Row: {
          car_id: string | null
          created_at: string
          id: string
          quantity: number
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          car_id?: string | null
          created_at?: string
          id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          car_id?: string | null
          created_at?: string
          id?: string
          quantity?: number
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cart_items_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          admin_notes: string | null
          car_id: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string
          status: string | null
          subject: string | null
        }
        Insert: {
          admin_notes?: string | null
          car_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone: string
          status?: string | null
          subject?: string | null
        }
        Update: {
          admin_notes?: string | null
          car_id?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string
          status?: string | null
          subject?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contact_messages_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          city: string | null
          created_at: string
          customer_type: string | null
          email: string | null
          id: string
          last_interaction: string | null
          name: string
          notes: string | null
          phone: string
          total_purchases: number | null
          updated_at: string
          user_id: string | null
          whatsapp: string | null
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          last_interaction?: string | null
          name: string
          notes?: string | null
          phone: string
          total_purchases?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_type?: string | null
          email?: string | null
          id?: string
          last_interaction?: string | null
          name?: string
          notes?: string | null
          phone?: string
          total_purchases?: number | null
          updated_at?: string
          user_id?: string | null
          whatsapp?: string | null
        }
        Relationships: []
      }
      email_campaigns: {
        Row: {
          content: string
          content_ar: string
          created_at: string
          created_by: string | null
          id: string
          name: string
          name_ar: string
          scheduled_at: string | null
          sent_at: string | null
          status: string
          subject: string
          subject_ar: string
          target_audience: string | null
          total_opened: number | null
          total_recipients: number | null
          total_sent: number | null
          updated_at: string
        }
        Insert: {
          content: string
          content_ar: string
          created_at?: string
          created_by?: string | null
          id?: string
          name: string
          name_ar: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject: string
          subject_ar: string
          target_audience?: string | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Update: {
          content?: string
          content_ar?: string
          created_at?: string
          created_by?: string | null
          id?: string
          name?: string
          name_ar?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
          subject_ar?: string
          target_audience?: string | null
          total_opened?: number | null
          total_recipients?: number | null
          total_sent?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      faq: {
        Row: {
          answer: string
          answer_ar: string
          category: string
          created_at: string
          id: string
          is_active: boolean | null
          question: string
          question_ar: string
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          answer: string
          answer_ar: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          question: string
          question_ar: string
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          answer?: string
          answer_ar?: string
          category?: string
          created_at?: string
          id?: string
          is_active?: boolean | null
          question?: string
          question_ar?: string
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      invoices: {
        Row: {
          amount: number
          created_at: string
          customer_id: string | null
          due_date: string | null
          id: string
          invoice_number: string
          order_id: string
          paid_at: string | null
          status: string | null
          tax_amount: number | null
          total_amount: number
        }
        Insert: {
          amount: number
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number: string
          order_id: string
          paid_at?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount: number
        }
        Update: {
          amount?: number
          created_at?: string
          customer_id?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          order_id?: string
          paid_at?: string | null
          status?: string | null
          tax_amount?: number | null
          total_amount?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoices_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          email: string
          id: string
          is_active: boolean
          subscribed_at: string
        }
        Insert: {
          email: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Update: {
          email?: string
          id?: string
          is_active?: boolean
          subscribed_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean | null
          link: string | null
          message: string
          message_ar: string | null
          title: string
          title_ar: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message: string
          message_ar?: string | null
          title: string
          title_ar?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean | null
          link?: string | null
          message?: string
          message_ar?: string | null
          title?: string
          title_ar?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      order_status_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_status: string
          old_status: string | null
          order_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_status: string
          old_status?: string | null
          order_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_status?: string
          old_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_notes: string | null
          bank_transfer_proof: string | null
          car_id: string | null
          created_at: string
          customer_id: string | null
          delivery_address: string | null
          delivery_city: string | null
          delivery_method: string | null
          delivery_notes: string | null
          id: string
          notes: string | null
          order_number: string
          paid_amount: number | null
          payment_method: string | null
          payment_status: string | null
          status: string | null
          total_amount: number
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          bank_transfer_proof?: string | null
          car_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_method?: string | null
          delivery_notes?: string | null
          id?: string
          notes?: string | null
          order_number: string
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount: number
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          bank_transfer_proof?: string | null
          car_id?: string | null
          created_at?: string
          customer_id?: string | null
          delivery_address?: string | null
          delivery_city?: string | null
          delivery_method?: string | null
          delivery_notes?: string | null
          id?: string
          notes?: string | null
          order_number?: string
          paid_amount?: number | null
          payment_method?: string | null
          payment_status?: string | null
          status?: string | null
          total_amount?: number
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_change_history: {
        Row: {
          changed_at: string
          changed_by: string
          id: string
          new_payment_method: string | null
          new_payment_status: string | null
          old_payment_method: string | null
          old_payment_status: string | null
          order_id: string
        }
        Insert: {
          changed_at?: string
          changed_by: string
          id?: string
          new_payment_method?: string | null
          new_payment_status?: string | null
          old_payment_method?: string | null
          old_payment_status?: string | null
          order_id: string
        }
        Update: {
          changed_at?: string
          changed_by?: string
          id?: string
          new_payment_method?: string | null
          new_payment_status?: string | null
          old_payment_method?: string | null
          old_payment_status?: string | null
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_change_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          created_at: string
          id: string
          notes: string | null
          order_id: string
          payment_method: string
          status: string | null
          stripe_payment_id: string | null
          transaction_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id: string
          payment_method: string
          status?: string | null
          stripe_payment_id?: string | null
          transaction_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          notes?: string | null
          order_id?: string
          payment_method?: string
          status?: string | null
          stripe_payment_id?: string | null
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          referral_code: string | null
          referral_earnings: number | null
          referred_by: string | null
          role: string | null
          total_referrals: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          role?: string | null
          total_referrals?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          referral_code?: string | null
          referral_earnings?: number | null
          referred_by?: string | null
          role?: string | null
          total_referrals?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      promotions: {
        Row: {
          coupon_code: string | null
          created_at: string
          description: string | null
          description_ar: string | null
          discount_type: string | null
          discount_value: number | null
          end_date: string | null
          id: string
          is_active: boolean | null
          max_price: number | null
          min_price: number | null
          name: string
          name_ar: string
          start_date: string | null
          target_brands: string[] | null
          target_cars: string[] | null
          type: string
          updated_at: string
          usage_count: number | null
          usage_limit: number | null
        }
        Insert: {
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name: string
          name_ar: string
          start_date?: string | null
          target_brands?: string[] | null
          target_cars?: string[] | null
          type: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Update: {
          coupon_code?: string | null
          created_at?: string
          description?: string | null
          description_ar?: string | null
          discount_type?: string | null
          discount_value?: number | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          max_price?: number | null
          min_price?: number | null
          name?: string
          name_ar?: string
          start_date?: string | null
          target_brands?: string[] | null
          target_cars?: string[] | null
          type?: string
          updated_at?: string
          usage_count?: number | null
          usage_limit?: number | null
        }
        Relationships: []
      }
      referrals: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          referral_code: string
          referred_id: string | null
          referrer_id: string
          reward_amount: number | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code: string
          referred_id?: string | null
          referrer_id: string
          reward_amount?: number | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string | null
          referrer_id?: string
          reward_amount?: number | null
          status?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          about_text: string | null
          about_text_ar: string | null
          accent_color: string | null
          address: string | null
          address_ar: string | null
          bank_account_name: string | null
          bank_account_number: string | null
          bank_iban: string | null
          bank_name: string | null
          bank_name_en: string | null
          created_at: string
          email: string | null
          facebook_url: string | null
          hero_image_url: string | null
          hero_overlay_opacity: string | null
          hero_type: string | null
          hero_video_url: string | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          marquee_enabled: boolean | null
          marquee_text: string | null
          marquee_text_ar: string | null
          phone: string | null
          primary_color: string | null
          secondary_color: string | null
          showroom_name: string | null
          showroom_name_en: string | null
          tiktok_url: string | null
          twitter_url: string | null
          updated_at: string
          whatsapp: string | null
          working_hours: string | null
          working_hours_ar: string | null
        }
        Insert: {
          about_text?: string | null
          about_text_ar?: string | null
          accent_color?: string | null
          address?: string | null
          address_ar?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_name_en?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          hero_image_url?: string | null
          hero_overlay_opacity?: string | null
          hero_type?: string | null
          hero_video_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          marquee_enabled?: boolean | null
          marquee_text?: string | null
          marquee_text_ar?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          showroom_name?: string | null
          showroom_name_en?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          working_hours?: string | null
          working_hours_ar?: string | null
        }
        Update: {
          about_text?: string | null
          about_text_ar?: string | null
          accent_color?: string | null
          address?: string | null
          address_ar?: string | null
          bank_account_name?: string | null
          bank_account_number?: string | null
          bank_iban?: string | null
          bank_name?: string | null
          bank_name_en?: string | null
          created_at?: string
          email?: string | null
          facebook_url?: string | null
          hero_image_url?: string | null
          hero_overlay_opacity?: string | null
          hero_type?: string | null
          hero_video_url?: string | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          marquee_enabled?: boolean | null
          marquee_text?: string | null
          marquee_text_ar?: string | null
          phone?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          showroom_name?: string | null
          showroom_name_en?: string | null
          tiktok_url?: string | null
          twitter_url?: string | null
          updated_at?: string
          whatsapp?: string | null
          working_hours?: string | null
          working_hours_ar?: string | null
        }
        Relationships: []
      }
      test_drive_bookings: {
        Row: {
          admin_notes: string | null
          booking_date: string
          booking_time: string
          car_id: string | null
          created_at: string
          customer_email: string | null
          customer_name: string
          customer_phone: string
          id: string
          notes: string | null
          status: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_notes?: string | null
          booking_date: string
          booking_time: string
          car_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name: string
          customer_phone: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_notes?: string | null
          booking_date?: string
          booking_time?: string
          car_id?: string | null
          created_at?: string
          customer_email?: string | null
          customer_name?: string
          customer_phone?: string
          id?: string
          notes?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "test_drive_bookings_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      wishlist: {
        Row: {
          car_id: string
          created_at: string
          id: string
          notify_on_price_drop: boolean | null
          user_id: string
        }
        Insert: {
          car_id: string
          created_at?: string
          id?: string
          notify_on_price_drop?: boolean | null
          user_id: string
        }
        Update: {
          car_id?: string
          created_at?: string
          id?: string
          notify_on_price_drop?: boolean | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlist_car_id_fkey"
            columns: ["car_id"]
            isOneToOne: false
            referencedRelation: "cars"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
