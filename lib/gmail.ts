import { google } from 'googleapis';
import { extractRewardsFromEmail } from './parsingRules';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI
);

export interface GmailMessage {
  id: string;
  threadId: string;
  snippet: string;
  payload: {
    headers: Array<{ name: string; value: string }>;
    body?: { data?: string };
    parts?: Array<{
      mimeType: string;
      body?: { data?: string };
      parts?: any[];
    }>;
  };
  internalDate: string;
}

export interface ExtractedReward {
  program: string;
  type: string;
  balance: number;
  balanceText: string;
  emailId: string;
  emailDate: Date;
  fromEmail: string;
}

export class GmailService {
  private gmail: any;

  constructor(accessToken: string, refreshToken?: string) {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });
    
    this.gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  }

  static getAuthUrl(): string {
    const scopes = ['https://www.googleapis.com/auth/gmail.readonly'];
    
    return oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: scopes,
      prompt: 'consent'
    });
  }

  static async getTokensFromCode(code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    return tokens;
  }

  async searchEmails(query: string, maxResults: number = 50): Promise<string[]> {
    try {
      const response = await this.gmail.users.messages.list({
        userId: 'me',
        q: query,
        maxResults
      });

      return response.data.messages?.map((msg: any) => msg.id) || [];
    } catch (error) {
      console.error('Error searching emails:', error);
      return [];
    }
  }

  async getMessage(messageId: string): Promise<GmailMessage | null> {
    try {
      const response = await this.gmail.users.messages.get({
        userId: 'me',
        id: messageId,
        format: 'full'
      });

      return response.data;
    } catch (error) {
      console.error('Error getting message:', error);
      return null;
    }
  }

  private extractTextFromMessage(message: GmailMessage): string {
    let text = '';

    const extractFromPart = (part: any): string => {
      if (part.body?.data) {
        return Buffer.from(part.body.data, 'base64').toString('utf-8');
      }
      
      if (part.parts) {
        return part.parts.map(extractFromPart).join('\n');
      }
      
      return '';
    };

    if (message.payload.body?.data) {
      text = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (message.payload.parts) {
      text = message.payload.parts.map(extractFromPart).join('\n');
    }

    return text;
  }

  private getHeaderValue(message: GmailMessage, headerName: string): string {
    const header = message.payload.headers.find(h => 
      h.name.toLowerCase() === headerName.toLowerCase()
    );
    return header?.value || '';
  }

  async scanForRewards(queries: string[], maxEmailsPerQuery: number = 20): Promise<{
    rewards: ExtractedReward[];
    emailsProcessed: number;
  }> {
    const allRewards: ExtractedReward[] = [];
    let totalEmailsProcessed = 0;
    const processedMessageIds = new Set<string>();

    for (const query of queries) {
      try {
        const messageIds = await this.searchEmails(query, maxEmailsPerQuery);
        
        for (const messageId of messageIds) {
          if (processedMessageIds.has(messageId)) {
            continue; // Skip duplicates
          }
          
          processedMessageIds.add(messageId);
          totalEmailsProcessed++;

          const message = await this.getMessage(messageId);
          if (!message) continue;

          const fromEmail = this.getHeaderValue(message, 'from');
          const emailDate = new Date(parseInt(message.internalDate));
          const emailBody = this.extractTextFromMessage(message);

          if (emailBody && fromEmail) {
            const extractedRewards = extractRewardsFromEmail(emailBody, fromEmail);
            
            for (const reward of extractedRewards) {
              allRewards.push({
                ...reward,
                emailId: messageId,
                emailDate,
                fromEmail
              });
            }
          }

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing query "${query}":`, error);
      }
    }

    return {
      rewards: allRewards,
      emailsProcessed: totalEmailsProcessed
    };
  }

  async getUserProfile() {
    try {
      const response = await this.gmail.users.getProfile({
        userId: 'me'
      });
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}