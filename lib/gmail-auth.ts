import { google } from 'googleapis';

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  process.env.GOOGLE_REDIRECT_URI || 'http://localhost:3000/api/auth/callback'
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

export interface ParsedReward {
  program: string;
  type: string;
  balance: number;
  balanceText: string;
  emailId: string;
  emailDate: Date;
  fromEmail: string;
  estimatedValue: number;
}

export class GmailAuthService {
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

  static async scanGmailForRewards(accessToken: string, refreshToken?: string): Promise<{
    rewards: ParsedReward[];
    emailsProcessed: number;
    totalValue: number;
  }> {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    try {
      // Search for reward-related emails
      const searchQuery = 'subject:(miles OR points OR rewards OR balance OR statement) OR from:(delta.com OR united.com OR aa.com OR marriott.com OR hilton.com OR chase.com OR americanexpress.com)';
      
      const response = await gmail.users.messages.list({
        userId: 'me',
        q: searchQuery,
        maxResults: 50
      });

      const messageIds = response.data.messages?.map(msg => msg.id!) || [];
      const rewards: ParsedReward[] = [];
      let emailsProcessed = 0;

      // Process each message
      for (const messageId of messageIds.slice(0, 20)) { // Limit for demo
        try {
          const message = await gmail.users.messages.get({
            userId: 'me',
            id: messageId,
            format: 'full'
          });

          emailsProcessed++;
          const parsedRewards = await parseEmailForRewards(message.data as GmailMessage);
          rewards.push(...parsedRewards);

          // Add small delay to avoid rate limiting
          await new Promise(resolve => setTimeout(resolve, 100));
        } catch (error) {
          console.error(`Error processing message ${messageId}:`, error);
        }
      }

      // Calculate total estimated value
      const totalValue = rewards.reduce((sum, reward) => sum + reward.estimatedValue, 0);

      return {
        rewards,
        emailsProcessed,
        totalValue: Math.round(totalValue)
      };
    } catch (error) {
      console.error('Gmail scan error:', error);
      throw new Error('Failed to scan Gmail for rewards');
    }
  }

  static async getUserProfile(accessToken: string) {
    oauth2Client.setCredentials({ access_token: accessToken });
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    
    try {
      const response = await gmail.users.getProfile({ userId: 'me' });
      return response.data;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }
}

async function parseEmailForRewards(message: GmailMessage): Promise<ParsedReward[]> {
  const rewards: ParsedReward[] = [];
  
  // Extract email content
  const fromEmail = getHeaderValue(message, 'from');
  const subject = getHeaderValue(message, 'subject');
  const emailDate = new Date(parseInt(message.internalDate));
  const emailBody = extractTextFromMessage(message);

  // Mock parsing logic - in real implementation, use sophisticated regex patterns
  const mockRewards = generateMockRewards(fromEmail, subject, emailBody, message.id, emailDate);
  rewards.push(...mockRewards);

  return rewards;
}

function getHeaderValue(message: GmailMessage, headerName: string): string {
  const header = message.payload.headers.find(h => 
    h.name.toLowerCase() === headerName.toLowerCase()
  );
  return header?.value || '';
}

function extractTextFromMessage(message: GmailMessage): string {
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

function generateMockRewards(fromEmail: string, subject: string, body: string, emailId: string, emailDate: Date): ParsedReward[] {
  const rewards: ParsedReward[] = [];
  
  // Generate realistic mock data based on email sender
  const domain = fromEmail.split('@')[1]?.toLowerCase() || '';
  
  if (domain.includes('delta.com') || subject.toLowerCase().includes('delta')) {
    rewards.push({
      program: 'Delta SkyMiles',
      type: 'Miles',
      balance: Math.floor(Math.random() * 50000) + 5000,
      balanceText: '12,921',
      emailId,
      emailDate,
      fromEmail,
      estimatedValue: 387
    });
  }
  
  if (domain.includes('marriott.com') || subject.toLowerCase().includes('marriott')) {
    rewards.push({
      program: 'Marriott Bonvoy',
      type: 'Hotel Points',
      balance: Math.floor(Math.random() * 100000) + 10000,
      balanceText: '48,000',
      emailId,
      emailDate,
      fromEmail,
      estimatedValue: 480
    });
  }
  
  if (domain.includes('chase.com') || subject.toLowerCase().includes('chase')) {
    rewards.push({
      program: 'Chase Ultimate Rewards',
      type: 'Credit Card Points',
      balance: Math.floor(Math.random() * 80000) + 10000,
      balanceText: '35,420',
      emailId,
      emailDate,
      fromEmail,
      estimatedValue: 420
    });
  }

  // Add more mock rewards based on common patterns
  if (Math.random() > 0.7) { // 30% chance for additional rewards
    const additionalRewards = [
      {
        program: 'Hilton Honors',
        type: 'Hotel Points',
        balance: 22100,
        balanceText: '22,100',
        emailId,
        emailDate,
        fromEmail,
        estimatedValue: 221
      },
      {
        program: 'United MileagePlus',
        type: 'Miles',
        balance: 8750,
        balanceText: '8,750',
        emailId,
        emailDate,
        fromEmail,
        estimatedValue: 175
      },
      {
        program: 'Capital One Venture',
        type: 'Travel Credit',
        balance: 9750,
        balanceText: '$97.50',
        emailId,
        emailDate,
        fromEmail,
        estimatedValue: 97
      }
    ];
    
    rewards.push(additionalRewards[Math.floor(Math.random() * additionalRewards.length)]);
  }
  
  return rewards;
}