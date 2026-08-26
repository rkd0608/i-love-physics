export type TopicStatus = "want" | "learning" | "learned";

export interface Database {
  public: {
    Tables: {
      collection_items: {
        Row: {
          added_at: string;
          collection_id: string;
          id: string;
          position: number;
          topic_slug: string;
        };
        Insert: {
          added_at?: string;
          collection_id: string;
          id?: string;
          position?: number;
          topic_slug: string;
        };
        Update: {
          added_at?: string;
          collection_id?: string;
          id?: string;
          position?: number;
          topic_slug?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collection_items_collection_id_fkey";
            columns: ["collection_id"];
            isOneToOne: false;
            referencedRelation: "collections";
            referencedColumns: ["id"];
          },
        ];
      };
      collections: {
        Row: {
          created_at: string;
          description: string | null;
          id: string;
          is_public: boolean;
          owner_id: string;
          position: number;
          title: string;
          updated_at: string;
        };
        Insert: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          owner_id: string;
          position?: number;
          title: string;
          updated_at?: string;
        };
        Update: {
          created_at?: string;
          description?: string | null;
          id?: string;
          is_public?: boolean;
          owner_id?: string;
          position?: number;
          title?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "collections_owner_id_fkey";
            columns: ["owner_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      content_proposals: {
        Row: {
          created_at: string;
          domain: string;
          id: string;
          proposed_by: string | null;
          summary: string;
          title: string;
        };
        Insert: {
          created_at?: string;
          domain: string;
          id?: string;
          proposed_by?: string | null;
          summary: string;
          title: string;
        };
        Update: {
          created_at?: string;
          domain?: string;
          id?: string;
          proposed_by?: string | null;
          summary?: string;
          title?: string;
        };
        Relationships: [
          {
            foreignKeyName: "content_proposals_proposed_by_fkey";
            columns: ["proposed_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      profiles: {
        Row: {
          created_at: string;
          display_name: string | null;
          id: string;
        };
        Insert: {
          created_at?: string;
          display_name?: string | null;
          id: string;
        };
        Update: {
          created_at?: string;
          display_name?: string | null;
          id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey";
            columns: ["id"];
            isOneToOne: true;
            referencedRelation: "users";
            referencedColumns: ["id"];
          },
        ];
      };
      topic_progress: {
        Row: {
          status: TopicStatus;
          topic_slug: string;
          updated_at: string;
          user_id: string;
        };
        Insert: {
          status: TopicStatus;
          topic_slug: string;
          updated_at?: string;
          user_id: string;
        };
        Update: {
          status?: TopicStatus;
          topic_slug?: string;
          updated_at?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "topic_progress_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
      votes: {
        Row: {
          created_at: string;
          proposal_id: string;
          user_id: string;
        };
        Insert: {
          created_at?: string;
          proposal_id: string;
          user_id: string;
        };
        Update: {
          created_at?: string;
          proposal_id?: string;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "votes_proposal_id_fkey";
            columns: ["proposal_id"];
            isOneToOne: false;
            referencedRelation: "content_proposals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "votes_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Row"];

export type TablesInsert<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Insert"];

export type TablesUpdate<
  TableName extends keyof PublicSchema["Tables"],
> = PublicSchema["Tables"][TableName]["Update"];
