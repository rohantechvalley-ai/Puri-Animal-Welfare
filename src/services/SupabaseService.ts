/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  serviceRoleKey: string;
  isConnected: boolean;
}

class SupabaseService {
  private client: SupabaseClient | null = null;
  private url: string;
  private anonKey: string;
  private serviceRoleKey: string;

  constructor() {
    // Default to the provided credentials
    const defaultUrl = 'https://aqhanoizlnbusoswvych.supabase.co';
    const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGFub2l6bG5idXNvc3d2eWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTY5MDgsImV4cCI6MjA5OTkzMjkwOH0.QdySYwSsaqjub7PXIRFtQy6GQTYxiyY5cttYAjdkA60';
    const defaultServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGFub2l6bG5idXNvc3d2eWN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM1NjkwOCwiZXhwIjoyMDk5OTMyOTA4fQ.Wj1T1u5aRqu8iPybTrnj2yIOSX8rOXp3H9At0pFaS6Q';

    // Load from local storage if overridden, else environment, else defaults
    const metaEnv = (import.meta as any).env || {};
    
    this.url = localStorage.getItem('supabase_url') || metaEnv.VITE_SUPABASE_URL || defaultUrl;
    this.anonKey = localStorage.getItem('supabase_anon_key') || metaEnv.VITE_SUPABASE_ANON_KEY || defaultAnonKey;
    this.serviceRoleKey = localStorage.getItem('supabase_service_role_key') || metaEnv.SUPABASE_SERVICE_ROLE_KEY || defaultServiceRoleKey;

    this.initialize();
  }

  public initialize(url?: string, anonKey?: string, serviceRoleKey?: string) {
    if (url) {
      this.url = url;
      localStorage.setItem('supabase_url', url);
    }
    if (anonKey) {
      this.anonKey = anonKey;
      localStorage.setItem('supabase_anon_key', anonKey);
    }
    if (serviceRoleKey !== undefined) {
      this.serviceRoleKey = serviceRoleKey;
      localStorage.setItem('supabase_service_role_key', serviceRoleKey);
    }

    if (this.url && this.anonKey) {
      try {
        this.client = createClient(this.url, this.anonKey, {
          auth: {
            persistSession: true,
            autoRefreshToken: true,
          }
        });
      } catch (err) {
        console.error('Failed to initialize Supabase client:', err);
        this.client = null;
      }
    } else {
      this.client = null;
    }
  }

  public getClient(): SupabaseClient | null {
    return this.client;
  }

  public getServiceRoleClient(): SupabaseClient | null {
    if (this.url && this.serviceRoleKey) {
      try {
        return createClient(this.url, this.serviceRoleKey, {
          auth: {
            persistSession: false,
          }
        });
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  public getConfig(): SupabaseConfig {
    return {
      url: this.url,
      anonKey: this.anonKey,
      serviceRoleKey: this.serviceRoleKey,
      isConnected: this.client !== null,
    };
  }

  /**
   * Tests connection to Supabase by reading the public profiles table
   */
  public async testConnection(): Promise<{ success: boolean; message: string; latencyMs?: number }> {
    if (!this.client) {
      return { success: false, message: 'Supabase client is not initialized.' };
    }

    const start = Date.now();
    try {
      // Perform a lightweight query to test
      const { data, error } = await this.client.from('profiles').select('id').limit(1);
      
      const latencyMs = Date.now() - start;

      if (error) {
        // If the table doesn't exist yet, but we connected, that's still a success!
        if (error.code === 'P0001' || error.message?.includes('does not exist')) {
          return { 
            success: true, 
            message: 'Successfully connected to Supabase, but schema tables are not yet created. Run the migration script.',
            latencyMs
          };
        }
        return { success: false, message: `Connected with error: ${error.message} (Code: ${error.code})` };
      }

      return { 
        success: true, 
        message: 'Successfully connected and verified database access to "profiles" table.', 
        latencyMs 
      };
    } catch (err: any) {
      return { success: false, message: `Connection failed: ${err.message || err}` };
    }
  }

  /**
   * Push local mock state to Supabase using either Anon client or Service Role client
   */
  public async pushTableData(tableName: string, records: any[]): Promise<{ success: boolean; upserted: number; error?: string }> {
    const client = this.getServiceRoleClient() || this.client;
    if (!client) {
      return { success: false, upserted: 0, error: 'Database client not initialized.' };
    }

    if (!records || records.length === 0) {
      return { success: true, upserted: 0 };
    }

    try {
      // Map structures to fit Supabase table schemas if needed
      const mappedRecords = records.map(r => {
        const copy = { ...r };
        // Replace non-matching primary keys or handle standard formats
        return copy;
      });

      const { data, error } = await client.from(tableName).upsert(mappedRecords, { onConflict: 'id' });
      
      if (error) {
        return { success: false, upserted: 0, error: error.message };
      }

      return { success: true, upserted: records.length };
    } catch (err: any) {
      return { success: false, upserted: 0, error: err.message || err };
    }
  }

  /**
   * Pull records from Supabase cloud database
   */
  public async pullTableData(tableName: string): Promise<{ success: boolean; data?: any[]; error?: string }> {
    if (!this.client) {
      return { success: false, error: 'Database client not initialized.' };
    }

    try {
      const { data, error } = await this.client.from(tableName).select('*');
      
      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true, data: data || [] };
    } catch (err: any) {
      return { success: false, error: err.message || err };
    }
  }

  /**
   * Reset local storage to the Supabase defaults
   */
  public resetToDefaults() {
    localStorage.removeItem('supabase_url');
    localStorage.removeItem('supabase_anon_key');
    localStorage.removeItem('supabase_service_role_key');
    
    const defaultUrl = 'https://aqhanoizlnbusoswvych.supabase.co';
    const defaultAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGFub2l6bG5idXNvc3d2eWN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODQzNTY5MDgsImV4cCI6MjA5OTkzMjkwOH0.QdySYwSsaqjub7PXIRFtQy6GQTYxiyY5cttYAjdkA60';
    const defaultServiceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFxaGFub2l6bG5idXNvc3d2eWN5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4NDM1NjkwOCwiZXhwIjoyMDk5OTMyOTA4fQ.Wj1T1u5aRqu8iPybTrnj2yIOSX8rOXp3H9At0pFaS6Q';

    this.url = defaultUrl;
    this.anonKey = defaultAnonKey;
    this.serviceRoleKey = defaultServiceRoleKey;
    this.initialize();
  }
}

export const supabaseService = new SupabaseService();
