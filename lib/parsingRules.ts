export interface ParsingRule {
  domain: string;
  program: string;
  type: 'Miles' | 'Hotel Points' | 'Credit Card Points' | 'Travel Credit' | 'Cash Back';
  patterns: {
    balance: RegExp[];
    context?: RegExp[];
  };
  multiplier?: number; // For converting cents to dollars, etc.
}

export const PARSING_RULES: ParsingRule[] = [
  // Airlines
  {
    domain: 'delta.com',
    program: 'Delta SkyMiles',
    type: 'Miles',
    patterns: {
      balance: [
        /SkyMiles balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) SkyMiles/i,
        /Current balance[:\s]*([\d,]+) miles/i
      ]
    }
  },
  {
    domain: 'united.com',
    program: 'United MileagePlus',
    type: 'Miles',
    patterns: {
      balance: [
        /MileagePlus balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) miles/i,
        /Current miles[:\s]*([\d,]+)/i
      ]
    }
  },
  {
    domain: 'aa.com',
    program: 'American Airlines AAdvantage',
    type: 'Miles',
    patterns: {
      balance: [
        /AAdvantage balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) miles/i,
        /Miles balance[:\s]*([\d,]+)/i
      ]
    }
  },
  {
    domain: 'southwest.com',
    program: 'Southwest Rapid Rewards',
    type: 'Credit Card Points',
    patterns: {
      balance: [
        /Rapid Rewards balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  },
  {
    domain: 'jetblue.com',
    program: 'JetBlue TrueBlue',
    type: 'Credit Card Points',
    patterns: {
      balance: [
        /TrueBlue balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  },

  // Hotels
  {
    domain: 'marriott.com',
    program: 'Marriott Bonvoy',
    type: 'Hotel Points',
    patterns: {
      balance: [
        /Bonvoy balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i,
        /Current point balance[:\s]*([\d,]+)/i
      ]
    }
  },
  {
    domain: 'hilton.com',
    program: 'Hilton Honors',
    type: 'Hotel Points',
    patterns: {
      balance: [
        /Honors balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  },
  {
    domain: 'hyatt.com',
    program: 'World of Hyatt',
    type: 'Hotel Points',
    patterns: {
      balance: [
        /World of Hyatt balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  },
  {
    domain: 'ihg.com',
    program: 'IHG One Rewards',
    type: 'Hotel Points',
    patterns: {
      balance: [
        /IHG.*?balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  },

  // Credit Cards - Chase
  {
    domain: 'chase.com',
    program: 'Chase Ultimate Rewards',
    type: 'Credit Card Points',
    patterns: {
      balance: [
        /Ultimate Rewards balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i,
        /UR points[:\s]*([\d,]+)/i
      ]
    }
  },

  // Credit Cards - American Express
  {
    domain: 'americanexpress.com',
    program: 'American Express Membership Rewards',
    type: 'Credit Card Points',
    patterns: {
      balance: [
        /Membership Rewards balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i,
        /MR points[:\s]*([\d,]+)/i
      ]
    }
  },

  // Credit Cards - Citi
  {
    domain: 'citi.com',
    program: 'Citi ThankYou Points',
    type: 'Credit Card Points',
    patterns: {
      balance: [
        /ThankYou.*?balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  },

  // Credit Cards - Capital One
  {
    domain: 'capitalone.com',
    program: 'Capital One Venture Miles',
    type: 'Miles',
    patterns: {
      balance: [
        /Venture.*?balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) miles/i,
        /Miles balance[:\s]*([\d,]+)/i
      ]
    }
  },

  // Credit Cards - Discover
  {
    domain: 'discover.com',
    program: 'Discover Cashback',
    type: 'Cash Back',
    patterns: {
      balance: [
        /Cashback.*?balance[:\s]*\$?([\d,]+\.?\d*)/i,
        /You have \$?([\d,]+\.?\d*) cashback/i,
        /Cash back balance[:\s]*\$?([\d,]+\.?\d*)/i
      ]
    },
    multiplier: 100 // Convert dollars to cents for storage
  },

  // More Airlines
  {
    domain: 'alaskaair.com',
    program: 'Alaska Airlines Mileage Plan',
    type: 'Miles',
    patterns: {
      balance: [
        /Mileage Plan balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) miles/i,
        /Miles balance[:\s]*([\d,]+)/i
      ]
    }
  },

  // More Hotels
  {
    domain: 'wyndhamhotels.com',
    program: 'Wyndham Rewards',
    type: 'Hotel Points',
    patterns: {
      balance: [
        /Wyndham.*?balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  },

  {
    domain: 'choicehotels.com',
    program: 'Choice Privileges',
    type: 'Hotel Points',
    patterns: {
      balance: [
        /Choice.*?balance[:\s]*([\d,]+)/i,
        /You have ([\d,]+) points/i,
        /Points balance[:\s]*([\d,]+)/i
      ]
    }
  }
];

export function extractRewardsFromEmail(emailBody: string, fromEmail: string): Array<{
  program: string;
  type: string;
  balance: number;
  balanceText: string;
}> {
  const results: Array<{
    program: string;
    type: string;
    balance: number;
    balanceText: string;
  }> = [];

  // Find matching rules based on sender domain
  const domain = fromEmail.split('@')[1]?.toLowerCase();
  if (!domain) return results;

  const matchingRules = PARSING_RULES.filter(rule => 
    domain.includes(rule.domain) || rule.domain.includes(domain)
  );

  for (const rule of matchingRules) {
    for (const pattern of rule.patterns.balance) {
      const match = emailBody.match(pattern);
      if (match && match[1]) {
        const balanceText = match[1];
        const balance = parseInt(balanceText.replace(/,/g, ''));
        
        if (!isNaN(balance) && balance > 0) {
          // Apply multiplier if needed (e.g., for cash back in dollars)
          const finalBalance = rule.multiplier ? balance * rule.multiplier : balance;
          
          results.push({
            program: rule.program,
            type: rule.type,
            balance: finalBalance,
            balanceText: balanceText
          });
          break; // Only take first match per rule
        }
      }
    }
  }

  return results;
}

export function getSearchQueries(): string[] {
  const domains = PARSING_RULES.map(rule => rule.domain).join(' OR ');
  
  return [
    `from:(${domains}) (points OR miles OR rewards OR balance OR statement)`,
    `from:(${domains}) subject:(points OR miles OR rewards OR statement OR balance)`,
    `(SkyMiles OR MileagePlus OR AAdvantage OR Bonvoy OR Honors OR "Ultimate Rewards")`,
    `("points balance" OR "miles balance" OR "rewards balance" OR "current balance")`
  ];
}