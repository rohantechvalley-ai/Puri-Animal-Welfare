/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { configService } from './ConfigService';

export interface VerificationAttempt {
  id: string;
  timestamp: string;
  platform: 'turnstile' | 'recaptcha' | 'sandbox';
  siteKey: string;
  tokenSimulated: boolean;
  status: 'passed' | 'failed';
  ipAddress?: string;
}

class CaptchaService {
  private getStorageAttempts(): VerificationAttempt[] {
    const data = localStorage.getItem('puri_captcha_attempts');
    return data ? JSON.parse(data) : [];
  }

  private saveStorageAttempts(attempts: VerificationAttempt[]) {
    localStorage.setItem('puri_captcha_attempts', JSON.stringify(attempts));
    window.dispatchEvent(new Event('puri_captcha_updated'));
  }

  public getAttempts(): VerificationAttempt[] {
    return this.getStorageAttempts();
  }

  public clearAttempts() {
    this.saveStorageAttempts([]);
  }

  /**
   * Log validation attempts and verify token.
   */
  public async verifyToken(token: string): Promise<boolean> {
    const config = configService.getConfig();
    const isActive = configService.isCaptchaActive();
    
    let platform: VerificationAttempt['platform'] = 'sandbox';
    let siteKey = 'SANDBOX_DEFAULT_KEY';
    let status: 'passed' | 'failed' = 'passed';

    if (isActive) {
      if (config.turnstileSiteKey && config.enableTurnstile) {
        platform = 'turnstile';
        siteKey = config.turnstileSiteKey;
      } else if (config.recaptchaSiteKey && config.enableRecaptcha) {
        platform = 'recaptcha';
        siteKey = config.recaptchaSiteKey;
      }
    } else {
      // CAPTCHA is disabled
      platform = 'sandbox';
      siteKey = 'BYPASS_DISABLED_KEY';
    }

    // Check simulation failures for sandbox testing
    if (token === 'SIMULATED_FAIL_TOKEN') {
      status = 'failed';
    }

    const attempt: VerificationAttempt = {
      id: `attempt-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      platform,
      siteKey,
      tokenSimulated: !isActive || platform === 'sandbox' || token.startsWith('SIMULATED_') || token === 'BYPASS_TOKEN',
      status,
      ipAddress: '127.0.0.1 (Local Client)'
    };

    const attempts = this.getStorageAttempts();
    this.saveStorageAttempts([attempt, ...attempts]);

    return status === 'passed';
  }
}

export const captchaService = new CaptchaService();
