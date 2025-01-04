import { EmailContent, AuctionData } from './types';

export const getEmailContent = (
  type: 'outbid' | 'ending_soon' | 'auction_won',
  auction: AuctionData,
  newBidAmount?: number,
  auctionUrl?: string
): EmailContent => {
  switch (type) {
    case 'outbid':
      return {
        subject: "You've Been Outbid!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h1 style="color: #1a1a1a;">New Bid Alert</h1>
            <p>Someone has placed a higher bid on "${auction.title}".</p>
            <p style="font-size: 18px; margin: 20px 0;">
              New Highest Bid: <strong>€${newBidAmount?.toLocaleString()}</strong>
            </p>
            <p>Don't miss out - place a new bid now to stay in the running!</p>
            ${auctionUrl ? `
              <div style="margin: 30px 0;">
                <a href="${auctionUrl}" 
                   style="background-color: #0066cc; color: white; padding: 12px 24px; 
                          text-decoration: none; border-radius: 4px;">
                  View Auction
                </a>
              </div>
            ` : ''}
          </div>
        `
      };
    case 'ending_soon':
      return {
        subject: "Auction Ending Soon!",
        html: `
          <h1>Time is running out!</h1>
          <p>The auction for "${auction.title}" is ending soon.</p>
          <p>Current price: €${auction.current_price?.toLocaleString()}</p>
          <p>Don't miss your chance to win!</p>
        `
      };
    case 'auction_won':
      return {
        subject: "Congratulations! You've Won the Auction!",
        html: `
          <h1>You're the winner!</h1>
          <p>Congratulations! You've won the auction for "${auction.title}".</p>
          <p>Winning bid: €${auction.current_price?.toLocaleString()}</p>
          <p>Please complete your payment to claim your item.</p>
        `
      };
  }
};