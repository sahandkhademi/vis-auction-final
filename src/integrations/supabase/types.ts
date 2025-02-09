export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      artists: {
        Row: {
          bio: string | null
          created_at: string
          id: string
          name: string
          profile_image_url: string | null
          updated_at: string
        }
        Insert: {
          bio?: string | null
          created_at?: string
          id?: string
          name: string
          profile_image_url?: string | null
          updated_at?: string
        }
        Update: {
          bio?: string | null
          created_at?: string
          id?: string
          name?: string
          profile_image_url?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      artwork_views: {
        Row: {
          artwork_id: string
          id: string
          session_id: string | null
          viewed_at: string | null
          viewer_id: string | null
        }
        Insert: {
          artwork_id: string
          id?: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Update: {
          artwork_id?: string
          id?: string
          session_id?: string | null
          viewed_at?: string | null
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artwork_views_artwork_id_fkey"
            columns: ["artwork_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      artworks: {
        Row: {
          artist: string
          artist_id: string | null
          completion_status: string | null
          created_at: string
          created_by: string | null
          created_year: string | null
          current_price: number | null
          delivery_status: string | null
          description: string | null
          dimensions: string | null
          end_date: string | null
          format: string | null
          id: string
          image_url: string | null
          payment_intent_id: string | null
          payment_status: string | null
          starting_price: number
          status: string | null
          title: string
          updated_at: string
          winner_id: string | null
        }
        Insert: {
          artist: string
          artist_id?: string | null
          completion_status?: string | null
          created_at?: string
          created_by?: string | null
          created_year?: string | null
          current_price?: number | null
          delivery_status?: string | null
          description?: string | null
          dimensions?: string | null
          end_date?: string | null
          format?: string | null
          id?: string
          image_url?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          starting_price: number
          status?: string | null
          title: string
          updated_at?: string
          winner_id?: string | null
        }
        Update: {
          artist?: string
          artist_id?: string | null
          completion_status?: string | null
          created_at?: string
          created_by?: string | null
          created_year?: string | null
          current_price?: number | null
          delivery_status?: string | null
          description?: string | null
          dimensions?: string | null
          end_date?: string | null
          format?: string | null
          id?: string
          image_url?: string | null
          payment_intent_id?: string | null
          payment_status?: string | null
          starting_price?: number
          status?: string | null
          title?: string
          updated_at?: string
          winner_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "artworks_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "artworks_winner_id_fkey"
            columns: ["winner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          error_message: string | null
          file_name: string | null
          file_size: number | null
          id: string
          started_at: string | null
          status: string
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          error_message?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status: string
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          error_message?: string | null
          file_name?: string | null
          file_size?: number | null
          id?: string
          started_at?: string | null
          status?: string
        }
        Relationships: []
      }
      bids: {
        Row: {
          amount: number
          auction_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          amount: number
          auction_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          amount?: number
          auction_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bids_auction_id_fkey"
            columns: ["auction_id"]
            isOneToOne: false
            referencedRelation: "artworks"
            referencedColumns: ["id"]
          },
        ]
      }
      homepage_banners: {
        Row: {
          active: boolean | null
          autoplay: boolean | null
          autoplay_interval: number | null
          button_link: string | null
          button_text: string | null
          created_at: string
          description: string | null
          display_order: number | null
          id: string
          image_url: string
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          autoplay?: boolean | null
          autoplay_interval?: number | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url: string
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          autoplay?: boolean | null
          autoplay_interval?: number | null
          button_link?: string | null
          button_text?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          id?: string
          image_url?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          auction_ending_notifications: boolean | null
          auction_won_notifications: boolean | null
          created_at: string
          marketing_notifications: boolean | null
          outbid_notifications: boolean | null
          user_id: string
        }
        Insert: {
          auction_ending_notifications?: boolean | null
          auction_won_notifications?: boolean | null
          created_at?: string
          marketing_notifications?: boolean | null
          outbid_notifications?: boolean | null
          user_id: string
        }
        Update: {
          auction_ending_notifications?: boolean | null
          auction_won_notifications?: boolean | null
          created_at?: string
          marketing_notifications?: boolean | null
          outbid_notifications?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          id: string
          is_admin: boolean | null
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id: string
          is_admin?: boolean | null
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          id?: string
          is_admin?: boolean | null
          username?: string | null
        }
        Relationships: []
      }
      user_payment_methods: {
        Row: {
          card_brand: string
          created_at: string
          id: string
          is_valid: boolean | null
          last_four: string
          stripe_payment_method_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          last_four: string
          stripe_payment_method_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string
          created_at?: string
          id?: string
          is_valid?: boolean | null
          last_four?: string
          stripe_payment_method_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      website_visits: {
        Row: {
          device_type: string | null
          id: string
          ip_address: string | null
          path: string | null
          platform: string | null
          session_duration: number | null
          session_id: string | null
          user_agent: string | null
          visited_at: string | null
          visitor_id: string | null
        }
        Insert: {
          device_type?: string | null
          id?: string
          ip_address?: string | null
          path?: string | null
          platform?: string | null
          session_duration?: number | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string | null
          visitor_id?: string | null
        }
        Update: {
          device_type?: string | null
          id?: string
          ip_address?: string | null
          path?: string | null
          platform?: string | null
          session_duration?: number | null
          session_id?: string | null
          user_agent?: string | null
          visited_at?: string | null
          visitor_id?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      commission_earnings: {
        Row: {
          commission_earned: number | null
          month: string | null
          total_sales: number | null
          total_volume: number | null
        }
        Relationships: []
      }
      user_retention: {
        Row: {
          registered_visitors: number | null
          total_visitors: number | null
          visit_date: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_highest_bid: {
        Args: {
          auction_id: string
        }
        Returns: number
      }
      handle_abandoned_wins: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      initiate_backup: {
        Args: {
          p_backup_type: string
        }
        Returns: string
      }
      log_backup_operation: {
        Args: {
          p_backup_type: string
          p_status: string
          p_file_name?: string
          p_file_size?: number
          p_error_message?: string
        }
        Returns: string
      }
      track_website_visit: {
        Args: {
          p_session_id: string
          p_path: string
          p_user_agent: string
        }
        Returns: string
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
