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
                    }
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
                    }
                ]
            }
            contact_messages: {
                Row: {
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
                    created_at?: string
                    email?: string | null
                    id?: string
                    message?: string
                    name?: string
                    phone?: string
                    status?: string | null
                    subject?: string | null
                }
                Relationships: []
            }
            customers: {
                Row: {
                    created_at: string
                    email: string | null
                    id: string
                    name: string
                    phone: string
                    updated_at: string
                    user_id: string | null
                    whatsapp: string | null
                }
                Insert: {
                    created_at?: string
                    email?: string | null
                    id?: string
                    name: string
                    phone: string
                    updated_at?: string
                    user_id?: string | null
                    whatsapp?: string | null
                }
                Update: {
                    created_at?: string
                    email?: string | null
                    id?: string
                    name?: string
                    phone?: string
                    updated_at?: string
                    user_id?: string | null
                    whatsapp?: string | null
                }
                Relationships: []
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
            orders: {
                Row: {
                    car_id: string | null
                    created_at: string
                    customer_id: string | null
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
                    car_id?: string | null
                    created_at?: string
                    customer_id?: string | null
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
                    car_id?: string | null
                    created_at?: string
                    customer_id?: string | null
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
                    }
                ]
            }
            requested_cars: {
                Row: {
                    assigned_to: string | null
                    brand_name: string
                    brand_name_ar: string | null
                    completed_at: string | null
                    created_at: string
                    customer_email: string | null
                    customer_name: string
                    customer_phone: string
                    customer_whatsapp: string | null
                    fuel_type_preference: string | null
                    id: string
                    last_contact_date: string | null
                    max_budget: number | null
                    model: string
                    model_ar: string | null
                    next_follow_up_date: string | null
                    notes: string | null
                    notes_ar: string | null
                    preferred_color: string | null
                    preferred_color_ar: string | null
                    priority: string | null
                    status: string | null
                    transmission_preference: string | null
                    updated_at: string
                    year: number | null
                }
                Insert: {
                    assigned_to?: string | null
                    brand_name: string
                    brand_name_ar?: string | null
                    completed_at?: string | null
                    created_at?: string
                    customer_email?: string | null
                    customer_name: string
                    customer_phone: string
                    customer_whatsapp?: string | null
                    fuel_type_preference?: string | null
                    id?: string
                    last_contact_date?: string | null
                    max_budget?: number | null
                    model: string
                    model_ar?: string | null
                    next_follow_up_date?: string | null
                    notes?: string | null
                    notes_ar?: string | null
                    preferred_color?: string | null
                    preferred_color_ar?: string | null
                    priority?: string | null
                    status?: string | null
                    transmission_preference?: string | null
                    updated_at?: string
                    year?: number | null
                }
                Update: {
                    assigned_to?: string | null
                    brand_name?: string
                    brand_name_ar?: string | null
                    completed_at?: string | null
                    created_at?: string
                    customer_email?: string | null
                    customer_name?: string
                    customer_phone?: string
                    customer_whatsapp?: string | null
                    fuel_type_preference?: string | null
                    id?: string
                    last_contact_date?: string | null
                    max_budget?: number | null
                    model?: string
                    model_ar?: string | null
                    next_follow_up_date?: string | null
                    notes?: string | null
                    notes_ar?: string | null
                    preferred_color?: string | null
                    preferred_color_ar?: string | null
                    priority?: string | null
                    status?: string | null
                    transmission_preference?: string | null
                    updated_at?: string
                    year?: number | null
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
                    created_at: string
                    email: string | null
                    facebook_url: string | null
                    hero_image_url: string | null
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
                    created_at?: string
                    email?: string | null
                    facebook_url?: string | null
                    hero_image_url?: string | null
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
                    created_at?: string
                    email?: string | null
                    facebook_url?: string | null
                    hero_image_url?: string | null
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
            settings_history: {
                Row: {
                    changed_at: string
                    changed_by: string | null
                    field_name: string
                    id: string
                    new_value: string | null
                    old_value: string | null
                    setting_id: string | null
                }
                Insert: {
                    changed_at?: string
                    changed_by?: string | null
                    field_name: string
                    id?: string
                    new_value?: string | null
                    old_value?: string | null
                    setting_id?: string | null
                }
                Update: {
                    changed_at?: string
                    changed_by?: string | null
                    field_name?: string
                    id?: string
                    new_value?: string | null
                    old_value?: string | null
                    setting_id?: string | null
                }
                Relationships: []
            }
            showroom_changes: {
                Row: {
                    applied_at: string | null
                    change_reason: string | null
                    change_reason_ar: string | null
                    changed_by: string | null
                    city: string | null
                    city_ar: string | null
                    country: string | null
                    country_ar: string | null
                    cover_image_url: string | null
                    created_at: string
                    default_theme: string | null
                    gallery_images: string[] | null
                    id: string
                    is_active: boolean | null
                    latitude: number | null
                    location: string | null
                    location_ar: string | null
                    logo_url: string | null
                    longitude: number | null
                    phone: string | null
                    showroom_name: string | null
                    showroom_name_ar: string | null
                    whatsapp: string | null
                }
                Insert: {
                    applied_at?: string | null
                    change_reason?: string | null
                    change_reason_ar?: string | null
                    changed_by?: string | null
                    city?: string | null
                    city_ar?: string | null
                    country?: string | null
                    country_ar?: string | null
                    cover_image_url?: string | null
                    created_at?: string
                    default_theme?: string | null
                    gallery_images?: string[] | null
                    id?: string
                    is_active?: boolean | null
                    latitude?: number | null
                    location?: string | null
                    location_ar?: string | null
                    logo_url?: string | null
                    longitude?: number | null
                    phone?: string | null
                    showroom_name?: string | null
                    showroom_name_ar?: string | null
                    whatsapp?: string | null
                }
                Update: {
                    applied_at?: string | null
                    change_reason?: string | null
                    change_reason_ar?: string | null
                    changed_by?: string | null
                    city?: string | null
                    city_ar?: string | null
                    country?: string | null
                    country_ar?: string | null
                    cover_image_url?: string | null
                    created_at?: string
                    default_theme?: string | null
                    gallery_images?: string[] | null
                    id?: string
                    is_active?: boolean | null
                    latitude?: number | null
                    location?: string | null
                    location_ar?: string | null
                    logo_url?: string | null
                    longitude?: number | null
                    phone?: string | null
                    showroom_name?: string | null
                    showroom_name_ar?: string | null
                    whatsapp?: string | null
                }
                Relationships: []
            }
            user_roles: {
                Row: {
                    created_at: string
                    id: string
                    role: string
                    user_id: string
                }
                Insert: {
                    created_at?: string
                    id?: string
                    role: string
                    user_id: string
                }
                Update: {
                    created_at?: string
                    id?: string
                    role?: string
                    user_id?: string
                }
                Relationships: []
            }
            wishlist: {
                Row: {
                    car_id: string
                    created_at: string
                    id: string
                    user_id: string
                }
                Insert: {
                    car_id: string
                    created_at?: string
                    id?: string
                    user_id: string
                }
                Update: {
                    car_id?: string
                    created_at?: string
                    id?: string
                    user_id?: string
                }
                Relationships: [
                    {
                        foreignKeyName: "wishlist_car_id_fkey"
                        columns: ["car_id"]
                        isOneToOne: false
                        referencedRelation: "cars"
                        referencedColumns: ["id"]
                    }
                ]
            }
        }
        Views: {
            [_ in never]: never
        }
        Functions: {
            [_ in never]: never
        }
        Enums: {
            app_role: "admin" | "moderator" | "user"
        }
        CompositeTypes: {
            [_ in never]: never
        }
    }
}

type DefaultSchema = Database["public"]

export type Tables<
    DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    TableName extends DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
    ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
    EnumName extends DefaultSchemaEnumNameOrOptions extends {
        schema: keyof Database
    }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
}
    ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
    : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export const Constants = {
    public: {
        Enums: {
            app_role: ["admin", "moderator", "user"],
        },
    },
} as const
