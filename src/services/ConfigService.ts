/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SystemConfig {
  resendApiKey: string;
  turnstileSiteKey: string;
  recaptchaSiteKey: string;
  emailProvider: 'resend' | 'mock';
  isDevMode: boolean;
  warnings: string[];
  enableTurnstile: boolean;
  enableRecaptcha: boolean;
}

class ConfigService {
  private config: SystemConfig;

  constructor() {
    this.config = this.loadConfig();
  }

  private loadConfig(): SystemConfig {
    const warnings: string[] = [];
    
    // Check for environment variables (Vite-exposed)
    const metaEnv = (import.meta as any).env || {};
    const resendApiKey = (metaEnv.VITE_RESEND_API_KEY as string) || '';
    const turnstileSiteKey = (metaEnv.VITE_TURNSTILE_SITE_KEY as string) || '';
    const recaptchaSiteKey = (metaEnv.VITE_RECAPTCHA_SITE_KEY as string) || '';

    // Feature Flags (Default to false as requested)
    const enableTurnstile = (metaEnv.VITE_ENABLE_TURNSTILE === 'true' || metaEnv.ENABLE_TURNSTILE === 'true' || false);
    const enableRecaptcha = (metaEnv.VITE_ENABLE_RECAPTCHA === 'true' || metaEnv.ENABLE_RECAPTCHA === 'true' || false);

    let emailProvider: 'resend' | 'mock' = 'mock';
    if (resendApiKey) {
      emailProvider = 'resend';
    } else {
      warnings.push('No Resend API key found. Defaulting to local Outgoing Email Queue.');
    }

    if (!turnstileSiteKey && !recaptchaSiteKey) {
      warnings.push('Turnstile or reCAPTCHA site keys are missing. Running in simulated bypass mode.');
    }

    return {
      resendApiKey,
      turnstileSiteKey,
      recaptchaSiteKey,
      emailProvider,
      isDevMode: metaEnv.DEV || true,
      warnings,
      enableTurnstile,
      enableRecaptcha
    };
  }

  public getConfig(): SystemConfig {
    return this.config;
  }

  /**
   * Checks if CAPTCHA is active based on keys and feature flags.
   * If feature flags are false or keys are missing, CAPTCHA is automatically disabled.
   */
  public isCaptchaActive(): boolean {
    const hasKeys = !!(this.config.turnstileSiteKey || this.config.recaptchaSiteKey);
    const isEnabled = this.config.enableTurnstile || this.config.enableRecaptcha;
    return hasKeys && isEnabled;
  }

  /**
   * Helper to verify if CAPTCHA is configured.
   */
  public isCaptchaConfigured(): boolean {
    return !!(this.config.turnstileSiteKey || this.config.recaptchaSiteKey);
  }

  /**
   * Helper to verify if dynamic API integrations are present
   */
  public hasRealEmailProvider(): boolean {
    return this.config.emailProvider !== 'mock';
  }
}

export const configService = new ConfigService();
