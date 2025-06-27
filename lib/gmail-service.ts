import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

const oauth2Client = new google.auth.OAuth2(
  process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/google/callback`
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

// Enhanced Reward interface with debugging info
export interface Reward {
  airline: string;
  miles: number;
  flightDate?: string;
  emailId: string;
  subject: string;
  // New debugging fields
  sourceParser?: string;
  confidenceScore?: number;
  matchedPatterns?: string[];
  debugInfo?: {
    senderDomain?: string;
    bodyLength?: number;
    hasTextBody?: boolean;
    hasHtmlBody?: boolean;
  };
}

// Skip reason for logging
export interface SkippedEmail {
  emailId: string;
  subject: string;
  from: string;
  reason: string;
  details?: string;
}

export interface AirlineReward {
  airline: string;
  program: string;
  miles: number;
  milesText: string;
  flightDate?: string;
  flightNumber?: string;
  route?: string;
  bookingClass?: string;
  emailId: string;
  emailDate: Date;
  fromEmail: string;
  subject: string;
  estimatedValue: number;
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

// Airline-specific configuration with enabled flag
const AIRLINE_CONFIG = {
  united: {
    enabled: true,
    domains: ['united.com', 'mileageplus.com'],
    program: 'United MileagePlus',
    valuePerMile: 0.012,
    patterns: {
      subject: [
        /mileageplus activity/i,
        /miles earned/i,
        /flight activity/i,
        /your united flight/i,
        /mileageplus statement/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*(?:award\s*)?miles?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*(?:award\s*)?miles/i,
          /\+\s*(\d{1,3}(?:,\d{3})*)\s*miles/i,
          /miles earned[:\s]+(\d{1,3}(?:,\d{3})*)/i,
          /you(?:'ve)?\s+earned\s+(\d{1,3}(?:,\d{3})*)\s+(?:award\s+)?miles/i
        ],
        flightInfo: [
          /flight\s*(\w+\d+)/i,
          /confirmation\s*(?:code|number)[:\s]*(\w{6})/i,
          /from\s*([A-Z]{3})\s*to\s*([A-Z]{3})/i
        ],
        date: [
          /(?:flight|travel)\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
          /(?:departed|departure)[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  delta: {
    enabled: true,
    domains: ['delta.com', 'news.delta.com', 'skymiles.com'],
    program: 'Delta SkyMiles',
    valuePerMile: 0.012,
    patterns: {
      subject: [
        /skymiles statement/i,
        /miles earned/i,
        /your delta flight/i,
        /flight activity/i,
        /skymiles activity/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*miles?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*skymiles/i,
          /\+\s*(\d{1,3}(?:,\d{3})*)\s*(?:sky)?miles/i,
          /total miles earned[:\s]+(\d{1,3}(?:,\d{3})*)/i,
          /you(?:'ve)?\s+earned\s+(\d{1,3}(?:,\d{3})*)\s+skymiles/i
        ],
        flightInfo: [
          /flight\s*(?:number\s*)?(\w+\s*\d+)/i,
          /confirmation\s*(?:number)?[:\s]*(\w{6})/i,
          /([A-Z]{3})\s*(?:to|-|→)\s*([A-Z]{3})/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
          /flight\s*on\s*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  american: {
    enabled: true,
    domains: ['aa.com', 'americanairlines.com', 'aadvantage.com'],
    program: 'American Airlines AAdvantage',
    valuePerMile: 0.012,
    patterns: {
      subject: [
        /aadvantage/i,
        /miles earned/i,
        /flight activity/i,
        /your american airlines flight/i,
        /aadvantage activity/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*(?:aadvantage\s*)?miles?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*miles/i,
          /\+\s*(\d{1,3}(?:,\d{3})*)\s*miles/i,
          /base miles[:\s]+(\d{1,3}(?:,\d{3})*)/i,
          /you(?:'ve)?\s+earned\s+(\d{1,3}(?:,\d{3})*)\s+aadvantage\s+miles/i
        ],
        flightInfo: [
          /flight\s*(\w+\s*\d+)/i,
          /record locator[:\s]*(\w{6})/i,
          /from\s*([A-Z]{3})\s*to\s*([A-Z]{3})/i
        ],
        date: [
          /departure\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i,
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  alaska: {
    enabled: true,
    domains: ['alaskaair.com', 'mileageplan.com'],
    program: 'Alaska Airlines Mileage Plan',
    valuePerMile: 0.018,
    patterns: {
      subject: [
        /mileage plan/i,
        /miles earned/i,
        /alaska airlines flight/i,
        /flight activity/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*miles?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*miles/i,
          /\+\s*(\d{1,3}(?:,\d{3})*)\s*miles/i
        ],
        flightInfo: [
          /flight\s*(?:number\s*)?(\w+\s*\d+)/i,
          /confirmation\s*code[:\s]*(\w{6})/i
        ],
        date: [
          /flight\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  aircanada: {
    enabled: true,
    domains: ['aircanada.com', 'aeroplan.com'],
    program: 'Air Canada Aeroplan',
    valuePerMile: 0.015,
    patterns: {
      subject: [
        /aeroplan/i,
        /points earned/i,
        /air canada flight/i,
        /flight activity/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*(?:aeroplan\s*)?points?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*points/i,
          /\+\s*(\d{1,3}(?:,\d{3})*)\s*points/i
        ],
        flightInfo: [
          /flight\s*(?:number\s*)?(\w+\s*\d+)/i,
          /booking\s*reference[:\s]*(\w{6})/i
        ],
        date: [
          /departure\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  jetblue: {
    enabled: true,
    domains: ['jetblue.com', 'trueblue.jetblue.com'],
    program: 'JetBlue TrueBlue',
    valuePerMile: 0.013,
    patterns: {
      subject: [
        /trueblue/i,
        /points earned/i,
        /jetblue flight/i,
        /flight activity/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*(?:trueblue\s*)?points?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*points/i,
          /\+\s*(\d{1,3}(?:,\d{3})*)\s*points/i
        ],
        flightInfo: [
          /flight\s*(\w+\s*\d+)/i,
          /confirmation\s*(?:code|number)[:\s]*(\w{6})/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  southwest: {
    enabled: true,
    domains: ['southwest.com', 'rapidrewards.com', 'southwestvacations.com'],
    program: 'Southwest Rapid Rewards',
    valuePerMile: 0.014,
    patterns: {
      subject: [
        /rapid rewards/i,
        /points earned/i,
        /southwest flight/i,
        /flight activity/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*(?:rapid\s*rewards\s*)?points?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*points/i,
          /\+\s*(\d{1,3}(?:,\d{3})*)\s*points/i
        ],
        flightInfo: [
          /flight\s*(?:number\s*)?(\w+\s*\d+)/i,
          /confirmation\s*(?:number)?[:\s]*(\w{6})/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  spirit: {
    enabled: true,
    domains: ['spirit.com'],
    program: 'Spirit Free Spirit',
    valuePerMile: 0.008,
    patterns: {
      subject: [
        /free spirit/i,
        /points earned/i,
        /spirit flight/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*points?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*points/i
        ],
        flightInfo: [
          /flight\s*(\w+\s*\d+)/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  frontier: {
    enabled: true,
    domains: ['flyfrontier.com'],
    program: 'Frontier Miles',
    valuePerMile: 0.008,
    patterns: {
      subject: [
        /frontier miles/i,
        /miles earned/i,
        /frontier flight/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*miles?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*miles/i
        ],
        flightInfo: [
          /flight\s*(\w+\s*\d+)/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  // New airlines
  emirates: {
    enabled: false, // Toggle as needed
    domains: ['emirates.com', 'skywards.com'],
    program: 'Emirates Skywards',
    valuePerMile: 0.01,
    patterns: {
      subject: [
        /skywards/i,
        /miles earned/i,
        /emirates flight/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*skywards\s*miles?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*miles/i
        ],
        flightInfo: [
          /flight\s*(\w+\s*\d+)/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  lufthansa: {
    enabled: false,
    domains: ['lufthansa.com', 'miles-and-more.com'],
    program: 'Lufthansa Miles & More',
    valuePerMile: 0.012,
    patterns: {
      subject: [
        /miles & more/i,
        /miles earned/i,
        /lufthansa flight/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*(?:award\s*)?miles?\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*miles/i
        ],
        flightInfo: [
          /flight\s*(\w+\s*\d+)/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  },
  britishairways: {
    enabled: false,
    domains: ['britishairways.com', 'ba.com'],
    program: 'British Airways Avios',
    valuePerMile: 0.013,
    patterns: {
      subject: [
        /avios/i,
        /points earned/i,
        /british airways flight/i
      ],
      body: {
        milesEarned: [
          /(\d{1,3}(?:,\d{3})*)\s*avios\s*earned/i,
          /earned\s*(\d{1,3}(?:,\d{3})*)\s*avios/i
        ],
        flightInfo: [
          /flight\s*(\w+\s*\d+)/i
        ],
        date: [
          /travel\s*date[:\s]*([A-Za-z]+\s+\d{1,2},?\s+\d{4})/i
        ]
      }
    }
  }
};

// Enhanced main entry point with detailed logging
export async function getRealRewardsFromInbox(auth: OAuth2Client, options?: {
  minConfidenceScore?: number;
  enabledAirlines?: string[];
  debug?: boolean;
}): Promise<{
  rewards: Reward[];
  skippedEmails: SkippedEmail[];
  stats: {
    totalEmails: number;
    processedEmails: number;
    foundRewards: number;
    skippedCount: number;
    averageConfidence: number;
  };
}> {
  const gmail = google.gmail({ version: 'v1', auth });
  const rewards: Reward[] = [];
  const skippedEmails: SkippedEmail[] = [];
  const minConfidence = options?.minConfidenceScore || 70;
  const debugMode = options?.debug !== false; // Default to true

  try {
    console.log('🔍 Starting Gmail scan for airline rewards...');
    console.log(`⚙️  Min confidence score: ${minConfidence}`);

    // Build search query for enabled airlines only
    const enabledAirlines = Object.entries(AIRLINE_CONFIG)
      .filter(([key, config]) => {
        if (options?.enabledAirlines) {
          return options.enabledAirlines.includes(key) && config.enabled;
        }
        return config.enabled;
      });

    const airlineDomains = enabledAirlines
      .flatMap(([_, config]) => config.domains)
      .join(' OR from:');
    
    const searchQuery = `from:(${airlineDomains}) AND (subject:miles OR subject:points OR subject:earned OR subject:activity OR subject:statement)`;
    
    console.log('📧 Search query:', searchQuery);
    console.log(`✈️  Enabled airlines: ${enabledAirlines.map(([key]) => key).join(', ')}`);

    // Get message list
    const response = await gmail.users.messages.list({
      userId: 'me',
      q: searchQuery,
      maxResults: 100
    });

    const messageIds = response.data.messages?.map(msg => msg.id!) || [];
    console.log(`📬 Found ${messageIds.length} potential reward emails`);

    // Process each message
    let processedCount = 0;
    for (const messageId of messageIds) {
      try {
        const message = await gmail.users.messages.get({
          userId: 'me',
          id: messageId,
          format: 'full'
        });

        processedCount++;
        const gmailMessage = message.data as GmailMessage;
        
        // Extract metadata
        const fromEmail = getHeaderValue(gmailMessage, 'from');
        const subject = getHeaderValue(gmailMessage, 'subject');
        const senderDomain = fromEmail.split('@')[1]?.toLowerCase() || '';
        
        // Extract body
        const { textBody, htmlBody } = extractEmailContent(gmailMessage);
        const body = textBody || stripHtml(htmlBody);

        if (debugMode) {
          console.log(`\n📨 Processing email ${processedCount}/${messageIds.length}`);
          console.log(`   Subject: ${subject.substring(0, 60)}...`);
          console.log(`   From: ${fromEmail}`);
          console.log(`   Domain: ${senderDomain}`);
          console.log(`   Body length: ${body.length} chars`);
          console.log(`   Has text body: ${!!textBody}, Has HTML: ${!!htmlBody}`);
        }

        // Try each airline parser with detailed result
        const parseResult = parseAirlineRewardWithDetails(
          fromEmail, 
          subject, 
          body, 
          messageId,
          enabledAirlines
        );
        
        if (parseResult.reward && parseResult.confidenceScore >= minConfidence) {
          const enhancedReward: Reward = {
            ...parseResult.reward,
            sourceParser: parseResult.sourceParser,
            confidenceScore: parseResult.confidenceScore,
            matchedPatterns: parseResult.matchedPatterns,
            debugInfo: {
              senderDomain,
              bodyLength: body.length,
              hasTextBody: !!textBody,
              hasHtmlBody: !!htmlBody
            }
          };
          
          rewards.push(enhancedReward);
          
          console.log(`✅ Found reward with ${parseResult.confidenceScore}% confidence:`);
          console.log(`   Parser: ${parseResult.sourceParser}`);
          console.log(`   Airline: ${parseResult.reward.airline}`);
          console.log(`   Miles: ${parseResult.reward.miles}`);
          console.log(`   Matched patterns: ${parseResult.matchedPatterns.join(', ')}`);
        } else {
          const skipReason = parseResult.skipReason || 
            (parseResult.confidenceScore < minConfidence 
              ? `Low confidence (${parseResult.confidenceScore}%)` 
              : 'No parser matched');
          
          skippedEmails.push({
            emailId: messageId,
            subject,
            from: fromEmail,
            reason: skipReason,
            details: parseResult.details
          });
          
          if (debugMode) {
            console.log(`⚠️  Skipped: ${skipReason}`);
            if (parseResult.details) {
              console.log(`   Details: ${parseResult.details}`);
            }
          }
        }

        // Rate limiting
        await new Promise(resolve => setTimeout(resolve, 50));
      } catch (error) {
        console.error(`❌ Error processing message ${messageId}:`, error);
        skippedEmails.push({
          emailId: messageId,
          subject: 'Unknown',
          from: 'Unknown',
          reason: 'Processing error',
          details: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }

    // Calculate stats
    const averageConfidence = rewards.length > 0
      ? Math.round(rewards.reduce((sum, r) => sum + (r.confidenceScore || 0), 0) / rewards.length)
      : 0;

    console.log(`\n🎉 Scan complete!`);
    console.log(`   📊 Total emails found: ${messageIds.length}`);
    console.log(`   ✅ Rewards found: ${rewards.length}`);
    console.log(`   ⚠️  Emails skipped: ${skippedEmails.length}`);
    console.log(`   🎯 Average confidence: ${averageConfidence}%`);

    return {
      rewards,
      skippedEmails,
      stats: {
        totalEmails: messageIds.length,
        processedEmails: processedCount,
        foundRewards: rewards.length,
        skippedCount: skippedEmails.length,
        averageConfidence
      }
    };

  } catch (error) {
    console.error('❌ Gmail scan error:', error);
    throw new Error('Failed to scan Gmail for rewards');
  }
}

// Enhanced parser with detailed results
function parseAirlineRewardWithDetails(
  fromEmail: string, 
  subject: string, 
  body: string, 
  emailId: string,
  enabledAirlines: Array<[string, any]>
): {
  reward?: Reward;
  sourceParser?: string;
  confidenceScore: number;
  matchedPatterns: string[];
  skipReason?: string;
  details?: string;
} {
  const senderDomain = fromEmail.split('@')[1]?.toLowerCase() || '';
  
  // Try each enabled airline
  for (const [airlineKey, config] of enabledAirlines) {
    // Check if email is from this airline
    const isDomainMatch = config.domains.some((domain: string) => 
      senderDomain.includes(domain)
    );

    if (!isDomainMatch) continue;

    // Calculate confidence score
    let confidenceScore = 0;
    const matchedPatterns: string[] = [];

    // Domain match (30 points)
    if (isDomainMatch) {
      confidenceScore += 30;
      matchedPatterns.push('domain');
    }

    // Subject match (20 points)
    const subjectMatch = config.patterns.subject.some((pattern: RegExp) => 
      pattern.test(subject)
    );
    if (subjectMatch) {
      confidenceScore += 20;
      matchedPatterns.push('subject');
    }

    // Try to extract miles (40 points)
    let miles = 0;
    let milesPattern = '';
    for (const pattern of config.patterns.body.milesEarned) {
      const match = body.match(pattern);
      if (match && match[1]) {
        miles = parseInt(match[1].replace(/,/g, ''));
        if (!isNaN(miles) && miles > 0) {
          confidenceScore += 40;
          matchedPatterns.push('miles');
          milesPattern = pattern.source;
          break;
        }
      }
    }

    // If no miles found with patterns, try fallback heuristic
    if (miles === 0 && (subjectMatch || body.toLowerCase().includes(airlineKey))) {
      const fallbackMiles = extractNumberNearKeyword(body, ['miles', 'points', 'earned']);
      if (fallbackMiles > 0) {
        miles = fallbackMiles;
        confidenceScore += 25; // Lower confidence for heuristic match
        matchedPatterns.push('miles-heuristic');
      }
    }

    // Skip if no miles found
    if (miles === 0) {
      return {
        confidenceScore,
        matchedPatterns,
        skipReason: 'No miles pattern match',
        details: `Tried ${config.patterns.body.milesEarned.length} patterns for ${config.program}`
      };
    }

    // Extract flight date (10 points)
    let flightDate: string | undefined;
    for (const pattern of config.patterns.body.date) {
      const match = body.match(pattern);
      if (match && match[1]) {
        flightDate = match[1];
        confidenceScore += 10;
        matchedPatterns.push('date');
        break;
      }
    }

    // Create reward
    const reward: Reward = {
      airline: config.program.split(' ')[0], // Extract airline name
      miles,
      flightDate,
      emailId,
      subject
    };

    return {
      reward,
      sourceParser: airlineKey,
      confidenceScore,
      matchedPatterns
    };
  }

  // No airline matched
  return {
    confidenceScore: 0,
    matchedPatterns: [],
    skipReason: 'No airline parser matched',
    details: `Domain: ${senderDomain} did not match any enabled airline`
  };
}

// Fallback heuristic to extract numbers near keywords
function extractNumberNearKeyword(text: string, keywords: string[]): number {
  const lowercaseText = text.toLowerCase();
  
  for (const keyword of keywords) {
    // Look for patterns like "1,234 miles" or "earned 1234 points"
    const patterns = [
      new RegExp(`(\\d{1,3}(?:,\\d{3})*)\\s*${keyword}`, 'i'),
      new RegExp(`${keyword}\\s*[:=]?\\s*(\\d{1,3}(?:,\\d{3})*)`, 'i'),
      new RegExp(`(\\d{1,3}(?:,\\d{3})*)\\s+${keyword}\\s+earned`, 'i')
    ];
    
    for (const pattern of patterns) {
      const match = text.match(pattern);
      if (match && match[1]) {
        const num = parseInt(match[1].replace(/,/g, ''));
        if (!isNaN(num) && num > 0 && num < 1000000) { // Sanity check
          return num;
        }
      }
    }
  }
  
  return 0;
}

// Individual airline parsers (simplified versions for backward compatibility)
function parseDeltaEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@delta.com', 
    subject, 
    body, 
    emailId,
    [['delta', AIRLINE_CONFIG.delta]]
  );
  return result.reward || null;
}

function parseUnitedEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@united.com', 
    subject, 
    body, 
    emailId,
    [['united', AIRLINE_CONFIG.united]]
  );
  return result.reward || null;
}

function parseAmericanEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@aa.com', 
    subject, 
    body, 
    emailId,
    [['american', AIRLINE_CONFIG.american]]
  );
  return result.reward || null;
}

function parseAlaskaEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@alaskaair.com', 
    subject, 
    body, 
    emailId,
    [['alaska', AIRLINE_CONFIG.alaska]]
  );
  return result.reward || null;
}

function parseAirCanadaEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@aircanada.com', 
    subject, 
    body, 
    emailId,
    [['aircanada', AIRLINE_CONFIG.aircanada]]
  );
  return result.reward || null;
}

function parseSouthwestEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@southwest.com', 
    subject, 
    body, 
    emailId,
    [['southwest', AIRLINE_CONFIG.southwest]]
  );
  return result.reward || null;
}

function parseJetBlueEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@jetblue.com', 
    subject, 
    body, 
    emailId,
    [['jetblue', AIRLINE_CONFIG.jetblue]]
  );
  return result.reward || null;
}

function parseSpiritEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@spirit.com', 
    subject, 
    body, 
    emailId,
    [['spirit', AIRLINE_CONFIG.spirit]]
  );
  return result.reward || null;
}

function parseFrontierEmail(subject: string, body: string, emailId: string): Reward | null {
  const result = parseAirlineRewardWithDetails(
    'noreply@flyfrontier.com', 
    subject, 
    body, 
    emailId,
    [['frontier', AIRLINE_CONFIG.frontier]]
  );
  return result.reward || null;
}

// Helper functions
function extractEmailContent(message: GmailMessage): {
  textBody: string;
  htmlBody: string;
} {
  let textBody = '';
  let htmlBody = '';

  const extractFromPart = (part: any): void => {
    if (part.mimeType === 'text/plain' && part.body?.data) {
      textBody += Buffer.from(part.body.data, 'base64').toString('utf-8');
    } else if (part.mimeType === 'text/html' && part.body?.data) {
      htmlBody += Buffer.from(part.body.data, 'base64').toString('utf-8');
    }
    
    if (part.parts) {
      part.parts.forEach(extractFromPart);
    }
  };

  // Check payload body first
  if (message.payload.body?.data) {
    const mimeType = message.payload.headers.find(h => 
      h.name.toLowerCase() === 'content-type'
    )?.value || '';
    
    if (mimeType.includes('text/plain')) {
      textBody = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    } else if (mimeType.includes('text/html')) {
      htmlBody = Buffer.from(message.payload.body.data, 'base64').toString('utf-8');
    }
  }

  // Extract from parts
  if (message.payload.parts) {
    message.payload.parts.forEach(extractFromPart);
  }

  return { textBody, htmlBody };
}

function stripHtml(html: string): string {
  return html
    .replace(/<style[^>]*>.*?<\/style>/gs, '')
    .replace(/<script[^>]*>.*?<\/script>/gs, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function getHeaderValue(message: GmailMessage, headerName: string): string {
  const header = message.payload.headers.find(h => 
    h.name.toLowerCase() === headerName.toLowerCase()
  );
  return header?.value || '';
}

// Legacy functions (keeping for compatibility)
export class GmailService {
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
    debugLog?: any[];
  }> {
    oauth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken
    });

    const result = await getRealRewardsFromInbox(oauth2Client);
    
    // Convert to legacy format
    const parsedRewards: ParsedReward[] = result.rewards.map(reward => ({
      program: `${reward.airline} Rewards`,
      type: 'Miles',
      balance: reward.miles,
      balanceText: reward.miles.toLocaleString(),
      emailId: reward.emailId,
      emailDate: new Date(),
      fromEmail: reward.airline.toLowerCase() + '@email.com',
      estimatedValue: Math.round(reward.miles * 0.012)
    }));

    const totalValue = parsedRewards.reduce((sum, r) => sum + r.estimatedValue, 0);

    return {
      rewards: parsedRewards,
      emailsProcessed: result.stats.processedEmails,
      totalValue,
      debugLog: result.skippedEmails
    };
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